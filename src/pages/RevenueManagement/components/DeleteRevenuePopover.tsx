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
import { Loader2, AlertTriangle } from "lucide-react";
import type { IRevenue } from "@/types/revenue";

interface DeleteRevenuePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenue: IRevenue | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteRevenuePopover = ({
  open,
  onOpenChange,
  revenue,
  onConfirm,
  isLoading = false,
}: DeleteRevenuePopoverProps) => {
  if (!revenue) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Xác nhận xóa thu chi
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Bạn có chắc chắn muốn xóa khoản
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {" "}
                {revenue.type === "revenue" ? "thu" : "chi"}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {" "}
                "{revenue.title}"
              </span>
              ?
            </p>
            <p className="text-sm text-muted-foreground">
              Hành động này không thể hoàn tác.
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
              "Xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

