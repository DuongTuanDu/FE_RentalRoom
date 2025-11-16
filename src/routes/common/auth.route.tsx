import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import config from "@/config/config";
import Register from "@/pages/Auth/components/register.page";
import GuestRoute from "@/components/GuestRoute";
import VerifyOtp from "@/pages/Auth/components/veriryOTP.page";
import SendOtp from "@/pages/Auth/components/sendOtp.page";
import ResetPassword from "@/pages/Auth/components/resetPassword.page";
import FirstTimeChangePassword from "@/pages/Auth/components/firstTimeChangePassword";

const Login = lazy(() => import("@/pages/Auth/components/login.page"));

export default (
  <>
    <Route element={<GuestRoute />}>
      <Route path={config.loginPath} element={<Suspense><Login /></Suspense>} />
      <Route path={config.registerPath} element={<Suspense><Register /></Suspense>} />
      <Route path={config.verifyPath} element={<Suspense><VerifyOtp /></Suspense>} />
      <Route path={config.sendOtpPath} element={<Suspense><SendOtp /></Suspense>} />
      <Route path={config.resetPasswordPath} element={<Suspense><ResetPassword /></Suspense>} />
    </Route>

     <Route
      path="/auth/change-password-first"
      element={
        <Suspense>
          <FirstTimeChangePassword />
        </Suspense>
      }
    />
  </>
);

