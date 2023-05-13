<template>
    <div id="feature-modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <img class="d-inline-block" :src="feature.icon" alt=""/>
                    <h5 class="modal-title">{{ feature.name }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-left small">
                    <p v-for="paragraph in feature.data.description" v-html="paragraph"></p>
                    <p v-if="feature.data.prerequisites"
                       :class="feature.requirementsMet ? '' : 'text-danger'">
                        <strong>Prerequisites: </strong><span v-html="feature.data.prerequisites"></span>
                    </p>
                    <p v-for="(paragraph, index) in feature.data.benefit">
                        <strong v-if="index === 0">Benefit: </strong><span v-html="paragraph"></span>
                    </p>
                    <p v-for="(paragraph, index) in feature.data.normal">
                        <strong v-if="index === 0">Normal: </strong><span v-html="paragraph"></span>
                    </p>
                    <p v-for="(paragraph, index) in feature.data.special">
                        <strong v-if="index === 0">Special: </strong><span v-html="paragraph"></span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        computed: {
            feature() {
                return this.$store.state.featureModalOptions.feature || {data: {}};
            }
        }
    }
</script>
