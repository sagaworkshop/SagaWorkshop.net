import CLASS_DATA from '../data/classes.json';
import FEATURE_DATA from '../data/features.json';
import SKILL_DATA from '../data/skills.json';
import {DEFENSES} from './defenses';
import {FEATURE_TREES} from './feature-trees';
import {Feature} from './feature';
import {staticPath} from './util';

export class Class {
    constructor(id, data) {
        Object.assign(this, data);
        this.id = id;
        this.icon = staticPath('classes/' + data.icon);
        if (!this.choices) this.choices = [];
        if (!this.features) this.features = [];
        if (!this.trees.starting) this.trees.starting = [];
    }

    requirementsMet(char) {
        let reqs = this.requirements;
        if (!reqs) {
            return true;
        }
        // Check for level
        if (char.data.trueLevel < reqs.level) {
            return false;
        }
        // Check for base attack bonus
        if (char.baseAttackBonus < reqs.baseAttackBonus) {
            return false;
        }
        // Check for required trained skills
        for (let skillId of reqs.trainedSkills || []) {
            if (!char.skills.hasTraining(skillId)) return false;
        }
        // Check for required features
        for (let requiredFeature of reqs.features || []) {
            if (!char.features.has(requiredFeature)) return false;
        }
        // Check for required talent trees
        if (reqs.talents) {
            let count = 0;
            let hasForceSensitivity = char.features.has({id: 'force-sensitivity'});
            let requiredTrees = [];
            for (let treeId of reqs.talents.trees || []) {
                if (!FEATURE_TREES.hasOwnProperty(treeId)) continue;
                requiredTrees.push(FEATURE_TREES[treeId]);
            }
            if (hasForceSensitivity && reqs.talents.force) {
                for (let treeId in FEATURE_TREES) {
                    let tree = FEATURE_TREES[treeId];
                    if (tree.force) requiredTrees.push(FEATURE_TREES[treeId]);
                }
            }
            for (let feature of char.features.features) {
                if (feature.type !== 'talent') continue;
                for (let tree of requiredTrees) {
                    for (let featureDesc of tree.featureDescriptors) {
                        if (featureDesc.id === feature.id) count++;
                    }
                }
            }
            if (count < reqs.talents.count) return false;
        }
        // Check for required number of Force techniques
        if (reqs.forceTechniques) {
            let count = 0;
            for (let feature of char.features.features) {
                if (feature.type === 'force-technique') count++;
            }
            if (count < reqs.forceTechniques) return false;
        }
        // Check for maximum number of levels allowed in a class
        if (this.maxLevels) {
            let currentClassLevel = char.getLevelsByClass()[this.id];
            if (currentClassLevel >= this.maxLevels) return false;
        }
        // TODO: dark side score
        return true;
    }

    get classFeatures() {
        let features = [];
        for (let level of this.features) {
            for (let featureDesc of level) {
                if (!featureDesc.id || !FEATURE_DATA.hasOwnProperty(featureDesc.id)) continue;
                features.push(new Feature(this.char, featureDesc));
            }
        }
        return features;
    }

    get classSkillsString() {
        let skills = [];
        let knowledgeAdded = false;
        for (let skillId of this.classSkills) {
            if (skillId.substr(0, 9) === 'knowledge' && this.id !== 'soldier') {
                if (knowledgeAdded) continue;
                skills.push('Knowledge (all skills, taken individually)');
                knowledgeAdded = true;
            } else {
                skills.push(SKILL_DATA[skillId].name);
            }
        }
        return skills.join(', ');
    }

    get defenseBonusesString() {
        let bonuses = [];
        if (this.defenseBonuses[0]) bonuses.push('+' + this.defenseBonuses[0] + ' Reflex');
        if (this.defenseBonuses[1]) bonuses.push('+' + this.defenseBonuses[1] + ' Fortitude');
        if (this.defenseBonuses[2]) bonuses.push('+' + this.defenseBonuses[2] + ' Will');
        return bonuses.join(', ');
    }

    get requirementsStrings() {
        let reqs = this.requirements;
        if (!reqs) return [];
        let parts = [];
        if (reqs.talents) {
            let treeNames = [];
            for (let treeId of reqs.talents.trees || []) {
                if (FEATURE_TREES.hasOwnProperty(treeId)) {
                    treeNames.push(FEATURE_TREES[treeId].name);
                }
            }
            if (reqs.talents.force) treeNames.push('Force talent trees');
            if (treeNames.length > 0) {
                parts.push({
                    label: 'Talents',
                    value: 'At least ' + reqs.talents.count + ' from the following trees: ' + treeNames.join(', ')
                });
            }
        }
        if (reqs.level) {
            parts.push({label: 'Minimum level', value: reqs.level});
        }
        if (reqs.baseAttackBonus) {
            parts.push({label: 'Base attack bonus', value: '+' + reqs.baseAttackBonus});
        }
        if (reqs.trainedSkills) {
            let skillNames = reqs.trainedSkills.map(skillId => SKILL_DATA[skillId].name);
            parts.push({label: 'Trained skills', value: skillNames.join(', ')});
        }
        if (reqs.forceTechniques) {
            parts.push({label: 'Force techniques', value: reqs.forceTechniques});
        }
        return parts;
    }

    get requiredFeatures() {
        if (!this.requirements) return [];
        let features = [];
        for (let featureDesc of this.requirements.features || []) {
            features.push(new Feature(this.char, featureDesc));
        }
        return features;
    }

    get startingFeatures() {
        let features = [];
        if (this.trees && this.trees.starting) {
            for (let treeId of this.trees.starting) {
                if (FEATURE_TREES.hasOwnProperty(treeId)) {
                    for (let featureDesc of FEATURE_TREES[treeId].featureDescriptors) {
                        features.push(new Feature(this.char, featureDesc));
                    }
                }
            }
        }
        return features;
    }

    get featureTrees() {
        let trees = [];
        if (this.trees && this.trees.talent) {
            for (let treeId of this.trees.talent) {
                if (FEATURE_TREES.hasOwnProperty(treeId)) {
                    trees.push(FEATURE_TREES[treeId]);
                }
            }
        }
        return trees;
    }

}

export const CLASSES = {};
for (let classId in CLASS_DATA) {
    CLASSES[classId] = new Class(classId, CLASS_DATA[classId]);
}
