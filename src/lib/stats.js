import ABILITIES from '../data/abilities.json';
import SIZE_MODIFIERS from '../data/size-modifiers.json';
import {Stat} from './formula';

export class AbilityModifierStat extends Stat {
    constructor(char, id, abilityId, label = null) {
        super(char, id, label ? label : ABILITIES[abilityId].name + ' modifier');
        this.abilityId = abilityId;
    }

    get value() {
        return this.char.abilities[this.abilityId].modifier;
    }
}

export class ConditionTrackStat extends Stat {
    constructor(char, id, modifierId) {
        super(char, id, 'condition track');
        this.modifierId = modifierId;
        this.hideIfZero = true;
    }

    get value() {
        return this.char.condition[this.modifierId];
    }
}

export class HalfLevelStat extends Stat {
    constructor(char, id) {
        super(char, id, '½ character level');
    }

    get value() {
        return this.char.halfLevel;
    }
}

export class HeroicLevelStat extends Stat {
    constructor(char, id) {
        super(char, id, 'heroic level');
    }

    get value() {
        return this.char.level;
    }
}

export class SizeModifierStat extends Stat {
    constructor(char, id, modifierId) {
        super(char, id, 'size modifier');
        this.hideIfZero = true;
        this.modifierId = modifierId;
    }

    get value() {
        return SIZE_MODIFIERS[this.modifierId][this.char.size];
    }
}
