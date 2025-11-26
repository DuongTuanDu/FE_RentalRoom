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
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, UserX } from "lucide-react";
import type { IRoommate } from "@/types/roommate";

interface DeleteRoommateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roommate: IRoommate | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteRoommateDialog = ({
  open,
  onOpenChange,
  roommate,
  onConfirm,
  isLoading = false,
}: DeleteRoommateDialogProps) => {
  if (!roommate) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Xác nhận xóa người ở cùng
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Bạn có chắc chắn muốn xóa{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                "{roommate.fullName}"
              </span>{" "}
              khỏi phòng?
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <UserX className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <p className="font-medium">Thông tin người ở cùng:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>Tên: {roommate.fullName}</li>
                    <li>Email: {roommate.email}</li>
                    <li>Số điện thoại: {roommate.phoneNumber}</li>
                  </ul>
                </div>
              </div>
            </div>
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
                <Spinner className="w-4 h-4 mr-2" />
                Đang xóa...
              </>
            ) : (
              <>
                <UserX className="w-4 h-4 mr-2" />
                Xóa
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

