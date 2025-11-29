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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuildingSelectCombobox } from "../../FloorManageLandlord/components/BuildingSelectCombobox";
import type { IRevenue, IRevenueRequest } from "@/types/revenue";
import { Loader2, Upload, X } from "lucide-react";

const revenueSchema = z.object({
  buildingId: z.string().min(1, "Vui lòng chọn tòa nhà"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  description: z.string().optional(),
  type: z.enum(["revenue", "expenditure"]),
  amount: z.number().min(0, "Số tiền phải lớn hơn hoặc bằng 0"),
  recordedAt: z.string().min(1, "Vui lòng chọn ngày ghi nhận"),
});

const updateRevenueSchema = revenueSchema.omit({ buildingId: true });

type RevenueFormValues = z.infer<typeof revenueSchema>;
type UpdateRevenueFormValues = z.infer<typeof updateRevenueSchema>;

interface ModalRevenueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenue: IRevenue | null;
  onSubmit: (data: IRevenueRequest) => void;
  isLoading?: boolean;
}

export const ModalRevenue = ({
  open,
  onOpenChange,
  revenue,
  onSubmit,
  isLoading = false,
}: ModalRevenueProps) => {
  const isEditMode = !!revenue;
  const schema = isEditMode ? updateRevenueSchema : revenueSchema;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<RevenueFormValues | UpdateRevenueFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      buildingId: "",
      title: "",
      description: "",
      type: "revenue",
      amount: 0,
      recordedAt: "",
    },
  });

  useEffect(() => {
    if (open && revenue) {
      // Format recordedAt từ ISO string sang datetime-local format
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
        title: revenue.title,
        description: revenue.description || "",
        type: revenue.type,
        amount: revenue.amount,
        recordedAt: formatDateTimeLocal(revenue.recordedAt),
      });
      setExistingImages(revenue.images || []);
      setSelectedFiles([]);
    } else if (open && !revenue) {
      form.reset({
        buildingId: "",
        title: "",
        description: "",
        type: "revenue",
        amount: 0,
        recordedAt: "",
      });
      setExistingImages([]);
      setSelectedFiles([]);
    }
  }, [open, revenue, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: RevenueFormValues | UpdateRevenueFormValues) => {
    // If there are images, create FormData for file upload
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      
      if (!isEditMode) {
        formData.append("buildingId", (data as RevenueFormValues).buildingId);
      }
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("type", data.type);
      formData.append("amount", data.amount.toString());
      formData.append("recordedAt", data.recordedAt);
      
      // Append images
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      onSubmit(formData as any);
    } else {
      // No images, send regular object
      const submitData: IRevenueRequest = {
        ...(isEditMode ? {} : { buildingId: (data as RevenueFormValues).buildingId }),
        title: data.title,
        description: data.description || "",
        type: data.type,
        amount: data.amount,
        recordedAt: data.recordedAt,
        images: [],
      };
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setSelectedFiles([]);
      setExistingImages([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Cập nhật thu chi" : "Thêm thu chi mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin thu chi"
              : "Ghi nhận khoản thu hoặc chi mới cho tòa nhà"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!isEditMode && (
              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tòa nhà *</FormLabel>
                    <FormControl>
                      <BuildingSelectCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả..."
                      rows={4}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="revenue">Thu</SelectItem>
                        <SelectItem value="expenditure">Chi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền *</FormLabel>
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
              name="recordedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày ghi nhận *</FormLabel>
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

            {/* Images Upload */}
            <div className="space-y-2">
              <FormLabel>Hình ảnh (tùy chọn)</FormLabel>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="revenue-image-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="revenue-image-upload"
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">
                      Ảnh mới đã chọn ({selectedFiles.length})
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                      disabled={isLoading}
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative overflow-hidden rounded-md border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">
                    Ảnh hiện tại ({existingImages.length})
                  </FormLabel>
                  <div className="grid grid-cols-4 gap-3">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square relative overflow-hidden rounded-md border">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ảnh hiện tại sẽ được giữ nguyên. Chọn ảnh mới để thêm vào.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

