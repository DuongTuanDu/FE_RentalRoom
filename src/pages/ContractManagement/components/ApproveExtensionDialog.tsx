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

interface ApproveExtensionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onApprove: () => void;
  isLoading: boolean;
}

export const ApproveExtensionDialog = ({
  open,
  onOpenChange,
  note,
  onNoteChange,
  onApprove,
  isLoading,
}: ApproveExtensionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phê duyệt yêu cầu gia hạn</DialogTitle>
          <DialogDescription>
            Nhập ghi chú (tùy chọn) cho việc phê duyệt yêu cầu gia hạn hợp
            đồng này
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="approve-note">Ghi chú</Label>
            <Textarea
              id="approve-note"
              placeholder="Nhập ghi chú (tùy chọn)..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={4}
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
          <Button onClick={onApprove} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Phê duyệt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

