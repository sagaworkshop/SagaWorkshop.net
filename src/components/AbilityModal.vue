<template>
    <div id="ability-modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content" v-if="ability">
                <div class="modal-header">
                    <img class="d-inline-block" :src="staticPath('abilities/' + ability.icon + '.jpg')" alt=""/>
                    <h5 class="modal-title">{{ ability.label }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-left small">
                    <p><strong>{{ ability.summary }}</strong></p>
                    <p><strong>Formula: </strong><span v-html="ability.breakdown"></span></p>
                    <p v-for="paragraph in ability.data.description" v-html="paragraph"></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {staticPath} from '../lib/util';
    export default {
        props: ['character'],
        computed: {
            ability() {
                return this.$store.state.abilityModalOptions.ability;
            }
        },
        methods: {
            staticPath
        }
    }
</script>
