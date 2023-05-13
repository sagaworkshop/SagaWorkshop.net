<template>
    <div id="app">
        <header class="hidden">
            <nav class="navbar navbar-expand-md sticky-top navbar-dark bg-dark">
                <router-link class="navbar-brand"
                             :to="{name: 'home'}">Saga Workshop
                </router-link>
                <button class="navbar-toggler d-lg-none" type="button" data-toggle="collapse"
                        data-target="#site-navbar">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="site-navbar">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item dropdown" v-if="$store.state.user && $store.state.characters">
                            <a class="nav-link dropdown-toggle" href="#" id="character-dropdown" role="button"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                My Character Sheets
                            </a>
                            <div class="dropdown-menu bg-dark" aria-labelledby="character-dropdown">
                                <router-link class="dropdown-item character-dropdown-item"
                                             v-for="(character, id) in $store.state.characters"
                                             :key="id"
                                             :to="{name: 'character-sheet', params: {id: id}}">
                                    {{ character.name }}
                                </router-link>
                            </div>
                        </li>
                    </ul>
                    <ul class="navbar-nav">
                        <template v-if="$store.state.user">
                            <li class="nav-item">
                                <a href="#" class="nav-link" @click.prevent="signOut">
                                    Sign Out ({{ $store.state.user.email }})</a>
                            </li>
                        </template>
                        <template v-else>
                            <li class="nav-item">
                                <a href="#" class="nav-link" @click.prevent="signIn">Sign In</a>
                            </li>
                        </template>
                    </ul>
                </div>
            </nav>
        </header>
        <div class="container">
            <transition name="fade">
                <router-view></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
    import {auth, db, signIn, signOut} from './lib/firebase';
    import store from './lib/store';

    export default {
        name: 'app',
        store: store,
        data() {
            return {
                user: null
            }
        },
        beforeCreate: function() {
            auth.onAuthStateChanged(user => {
                if (user) {
                    this.$store.commit('setUser', user);
                    db.ref('user').child(user.uid).child('characters').on('value', snapshot => {
                        this.$store.commit('setCharacters', snapshot.val());
                    });
                } else {
                    this.$store.commit('setUser', null);
                    this.$store.commit('setCharacters', []);
                }
            });
        },
        methods: {
            signIn() {
                return signIn().catch(console.error);
            },
            signOut() {
                return signOut().catch(console.error);
            }
        }
    }
</script>

<style>
    .container, .container-fluid {
        margin-top: 30px;
    }

    @media only screen and (min-width: 1200px) {
        .container {
            width: 1500px;
        }
    }

    .character-dropdown-item {
        color: #ffffff;
    }

    .invisible {
        visibility: hidden;
    }
</style>
