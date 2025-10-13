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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import type { Package as PackageType } from "@/types/package-services";
import type { CreatePackageRequest } from "@/services/package-services/package-services.service";

const packageSchema = z.object({
  name: z
    .string()
    .min(1, "Tên gói dịch vụ không được để trống")
    .max(100, "Tên gói không được quá 100 ký tự"),
  price: z.coerce
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .max(1000000000, "Giá không hợp lệ"),
  durationDays: z.coerce
    .number()
    .min(1, "Thời hạn phải ít nhất 1 ngày")
    .max(365, "Thời hạn tối đa 365 ngày"),
  roomLimit: z.coerce
    .number()
    .min(1, "Số phòng tối thiểu là 1")
    .max(10000, "Số phòng tối đa là 10000"),
  description: z.string().optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface ModalPackageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package?: PackageType | null;
  onSubmit: (data: CreatePackageRequest) => Promise<void>;
  isLoading?: boolean;
}

export const ModalPackage = ({
  open,
  onOpenChange,
  package: pkg,
  onSubmit,
  isLoading = false,
}: ModalPackageProps) => {
  const isEditMode = !!pkg;

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      durationDays: 30,
      roomLimit: 10,
      description: "",
    },
  });

  // Reset form when modal opens or package changes
  useEffect(() => {
    if (open) {
      if (pkg) {
        form.reset({
          name: pkg.name,
          price: pkg.price,
          durationDays: pkg.durationDays,
          roomLimit: pkg.roomLimit,
          description: pkg.description || "",
        });
      } else {
        form.reset({
          name: "",
          price: 0,
          durationDays: 30,
          roomLimit: 10,
          description: "",
        });
      }
    }
  }, [open, pkg, form]);

  const handleSubmit = async (data: PackageFormValues) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 ${isEditMode ? "bg-amber-500" : "bg-blue-500"} rounded-lg`}
            >
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditMode ? "Cập nhật gói dịch vụ" : "Thêm gói dịch vụ mới"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEditMode
                  ? "Chỉnh sửa thông tin gói dịch vụ"
                  : "Điền thông tin để tạo gói dịch vụ mới"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* Package Info */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-semibold">Thông tin gói</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên gói dịch vụ <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Gói Cơ bản, Gói Premium..."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá (VNĐ) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500000"
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
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Thời hạn (ngày) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
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
                  name="roomLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số phòng <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
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
                        placeholder="Mô tả chi tiết về gói dịch vụ (không bắt buộc)"
                        className="resize-none"
                        rows={4}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <Package className="w-4 h-4" />
                    {isEditMode ? "Cập nhật" : "Thêm gói"}
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