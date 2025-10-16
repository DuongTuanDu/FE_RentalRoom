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
import { Loader2 } from "lucide-react";
import type { IFurnitureBuilding } from "@/types/building-furniture";

interface DeleteBuildingFurniturePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingFurniture: IFurnitureBuilding | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteBuildingFurniturePopover = ({
  open,
  onOpenChange,
  buildingFurniture,
  onConfirm,
  isLoading,
}: DeleteBuildingFurniturePopoverProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa nội thất</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa nội thất{" "}
            <span className="font-semibold text-foreground">
              "
              {typeof buildingFurniture?.furnitureId === "object"
                ? buildingFurniture.furnitureId.name
                : ""}
              "
            </span>{" "}
            khỏi tòa nhà{" "}
            <span className="font-semibold text-foreground">
              "
              {typeof buildingFurniture?.buildingId === "object"
                ? buildingFurniture.buildingId.name
                : ""}
              "
            </span>
            ? Hành động này không thể hoàn tác.
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
