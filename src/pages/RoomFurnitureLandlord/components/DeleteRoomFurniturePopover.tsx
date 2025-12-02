import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { IFurnitureRoom } from "@/types/room-furniture";

interface DeleteRoomFurniturePopoverProps {
  roomFurniture: IFurnitureRoom;
  onConfirm: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
}

export const DeleteRoomFurniturePopover = ({
  roomFurniture,
  onConfirm,
  onOpenChange,
  isLoading,
}: DeleteRoomFurniturePopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setInternalOpen(open);
    onOpenChange(open);
  };

  const handleConfirm = () => {
    onConfirm();
    setInternalOpen(false);
  };

  return (
    <Popover open={internalOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Xóa nội thất phòng</h4>
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa nội thất này khỏi phòng không?
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Phòng:</span> Phòng {roomFurniture.roomId.roomNumber}
            </div>
            <div className="text-sm">
              <span className="font-medium">Nội thất:</span> {roomFurniture.furnitureId?.name || "Nội thất"}
            </div>
            <div className="text-sm">
              <span className="font-medium">Số lượng:</span> {roomFurniture.quantity}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInternalOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
