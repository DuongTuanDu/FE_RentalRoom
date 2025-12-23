import { useState, useEffect, useRef } from "react";
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
import { Loader2, X, UploadCloud, Building2, Copy, Check } from "lucide-react";
import {
  useRequestTransferConfirmationMutation,
  usePayTenantInvoiceMutation,
} from "@/services/invoice/invoice.service";
import { uploadFile, UPLOAD_CLINSKIN_PRESET } from "@/helpers/cloudinary";
import { toast } from "sonner";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type {
  ITenantInvoiceDetailResponse,
  IInvoicePaymentInfoResponse,
} from "@/types/invoice";

interface RequestTransferConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ITenantInvoiceDetailResponse | null;
}

export const RequestTransferConfirmationDialog = ({
  open,
  onOpenChange,
  invoice,
}: RequestTransferConfirmationDialogProps) => {
  const formatPrice = useFormatPrice();
  const [requestConfirmation, { isLoading }] =
    useRequestTransferConfirmationMutation();
  const [payInvoice, { isLoading: isLoadingPaymentInfo }] =
    usePayTenantInvoiceMutation();

  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [paymentInfo, setPaymentInfo] =
    useState<IInvoicePaymentInfoResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setProofImage(null);
      setProofImagePreview("");
      setNote("");
      setPaymentInfo(null);
      setCopiedField(null);
    }
  }, [open, invoice]);

  // Fetch payment info when dialog opens
  useEffect(() => {
    if (open && invoice) {
      const fetchPaymentInfo = async () => {
        try {
          const response = await payInvoice({
            id: invoice._id,
            data: {
              paymentMethod: "bank_transfer",
              note: "",
            },
          }).unwrap();

          if (response && response.bankInfo) {
            setPaymentInfo(response);
          }
        } catch (error: any) {
          // Silently fail - payment info is optional
          console.error("Failed to fetch payment info:", error);
        }
      };

      fetchPaymentInfo();
    }
  }, [open, invoice, payInvoice]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setProofImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProofImage(null);
    setProofImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoice) return;

    // Validate
    if (!proofImage) {
      toast.error("Vui lòng chọn ảnh chứng từ chuyển khoản");
      return;
    }

    try {
      setIsUploading(true);

      // Upload image to cloudinary
      const uploadResult = await uploadFile({
        file: proofImage,
        type: UPLOAD_CLINSKIN_PRESET,
      });

      // Call API
      await requestConfirmation({
        id: invoice._id,
        data: {
          proofImageUrl: uploadResult.secure_url,
          note: note || "",
        },
      }).unwrap();

      toast.success("Gửi yêu cầu xác nhận chuyển khoản thành công!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Gửi yêu cầu xác nhận chuyển khoản thất bại!"
      );
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!invoice) return null;

  const remainingAmount = invoice.totalAmount - (invoice.paidAmount || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[582px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Gửi yêu cầu xác nhận chuyển khoản
          </DialogTitle>
          <DialogDescription>
            Vui lòng tải lên ảnh chứng từ chuyển khoản và điền thông tin để gửi
            yêu cầu xác nhận
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          {/* Invoice Info */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-2">
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
              <span className="font-semibold">
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

          {/* Bank Info */}
          {isLoadingPaymentInfo ? (
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-slate-600">
                  Đang tải thông tin ngân hàng...
                </span>
              </div>
            </div>
          ) : paymentInfo?.bankInfo ? (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-slate-600" />
                <Label className="text-base font-semibold">
                  Thông tin tài khoản
                </Label>
              </div>

              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-slate-500">Tên ngân hàng</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-medium flex-1">
                      {paymentInfo.bankInfo.bankName}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        handleCopy(paymentInfo.bankInfo.bankName, "bankName")
                      }
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
                      onClick={() =>
                        handleCopy(
                          paymentInfo.bankInfo.accountNumber,
                          "accountNumber"
                        )
                      }
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
                  <Label className="text-xs text-slate-500">
                    Tên chủ tài khoản
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-medium flex-1">
                      {paymentInfo.bankInfo.accountName}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        handleCopy(
                          paymentInfo.bankInfo.accountName,
                          "accountName"
                        )
                      }
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

              {/* QR Code */}
              {paymentInfo.bankInfo.qrImageUrl && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Label className="text-base font-semibold mb-3 block">
                    Mã QR chuyển khoản
                  </Label>
                  <div className="flex justify-center">
                    <img
                      src={paymentInfo.bankInfo.qrImageUrl}
                      alt="QR Code"
                      className="w-48 h-48 object-contain border rounded-lg bg-white p-2"
                    />
                  </div>
                </div>
              )}

              {/* Transfer Note */}
              {paymentInfo.transferNote && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <Label className="text-xs text-slate-500 mb-1 block">
                      Nội dung chuyển khoản
                    </Label>
                    <p className="text-sm font-medium">
                      {paymentInfo.transferNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Proof Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="proofImage">Ảnh chứng từ chuyển khoản *</Label>
            <div className="space-y-2">
              {proofImagePreview ? (
                <div className="relative">
                  <div className="relative w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                    <img
                      src={proofImagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Click để chọn ảnh chứng từ
                  </p>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ: JPG, PNG (tối đa 5MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                id="proofImage"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {/* {!proofImagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn ảnh
                </Button>
              )} */}
            </div>
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
              disabled={isLoading || isUploading || isLoadingPaymentInfo}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploading || isLoadingPaymentInfo}
            >
              {isLoading || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
