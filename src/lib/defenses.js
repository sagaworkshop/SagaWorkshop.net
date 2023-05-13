import {CLASSES} from './classes';
import DEFENSES from '../data/defenses.json';
import {Formula, Stat} from './formula';
import {AbilityModifierStat, ConditionTrackStat, HeroicLevelStat, SizeModifierStat} from './stats';

class ImprovedDamageThresholdStat extends Stat {
    constructor(char, id) {
        super(char, id, 'Improved Damage Threshold');
        this.hideIfZero = true;
    }
    get value() {
        return 5 * this.char.features.count({id: 'improved-damage-threshold'});
    }
}

// TODO: switch this to a MaxFormula
class DamageReductionStat extends Stat {
    get value() {
        return Math.max(...[
            this.char.features.has({id: 'natural-damage-reduction'}) ? 2 : 0,
            Math.floor((this.char.getLevelsByClass()['elite-trooper'] || 0) / 2)
        ]);
    }
}

class DodgeStat extends Stat {
    constructor(char, id) {
        super(char, id, 'dodge bonus');
        this.hideIfZero = true;
    }
    get value() {
        let sum = 0;
        if (this.char.features.has({id: 'martial-arts-i'})) sum++;
        if (this.char.features.has({id: 'martial-arts-ii'})) sum++;
        if (this.char.features.has({id: 'martial-arts-iii'})) sum++;
        return sum;
    }
}

class DexterityPenaltyStat extends Stat {
    constructor(char, id) {
        super(char, id, 'Dexterity penalty to Reflex Defense');
        this.hideIfZero = true;
    }
    get value() {
        return Math.min(0, this.char.abilities.dex.modifier);
    }
}

class ImprovedDefensesStat extends Stat {
    constructor(char, id) {
        super(char, id, 'Improved Defenses');
        this.hideIfZero = true;
    }
    get value() {
        if (this.char.features.has({id: 'improved-defenses'})) return 1;
        return 0;
    }
}

class MaxClassDefenseStat extends Stat {
    constructor(char, id, defenseIndex) {
        super(char, id, 'class defense bonus', 0);
        this.defenseIndex = defenseIndex;
        this.hideIfZero = true;
    }

    get value() {
        let max = 0;
        for (let level of this.char.levels) {
            max = Math.max(max, CLASSES[level.classId].defenseBonuses[this.defenseIndex]);
        }
        return max;
    }
}

class NaturalArmorStat extends Stat {
    constructor(char, id) {
        super(char, id, 'natural armor bonus');
        this.hideIfZero = true;
    }
    get value() {
        if (this.char.features.has({id: 'natural-armor-1'})) return 1;
        return 0;
    }
}

class SpeciesFortitudeDefenseStat extends Stat {
    constructor(char, id) {
        super(char, id, 'species defense bonus');
        this.hideIfZero = true;
    }
    get value() {
        if (this.char.features.has({id: 'great-fortitude'})) return 2;
        if (this.char.features.has({id: 'superior-defenses'})) return 1;
        return 0;
    }
}

class SpeciesReflexDefenseStat extends Stat {
    constructor(char, id) {
        super(char, id, 'species defense bonus');
        this.hideIfZero = true;
    }
    get value() {
        if (this.char.features.has({id: 'lightning-reflexes'})) return 2;
        if (this.char.features.has({id: 'superior-defenses'})) return 1;
        return 0;
    }
}

class SpeciesWillDefenseStat extends Stat {
    constructor(char, id) {
        super(char, id, 'species defense bonus');
        this.hideIfZero = true;
    }
    get value() {
        if (this.char.features.has({id: 'iron-will'})) return 2;
        if (this.char.features.has({id: 'superior-defenses'})) return 1;
        return 0;
    }
}

class DefenseFormula extends Formula {
    constructor(char, id, stats) {
        super(char, id, (DEFENSES[id] || {}).name, stats);
        this.data = DEFENSES[id] || {};
    }
}

class LevelUpConstitutionStat extends Stat {
    constructor(char) {
        super(char, 'con', '(level * constitution modifier)');
    }

    get value() {
        return this.char.level * this.char.abilities.con.modifier;
    }
}

class LevelUpHitPointsStat extends Stat {
    constructor(char, levelNum) {
        let id = 'level-hp-' + levelNum;
        let label;
        if (levelNum === 1) label = 'starting class hit points';
        else label = 'level ' + levelNum + ' hp roll';
        super(char, id, label);
        this.levelNum = levelNum;
        this.hideIfZero = true;
    }

    get value() {
        if (this.char.level >= this.levelNum) {
            let level = this.char.levels[this.levelNum - 1];
            return level.hitPoints || 0;
        }
        return 0;
    }
}

class LevelUpToughnessStat extends Stat {
    constructor(char) {
        super(char, 'toughness', 'Toughness bonus');
        this.hideIfZero = true;
    }

    get value() {
        if (this.char.features.has({id: 'toughness'})) {
            return this.char.level;
        }
        return 0;
    }
}

class HitPointsFormula extends DefenseFormula {
    constructor(char) {
        let stats = [];
        for (let i = 1; i <= 20; ++i) {
            stats.push(new LevelUpHitPointsStat(char, i));
        }
        stats.push(new LevelUpConstitutionStat(char));
        stats.push(new LevelUpToughnessStat(char));
        super(char, 'hit-points', stats);
    }
}

export class Defenses {
    constructor(char) {
        this.maxHitPoints = new HitPointsFormula(char);
        this.reflexDefense = new DefenseFormula(char, 'reflex', [
            new Stat(char, 'base', 'base defense', 10),
            new HeroicLevelStat(char, 'level'),
            new AbilityModifierStat(char, 'dex', 'dex', 'Dexterity bonus to Reflex Defense'),
            new SpeciesReflexDefenseStat(char, 'species'),
            new NaturalArmorStat(char, 'natural'),
            new MaxClassDefenseStat(char, 'class', 0),
            new SizeModifierStat(char, 'size', 'reflex-defense'),
            new DodgeStat(char, 'dodge'),
            new ImprovedDefensesStat(char, 'improved-defenses'),
            new ConditionTrackStat(char, 'condition', 'defenses')
        ]);
        this.flatFootedDefense = new DefenseFormula(char, 'flat-footed', [
            new Stat(char, 'base', 'base defense', 10),
            new HeroicLevelStat(char, 'level'),
            new DexterityPenaltyStat(char, 'dex-penalty'),
            new SpeciesReflexDefenseStat(char, 'species'),
            new NaturalArmorStat(char, 'natural'),
            new MaxClassDefenseStat(char, 'class', 0),
            new SizeModifierStat(char, 'size', 'reflex-defense'),
            new ImprovedDefensesStat(char, 'improved-defenses'),
            new ConditionTrackStat(char, 'condition', 'defenses')
        ]);
        this.fortitude = new DefenseFormula(char, 'fortitude', [
            new Stat(char, 'base', 'base defense', 10),
            new HeroicLevelStat(char, 'level'),
            new AbilityModifierStat(char, 'con', 'con'),
            new SpeciesFortitudeDefenseStat(char, 'species'),
            new MaxClassDefenseStat(char, 'class', 1),
            new ImprovedDefensesStat(char, 'improved-defenses'),
            new ConditionTrackStat(char, 'condition', 'defenses')
        ]);
        this.will = new DefenseFormula(char, 'will', [
            new Stat(char, 'base', 'base defense', 10),
            new HeroicLevelStat(char, 'level'),
            new AbilityModifierStat(char, 'wis', 'wis'),
            new SpeciesWillDefenseStat(char, 'species'),
            new MaxClassDefenseStat(char, 'class', 2),
            new ImprovedDefensesStat(char, 'improved-defenses'),
            new ConditionTrackStat(char, 'condition', 'defenses')
        ]);
        this.damageReduction = new DefenseFormula(char, 'damage-reduction', [
            new DamageReductionStat(char, 'elite-trooper', 'Elite Trooper damage reduction')
        ]);
        this.damageReduction.hideIfZero = true;
        this.damageThreshold = new DefenseFormula(char, 'damage-threshold', [
            this.fortitude,
            new SizeModifierStat(char, 'size', 'damage-threshold'),
            new ImprovedDamageThresholdStat(char, 'improved-damage-threshold')
        ]);
    }

    get all() {
        return {
            reflexDefense: this.reflexDefense,
            flatFootedDefense: this.flatFootedDefense,
            fortitude: this.fortitude,
            will: this.will,
            damageReduction: this.damageReduction,
            damageThreshold: this.damageThreshold
        }
    }
}
