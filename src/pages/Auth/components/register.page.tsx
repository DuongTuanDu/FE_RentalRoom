import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Home,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useRegisterMutation } from "@/services/auth/auth.service";
import { Link, useNavigate } from "react-router-dom";
import config from "@/config/config";
import useValidateRegisterForm from "@/hooks/register/useValidateRegisterForm.hook";
import { useDispatch } from "react-redux";
import { setEmailVerify } from "@/services/auth/auth.slice";
import { toast } from "sonner";

const Register = () => {
  const [registerApi, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    nameRegister,
    emailRegister,
    passwordRegister,
    confirmPasswordRegister,
    handleSubmit,
    errors,
    watch,
  } = useValidateRegisterForm();

  const [role, setRole] = useState<"resident" | "landlord">("resident");

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watch("password"));
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      role,
    };
    console.log("submit data:", payload);

    try {
      const res = await registerApi(payload).unwrap();

      if (res) {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."
        );

        if (res.data?.email) {
          dispatch(setEmailVerify(res.data.email));
        }

        setTimeout(() => {
          navigate(config.verifyPath);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Register error:", err);

      const status = err?.status;
      const detailMessage = err?.data?.message;

      switch (status) {
        case 400:
          toast.error(
            detailMessage ||
              "Email đã được đăng ký! Vui lòng sử dụng email khác."
          );
          break;

        case 500:
          toast.error("Lỗi hệ thống (Server Error). Vui lòng thử lại sau!");
          break;

        default:
          toast.error(detailMessage || "Đăng ký thất bại. Vui lòng thử lại!");
          break;
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Tạo tài khoản mới
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("resident")}
                disabled={isLoading}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  role === "resident"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <User className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Người thuê</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("landlord")}
                disabled={isLoading}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  role === "landlord"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Home className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Chủ nhà</div>
              </button>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Tên đầy đủ
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  {...nameRegister}
                  placeholder="Nhập tên đầy đủ của bạn"
                  disabled={isLoading}
                  className={`pl-10 h-11 ${
                    errors.fullName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  } ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  disabled={isLoading}
                  className={`pl-10 h-11 ${
                    isLoading ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                  {...emailRegister}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  disabled={isLoading}
                  className={`pl-10 pr-10 h-11 ${
                    isLoading ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                  {...passwordRegister}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}

              {watch("password") && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  disabled={isLoading}
                  className={`pl-10 pr-10 h-11 ${
                    isLoading ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                  {...confirmPasswordRegister}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              Bạn đã có tài khoản?{" "}
              <Link
                to={config.loginPath}
                className={`text-blue-600 hover:underline ${
                  isLoading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
