import { useState } from "react";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChangePasswordMutation } from "@/services/auth/auth.service";
import useValidateChangePasswordFormHook, { type IChangePasswordRequest } from "@/hooks/setting/useValidateChangePasswordForm.hook";
import { toast } from "sonner";
import { useGetProfileQuery } from "@/services/profile/profile.service";

const SettingLandlord = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const { data } = useGetProfileQuery();
  const role = data?.user.role;
  

  const {
    oldPasswordRegister,
    newPasswordRegister,
    confirmNewPasswordRegister,
    handleSubmit,
    errors,
    reset,
  } = useValidateChangePasswordFormHook();

  const onSubmit = async (data: IChangePasswordRequest) => {
    try {
      // Gọi API đổi mật khẩu
      const changePasswordResult = await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();

      if (changePasswordResult.message === "Thay đổi mật khẩu thành công!") {
        toast.success("Đổi mật khẩu thành công!");
        reset();
      }
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  return (
    <div className={`container mx-auto px-4 max-w-3xl ${role === "resident" ? "py-6" : ""}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cài đặt tài khoản
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý thông tin và bảo mật tài khoản của bạn
        </p>
      </div>


      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Đổi mật khẩu</CardTitle>
              <CardDescription>
                Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và thay đổi thường xuyên
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Mật khẩu cũ */}
            <div className="space-y-2">
              <Label htmlFor="oldPassword" className="text-sm font-medium">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="pl-10 pr-10"
                  {...oldPasswordRegister}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Mật khẩu mới <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  className="pl-10 pr-10"
                  {...newPasswordRegister}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.newPassword.message}
                </p>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  className="pl-10 pr-10"
                  {...confirmNewPasswordRegister}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            {/* Nút submit */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                {(isChangingPassword) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </div>
                ) : (
                  "Đổi mật khẩu"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Thông tin bảo mật */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Lưu ý bảo mật</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
              <span>Thay đổi mật khẩu định kỳ để tăng cường bảo mật</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Đăng xuất và đăng nhập lại sau khi đổi mật khẩu để đảm bảo bảo mật</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingLandlord;
