<template>
    <div class="col character-panel text-center">
        <div class="align-middle mb-2">
            <strong>Force Powers</strong>
        </div>
        <div class="card-columns">
            <feature-card v-for="(feature, i) in forcePowers" :feature="feature" :key="i"></feature-card>
            <feature-select-card :character="character" :category="category" :key="j"
                v-for="(category, j) in character.features.unspentForcePowers"></feature-select-card>
        </div>
    </div>
</template>

<script>
    import FeatureCard from './FeatureCard.vue';
    import FeatureSelectCard from './FeatureSelectCard.vue';
    import FeatureSelectModal from './FeatureSelectModal.vue';
    import {compareByName} from '../lib/util';

    export default {
        components: {
            FeatureCard,
            FeatureSelectCard,
            FeatureSelectModal
        },
        props: ['character'],
        computed: {
            forcePowers: function() {
                let features = this.character.features.forcePowers;
                return features.sort(compareByName);
            }
        }
    }
</script>
