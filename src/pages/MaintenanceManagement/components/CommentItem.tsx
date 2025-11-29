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
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/services/maintenance/maintenance.service";
import { toast } from "sonner";
import { Loader2, Edit2, Trash2, X, Check, MoreVertical } from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
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

interface CommentItemProps {
  comment: ITimeline;
  maintenanceId: string;
}

export const CommentItem = ({ comment, maintenanceId }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const formatDate = useFormatDate();
  const { userInfo } = useSelector((state: any) => state.auth);

  // Kiểm tra xem comment có phải của user hiện tại không
  const isOwnComment = comment.by._id === userInfo?._id;

  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      note: comment.note || "",
    },
  });

  const handleUpdate = async (data: CommentFormValues) => {
    try {
      await updateComment({
        id: maintenanceId,
        commentId: comment._id,
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
        commentId: comment._id,
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
    form.reset({ note: comment.note || "" });
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

  const userName = comment.by.userInfo?.fullName || "Hệ thống";

  if (isEditing) {
    return (
      <div className={`flex ${isOwnComment ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[75%] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-sm">
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
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex items-end gap-2 ${
          isOwnComment ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar - chỉ hiển thị bên trái cho người thuê, bên phải cho chủ trọ */}
        <Avatar
          className={`h-9 w-9 shrink-0 border-2 ${
            isOwnComment
              ? "border-blue-200 dark:border-blue-800"
              : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <AvatarImage src={undefined} alt={userName} />
          <AvatarFallback
            className={`text-xs font-semibold ${
              isOwnComment
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                : "bg-gradient-to-br from-slate-400 to-slate-500 text-white"
            }`}
          >
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Message Bubble */}
        <div
          className={`flex flex-col max-w-[75%] ${
            isOwnComment ? "items-end" : "items-start"
          }`}
        >
          {/* User Info & Time */}
          <div
            className={`flex items-center gap-2 mb-1 px-1 ${
              isOwnComment ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <p
              className={`text-xs font-medium ${
                isOwnComment
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {userName}
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formatDate(comment.at)}
            </span>
          </div>

          {/* Message Content */}
          <div className="flex items-center gap-2">
          {isOwnComment && (
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
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
            </div>
          )}

          <div className="relative group">
            <div
              className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                isOwnComment
                  ? "bg-blue-500 text-white rounded-tr-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm"
              }`}
            >
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  isOwnComment
                    ? "text-white"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {comment.note}
              </p>
            </div>
          </div>
          </div>
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
