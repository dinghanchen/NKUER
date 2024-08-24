import Vue from 'vue'
import Router from 'vue-router'
import User from '@/views/user/user'

Vue.use(Router)
import Layout from '@/layout'

import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'


export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/user',
    component: Layout,
    redirect: '/user/user',
    name: 'UserManage',
    meta: {
      title: '用户管理',
      icon: 'user'
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/user/user'),
        name: 'User',
        meta: { title: '用户' }  
      },
      {
        path: 'role',
        component: () => import('@/views/user/role'),
        name: 'Role',
        meta: { title: '角色' }  
      },{
        path: 'permission',
        component: () => import('@/views/user/permission'),
        name: 'Permission',
        meta: { title: '权限' }  
      },
    ]
  }, 
  {
    path: '/statistics',
    component: Layout,
    redirect: 'statistics/index',
    children: [
      {
        path: 'statistics',
        component: () => import('@/views/statistics/index'),
        name: 'Statistics',
        meta: { title: '数据统计', icon: 'statistics'}
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }

]

componentsRouter
chartsRouter
nestedRouter
tableRouter,

{
  path: '/error',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ErrorPages',
  meta: {
    title: 'Error Pages',
    icon: '404'
  },
  children: [
    {
      path: '401',
      component: () => import('@/views/error-page/401'),
      name: 'Page401',
      meta: { title: '401', noCache: true }
    },
    {
      path: '404',
      component: () => import('@/views/error-page/404'),
      name: 'Page404',
      meta: { title: '404', noCache: true }
    }
  ]
},

{
  path: '/error-log',
  component: Layout,
  children: [
    {
      path: 'log',
      component: () => import('@/views/error-log/index'),
      name: 'ErrorLog',
      meta: { title: 'Error Log', icon: 'bug' }
    }
  ]
},
{}

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
