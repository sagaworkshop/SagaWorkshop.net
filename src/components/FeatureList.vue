<template>
    <div class="col character-panel text-center">
        <div class="align-middle mb-2">
            <strong>Class Features</strong>
        </div>
        <div class="card-columns">
            <feature-card v-for="(feature, i) in features" :feature="feature" :key="i"></feature-card>
            <feature-select-card :character="character" :category="category" :key="j"
                v-for="(category, j) in character.features.unspentFeatures"></feature-select-card>
        </div>
        <div class="text-right small">
            <template v-if="hasUnmetFeatureRequirement">* Prerequisites not met.</template>
            <template v-else>&nbsp;</template>
        </div>
    </div>
</template>

<script>
    import FeatureCard from './FeatureCard.vue';
    import FeatureSelectCard from './FeatureSelectCard.vue';
    import FeatureSelectModal from './FeatureSelectModal.vue';
    import {compareByName, staticPath} from '../lib/util';

    export default {
        components: {
            FeatureCard,
            FeatureSelectCard,
            FeatureSelectModal
        },
        props: ['character'],
        computed: {
            features: function() {
                let features = this.character.features.features;
                return features.sort(compareByName);
            },
            hasUnmetFeatureRequirement: function() {
                for (let feature of this.character.features.features) {
                    if (!feature.requirementsMet) return true;
                }
                return false;
            }
        }
    }
</script>
