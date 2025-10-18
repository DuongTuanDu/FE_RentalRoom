import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { IBuildingService } from "@/types/building-services";

interface DeleteBuildingServicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  service: IBuildingService | null;
  isRestore?: boolean;
  isLoading?: boolean;
}

export const DeleteBuildingServicePopup = ({
  isOpen,
  onClose,
  onConfirm,
  service,
  isRestore = false,
  isLoading = false
}: DeleteBuildingServicePopupProps) => {
  if (!service) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isRestore ? "Khôi phục dịch vụ" : "Xóa dịch vụ"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRestore 
              ? `Bạn có chắc chắn muốn khôi phục dịch vụ "${service.label || service.name}"?`
              : `Bạn có chắc chắn muốn xóa dịch vụ "${service.label || service.name}"? Dịch vụ sẽ được xóa mềm và có thể khôi phục sau.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading 
              ? (isRestore ? "Đang khôi phục..." : "Đang xóa...") 
              : (isRestore ? "Khôi phục" : "Xóa")
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};