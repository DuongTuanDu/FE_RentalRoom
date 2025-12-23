import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Loader2 } from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useGetUtilityReadingDetailQuery } from "@/services/utility/utility.service";
import { useRoomActiveContractQuery } from "@/services/room/room.service";
import type { IUtilityItem } from "@/types/utility";

interface DetailUtilitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utilityId: string | null;
}

export const DetailUtilitySheet = ({
  open,
  onOpenChange,
  utilityId,
}: DetailUtilitySheetProps) => {
  const formatDate = useFormatDate();
  const { data: response, isLoading, isError } = useGetUtilityReadingDetailQuery(
    utilityId || "",
    {
      skip: !utilityId || !open,
    }
  );

  const utility: IUtilityItem | undefined = response?.data;

  // Lấy hợp đồng đang active của phòng để check wIndexType (byNumber / byPerson)
  const { data: roomActiveContract } = useRoomActiveContractQuery(
    utility?.roomId?._id || "",
    {
      skip: !utility?.roomId?._id || !open,
    }
  );

  // Check xem chỉ số nước tính theo đầu người hay theo số công tơ
  const isWaterByPerson =
    roomActiveContract?.contract?.wIndexType === "byPerson";

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Nháp", className: "bg-yellow-100 text-yellow-800" },
      confirmed: {
        label: "Đã xác nhận",
        className: "bg-blue-100 text-blue-800",
      },
      billed: {
        label: "Đã xuất hóa đơn",
        className: "bg-green-100 text-green-800",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };


  if (!utilityId) return null;

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Chi tiết chỉ số điện nước
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (isError || !response || !utility) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Chi tiết chỉ số điện nước
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 font-medium">
                Không thể tải thông tin chỉ số điện nước
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Chi tiết chỉ số điện nước
          </SheetTitle>
          <SheetDescription>
            Thông tin chi tiết về chỉ số điện nước
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-6 mt-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400 text-sm">Tòa nhà</Label>
                <p className="font-medium mt-1">
                  {utility.buildingId?.name || "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Phòng</Label>
                <p className="font-medium mt-1">
                  Phòng {utility.roomId?.roomNumber || "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Kỳ</Label>
                <p className="font-medium mt-1">
                  {utility.periodMonth}/{utility.periodYear}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Trạng thái</Label>
                <div className="mt-1">{getStatusBadge(utility.status)}</div>
              </div>
            </div>
          </div>

          {/* Electricity Reading Info */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Thông tin chỉ số điện
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400 text-sm">Chỉ số trước</Label>
                <p className="font-medium mt-1">
                  {utility.ePreviousIndex != null
                    ? utility.ePreviousIndex.toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Chỉ số hiện tại</Label>
                <p className="font-medium mt-1 text-lg">
                  {utility.eCurrentIndex != null
                    ? utility.eCurrentIndex.toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Tiêu thụ</Label>
                <p className="font-medium mt-1">
                  {utility.eConsumption != null
                    ? utility.eConsumption.toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Đơn giá</Label>
                <p className="font-medium mt-1">
                  {utility.eUnitPrice != null
                    ? `${utility.eUnitPrice.toLocaleString()} đ`
                    : "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Thành tiền</Label>
                <p className="font-bold text-lg mt-1 text-blue-600">
                  {utility.eAmount != null
                    ? `${utility.eAmount.toLocaleString()} đ`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Water Reading Info */}
          {!isWaterByPerson && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Thông tin chỉ số nước
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400 text-sm">Chỉ số trước</Label>
                  <p className="font-medium mt-1">
                    {utility.wPreviousIndex != null
                      ? utility.wPreviousIndex.toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Chỉ số hiện tại</Label>
                  <p className="font-medium mt-1 text-lg">
                    {utility.wCurrentIndex != null
                      ? utility.wCurrentIndex.toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Tiêu thụ</Label>
                  <p className="font-medium mt-1">
                    {utility.wConsumption != null
                      ? utility.wConsumption.toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Đơn giá</Label>
                  <p className="font-medium mt-1">
                    {utility.wUnitPrice != null
                      ? `${utility.wUnitPrice.toLocaleString()} đ`
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Thành tiền</Label>
                  <p className="font-bold text-lg mt-1 text-blue-600">
                    {utility.wAmount != null
                      ? `${utility.wAmount.toLocaleString()} đ`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="text-slate-400 text-sm">Tổng thành tiền</Label>
              <p className="font-bold text-xl mt-1 text-blue-600">
                {(
                  (utility.eAmount || 0) + 
                  (isWaterByPerson ? 0 : (utility.wAmount || 0))
                ).toLocaleString()} đ
              </p>
            </div>
          </div>

          {/* Status and Dates */}
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400 text-sm">Ngày đọc chỉ số</Label>
                <p className="font-medium mt-1">
                  {utility.readingDate
                    ? formatDate(utility.readingDate)
                    : "—"}
                </p>
              </div>
              {utility.confirmedAt && (
                <div>
                  <Label className="text-slate-400 text-sm">Ngày xác nhận</Label>
                  <p className="font-medium mt-1">
                    {formatDate(utility.confirmedAt)}
                  </p>
                </div>
              )}
              {utility.createdAt && (
                <div>
                  <Label className="text-slate-400 text-sm">Ngày tạo</Label>
                  <p className="font-medium mt-1">
                    {formatDate(utility.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

