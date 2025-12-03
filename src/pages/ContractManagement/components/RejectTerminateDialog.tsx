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

interface RejectTerminateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onReject: () => void;
  isLoading: boolean;
}

export const RejectTerminateDialog = ({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onReject,
  isLoading,
}: RejectTerminateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối yêu cầu chấm dứt hợp đồng</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối yêu cầu chấm dứt hợp đồng của khách thuê.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reject-terminate-reason">
              Lý do từ chối <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-terminate-reason"
              placeholder="Nhập lý do từ chối yêu cầu chấm dứt hợp đồng..."
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
            onClick={onReject}
            disabled={isLoading || !reason.trim()}
            variant="destructive"
          >
            {isLoading ? "Đang xử lý..." : "Từ chối yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


