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
import { Loader2 } from "lucide-react";
import type { IUtilityItem } from "@/types/utility";

interface ConfirmUtilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  utility: IUtilityItem | null;
  isLoading: boolean;
}

export const ConfirmUtilityDialog = ({
  open,
  onOpenChange,
  onConfirm,
  utility,
  isLoading,
}: ConfirmUtilityDialogProps) => {
  const getTypeLabel = (type: string) => {
    return type === "electricity" ? "Điện" : "Nước";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận chỉ số điện nước</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xác nhận và khóa chỉ số điện nước này? Sau
            khi xác nhận, bạn sẽ không thể chỉnh sửa chỉ số này nữa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {utility && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Thông tin chỉ số:</p>
            <p className="font-medium mt-1">
              {utility.buildingId?.name || "—"} - Phòng{" "}
              {utility.roomId?.roomNumber || "—"} -{" "}
              {getTypeLabel(utility.type)} - {utility.periodMonth}/
              {utility.periodYear}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Thành tiền:{" "}
              <span className="font-medium">
                {utility.amount.toLocaleString()} đ
              </span>
            </p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xác nhận...
              </>
            ) : (
              "Xác nhận"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

