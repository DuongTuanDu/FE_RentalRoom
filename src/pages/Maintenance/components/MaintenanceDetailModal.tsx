import {
  useGetMaintenanceTenantDetailsQuery,
  useCreateCommentTenantMutation,
} from "@/services/maintenance/maintenance.service";
import type { ICategory } from "@/types/maintenance";
import { CommentItemTenant } from "./CommentItemTenant";

const getCategoryLabel = (category: ICategory): string => {
  const labels: Record<ICategory, string> = {
    furniture: "Đồ nội thất",
    electrical: "Điện, ổ cắm, đèn",
    plumbing: "Nước, vòi, bồn rửa, toilet",
    air_conditioning: "Điều hòa",
    door_lock: "Khóa cửa, chìa khóa",
    wall_ceiling: "Tường, trần nhà, sơn, nứt",
    flooring: "Sàn gỗ, gạch",
    windows: "Cửa sổ, kính",
    appliances: "Tủ lạnh, máy giặt, lò vi sóng...",
    internet_wifi: "Mạng internet",
    pest_control: "Diệt côn trùng",
    cleaning: "Vệ sinh",
    safety: "Bình chữa cháy, báo khói",
    other: "Khác",
  };
  return labels[category] || category;
};
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  User,
  Calendar,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const commentSchema = z.object({
  note: z.string().min(1, "Vui lòng nhập bình luận"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface MaintenanceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceId: string | null;
}

export const MaintenanceDetailModal = ({
  open,
  onOpenChange,
  maintenanceId,
}: MaintenanceDetailModalProps) => {
  const [createComment, { isLoading: isCreatingComment }] =
    useCreateCommentTenantMutation();
  const { data, isLoading, error } = useGetMaintenanceTenantDetailsQuery(
    maintenanceId ?? "",
    { skip: !maintenanceId || !open }
  );
  const formatDate = useFormatDate();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      note: "",
    },
  });

  const onSubmitComment = async (values: CommentFormValues) => {
    if (!maintenanceId) return;
    try {
      await createComment({
        id: maintenanceId as string,
        data: { note: values.note },
      }).unwrap();
      form.reset();
      toast.success("Đã thêm bình luận thành công");
    } catch (error: any) {
      toast.error(error?.message?.message || "Thêm bình luận thất bại");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      open: "Mới tạo",
      in_progress: "Đang xử lý",
      resolved: "Đã giải quyết",
      rejected: "Từ chối",
    };

    const icons: Record<string, React.ReactNode> = {
      open: <AlertCircle className="h-3 w-3" />,
      in_progress: <Clock className="h-3 w-3" />,
      resolved: <CheckCircle2 className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
    };

    return (
      <Badge variant={variants[status] || "default"} className="gap-1">
        {icons[status]}
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      medium:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };

    const labels: Record<string, string> = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
      urgent: "Khẩn cấp",
    };

    return (
      <Badge className={colors[priority] || "bg-gray-100 text-gray-700"}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  if (!maintenanceId) return null;

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Chi tiết yêu cầu bảo trì
            </SheetTitle>
            <SheetDescription>
              Đang tải thông tin chi tiết...
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="h-8 w-8" />
              <p className="text-muted-foreground">Đang tải chi tiết...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error || !data?.data) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Chi tiết yêu cầu bảo trì
            </SheetTitle>
            <SheetDescription>
              Không thể tải thông tin chi tiết
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive font-medium mb-2">
                Không thể tải chi tiết yêu cầu
              </p>
              <p className="text-sm text-muted-foreground">
                Vui lòng thử lại sau
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const maintenance = data.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold mb-2">
                {maintenance.title}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-2">
                {getStatusBadge(maintenance.status)}
                {getPriorityBadge(maintenance.priority)}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {maintenance.furnitureId && (
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Đồ đạc:</span>
                  <span className="font-medium">{maintenance.furnitureId.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Danh mục:</span>
                <span className="font-medium">
                  {getCategoryLabel(maintenance.category)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Số lượng:</span>
                <span className="font-medium">{maintenance.affectedQuantity}</span>
              </div>
              {maintenance.assigneeAccountId && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Người xử lý:</span>
                  <span className="font-medium">
                    {maintenance.assigneeAccountId.userInfo?.fullName || "Chưa phân công"}
                  </span>
                </div>
              )}
              {(maintenance as any).repairCost !== null && (maintenance as any).repairCost !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Chi phí sửa chữa:</span>
                  <span className="font-medium">
                    {Number((maintenance as any).repairCost).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày tạo:</span>
                <span className="font-medium">
                  {formatDate(maintenance.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold">Mô tả</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              {maintenance.description}
            </p>
          </div>

          {/* Photos */}
          {maintenance.photos && maintenance.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Hình ảnh ({maintenance.photos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {maintenance.photos.map((photo) => (
                  <div
                    key={photo._id}
                    className="relative aspect-video rounded-lg overflow-hidden border"
                  >
                    <img
                      src={photo.url}
                      alt={photo.note || "Hình ảnh"}
                      className="w-full h-full object-cover"
                    />
                    {photo.note && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                        {photo.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          {(() => {
            const comments = maintenance.timeline?.filter((item) => item.note) || [];

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
                        <CommentItemTenant
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
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitComment)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Viết bình luận của bạn ở đây..."
                            rows={4}
                            className="resize-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.reset()}
                      disabled={isCreatingComment}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreatingComment}
                      size="sm"
                      className="min-w-[120px]"
                    >
                      {isCreatingComment ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Gửi bình luận
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

