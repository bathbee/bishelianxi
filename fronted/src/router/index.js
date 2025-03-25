import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Survey from '../views/Survey.vue'
import Recommend from '../views/Recommend.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        { path: '/register', component: Register },
        { path: '/survey', component: Survey },
        { path: '/recommend', component: Recommend }
    ]
})

export default router