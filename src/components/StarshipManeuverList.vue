<template>
    <div class="col character-panel text-center">
        <div class="align-middle mb-2">
            <strong>Starship Maneuvers</strong>
        </div>
        <div class="card-columns">
            <feature-card v-for="(feature, i) in starshipManeuvers" :feature="feature" :key="i"></feature-card>
            <feature-select-card :character="character" :category="category" :key="j"
                v-for="(category, j) in character.features.unspentStarshipManeuvers"></feature-select-card>
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
            starshipManeuvers: function() {
                let features = this.character.features.starshipManeuvers;
                return features.sort(compareByName);
            }
        }
    }
</script>
