import {
  Package,
  Check,
  Sparkles,
  CreditCard,
  X,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useGetPackageServicesQuery } from "@/services/package-services/package-services.service";
import {
  useBuySubscriptionMutation,
  useGetMySubscriptionsQuery,
  useStartTrialSubscriptionMutation,
} from "@/services/package-services/package-subscription.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useEffect, useState } from "react";
import type { IPackage } from "@/types/package-services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ServiceActionsGuide } from "./ServiceActionsGuide";

const ServiceManageLandlord = () => {
  const formatPrice = useFormatPrice();
  const [selectedPackage, setSelectedPackage] = useState<IPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetPackageServicesQuery();
  const { data: mySubscriptions } = useGetMySubscriptionsQuery();
  const activeSubscription = mySubscriptions?.find(
    (sub) => sub.status === "active"
  );
  const upcomingSubscription = mySubscriptions?.find(
    (sub) => sub.status === "upcoming"
  );
  const hasActiveOrUpcoming = !!activeSubscription || !!upcomingSubscription;
  const [buySubscription, { isLoading: isBuying }] =
    useBuySubscriptionMutation();
  const [useTrialSubscription, { isLoading: isStartingTrial }] =
    useStartTrialSubscriptionMutation();
  const [isRiskConfirmOpen, setIsRiskConfirmOpen] = useState(false);

  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const trialPackage = data?.data?.find((pkg) => pkg.price === 0);
  const paidPackages = data?.data?.filter((pkg) => pkg.price > 0) || [];

  useEffect(() => {
    const usedTrial =
      mySubscriptions?.some((sub) => sub.isTrial === true) ?? false;
    setHasUsedTrial(usedTrial);

    const paidSub =
      mySubscriptions?.some((sub) => sub.isTrial === false) ?? false;
    setHasPaid(paidSub);
  }, [mySubscriptions]);

  const handleOpenModal = (pkg: IPackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const handleConfirmTrial = async () => {
    if (!selectedPackage) return;

    try {
      const response = await useTrialSubscription().unwrap();
      if (response.success) {
        toast.success("Kích hoạt gói dùng thử thành công!", {
          description: "Bạn có thể bắt đầu sử dụng các tính năng ngay bây giờ.",
        });
        handleCloseModal();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      toast.error(
        "Có lỗi xảy ra khi kích hoạt dùng thử, Vui lòng thử lại sau."
      );
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPackage) return;

    if (hasActiveOrUpcoming) {
      setIsRiskConfirmOpen(true);
      return;
    }

    try {
      const response = await buySubscription({
        packageId: selectedPackage._id,
      }).unwrap();
      console.log("Mua gói thành công:", response);

      if (selectedPackage.price === 0) {
        toast.success("Kích hoạt gói dùng thử thành công!", {
          description: "Bạn có thể bắt đầu sử dụng các tính năng ngay bây giờ.",
        });
        handleCloseModal();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (response.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error("Không lấy được URL thanh toán", {
          description: "Vui lòng thử lại sau.",
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi mua gói:", error);
      toast.error("Có lỗi xảy ra khi thanh toán", {
        description:
          error?.data?.message || error?.message || "Vui lòng thử lại sau.",
      });
    }
  };

  const handleActivateTrial = () => {
    if (trialPackage) {
      handleOpenModal(trialPackage);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Chọn gói dịch vụ phù hợp
          </h1>
          <p className="text-muted-foreground">
            Nâng cao hiệu quả quản lý với các gói dịch vụ linh hoạt, phù hợp với
            quy mô kinh doanh của bạn
          </p>
        </div>

        <ServiceActionsGuide />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-20 space-y-3">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Chưa có gói dịch vụ nào
              </p>
              <p className="text-sm text-muted-foreground">
                Vui lòng quay lại sau
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {trialPackage && !hasUsedTrial && !hasPaid && (
              <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">
                            {trialPackage.name}
                          </h3>
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            Miễn phí
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {trialPackage.description ||
                            "Dùng thử miễn phí các tính năng cơ bản"}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-blue-600" />
                            <span>
                              Quản lý tối đa {trialPackage.roomLimit} phòng
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-blue-600" />
                            <span>
                              Sử dụng {trialPackage.durationDays} ngày
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-blue-600" />
                            <span>Không cần thanh toán</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleActivateTrial}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Dùng thử ngay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {paidPackages.length > 0 && (
              <>
                <div className="space-y-2 pt-4">
                  <h2 className="text-2xl font-bold">Gói dịch vụ trả phí</h2>
                  <p className="text-muted-foreground">
                    Chọn gói phù hợp để mở khóa đầy đủ tính năng
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                  {paidPackages.map((pkg) => {
                    return (
                      <Card
                        key={pkg._id}
                        className="relative flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-2xl hover:shadow-indigo-100 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-2xl"
                      >
                        <CardHeader className="space-y-4 pb-8">
                          <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold">
                              {pkg.name}
                            </CardTitle>
                            <CardDescription className="text-sm min-h-[40px]">
                              {pkg.description ||
                                "Gói dịch vụ chất lượng cho chủ nhà"}
                            </CardDescription>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                                {formatPrice(pkg.price)}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                / {pkg.durationDays} ngày
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ≈{" "}
                              {formatPrice(
                                Math.round(pkg.price / pkg.durationDays)
                              )}
                              /ngày
                            </p>
                          </div>
                        </CardHeader>

                        <CardContent className="flex-1 space-y-6">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                <Check className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  Quản lý tối đa {pkg.roomLimit} phòng
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Phù hợp với quy mô kinh doanh của bạn
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                <Check className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  Sử dụng trong {pkg.durationDays} ngày
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Thời hạn linh hoạt theo nhu cầu
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                <Check className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  Hỗ trợ 24/7
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Đội ngũ hỗ trợ luôn sẵn sàng
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                <Check className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  Báo cáo chi tiết
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Theo dõi doanh thu và hiệu quả
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <div className="px-6 pb-6">
                          <Button
                            onClick={() => handleOpenModal(pkg)}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:brightness-110 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all rounded-xl"
                          >
                            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                            Chọn gói này
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              {selectedPackage?.price === 0
                ? "Kích hoạt gói dùng thử"
                : "Xác nhận mua gói dịch vụ"}
            </DialogTitle>
            <DialogDescription>
              {selectedPackage?.price === 0
                ? "Bạn sắp kích hoạt gói dùng thử miễn phí"
                : "Vui lòng xem lại thông tin gói dịch vụ trước khi thanh toán"}
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-6 py-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 space-y-4 border border-blue-100">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedPackage.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPackage.description}
                    </p>
                  </div>
                  <Badge
                    className={
                      selectedPackage.price === 0
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                    }
                  >
                    {selectedPackage.price === 0 ? "Miễn phí" : "Phổ biến"}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  {selectedPackage.price === 0 ? (
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                      Miễn phí
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                        {formatPrice(selectedPackage.price)}
                      </span>
                      <span className="text-gray-600">
                        / {selectedPackage.durationDays} ngày
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Quyền lợi của gói:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Quản lý tối đa {selectedPackage.roomLimit} phòng
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Thời hạn sử dụng {selectedPackage.durationDays} ngày
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Hỗ trợ khách hàng 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPackage.price > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Lưu ý:</span> Sau khi bấm
                    thanh toán, bạn sẽ được chuyển đến cổng thanh toán VNPay để
                    hoàn tất giao dịch.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isBuying}
              className="w-full sm:w-auto mr-2"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy bỏ
            </Button>
            <Button
              onClick={
                selectedPackage?.price === 0
                  ? handleConfirmTrial
                  : handleConfirmPayment
              }
              disabled={isBuying}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isBuying ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {selectedPackage?.price === 0 ? (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Kích hoạt ngay
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Thanh toán ngay
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRiskConfirmOpen} onOpenChange={setIsRiskConfirmOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <AlertCircle className="h-7 w-7 text-orange-500" />
              Không thể mua gói mới
            </DialogTitle>
            <DialogDescription className="text-base">
              Bạn hiện đang có gói dịch vụ đang hoạt động hoặc đã được gia hạn .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {activeSubscription && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold">Gói đang hoạt động</span>
                </div>
                <div className="ml-7 space-y-1 text-sm">
                  <p>
                    <strong>{activeSubscription.packageId.name}</strong>
                  </p>
                  <p className="text-amber-700">
                    Bắt đầu:{" "}
                    {new Date(activeSubscription.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p className="text-amber-700">
                    Hết hạn:{" "}
                    {new Date(activeSubscription.endDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>
            )}

            {upcomingSubscription && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Gói đã gia hạn</span>
                </div>
                <div className="ml-7 space-y-1 text-sm">
                  <p>
                    <strong>{upcomingSubscription.packageId.name}</strong>
                  </p>
                  <p className="text-blue-700">
                    Bắt đầu:{" "}
                    {new Date(
                      upcomingSubscription.startDate
                    ).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-blue-700">
                    Hết hạn:{" "}
                    {new Date(upcomingSubscription.endDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Yêu cầu:</p>
                  <p>
                    Để mua gói dịch vụ mới, bạn cần{" "}
                    <strong>hủy gói hiện tại</strong> hoặc{" "}
                    <strong>hủy gia hạn tự động</strong> trước.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="!gap-3">
            <Button
              variant="outline"
              onClick={() => setIsRiskConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Đóng
            </Button>

            <Button asChild className="gap-2">
              <Link to="/landlord/history-subscription">
                <Package className="h-4 w-4" />
                Xem lịch sử gói dịch vụ
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManageLandlord;
