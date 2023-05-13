import FEATURES_DATA from '../data/features.json';
import SKILLS_DATA from '../data/skills.json';
import TREE_DATA from '../data/feature-trees.json';
import {WEAPON_GROUPS, WEAPONS} from '../lib/weapons';
import {Feature, FeatureDescriptor} from './feature';
import {staticPath} from './util';
import {CLASSES} from "./classes";

class FeaturePick {
    constructor() {
        this.feature = null;
        this.specs = {};
    }

    get hasSpecs() {
        return this.feature.data && this.feature.data.specType;
    }

    get canLearn() {
        if (this.hasSpecs) {
            return Object.keys(this.specs).length > 0;
        } else {
            return this.feature.canLearn;
        }
    }

    get requirementsMet() {
        if (this.hasSpecs) {
            return Object.keys(this.specs).length > 0;
        } else {
            return this.feature.requirementsMet;
        }
    }
}

export class FeatureTree {
    constructor(id, data) {
        this.id = id;
        this.force = !!data.force;
        this.name = data.name;
        if (this.force) this.name += ' (Force talent tree)';
        this.description = data.description || [];
        this.icon = staticPath('features/' + data.icon + '.jpg');
        if (data.type) {
            this.featureDescriptors = [];
            for (let featureId in FEATURES_DATA) {
                if (FEATURES_DATA[featureId].type === data.type) {
                    this.featureDescriptors.push(new FeatureDescriptor(featureId));
                }
            }
        } else {
            this.featureDescriptors = data.features || [];
        }
    }
}

class FeaturePickTree {
    constructor(char, category, tree) {
        this.char = char;
        this.category = category;
        this.tree = tree;
        this.picks = {};

        for (let featureDesc of this.tree.featureDescriptors) {
            if (!FEATURES_DATA.hasOwnProperty(featureDesc.id)) continue;
            if (!this.picks.hasOwnProperty(featureDesc.id)) {
                this.picks[featureDesc.id] = new FeaturePick();
                this.picks[featureDesc.id].feature = new Feature(char,
                    new FeatureDescriptor(featureDesc.id, undefined, category.id));
            }
            let pick = this.picks[featureDesc.id];
            if (featureDesc.spec && !pick.specs.hasOwnProperty(featureDesc.spec)) {
                // If this feature tree specifies a spec, add it
                let f = new Feature(char, new FeatureDescriptor(featureDesc.id, featureDesc.spec, category.id));
                if (f.canLearn) pick.specs[featureDesc.spec] = f;
            } else {
                // Otherwise, find out all possible specs and add the ones that we are able to learn
                let featureData = FEATURES_DATA[featureDesc.id];
                if (featureData.specType === 'weapon-group') {
                    for (let weaponGroupId in WEAPON_GROUPS) {
                        if (featureData.allowedSpecs && featureData.allowedSpecs.indexOf(weaponGroupId) < 0) {
                            continue;
                        }
                        let f = new Feature(char, new FeatureDescriptor(featureDesc.id, weaponGroupId, category.id));
                        if (f.canLearn) pick.specs[weaponGroupId] = f;
                    }
                } else if (featureData.specType === 'skill') {
                    for (let skillId in SKILLS_DATA) {
                        let f = new Feature(char, new FeatureDescriptor(featureDesc.id, skillId, category.id));
                        if (f.canLearn) pick.specs[skillId] = f;
                    }
                } else if (featureData.specType === 'weapon') {
                    for (let weaponId in WEAPONS) {
                        let f = new Feature(char, new FeatureDescriptor(featureDesc.id, weaponId, category.id));
                        if (f.canLearn) pick.specs[weaponId] = f;
                    }
                } else if (featureData.specType === 'force-power') {
                    for (let feature of char.features.forcePowers) {
                        let f = new Feature(char, new FeatureDescriptor(featureDesc.id, feature.id, category.id));
                        if (f.canLearn) pick.specs[feature.id] = f;
                    }
                } else if (featureData.specType === 'starship-maneuver') {
                    for (let feature of char.features.starshipManeuvers) {
                        let f = new Feature(char, new FeatureDescriptor(featureDesc.id, feature.id, category.id));
                        if (f.canLearn) pick.specs[feature.id] = f;
                    }
                }
            }
        }
    }
}

export function getFeaturePicksByTree(char, category) {
    if (!category.id) return {};
    let trees = {};
    if (['bonus', 'starting', 'talent'].indexOf(category.id) >= 0) {
        for (let treeId of CLASSES[category.classId].trees[category.id]) {
            if (FEATURE_TREES.hasOwnProperty(treeId)) {
                trees[treeId] = new FeaturePickTree(char, category, FEATURE_TREES[treeId]);
            }
        }
        if (category.id === 'talent') {
            for (let treeId in FEATURE_TREES) {
                let tree = FEATURE_TREES[treeId];
                if (tree.force && char.features.has({id: 'force-sensitivity'})) {
                    trees[treeId] = new FeaturePickTree(char, category, tree);
                }
            }
        }
    } else {
        let treeId = CATEGORY_TO_TREE[category.id];
        trees[category.id] = new FeaturePickTree(char, category, FEATURE_TREES[treeId]);
    }
    return trees;
}

const CATEGORY_TO_TREE = {
    'force-power': 'force-power',
    'force-technique': 'force-technique',
    'force-secret': 'force-secret',
    'heroic': 'feat',
    'species': 'feat',
    'starship-maneuver': 'starship-maneuvers',
};

export const FEATURE_TREES = {};
for (let treeId in TREE_DATA) {
    FEATURE_TREES[treeId] = new FeatureTree(treeId, TREE_DATA[treeId]);
}
