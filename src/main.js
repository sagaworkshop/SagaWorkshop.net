import Vue from 'vue';
import Router from 'vue-router';
import App from './App.vue';

import CharacterBuilder from './components/CharacterBuilder.vue';
import CharacterSheet from './components/CharacterSheet.vue';
import Index from './components/Index.vue';

Vue.config.productionTip = false;
Vue.use(Router);

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Index
        },
        {
            path: '/character',
            name: 'character-builder',
            component: CharacterBuilder,
            redirect: '/character/new',
            children: [
                {
                    path: ':id',
                    name: 'character-sheet',
                    component: CharacterSheet
                }
            ]
        }
    ],
    linkActiveClass: 'active'
});

new Vue({
    el: '#app',
    router: router,
    template: '<App/>',
    components: {
        App
    }
});
