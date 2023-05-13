<template>
    <div class="character-panel">
        <div class="my-2 text-center">
            <strong>Abilities</strong>
        </div>
        <table class="character-table table table-sm border-0 mb-1">
            <thead>
            <tr>
                <th class="border-0">Ability</th>
                <th class="border-0"></th>
                <th class="border-0">Score</th>
                <th class="border-0"></th>
                <th class="border-0 text-center">Modifier</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="ability in character.abilities.all" class="bg-light border-0 rounded">
                <td class="align-middle border-0 py-2" width="35%">
                    <a class="small ml-2" href="#"
                       :title="'Show ' + ability.label + ' formula'"
                       @click.prevent="showAbilityModal(ability)">
                        {{ ability.label }}
                    </a>
                    <template v-if="!character.created && ability.stat('species').value !== 0">*</template>
                </td>
                <td class="align-middle text-right border-0" width="11%">
                    <a href="#" class="btn btn-sm fa fa-minus-square d-inline-block text-danger"
                       :title="'Decrease ' + ability.label"
                       :class="character.abilities.canDecrement(ability.id) ? '' : 'disabled'"
                       @click.prevent="character.abilities.decrement(ability.id)"></a>
                </td>
                <td class="align-middle text-center border-0 font-weight-bold" width="11%">
                    {{ ability.value }}
                </td>
                <td class="align-middle text-left border-0" width="11%">
                    <a href="#" class="btn btn-sm fa fa-plus-square d-inline-block text-success"
                       :title="'Increase ' + ability.label + ' (cost: '
                            + character.abilities.getIncrementCost(ability.id) + ')'"
                       :class="character.abilities.canIncrement(ability.id) ? '' : 'disabled'"
                       @click.prevent="character.abilities.increment(ability.id)"></a>
                </td>
                <td class="align-middle text-center border-0 font-weight-bold text-secondary" width="32%">
                    {{ ability.modifier }}
                </td>
            </tr>
            </tbody>
        </table>
        <div class="text-center mb-2" v-if="character.abilities.isAssignable">
            <strong :class="character.abilities.numAbilityIncreasesAvailable > 0 ? 'text-danger' : ''"
                    v-if="character.abilities.isAbilityIncreaseLevel">
                Ability score increases available: {{ character.abilities.numAbilityIncreasesAvailable }}
            </strong>
            <strong :class="character.abilities.pointBuyRemaining > 0 ? 'text-danger' : ''"
                    v-if="!character.created">
                Point buy remaining: {{ character.abilities.pointBuyRemaining }}
            </strong>
        </div>
        <div class="text-left small" v-if="!character.created">
            <template v-if="character.species.abilities">* Species ability modifier applied</template>
            <template v-else>&nbsp;</template>
        </div>
    </div>
</template>

<script>
    import {POINT_BUY_COSTS} from '../lib/abilities';
    import {showAbilityModal} from '../lib/modals';

    export default {
        props: ['character'],
        methods: {
            showAbilityModal
        }
    }
</script>
