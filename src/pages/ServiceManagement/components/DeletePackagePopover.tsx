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
import { Package, Loader2, AlertTriangle } from "lucide-react";
import type { Package as PackageType } from "@/types/package-services";
import { useFormatPrice } from "@/hooks/useFormatPrice";

interface DeletePackagePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageType | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeletePackagePopover = ({
  open,
  onOpenChange,
  package: pkg,
  onConfirm,
  isLoading = false,
}: DeletePackagePopoverProps) => {
  const formatPrice = useFormatPrice();

  if (!pkg) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Xác nhận xóa gói dịch vụ
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Bạn có chắc chắn muốn xóa gói dịch vụ{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                "{pkg.name}"
              </span>
              ?
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <p className="font-medium">Thông tin gói sẽ bị xóa:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>Tên: {pkg.name}</li>
                    <li>Giá: {formatPrice(pkg.price)}</li>
                    <li>Thời hạn: {pkg.durationDays} ngày</li>
                    <li>Giới hạn: {pkg.roomLimit} phòng</li>
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
                <Loader2 className="w-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              "Xóa gói dịch vụ"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
