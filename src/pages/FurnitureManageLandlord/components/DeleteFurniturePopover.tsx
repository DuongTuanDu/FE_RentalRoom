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
import type { IFurniture } from "@/types/furniture";
import { Loader2 } from "lucide-react";

interface DeleteFurniturePopoverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    furniture: IFurniture | null;
    onConfirm: () => void;
    isLoading: boolean;
}

export const DeleteFurniturePopover = ({
    open,
    onOpenChange,
    furniture,
    onConfirm,
    isLoading,
}: DeleteFurniturePopoverProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa nội thất</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa nội thất{" "}
                        <span className="font-semibold text-foreground">
                            {furniture?.name}
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