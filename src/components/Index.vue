<template>
    <div class="row">
        <div class="col text-center">
            <img :src="staticPath('star-wars-logo.png')" class="mb-4"/>
            <h3 class="my-3">Saga Workshop</h3>
            <h5 v-if="$store.state.characters">My Character Sheets</h5>
            <div>
                <router-link class="d-block"
                             :to="{name: 'character-sheet', params: {id: id}}"
                             :key="id"
                             v-for="(character, id) in $store.state.characters">
                    {{ character.name }}
                </router-link>
            </div>
            <a href="#" class="btn btn-success mt-3" role="button" @click.prevent="createCharacter">
                Create New Character</a>
        </div>
    </div>
</template>

<script>
    import {Character} from '../lib/character';
    import {db, signIn} from '../lib/firebase';
    import {staticPath} from '../lib/util';

    export default {
        methods: {
            createCharacter() {
                let promise = this.$store.state.user ? Promise.resolve() : signIn();
                promise.then(() => {
                    let ref = db.ref('character').push();
                    let character = new Character(ref, this.$store.state.user);
                    return character.save().then(() => {
                        this.$router.push({name: 'character-sheet', params: {id: ref.key}});
                        let updates = {};
                        updates[ref.key] = {name: character.name};
                        db.ref('user').child(this.$store.state.user.uid).child('characters').update(updates);
                    });
                }).catch(console.error);
            },
            staticPath
        }
    }
</script>
