import { lazy, Suspense } from 'react'
import { Route } from 'react-router-dom'
import config from '@/config/config'
import Register from '@/pages/Auth/components/register.page'
import GuestRoute from '@/components/GuestRoute'
import VerifyOtp from '@/pages/Auth/components/veriryOTP.page'

const Login = lazy(() => import('@/pages/Auth/components/login.page'))

export default (
  <Route element={<GuestRoute />}>
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
      path={config.verifyPath}
      element={
        <Suspense>
          <VerifyOtp />
        </Suspense>
      }
    />
  </Route>
)
