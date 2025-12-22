import { useState, useEffect } from "react";
import { useCreateMaintenanceMutation } from "@/services/maintenance/maintenance.service";
import { useGetPostRoomDetailsQuery } from "@/services/post/post.service";
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

const maintenanceSchema = z
  .object({
    roomId: z.string().min(1, "Vui lòng chọn phòng"),
    category: z.enum([
      "furniture",
      "electrical",
      "plumbing",
      "air_conditioning",
      "door_lock",
      "wall_ceiling",
      "flooring",
      "windows",
      "appliances",
      "internet_wifi",
      "pest_control",
      "cleaning",
      "safety",
      "other",
    ]),
    furnitureId: z.string().optional(),
    title: z.string().min(1, "Vui lòng nhập tiêu đề"),
    description: z.string().min(1, "Vui lòng nhập mô tả"),
    affectedQuantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  })
  .refine(
    (data) => {
      // furnitureId chỉ bắt buộc khi category = "furniture"
      if (data.category === "furniture") {
        return data.furnitureId && data.furnitureId.trim().length > 0;
      }
      return true;
    },
    {
      message: "Vui lòng nhập hoặc chọn đồ đạc",
      path: ["furnitureId"],
    }
  );

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface CreateMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFurnitureId?: string;
  roomId?: string;
}

export const CreateMaintenanceModal = ({
  open,
  onOpenChange,
  defaultFurnitureId,
  roomId,
}: CreateMaintenanceModalProps) => {
  const [createMaintenance, { isLoading }] = useCreateMaintenanceMutation();
  const { data: roomDetailData } = useGetPostRoomDetailsQuery(roomId || "", {
    skip: !roomId || !open,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [furnitureComboboxOpen, setFurnitureComboboxOpen] = useState(false);
  const [furnitureInputValue, setFurnitureInputValue] = useState("");

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      roomId: "",
      category: "other",
      furnitureId: "",
      title: "",
      description: "",
      affectedQuantity: 1,
    },
  });

  // Watch category để ẩn/hiện furnitureId field
  const category = form.watch("category");

  // Set default roomId when room data is available
  useEffect(() => {
    if (roomDetailData?.data && open) {
      form.setValue("roomId", roomDetailData.data._id);
    }
  }, [roomDetailData?.data, open, form]);

  // Set default furnitureId when provided
  useEffect(() => {
    if (defaultFurnitureId && open) {
      form.setValue("furnitureId", defaultFurnitureId);
      form.setValue("category", "furniture"); // Set category to furniture if defaultFurnitureId is provided
    } else if (open && !defaultFurnitureId) {
      form.setValue("furnitureId", "");
    }
  }, [defaultFurnitureId, open, form]);

  // Clear furnitureId when category changes away from furniture
  useEffect(() => {
    if (category !== "furniture" && form.getValues("furnitureId")) {
      form.setValue("furnitureId", "");
      form.clearErrors("furnitureId");
    }
  }, [category, form]);

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

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("roomId", values.roomId);
      formData.append("category", values.category);
      
      // Chỉ gửi furnitureId khi category = "furniture"
      if (values.category === "furniture" && values.furnitureId) {
        formData.append("furnitureId", values.furnitureId);
      }
      
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("affectedQuantity", values.affectedQuantity.toString());
      
      // Append images if any
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await createMaintenance(formData as any).unwrap();
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

  const furnitures = roomDetailData?.data?.furnitures || [];

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
                    {roomDetailData?.data ? (
                      <>
                        <Input
                          value={roomDetailData.data.roomNumber || "N/A"}
                          disabled
                          className="bg-muted"
                        />
                        {/* Hidden input to store roomId */}
                        <input type="hidden" {...field} value={roomDetailData.data._id} />
                      </>
                    ) : (
                      <Input placeholder="Chọn phòng" {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="furniture">Đồ nội thất</SelectItem>
                      <SelectItem value="electrical">Điện, ổ cắm, đèn</SelectItem>
                      <SelectItem value="plumbing">Nước, vòi, bồn rửa, toilet</SelectItem>
                      <SelectItem value="air_conditioning">Điều hòa</SelectItem>
                      <SelectItem value="door_lock">Khóa cửa, chìa khóa</SelectItem>
                      <SelectItem value="wall_ceiling">Tường, trần nhà, sơn, nứt</SelectItem>
                      <SelectItem value="flooring">Sàn gỗ, gạch</SelectItem>
                      <SelectItem value="windows">Cửa sổ, kính</SelectItem>
                      <SelectItem value="appliances">Tủ lạnh, máy giặt, lò vi sóng...</SelectItem>
                      <SelectItem value="internet_wifi">Mạng internet</SelectItem>
                      <SelectItem value="pest_control">Diệt côn trùng</SelectItem>
                      <SelectItem value="cleaning">Vệ sinh</SelectItem>
                      <SelectItem value="safety">Bình chữa cháy, báo khói</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Furniture - Chỉ hiển thị khi category = "furniture" */}
            {category === "furniture" && (
              <FormField
                control={form.control}
                name="furnitureId"
                render={({ field }) => {
                  const selectedFurniture = furnitures.find(
                    (f: { _id: string; name: string; condition: string }) => f._id === field.value
                  );
                  
                  // Hiển thị tên furniture nếu đã chọn, hoặc giá trị tự do
                  const displayValue = selectedFurniture
                    ? `${selectedFurniture.name} (${selectedFurniture.condition})`
                    : field.value || "";

                  // Lọc danh sách furniture theo input
                  const filteredFurnitures = furnitures.filter((f: { name: string }) =>
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
                                {filteredFurnitures.map((furniture: { _id: string; name: string; condition: string }) => (
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
            )}

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

            {/* Quantity */}
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

