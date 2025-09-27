import { lazy, Suspense } from 'react'
import { Route } from 'react-router-dom'
import config from '@/config/config'
import Register from '@/pages/Auth/components/register.page'
import SendOtp from '@/pages/Auth/components/sendOtp.page'
import GuestRoute from '@/components/GuestRoute'

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
      path={config.sendOtpPath}
      element={
        <Suspense>
          <SendOtp />
        </Suspense>
      }
    />
  </Route>
)
