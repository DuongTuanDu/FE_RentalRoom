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

interface DeleteUtilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  utility: IUtilityItem | null;
  isLoading: boolean;
}

export const DeleteUtilityDialog = ({
  open,
  onOpenChange,
  onConfirm,
  utility,
  isLoading,
}: DeleteUtilityDialogProps) => {
  const getTypeLabel = (type: string) => {
    return type === "electricity" ? "Điện" : "Nước";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa chỉ số điện nước</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa chỉ số điện nước này? Hành động này không
            thể hoàn tác. Chỉ có thể xóa chỉ số khi đang ở trạng thái nháp.
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
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Không</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

