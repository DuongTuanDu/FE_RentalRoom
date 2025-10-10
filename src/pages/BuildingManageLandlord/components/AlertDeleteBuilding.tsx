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
import type { IBuilding } from "@/types/building";
import { Building2, Loader2, AlertTriangle } from "lucide-react";

interface AlertDeleteBuildingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building: IBuilding | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const AlertDeleteBuilding = ({
  open,
  onOpenChange,
  building,
  onConfirm,
  isLoading = false,
}: AlertDeleteBuildingProps) => {
  if (!building) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="!bg-white dark:!bg-slate-900">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Xác nhận xóa tòa nhà
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Bạn có chắc chắn muốn xóa tòa nhà{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                "{building.name}"
              </span>
              ?
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <p className="font-medium">Thông tin tòa nhà sẽ bị xóa:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>Địa chỉ: {building.address}</li>
                    <li>Tất cả thông tin điện, nước liên quan</li>
                    <li>Các dữ liệu phụ thuộc khác (nếu có)</li>
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
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              "Xóa tòa nhà"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDeleteBuilding;