import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useResetPasswordMutation } from "@/services/auth/auth.service";
import { Eye, EyeOff, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import config from "@/config/config";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { emailVerify } = useSelector((state: any) => state.auth);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

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

  const validatePassword = (password: string) => {
    if (!password) {
      return "Vui lòng nhập mật khẩu mới!";
    }
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự!";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt!";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { newPassword?: string; confirmNewPassword?: string } = {};

    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    // Validate confirm password
    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = "Vui lòng xác nhận mật khẩu!";
    } else if (confirmNewPassword !== newPassword) {
      newErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const res = await resetPassword({
        email: emailVerify,
        newPassword,
        confirmNewPassword: confirmNewPassword,
      }).unwrap();

      if (res.status === true) {
        toast.success("Đặt lại mật khẩu thành công!", {
          description: "Bạn có thể đăng nhập với mật khẩu mới",
        });
        navigate(config.loginPath);
      }
    } catch (error: any) {
      console.log("Reset password error:", error);
      toast.error(error?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];
  const strengthLabels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];

  const passwordRequirements = [
    {
      label: "Ít nhất 8 ký tự",
      met: newPassword.length >= 8,
    },
    {
      label: "Chứa chữ hoa (A-Z)",
      met: /[A-Z]/.test(newPassword),
    },
    {
      label: "Chứa chữ thường (a-z)",
      met: /[a-z]/.test(newPassword),
    },
    {
      label: "Chứa số (0-9)",
      met: /\d/.test(newPassword),
    },
    {
      label: "Chứa ký tự đặc biệt (@$!%*?&)",
      met: /[@$!%*?&]/.test(newPassword),
    },
  ];

  const isFormValid =
    newPassword &&
    confirmNewPassword &&
    newPassword === confirmNewPassword &&
    passwordStrength >= 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with decorative background */}
          <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 px-8 py-10">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <KeyRound className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Tạo Mật Khẩu Mới
              </h1>
              <p className="text-purple-100 text-sm">
                Mật khẩu mạnh giúp bảo vệ tài khoản của bạn tốt hơn
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">
                  Mật khẩu mới
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound
                      className={`w-5 h-5 transition-colors ${
                        newPassword ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors((prev) => ({ ...prev, newPassword: "" }));
                      }
                    }}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.newPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100 group-hover:border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Bar */}
                {newPassword && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Độ mạnh mật khẩu</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength >= 4
                            ? "text-green-600"
                            : passwordStrength >= 3
                            ? "text-blue-600"
                            : passwordStrength >= 2
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {strengthLabels[passwordStrength - 1] || ""}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {errors.newPassword && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span>{errors.newPassword}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck
                      className={`w-5 h-5 transition-colors ${
                        confirmNewPassword && confirmNewPassword === newPassword
                          ? "text-green-500"
                          : confirmNewPassword
                          ? "text-gray-400"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (errors.confirmNewPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          confirmNewPassword: "",
                        }));
                      }
                    }}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.confirmNewPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : confirmNewPassword &&
                          confirmNewPassword === newPassword
                        ? "border-green-300 focus:border-green-500 focus:ring-green-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100 group-hover:border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {confirmNewPassword && confirmNewPassword === newPassword && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Mật khẩu khớp</span>
                  </div>
                )}

                {errors.confirmNewPassword && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span>{errors.confirmNewPassword}</span>
                  </div>
                )}
              </div>

              {/* Password Requirements Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Yêu cầu mật khẩu
                </p>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 text-sm transition-colors duration-200 ${
                        req.met ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                          req.met
                            ? "bg-green-100 scale-100"
                            : "bg-gray-200 scale-95"
                        }`}
                      >
                        {req.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        )}
                      </div>
                      <span className={req.met ? "font-medium" : ""}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-base transition-all duration-200 transform ${
                  isLoading || !isFormValid
                    ? "bg-gray-300 cursor-not-allowed scale-100"
                    : "bg-gradient-to-r from-blue-600  to-indigo-600 hover:from-blue-700  hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Xác nhận và Đặt lại Mật khẩu</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 border-t border-gray-100 pt-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Mật khẩu của bạn được mã hóa an toàn</span>
              </div>
              <p className="text-sm text-gray-600">
                Đã nhớ mật khẩu?{" "}
                <a
                  href={config.loginPath}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Đăng nhập ngay
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
