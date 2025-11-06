import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateCommentMutation } from "@/services/maintenance/maintenance.service";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

const commentSchema = z.object({
  note: z.string().min(1, "Ghi chú không được để trống"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CreateCommentFormProps {
  maintenanceId: string;
}

export const CreateCommentForm = ({
  maintenanceId,
}: CreateCommentFormProps) => {
  const [createComment, { isLoading }] = useCreateCommentMutation();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      note: "",
    },
  });

  const handleSubmit = async (data: CommentFormValues) => {
    try {
      await createComment({
        id: maintenanceId,
        data: { note: data.note },
      }).unwrap();

      toast.success("Thành công", {
        description: "Thêm bình luận thành công",
      });

      form.reset();
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message ||
          "Không thể thêm bình luận. Vui lòng thử lại",
      });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bình luận</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập bình luận của bạn..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Gửi bình luận
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

