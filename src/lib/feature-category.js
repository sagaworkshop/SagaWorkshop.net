import {CLASSES} from './classes';

// Indicates how a feature was granted to the character
export class FeatureCategory {
    constructor(id, name, classId = null) {
        this.id = id;
        this.name = name;
        this.classId = classId;
    }

    toString() {
        return this.id;
    }

    get label() {
        let string = '';
        if (this.classId) string += CLASSES[this.classId].name;
        string += ' ' + this.name;
        return string;
    }
}
