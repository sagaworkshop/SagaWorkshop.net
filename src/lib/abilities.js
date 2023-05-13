import ABILITIES from '../data/abilities.json';
import {Formula, Stat} from './formula';

class BaseAbilityStat extends Stat {
    constructor(char, id, name, abilityId) {
        super(char, id, 'base ' + name);
        this.abilityId = abilityId;
    }

    get value() {
        return this.char.data.baseAbilities[this.abilityId];
    }
}

class SpeciesAbilityStat extends Stat {
    constructor(char, id, abilityId) {
        super(char, id, 'species modifier');
        this.abilityId = abilityId;
        this.hideIfZero = true;
    }

    get value() {
        let species = this.char.species;
        if (species && species.abilities && species.abilities[this.abilityId]) {
            return species.abilities[this.abilityId];
        }
        return 0;
    }
}

class AbilityIncreaseStat extends Stat {
    constructor(char, levelNum, abilityId) {
        let id = 'increase-' + levelNum;
        let label = 'level ' + levelNum + ' ability increase';
        super(char, id, label);
        this.abilityId = abilityId;
        this.levelNum = levelNum;
        this.hideIfZero = true;
    }

    get value() {
        if (this.char.level >= this.levelNum) {
            let level = this.char.levels[this.levelNum - 1];
            if (level.abilityIncreases && level.abilityIncreases[this.abilityId]) {
                return 1;
            }
        }
        return 0;
    }
}

class AbilityFormula extends Formula {
    constructor(char, id, stats) {
        let ability = ABILITIES[id];
        let sharedStats = [
            new BaseAbilityStat(char, 'base', ability.name, ability.id),
            new SpeciesAbilityStat(char, 'species', ability.id),
        ];
        for (let i = 4; i <= 20; i += 4) {
            sharedStats.push(new AbilityIncreaseStat(char, i, ability.id))
        }
        super(char, id, ability.name, sharedStats.concat(stats));
        this.data = ABILITIES[id];
        this.icon = ability.name.toLowerCase();
    }

    get modifier() {
        return Math.floor((this.value - 10) / 2);
    }

    get checkModifier() {
        return this.modifier + this.character.condition.checks;
    }
}

export class Abilities {
    constructor(char) {
        this.char = char;
        this.str = new AbilityFormula(char, 'str', []);
        this.dex = new AbilityFormula(char, 'dex', []);
        this.con = new AbilityFormula(char, 'con', []);
        this.int = new AbilityFormula(char, 'int', []);
        this.wis = new AbilityFormula(char, 'wis', []);
        this.cha = new AbilityFormula(char, 'cha', []);
    }

    get all() {
        return {
            str: this.str,
            dex: this.dex,
            con: this.con,
            int: this.int,
            wis: this.wis,
            cha: this.cha
        }
    }

    decrement(abilityId) {
        let changes = {};
        if (this.isAbilityIncreaseLevel) {
            changes[abilityId] = null;
            this.char.lastLevelRef.child('abilityIncreases').update(changes);
        } else {
            changes[abilityId] = this.char.data.baseAbilities[abilityId] - 1;
            this.char.ref.child('baseAbilities').update(changes);
        }
        this.char.features.resetCurrentLevelForcePowers();
        this.char.features.resetCurrentLevelStarshipManeuvers();
        this.char.skills.resetCurrentLevelSkills();
    }

    increment(abilityId) {
        let changes = {};
        if (this.isAbilityIncreaseLevel) {
            changes[abilityId] = true;
            this.char.lastLevelRef.child('abilityIncreases').update(changes);
        } else {
            changes[abilityId] = this.char.data.baseAbilities[abilityId] + 1;
            this.char.ref.child('baseAbilities').update(changes);
        }
    }

    canDecrement(abilityId) {
        if (this.isAbilityIncreaseLevel) {
            return this.char.lastLevel.abilityIncreases.hasOwnProperty(abilityId);
        } else {
            return this[abilityId].stat('base').value > 8;
        }
    }

    canIncrement(abilityId) {
        if (this.isAbilityIncreaseLevel) {
            return !this.char.lastLevel.abilityIncreases.hasOwnProperty(abilityId)
                && this.numAbilityIncreasesAvailable > 0;
        } else {
            if (this[abilityId].stat('base').value >= 18) {
                return false;
            }
            return this.getIncrementCost(abilityId) <= this.pointBuyRemaining;
        }
    }

    getIncrementCost(abilityId) {
        if (this.isAbilityIncreaseLevel) {
            return 1;
        } else {
            return POINT_BUY_COSTS[this[abilityId].stat('base').value + 1]
                - POINT_BUY_COSTS[this[abilityId].stat('base').value];
        }
    }

    get pointBuyRemaining() {
        let total = 0;
        for (let abilityId in this.all) {
            total += POINT_BUY_COSTS[this[abilityId].stat('base').value];
        }
        return this.char.settings.maxPointBuy - total;
    }

    get numAbilityIncreasesAvailable() {
        if (!this.isAbilityIncreaseLevel) return 0;
        return 2 - Object.keys(this.char.lastLevel.abilityIncreases).length;
    }

    get isAbilityIncreaseLevel() {
        let nextLevel = this.char.data.trueLevel + 1;
        return !this.char.levelledUp && this.char.level > this.char.data.trueLevel
            && nextLevel >= 4 && nextLevel % 4 === 0;
    }

    get isAssignable() {
        if (!this.char.created) return true;
        return this.isAbilityIncreaseLevel;
    }

    get canLevelUp() {
        if (this.isAbilityIncreaseLevel) return this.numAbilityIncreasesAvailable === 0;
        return this.pointBuyRemaining === 0;
    }
}

export const POINT_BUY_COSTS = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 6,
    15: 8,
    16: 10,
    17: 13,
    18: 16
};
