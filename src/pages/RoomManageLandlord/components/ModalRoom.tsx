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
import { DoorOpen, Loader2 } from "lucide-react";
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
          buildingId: room.buildingId,
          floorId: room.floorId,
          roomNumber: room.roomNumber,
          area: room.area,
          price: room.price,
          maxTenants: room.maxTenants,
          status: room.status,
          description: room.description || "",
        });
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
      }
    }
  }, [open, room, defaultBuildingId, form]);

  useEffect(() => {
    if (selectedBuildingId && !isEditMode) {
      form.setValue("floorId", "");
    }
  }, [selectedBuildingId, isEditMode, form]);

  const handleSubmit = async (data: RoomFormValues) => {
    await onSubmit(data);
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
                            {floorsData?.map((floor) => (
                              <SelectItem key={floor.id} value={floor.id}>
                                {floor.label}
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
