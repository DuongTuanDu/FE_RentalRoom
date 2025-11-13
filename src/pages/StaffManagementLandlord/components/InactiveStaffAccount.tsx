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
import { UserX, UserCheck, Loader2, AlertTriangle } from "lucide-react";
import type { IStaff } from "@/types/staff";

interface AlertToggleAccountStatusProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: IStaff | null;
  onConfirm: () => void;
  isLoading?: boolean;
  isActive: boolean;
}

const AlertToggleAccountStatus = ({
  open,
  onOpenChange,
  staff,
  onConfirm,
  isLoading = false,
  isActive,
}: AlertToggleAccountStatusProps) => {
  if (!staff) return null;
  const actionText = isActive ? "Vô hiệu hóa" : "Kích hoạt";
  const color = isActive ? "yellow" : "green";
  const icon = isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />;
  const alertText = isActive
    ? "Người dùng sẽ không thể đăng nhập vào hệ thống, nhưng dữ liệu vẫn được giữ lại để phục hồi sau này."
    : "Tài khoản sẽ được kích hoạt lại và có thể đăng nhập, sử dụng các chức năng bình thường.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="!bg-white dark:!bg-slate-900">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2.5 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg text-${color}-600 dark:text-${color}-400`}
            >
              {icon}
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              {isActive
                ? "Xác nhận vô hiệu hóa tài khoản"
                : "Xác nhận kích hoạt tài khoản"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription asChild>
            <div className="text-base space-y-3 pt-2">
              <p>
                Bạn có chắc chắn muốn {actionText.toLowerCase()} tài khoản của người dùng{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  "{staff.accountId.email}"
                </span>
                ?
              </p>

              <div
                className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-lg p-3`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 text-${color}-600 dark:text-${color}-400 mt-0.5 flex-shrink-0`}
                  />
                  <div
                    className={`text-sm text-${color}-800 dark:text-${color}-200 space-y-1`}
                  >
                    <span className="font-medium">
                      Lưu ý {actionText.toLowerCase()}:
                    </span>
                    <p>{alertText}</p>
                  </div>
                </div>
              </div>
            </div>
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
            className="bg-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang cập nhật...
              </>
            ) : (
              `${actionText} tài khoản`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertToggleAccountStatus;
