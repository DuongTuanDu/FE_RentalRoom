import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SignatureCanvas from "react-signature-canvas";
import { useSignTenantMutation } from "@/services/contract/contract.service";
import { toast } from "sonner";
import { uploadFile, UPLOAD_CLINSKIN_PRESET } from "@/helpers/cloudinary";
import { CheckCircle } from "lucide-react";

interface SignTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const SignTenantDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: SignTenantDialogProps) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [signTenant, { isLoading: isSigning }] = useSignTenantMutation();

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureUrl("");
    }
  };

  const handleSaveSignature = async () => {
    if (!signatureRef.current) return;

    const isEmpty = signatureRef.current.isEmpty();
    if (isEmpty) {
      toast.error("Vui lòng ký vào ô chữ ký");
      return;
    }

    try {
      setIsUploadingSignature(true);
      const dataURL = signatureRef.current.toDataURL("image/png");

      const response = await fetch(dataURL);
      const blob = await response.blob();

      const uploadResult = await uploadFile({
        file: blob,
        type: UPLOAD_CLINSKIN_PRESET,
      });

      setSignatureUrl(uploadResult.secure_url);
      toast.success("Lưu chữ ký thành công");
    } catch (error: any) {
      console.error("Error uploading signature:", error);
      toast.error(error?.message?.message || "Không thể lưu chữ ký");
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleSignContract = async () => {
    if (!contractId || !signatureUrl) {
      toast.error("Vui lòng lưu chữ ký trước khi ký hợp đồng");
      return;
    }

    try {
      await signTenant({
        id: contractId,
        data: { signatureUrl },
      }).unwrap();

      toast.success("Ký hợp đồng thành công");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi ký hợp đồng");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSignatureUrl("");
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "36rem" }}>
        <DialogHeader>
          <DialogTitle>Ký hợp đồng</DialogTitle>
          <DialogDescription>
            Vui lòng ký vào ô chữ ký bên dưới để xác nhận hợp đồng
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-white">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: "signature-canvas border rounded bg-white",
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearSignature}
              disabled={isUploadingSignature}
            >
              Xóa
            </Button>
            <Button
              type="button"
              onClick={handleSaveSignature}
              disabled={isUploadingSignature}
            >
              {isUploadingSignature ? "Đang tải lên..." : "Lưu chữ ký"}
            </Button>
          </div>
          {signatureUrl && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Đã lưu chữ ký
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSigning}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSignContract}
            disabled={!signatureUrl || isSigning}
          >
            {isSigning ? "Đang xử lý..." : "Ký hợp đồng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

