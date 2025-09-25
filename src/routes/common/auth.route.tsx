import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route } from 'react-router-dom'
import Cookies from 'js-cookie'
import config from '@/config/config'
import Register from '@/pages/Auth/components/register.page'
import SendOtp from '@/pages/Auth/components/sendOtp.page'

const Login = lazy(() => import('@/pages/Auth/components/login.page'))

export default (
  <Route element={Cookies.get('accessToken') ? <Navigate to='/' /> : <Outlet />}>
    <Route
      path={config.loginPath}
      element={
        <Suspense>
          <Login />
        </Suspense>
      }
    />
    <Route
      path={config.registerPath}
      element={
        <Suspense>
          <Register />
        </Suspense>
      }
    />
    <Route
      path={config.sendOtpPath}
      element={
        <Suspense>
          <SendOtp />
        </Suspense>
      }
    />
  </Route>
)
