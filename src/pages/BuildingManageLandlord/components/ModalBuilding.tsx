import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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
import { Building2, Loader2, Zap, Droplet } from "lucide-react";
import type { IBuilding } from "@/types/building";

const buildingSchema = z.object({
  name: z
    .string()
    .min(1, "Tên tòa nhà không được để trống")
    .max(100, "Tên tòa nhà không được quá 100 ký tự"),
  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(200, "Địa chỉ không được quá 200 ký tự"),
  eIndexType: z.enum(["byNumber", "byPerson", "included"]),
  ePrice: z.coerce.number().min(0, "Giá điện phải lớn hơn hoặc bằng 0"),
  wIndexType: z.enum(["byNumber", "byPerson", "included"]),
  wPrice: z.coerce.number().min(0, "Giá nước phải lớn hơn hoặc bằng 0"),
  description: z.string().optional(),
});

type BuildingFormValues = z.infer<typeof buildingSchema>;

interface ModalBuildingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BuildingFormValues) => Promise<void>;
  isLoading?: boolean;
  editingBuilding?: IBuilding | null;
}

const indexTypeOptions = [
  { value: "byNumber", label: "Theo chỉ số" },
  { value: "byPerson", label: "Theo đầu người" },
  { value: "included", label: "Đã bao gồm trong giá thuê" },
];

const ModalBuilding = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  editingBuilding = null,
}: ModalBuildingProps) => {
  const isEditMode = !!editingBuilding;
  
  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema) as any,
    defaultValues: {
      name: "",
      address: "",
      eIndexType: "byNumber",
      ePrice: 0,
      wIndexType: "byNumber",
      wPrice: 0,
      description: "",
    },
  });

  // Reset form khi modal đóng hoặc khi editingBuilding thay đổi
  useEffect(() => {
    if (open) {
      if (editingBuilding) {
        form.reset({
          name: editingBuilding.name,
          address: editingBuilding.address,
          eIndexType: editingBuilding.eIndexType,
          ePrice: editingBuilding.ePrice,
          wIndexType: editingBuilding.wIndexType,
          wPrice: editingBuilding.wPrice,
          description: editingBuilding.description || "",
        });
      } else {
        form.reset({
          name: "",
          address: "",
          eIndexType: "byNumber",
          ePrice: 0,
          wIndexType: "byNumber",
          wPrice: 0,
          description: "",
        });
      }
    }
  }, [open, editingBuilding, form]);

  const handleSubmit = async (data: BuildingFormValues) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto !bg-white dark:!bg-slate-900">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${isEditMode ? 'bg-amber-500' : 'bg-blue-500'} rounded-lg`}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditMode ? "Cập nhật tòa nhà" : "Thêm tòa nhà mới"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEditMode 
                  ? "Chỉnh sửa thông tin tòa nhà" 
                  : "Điền thông tin chi tiết để thêm tòa nhà vào hệ thống"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* Thông tin cơ bản */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Thông tin cơ bản
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên tòa nhà <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên tòa nhà"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Địa chỉ <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập địa chỉ tòa nhà"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả về tòa nhà (không bắt buộc)"
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

            {/* Thông tin điện */}
            <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Thông tin điện
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eIndexType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại chỉ số điện <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại chỉ số" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indexTypeOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="ePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá điện (VNĐ) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Thông tin nước */}
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Thông tin nước
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wIndexType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại chỉ số nước <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại chỉ số" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indexTypeOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="wPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá nước (VNĐ) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    <Building2 className="w-4 h-4" />
                    {isEditMode ? "Cập nhật" : "Thêm tòa nhà"}
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

export default ModalBuilding;