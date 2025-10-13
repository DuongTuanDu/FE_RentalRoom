import { Package, Check, Sparkles } from "lucide-react";
import { useGetPackageServicesQuery } from "@/services/package-services/package-services.service";
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
import { useState } from "react";
import type { IPackage } from "@/types/package-services";

const ServiceManageLandlord = () => {
  const formatPrice = useFormatPrice();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const { data, isLoading } = useGetPackageServicesQuery();

  const handleSelectPackage = (pkg: IPackage) => {
    setSelectedPackage(pkg._id);
    console.log("Selected package:", pkg);
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Chọn gói dịch vụ phù hợp
          </h1>
          <p className="text-muted-foreground">
            Nâng cao hiệu quả quản lý với các gói dịch vụ linh hoạt, phù hợp với
            quy mô kinh doanh của bạn
          </p>
        </div>

        {/* Packages Grid */}
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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {data.data.map((pkg) => {
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
                        {formatPrice(Math.round(pkg.price / pkg.durationDays))}
                        /ngày
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-6">
                    {/* Features List */}
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
                          <p className="text-sm font-medium">Hỗ trợ 24/7</p>
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

                  {/* CTA Button */}
                  <div className="px-6">
                    <Button
                      onClick={() => handleSelectPackage(pkg)}
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
        )}
      </div>
    </div>
  );
};

export default ServiceManageLandlord;
