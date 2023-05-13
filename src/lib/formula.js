export class Stat {
    constructor(char, id, label = '', constantValue = null) {
        this.char = char;
        this.id = id;
        this.label = label;
        this.constantValue = constantValue;
        this.hideIfZero = false;
    }

    get value() {
        return this.constantValue;
    }

    get summary() {
        return this.value + ' ' + this.label;
    }

    get breakdown() {
        let string = '<span class="nowrap">';
        string += this.label;
        string += ' (<strong>' + this.value + '</strong>)';
        string += '</span>';
        return string;
    }
}

// TODO: Make these recursive
export class Formula extends Stat {
    constructor(char, id, label, stats) {
        super(char, id, label);
        this.parts = {};
        for (let stat of stats) {
            this.addStat(stat);
        }
        this.operator = ' + ';
    }

    get breakdown() {
        let parts = [];
        for (let key in this.parts) {
            if (this.parts.hasOwnProperty(key)) {
                let part = this.parts[key];
                if (part.value === 0 && part.hideIfZero) continue;
                parts.push(part.breakdown);
            }
        }
        return parts.join(this.operator);
    }

    get value() {
        let value = 0;
        for (let key in this.parts) {
            if (this.parts.hasOwnProperty(key)) {
                value += this.parts[key].value;
            }
        }
        return value;
    }

    stat(name) {
        if (this.parts.hasOwnProperty(name)) {
            return this.parts[name];
        }
        return {};
    }

    addStat(stat) {
        this.parts[stat.id] = stat;
    }
}

export class MultiplyFormula extends Formula {
    constructor(char, id, label, stats, roundDown = true) {
        super(char, id, label, stats);
        this.operator = ' * ';
        this.roundDown = roundDown;
    }

    get value() {
        if (Object.keys(this.parts).length <= 0) return 0;
        let value = 1;
        for (let key in this.parts) {
            if (this.parts.hasOwnProperty(key)) {
                value *= this.parts[key].value;
            }
        }
        if (this.roundDown) value = Math.floor(value);
        return value;
    }
}
