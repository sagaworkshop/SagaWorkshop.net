<template>
    <div class="card bg-light my-1 p-0 border-0">
        <div class="media nowrap">
            <img class="feature-icon d-flex align-self-center" :src="staticPath('unspent-feature.png')" alt=""/>
            <div class="media-body align-self-center text-left pl-2 small">
                <a href="#" class="text-danger"
                   @click.prevent="showFeatureSelectModal(character, category)"
                   data-toggle="modal" data-target="feature-select-modal">Choose {{ category.label }}</a>
            </div>
        </div>
    </div>
</template>

<script>
    import {showFeatureSelectModal} from '../lib/modals';
    import {staticPath} from '../lib/util';
    export default {
        props: ['category', 'character'],
        methods: {
            showFeatureSelectModal,
            staticPath
        }
    }
</script>
