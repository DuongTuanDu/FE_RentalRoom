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
import type { IFloor } from "@/types/floor";
import { Loader2 } from "lucide-react";

interface DeleteFloorPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floor: IFloor | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteFloorPopover = ({
  open,
  onOpenChange,
  floor,
  onConfirm,
  isLoading,
}: DeleteFloorPopoverProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa tầng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa{" "}
            <span className="font-semibold text-foreground">
              Tầng {floor?.level}
            </span>
            ? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};