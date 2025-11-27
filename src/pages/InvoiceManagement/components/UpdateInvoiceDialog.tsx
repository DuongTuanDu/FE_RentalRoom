import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit } from "lucide-react";
import type { IUpdateInvoiceRequest } from "@/types/invoice";

interface UpdateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  initialData?: {
    note?: string;
    discountAmount?: number;
    lateFee?: number;
    status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  };
  onSubmit: (invoiceId: string, data: IUpdateInvoiceRequest) => void;
  isLoading: boolean;
}

export const UpdateInvoiceDialog = ({
  open,
  onOpenChange,
  invoiceId,
  initialData,
  onSubmit,
  isLoading,
}: UpdateInvoiceDialogProps) => {
  const [note, setNote] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [lateFee, setLateFee] = useState("0");
  const [status, setStatus] = useState<
    "draft" | "sent" | "paid" | "overdue" | "cancelled"
  >("draft");

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open && initialData) {
      setNote(initialData.note || "");
      setDiscountAmount(String(initialData.discountAmount || 0));
      setLateFee(String(initialData.lateFee || 0));
      setStatus(initialData.status || "draft");
    } else if (!open) {
      setNote("");
      setDiscountAmount("0");
      setLateFee("0");
      setStatus("draft");
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) return;

    onSubmit(invoiceId, {
      note,
      discountAmount: Number(discountAmount) || 0,
      lateFee: Number(lateFee) || 0,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Cập nhật hóa đơn
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin hóa đơn (ghi chú, giảm trừ, phí trễ hạn, trạng thái)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Status */}
          <div className="space-y-2">
            <Label>
              Trạng thái <span className="text-red-500">*</span>
            </Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="sent">Đã gửi</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount Amount */}
          <div className="space-y-2">
            <Label>Giảm trừ (VND)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Late Fee */}
          <div className="space-y-2">
            <Label>Phí trễ hạn (VND)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={lateFee}
              onChange={(e) => setLateFee(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !invoiceId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

