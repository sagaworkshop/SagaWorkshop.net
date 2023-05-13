<template>
    <div class="character-panel text-center">
        <div class="my-2 text-center" v-if="currentClass">
            <strong>Gaining a level in:</strong>
        </div>
        <div class="text-center" v-if="currentClass">
            <img class="mx-auto d-block" :src="currentClass.icon" :alt="currentClass.name" :title="currentClass.name"/>
            {{ currentClass.name }}
        </div>
        <div class="my-2">
            <template v-if="currentClass">
                <button class="level-up-panel-btn btn btn-success" role="button" @click.prevent=""
                        data-toggle="modal" data-target="#level-up-modal"
                        v-if="character.canLevelUp && character.level > 1">Finalize
                </button>
                <button class="level-up-panel-btn btn btn-success" role="button" @click.prevent="character.levelUp"
                        v-else-if="character.canLevelUp">Finalize
                </button>
                <button class="level-up-panel-btn btn btn-success disabled" role="button" disabled="disabled"
                        v-else>Finalize
                </button>
            </template>
            <button class="level-up-panel-btn btn btn-info" role="button" data-toggle="modal"
                    data-target="#class-select"
                    @click.prevent="">
                <template v-if="currentClass">Change</template>
                <template v-else>Select</template>
                Class
            </button>
            <button class="level-up-panel-btn btn btn-danger" role="button"
                    v-if="character.trueLevel > 0"
                    @click.prevent="character.cancelLevelUp">Cancel
            </button>
        </div>
        <class-select-modal :character="character"></class-select-modal>
        <input-modal id="level-up-modal" title="Level up hit points" v-if="currentClass">
            <div class="row">
                <div class="col">
                    <p>Gaining a level in {{ currentClass.name }} grants you 1d{{ currentClass.hitDie }} hit points:</p>
                    <button type="button" class="btn btn-success" @click.prevent="levelUpHitDie">
                        Roll hit die (1d{{ currentClass.hitDie }}) for me
                    </button>
                </div>
            </div>
            <hr/>
            <div class="row">
                <div class="col">
                    <label for="level-up-hit-points">Or enter hit points manually:</label>
                    <div class="form-group mx-sm-3">
                        <input id="level-up-hit-points" name="hitPoints" type="number" class="form-control"
                               min="1" :max="currentClass.hitDie"
                               :placeholder="'1d' + currentClass.hitDie">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <button type="submit" class="btn btn-primary" @click.prevent="levelUpHitPoints">
                        Submit
                    </button>
                </div>
            </div>
        </input-modal>
    </div>
</template>

<script>
    import ClassSelectModal from './ClassSelectModal.vue';
    import InputModal from './InputModal.vue';
    import {CLASSES} from '../lib/classes';
    import {CharacterLevel} from '../lib/level';
    import {serializeForm} from '../lib/util';

    export default {
        props: ['character'],
        components: {
            ClassSelectModal,
            InputModal
        },
        computed: {
            currentClass() {
                if (this.character.level > 0 && this.character.trueLevel < this.character.level) {
                    return CLASSES[this.character.lastLevel.classId];
                } else {
                    return null;
                }
            }
        },
        methods: {
            levelUpHitDie() {
                let id = '#level-up-modal';
                let modal = $(id);
                let form = $(id + ' form');
                this.character.levelUp({hitDie: this.currentClass.hitDie});
                modal.modal('hide');
                form[0].reset();
            },
            levelUpHitPoints() {
                let id = '#level-up-modal';
                let modal = $(id);
                let form = $(id + ' form');
                let data = serializeForm(form);
                this.character.levelUp({hitPoints: data.hitPoints});
                modal.modal('hide');
                form[0].reset();
            }
        }
    }
</script>

<style>
    .level-up-panel-btn {
        width: 125px !important;
        margin: 0.25rem 0;
    }
</style>
