class WeaponGroup {
    constructor(id, name, exotic = false) {
        this.id = id;
        this.name = name;
        this.exotic = exotic;
    }
}

class Weapon {
    constructor(id, name, groupId) {
        this.id = id;
        this.name = name;
        this.group = WEAPON_GROUPS[groupId];
    }
}

// TODO: move to JSON, get rid of exotic weapon groups and just use the weapon itself
export const WEAPON_GROUPS = {
    'advanced-melee-weapons': new WeaponGroup('advanced-melee-weapons', 'advanced melee weapons'),
    'amphistaff': new WeaponGroup('amphistaff', 'amphistaff', true),
    'atlatl': new WeaponGroup('atlatl', 'atlatl', true),
    'bowcaster': new WeaponGroup('bowcaster', 'bowcaster', true),
    'cesta': new WeaponGroup('cesta', 'cesta', true),
    'exotic-weapons': new WeaponGroup('exotic-weapons', 'exotic weapons', false),
    'flamethrower': new WeaponGroup('flamethrower', 'flamethrower', true),
    'heavy-weapons': new WeaponGroup('heavy-weapons', 'heavy weapons'),
    'lightsabers': new WeaponGroup('lightsabers', 'lightsabers'),
    'pistols': new WeaponGroup('pistols', 'pistols'),
    'rifles': new WeaponGroup('rifles', 'rifles'),
    'simple-weapons': new WeaponGroup('simple-weapons', 'simple weapons')
};

export const WEAPONS = {
    'lightsaber': new Weapon('lightsaber', 'lightsaber', 'lightsabers'),
    'blaster-pistol': new Weapon('blaster-pistol', 'blaster pistol', 'pistols'),
    'blaster-rifle': new Weapon('blaster-rifle', 'blaster rifle', 'rifles'),
    'flamethrower': new Weapon('flamethrower', 'flamethrower', 'flamethrower'),
    'starship': new Weapon('starship', 'starship weapons', 'heavy-weapons'),
    'vehicle': new Weapon('vehicle', 'vehicle weapons', 'heavy-weapons'),
    'unarmed': new Weapon('unarmed', 'unarmed attack', 'simple-weapons')
};

export class Weapons {
    constructor(char) {
        this.char = char;
    }

    hasProficientGroup(weaponGroupId) {
        if (this.char.features.has({id: 'weapon-proficiency', spec: weaponGroupId})) return true;
        let group = WEAPON_GROUPS[weaponGroupId];
        if (group && group.exotic) {
            if (this.char.features.has({id: 'exotic-weapon-proficiency', spec: weaponGroupId})) return true;
            if (this.char.features.has({id: 'exotic-weapon-mastery'})) return true;
        }
        // TODO: exotic weapons master
        for (let feature of this.char.features.all) {
            if (!feature.grants) continue;
            for (let grantedWeaponGroupId of feature.grants.weaponGroupProficiencies || []) {
                if (grantedWeaponGroupId === weaponGroupId) {
                    return true;
                }
            }
            for (let grantedWeaponId of feature.grants.weaponProficiencies || []) {
                let weapon = WEAPONS[grantedWeaponId];
                if (weapon && weapon.group.id === weaponGroupId) {
                    return true;
                }
            }
        }
        return false;
        // TODO: weapon familiarity - need to make weapon groups a class with reference to character
    }

    hasProficientWeapon(weaponId) {
        let weapon = WEAPONS[weaponId];
        if (weapon) {
            return this.hasProficientGroup(weapon.group.id);
        }
        return false;
    }
}
