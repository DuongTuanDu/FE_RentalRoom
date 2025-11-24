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
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

interface TerminateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  terminatedAt: string;
  onTerminatedAtChange: (date: string) => void;
  onTerminate: () => void;
  isLoading: boolean;
}

export const TerminateContractDialog = ({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  terminatedAt,
  onTerminatedAtChange,
  onTerminate,
  isLoading,
}: TerminateContractDialogProps) => {
  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split("T")[0];
      onTerminatedAtChange(today);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chấm dứt hợp đồng</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do. Ngày chấm dứt được tự động đặt theo thời điểm
            hiện tại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="terminate-reason">
              Lý do chấm dứt <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="terminate-reason"
              placeholder="Nhập lý do chấm dứt hợp đồng..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terminated-at">
              Ngày chấm dứt <span className="text-red-500">*</span>
            </Label>
            <Input
              id="terminated-at"
              type="date"
              value={terminatedAt}
              readOnly
              disabled
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
            onClick={onTerminate}
            disabled={isLoading || !reason.trim()}
            variant="destructive"
          >
            {isLoading ? "Đang xử lý..." : "Chấm dứt hợp đồng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
