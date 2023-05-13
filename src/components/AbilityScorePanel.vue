<template>
    <div class="character-panel">
        <div class="my-2 text-center">
            <strong>Abilities</strong>
        </div>
        <table class="character-table table table-sm border-0 nowrap">
            <tbody>
            <tr v-for="ability in character.abilities.all" class="bg-light border-0 rounded">
                <td class="align-middle border-0 p-0">
                    <a href="#" class="roll-button btn btn-dark btn-sm" role="button"
                       :title="'Roll a ' + ability.label + ' check'"
                       @click.prevent="abilityCheck(ability)"><i class="fa fa-cog"></i>
                        {{ ability.modifier.toString().padStart(2).replace(' ', '&nbsp;') }}</a>
                    <a class="small ml-2" href="#"
                       :title="'Show ' + ability.label + ' formula'"
                       @click.prevent="showAbilityModal(ability)">
                        {{ ability.label }}
                    </a>
                </td>
                <td class="align-middle text-right border-0 p-0">
                    <i class="fa fa-exclamation-circle text-danger" aria-hidden="true"
                       :title="character.condition.checks + ' condition track penalty on ability checks'"
                       v-if="character.condition.checks !== 0"></i>
                </td>
                <td class="align-middle text-right border-0 pr-3 font-weight-bold" width="15%">
                    {{ ability.value }}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import {DicePool} from '../lib/dice';
    import {showAbilityModal} from '../lib/modals';

    export default {
        props: ['character'],
        methods: {
            abilityCheck: function(ability) {
                console.log(new DicePool(1, 20).roll());
            },
            showAbilityModal
        }
    }
</script>
