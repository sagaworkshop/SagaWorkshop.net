export function showAbilityModal(ability) {
    this.$store.commit('setAbilityModalOptions', {ability: ability});
    $('#ability-modal').modal('show');
}

export function showDefenseModal(defense) {
    this.$store.commit('setDefenseModalOptions', {defense: defense});
    $('#defense-modal').modal('show');
}

export function showFeatureModal(feature) {
    this.$store.commit('setFeatureModalOptions', {feature: feature});
    $('#feature-modal').modal('show');
}

export function showFeatureSelectModal(character, category) {
    this.$store.commit('setFeatureSelectModalOptions', {
        character: character,
        category: category
    });
    $('#feature-select-modal').modal('show');
}

export function showSkillModal(character, skill) {
    this.$store.commit('setSkillModalOptions', {
        character: character,
        skill: skill
    });
    $('#skill-modal').modal('show');
}
