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
import { Input } from "@/components/ui/input";
import {
  useVerifyIdentityMutation,
  useGetTenantContractDetailsQuery,
} from "@/services/contract/contract.service";
import { toast } from "sonner";
import { Upload, CheckCircle2, AlertCircle, FileImage } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VerifyIdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const VerifyIdentityDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: VerifyIdentityDialogProps) => {
  const [cccdFront, setCccdFront] = useState<File | null>(null);
  const [cccdBack, setCccdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [previewCccdFront, setPreviewCccdFront] = useState<string | null>(null);
  const [previewCccdBack, setPreviewCccdBack] = useState<string | null>(null);
  const [previewSelfie, setPreviewSelfie] = useState<string | null>(null);

  const { data: contractDetail } = useGetTenantContractDetailsQuery(
    contractId || "",
    {
      skip: !contractId || !open,
    }
  );

  const [verifyIdentity, { isLoading: isVerifying }] =
    useVerifyIdentityMutation();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCccdFront(null);
      setCccdBack(null);
      setSelfie(null);
      setPreviewCccdFront(null);
      setPreviewCccdBack(null);
      setPreviewSelfie(null);
    }
  }, [open]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cccdFront" | "cccdBack" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (JPG, PNG, ...)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === "cccdFront") {
        setCccdFront(file);
        setPreviewCccdFront(result);
      } else if (type === "cccdBack") {
        setCccdBack(file);
        setPreviewCccdBack(result);
      } else if (type === "selfie") {
        setSelfie(file);
        setPreviewSelfie(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (type: "cccdFront" | "cccdBack" | "selfie") => {
    if (type === "cccdFront") {
      setCccdFront(null);
      setPreviewCccdFront(null);
    } else if (type === "cccdBack") {
      setCccdBack(null);
      setPreviewCccdBack(null);
    } else if (type === "selfie") {
      setSelfie(null);
      setPreviewSelfie(null);
    }
  };

  const handleVerifyIdentity = async () => {
    if (!contractId) {
      toast.error("Không tìm thấy thông tin hợp đồng");
      return;
    }

    if (!cccdFront || !cccdBack || !selfie) {
      toast.error("Vui lòng tải lên đầy đủ 3 ảnh");
      return;
    }

    try {
      await verifyIdentity({
        id: contractId,
        data: {
          cccdFront,
          cccdBack,
          selfie,
        },
      }).unwrap();

      toast.success("Xác thực danh tính thành công!");
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Có lỗi xảy ra khi xác thực danh tính"
      );
    }
  };

  const renderUploadBox = (
    label: string,
    type: "cccdFront" | "cccdBack" | "selfie",
    file: File | null,
    preview: string | null,
    description: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      {preview ? (
        <Card>
          <CardContent className="p-3">
            <div className="relative">
              <img
                src={preview}
                alt={label}
                className="w-full h-80 object-cover rounded-md"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveFile(type)}
                >
                  Xóa
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{file?.name}</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, type)}
            className="hidden"
            id={`upload-${type}`}
          />
          <label
            htmlFor={`upload-${type}`}
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">
              Nhấn để tải lên ảnh
            </p>
            <p className="text-xs text-slate-500">PNG, JPG (tối đa 5MB)</p>
          </label>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Xác thực danh tính người thuê
          </DialogTitle>
          <DialogDescription>
            Vui lòng tải lên ảnh CCCD mặt trước, mặt sau và ảnh chân dung để xác
            thực danh tính trước khi ký hợp đồng
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Thông tin hợp đồng */}
          {contractDetail && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">
                      Hợp đồng:
                    </span>
                    <span className="text-blue-700">
                      {contractDetail.contract?.no || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">Phòng:</span>
                    <span className="text-blue-700">
                      {contractDetail.roomId?.roomNumber || "—"} -{" "}
                      {contractDetail.buildingId?.name || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">
                      Người thuê:
                    </span>
                    <span className="text-blue-700">
                      {contractDetail.B?.name || "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hướng dẫn */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm text-amber-800">
                  <p className="font-semibold">Lưu ý khi chụp ảnh:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Ảnh CCCD phải rõ nét, không bị mờ hoặc che khuất</li>
                    <li>Đảm bảo toàn bộ thông tin trên CCCD hiển thị đầy đủ</li>
                    <li>
                      Ảnh chân dung cần chụp rõ khuôn mặt, không đeo kính đen
                      hoặc khẩu trang
                    </li>
                    <li>
                      Chụp trong điều kiện ánh sáng tốt, tránh lóa hoặc tối
                    </li>
                    <li>Kích thước mỗi ảnh không vượt quá 5MB</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload sections */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {renderUploadBox(
                "Ảnh CCCD mặt trước",
                "cccdFront",
                cccdFront,
                previewCccdFront,
                "Chụp ảnh mặt trước CCCD/CMND với thông tin cá nhân rõ ràng"
              )}

              {renderUploadBox(
                "Ảnh CCCD mặt sau",
                "cccdBack",
                cccdBack,
                previewCccdBack,
                "Chụp ảnh mặt sau CCCD/CMND với thông tin nơi cấp rõ ràng"
              )}
            </div>

            {renderUploadBox(
              "Ảnh chân dung",
              "selfie",
              selfie,
              previewSelfie,
              "Chụp ảnh chân dung rõ mặt, không đeo kính đen hay khẩu trang"
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleVerifyIdentity}
            disabled={isVerifying || !cccdFront || !cccdBack || !selfie}
          >
            {isVerifying ? "Đang xác thực..." : "Xác thực danh tính"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
