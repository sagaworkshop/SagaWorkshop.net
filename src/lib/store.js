import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        user: null,
        characters: [],

        abilityModalOptions: {},
        defenseModalOptions: {},
        featureModalOptions: {},
        featureSelectModalOptions: {},
        skillModalOptions: {}
    },
    mutations: {
        setUser: function(state, user) {
            state.user = user;
        },
        setCharacters: function(state, characters) {
            state.characters = characters;
        },

        setAbilityModalOptions: function(state, options) {
            state.abilityModalOptions = options;
        },
        setDefenseModalOptions: function(state, options) {
            state.defenseModalOptions = options;
        },
        setFeatureModalOptions: function(state, options) {
            state.featureModalOptions = options;
        },
        setFeatureSelectModalOptions: function(state, options) {
            state.featureSelectModalOptions = options;
        },
        setSkillModalOptions: function(state, options) {
            state.skillModalOptions = options;
        }
    }
});
