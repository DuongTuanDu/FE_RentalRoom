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
import { CreditCard, Loader2, Copy, Check, QrCode, Building2 } from "lucide-react";
import { useGetTenantInvoiceDetailsQuery } from "@/services/invoice/invoice.service";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { IInvoicePaymentInfoResponse } from "@/types/invoice";

interface TenantPayInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onPay: (data: {
    paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
    note: string;
  }) => void;
  isLoading: boolean;
  paymentInfo?: IInvoicePaymentInfoResponse | null;
}

// Payment Info Dialog Component
export const PaymentInfoDialog = ({
  open,
  onOpenChange,
  paymentInfo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentInfo: IInvoicePaymentInfoResponse | null;
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!paymentInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Thông tin chuyển khoản
          </DialogTitle>
          <DialogDescription>
            Vui lòng chuyển khoản theo thông tin bên dưới và quét mã QR để thanh toán
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invoice Info */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Số hóa đơn:
              </span>
              <span className="font-medium">{paymentInfo.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Kỳ thanh toán:
              </span>
              <span className="font-medium">
                Tháng {paymentInfo.periodMonth}/{paymentInfo.periodYear}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Số tiền:
              </span>
              <span className="font-bold text-lg text-orange-600">
                {paymentInfo.amount.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>

          {/* Bank Info */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-slate-600" />
              <Label className="text-base font-semibold">Thông tin tài khoản</Label>
            </div>
            
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-slate-500">Tên ngân hàng</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium flex-1">{paymentInfo.bankInfo.bankName}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleCopy(paymentInfo.bankInfo.bankName, "bankName")}
                  >
                    {copiedField === "bankName" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Số tài khoản</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium flex-1 font-mono">
                    {paymentInfo.bankInfo.accountNumber}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleCopy(paymentInfo.bankInfo.accountNumber, "accountNumber")}
                  >
                    {copiedField === "accountNumber" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Tên chủ tài khoản</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium flex-1">{paymentInfo.bankInfo.accountName}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleCopy(paymentInfo.bankInfo.accountName, "accountName")}
                  >
                    {copiedField === "accountName" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {paymentInfo.bankInfo.qrImageUrl && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <Label className="text-base font-semibold mb-3 block">Mã QR chuyển khoản</Label>
              <div className="flex justify-center">
                <img
                  src={paymentInfo.bankInfo.qrImageUrl}
                  alt="QR Code"
                  className="w-64 h-64 object-contain border rounded-lg bg-white p-2"
                />
              </div>
            </div>
          )}

          {/* Transfer Note */}
          {paymentInfo.transferNote && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <Label className="text-xs text-slate-500 mb-1 block">Nội dung chuyển khoản</Label>
              <p className="text-sm font-medium">{paymentInfo.transferNote}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đã hiểu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TenantPayInvoiceDialog = ({
  open,
  onOpenChange,
  invoiceId,
  onPay,
  isLoading,
  paymentInfo,
}: TenantPayInvoiceDialogProps) => {
  const formatPrice = useFormatPrice();
  const { data: invoice } = useGetTenantInvoiceDetailsQuery(invoiceId || "", {
    skip: !invoiceId || !open,
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bank_transfer" | "online_gateway" | null
  >("cash");
  const [note, setNote] = useState("");
  const [isPaymentInfoDialogOpen, setIsPaymentInfoDialogOpen] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setPaymentMethod("cash");
      setNote("");
      setIsPaymentInfoDialogOpen(false);
    }
  }, [open]);

  // Show payment info dialog when paymentInfo is available
  useEffect(() => {
    if (paymentInfo && open) {
      setIsPaymentInfoDialogOpen(true);
    }
  }, [paymentInfo, open]);

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

      {/* Payment Info Dialog */}
      <PaymentInfoDialog
        open={isPaymentInfoDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentInfoDialogOpen(open);
          if (!open) {
            // Close both dialogs when payment info dialog closes
            onOpenChange(false);
          }
        }}
        paymentInfo={paymentInfo || null}
      />
    </Dialog>
  );
};

