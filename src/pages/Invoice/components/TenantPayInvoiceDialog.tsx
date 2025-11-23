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
import { useGetTenantInvoiceDetailsQuery } from "@/services/invoice/invoice.service";
import { useFormatPrice } from "@/hooks/useFormatPrice";

interface TenantPayInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onPay: (data: {
    paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
    note: string;
  }) => void;
  isLoading: boolean;
}

export const TenantPayInvoiceDialog = ({
  open,
  onOpenChange,
  invoiceId,
  onPay,
  isLoading,
}: TenantPayInvoiceDialogProps) => {
  const formatPrice = useFormatPrice();
  const { data: invoice } = useGetTenantInvoiceDetailsQuery(invoiceId || "", {
    skip: !invoiceId || !open,
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bank_transfer" | "online_gateway" | null
  >("cash");
  const [note, setNote] = useState("");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setPaymentMethod("cash");
      setNote("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPay({
      paymentMethod,
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
            Báo đã thanh toán hóa đơn
          </DialogTitle>
          <DialogDescription>
            Xác nhận bạn đã thanh toán hóa đơn này và cung cấp thông tin phương thức thanh toán
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
                  value={paymentMethod || ""}
                  onValueChange={(v) =>
                    setPaymentMethod(
                      v as "cash" | "bank_transfer" | "online_gateway" | null
                    )
                  }
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
                    <SelectItem value="online_gateway">
                      Cổng thanh toán trực tuyến
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    "Xác nhận đã thanh toán"
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

