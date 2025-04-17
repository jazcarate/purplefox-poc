import { createRouter, createWebHistory } from 'vue-router';
import Tournament from '../components/Tournament.vue';
import Home from '../components/Home.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/tournament/:id',
        name: 'Tournament',
        component: Tournament,
        props: true,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.NODE_ENV === 'production' ? '/purplefox-poc/' : '/'),
    routes,
});

export default router; 