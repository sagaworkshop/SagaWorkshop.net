<template>
    <div class="col character-panel text-center">
        <div class="mb-2">
            <strong>Skills</strong>
        </div>
        <div class="card-columns">
            <div class="card bg-light my-1 my-md-0 p-0 pr-2 border-0" v-for="(skill, id) in character.skills.skills">
                <table class="w-100 nowrap">
                    <tr>
                        <td class="border-0" width="10%" style="overflow: hidden;">
                            <template v-if="character.playable">
                                <a href="#" class="roll-button btn btn-dark btn-sm" role="button"
                                   :class="skill.usable ? '' : 'disabled'"
                                   :title="'Roll a ' + skill.name + ' check'"
                                   @click.prevent="rollSkillCheck(skill)"><i class="fa fa-cog"></i>
                                    {{ skill.modifier.value.toString().padStart(2).replace(' ', '&nbsp;') }}</a>
                            </template>
                            <template v-else-if="character.skills.canUntrain(skill.id)">
                                <a href="#" class="btn btn-sm" role="button" title="Untrain skill"
                                   @click.prevent="character.skills.untrain(skill.id)">
                                    <i class="fa fa-minus-square text-danger"></i>
                                </a>
                            </template>
                            <template v-else-if="character.skills.canTrain(skill.id)">
                                <a href="#" class="btn btn-sm" role="button" title="Train skill"
                                   @click.prevent="character.skills.train(skill.id)">
                                    <i class="fa fa-plus-square text-success"></i>
                                </a>
                            </template>
                            <template v-else>
                                <a href="#" class="btn btn-sm disabled" role="button" @click.prevent="">
                                    <i class="fa text-light"></i>
                                </a>
                            </template>
                        </td>
                        <td class="border-0 pl-2 text-left small" width="60%">
                            <a href="#" role="button" data-toggle="modal" data-target="#skill-modal"
                               :title="'Show ' + skill.name + ' formula'"
                               @click.prevent="showSkillModal(character, skill)">{{ skill.name }}</a>
                        </td>
                        <td class="border-0 text-right" width="20%">
                            <mod-icon class="fa-bullseye text-primary"
                                      :stat="skill.modifier.stat('competence')"></mod-icon>
                            <mod-icon class="fa-dot-circle-o text-success"
                                      :stat="skill.modifier.stat('training')"></mod-icon>
                            <mod-icon class="fa-dot-circle-o"
                                      :stat="skill.modifier.stat('size')"></mod-icon>
                            <mod-icon class="fa-exclamation-circle text-danger"
                                      :stat="skill.modifier.stat('condition')"></mod-icon>
                            <strong v-if="!character.playable">
                                &nbsp;{{ skill.modifier.value }}
                            </strong>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="text-center mb-3" v-if="!character.created || character.skills.numAvailable > 0">
            <strong :class="character.skills.numAvailable > 0 ? 'text-danger' : ''">
                Trained skills available: {{ character.skills.numAvailable }}
            </strong>
        </div>
    </div>
</template>

<script>
    import ModIcon from './ModIcon.vue';
    import {DicePool} from '../lib/dice';
    import {showSkillModal} from '../lib/modals';

    export default {
        props: ['character'],
        components: {
            ModIcon
        },
        methods: {
            rollSkillCheck: function(skill) {
                console.log(new DicePool(1, 20).roll());
            },
            showSkillModal
        }
    }
</script>
