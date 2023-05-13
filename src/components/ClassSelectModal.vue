<template>
    <div id="class-select" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document" v-if="!character.levelledUp">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Select a class</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-left">
                    <div id="class-accordion" data-children=".class-choice">
                        <div class="class-choice bg-light my-2 p-0 border-0 rounded"
                             v-for="cls in classes">
                            <div class="media">
                                <img class="class-icon d-flex align-self-center" :src="cls.icon" alt=""
                                     :class="requirementsMet[cls.id] ? '' : 'class-icon-disabled'"/>
                                <div class="media-body align-self-center text-left pl-2 small">
                                    <a data-toggle="collapse"
                                       data-parent="#class-accordion"
                                       :href="'#class-accordion-' + cls.id"
                                       aria-expanded="false"
                                       :aria-controls="'#class-accordion-' + cls.id">
                                        {{ cls.name }}
                                    </a>
                                </div>
                            </div>
                            <div :id="'class-accordion-' + cls.id" class="collapse py-2 small" role="tabpanel">
                                <div v-if="cls.startingHitPoints">
                                    <strong>Starting hit points:</strong> {{ cls.startingHitPoints }}
                                </div>
                                <div>
                                    <strong>Hit die:</strong> 1d{{ cls.hitDie }}
                                </div>
                                <div>
                                    <strong>Force Points:</strong> {{ cls.forcePoints }} + one-half character level
                                </div>
                                <div>
                                    <strong>Base attack bonus:</strong>
                                    <template v-if="cls.fullBaseAttackBonus">Full</template>
                                    <template v-else>3/4</template>
                                </div>
                                <div>
                                    <strong>Defense bonuses:</strong> {{ cls.defenseBonusesString }}
                                </div>
                                <div class="pt-3" v-if="cls.classSkills">
                                    <h5>Class skills:</h5>
                                    <div><strong>{{ cls.baseSkills}} + Intelligence modifier</strong></div>
                                    <div>{{ cls.classSkillsString }}</div>
                                </div>
                                <div class="pt-3"
                                     v-if="cls.requirementsStrings.length > 0 || cls.requiredFeatures.length > 0">
                                    <h5>Requirements</h5>
                                    <div>
                                        To qualify to become a {{ cls.name }},
                                        a character must fulfill the following criteria:
                                    </div>
                                    <div>
                                        <div class="my-1" v-for="req in cls.requirementsStrings">
                                            <strong>{{ req.label }}</strong>: {{ req.value }}
                                        </div>
                                        <feature-preview :feature="feature" :key="i"
                                                         v-for="(feature, i) in cls.requiredFeatures"></feature-preview>
                                    </div>
                                </div>
                                <div class="pt-3" v-if="cls.startingFeatures.length > 0">
                                    <h5>Starting feats</h5>
                                    <feature-preview :feature="feature" :key="i"
                                                     v-for="(feature, i) in cls.startingFeatures"></feature-preview>
                                </div>
                                <div class="pt-3" v-if="cls.classFeatures.length > 0">
                                    <h5>Class features</h5>
                                    <feature-preview :feature="feature" :key="i"
                                                     v-for="(feature, i) in cls.classFeatures"></feature-preview>
                                </div>
                                <div class="pt-3" v-if="cls.featureTrees.length > 0">
                                    <h5>Talent trees</h5>
                                    <div class="media my-1 ml-1" v-for="tree in cls.featureTrees">
                                        <img class="feature-icon d-flex align-self-center" :src="tree.icon"/>
                                        <div class="media-body align-self-center text-left pl-2">
                                            {{ tree.name }}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-center pt-3" v-if="requirementsMet[cls.id]">
                                    <button type="button" class="btn btn-success mb-2 disabled" disabled="disabled"
                                            v-if="!requirementsMet[cls.id]">Gain a level in {{ cls.name }}
                                    </button>
                                    <button type="button" class="btn btn-success mb-2" v-else
                                            @click.prevent="chooseClass(cls)">Gain a level in {{ cls.name }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import FeaturePreview from './FeaturePreview.vue';
    import {CLASSES} from '../lib/classes';

    export default {
        props: ['character'],
        components: {
            FeaturePreview
        },
        data() {
            return {
                classes: CLASSES
            }
        },
        computed: {
            requirementsMet() {
                let result = {};
                for (let classId in this.classes) {
                    result[classId] = this.classes[classId].requirementsMet(this.character);
                }
                return result;
            }
        },
        methods: {
            chooseClass(cls) {
                this.character.setLevelUpClass(cls.id);
                $('#class-select').modal('hide');
            }
        }
    }
</script>

<style>
    .class-icon {
        width: 50px;
        height: 50px;
    }

    .class-icon-disabled {
        opacity: 0.3;
        filter: alpha(opacity=30);
    }
</style>
