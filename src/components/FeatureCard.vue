<template>
    <div class="card bg-light my-1 p-0 border-0">
        <div class="media nowrap">
            <img class="feature-icon d-flex align-self-center" :src="feature.icon" alt=""
                 :class="feature.requirementsMet ? '' : 'feature-icon-disabled'"/>
            <div class="media-body align-self-center text-left pl-2 small">
                <a href="#" data-toggle="modal" data-target="feature-modal"
                   :title="'Show ' + feature.name + ' information'"
                   @click.prevent="showFeatureModal(feature)">{{ feature.name }}</a>
                <template v-if="!feature.requirementsMet">*</template>
            </div>
            <div class="align-self-center" v-if="feature.canUnlearn">
                <a href="#" class="btn btn-sm fa fa-minus-square d-inline-block text-danger" title="Remove"
                   @click.prevent="feature.unlearn"></a>
            </div>
        </div>
    </div>
</template>

<script>
    import {showFeatureModal} from '../lib/modals';

    export default {
        props: ['feature'],
        methods: {
            showFeatureModal
        }
    }
</script>
