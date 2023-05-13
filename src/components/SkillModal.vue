<template>
    <div id="skill-modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content" v-if="skill">
                <div class="modal-header">
                    <img class="d-inline-block" :src="staticPath('features/skill-training-' + skill.id + '.jpg')" alt=""/>
                    <h5 class="modal-title">{{ skill.name }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-left small">
                    <p class="text-danger" v-if="!skill.usable">You do not meet the prerequisites to use this skill.</p>
                    <p><strong>{{ skill.modifier.summary }}</strong></p>
                    <p><strong>Formula: </strong><span v-html="skill.modifier.breakdown"></span></p>
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
            skill() {
                return this.$store.state.skillModalOptions.skill;
            }
        },
        methods: {
            staticPath
        }
    }
</script>
