import {Formula, MultiplyFormula, Stat} from './formula';

class ConditionSpeedFactorStat extends Stat {
    get value() {
        return this.char.condition.speedFactor;
    }
}

class SpeciesSpeedStat extends Stat {
    get value() {
        return this.char.species.speed;
    }
}

class LongStrideStat extends Stat {
    get value() {
        // TODO: only for no armor or light armor
        if (this.char.features.has({id: 'long-stride'})) return 2;
        return 0;
    }
}

export class Combat {
    constructor(char) {
        this.char = char;
        // TODO: armor (3/4 rounded down)
        // TODO: run speed (5x sprint, 4x normal, 3x heavy armor)
        this.walkSpeed = new MultiplyFormula(char, 'walk-speed', 'Speed', [
            new ConditionSpeedFactorStat(char, 'condition', 'condition track speed factor'),
            new Formula(char, 'walk-speed', 'Speed', [
                new SpeciesSpeedStat(char, 'species', 'species'),
                new LongStrideStat(char, 'long-stride', 'Long Stride')
            ])
        ]);
    }
}
