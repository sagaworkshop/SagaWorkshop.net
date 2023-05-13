<template>
    <div id="character-sheet">
        <h4 class="text-center" v-if="!found">404 Character Not Found</h4>
        <template v-if="found && character">
            <div class="row justify-content-center">
                <div class="col-md order-1"></div>
                <character-info-panel :character="character" class="col-md order-3"></character-info-panel>
                <settings-panel :character="character" class="col-md order-2 order-md-4"></settings-panel>
            </div>
            <div class="row justify-content-center pb-3" v-if="!character.levelledUp">
                <level-up-panel :character="character" class="col"></level-up-panel>
            </div>
            <div class="row justify-content-center">
                <ability-score-assign-panel :character="character" class="col-md"
                                            v-if="character.abilities.isAssignable"></ability-score-assign-panel>
                <ability-score-panel :character="character" class="col-md" v-else></ability-score-panel>
                <combat-panel :character="character" class="col-md"></combat-panel>
                <defenses-panel :character="character" class="col-md"></defenses-panel>
            </div>
            <div class="row justify-content-center">
                <skills-panel :character="character"></skills-panel>
            </div>
            <div class="row justify-content-center mb-3"
                 v-if="character.features.has({id: 'force-training'})">
                <force-power-list :character="character"></force-power-list>
            </div>
            <div class="row justify-content-center mb-3"
                 v-if="character.features.has({id: 'starship-tactics'})">
                <starship-maneuver-list :character="character"></starship-maneuver-list>
            </div>
            <div class="row justify-content-center">
                <feature-list :character="character"></feature-list>
            </div>
        </template>
    </div>
</template>

<script>
    import AbilityScoreAssignPanel from './AbilityScoreAssignPanel.vue';
    import AbilityScorePanel from './AbilityScorePanel.vue';
    import CharacterInfoPanel from './CharacterInfoPanel.vue';
    import CombatPanel from './CombatPanel.vue';
    import DefensesPanel from './DefensesPanel.vue';
    import FeatureList from './FeatureList.vue';
    import ForcePowerList from './ForcePowerList.vue';
    import LevelUpPanel from './LevelUpPanel.vue';
    import SettingsPanel from './SettingsPanel.vue';
    import SkillsPanel from './SkillsPanel.vue';
    import StarshipManeuverList from './StarshipManeuverList.vue';

    import {Character} from '../lib/character';
    import {db} from '../lib/firebase';

    export default {
        components: {
            AbilityScoreAssignPanel,
            AbilityScorePanel,
            CharacterInfoPanel,
            CombatPanel,
            DefensesPanel,
            FeatureList,
            ForcePowerList,
            LevelUpPanel,
            SettingsPanel,
            SkillsPanel,
            StarshipManeuverList
        },
        data() {
            return {
                character: null,
                found: true
            }
        },
        created: function() {
            // Modals are sticking around during hot reload, need to get rid of them
            if (process.env.NODE_ENV === 'development') {
                $('.modal').modal('hide');
                $('.modal-backdrop').remove();
            }
            return loadCharacter(this, this.$route.params.id);
        },
        beforeRouteEnter(to, from, next) {
            return next(vm => {
                return loadCharacter(vm, to.params.id);
            });
        },
        beforeRouteUpdate(to, from, next) {
            if (to.params.id !== from.params.id) {
                return loadCharacter(this, to.params.id).then(next);
            }
        }
    }

    function loadCharacter(context, id) {
        let ref = db.ref('character/' + id);
        return ref.once('value').then((snapshot) => {
            let data = snapshot.val();
            if (data) {
                context.character = new Character(ref, context.$store.state.user, data);
                context.found = true;
            } else {
                context.found = false;
            }
        });
    }
</script>

<style>
    .character-panel {
    }

    .character-stat-box {
        margin: 0.2rem;
        min-width: 5rem;
        padding: 0.4rem 0;
    }

    .character-table {
        border-collapse: separate;
        border-spacing: 0 0.4rem;
    }

    .feature-icon {
        width: 33px;
        height: 33px;
    }

    .feature-icon-disabled {
        opacity: 0.4;
        filter: alpha(opacity=30);
    }

    .input-transparent {
        background-color: transparent;
        border: none;
    }

    .roll-button {
        display: inline-block;
        font-weight: bold;
        min-width: 3.2rem;
        text-align: left;
    }

    .nowrap {
        white-space: nowrap;
    }
</style>
