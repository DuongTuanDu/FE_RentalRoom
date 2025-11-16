import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirstTimeChangePasswordMutation } from "@/services/staff/staff.service";
import { toast } from "sonner";

const FirstTimeChangePassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [changePassword, { isLoading: isSubmitting }] = useFirstTimeChangePasswordMutation();

  useEffect(() => {
    if (!token) {
      toast.error("Link không hợp lệ");
      navigate("/auth/login");
    }
  }, [token, navigate]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Ít nhất 8 ký tự");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Ít nhất 1 chữ hoa");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Ít nhất 1 chữ thường");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Ít nhất 1 số");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Ít nhất 1 ký tự đặc biệt");
    }
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(", ");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      toast.error("Link không hợp lệ");
      navigate("/auth/login");
      return;
    }

    try {
      await changePassword({
        token: token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }).unwrap();

      toast.success("Đổi mật khẩu thành công!", {
        description: "Bạn có thể đăng nhập ngay bây giờ",
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error: any) {
      const message = error?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Link không hợp lệ</h2>
              <p className="text-slate-600 mb-6">
                Link thiết lập mật khẩu đã hết hạn hoặc không tồn tại. Vui lòng liên hệ quản trị viên để được hỗ trợ.
              </p>
              <Button onClick={() => navigate("/auth/login")} className="bg-purple-600 hover:bg-purple-700">
                Quay lại đăng nhập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordErrors = formData.newPassword ? validatePassword(formData.newPassword) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Chào mừng Quản lý tòa nhà</CardTitle>
                <CardDescription className="mt-1">
                  Tài khoản của bạn đã được tạo. Vui lòng thiết lập mật khẩu để bắt đầu sử dụng hệ thống
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Yêu cầu mật khẩu:</strong> Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    className={`pl-10 pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500">{errors.newPassword}</p>
                )}
                
                {formData.newPassword && (
                  <div className="mt-2 text-xs text-red-600">
                    {[
                      { text: "Tối thiểu 8 ký tự", valid: formData.newPassword.length >= 8 },
                      { text: "bao gồm chữ hoa", valid: /[A-Z]/.test(formData.newPassword) },
                      { text: "chữ thường", valid: /[a-z]/.test(formData.newPassword) },
                      { text: "số", valid: /[0-9]/.test(formData.newPassword) },
                      { text: "và ký tự đặc biệt", valid: /[!@#$%^&*(),.?\":{}|<>]/.test(formData.newPassword) },
                    ]
                      .filter((req) => !req.valid)  
                      .map((req) => req.text)
                      .join(", ")
                    }
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || passwordErrors.length > 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang thiết lập...
                  </>
                ) : (
                  "Thiết lập mật khẩu"
                )}
              </Button>

              <div className="text-center text-sm text-slate-600">
                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className="text-blue-600 hover:text-purple-700 font-medium"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lưu ý bảo mật</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Link đổi mật khẩu chỉ sử dụng được một lần và có hiệu lực trong 24 giờ</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Mật khẩu mạnh giúp bảo vệ tài khoản khỏi các mối đe dọa bảo mật</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Không chia sẻ mật khẩu với bất kỳ ai</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Sau khi đổi mật khẩu, bạn có thể đăng nhập ngay với mật khẩu mới</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirstTimeChangePassword;