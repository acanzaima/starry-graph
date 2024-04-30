import { createRouter, createWebHistory } from 'vue-router';
import LayoutIndex from '@/layout/LayoutIndex.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: LayoutIndex,
      redirect: '/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('../views/home/Index.vue')
        }
      ]
    },
    {
      path: `/:path(.*)*`,
      component: () => import('../views/exception/404/index.vue')
    }
  ]
});

export default router;
