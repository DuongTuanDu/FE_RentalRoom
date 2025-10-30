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
import { Slider } from "@/components/ui/slider";
import { BuildingSelectCombobox } from "../../FloorManageLandlord/components/BuildingSelectCombobox";
import {
  useAiGeneratePostMutation,
  useGetVacantRoomsByBuildingIdQuery,
} from "@/services/post/post.service";
import { Loader2, Wand2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { IPost } from "@/types/post";
import { RoomMultiSelectCombobox } from "./RoomMultiSelectCombobox";

const postSchema = z
  .object({
    title: z.string().min(1, "Tiêu đề là bắt buộc"),
    description: z.string().min(1, "Mô tả là bắt buộc"),
    priceMin: z.number().min(0, "Giá tối thiểu phải lớn hơn hoặc bằng 0"),
    priceMax: z.number().min(0, "Giá tối đa phải lớn hơn hoặc bằng 0"),
    areaMin: z.number().min(0, "Diện tích tối thiểu phải lớn hơn hoặc bằng 0"),
    areaMax: z.number().min(0, "Diện tích tối đa phải lớn hơn hoặc bằng 0"),
    address: z.string().min(1, "Địa chỉ là bắt buộc"),
    buildingId: z.string().min(1, "Tòa nhà là bắt buộc"),
    roomIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 phòng"),
    isDraft: z.boolean(),
  })
  .refine((data) => data.priceMin <= data.priceMax, {
    message: "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa",
    path: ["priceMax"],
  })
  .refine((data) => data.areaMin <= data.areaMax, {
    message: "Diện tích tối thiểu phải nhỏ hơn hoặc bằng diện tích tối đa",
    path: ["areaMax"],
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
      priceMin: 0,
      priceMax: 10000000,
      areaMin: 0,
      areaMax: 100,
      address: "",
      buildingId: "",
      roomIds: [],
      isDraft: false,
    },
  });

  const [aiGeneratePost] = useAiGeneratePostMutation();
  const buildingIdWatch = form.watch("buildingId");
  const { data: vacantInfo } = useGetVacantRoomsByBuildingIdQuery(
    buildingIdWatch as string,
    {
      skip: !buildingIdWatch,
    } as any
  );

  useEffect(() => {
    const addr = vacantInfo?.data?.building?.address;
    if (addr) {
      form.setValue("address", addr);
    }
  }, [vacantInfo, form]);

  useEffect(() => {
    if (open) {
      if (post) {
        form.reset({
          title: post.title,
          description: post.description,
          priceMin: post.priceMin ?? 0,
          priceMax: post.priceMax ?? 10000000,
          areaMin: post.areaMin ?? 0,
          areaMax: post.areaMax ?? 100,
          address: post.address,
          buildingId: post.buildingId.id,
          roomIds: post.roomIds,
          isDraft: post.isDraft,
        });
        setExistingImages(post.images || []);
        setExistingImages(post.images || []);
      } else {
        // Create mode - reset form
        form.reset({
          title: "",
          description: "",
          priceMin: 0,
          priceMax: 10000000,
          areaMin: 0,
          areaMax: 100,
          address: "",
          buildingId: defaultBuildingId || "",
          roomIds: [],
          isDraft: false,
        });
        setExistingImages([]);
      }
      setSelectedFiles([]);
    }
  }, [open, post, form, defaultBuildingId]);

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "buildingId") {
        form.setValue("roomIds", []);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIGenerate = async () => {
    const formData = form.getValues();

    if (
      !formData.title ||
      formData.priceMin === undefined ||
      formData.priceMax === undefined ||
      formData.areaMin === undefined ||
      formData.areaMax === undefined ||
      !formData.address
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản trước khi sử dụng AI");
      return;
    }

    if (!formData.buildingId) {
      toast.error("Vui lòng chọn tòa nhà trước khi sử dụng AI");
      return;
    }

    if (formData.priceMin > formData.priceMax) {
      toast.error("Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa");
      return;
    }

    if (formData.areaMin > formData.areaMax) {
      toast.error(
        "Diện tích tối thiểu phải nhỏ hơn hoặc bằng diện tích tối đa"
      );
      return;
    }

    // Lấy dữ liệu tòa nhà/dịch vụ/quy định từ vacantInfo (nếu có)
    const building = (vacantInfo as any)?.data?.building;
    const services = ((vacantInfo as any)?.data?.services ?? []) as any[];
    const rawRegulations = (vacantInfo as any)?.data?.regulations as any;
    const regulationsArr = Array.isArray(rawRegulations)
      ? rawRegulations
      : rawRegulations
      ? [rawRegulations]
      : [];

    const buildingInfo = {
      eIndexType: (building?.eIndexType as any) ?? "byNumber",
      ePrice: Number(building?.ePrice ?? 0),
      wIndexType: (building?.wIndexType as any) ?? "byNumber",
      wPrice: Number(building?.wPrice ?? 0),
      services: services.map((s) => ({
        label: s?.label ?? s?.name ?? "",
        fee: Number(s?.fee ?? 0),
      })),
      regulations: regulationsArr.map((r: any) => ({
        title: r?.title ?? "",
        description: r?.description ?? "",
      })),
    };

    try {
      setIsGeneratingAI(true);
      const result = await aiGeneratePost({
        title: formData.title,
        address: formData.address,
        priceMin: formData.priceMin,
        priceMax: formData.priceMax,
        areaMin: formData.areaMin,
        areaMax: formData.areaMax,
        buildingInfo,
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
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("priceMin", data.priceMin.toString());
    formData.append("priceMax", data.priceMax.toString());
    formData.append("areaMin", data.areaMin.toString());
    formData.append("areaMax", data.areaMax.toString());
    formData.append("address", data.address);
    formData.append("buildingId", data.buildingId);
    data.roomIds.forEach((id) => formData.append("roomIds", id));
    formData.append("isDraft", data.isDraft.toString());

    // Add image files
    selectedFiles.forEach((file) => {
      formData.append("images", file);
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
              : "Tạo bài đăng mới cho phòng trọ"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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

              {/* Room Selection */}
              <FormField
                control={form.control}
                name="roomIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phòng trống</FormLabel>
                    <FormControl>
                      <RoomMultiSelectCombobox
                        buildingId={form.watch("buildingId")}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading || !form.watch("buildingId")}
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
                  <FormItem className="md:col-span-2">
                    <FormLabel>Địa chỉ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          buildingIdWatch
                            ? "Địa chỉ tự động theo tòa nhà"
                            : "Nhập địa chỉ"
                        }
                        readOnly={!!buildingIdWatch}
                        disabled={!!buildingIdWatch}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    {buildingIdWatch && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Địa chỉ được lấy tự động từ tòa nhà đã chọn
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Range */}
              <FormField
                control={form.control}
                name="priceMin"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Khoảng giá thuê (VNĐ) *</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Slider
                          min={0}
                          max={20000000}
                          step={100000}
                          value={[
                            form.watch("priceMin"),
                            form.watch("priceMax"),
                          ]}
                          onValueChange={(values) => {
                            form.setValue("priceMin", values[0]);
                            form.setValue("priceMax", values[1]);
                          }}
                        />
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-muted-foreground whitespace-nowrap">
                              Tối thiểu:
                            </span>
                            <Input
                              type="number"
                              className="w-full"
                              min={0}
                              value={field.value}
                              onChange={(e) => {
                                const value = Math.max(
                                  0,
                                  Number(e.target.value)
                                );
                                field.onChange(value);
                                if (value > form.watch("priceMax")) {
                                  form.setValue("priceMax", value);
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-muted-foreground whitespace-nowrap">
                              Tối đa:
                            </span>
                            <Input
                              type="number"
                              className="w-full"
                              min={form.watch("priceMin")}
                              value={form.watch("priceMax")}
                              onChange={(e) => {
                                const value = Math.max(
                                  form.watch("priceMin"),
                                  Number(e.target.value)
                                );
                                form.setValue("priceMax", value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Area Range */}
              <FormField
                control={form.control}
                name="areaMin"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Khoảng diện tích (m²) *</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Slider
                          min={0}
                          max={200}
                          step={1}
                          value={[form.watch("areaMin"), form.watch("areaMax")]}
                          onValueChange={(values) => {
                            form.setValue("areaMin", values[0]);
                            form.setValue("areaMax", values[1]);
                          }}
                        />
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-muted-foreground whitespace-nowrap">
                              Tối thiểu:
                            </span>
                            <Input
                              type="number"
                              className="w-full"
                              min={0}
                              value={field.value}
                              onChange={(e) => {
                                const value = Math.max(
                                  0,
                                  Number(e.target.value)
                                );
                                field.onChange(value);
                                if (value > form.watch("areaMax")) {
                                  form.setValue("areaMax", value);
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-muted-foreground whitespace-nowrap">
                              Tối đa:
                            </span>
                            <Input
                              type="number"
                              className="w-full"
                              min={form.watch("areaMin")}
                              value={form.watch("areaMax")}
                              onChange={(e) => {
                                const value = Math.max(
                                  form.watch("areaMin"),
                                  Number(e.target.value)
                                );
                                form.setValue("areaMax", value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
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
                      disabled={isGeneratingAI || !buildingIdWatch}
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
                    <label className="text-sm font-medium">
                      Ảnh đã chọn ({selectedFiles.length})
                    </label>
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Ảnh hiện tại ({existingImages.length})
                  </label>
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
                ) : isEditMode ? (
                  "Cập nhật"
                ) : (
                  "Tạo bài đăng"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
