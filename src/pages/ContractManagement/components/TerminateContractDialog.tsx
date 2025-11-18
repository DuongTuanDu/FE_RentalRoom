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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chấm dứt hợp đồng</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do và ngày chấm dứt hợp đồng này. Hành động này không thể
            hoàn tác.
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
              onChange={(e) => onTerminatedAtChange(e.target.value)}
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
            onClick={onTerminate}
            disabled={isLoading || !reason.trim() || !terminatedAt}
            variant="destructive"
          >
            {isLoading ? "Đang xử lý..." : "Chấm dứt hợp đồng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

