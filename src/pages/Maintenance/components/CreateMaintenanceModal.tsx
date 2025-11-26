import { useState, useEffect } from "react";
import { useCreateMaintenanceMutation } from "@/services/maintenance/maintenance.service";
import { useGetMyRoomQuery } from "@/services/room/room.service";
import { uploadFile } from "@/helpers/cloudinary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Wrench, Upload, X, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import type { IMaintenanceCreateRequest } from "@/types/maintenance";

const maintenanceSchema = z.object({
  roomId: z.string().min(1, "Vui lòng chọn phòng"),
  furnitureId: z.string().min(1, "Vui lòng nhập hoặc chọn đồ đạc"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  affectedQuantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface CreateMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFurnitureId?: string;
}

export const CreateMaintenanceModal = ({
  open,
  onOpenChange,
  defaultFurnitureId,
}: CreateMaintenanceModalProps) => {
  const [createMaintenance, { isLoading }] = useCreateMaintenanceMutation();
  const { data: roomData } = useGetMyRoomQuery();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [furnitureComboboxOpen, setFurnitureComboboxOpen] = useState(false);
  const [furnitureInputValue, setFurnitureInputValue] = useState("");

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      roomId: "",
      furnitureId: "",
      title: "",
      description: "",
      priority: "medium",
      affectedQuantity: 1,
    },
  });

  // Set default roomId when room data is available
  useEffect(() => {
    if (roomData?.room && open) {
      form.setValue("roomId", roomData.room._id);
    }
  }, [roomData?.room, open, form]);

  // Set default furnitureId when provided
  useEffect(() => {
    if (defaultFurnitureId && open) {
      form.setValue("furnitureId", defaultFurnitureId);
    } else if (open && !defaultFurnitureId) {
      form.setValue("furnitureId", "");
    }
  }, [defaultFurnitureId, open, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: MaintenanceFormValues) => {
    try {
      setUploadingImages(true);

      // Upload images to Cloudinary
      const photos = await Promise.all(
        selectedFiles.map(async (file) => {
          const result = await uploadFile({ file, type: "customer" });
          return {
            url: result.secure_url,
            note: "",
          };
        })
      );

      const payload: IMaintenanceCreateRequest = {
        ...values,
        photos: photos.length > 0 ? photos : undefined,
      };

      await createMaintenance(payload).unwrap();
      toast.success("Tạo yêu cầu bảo trì thành công");
      form.reset();
      setSelectedFiles([]);
      setFurnitureInputValue("");
      setFurnitureComboboxOpen(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message?.message || "Tạo yêu cầu bảo trì thất bại");
      console.error(error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !uploadingImages) {
      form.reset();
      setSelectedFiles([]);
      setFurnitureInputValue("");
      setFurnitureComboboxOpen(false);
      onOpenChange(false);
    }
  };

  const furnitures = roomData?.furnitures || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Tạo yêu cầu bảo trì mới
          </DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo yêu cầu bảo trì cho đồ đạc trong phòng
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Room (read-only if user has room) */}
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng *</FormLabel>
                  <FormControl>
                    {roomData?.room ? (
                      <>
                        <Input
                          value={roomData.room.roomNumber || "N/A"}
                          disabled
                          className="bg-muted"
                        />
                        {/* Hidden input to store roomId */}
                        <input type="hidden" {...field} value={roomData.room._id} />
                      </>
                    ) : (
                      <Input placeholder="Chọn phòng" {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Furniture */}
            <FormField
              control={form.control}
              name="furnitureId"
              render={({ field }) => {
                const selectedFurniture = furnitures.find(
                  (f) => f._id === field.value
                );
                
                // Hiển thị tên furniture nếu đã chọn, hoặc giá trị tự do
                const displayValue = selectedFurniture
                  ? `${selectedFurniture.name} (${selectedFurniture.condition})`
                  : field.value || "";

                // Lọc danh sách furniture theo input
                const filteredFurnitures = furnitures.filter((f) =>
                  f.name.toLowerCase().includes(furnitureInputValue.toLowerCase())
                );

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Đồ đạc *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Nhập hoặc chọn đồ đạc cần bảo trì"
                          value={displayValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFurnitureInputValue(value);
                            field.onChange(value);
                            // Kiểm tra xem có khớp với furniture nào không
                            const matchedFurniture = furnitures.find(
                              (f) =>
                                f.name.toLowerCase() === value.toLowerCase() ||
                                `${f.name} (${f.condition})`.toLowerCase() === value.toLowerCase()
                            );
                            if (matchedFurniture) {
                              field.onChange(matchedFurniture._id);
                            } else {
                              // Cho phép nhập tự do
                              field.onChange(value);
                            }
                          }}
                          onFocus={() => {
                            setFurnitureComboboxOpen(true);
                            setFurnitureInputValue(displayValue);
                          }}
                          onBlur={() => {
                            // Đóng dropdown khi blur, nhưng delay để cho phép click vào item
                            setTimeout(() => {
                              // Kiểm tra xem element mới focus có phải là item trong dropdown không
                              const activeElement = document.activeElement;
                              if (!activeElement?.closest('.furniture-dropdown')) {
                                setFurnitureComboboxOpen(false);
                                setFurnitureInputValue("");
                              }
                            }, 200);
                          }}
                        />
                        <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                        
                        {/* Dropdown list */}
                        {furnitureComboboxOpen && (
                          <div className="furniture-dropdown absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-auto">
                            {filteredFurnitures.length > 0 ? (
                              <div className="p-1">
                                {filteredFurnitures.map((furniture) => (
                                  <div
                                    key={furniture._id}
                                    className={cn(
                                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                      field.value === furniture._id && "bg-accent text-accent-foreground"
                                    )}
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Ngăn input blur
                                      field.onChange(furniture._id);
                                      setFurnitureInputValue("");
                                      setFurnitureComboboxOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        field.value === furniture._id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {furniture.name} ({furniture.condition})
                                  </div>
                                ))}
                              </div>
                            ) : furnitureInputValue ? (
                              <div className="p-1">
                                <div
                                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Ngăn input blur
                                    field.onChange(furnitureInputValue);
                                    setFurnitureComboboxOpen(false);
                                  }}
                                >
                                  <Check className="h-4 w-4 opacity-0" />
                                  Sử dụng "{furnitureInputValue}" (nhập tự do)
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                Nhập tên đồ đạc hoặc chọn từ danh sách
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề yêu cầu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết vấn đề cần bảo trì..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ ưu tiên *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affectedQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  id="maintenance-image-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="maintenance-image-upload"
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

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || uploadingImages}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || uploadingImages}>
                {isLoading || uploadingImages ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 mr-2" />
                    Tạo yêu cầu
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

