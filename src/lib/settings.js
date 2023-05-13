export class Settings {
    constructor(char) {
        this.char = char;
        this.settings = this.char.data.settings || {};
    }

    get maxPointBuy() {
        return this.settings.maxPointBuy || 25;
    }

    set maxPointBuy(value) {
        value = parseInt(value, 10) || 0;
        this.settings.maxPointBuy = value;
        this.char.ref.child('settings').update({maxPointBuy: value});
    }
}
