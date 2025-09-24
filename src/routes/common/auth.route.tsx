import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route } from 'react-router-dom'
import Cookies from 'js-cookie'
import config from '@/config/config'

const Login = lazy(() => import('@/pages/Auth/components/login.page'))

export default (
  <Route element={Cookies.get('token') ? <Navigate to='/' /> : <Outlet />}>
    <Route
      path={config.loginPath}
      element={
        <Suspense>
          <Login />
        </Suspense>
      }
    />
  </Route>
)
