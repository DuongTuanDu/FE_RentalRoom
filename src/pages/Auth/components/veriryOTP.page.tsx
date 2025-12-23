import config from "@/config/config";
import { useVerifyOTPMutation } from "@/services/auth/auth.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const VerifyOtp: React.FC = () => {
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const { emailVerify } = useSelector((state: any) => state.auth)

  const [verifyOtp, { isLoading }] = useVerifyOTPMutation();
  const navigate = useNavigate();
  const type = "register";

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Vui lòng nhập đầy đủ 6 số OTP!");
      return;
    }

    if (!emailVerify) {
      toast.error("Không tìm thấy email. Vui lòng thử lại!");
      navigate(-1);
      return;
    }

    setOtpError("");

    try {
      const res = await verifyOtp({
        email: emailVerify,
        type,
        otp: otpValue,
      }).unwrap();

      if (res.success === true && res.data) {
        toast.success("Xác thực thành công!");
        navigate(config.loginPath);
      }
    } catch (error: any) {
      console.log("OTP verification error:", error.message.message);
      setOtpError("Mã OTP không chính xác. Vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header với animation */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-10 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="text-center relative z-10">
              {/* Icon với animation */}
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm transform transition-transform hover:scale-110 duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">
                Xác thực mã OTP
              </h1>
              <p className="text-blue-100 text-base">
                Nhập mã OTP gồm 6 số đã được gửi đến email của bạn
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-6">
            <div className="space-y-8">
              {/* OTP Input Section */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700 block text-center">
                  Nhập mã xác thực
                </label>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(value) => {
                      setOtpValue(value);
                      if (otpError) setOtpError("");
                    }}
                  >
                    <InputOTPGroup className="gap-3">
                      <InputOTPSlot
                        index={0}
                        className="w-14 h-14 text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-14 h-14 text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-14 h-14 text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-14 h-14 text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-14 h-14 text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-14 h-14 text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Error Message */}
                {otpError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-shake">
                    <p className="text-red-600 text-sm text-center flex items-center justify-center gap-2">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      {otpError}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otpValue.length !== 6}
                  className={`w-full py-6 rounded-xl font-semibold text-base text-white transition-all duration-200 transform ${
                    isLoading || otpValue.length !== 6
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang xác thực...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 cursor-pointer">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Xác thực mã OTP
                    </div>
                  )}
                </Button>
              </div>

              {/* Info Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-700">Lưu ý:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Mã OTP có hiệu lực trong 5 phút</li>
                      <li>Kiểm tra cả hộp thư spam nếu không thấy email</li>
                      <li>Không chia sẻ mã OTP cho bất kỳ ai</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm text-gray-600 font-medium">
              Xác thực an toàn & bảo mật
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
