import {CLASSES} from './classes';
import CONDITIONS from '../data/conditions.json';
import SPECIES from '../data/species.json';
import SIZE_MODIFIERS from '../data/size-modifiers.json';

import {Abilities} from './abilities';
import {CharacterLevel} from './level';
import {Combat} from './combat';
import {Defenses} from './defenses';
import {DicePool} from './dice';
import {Features} from './features';
import {Settings} from './settings';
import {Skills} from './skills';
import {Weapons} from './weapons';

import {db} from './firebase';

export class Character {

    constructor(ref, user, data) {
        this.id = ref.key;
        this.ref = ref;
        if (data) {
            this.data = data;
        } else {
            this.data = {
                userId: user.uid,

                name: 'Unnamed Character',
                speciesId: 'human',

                baseAbilities: {
                    str: 8,
                    dex: 8,
                    con: 8,
                    int: 8,
                    wis: 8,
                    cha: 8
                },

                levelledUp: false,
                levels: [],
                trueLevel: 0,

                bonusHitPoints: 0,
                condition: 0,
                currentHitPoints: 0,

                darkSideScore: 0,
                destinyPoints: 0,
                forcePoints: 0,

                damageReduction: 0,
                shieldRating: 0,
                shieldRatingMax: 0,

                settings: {
                    maxPointBuy: 25
                }
            };
        }
        this.settings = new Settings(this);

        this.abilities = new Abilities(this);
        this.combat = new Combat(this);
        this.defenses = new Defenses(this);
        this.skills = new Skills(this);
        this.weapons = new Weapons(this);

        this.features = new Features(this);

        this.writePermissions = !!(user && user.uid === this.data.userId);

        this.listen();
    }

    // Basic info

    get name() {
        let string = this.data.name;
        const maxLength = 25;
        if (string.length > maxLength) return string.substring(0, maxLength) + '...';
        else return string;
    }

    setName(value) {
        let name = value.trim();
        let changes = {};
        changes['character/' + this.id + '/name'] = name;
        changes['user/' + this.data.userId + '/characters/' + this.id + '/name'] = name;
        db.ref().update(changes);
    }

    get species() {
        return SPECIES[this.data.speciesId];
    }

    get size() {
        return this.species.size;
    }

    setSpecies(id) {
        this.update({speciesId: id});
        this.features.resetCurrentLevelForcePowers();
        this.features.resetCurrentLevelStarshipManeuvers();
        this.skills.resetCurrentLevelSkills();
    }

    // Levels

    get created() {
        return this.data.trueLevel > 0;
    }

    get level() {
        return this.levels.length;
    }

    get trueLevel() {
        return this.data.trueLevel;
    }

    get levels() {
        return (this.data.levels || []).map(levelData => new CharacterLevel(levelData));
    }

    get lastLevel() {
        return this.levels[this.level - 1];
    }

    get lastLevelRef() {
        return this.ref.child('levels').child(this.level - 1);
    }

    get halfLevel() {
        return Math.floor(this.level / 2);
    }

    get levelledUp() {
        return this.data.levelledUp;
    }

    levelUp(data) {
        let newLevel = this.levels[this.level - 1];
        let newClass = CLASSES[newLevel.classId];

        // Set level-up hit points
        let hitPoints;
        if (this.level === 1) {
            hitPoints = newClass.startingHitPoints;
        } else {
            if (data.hitPoints) {
                hitPoints = parseInt(data.hitPoints, 10) || 0;
                hitPoints = Math.max(hitPoints, 1);
                hitPoints = Math.min(hitPoints, newClass.hitDie);
            } else {
                let die = new DicePool(1, newClass.hitDie);
                let result = die.roll();
                hitPoints = result.total;
            }
        }

        let forcePoints = newClass.forcePoints + this.halfLevel;
        if (this.features.has({id: 'force-boon'})) forcePoints += 3;

        this.ref.child('levels').child(this.level - 1).update({hitPoints: hitPoints});
        this.update({
            condition: this.data.previousCondition || 0,
            currentHitPoints: this.maxHitPoints,
            forcePoints: forcePoints,
            levelledUp: true,
            trueLevel: this.data.trueLevel + 1,
        });
    }

    get canLevelUp() {
        return this.level > this.data.trueLevel && this.abilities.canLevelUp && this.features.canLevelUp
            && this.skills.canLevelUp;
    }

    allowLevelUp() {
        this.update({levelledUp: false});
    }

    cancelLevelUp() {
        let levels = this.levels;
        if (this.level > this.data.trueLevel) {
            levels.pop();
        }
        this.update({
            condition: this.data.previousCondition || 0,
            levelledUp: true,
            levels: levels
        });
    }

    setLevelUpClass(classId) {
        let previousCondition = this.data.condition || 0;
        this.update({condition: 0, previousCondition: previousCondition});
        this.features.resetCurrentLevelForcePowers(false);
        this.features.resetCurrentLevelStarshipManeuvers(false);
        this.skills.resetCurrentLevelSkills(false);

        let classData = CLASSES[classId];
        let hitPoints = this.data.trueLevel === 0 ? classData.startingHitPoints : 0;
        let level = new CharacterLevel({classId: classId, hitPoints: hitPoints, features: []});
        if (this.level > this.data.trueLevel) {
            this.update({levels: this.levels.splice(0, this.level - 1).concat([level])});
        } else {
            this.update({levels: this.levels.concat([level])});
        }
    }

    undoLastLevel() {
        if (this.levelledUp) {
            let levels = this.data.levels;
            levels.pop();
            this.update({levelledUp: false, levels: levels, trueLevel: this.data.trueLevel - 1});
        }
    }

    get classLevelStrings() {
        let levelsByClass = this.getLevelsByClass();
        let levels = [];
        for (let classId in levelsByClass) {
            if (levelsByClass.hasOwnProperty(classId)) {
                levels.push(CLASSES[classId].name + ' (' + levelsByClass[classId] + ')');
            }
        }
        return levels;
    }

    getLevelsByClass() {
        let levelsByClass = {};
        for (let level of this.levels) {
            if (!levelsByClass[level.classId]) {
                levelsByClass[level.classId] = 0;
            }
            levelsByClass[level.classId]++;
        }
        return levelsByClass;
    }

    // Combat

    get maxHitPoints() {
        return this.defenses.maxHitPoints.value;
    }

    get bonusHitPoints() {
        return this.data.bonusHitPoints;
    }

    setBonusHitPoints(value) {
        value = Math.max(0, value || 0);
        this.update({bonusHitPoints: value});
    }

    addBonusHitPoints(data) {
        let amount = parseInt(data.amount, 10) || 0;
        amount = Math.max(amount, 0);
        this.update({bonusHitPoints: this.data.bonusHitPoints + amount});
    }

    takeDamage(data) {
        let amount = parseInt(data.amount, 10) || 0;
        amount = Math.max(amount, 0);
        if (this.shieldRating > 0) {
            if (amount > this.shieldRating) {
                amount -= this.shieldRating;
                this.decreaseShieldRating();
            } else {
                amount = 0;
            }
        }
        if (this.damageReduction > 0) {
            amount -= this.damageReduction;
        }
        if (amount >= this.defenses.damageThreshold.value) {
            this.moveDownConditionTrack();
        }
        if (this.bonusHitPoints > 0) {
            let originalAmount = amount;
            amount -= this.bonusHitPoints;
            this.setBonusHitPoints(Math.max(0, this.bonusHitPoints - originalAmount));
        }
        this.setCurrentHitPoints(this.currentHitPoints - amount);

        if (this.currentHitPoints <= 0) {
            this.setConditionTrack(CONDITIONS.length - 1);
        }
    }

    get currentHitPoints() {
        return this.data.currentHitPoints;
    }

    setCurrentHitPoints(value) {
        value = Math.max(0, value || 0);
        value = Math.min(value, this.maxHitPoints);
        this.update({currentHitPoints: value});
    }

    receiveHealing(data) {
        let amount = parseInt(data.amount, 10) || 0;
        if (this.condition.name === 'Unconscious') {
            this.moveUpConditionTrack();
        }
        this.setCurrentHitPoints(this.currentHitPoints + amount);
    }

    get condition() {
        return CONDITIONS[this.data.condition || 0];
    }

    moveDownConditionTrack() {
        this.setConditionTrack(this.data.condition + 1);
    }

    moveUpConditionTrack() {
        this.setConditionTrack(this.data.condition - 1);
    }

    setConditionTrack(index) {
        index = parseInt(index, 10) || 0;
        index = Math.min(Math.max(0, index), CONDITIONS.length);
        this.update({condition: index});
    }

    get baseAttackBonus() {
        let baseAttackBonus = 0;
        let levelsByClass = this.getLevelsByClass();
        for (let classId in levelsByClass) {
            if (levelsByClass.hasOwnProperty(classId)) {
                if (CLASSES[classId].fullBaseAttackBonus) {
                    baseAttackBonus += levelsByClass[classId];
                } else {
                    baseAttackBonus += Math.floor(levelsByClass[classId] * 0.75);
                }
            }
        }
        return baseAttackBonus;
    }

    get grappleBonus() {
        return this.baseAttackBonus + Math.max(this.abilities.str.modifier, this.abilities.dex.modifier)
            + SIZE_MODIFIERS['grapple'][this.size];
    }

    // Force

    get darkSideScore() {
        return this.data.darkSideScore;
    }

    increaseDarkSideScore() {
        this.update({darkSideScore: this.darkSideScore + 1});
    }

    decreaseDarkSideScore() {
        this.update({darkSideScore: Math.max(0, this.darkSideScore - 1)});
    }

    get forcePoints() {
        return this.data.forcePoints;
    }

    get nextLevelForcePoints() {
        if (this.level < 1) return 0;
        let newClass = CLASSES[this.lastLevel.classId];
        return newClass.forcePoints + this.halfLevel;
    }

    get forcePointDice() {
        let numDice = 1;
        let diceType = 6;
        if (this.level > 14) numDice = 3;
        else if (this.level > 7) numDice = 2;
        if (this.features.has({id: 'strong-in-the-force'})) diceType = 8;
        return new DicePool(numDice, diceType);
    }

    addForcePoint() {
        this.update({forcePoints: this.forcePoints + 1});
    }

    spendForcePoint() {
        this.update({forcePoints: Math.max(0, this.forcePoints - 1)});
    }

    get destinyPoints() {
        return this.data.destinyPoints;
    }

    addDestinyPoint() {
        this.update({destinyPoints: this.destinyPoints + 1});
    }

    spendDestinyPoint() {
        this.update({destinyPoints: Math.max(0, this.destinyPoints - 1)});
    }

    // Defenses

    get damageReduction() {
        return this.data.damageReduction;
    }

    get shieldRating() {
        return this.data.shieldRating;
    }

    decreaseShieldRating() {
        this.update({shieldRating: this.shieldRating - 5});
    }

    // Utility

    get playable() {
        return this.levelledUp && this.skills.numAvailable <= 0;
    }

    // Persistence and synchronization

    listen() {
        this.ref.on('value', snapshot => {
            this.data = snapshot.val();
            this.features = new Features(this);
        });
    }

    permanentlyDelete() {
        this.ref.off();
        let changes = {};
        changes['character/' + this.id] = null;
        changes['user/' + this.data.userId + '/characters/' + this.id] = null;
        db.ref().update(changes);
    }

    save() {
        return this.ref.set(this.data);
    }

    update(data) {
        return this.ref.update(data);
    }

}
