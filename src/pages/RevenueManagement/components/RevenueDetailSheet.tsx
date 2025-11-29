import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Building2,
  User,
  Calendar,
  Loader2,
  TrendingUp,
  TrendingDown,
  FileText,
  ImageIcon,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useGetRevenueDetailsQuery } from "@/services/revenue/revenue.service";

interface RevenueDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueId: string | null;
}

export const RevenueDetailSheet = ({
  open,
  onOpenChange,
  revenueId,
}: RevenueDetailSheetProps) => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();
  const { data: revenue, isLoading, isError } = useGetRevenueDetailsQuery(
    revenueId || "",
    { skip: !revenueId || !open }
  );

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
          <SheetHeader className="space-y-4 pb-6">
            <SheetTitle>Chi tiết thu chi</SheetTitle>
            <SheetDescription>Đang tải thông tin...</SheetDescription>
          </SheetHeader>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (isError || !revenue) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
          <SheetHeader className="space-y-4 pb-6">
            <SheetTitle>Chi tiết thu chi</SheetTitle>
            <SheetDescription>Không thể tải thông tin thu chi</SheetDescription>
          </SheetHeader>
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Không tìm thấy thông tin thu chi</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
        <SheetHeader className="space-y-4 pb-2 px-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  revenue.type === "revenue"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {revenue.type === "revenue" ? (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold">
                  {revenue.title}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={revenue.type === "revenue" ? "default" : "destructive"}
                  >
                    {revenue.type === "revenue" ? "Thu" : "Chi"}
                  </Badge>
                  <span className="text-lg font-semibold">
                    {formatPrice(revenue.amount)}
                  </span>
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Thông tin tòa nhà */}
          {revenue.buildingId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4" />
                Thông tin tòa nhà
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Tên tòa nhà
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {revenue.buildingId.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mô tả */}
          {revenue.description && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4" />
                Mô tả
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                  {revenue.description}
                </p>
              </div>
            </div>
          )}

          {/* Hình ảnh */}
          {revenue.images && revenue.images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <ImageIcon className="w-4 h-4" />
                Hình ảnh ({revenue.images.length})
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {revenue.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-lg border">
                        <img
                          src={imageUrl}
                          alt={`Hình ảnh ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => window.open(imageUrl, "_blank")}
                            className="text-white text-sm font-medium px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
                          >
                            Xem ảnh
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Thông tin chi tiết */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <DollarSign className="w-4 h-4" />
              Thông tin chi tiết
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Loại
                </label>
                <Badge
                  variant={revenue.type === "revenue" ? "default" : "destructive"}
                >
                  {revenue.type === "revenue" ? "Thu" : "Chi"}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Số tiền
                </label>
                <p
                  className={`text-base font-semibold ${
                    revenue.type === "revenue"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatPrice(revenue.amount)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Ngày ghi nhận
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(revenue.recordedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin người tạo */}
          {revenue.createBy && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4" />
                Người tạo
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Email
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {revenue.createBy.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin chủ nhà */}
          {revenue.landlordId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4" />
                Thông tin chủ nhà
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Email
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {revenue.landlordId.email}
                  </p>
                </div>
                {revenue.landlordId.userInfo && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Họ tên
                      </label>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {revenue.landlordId.userInfo.fullName}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Số điện thoại
                      </label>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {revenue.landlordId.userInfo.phoneNumber}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Thông tin hệ thống */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4" />
              Thông tin hệ thống
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Ngày tạo
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(revenue.createdAt)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(revenue.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
