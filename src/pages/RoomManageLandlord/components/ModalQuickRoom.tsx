import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetFloorsQuery } from "@/services/floor/floor.service";
import { useQuickCreateMutation } from "@/services/room/room.service";
import { BuildingSelectCombobox } from "../../FloorManageLandlord/components/BuildingSelectCombobox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const quickRoomSchema = z.object({
  buildingId: z.string().min(1, "Vui lòng chọn tòa nhà"),
  floorId: z.string().min(1, "Vui lòng chọn tầng"),
  perFloor: z.number().min(1, "Số phòng mỗi tầng phải lớn hơn 0"),
  seqStart: z.number().min(1, "Số bắt đầu phải lớn hơn 0"),
  defaults: z.object({
    price: z.number().min(0, "Giá thuê phải lớn hơn hoặc bằng 0"),
    area: z.number().min(0, "Diện tích phải lớn hơn hoặc bằng 0"),
    maxTenants: z.number().min(1, "Sức chứa phải lớn hơn 0"),
    status: z.enum(["available", "rented", "maintenance"]),
    description: z.string().optional(),
  }),
});

type QuickRoomFormData = z.infer<typeof quickRoomSchema>;

interface ModalQuickRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBuildingId?: string;
}

export const ModalQuickRoom = ({
  open,
  onOpenChange,
  defaultBuildingId,
}: ModalQuickRoomProps) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState(defaultBuildingId || "");
  
  const form = useForm<QuickRoomFormData>({
    resolver: zodResolver(quickRoomSchema),
    defaultValues: {
      buildingId: defaultBuildingId || "",
      floorId: "",
      perFloor: 1,
      seqStart: 1,
      defaults: {
        price: 0,
        area: 0,
        maxTenants: 1,
        status: "available",
        description: "",
      },
    },
  });

  // Fetch floors based on selected building
  const { data: floorsData, isLoading: isFloorsLoading } = useGetFloorsQuery(
    { buildingId: selectedBuildingId },
    { skip: !selectedBuildingId }
  );

  const [quickCreate, { isLoading: isCreating }] = useQuickCreateMutation();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        buildingId: defaultBuildingId || "",
        floorId: "",
        perFloor: 1,
        seqStart: 1,
        defaults: {
          price: 0,
          area: 0,
          maxTenants: 1,
          status: "available",
          description: "",
        },
      });
      setSelectedBuildingId(defaultBuildingId || "");
    }
  }, [open, defaultBuildingId, form]);

  // Reset floor when building changes
  useEffect(() => {
    form.setValue("floorId", "");
  }, [selectedBuildingId, form]);

  const handleSubmit = async (data: QuickRoomFormData) => {
    try {
      await quickCreate(data).unwrap();
      toast.success("Tạo phòng nhanh thành công!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Tạo phòng nhanh thất bại!");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thiết lập nhanh phòng</DialogTitle>
          <DialogDescription>
            Tạo nhiều phòng cùng lúc với các thông số mặc định
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Building Selection */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="buildingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tòa nhà *</FormLabel>
                      <FormControl>
                        <BuildingSelectCombobox
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedBuildingId(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Floor Selection */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="floorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tầng *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedBuildingId || isFloorsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedBuildingId ? "Chọn tầng..." : "Chọn tòa nhà trước"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

              {/* Per Floor */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="perFloor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số phòng mỗi tầng *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sequence Start */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="seqStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số bắt đầu *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Default Values Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thông số mặc định</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <FormField
                  control={form.control}
                  name="defaults.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá thuê (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
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
                  name="defaults.area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diện tích (m²) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Tenants */}
                <FormField
                  control={form.control}
                  name="defaults.maxTenants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sức chứa (người) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="defaults.status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Có sẵn</SelectItem>
                          <SelectItem value="rented">Đã thuê</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="defaults.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chung cho tất cả phòng..."
                        {...field}
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
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo phòng nhanh
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
