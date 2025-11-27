import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateMaintenanceMutation } from "@/services/maintenance/maintenance.service";
import type { IMaintenanceItem } from "@/types/maintenance";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

const updateMaintenanceSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "rejected"]),
  repairCost: z.number().min(0),
  note: z.string(),
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<UpdateMaintenanceFormValues>({
    resolver: zodResolver(updateMaintenanceSchema),
    defaultValues: {
      status: "open",
      repairCost: 0,
      note: "",
    },
  });

  useEffect(() => {
    if (open && maintenance) {
      form.reset({
        status: maintenance.status,
        repairCost: maintenance.repairCost || 0,
        note: "",
      });
      setSelectedFiles([]);
    }
  }, [open, maintenance, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: UpdateMaintenanceFormValues) => {
    if (!maintenance) return;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("status", data.status);
      formData.append("repairCost", data.repairCost.toString());
      formData.append("note", data.note);
      
      // Append images if any
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await updateMaintenance({
        id: maintenance._id,
        data: formData as any,
      }).unwrap();

      toast.success("Thành công", {
        description: "Cập nhật yêu cầu sửa chữa thành công",
      });

      setSelectedFiles([]);
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

            <FormField
              control={form.control}
              name="repairCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi phí sửa chữa *</FormLabel>
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

            {/* Images Upload */}
            <div className="space-y-2">
              <Label>Hình ảnh (tùy chọn)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="update-maintenance-image-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="update-maintenance-image-upload"
                  className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground text-center">
                    <p>Nhấp để chọn ảnh hoặc kéo thả vào đây</p>
                    <p className="text-xs">
                      Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB mỗi ảnh)
                    </p>
                  </div>
                </label>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border group"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

