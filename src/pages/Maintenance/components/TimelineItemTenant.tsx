import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useUpdateCommentTenantMutation,
  useDeleteCommentTenantMutation,
} from "@/services/maintenance/maintenance.service";
import { toast } from "sonner";
import { Loader2, Edit2, Trash2, X, Check, MoreVertical } from "lucide-react";
import type { ITimeline } from "@/types/maintenance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const commentSchema = z.object({
  note: z.string().min(1, "Ghi chú không được để trống"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface TimelineItemTenantProps {
  item: ITimeline;
  maintenanceId: string;
  dotColor: string;
  formatTimelineDate: (dateString: string) => string;
}

export const TimelineItemTenant = ({
  item,
  maintenanceId,
  dotColor,
  formatTimelineDate,
}: TimelineItemTenantProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { userInfo } = useSelector((state: any) => state.auth);

  // Kiểm tra xem comment có phải của user hiện tại không
  const isOwnComment = item.by._id === userInfo?._id;

  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentTenantMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentTenantMutation();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      note: item.note || "",
    },
  });

  const handleUpdate = async (data: CommentFormValues) => {
    try {
      await updateComment({
        id: maintenanceId,
        commentId: item._id,
        data: { note: data.note },
      }).unwrap();

      toast.success("Thành công", {
        description: "Cập nhật bình luận thành công",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message ||
          "Không thể cập nhật bình luận. Vui lòng thử lại",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment({
        id: maintenanceId,
        commentId: item._id,
      }).unwrap();

      toast.success("Thành công", {
        description: "Xóa bình luận thành công",
      });

      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message ||
          "Không thể xóa bình luận. Vui lòng thử lại",
      });
    }
  };

  const handleCancelEdit = () => {
    form.reset({ note: item.note || "" });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = item.by.userInfo?.fullName || item.by.email || "Hệ thống";
  // Kiểm tra xem có phải comment không - nếu có note thì đó là comment
  const isComment = !!(item.note && item.note.trim().length > 0) || 
                    item.action?.toLowerCase().includes("bình luận") || 
                    item.action?.toLowerCase().includes("comment");

  return (
    <>
      <div className="relative flex items-start gap-4">
        {/* Timeline dot */}
        <div className={`absolute left-[-23px] top-1 w-3 h-3 rounded-full ${dotColor} z-10 border-2 border-white dark:border-slate-900`}></div>
        
        {/* Avatar */}
        {isComment && (
          <Avatar className="h-8 w-8 shrink-0 border-2 border-slate-200 dark:border-slate-700">
            <AvatarImage src={undefined} alt={userName} />
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-slate-400 to-slate-500 text-white">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {item.action}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {formatTimelineDate(item.at)}
              </span>
            </div>
          </div>
          
          {item.note && (
            <div className="mt-2 ml-0 flex items-start gap-2">
              {isEditing ? (
                /* Edit Form - chỉ thay thế bubble comment */
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3 shadow-sm">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleUpdate)}
                      className="space-y-3"
                    >
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Nhập bình luận của bạn..."
                                rows={3}
                                className="resize-none"
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
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Hủy
                        </Button>
                        <Button type="submit" size="sm" disabled={isUpdating}>
                          {isUpdating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Lưu
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : (
                <>
                  <div className="inline-block bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 max-w-full flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {item.note}
                    </p>
                  </div>
                  {/* Nút sửa/xóa bên cạnh bubble comment */}
                  {isComment && isOwnComment && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full shrink-0"
                          title="Tùy chọn"
                        >
                          <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setIsEditing(true)}
                          disabled={isDeleting}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsDeleteDialogOpen(true)}
                          disabled={isDeleting}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

