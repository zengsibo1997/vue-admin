import Vue from 'vue'
import Router from 'vue-router'

// 路由懒加载
const login =() => import('@/components/login.vue')

const home =() => import('@/components/home/home.vue')
const welcome =() => import('@/components/home/welcome.vue')

const users =() => import('@/components/users/users.vue')

const rights = () => import('../components/power/rights.vue')
const roles = () => import('../components/power/roles.vue')

const cate = () => import('../components/goods/cate.vue')
const params = () => import('../components/goods/params.vue')
const goodsList = () => import('../components/goods/list.vue')
const add = () => import('../components/goods/add.vue')

const order = () => import('../components/order/order.vue')

const report = () => import('../components/report/report.vue')

Vue.use(Router)

const routes = [
  {path: '/',redirect: '/login'},
  {path: '/login',component: login},
  {path: '/home',
    redirect: '/welcome',
    component: home,
    children: [
      { path: '/home', component: welcome },
      { path: '/users', component: users },
      { path: '/rights', component: rights },
      { path: '/roles', component: roles },
      { path: '/categories', component: cate },
      { path: '/params', component: params },
      { path: '/goods', component: goodsList },
      { path: '/goods/add', component: add },
      { path: '/orders', component: order },
      { path: '/reports', component: report }
    ] 
  }
]
const router = new Router({routes})
// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const isLogin = window.sessionStorage.getItem('token')
  if (!isLogin) return next('/login')
  next()
})
// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
export default router