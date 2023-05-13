<template>
    <div class="character-panel">
        <div class="my-2 text-center">
            <strong>Defenses</strong>
        </div>
        <table class="character-table table table-sm border-0 nowrap">
            <tbody>
            <tr v-for="(defense, id) in character.defenses.all" class="border-0 rounded">
                <template v-if="!(defense.value === 0 && defense.hideIfZero)">
                    <td class="align-middle bg-light text-left border-0 p-1 small">
                        <a href="#"
                           :title="'Show ' + defense.label + ' formula'"
                           @click.prevent="showDefenseModal(defense)">
                            {{ defense.label }}
                        </a>
                    </td>
                    <td class="align-middle bg-light text-right border-0">
                        <mod-icon class="fa-dot-circle-o" :stat="defense.stat('untyped')"></mod-icon>
                        <mod-icon class="fa-dot-circle-o text-warning" :stat="defense.stat('dodge')"></mod-icon>
                        <mod-icon class="fa-dot-circle-o text-muted"
                                  :stat="defense.stat('improved-defenses')"></mod-icon>
                        <mod-icon class="fa-dot-circle-o text-dark" :stat="defense.stat('species')"></mod-icon>
                        <mod-icon class="fa-dot-circle-o text-dark" :stat="defense.stat('natural')"></mod-icon>
                        <mod-icon class="fa-exclamation-circle text-danger"
                                  :stat="defense.stat('condition')"></mod-icon>
                    </td>
                    <td class="align-middle bg-light font-weight-bold text-right border-0 pr-3" width="20%">
                        {{ defense.value }}
                    </td>
                </template>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import ModIcon from './ModIcon.vue';
    import {showDefenseModal} from '../lib/modals';

    export default {
        props: ['character'],
        components: {
            ModIcon
        },
        methods: {
            showDefenseModal
        }
    }
</script>
