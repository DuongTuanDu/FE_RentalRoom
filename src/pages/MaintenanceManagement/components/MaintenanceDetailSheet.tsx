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
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useGetMaintenanceDetailsQuery } from "@/services/maintenance/maintenance.service";
import { CreateCommentForm } from "./CreateCommentForm";
import { CommentItem } from "./CommentItem";
import { MessageSquare } from "lucide-react";

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
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {maintenance.buildingId.name || "—"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Phòng
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {maintenance.roomId.roomNumber || "—"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Nội thất
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {maintenance.furnitureId?.name || "—"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Chi phí sửa chữa
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {maintenance.repairCost ? `${maintenance.repairCost.toLocaleString("vi-VN")} VNĐ` : "—"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Người báo cáo
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {maintenance.reporterAccountId.userInfo.fullName || maintenance.reporterAccountId.email || "—"}
                </p>
              </div>
              {maintenance.assigneeAccountId && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Người được giao
                    </label>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                      {maintenance.assigneeAccountId.userInfo.fullName || maintenance.assigneeAccountId.email || "—"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>


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
                        alt={`Hình ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {(() => {
            const comments = maintenance.timeline;

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <MessageSquare className="w-4 h-4" />
                    Bình luận
                    {comments.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                        {comments.length}
                      </span>
                    )}
                  </div>
                </div>
                {comments.length > 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
                    <div className="space-y-2">
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment._id}
                          comment={comment}
                          maintenanceId={maintenance._id}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Chưa có bình luận nào
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Hãy là người đầu tiên bình luận về yêu cầu này
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Add Comment Section */}
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4" />
              Thêm bình luận mới
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
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
