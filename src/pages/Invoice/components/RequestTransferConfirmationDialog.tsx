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
import { Input } from "@/components/ui/input";
import { Loader2, X, UploadCloud } from "lucide-react";
import { useRequestTransferConfirmationMutation } from "@/services/invoice/invoice.service";
import { uploadFile, UPLOAD_CLINSKIN_PRESET } from "@/helpers/cloudinary";
import { toast } from "sonner";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { ITenantInvoiceDetailResponse } from "@/types/invoice";

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

  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setProofImage(null);
      setProofImagePreview("");
      setAmount("");
      setNote("");
    } else if (invoice) {
      // Set default amount to remaining amount
      const remainingAmount = invoice.totalAmount - (invoice.paidAmount || 0);
      setAmount(remainingAmount.toString());
    }
  }, [open, invoice]);

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

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
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
          amount: parseFloat(amount),
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

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền chuyển khoản (VNĐ) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
              min="0"
              step="1000"
              required
            />
            <p className="text-xs text-slate-500">
              Số tiền còn lại: {formatPrice(remainingAmount)}
            </p>
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
              disabled={isLoading || isUploading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
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
