import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Loader2, Upload, X } from "lucide-react";
import { BuildingSelectCombobox } from "../../FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetFloorsQuery } from "@/services/floor/floor.service";
import type { IRoom, CreateRoomRequest } from "@/types/room";

const roomSchema = z.object({
  buildingId: z.string().min(1, "Vui lòng chọn tòa nhà"),
  floorId: z.string().min(1, "Vui lòng chọn tầng"),
  roomNumber: z
    .string()
    .min(1, "Số phòng không được để trống")
    .max(50, "Số phòng không được quá 50 ký tự"),
  area: z.coerce
    .number()
    .min(1, "Diện tích phải lớn hơn 0")
    .max(1000, "Diện tích không được quá 1000 m²"),
  price: z.coerce
    .number()
    .min(0, "Giá thuê phải lớn hơn hoặc bằng 0")
    .max(1000000000, "Giá thuê không hợp lệ"),
  maxTenants: z.coerce
    .number()
    .min(1, "Số người ở tối thiểu là 1")
    .max(20, "Số người ở tối đa là 20"),
  status: z.enum(["available", "rented", "maintenance"]),
  description: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface ModalRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: IRoom | null;
  onSubmit: (data: CreateRoomRequest) => Promise<void>;
  isLoading?: boolean;
  defaultBuildingId?: string;
}

const STATUS_OPTIONS = [
  { value: "available", label: "Còn trống" },
  { value: "rented", label: "Đã thuê" },
  { value: "maintenance", label: "Bảo trì" },
];

export const ModalRoom = ({
  open,
  onOpenChange,
  room,
  onSubmit,
  isLoading = false,
  defaultBuildingId = "",
}: ModalRoomProps) => {
  const isEditMode = !!room;
  
  // Image management states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [replaceAllImages, setReplaceAllImages] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      buildingId: "",
      floorId: "",
      roomNumber: "",
      area: 0,
      price: 0,
      maxTenants: 1,
      status: "available",
      description: "",
    },
  });

  const selectedBuildingId = form.watch("buildingId");

  const { data: floorsData, isLoading: isFloorsLoading } = useGetFloorsQuery(
    { buildingId: selectedBuildingId },
    { skip: !selectedBuildingId }
  );

  useEffect(() => {
    if (open) {
      if (room) {
        form.reset({
          buildingId: (room.buildingId)._id,
          floorId: (room.floorId)._id,
          roomNumber: room.roomNumber,
          area: room.area,
          price: room.price,
          maxTenants: room.maxTenants,
          status: room.status,
          description: room.description || "",
        });
        // Set existing images
        setExistingImages(room.images || []);
      } else {
        form.reset({
          buildingId: defaultBuildingId,
          floorId: "",
          roomNumber: "",
          area: 0,
          price: 0,
          maxTenants: 1,
          status: "available",
          description: "",
        });
        // Reset image states
        setExistingImages([]);
      }
      // Reset image management states
      setSelectedFiles([]);
      setImagesToRemove([]);
      setReplaceAllImages(false);
    }
  }, [open, room, defaultBuildingId, form]);

  useEffect(() => {
    if (selectedBuildingId && !isEditMode) {
      form.setValue("floorId", "");
    }
  }, [selectedBuildingId, isEditMode, form]);

  // Image handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setImagesToRemove(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };


  const handleSubmit = async (data: RoomFormValues) => {
    // Include images as File objects for both create and edit modes
    const submitData: any = {
      ...data,
      images: selectedFiles,
    };

    if (isEditMode) {
      // For edit mode, include image management fields
      submitData.removeUrls = imagesToRemove;
      submitData.replaceAllImages = replaceAllImages;
    }
    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 ${
                isEditMode ? "bg-amber-500" : "bg-black"
              } rounded-lg`}
            >
              <DoorOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditMode ? "Cập nhật phòng" : "Thêm phòng mới"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEditMode
                  ? "Chỉnh sửa thông tin phòng"
                  : "Điền thông tin để thêm phòng vào hệ thống"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* Building & Floor */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-semibold">Vị trí</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 w-[70%]">
                  <FormField
                    control={form.control}
                    name="buildingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tòa nhà <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <BuildingSelectCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isLoading || isEditMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-[30%]">
                  <FormField
                    control={form.control}
                    name="floorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tầng <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            isLoading ||
                            !selectedBuildingId ||
                            isFloorsLoading ||
                            isEditMode
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tầng..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {floorsData?.data?.map((floor: any) => (
                              <SelectItem key={floor._id} value={floor._id}>
                                Tầng {floor.level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-semibold">Thông tin phòng</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số phòng <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: 101, A01"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Trạng thái <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Diện tích (m²) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="25"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá thuê (VNĐ) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3000000"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxTenants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sức chứa <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về phòng (không bắt buộc)"
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images Section */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-semibold">Hình ảnh phòng</h3>
              
              {/* Existing Images (Edit Mode) */}
              {isEditMode && existingImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ảnh hiện tại</label>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((imageUrl, index) => (
                      <Card key={index} className="relative group">
                        <CardContent className="p-2">
                          <div className="aspect-square relative overflow-hidden rounded-md">
                            <img
                              src={imageUrl}
                              alt={`Room image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExistingImage(imageUrl)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {imagesToRemove.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <Badge variant="outline" className="mr-2">
                        {imagesToRemove.length} ảnh sẽ bị xóa
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImagesToRemove([]);
                          setExistingImages(room?.images || []);
                        }}
                      >
                        Hoàn tác
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isEditMode ? "Thêm ảnh mới" : "Tải lên ảnh"}
                </label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground text-center">
                      <p>Nhấp để chọn ảnh hoặc kéo thả vào đây</p>
                      <p className="text-xs">Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB mỗi ảnh)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ảnh đã chọn</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedFiles.map((file, index) => (
                      <Card key={index} className="relative group">
                        <CardContent className="p-2">
                          <div className="aspect-square relative overflow-hidden rounded-md">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Selected ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {file.name}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Replace All Images Option (Edit Mode) */}
              {isEditMode && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="replace-all"
                    checked={replaceAllImages}
                    onChange={(e) => setReplaceAllImages(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="replace-all" className="text-sm">
                    Thay thế toàn bộ ảnh cũ bằng ảnh mới
                  </label>
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
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <DoorOpen className="w-4 h-4" />
                    {isEditMode ? "Cập nhật" : "Thêm phòng"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
