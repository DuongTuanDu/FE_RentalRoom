import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from "@/components/ui/switch";
import { BuildingSelectCombobox } from "../../FloorManageLandlord/components/BuildingSelectCombobox";
import { useAiGeneratePostMutation } from "@/services/post/post.service";
import { Loader2, Wand2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { IPost } from "@/types/post";

const postSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  price: z.number().min(0, "Giá phải lớn hơn 0"),
  area: z.number().min(0, "Diện tích phải lớn hơn 0"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  buildingId: z.string().min(1, "Tòa nhà là bắt buộc"),
  isDraft: z.boolean(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface ModalPostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: IPost | null;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  defaultBuildingId?: string;
}

export const ModalPost = ({
  open,
  onOpenChange,
  post,
  onSubmit,
  isLoading = false,
  defaultBuildingId = "",
}: ModalPostProps) => {
  const isEditMode = !!post;
  
  // Image management states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      area: 0,
      address: "",
      buildingId: "",
      isDraft: false,
    },
  });

  const [aiGeneratePost] = useAiGeneratePostMutation();

  useEffect(() => {
    if (open) {
      if (post) {
        // Edit mode - populate form with existing data
        form.reset({
          title: post.title,
          description: post.description,
          price: post.price,
          area: post.area,
          address: post.address,
          buildingId: post.buildingId,
          isDraft: post.isDraft,
        });
        setExistingImages(post.images || []);
      } else {
        // Create mode - reset form
        form.reset({
          title: "",
          description: "",
          price: 0,
          area: 0,
          address: "",
          buildingId: defaultBuildingId || "",
          isDraft: false,
        });
        setExistingImages([]);
      }
      setSelectedFiles([]);
    }
  }, [open, post, form, defaultBuildingId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAIGenerate = async () => {
    const formData = form.getValues();
    
    if (!formData.title || !formData.price || !formData.area || !formData.address) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản trước khi sử dụng AI");
      return;
    }

    try {
      setIsGeneratingAI(true);
      const result = await aiGeneratePost({
        title: formData.title,
        price: formData.price,
        area: formData.area,
        address: formData.address,
      }).unwrap();

      if (result.success && result.data.aiDescription) {
        form.setValue("description", result.data.aiDescription);
        toast.success("Đã tạo mô tả bằng AI thành công");
      }
    } catch (error: any) {
      toast.error("Tạo mô tả bằng AI thất bại");
      console.error(error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (data: PostFormValues) => {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('area', data.area.toString());
    formData.append('address', data.address);
    formData.append('buildingId', data.buildingId);
    formData.append('isDraft', data.isDraft.toString());
    
    // Add image files
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });
    
    onSubmit(formData);
  };

  const handleClose = () => {
    form.reset();
    setSelectedFiles([]);
    setExistingImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa Bài đăng" : "Tạo Bài đăng Mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Cập nhật thông tin bài đăng" 
              : "Tạo bài đăng mới cho phòng trọ"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tiêu đề *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề bài đăng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Building */}
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

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập địa chỉ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá thuê (VNĐ) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập giá thuê"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Area */}
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diện tích (m²) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập diện tích"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description with AI Generate */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mô tả *</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAIGenerate}
                      disabled={isGeneratingAI}
                      className="gap-2"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      {isGeneratingAI ? "Đang tạo..." : "Tạo bằng AI"}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chi tiết về phòng trọ..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Hình ảnh</label>
              
              {/* File Upload */}
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

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Ảnh đã chọn ({selectedFiles.length})</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ảnh hiện tại ({existingImages.length})</label>
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
                </div>
              )}
            </div>

            {/* Draft Switch */}
            <FormField
              control={form.control}
              name="isDraft"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Lưu bản nháp</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Lưu bài đăng dưới dạng bản nháp để chỉnh sửa sau
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : (
                  isEditMode ? "Cập nhật" : "Tạo bài đăng"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
