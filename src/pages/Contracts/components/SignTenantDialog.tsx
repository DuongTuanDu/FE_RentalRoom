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
import {
  useSignTenantMutation,
  useGetTenantContractDetailsQuery,
} from "@/services/contract/contract.service";
import { toast } from "sonner";
import { uploadFile, UPLOAD_CLINSKIN_PRESET } from "@/helpers/cloudinary";
import { CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useFormatDate } from "@/hooks/useFormatDate";

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
  const formatDate = useFormatDate();
  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetTenantContractDetailsQuery(contractId || "", {
      skip: !contractId || !open,
    });

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 md:p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Ký hợp đồng</DialogTitle>
          <DialogDescription>
            Vui lòng xem lại thông tin hợp đồng và ký vào ô chữ ký bên dưới để
            xác nhận hợp đồng
          </DialogDescription>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : contractDetail ? (
          <div className="px-6 pb-6 space-y-6">
            {/* Contract Preview Header */}
            <div className="space-y-3 bg-muted/40 rounded-md pb-4">
              <div className="text-center">
                <div className="font-semibold">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div>ĐỘC LẬP – TỰ DO – HẠNH PHÚC</div>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-xl font-bold">HỢP ĐỒNG THUÊ PHÒNG</div>
                <div className="text-sm text-muted-foreground">
                  Số:{" "}
                  <span className="font-medium">
                    {contractDetail.contract?.no || "—"}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  Hôm nay, ngày{" "}
                  <span className="font-medium">
                    {contractDetail.contract?.signDate
                      ? formatDate(contractDetail.contract.signDate)
                      : "—"}
                  </span>{" "}
                  tại:{" "}
                  <span className="font-medium">
                    {contractDetail.contract?.signPlace || "—"}
                  </span>
                </div>
                <div className="font-semibold pt-2">
                  BÊN CHO THUÊ NHÀ (BÊN A):
                </div>
                <div>
                  Đại diện (Ông/Bà):{" "}
                  <span className="font-medium">
                    {contractDetail.A?.name || "—"}
                  </span>
                </div>
                <div>
                  Ngày sinh:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.dob
                      ? formatDate(contractDetail.A.dob)
                      : "—"}
                  </span>
                </div>
                <div>
                  CCCD:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.cccd || "—"}
                  </span>{" "}
                  Cấp ngày:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.cccdIssuedDate
                      ? formatDate(contractDetail.A.cccdIssuedDate)
                      : "—"}
                  </span>
                  , Nơi cấp:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.cccdIssuedPlace || "—"}
                  </span>
                </div>
                <div>
                  Hộ khẩu thường trú:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.permanentAddress || "—"}
                  </span>
                </div>
                <div>
                  Điện thoại:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.phone || "—"}
                  </span>
                </div>
                <div>
                  Email:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.email || "—"}
                  </span>
                </div>
                <div className="font-semibold pt-2">BÊN THUÊ NHÀ (BÊN B):</div>
                <div>
                  Đại diện (Ông/Bà):{" "}
                  <span className="font-medium">
                    {contractDetail.B?.name || "—"}
                  </span>
                </div>
                <div>
                  Ngày sinh:{" "}
                  <span className="font-medium">
                    {contractDetail.B?.dob
                      ? formatDate(contractDetail.B.dob)
                      : "—"}
                  </span>
                </div>
                <div>
                  CCCD:{" "}
                  <span className="font-medium">
                    {contractDetail.B?.cccd || "—"}
                  </span>{" "}
                  Cấp ngày:{" "}
                  <span className="font-medium">
                    {contractDetail.B?.cccdIssuedDate
                      ? formatDate(contractDetail.B.cccdIssuedDate)
                      : "—"}
                  </span>
                  , Nơi cấp:{" "}
                  <span className="font-medium">
                    {contractDetail.B?.cccdIssuedPlace || "—"}
                  </span>
                </div>
                <div>
                  Hộ khẩu thường trú:{" "}
                  <span className="font-medium">
                    {contractDetail.B?.permanentAddress || "—"}
                  </span>
                </div>
                <div>
                  Điện thoại:{" "}
                  <span className="font-medium">
                    {contractDetail.B?.phone || "—"}
                  </span>
                </div>
                <div>
                  Email:{" "}
                  <span className="font-medium">
                    {contractDetail.B?.email || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="space-y-4">
              <div className="font-semibold">Thông tin hợp đồng</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Giá thuê (VNĐ):</span>{" "}
                  <span className="font-medium">
                    {contractDetail.contract?.price
                      ? new Intl.NumberFormat("vi-VN").format(
                          contractDetail.contract.price
                        )
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiền cọc (VNĐ):</span>{" "}
                  <span className="font-medium">
                    {contractDetail.contract?.deposit
                      ? new Intl.NumberFormat("vi-VN").format(
                          contractDetail.contract.deposit
                        )
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày bắt đầu:</span>{" "}
                  <span className="font-medium">
                    {contractDetail.contract?.startDate
                      ? formatDate(contractDetail.contract.startDate)
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày kết thúc:</span>{" "}
                  <span className="font-medium">
                    {contractDetail.contract?.endDate
                      ? formatDate(contractDetail.contract.endDate)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms and Regulations */}
            {(contractDetail.terms && contractDetail.terms.length > 0) ||
            (contractDetail.regulations &&
              contractDetail.regulations.length > 0) ? (
              <div className="space-y-4">
                {contractDetail.terms && contractDetail.terms.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold">Nội dung điều khoản</div>
                    <div className="space-y-2 text-sm">
                      {[...contractDetail.terms]
                        .sort((a, b) => a.order - b.order)
                        .map((term, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="font-medium">{term.name}</div>
                            <div className="text-muted-foreground mt-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: term.description,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {contractDetail.regulations &&
                  contractDetail.regulations.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-semibold">Nội dung quy định</div>
                      <div className="space-y-2 text-sm">
                        {[...contractDetail.regulations]
                          .sort((a, b) => a.order - b.order)
                          .map((reg, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="font-medium">{reg.title}</div>
                              <div className="text-muted-foreground mt-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: reg.description,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : null}

            {/* Roommates */}
            {contractDetail.roommates &&
              contractDetail.roommates.length > 0 && (
                <div className="space-y-4">
                  <div className="font-semibold">Người ở cùng</div>
                  <div className="space-y-2 text-sm">
                    {contractDetail.roommates.map((roommate, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-lg space-y-1"
                      >
                        <div className="font-medium">
                          Người ở cùng {index + 1}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Họ tên:</span>{" "}
                          <span className="font-medium">
                            {roommate.name || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Ngày sinh:
                          </span>{" "}
                          <span className="font-medium">
                            {roommate.dob ? formatDate(roommate.dob) : "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CCCD:</span>{" "}
                          <span className="font-medium">
                            {roommate.cccd || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Số điện thoại:
                          </span>{" "}
                          <span className="font-medium">
                            {roommate.phone || "—"}
                          </span>
                        </div>
                        {roommate.permanentAddress && (
                          <div>
                            <span className="text-muted-foreground">
                              Địa chỉ:
                            </span>{" "}
                            <span className="font-medium">
                              {roommate.permanentAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Bikes */}
            {contractDetail.bikes && contractDetail.bikes.length > 0 && (
              <div className="space-y-4">
                <div className="font-semibold">Xe máy</div>
                <div className="space-y-2 text-sm">
                  {contractDetail.bikes.map((bike, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium">Xe máy {index + 1}</div>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div>
                          <span className="text-muted-foreground">
                            Biển số:
                          </span>{" "}
                          <span className="font-medium">
                            {bike.bikeNumber || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Hãng xe:
                          </span>{" "}
                          <span className="font-medium">
                            {bike.brand || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Màu sắc:
                          </span>{" "}
                          <span className="font-medium">
                            {bike.color || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="font-semibold">Chữ ký</div>
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Landlord Signature */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Chữ ký chủ trọ
                  </div>
                  {contractDetail.landlordSignatureUrl ? (
                    <div className="flex justify-center items-center border rounded-lg p-4 bg-white min-h-[200px]">
                      <img
                        src={contractDetail.landlordSignatureUrl}
                        alt="Chữ ký chủ trọ"
                        className="max-w-full h-auto"
                        style={{ minHeight: "200px" }}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center border rounded-lg p-4 bg-white min-h-[200px] text-muted-foreground text-sm">
                      Chưa có chữ ký
                    </div>
                  )}
                </div>

                {/* Right: Tenant Signature */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Chữ ký của tôi
                  </div>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-white">
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        width: 274,
                        height: 200,
                        className: "signature-canvas border rounded bg-white",
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearSignature}
                      disabled={isUploadingSignature}
                    >
                      Xóa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveSignature}
                      disabled={isUploadingSignature}
                    >
                      {isUploadingSignature ? "Đang tải lên..." : "Lưu chữ ký"}
                    </Button>
                  </div>
                  {signatureUrl && (
                    <div className="text-sm text-green-600 flex items-center gap-1 justify-end pt-2">
                      <CheckCircle className="w-4 h-4" />
                      Đã lưu chữ ký
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={handleClose} disabled={isSigning}>
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
