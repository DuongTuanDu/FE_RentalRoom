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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Loader2 } from "lucide-react";
import { useGetInvoiceDetailsQuery } from "@/services/invoice/invoice.service";
import { useFormatPrice } from "@/hooks/useFormatPrice";

interface PayInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onPay: (data: {
    paymentMethod: string;
    paidAt: string;
    note: string;
  }) => void;
  isLoading: boolean;
}

export const PayInvoiceDialog = ({
  open,
  onOpenChange,
  invoiceId,
  onPay,
  isLoading,
}: PayInvoiceDialogProps) => {
  const formatPrice = useFormatPrice();
  const { data: invoice } = useGetInvoiceDetailsQuery(invoiceId || "", {
    skip: !invoiceId || !open,
  });

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAt, setPaidAt] = useState("");
  const [note, setNote] = useState("");

  // Set default paidAt to current date/time
  useEffect(() => {
    if (open) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setPaidAt(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setPaymentMethod("cash");
      setNote("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidAt) {
      return;
    }
    onPay({
      paymentMethod,
      paidAt: new Date(paidAt).toISOString(),
      note,
    });
  };

  const remainingAmount =
    invoice && invoice.totalAmount
      ? invoice.totalAmount - (invoice.paidAmount || 0)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Thanh toán hóa đơn
          </DialogTitle>
          <DialogDescription>
            Đánh dấu hóa đơn đã được thanh toán
          </DialogDescription>
        </DialogHeader>

        {invoice && (
          <div className="space-y-4 py-4">
            {/* Invoice Info */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Số hóa đơn:
                </span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Tổng tiền:
                </span>
                <span className="font-semibold text-lg">
                  {formatPrice(invoice.totalAmount)}
                </span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Đã thanh toán:
                  </span>
                  <span className="font-medium text-green-600">
                    {formatPrice(invoice.paidAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Còn lại:
                </span>
                <span className="font-bold text-lg text-orange-600">
                  {formatPrice(remainingAmount)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Phương thức thanh toán *</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  required
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tiền mặt</SelectItem>
                    <SelectItem value="bank_transfer">
                      Chuyển khoản ngân hàng
                    </SelectItem>
                    <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                    <SelectItem value="debit_card">Thẻ ghi nợ</SelectItem>
                    <SelectItem value="e_wallet">Ví điện tử</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Paid At */}
              <div className="space-y-2">
                <Label htmlFor="paidAt">Ngày giờ thanh toán *</Label>
                <Input
                  id="paidAt"
                  type="datetime-local"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  required
                />
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú (nếu có)..."
                  rows={3}
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận thanh toán"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

