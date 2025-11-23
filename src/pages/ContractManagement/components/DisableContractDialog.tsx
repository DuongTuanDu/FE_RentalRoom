import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DisableContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onDisable: () => void;
  isLoading: boolean;
}

export const DisableContractDialog = ({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onDisable,
  isLoading,
}: DisableContractDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vô hiệu hóa hợp đồng</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do vô hiệu hóa hợp đồng này.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="disable-reason">
              Lý do vô hiệu hóa <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="disable-reason"
              placeholder="Nhập lý do vô hiệu hóa hợp đồng..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={onDisable}
            disabled={isLoading || !reason.trim()}
            variant="destructive"
          >
            {isLoading ? "Đang xử lý..." : "Vô hiệu hóa hợp đồng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

