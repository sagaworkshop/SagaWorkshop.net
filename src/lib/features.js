import FEATURES from '../data/features.json';
import {CLASSES} from './classes';
import {FEATURE_TREES} from './feature-trees';
import {Feature} from './feature';
import {FeatureCategory} from './feature-category';

export class Features {
    constructor(char) {
        this.char = char;
        this.all = [];
        this.features = [];
        this.forcePowers = [];
        this.starshipManeuvers = [];
        this.unspent = [];
        this.unspentFeatures = [];
        this.unspentForcePowers = [];
        this.unspentStarshipManeuvers = [];

        // Add species features
        let primitive = false;
        for (let featureDesc of this.char.species.features || []) {
            if (featureDesc.id === 'primitive') primitive = true;
            if (FEATURES.hasOwnProperty(featureDesc.id)) {
                this.all.push(new Feature(this.char, featureDesc));
            }
        }
        // Add starting features
        if (this.char.level > 0) {
            let treeId = CLASSES[this.char.levels[0].classId].trees.starting[0];
            for (let featureDesc of FEATURE_TREES[treeId].featureDescriptors) {
                if (primitive && featureDesc.id === 'weapon-proficiency') {
                    if (['pistols', 'rifles'].indexOf(featureDesc.spec) >= 0) continue;
                }
                featureDesc.category = 'starting';
                this.all.push(new Feature(this.char, featureDesc));
            }
        }

        let classLevels = {};
        for (let i = 0; i < this.char.levels.length; ++i) {
            let level = this.char.levels[i];
            // Add automatic class features
            let classData = CLASSES[level.classId];
            if (!classLevels.hasOwnProperty(level.classId)) classLevels[level.classId] = 1;
            let classLevel = classLevels[level.classId]++;
            for (let featureDesc of classData.features[classLevel - 1] || []) {
                featureDesc.category = 'class';
                if (FEATURES.hasOwnProperty(featureDesc.id)) {
                    this.all.push(new Feature(this.char, featureDesc));
                }
            }
            // Add chosen features
            for (let featureDesc of level.features) {
                if (FEATURES.hasOwnProperty(featureDesc.id)) {
                    let feature = new Feature(this.char, featureDesc);
                    feature.level = i + 1;
                    this.all.push(feature);
                }
            }
        }
        // Add build lightsaber feature if applicable
        if (this.level >= 7 && this.has({id: 'force-sensitivity'}, false)
            && this.has({id: 'weapon-proficiency', spec: 'lightsabers'}, false)) {
            this.all.push(new Feature(char, {id: 'build-lightsaber'}));
        }

        this.totalForcePowers = 0;
        this.totalStarshipManeuvers = 0;
        for (let feature of this.all) {
            if (feature.type === 'force-power') {
                this.forcePowers.push(feature);
            } else if (feature.type === 'starship-maneuver') {
                this.starshipManeuvers.push(feature);
            } else {
                this.features.push(feature);
            }
            if (feature.id === 'force-training') {
                this.totalForcePowers += Math.max(1, 1 + this.char.abilities.wis.modifier);
            } else if (feature.id === 'starship-tactics') {
                this.totalStarshipManeuvers += Math.max(1, 1 + this.char.abilities.wis.modifier);
            }
        }
        this.availableForcePowers = this.totalForcePowers - this.forcePowers.length;
        this.availableStarshipManeuvers = this.totalStarshipManeuvers - this.starshipManeuvers.length;

        this.buildUnspent();
    }

    has(featureDesc, checkPrerequisites = true) {
        return !!this.all.find(feature => feature.id === featureDesc.id
            && (featureDesc.spec ? feature.spec === featureDesc.spec : (!feature.spec || featureDesc.anySpec))
            && (checkPrerequisites ? feature.requirementsMet : true));
    }

    count(featureDesc, checkPrerequisites = true) {
        let count = 0;
        for (let feature of this.all) {
            if (feature.id === featureDesc.id
                && (featureDesc.spec ? feature.spec === featureDesc.spec : (!feature.spec || featureDesc.anySpec))) {
                if (!checkPrerequisites || feature.requirementsMet) {
                    count++;
                }
            }
        }
        return count;
    }

    learn(featureDesc) {
        if (!featureDesc.spec && FEATURES[featureDesc.id].specType) {
            throw new Error('Missing specialization');
        }
        let features = this.char.lastLevel.features || [];
        features.push(featureDesc);
        this.char.ref.child('levels').child(this.char.level - 1).update({features: features});
    }

    get canLevelUp() {
        return this.unspent.length === 0;
    }

    resetCurrentLevelForcePowers(onlyIfNeeded = true) {
        if (this.char.level < 1 || this.char.data.trueLevel === this.char.level) {
            return;
        }
        if (!onlyIfNeeded || this.availableForcePowers < 0) {
            let features = this.char.lastLevel.features.filter(feature => feature.categoryId !== 'force-power');
            this.char.lastLevelRef.update({features: features});
        }
    }

    resetCurrentLevelStarshipManeuvers(onlyIfNeeded = true) {
        if (this.char.level < 1 || this.char.data.trueLevel === this.char.level) {
            return;
        }
        if (!onlyIfNeeded || this.availableStarshipManeuvers < 0) {
            let features = this.char.lastLevel.features.filter(feature => feature.categoryId !== 'starship-maneuver');
            this.char.lastLevelRef.update({features: features});
        }
    }

    buildUnspent() {
        if (this.char.levelledUp || this.char.level <= 0) {
            return;
        }
        let level = this.char.lastLevel;
        // Add unspent heroic feats
        if ((this.char.level % 3 === 0 || this.char.level === 1) && !level.hasCategory('heroic')) {
            this.unspent.push(new FeatureCategory('heroic', 'feat'));
        }
        // Add unspent species bonus feat
        if (this.char.species.bonusFeat && !this.char.levels[0].hasCategory('species')) {
            this.unspent.push(new FeatureCategory('species', 'species bonus feat'));
        }
        // Add unspent starting feats
        let classLevels = this.char.getLevelsByClass();
        let classLevel = classLevels[level.classId] || 0;
        if (this.char.level > 1 && classLevel === 1 && !level.hasCategory('starting')) {
            // Check if all starting feats for this class are already learned
            let allLearned = true;
            for (let treeId of CLASSES[level.classId].trees.starting) {
                for (let featureDesc of FEATURE_TREES[treeId].featureDescriptors) {
                    if (!this.has(featureDesc, false)) {
                        allLearned = false;
                        break;
                    }
                }
            }
            if (!allLearned) {
                this.unspent.push(new FeatureCategory('starting', 'starting feat', level.classId));
            }
        }
        // Add unspent class features
        for (let category of CLASSES[level.classId].choices[classLevel - 1]) {
            if (!level.hasCategory(category.id)) {
                this.unspent.push(new FeatureCategory(category.id, category.name, category.classId));
            }
        }

        this.unspentFeatures = this.unspent.filter(category => {
            return category.id !== 'force-power' && category.id !== 'starship-maneuver';
        });

        for (let i = 0; i < this.availableForcePowers; ++i) {
            let category = new FeatureCategory('force-power', 'Force power');
            this.unspent.push(category);
            this.unspentForcePowers.push(category);
        }
        for (let i = 0; i < this.availableStarshipManeuvers; ++i) {
            let category = new FeatureCategory('starship-maneuver', 'starship maneuver');
            this.unspent.push(category);
            this.unspentStarshipManeuvers.push(category);
        }
    }
}
