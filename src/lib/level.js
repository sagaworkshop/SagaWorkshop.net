export class CharacterLevel {
    constructor(data) {
        this.classId = data.classId;
        this.hitPoints = data.hitPoints;
        this.features = data.features || [];

        this.trainedSkills = data.trainedSkills || {};
        this.abilityIncreases = data.abilityIncreases || {};
    }

    hasCategory(categoryId) {
        for (let feature of this.features) {
            if (feature.categoryId === categoryId) return true;
        }
        return false;
    }
}
