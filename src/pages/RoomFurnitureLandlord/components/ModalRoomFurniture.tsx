import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RoomSelectCombobox } from "./RoomSelectCombobox";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import { useGetFurnituresQuery } from "@/services/furniture/furniture.service";
import type {
  IFurnitureRoom,
  IFurnitureRoomRequest,
} from "@/types/room-furniture";

const roomFurnitureSchema = z.object({
  roomId: z.string().min(1, "Vui lòng chọn phòng"),
  furnitureId: z.string().min(1, "Vui lòng chọn nội thất"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  condition: z.enum(["good", "damaged", "under_repair"]),
  notes: z.string().optional(),
});

type RoomFurnitureFormValues = {
  roomId: string;
  furnitureId: string;
  quantity: number;
  condition: "good" | "damaged" | "under_repair";
  notes?: string;
};

interface ModalRoomFurnitureProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IFurnitureRoomRequest) => void;
  editingRoomFurniture?: IFurnitureRoom | null;
  isLoading: boolean;
}

export const ModalRoomFurniture = ({
  isOpen,
  onClose,
  onSubmit,
  editingRoomFurniture,
  isLoading,
}: ModalRoomFurnitureProps) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  const { data: buildingsData } = useGetBuildingsQuery({
    q: "",
    page: 1,
    limit: 10,
  });

  const { data: furnituresData, isLoading: isFurnituresLoading } =
    useGetFurnituresQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RoomFurnitureFormValues>({
    resolver: zodResolver(roomFurnitureSchema),
    defaultValues: {
      roomId: "",
      furnitureId: "",
      quantity: 1,
      condition: "good",
      notes: "",
    },
  });

  const watchedRoomId = watch("roomId");
  const watchedFurnitureId = watch("furnitureId");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingRoomFurniture) {
        setValue("roomId", editingRoomFurniture.roomId.id);
        setValue("furnitureId", editingRoomFurniture.furnitureId._id);
        setValue("quantity", editingRoomFurniture.quantity);
        setValue("condition", editingRoomFurniture.condition);
        setValue("notes", editingRoomFurniture.notes || "");
      } else {
        reset();
      }
    }
  }, [isOpen, editingRoomFurniture, setValue, reset]);

  // Auto-select first building
  useEffect(() => {
    if (buildingsData?.data?.[0]?._id && !selectedBuildingId) {
      setSelectedBuildingId(buildingsData.data[0]._id);
    }
  }, [buildingsData, selectedBuildingId]);

  const handleFormSubmit = (data: RoomFurnitureFormValues) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {editingRoomFurniture
              ? "Sửa nội thất phòng"
              : "Thêm nội thất phòng"}

          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Building Selection */}
          <div className="space-y-2">
            <Label htmlFor="building">Tòa nhà</Label>
            <Select
              value={selectedBuildingId}
              onValueChange={setSelectedBuildingId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tòa nhà" />
              </SelectTrigger>
              <SelectContent>
                {buildingsData?.data?.map((building) => (
                  <SelectItem key={building._id} value={building._id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Room Selection */}
            <div className="space-y-2">
              <Label htmlFor="roomId">Phòng *</Label>
              <RoomSelectCombobox
                value={watchedRoomId}
                onValueChange={(value) => setValue("roomId", value)}
                buildingId={selectedBuildingId}
                disabled={!selectedBuildingId}
              />
              {errors.roomId && (
                <p className="text-sm text-red-500">{errors.roomId.message}</p>
              )}
            </div>

            {/* Furniture Selection */}
            <div className="space-y-2">
              <Label htmlFor="furnitureId">Nội thất *</Label>
              <Select
                value={watchedFurnitureId}
                onValueChange={(value) => setValue("furnitureId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nội thất" />
                </SelectTrigger>
                <SelectContent>
                  {isFurnituresLoading ? (
                    <SelectItem value="" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : furnituresData && furnituresData.length > 0 ? (
                    furnituresData.map((furniture) => (
                      <SelectItem key={furniture._id} value={furniture._id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{furniture.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {furniture.category} •{" "}
                            {furniture.price?.toLocaleString()}đ
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Chưa có nội thất
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.furnitureId && (
                <p className="text-sm text-red-500">
                  {errors.furnitureId.message}
                </p>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", { valueAsNumber: true })}
              placeholder="Nhập số lượng"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Tình trạng *</Label>
            <Select
              value={watch("condition")}
              onValueChange={(value) => setValue("condition", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tình trạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Tốt</SelectItem>
                <SelectItem value="damaged">Hỏng</SelectItem>
                <SelectItem value="under_repair">Đang sửa chữa</SelectItem>
              </SelectContent>
            </Select>
            {errors.condition && (
              <p className="text-sm text-red-500">{errors.condition.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Nhập ghi chú (tùy chọn)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : editingRoomFurniture
                ? "Cập nhật"
                : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
