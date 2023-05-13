import FEATURES from '../data/features.json';
import SIZES from '../data/sizes.json';
import SKILLS from '../data/skills.json';
import {WEAPON_GROUPS, WEAPONS} from './weapons';
import {staticPath} from './util';

export class FeatureDescriptor {
    constructor(id, spec, categoryId) {
        this.id = id;
        this.spec = spec || null;
        this.categoryId = categoryId || null;
    }
}

export class Feature extends FeatureDescriptor {
    constructor(char, descriptor) {
        super(descriptor.id, descriptor.spec, descriptor.categoryId);
        this.char = char;
        this.data = FEATURES[this.id];
        this.level = null;
        this.name = this.data.name;
        this.icon = staticPath('features/' + this.id + '.jpg');

        if (this.type === 'force-power') {
            this.data.multiple = true;
            if (this.data.darkSide) this.name += ' [dark side]';
            if (this.data.lightSide) this.name += ' [light side]';
            if (this.data.lightsaberForm) this.name += ' [lightsaber form]';
            if (this.data.mindAffecting) this.name += ' [mind-affecting]';
            if (this.data.telekinetic) this.name += ' [telekinetic]';
        }

        if (this.type === 'starship-maneuver') {
            this.data.multiple = true;
            if (this.data.attackPattern) this.name += ' [attack pattern]';
            if (this.data.dogfight) this.name += ' [dogfight]';
            if (this.data.force) this.name + ' [Force]';
            if (this.data.gunner) this.name += ' [gunner]';
        }

        if (this.spec) {
            if (this.data.specType === 'skill') {
                this.specName = SKILLS[this.spec].name;
            } else if (this.data.specType === 'weapon-group') {
                this.specName = WEAPON_GROUPS[this.spec].name;
            } else if (this.data.specType === 'weapon') {
                this.specName = WEAPONS[this.spec].name;
            } else if (this.data.specType === 'force-power') {
                this.specName = FEATURES[this.spec].name;
            }
            this.name += ' (' + this.specName + ')';
            if (this.data.matchWeaponIcon) {
                this.icon = staticPath('weapons/' + this.spec + '.jpg');
            } else if (this.data.customSpecIcon) {
                this.icon = staticPath('features/' + this.id + '-' + this.spec + '.jpg');
            }
        }
    }

    get canUnlearn() {
        return !this.char.levelledUp && this.char.level > this.char.trueLevel && this.level === this.char.level;
    }

    unlearn() {
        if (this.grants.classSkills) {
            this.char.skills.resetCurrentLevelSkills(false);
        }
        let features = this.char.lastLevel.features;
        let index = null;
        for (let i = 0; i < features.length; ++i) {
            let feature = features[i];
            if (feature.id === this.id && (feature.spec ? feature.spec === this.spec : true)
                && (feature.categoryId ? feature.categoryId === this.categoryId : true)) {
                index = i;
                break;
            }
        }
        if (index !== null) {
            features.splice(index, 1);
            this.char.ref.child('levels').child(this.char.level - 1).update({features: features});
        } else {
            throw new Error('Attempted to unlearn a feature not part of the current level');
        }
    }

    get canLearn() {
        // Check if multiples are allowed
        if (!this.data.multiple && this.char.features.has(this, false)) {
            return false;
        }
        // Allow learning starting feats even if prerequisites are not met - these can be unlocked later
        if (this.categoryId === 'starting' && this.spec === null) {
            return true;
        }
        return this.requirementsMet;
    }

    get requirementsMet() {
        let reqs = this.data.requirements;
        if (!reqs) {
            return true;
        }
        // Check for base attack bonus
        if (this.char.baseAttackBonus < reqs.baseAttackBonus) {
            return false;
        }
        // Check for level
        if (reqs.level && this.char.level < reqs.level) {
            return false;
        }
        // Check for required minimum ability scores
        for (let abilityId in reqs.abilities || {}) {
            if (reqs.abilities.hasOwnProperty(abilityId)) {
                if (this.char.abilities[abilityId].value < reqs.abilities[abilityId]) return false;
            }
        }
        // Check for required trained skills
        for (let skillId of reqs.trainedSkills || []) {
            if (!this.char.skills.hasTraining(skillId)) return false;
        }
        // Check for required features
        for (let requiredFeature of reqs.features || []) {
            if (requiredFeature.matchingSpec) {
                requiredFeature.spec = this.spec;
            }
            if (!this.char.features.has(requiredFeature)) return false;
        }
        // Check that at least one "or" feature is present
        if (reqs.featuresOr && reqs.featuresOr.length > 0) {
            let anyFeatureFound = false;
            for (let orFeature of reqs.featuresOr || []) {
                if (orFeature.matchingSpec) {
                    orFeature.spec = this.spec;
                }
                if (this.char.features.has(orFeature)) {
                    anyFeatureFound = true;
                    break;
                }
            }
            if (!anyFeatureFound) return false;
        }
        // Check for matching class skills
        if (reqs.matchingClassSkill) {
            if (!this.char.skills.isClassSkill(this.spec)) return false;
        }
        // Check for matching trained skills
        if (reqs.matchingTrainedSkill) {
            if (!this.char.skills.hasTraining(this.spec)) return false;
        }
        // Check for matching untrained skills - note special logic to avoid the feat being disabled by itself
        if (reqs.matchingUntrainedSkill) {
            if (this.char.skills.hasTraining(this.spec, this.id !== 'skill-training')) return false;
        }
        // Check for matching weapon group proficiencies
        if (reqs.matchingWeaponGroupProficiency) {
            if (!this.char.weapons.hasProficientGroup(this.spec)) return false;
        }
        // Check for matching weapon proficiencies
        if (reqs.matchingWeaponProficiency) {
            if (!this.char.weapons.hasProficientWeapon(this.spec)) return false;
        }
        // Check for matching Force powers
        if (reqs.matchingForcePower) {
            if (!this.char.features.has({id: this.spec})) return false;
        }
        // Check for minimum size
        if (reqs.size) {
            if (SIZES.indexOf(this.char.size) < SIZES.indexOf(reqs.size)) return false;
        }
        // Check for species
        if (reqs.species) {
            if (this.char.species.id !== reqs.species) return false;
        }
        return true;
    }

    get grants() {
        return this.data.grants || {};
    }

    get type() {
        return this.data.type || 'feature';
    }
}
