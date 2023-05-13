<template>
    <div class="character-panel text-center">
        <div class="mb-2">
            <strong>Hit Points</strong>
        </div>
        <div class="d-inline-block">
            <div class="bg-light d-flex align-items-center justify-content-center">
                <template v-if="character.levelledUp">
                    <div class="align-middle">
                        <a href="#" class="btn btn-sm text-danger fa fa-dot-circle-o" role="button"
                           title="Take damage" data-toggle="modal" data-target="#take-damage-modal"></a>
                    </div>
                    <div class="p-0">
                        <input class="form-control text-center" style="width:4.25rem;"
                               type="number" min="0" :max="character.maxHitPoints"
                               v-model.number.lazy="currentHitPoints"/>
                    </div>
                    <div class="mx-2" v-if="character.bonusHitPoints > 0">+</div>
                    <div class="p-0" v-if="character.bonusHitPoints > 0">
                        <input class="form-control text-center" style="width:4rem;"
                               type="number" min="0"
                               v-model.number.lazy="bonusHitPoints"/>
                    </div>
                    <div class="align-middle">
                        <a href="#" class="btn btn-sm text-info fa fa-flash" role="button"
                           title="Add bonus hit points" data-toggle="modal" data-target="#add-bonus-hp-modal"
                           @click.prevent=""></a>
                    </div>
                    <div class="mx-2">/</div>
                    <div class="p-1 px-2 rounded font-weight-bold">
                        <a href="#" title="Show hit point formula"
                           @click.prevent="showDefenseModal(character.defenses.maxHitPoints)">
                            {{ character.maxHitPoints }}
                        </a>
                    </div>
                    <div class="align-middle">
                        <a href="#" class="btn btn-sm text-success fa fa-medkit" role="button"
                           :class="character.currentHitPoints >= character.maxHitPoints ? 'disabled' : ''"
                           title="Receive healing" data-toggle="modal" data-target="#receive-healing-modal"
                           @click.prevent=""></a>
                    </div>
                </template>
                <template v-else>
                    <div class="character-stat-box d-inline-block bg-light font-weight-bold rounded">
                        <a href="#" title="Show hit point formula"
                           @click.prevent="showDefenseModal(character.defenses.maxHitPoints)">
                            {{ character.maxHitPoints }}
                        </a>
                    </div>
                </template>
            </div>
        </div>
        <template v-if="character.levelledUp">
            <div class="my-2">
                <strong>Condition Track</strong>
            </div>
            <div class="d-flex align-items-center justify-content-center mb-4">
                <a href="#" class="btn btn-sm fa fa-minus d-inline-block text-danger"
                   :class="character.condition.index >= 5 ? 'disabled' : ''"
                   @click.prevent="character.moveDownConditionTrack" title="Move 1 step down condition track"></a>
                <div class="inline-block">
                    <select class="d-inline-block form-control form-control-sm" v-model="condition">
                        <option v-for="(condition, index) in CONDITIONS" :value="index">{{ condition.name }}
                        </option>
                    </select>
                </div>
                <a href="#" class="btn btn-sm fa fa-plus d-inline-block text-success"
                   :class="character.condition.index <= 0 ? 'disabled' : ''"
                   @click.prevent="character.moveUpConditionTrack" title="Move 1 step up condition track"></a>
            </div>
        </template>
        <div class="d-flex align-items-center justify-content-around my-2">
            <div>
                <span class="d-block">Base Attack</span>
                <div class="character-stat-box d-inline-block bg-light font-weight-bold rounded">
                    +{{ character.baseAttackBonus }}
                </div>
            </div>
            <div>
                <span class="d-block">Grapple</span>
                <div class="character-stat-box d-inline-block bg-light rounded">
                    <template v-if="character.levelledUp">
                        <a href="#" class="roll-button btn btn-dark btn-sm" role="button"
                           title="Roll a grapple check"
                           @click.prevent="rollGrappleCheck"><i class="fa fa-cog"></i> {{ character.grappleBonus }}</a>
                    </template>
                    <strong v-else>
                        {{ character.grappleBonus }}
                    </strong>
                </div>
            </div>
            <div>
                <span class="d-block">Speed</span>
                <div class="character-stat-box d-inline-block bg-light font-weight-bold rounded">
                    <i class="fa fa-exclamation-circle text-danger" aria-hidden="true"
                       title="Condition track penalty"
                       v-if="character.condition.speedFactor !== 1"></i>
                    {{ character.combat.walkSpeed.value }} sq
                </div>
            </div>
        </div>
        <div class="d-flex align-items-center justify-content-around my-2">
            <div>
                <span class="d-block">Dark Side</span>
                <div class="character-stat-box d-inline-block bg-light rounded">
                    <a href="#" class="btn btn-sm fa fa-minus d-inline-block text-success"
                       title="Decrease Dark Side Score"
                       :class="character.darkSideScore <= 0 ? 'disabled' : ''"
                       @click.prevent="character.decreaseDarkSideScore"
                       v-if="character.levelledUp"></a>
                    <strong class="align-middle d-inline-block">{{ character.darkSideScore }}</strong>
                    <a href="#" class="btn btn-sm fa fa-plus d-inline-block text-danger"
                       title="Increase Dark Side Score"
                       @click.prevent="character.increaseDarkSideScore"
                       v-if="character.levelledUp"></a>
                </div>
            </div>
            <div>
                <span class="d-block">Force</span>
                <div class="character-stat-box d-inline-block bg-light rounded">
                    <a href="#" class="btn btn-sm fa fa-minus d-inline-block text-danger" title="Spend Force point"
                       :class="character.forcePoints <= 0 ? 'disabled' : ''"
                       @click.prevent="character.spendForcePoint"
                       v-if="character.levelledUp"></a>
                    <a href="#" class="roll-button btn btn-dark btn-sm" role="button"
                       :title="'Spend a Force point to add ' + character.forcePointDice +
                        ' to an attack roll, ability check, or skill check'"
                       :class="character.forcePoints <= 0 ? 'disabled' : ''"
                       @click.prevent="rollForcePoint"
                       v-if="character.levelledUp"><i class="fa fa-cog"></i> {{ character.forcePoints }}</a>
                    <strong class="align-middle d-inline-block" v-else>{{ character.nextLevelForcePoints }}</strong>
                    <a href="#" class="btn btn-sm fa fa-plus d-inline-block text-success" title="Add Force point"
                       @click.prevent="character.addForcePoint"
                       v-if="character.levelledUp"></a>
                </div>
            </div>
            <div>
                <span class="d-block">Destiny</span>
                <div class="character-stat-box d-inline-block bg-light rounded">
                    <a href="#" class="btn btn-sm fa fa-minus d-inline-block text-danger"
                       title="Spend destiny point"
                       :class="character.destinyPoints <= 0 ? 'disabled' : ''"
                       @click.prevent="character.spendDestinyPoint"
                       v-if="character.levelledUp"></a>
                    <strong class="align-middle d-inline-block">{{ character.destinyPoints }}</strong>
                    <a href="#" class="btn btn-sm fa fa-plus d-inline-block text-success" title="Add destiny point"
                       @click.prevent="character.addDestinyPoint"
                       v-if="character.levelledUp"></a>
                </div>
            </div>
        </div>

        <template v-if="character.levelledUp">
            <input-modal id="take-damage-modal"
                         title="Take damage"
                         placeholder="Damage amount"
                         :callback="character.takeDamage.bind(character)"></input-modal>
            <input-modal id="add-bonus-hp-modal"
                         title="Add bonus hit points"
                         placeholder="# hit points"
                         :callback="character.addBonusHitPoints.bind(character)"></input-modal>
            <input-modal id="receive-healing-modal"
                         title="Receive healing"
                         placeholder="# hit points"
                         :callback="character.receiveHealing.bind(character)"></input-modal>
        </template>
    </div>
</template>

<script>
    import InputModal from './InputModal.vue';
    import CONDITIONS from '../data/conditions.json';
    import {DicePool} from "../lib/dice";
    import {showDefenseModal} from '../lib/modals';

    export default {
        props: ['character'],
        components: {
            InputModal
        },
        data() {
            return {
                CONDITIONS: CONDITIONS
            }
        },
        computed: {
            condition: {
                get() {
                    return this.character.condition.index;
                },
                set(value) {
                    this.character.setConditionTrack(value);
                }
            },
            bonusHitPoints: {
                get() {
                    return this.character.bonusHitPoints;
                },
                set(value) {
                    this.character.setBonusHitPoints(value);
                }
            },
            currentHitPoints: {
                get() {
                    return this.character.currentHitPoints;
                },
                set(value) {
                    this.character.setCurrentHitPoints(value);
                }
            }
        },
        methods: {
            rollForcePoint: function() {
                console.log(this.character.forcePointDice.roll());
                this.character.spendForcePoint();
            },
            rollGrappleCheck: function() {
                console.log(new DicePool(1, 20).roll());
            },
            showDefenseModal
        }
    }
</script>
