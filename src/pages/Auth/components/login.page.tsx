import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Home, Lock, LogIn, User } from "lucide-react";
import config from "@/config/config";
import {
  useLoginMutation,
  type ILoginRequest,
} from "@/services/auth/auth.service";
import useValidateLoginFormHook from "@/hooks/login/useValidateLoginForm.hook";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setPermission, setRole } from "@/services/auth/auth.slice";
import { toast } from "sonner";
import { profileApi } from "@/services/profile/profile.service";

import { useLazyGetPermissionsByAccountIdQuery } from "@/services/staff/staff.service";

const BE_URL = import.meta.env.ENV_ENDPOINT_API;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [triggerGetProfile] = profileApi.endpoints.getProfile.useLazyQuery();

  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [getPermissions] = useLazyGetPermissionsByAccountIdQuery();

  const { emailRegister, passwordRegister, handleSubmit, errors } =
    useValidateLoginFormHook();

  const onSubmit: SubmitHandler<ILoginRequest> = async (data) => {
    try {
      const res = await login(data).unwrap();

      if (res.status) {
        console.log("res", res);

        dispatch(setIsAuthenticated(true));
        dispatch(setRole(res.role));

        if (res.role === config.roleStaff) {
          const staffPermissions = await getPermissions({
            accountId: res.id,
          }).unwrap();

          console.log("staffPermissions", staffPermissions);
          dispatch(setPermission(staffPermissions));
        }

        await triggerGetProfile();

        if (res.role === config.roleAdmin) {
          navigate(config.adminDashboardPath);
        } else if (
          res.role === config.roleLandlord ||
          res.role === config.roleStaff
        ) {
          navigate(config.landlordDashboardPath);
        } else {
          navigate(config.homePath);
        }

        toast.success(res.message);
      }
    } catch (err: any) {
      console.log("err", err);
      toast.error(err.message.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div
            className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 shadow-lg cursor-pointer hover:scale-105 hover:rotate-3 hover:shadow-2xl"
            onClick={() => navigate(config.homePath)}
          >
            <Home className="w-6 h-6 text-white" />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900">
            {t("welcome")}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t("loginDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="text"
                  {...emailRegister}
                  placeholder="Nhập email hoặc tên đăng nhập"
                  className={`pl-10 h-11 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...passwordRegister}
                  placeholder="Nhập mật khẩu"
                  className={`pl-10 pr-10 h-11 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label htmlFor="remember-me" className="cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <button
                type="button"
                onClick={() => navigate(config.sendOtpPath)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Đăng nhập
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Hoặc</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11 flex items-center justify-center gap-2"
          >
            Google
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to={config.registerPath} className="text-blue-600 font-bold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
