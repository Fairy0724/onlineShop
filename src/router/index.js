import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';

// 懒加载页面
const HomeView = () => import('@/views/HomeView.vue');
const ProductDetailView = () => import('@/views/ProductDetailView.vue');
const CartView = () => import('@/views/CartView.vue');
const OrderView = () => import('@/views/OrderView.vue');
const ProfileView = () => import('@/views/ProfileView.vue');
const LoginView = () => import('@/views/LoginView.vue');
const RegisterView = () => import('@/views/RegisterView.vue');
const SelectView = () => import('@/views/SelectView.vue');
const OrderSubmitView = () => import('@/views/OrderSubmitView.vue');
const BrandsView = () => import('@/views/BrandsView.vue');

const Layout = () => import('@/components/Layout.vue');

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'select', name: 'select', component: SelectView },
      { path: 'products/:id', name: 'productDetail', component: ProductDetailView },
      { path: 'carts', name: 'cart', component: CartView, meta: { requiresAuth: true } },
      { path: 'orders', name: 'orders', component: OrderView, meta: { requiresAuth: true } },
      { path: 'profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
      { path: 'order-submit/:orderData', name: 'orderSubmit', component: OrderSubmitView, meta: { requiresAuth: true } },
      { path: 'brands', name: 'brandsView', component: BrandsView, meta: { requiresAuth: false } },
    ]
  },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：校验登录态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLogin) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }  // 将要访问的路径作为参数传递给登录页面
    });
  } else {
    next();
  }
});

export default router;