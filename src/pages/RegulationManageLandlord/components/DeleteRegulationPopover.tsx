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
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import type { IRegulation } from "@/types/regulation";

interface DeleteRegulationPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regulation?: IRegulation | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeleteRegulationPopover = ({
  open,
  onOpenChange,
  regulation,
  onConfirm,
  isLoading = false,
}: DeleteRegulationPopoverProps) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold">
                Xóa quy định
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Bạn có chắc chắn muốn xóa quy định này không?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {regulation && (
          <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-900">Quy định sẽ bị xóa:</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Tiêu đề:</span> {regulation.title}
              </div>
              <div>
                <span className="font-medium">Loại:</span> {
                  regulation.type === "entry_exit" ? "Ra vào" :
                  regulation.type === "pet_policy" ? "Thú cưng" :
                  regulation.type === "common_area" ? "Khu vực chung" : "Khác"
                }
              </div>
              <div>
                <span className="font-medium">Trạng thái:</span> {
                  regulation.status === "active" ? "Đang áp dụng" : "Không áp dụng"
                }
              </div>
            </div>
            <div className="text-sm text-red-700">
              <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Quy định sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Xóa quy định
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
