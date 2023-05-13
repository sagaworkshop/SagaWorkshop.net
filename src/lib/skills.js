import SKILLS_DATA from '../data/skills.json';
import {CLASSES} from './classes';
import {Formula, Stat} from './formula';
import {AbilityModifierStat, ConditionTrackStat, HalfLevelStat, SizeModifierStat} from './stats';

class CompetenceStat extends Stat {
    constructor(char, id, skillId) {
        super(char, id, 'competence');
        this.skillId = skillId;
        this.hideIfZero = true;
    }

    get value() {
        if (this.char.features.has({id: 'skill-focus', spec: this.skillId})) {
            return 5;
        }
        return 0;
    }
}

class TrainingStat extends Stat {
    constructor(char, id, skillId) {
        super(char, id, 'trained skill');
        this.skillId = skillId;
        this.hideIfZero = true;
    }

    get value() {
        if (this.char.skills.hasTraining(this.skillId)) {
            return 5;
        }
        return 0;
    }
}

class Skill {
    constructor(char, id, data) {
        this.char = char;

        this.id = id;
        this.name = data.name;
        this.abilityModifier = data.modifier;
        this.armorCheck = data.armorCheck;
        this.trainedOnly = data.trainedOnly;
        this.requiresForceSensitivity = data.requiresForceSensitivity;

        this.modifier = new Formula(char, 'bonus', 'skill check modifier', [
            new HalfLevelStat(char, 'half-level'),
            new AbilityModifierStat(char, 'ability-mod', this.abilityModifier),
            new TrainingStat(char, 'training', this.id),
            new CompetenceStat(char, 'competence', this.id),
            new ConditionTrackStat(char, 'condition', 'checks')
        ]);
        if (this.id === 'stealth') {
            this.modifier.addStat(new SizeModifierStat(char, 'size', 'stealth'));
        }
    }

    get usable() {
        if (this.trainedOnly && !this.char.skills.hasTraining(this.id)) {
            return false;
        }
        return !this.requiresForceSensitivity || this.char.features.has({id: 'force-sensitivity'});
    }
}

export class Skills {
    constructor(char) {
        this.char = char;
        this.skills = {};
        for (let skillId in SKILLS_DATA) {
            if (SKILLS_DATA.hasOwnProperty(skillId)) {
                this.skills[skillId] = new Skill(char, skillId, SKILLS_DATA[skillId]);
            }
        }
    }

    hasTraining(skillId, checkFeat = true) {
        if (this.baseTrained.hasOwnProperty(skillId)) {
            return true;
        }
        // This is to handle the case where the "matchingUntrainedSkill" requirement causes the feat to be disabled
        // because of itself. Learning the Skill Training feat twice is prevented anyway by "multiple": false.
        if (checkFeat) {
            if (this.char.features.has({id: 'skill-training', spec: skillId})) {
                return true;
            }
        }
        for (let feature of this.char.features.all) {
            if (feature.grants.trainedSkills && feature.grants.trainedSkills.indexOf(skillId) >= 0) {
                return true;
            }
        }
        return false;
    }

    get baseTrained() {
        let trainedSkills = {};
        for (let level of this.char.levels) {
            Object.assign(trainedSkills, level.trainedSkills);
        }
        return trainedSkills;
    }

    get numBase() {
        if (this.char.level < 1) return 0;
        let numBaseSkills = CLASSES[this.char.levels[0].classId].baseSkills;
        if (this.char.species.bonusSkill) numBaseSkills++;
        return Math.max(1, numBaseSkills + this.char.abilities.int.modifier);
    }

    get numAvailable() {
        if (this.char.level < 1) return 0;
        return this.numBase - Object.keys(this.baseTrained).length;
    }

    isClassSkill(skillId) {
        for (let level of this.char.levels) {
            let classSkills = CLASSES[level.classId].classSkills;
            if (classSkills && classSkills.indexOf(skillId) > -1) {
                return true;
            }
        }
        for (let feature of this.char.features.all) {
            if (!feature.grants) continue;
            for (let grantedClassSkill of feature.grants.classSkills || []) {
                if (grantedClassSkill === skillId) return true;
            }
        }
        return false;
    }

    train(skillId) {
        let changes = {};
        changes[skillId] = true;
        this.char.lastLevelRef.child('trainedSkills').update(changes);
    }

    untrain(skillId) {
        let changes = {};
        changes[skillId] = null;
        this.char.lastLevelRef.child('trainedSkills').update(changes);
    }

    canTrain(skillId) {
        return !this.char.levelledUp && this.numAvailable > 0 && this.isClassSkill(skillId)
            && !this.hasTraining(skillId);
    }

    canUntrain(skillId) {
        if (this.char.levelledUp || this.char.level < 1) return false;
        if (this.char.data.trueLevel === this.char.level) return false;
        return this.char.lastLevel.trainedSkills && this.char.lastLevel.trainedSkills.hasOwnProperty(skillId);
    }

    resetCurrentLevelSkills(onlyIfNeeded = true) {
        if (this.char.level < 1 || this.char.data.trueLevel === this.char.level) {
            return;
        }
        if (!onlyIfNeeded || this.numAvailable < 0) {
            this.char.lastLevelRef.update({trainedSkills: null});
        }
    }

    get canLevelUp() {
        return this.numAvailable === 0;
    }
}
