<template>
    <div>
        <table class="character-table table table-sm">
            <tbody>
            <tr class="bg-light rounded">
                <td class="align-middle border-0 small" width="20%">Name</td>
                <td class="align-middle border-0">
                    <strong>{{ character.name }}</strong>
                </td>
                <td class="align-middle border-0 text-center" width="20%">
                    <a href="#" class="btn btn-sm fa fa-pencil text-secondary"
                       data-toggle="modal" data-target="#set-character-name-modal"
                       @click.prevent=""></a>
                </td>
            </tr>
            <tr class="bg-light rounded">
                <td class="align-middle border-0 small">Level</td>
                <td class="align-middle border-0 small">{{ character.level }}</td>
                <td class="align-middle border-0 text-center">
                    <a href="#" class="btn btn-sm fa fa-plus-square text-success"
                       :class="character.levelledUp && character.level < 20 ? '' : 'invisible'"
                       data-toggle="modal" data-target="#class-select" title="Level up"
                       @click.prevent="character.allowLevelUp"></a>
                </td>
            </tr>
            <tr class="bg-light rounded">
                <td class="align-middle border-0 small">Species</td>
                <td class="align-middle border-0 small" colspan="2">
                    <template v-if="character.trueLevel <= 0">
                        <select class="form-control form-control-sm" v-model="currentSpecies">
                            <option :value="species.id" v-for="(species, id) in SPECIES">{{ species.name }}</option>
                        </select>
                    </template>
                    <template v-else-if="character.species">{{ character.species.name }}</template>
                </td>
            </tr>
            <tr class="bg-light rounded" v-if="character.level > 0">
                <td class="border-0 small">Classes</td>
                <td class="border-0 small" colspan="2">
                    <template v-for="(levelString, i) in character.classLevelStrings">
                        <span class="nowrap">{{ levelString }}</span>&nbsp;
                    </template>
                </td>
            </tr>
            </tbody>
        </table>
        <input-modal id="set-character-name-modal"
                     title="Set character name"
                     placeholder="Character name"
                     :input-name="'characterName'"
                     :input-type="'text'"
                     :callback="editName"></input-modal>
    </div>
</template>

<script>
    import InputModal from './InputModal.vue';
    import SPECIES from '../data/species.json';

    export default {
        props: ['character'],
        components: {
            InputModal
        },
        data: function() {
            return {
                SPECIES: SPECIES
            }
        },
        computed: {
            currentSpecies: {
                get() {
                    return this.character.species.id;
                },
                set(id) {
                    this.character.setSpecies(id);
                }
            }
        },
        methods: {
            editName(data) {
                this.character.setName(data.characterName);
            }
        }
    }
</script>

<style>
    .character-info-table .btn {
        min-width: 7rem;
    }
</style>
