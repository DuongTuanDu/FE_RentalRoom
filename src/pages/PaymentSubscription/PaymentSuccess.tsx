import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Calendar,
  CreditCard,
  Home,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useHandleVNPayReturnQuery } from "@/services/package-services/package-subscription.service";
import { toast } from "sonner";
import type { ISubscription } from "@/types/package-subscription";

interface PaymentStatus {
  isProcessing: boolean;
  success: boolean;
  message: string;
}

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    isProcessing: true,
    success: false,
    message: "",
  });
  const [subscriptionDetails, setSubscriptionDetails] =
    useState<ISubscription | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const vnpResponseCode = queryParams.get("vnp_ResponseCode");
  const vnpAmount = queryParams.get("vnp_Amount");
  const vnpOrderInfo = queryParams.get("vnp_OrderInfo");
  const vnpTransactionNo = queryParams.get("vnp_TransactionNo");
  const vnpTxnRef = queryParams.get("vnp_TxnRef");

  const paramsObject: Record<string, string> = {};
  queryParams.forEach((value, key) => {
    paramsObject[key] = value;
  });

  const {
    data: paymentResult,
    isLoading,
    isError,
    error,
  } = useHandleVNPayReturnQuery(
    { params: paramsObject },
    { skip: !vnpResponseCode }
  );

  useEffect(() => {
    const processPaymentResponse = async () => {
      try {
        if (!vnpResponseCode) {
          const storedSubscription = localStorage.getItem("pendingSubscription");
          if (storedSubscription) {
            try {
              const parsedSubscription = JSON.parse(storedSubscription);
              setSubscriptionDetails(parsedSubscription);
              setPaymentStatus({
                isProcessing: false,
                success: false,
                message: "Đang chờ thanh toán. Vui lòng hoàn tất thanh toán.",
              });
            } catch (err) {
              console.error("Error parsing stored subscription:", err);
            }
          } else {
            setPaymentStatus({
              isProcessing: false,
              success: false,
              message: "Không tìm thấy thông tin thanh toán.",
            });
          }
          return;
        }

        if (isLoading) {
          return;
        }

        if (isError) {
          console.error("Payment verification error:", error);
          handlePaymentError(vnpResponseCode);
          return;
        }

        if (paymentResult) {
          if (paymentResult.success && paymentResult.data) {
            // Backend trả về subscription details
            setSubscriptionDetails(paymentResult.data);
            setPaymentStatus({
              isProcessing: false,
              success: true,
              message:
                "Thanh toán thành công! Gói dịch vụ của bạn đã được kích hoạt.",
            });
            toast.success("Thanh toán thành công!");
            
            localStorage.removeItem("pendingSubscription");
          } else {
            handlePaymentError(vnpResponseCode);
          }
        }
      } catch (error) {
        console.error("Error processing payment response:", error);
        setPaymentStatus({
          isProcessing: false,
          success: false,
          message: "Đã xảy ra lỗi khi xử lý thông tin thanh toán.",
        });
        toast.error("Lỗi xử lý thanh toán");
      }
    };

    processPaymentResponse();
  }, [vnpResponseCode, isLoading, isError, paymentResult]);

  const handlePaymentError = (responseCode: string | null) => {
    let errorMessage =
      "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.";

    switch (responseCode) {
      case "00":
        errorMessage = "Thanh toán thành công!";
        setPaymentStatus({
          isProcessing: false,
          success: true,
          message: errorMessage,
        });
        break;
      case "24":
        errorMessage = "Giao dịch không thành công do khách hàng hủy giao dịch";
        break;
      case "09":
        errorMessage =
          "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking";
        break;
      case "10":
        errorMessage =
          "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
        break;
      case "11":
        errorMessage = "Đã hết hạn chờ thanh toán";
        break;
      case "12":
        errorMessage = "Thẻ/Tài khoản của khách hàng bị khóa";
        break;
      case "51":
        errorMessage = "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch";
        break;
      case "65":
        errorMessage =
          "Tài khoản của Quý khách đã vượt quá giới hạn giao dịch trong ngày";
        break;
      case "75":
        errorMessage = "Ngân hàng thanh toán đang bảo trì";
        break;
      case "79":
        errorMessage =
          "Giao dịch vượt quá số lần nhập sai mật khẩu. Tài khoản bị tạm khóa";
        break;
      default:
        errorMessage = `Thanh toán không thành công (Mã lỗi: ${responseCode})`;
    }

    setPaymentStatus({
      isProcessing: false,
      success: responseCode === "00",
      message: errorMessage,
    });

    if (responseCode !== "00") {
      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (paymentStatus.isProcessing) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  Đang xử lý thanh toán...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vui lòng không đóng trang này
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Status Card */}
        <Card
          className={
            paymentStatus.success
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {paymentStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  {paymentStatus.success
                    ? "Thanh toán thành công!"
                    : "Thanh toán thất bại"}
                </h3>
                <p className="text-sm text-muted-foreground">{paymentStatus.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {subscriptionDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Thông tin gói dịch vụ
              </CardTitle>
              <CardDescription>
                Chi tiết gói dịch vụ bạn đã đăng ký
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      {subscriptionDetails.packageId.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionDetails.packageId.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      subscriptionDetails.status === "active"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {subscriptionDetails.status === "active"
                      ? "Đang hoạt động"
                      : subscriptionDetails.status === "expired"
                      ? "Đã hết hạn"
                      : "Chờ thanh toán"}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Giới hạn phòng</span>
                  </div>
                  <span className="font-medium">
                    {subscriptionDetails.packageId.roomLimit} phòng
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Thời hạn</span>
                  </div>
                  <span className="font-medium">
                    {subscriptionDetails.packageId.durationDays} ngày
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày bắt đầu</span>
                  </div>
                  <span className="font-medium">
                    {formatDate(subscriptionDetails.startDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày kết thúc</span>
                  </div>
                  <span className="font-medium">
                    {formatDate(subscriptionDetails.endDate)}
                  </span>
                </div>

                {subscriptionDetails.status === "active" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Còn lại</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {calculateDaysRemaining(subscriptionDetails.endDate)} ngày
                    </Badge>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Số tiền thanh toán</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(subscriptionDetails.packageId.price)}
                  </span>
                </div>

                {(vnpTransactionNo || vnpTxnRef || subscriptionDetails.paymentId) && (
                  <>
                    <Separator />
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-sm">Thông tin giao dịch</h4>
                      <div className="space-y-1 text-sm">
                        {subscriptionDetails.paymentId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mã thanh toán:</span>
                            <span className="font-mono">
                              {subscriptionDetails.paymentId}
                            </span>
                          </div>
                        )}
                        {vnpTransactionNo && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Mã GD VNPay:
                            </span>
                            <span className="font-mono">{vnpTransactionNo}</span>
                          </div>
                        )}
                        {vnpTxnRef && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Mã tham chiếu:
                            </span>
                            <span className="font-mono">{vnpTxnRef}</span>
                          </div>
                        )}
                        {vnpAmount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Số tiền:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(parseInt(vnpAmount) / 100)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Phương thức:
                          </span>
                          <span className="font-medium">VNPay</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!subscriptionDetails && !paymentStatus.success && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Không tìm thấy thông tin gói dịch vụ
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ nếu bạn đã thanh toán
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!paymentStatus.success && (
            <Button
              variant="outline"
              onClick={() => navigate("/packages")}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Chọn gói khác
            </Button>
          )}
          <Button
            variant={paymentStatus.success ? "default" : "outline"}
            asChild
            className="gap-2"
          >
            <Link to="/landlord/history-subscription">
              <Package className="h-4 w-4" />
              Xem lịch sử gói dịch vụ
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>

        {paymentStatus.success && subscriptionDetails && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Lưu ý</h4>
                  <p className="text-sm text-muted-foreground">
                    Gói dịch vụ <strong>{subscriptionDetails.packageId.name}</strong> của bạn đã được kích hoạt và có hiệu lực từ{" "}
                    <strong>{formatDate(subscriptionDetails.startDate)}</strong> đến{" "}
                    <strong>{formatDate(subscriptionDetails.endDate)}</strong>.
                    Bạn có thể quản lý tối đa <strong>{subscriptionDetails.packageId.roomLimit} phòng</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;