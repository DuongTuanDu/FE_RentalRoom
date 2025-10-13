import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DoorOpen, Loader2, AlertTriangle } from "lucide-react";
import type { IRoom } from "@/types/room";

interface DeleteRoomPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: IRoom | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const STATUS_LABELS = {
  available: "Còn trống",
  rented: "Đã thuê",
  maintenance: "Bảo trì",
};

export const DeleteRoomPopover = ({
  open,
  onOpenChange,
  room,
  onConfirm,
  isLoading = false,
}: DeleteRoomPopoverProps) => {
  if (!room) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Xác nhận xóa phòng
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Bạn có chắc chắn muốn xóa phòng{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                "{room.roomNumber}"
              </span>
              ?
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <DoorOpen className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <p className="font-medium">Thông tin phòng sẽ bị xóa:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>Số phòng: {room.roomNumber}</li>
                    <li>Diện tích: {room.area} m²</li>
                    <li>Trạng thái: {STATUS_LABELS[room.status]}</li>
                    <li>Tất cả dữ liệu liên quan đến phòng này</li>
                  </ul>
                </div>
              </div>
            </div>
            {room.status === "rented" && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  ⚠️ Cảnh báo: Phòng này đang có người thuê!
                </p>
              </div>
            )}
            <p className="text-red-600 dark:text-red-400 font-medium">
              ⚠️ Hành động này không thể hoàn tác!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              "Xóa phòng"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
