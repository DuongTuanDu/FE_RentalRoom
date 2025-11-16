import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { IContractTemplate } from "@/types/contract-template";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: IContractTemplate | null;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export const DeleteContractTemplateDialog = ({ open, onOpenChange, template, onConfirm, isLoading }: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa mẫu hợp đồng?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa mẫu hợp đồng {template ? `"${template.name}"` : "này"}? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm()} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


