<template>
    <div id="defense-modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content" v-if="defense">
                <div class="modal-header">
                    <img class="d-inline-block" :src="staticPath('defenses/' + defense.id + '.jpg')" alt=""/>
                    <h5 class="modal-title">{{ defense.label }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-left small">
                    <p><strong>{{ defense.summary }}</strong></p>
                    <p><strong>Formula: </strong><span v-html="defense.breakdown"></span></p>
                    <p v-for="paragraph in defense.data.description" v-html="paragraph"></p>
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
            defense() {
                return this.$store.state.defenseModalOptions.defense;
            }
        },
        methods: {
            staticPath
        }
    }
</script>
