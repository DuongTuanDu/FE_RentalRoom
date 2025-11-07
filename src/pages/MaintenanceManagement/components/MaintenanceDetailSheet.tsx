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
  Building2,
  User,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  Clock,
  DollarSign,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useGetMaintenanceDetailsQuery } from "@/services/maintenance/maintenance.service";
import { CreateCommentForm } from "./CreateCommentForm";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  open: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  rejected: "Đã từ chối",
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const PRIORITY_LABELS = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
};

interface MaintenanceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceId?: string;
}

export const MaintenanceDetailSheet = ({
  open,
  onOpenChange,
  maintenanceId,
}: MaintenanceDetailSheetProps) => {
  const formatDate = useFormatDate();

  const { data, isLoading, error } = useGetMaintenanceDetailsQuery(
    maintenanceId || "",
    { skip: !maintenanceId }
  );

  const maintenance = data?.data;

  if (!maintenanceId) return null;

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết yêu cầu sửa chữa</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error || !maintenance) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết yêu cầu sửa chữa</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 font-medium">
                Không thể tải thông tin yêu cầu
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
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div>
                <SheetTitle className="text-2xl font-bold">
                  {maintenance.title}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-4 mt-2">
                  <Badge
                    className={
                      STATUS_COLORS[
                        maintenance.status as keyof typeof STATUS_COLORS
                      ]
                    }
                  >
                    {
                      STATUS_LABELS[
                        maintenance.status as keyof typeof STATUS_LABELS
                      ]
                    }
                  </Badge>
                  <Badge
                    className={
                      PRIORITY_COLORS[
                        maintenance.priority as keyof typeof PRIORITY_COLORS
                      ]
                    }
                  >
                    {
                      PRIORITY_LABELS[
                        maintenance.priority as keyof typeof PRIORITY_LABELS
                      ]
                    }
                  </Badge>
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <AlertCircle className="w-4 h-4" />
              Thông tin cơ bản
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Tiêu đề
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {maintenance.title}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Mô tả
                </label>
                <p className="text-base text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {maintenance.description}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Số lượng bị ảnh hưởng
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {maintenance.affectedQuantity}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin liên quan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4" />
              Thông tin liên quan
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Tòa nhà
                </label>
                <div>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {maintenance.buildingId.name || "—"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {maintenance.buildingId.address || "—"}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Phòng
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {typeof maintenance.roomId === "object" && maintenance.roomId
                    ? maintenance.roomId.roomNumber
                    : "—"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Nội thất
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {typeof maintenance.furnitureId === "object" &&
                  maintenance.furnitureId
                    ? maintenance.furnitureId.name
                    : "—"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Người báo cáo
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {typeof maintenance.reporterAccountId === "object" &&
                  maintenance.reporterAccountId
                    ? maintenance.reporterAccountId.email
                    : "—"}
                </p>
              </div>
              {/* {maintenance.assigneeAccountId && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Người được giao
                    </label>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                      {maintenance.assigneeAccountId.email || "—"}
                    </p>
                  </div>
                </>
              )} */}
            </div>
          </div>

          {/* Thông tin xử lý */}
          {(maintenance.scheduledAt ||
            maintenance.estimatedCost !== undefined ||
            maintenance.actualCost !== undefined) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <DollarSign className="w-4 h-4" />
                Thông tin xử lý
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                {maintenance.scheduledAt && (
                  <>
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Lịch hẹn
                      </label>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {formatDate(maintenance.scheduledAt)}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}
                {maintenance.estimatedCost !== undefined && (
                  <>
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Chi phí dự kiến
                      </label>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {maintenance.estimatedCost.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                    {(maintenance.actualCost !== undefined && maintenance.actualCost > 0) && (
                      <Separator />
                    )}
                  </>
                )}
                {maintenance.actualCost !== undefined && maintenance.actualCost > 0 && (
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Chi phí thực tế
                    </label>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                      {maintenance.actualCost.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hình ảnh */}
          {maintenance.photos && maintenance.photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <ImageIcon className="w-4 h-4" />
                Hình ảnh
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {maintenance.photos.map((photo, index) => (
                    <div key={photo._id} className="space-y-2">
                      <img
                        src={photo.url}
                        alt={photo.note || `Hình ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {photo.note && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {photo.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {maintenance.timeline && maintenance.timeline.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4" />
                Lịch sử xử lý
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="space-y-4">
                  {maintenance.timeline.map((item, index) => (
                    <div key={item._id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        {index < maintenance.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-300 dark:bg-slate-700 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {item.action}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(item.at)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Bởi: {item.by.userInfo.fullName}
                        </p>
                        {item.note && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tạo comment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4" />
              Thêm bình luận
            </div>
            <CreateCommentForm maintenanceId={maintenance._id} />
          </div>

          {/* Metadata */}
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
                  {formatDate(maintenance.createdAt)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(maintenance.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
