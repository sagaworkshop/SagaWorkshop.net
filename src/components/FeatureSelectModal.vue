<template>
    <div id="feature-select-modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Choose {{ category.label }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-left">
                    <div id="template-accordion" data-children=".feature-template">
                        <template v-for="(pickTree, treeId) in getFeaturePicksByTree(character, category)"
                        v-if="Object.keys(pickTree.picks).length > 0">
                            <h6>{{ pickTree.tree.name }}</h6>
                            <p class="small" v-for="paragraph in pickTree.tree.description" v-html="paragraph"></p>
                            <div class="feature-template bg-light my-2 p-0 border-0 rounded"
                                 v-for="(pick, id) in pickTree.picks">
                                <div class="media">
                                    <img class="feature-icon d-flex align-self-center" :src="pick.feature.icon" alt=""
                                         :class="pick.canLearn ? '' : 'feature-icon-disabled'"/>
                                    <div class="media-body align-self-center text-left pl-2 small">
                                        <a data-toggle="collapse"
                                           data-parent="template-accordion"
                                           :href="'#template-accordion-' + treeId + '-' + id"
                                           aria-expanded="false"
                                           :aria-controls="'template-accordion-' + treeId + '-' + id">
                                            {{ pick.feature.name }}
                                        </a>
                                        <i class="fa fa-angle-down"></i>
                                    </div>
                                </div>
                                <div :id="'template-accordion-' + treeId + '-' + id"
                                     class="collapse pt-2 small" role="tabpanel">
                                    <p v-for="paragraph in pick.feature.data.description" v-html="paragraph"></p>
                                    <p v-if="pick.feature.data.prerequisites"
                                       :class="pick.requirementsMet ? '' : 'text-danger'">
                                        <strong>Prerequisites:</strong>
                                        <span v-html="pick.feature.data.prerequisites"></span>
                                    </p>
                                    <p v-for="(paragraph, index) in pick.feature.data.benefit">
                                        <strong v-if="index === 0">Benefit:</strong>
                                        <span v-html="paragraph"></span>
                                    </p>
                                    <p v-for="(paragraph, index) in pick.feature.data.normal">
                                        <strong v-if="index === 0">Normal:</strong>
                                        <span v-html="paragraph"></span>
                                    </p>
                                    <p v-for="(paragraph, index) in pick.feature.data.special">
                                        <strong v-if="index === 0">Special:</strong>
                                        <span v-html="paragraph"></span>
                                    </p>
                                    <div class="text-center mb-3" v-if="pick.hasSpecs && pick.canLearn">
                                        <select v-model="specChoices[id]">
                                            <option v-for="(feature, spec) in pick.specs" :value="spec">
                                                {{ capitalizeFirstLetter(feature.specName) }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="text-center pt-0" v-if="pick.canLearn">
                                        <button type="button" class="btn btn-success mb-2 disabled" disabled="disabled"
                                                v-if="pick.hasSpecs && !specChoices[id]">Learn
                                        </button>
                                        <button type="button" class="btn btn-success mb-2" v-else
                                                @click.prevent="learn(pick)">Learn
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <hr/>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import FEATURES from '../data/features.json';
    import {FeatureDescriptor} from '../lib/feature';
    import {capitalizeFirstLetter} from '../lib/util';
    import {getFeaturePicksByTree} from '../lib/feature-trees';

    export default {
        data() {
            return {
                specChoices: {}
            }
        },
        computed: {
            category() {
                return this.$store.state.featureSelectModalOptions.category || {};
            },
            character() {
                return this.$store.state.featureSelectModalOptions.character || {};
            }
        },
        methods: {
            capitalizeFirstLetter,
            getFeaturePicksByTree,
            learn(pick) {
                let feature = pick.feature;
                let descriptor = new FeatureDescriptor(feature.id, this.specChoices[feature.id], this.category.id);
                this.character.features.learn(descriptor);
                $('#feature-select-modal').modal('hide');
                this.$store.commit('setFeatureSelectModalOptions', {});
            }
        }
    }
</script>
