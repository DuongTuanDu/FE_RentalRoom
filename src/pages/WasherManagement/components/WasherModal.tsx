import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ILaundryDeviceRequest, IWasherItem } from "@/types/laundry";

const washerSchema = z.object({
  name: z.string().min(1, "Tên thiết bị là bắt buộc"),
  type: z.enum(["washer", "dryer"]),
  tuyaDeviceId: z
    .string()
    .min(1, "Tuya Device ID là bắt buộc")
    .max(100, "Tuya Device ID quá dài"),
});

type WasherFormValues = z.infer<typeof washerSchema>;

interface WasherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Floor ID được chọn ở ngoài, chỉ dùng cho chế độ tạo mới */
  floorId: string;
  editingWasher?: IWasherItem | null;
  onSubmit: (payload: {
    floorId: string;
    deviceId?: string;
    data: ILaundryDeviceRequest;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const WasherModal = ({
  open,
  onOpenChange,
  floorId,
  editingWasher,
  onSubmit,
  isSubmitting,
}: WasherModalProps) => {
  const form = useForm<WasherFormValues>({
    resolver: zodResolver(washerSchema),
    defaultValues: {
      name: "",
      type: "washer",
      tuyaDeviceId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editingWasher) {
        form.reset({
          name: editingWasher.name,
          type: editingWasher.type,
          tuyaDeviceId: editingWasher.tuyaDeviceId,
        });
      } else {
        form.reset({
          name: "",
          type: "washer",
          tuyaDeviceId: "",
        });
      }
    }
  }, [open, editingWasher, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleSubmit = async (values: WasherFormValues) => {
    // Với UX: nếu đang sửa thì luôn lấy floorId từ chính washer,
    // không phụ thuộc vào việc bên ngoài có chọn tầng hay không.
    const effectiveFloorId =
      editingWasher && editingWasher.floorId ? editingWasher.floorId : floorId;

    const payload: {
      floorId: string;
      deviceId?: string;
      data: ILaundryDeviceRequest;
    } = editingWasher
      ? {
          floorId: effectiveFloorId,
          deviceId: editingWasher.deviceId,
          data: values,
        }
      : {
          floorId: effectiveFloorId,
          data: values,
        };

    await onSubmit(payload);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingWasher
              ? "Chỉnh sửa thiết bị giặt sấy"
              : "Thêm thiết bị giặt sấy"}
          </DialogTitle>
          <DialogDescription>
            Quản lý thiết bị máy giặt / máy sấy tại từng tầng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thiết bị *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Máy giặt cửa ngang 10kg - Tầng 3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại thiết bị *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn loại thiết bị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="washer">Máy giặt</SelectItem>
                        <SelectItem value="dryer">Máy sấy</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tuyaDeviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tuya Device ID *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập Device ID của thiết bị trong hệ thống Tuya/Smart Life"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Để lấy{" "}
                    <span className="font-semibold">Tuya Device ID</span> một cách
                    chính xác, chủ trọ thực hiện theo các bước:
                    <br />
                    1. Mở ứng dụng smart home (Tuya Smart, Smart Life hoặc ứng
                    dụng nhà thông minh mà thiết bị đang sử dụng) trên điện
                    thoại.
                    <br />
                    2. Chọn đúng thiết bị máy giặt / máy sấy cần kết nối, vào
                    màn hình chi tiết thiết bị.
                    <br />
                    3. Tìm mục{" "}
                    <span className="italic">
                      Thông tin thiết bị / Device Information / Thiết bị / About
                      device
                    </span>{" "}
                    (thường nằm ở góc trên cùng bên phải hoặc trong phần cài đặt
                    thiết bị).
                    <br />
                    4. Tại đây sẽ hiển thị{" "}
                    <span className="font-semibold">Device ID</span> hoặc{" "}
                    <span className="font-semibold">UID</span>. Sao chép chính
                    xác chuỗi ID đó và dán vào ô này.
                    <br />
                    5. Đảm bảo thiết bị đã được{" "}
                    <span className="font-semibold">
                      kết nối Internet và hiển thị Online
                    </span>{" "}
                    trong ứng dụng, để hệ thống quản lý trọ có thể điều khiển và
                    theo dõi trạng thái thiết bị.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (!editingWasher && !floorId)}
              >
                {isSubmitting
                  ? editingWasher
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : editingWasher
                  ? "Cập nhật"
                  : "Thêm thiết bị"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


