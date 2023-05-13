export class DicePool {
    constructor(numDice, type) {
        this.count = numDice;
        this.sides = type;
    }

    roll() {
        let results = [];
        let total = 0;
        for (let i = 0; i < this.count; ++i) {
            let rollResult = Math.floor(Math.random() * this.sides) + 1;
            total += rollResult;
            results.push(rollResult);
        }
        return {
            results: results,
            resultsString: results.join(' + '),
            total: total
        }
    }

    toString() {
        return this.count + 'd' + this.sides;
    }
}
