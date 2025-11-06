import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateMaintenanceMutation } from "@/services/maintenance/maintenance.service";
import type { IMaintenanceItem, IMaintenanceRequest } from "@/types/maintenance";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const updateMaintenanceSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "rejected"]),
  assigneeAccountId: z.string().optional(),
  scheduledAt: z.string().optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  note: z.string().optional(),
});

type UpdateMaintenanceFormValues = z.infer<typeof updateMaintenanceSchema>;

interface UpdateMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenance: IMaintenanceItem | null;
}

export const UpdateMaintenanceDialog = ({
  open,
  onOpenChange,
  maintenance,
}: UpdateMaintenanceDialogProps) => {
  const [updateMaintenance, { isLoading }] = useUpdateMaintenanceMutation();

  const form = useForm<UpdateMaintenanceFormValues>({
    resolver: zodResolver(updateMaintenanceSchema),
    defaultValues: {
      status: "open",
      assigneeAccountId: "",
      scheduledAt: "",
      estimatedCost: 0,
      actualCost: 0,
      note: "",
    },
  });

  useEffect(() => {
    if (open && maintenance) {
      // Format scheduledAt từ ISO string sang datetime-local format
      const formatDateTimeLocal = (dateString?: string) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
          return "";
        }
      };

      form.reset({
        status: maintenance.status,
        assigneeAccountId: maintenance.assigneeAccountId?._id || "",
        scheduledAt: formatDateTimeLocal(maintenance.scheduledAt),
        estimatedCost: maintenance.estimatedCost || 0,
        actualCost: maintenance.actualCost || 0,
        note: "",
      });
    }
  }, [open, maintenance, form]);

  const handleSubmit = async (data: UpdateMaintenanceFormValues) => {
    if (!maintenance) return;

    try {
      const updateData: IMaintenanceRequest = {
        status: data.status,
        // assigneeAccountId: data.assigneeAccountId || "",
        scheduledAt: data.scheduledAt || "",
        estimatedCost: data.estimatedCost || 0,
        actualCost: data.actualCost || 0,
        note: data.note || "",
      };

      await updateMaintenance({
        id: maintenance._id,
        data: updateData,
      }).unwrap();

      toast.success("Thành công", {
        description: "Cập nhật yêu cầu sửa chữa thành công",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message ||
          "Không thể cập nhật yêu cầu. Vui lòng thử lại",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật yêu cầu sửa chữa</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và trạng thái của yêu cầu sửa chữa
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Mới</SelectItem>
                      <SelectItem value="in_progress">Đang xử lý</SelectItem>
                      <SelectItem value="resolved">Đã xử lý</SelectItem>
                      <SelectItem value="rejected">Đã từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="assigneeAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người được giao</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ID tài khoản người được giao"
                      {...field}
                    />
                  </FormControl>
                  {maintenance?.assigneeAccountId && (
                    <p className="text-xs text-slate-500 mt-1">
                      Hiện tại: {maintenance.assigneeAccountId.email}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lịch hẹn</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      placeholder="Chọn thời gian"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi phí dự kiến</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi phí thực tế</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập ghi chú..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

