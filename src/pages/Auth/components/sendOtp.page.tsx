import config from "@/config/config";
import {
  useSentOTPMutation,
  useVerifyOTPMutation,
} from "@/services/auth/auth.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

const SendOtp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [sendOtp, { isLoading }] = useSentOTPMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const type = "register";
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    if (!email) {
      return "Vui lòng nhập email!";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ!";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    try {
      console.log("Sending OTP to:", email);
      const res = await sendOtp({ email, type }).unwrap();
      console.log("res", res);
      if (res.message === "OTP đã được gửi để đăng ký!") {
        setIsModalOpen(true);
        setOtpValue("");
        setOtpError("");
      }
    } catch (error) {
      console.log("Error:", error);
      setError("Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại!");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Vui lòng nhập đầy đủ 6 số OTP!");
      return;
    }

    setOtpError("");

    try {
      const res = await verifyOtp({
        email,
        type,
        otp: otpValue,
      }).unwrap();

      if (res.message === "OTP xác thực thành công!") {
        setIsModalOpen(false);
        navigate(config.registerPath);
        toast.success("Xác thực thành công!");
      }
    } catch (error) {
      console.log("OTP verification error:", error);
      setOtpError("Mã OTP không chính xác. Vui lòng thử lại!");
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOtp({ email, type }).unwrap();
      setOtpValue("");
      setOtpError("");
      // Có thể hiển thị toast "Đã gửi lại mã OTP"
    } catch (error) {
      console.log("Resend OTP error:", error);
      setOtpError("Có lỗi khi gửi lại mã OTP!");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOtpValue("");
    setOtpError("");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Xác thực Email
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Nhập email để nhận mã OTP
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                        error
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:border-blue-400 focus:ring-blue-500"
                      }`}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className={`w-5 h-5 ${
                          error ? "text-red-400" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 transform ${
                    isLoading || !email
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang gửi OTP...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Gửi mã OTP
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6">
              <div className="text-center text-sm text-gray-500">
                <p>Bạn sẽ nhận được mã OTP qua email trong vài phút</p>
                <p className="mt-1">
                  Không nhận được mã?
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    Gửi lại
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal OTP */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white shadow-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Xác thực mã OTP
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Nhập mã OTP gồm 6 số đã được gửi đến email của bạn
              <span className="block font-medium text-blue-600 mt-1">
                {email}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="space-y-4">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(value) => {
                  setOtpValue(value);
                  if (otpError) setOtpError("");
                }}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>

              {otpError && (
                <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {otpError}
                </p>
              )}
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Không nhận được mã?</p>
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-blue-600 hover:text-blue-700 font-medium mt-1"
                disabled={isLoading}
              >
                Gửi lại mã OTP
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isVerifying}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleVerifyOTP}
              disabled={isVerifying || otpValue.length !== 6}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang xác thực...
                </div>
              ) : (
                "Xác thực"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendOtp;
