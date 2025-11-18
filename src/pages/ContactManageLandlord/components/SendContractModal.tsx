import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SignatureCanvas from "react-signature-canvas";
import type { IContractData, IUpdateContractRequest } from "@/types/contract";
import {
  useUpdateContractMutation,
  useSignLandlordMutation,
  useSendToTenantMutation,
} from "@/services/contract/contract.service";
import { uploadFile, UPLOAD_CLINSKIN_PRESET } from "@/helpers/cloudinary";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractData: IContractData | null;
  refetch: () => void;
}

export const SendContractModal = ({
  open,
  onOpenChange,
  contractData,
  refetch
}: Props) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [isSigning, setIsSigning] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [contractNo, setContractNo] = useState("");
  const [signPlace, setSignPlace] = useState("");
  const [signDate, setSignDate] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Person A (Landlord) states
  const [personAName, setPersonAName] = useState("");
  const [personADob, setPersonADob] = useState("");
  const [personACccd, setPersonACccd] = useState("");
  const [personACccdIssuedDate, setPersonACccdIssuedDate] = useState("");
  const [personACccdIssuedPlace, setPersonACccdIssuedPlace] = useState("");
  const [personAPermanentAddress, setPersonAPermanentAddress] = useState("");
  const [personAPhone, setPersonAPhone] = useState("");
  const [personAEmail, setPersonAEmail] = useState("");
  const [personABankAccount, setPersonABankAccount] = useState("");

  const [updateContract, { isLoading: isUpdating }] =
    useUpdateContractMutation();
  const [signLandlord, { isLoading: isSigningLandlord }] =
    useSignLandlordMutation();
  const [sendToTenant, { isLoading: isSending }] = useSendToTenantMutation();

  useEffect(() => {
    if (open && contractData) {
      // Fill contract info
      setPrice(contractData.contract.price.toString());
      setStartDate("");
      setEndDate("");
      setDeposit("");
      setContractNo("");
      setSignPlace("");
      setSignDate(new Date().toISOString().split("T")[0]);

      // Fill Person A (Landlord) - from contractData.A
      setPersonAName(contractData.A.name || "");
      setPersonADob(contractData.A.dob || "");
      setPersonACccd(contractData.A.cccd || "");
      setPersonACccdIssuedDate(contractData.A.cccdIssuedDate || "");
      setPersonACccdIssuedPlace(contractData.A.cccdIssuedPlace || "");
      setPersonAPermanentAddress(contractData.A.permanentAddress || "");
      setPersonAPhone(contractData.A.phone || "");
      setPersonAEmail(contractData.A.email || "");
      setPersonABankAccount("");

      // Reset signature
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
      setSignatureUrl("");
      setIsSigning(false);
    }
  }, [open, contractData]);

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureUrl("");
      setIsSigning(false);
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

      // Convert data URL to Blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Upload to cloudinary
      const uploadResult = await uploadFile({
        file: blob,
        type: UPLOAD_CLINSKIN_PRESET,
      });

      setSignatureUrl(uploadResult.secure_url);
      setIsSigning(true);
      toast.success("Lưu chữ ký thành công");
    } catch (error: any) {
      console.error("Error uploading signature:", error);
      toast.error(error?.message?.message || "Không thể lưu chữ ký");
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleSubmit = async () => {
    if (!contractData) return;

    // Validate required fields
    if (
      !contractNo ||
      !signPlace ||
      !signDate ||
      !price ||
      !deposit ||
      !startDate ||
      !endDate
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin hợp đồng");
      return;
    }

    if (
      !personAName ||
      !personADob ||
      !personACccd ||
      !personAPhone ||
      !personAEmail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bên cho thuê");
      return;
    }

    try {
      // Prepare update data
      const updateData: IUpdateContractRequest = {
        A: {
          name: personAName,
          dob: personADob,
          cccd: personACccd,
          cccdIssuedDate: personACccdIssuedDate,
          cccdIssuedPlace: personACccdIssuedPlace,
          permanentAddress: personAPermanentAddress,
          phone: personAPhone,
          email: personAEmail,
        },
        contract: {
          no: contractNo,
          signPlace: signPlace,
          signDate: signDate,
          price: parseFloat(price),
          deposit: parseFloat(deposit),
          startDate: startDate,
          endDate: endDate,
        },
        termIds: contractData.terms.map((term) => ({
          name: term.name,
          description: term.description,
          order: term.order,
        })),
        regulationIds: contractData.regulations.map((reg) => ({
          title: reg.title,
          description: reg.description,
          effectiveFrom: reg.effectiveFrom,
          order: reg.order,
        })),
      };

      // Update contract first
      await updateContract({
        id: contractData._id,
        data: updateData,
      }).unwrap();

      refetch();

      // If signature exists and has been saved, sign the contract
      if (signatureUrl && isSigning) {
        try {
          // Sign the contract
          await signLandlord({
            id: contractData._id,
            data: { signatureUrl },
          }).unwrap();

          // Send to tenant after signing successfully
          await sendToTenant({ id: contractData._id }).unwrap();
          toast.success("Gửi hợp đồng tới khách thuê thành công");
        } catch (signError: any) {
          console.error("Error signing or sending contract:", signError);
          toast.error(
            signError?.message?.message ||
              "Có lỗi xảy ra khi ký hoặc gửi hợp đồng"
          );
          // Contract was updated but signing/sending failed
          toast.success(
            "Cập nhật hợp đồng thành công, nhưng chưa gửi tới khách thuê"
          );
        }
      } else {
        toast.success("Cập nhật hợp đồng thành công");
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting contract:", error);
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi cập nhật hợp đồng"
      );
    }
  };

  if (!contractData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-0 md:p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Gửi hợp đồng</DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-6 space-y-6">
          {/* Preview Header */}
          <div className="space-y-3 bg-muted/40 rounded-md">
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
                <Input
                  value={contractNo}
                  onChange={(e) => setContractNo(e.target.value)}
                  placeholder="Nhập số hợp đồng"
                  className="inline-block w-32 h-6 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                Hôm nay, ngày{" "}
                <Input
                  type="date"
                  value={signDate}
                  onChange={(e) => setSignDate(e.target.value)}
                  className="inline-block w-32 h-6 text-sm"
                />{" "}
                tại:{" "}
                <Input
                  value={signPlace}
                  onChange={(e) => setSignPlace(e.target.value)}
                  placeholder="Nhập địa điểm"
                  className="inline-block w-48 h-6 text-sm"
                />
              </div>
              <div className="font-semibold">BÊN CHO THUÊ NHÀ (BÊN A):</div>
              <div>
                Đại diện (Ông/Bà):{" "}
                <Input
                  value={personAName}
                  onChange={(e) => setPersonAName(e.target.value)}
                  placeholder="Nhập tên"
                  className="inline-block w-48 h-6 text-sm"
                />
              </div>
              <div>
                Ngày sinh:{" "}
                <Input
                  type="date"
                  value={personADob}
                  onChange={(e) => setPersonADob(e.target.value)}
                  className="inline-block w-32 h-6 text-sm"
                />
              </div>
              <div>
                CCCD:{" "}
                <Input
                  value={personACccd}
                  onChange={(e) => setPersonACccd(e.target.value)}
                  placeholder="Nhập số CCCD"
                  className="inline-block w-40 h-6 text-sm"
                />{" "}
                Cấp ngày:{" "}
                <Input
                  type="date"
                  value={personACccdIssuedDate}
                  onChange={(e) => setPersonACccdIssuedDate(e.target.value)}
                  className="inline-block w-32 h-6 text-sm"
                />
                , Nơi cấp:{" "}
                <Input
                  value={personACccdIssuedPlace}
                  onChange={(e) => setPersonACccdIssuedPlace(e.target.value)}
                  placeholder="Nhập nơi cấp"
                  className="inline-block w-40 h-6 text-sm"
                />
              </div>
              <div>
                Hộ khẩu thường trú:{" "}
                <Input
                  value={personAPermanentAddress}
                  onChange={(e) => setPersonAPermanentAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="inline-block w-64 h-6 text-sm"
                />
              </div>
              <div>
                Điện thoại:{" "}
                <Input
                  value={personAPhone}
                  onChange={(e) => setPersonAPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="inline-block w-40 h-6 text-sm"
                />
              </div>
              <div>
                Email:{" "}
                <Input
                  type="email"
                  value={personAEmail}
                  onChange={(e) => setPersonAEmail(e.target.value)}
                  placeholder="Nhập email"
                  className="inline-block w-48 h-6 text-sm"
                />
              </div>
              <div>
                STK:{" "}
                <Input
                  value={personABankAccount}
                  onChange={(e) => setPersonABankAccount(e.target.value)}
                  placeholder="Nhập số tài khoản"
                  className="inline-block w-40 h-6 text-sm"
                />
              </div>
              <div className="font-semibold pt-2">BÊN THUÊ NHÀ (BÊN B):</div>
              <div>Đại diện (Ông/Bà): {contractData?.B?.name || "-"}</div>
              <div>
                CCCD/Passport: {contractData.B?.cccd || "-"} Cấp ngày:{" "}
                {contractData.B?.cccdIssuedDate || "-"}, Tại:{" "}
                {contractData.B?.cccdIssuedPlace || "-"}
              </div>
              <div>
                Hộ khẩu thường trú: {contractData.B?.permanentAddress || "-"}
              </div>
              <div>Điện thoại: {contractData.B?.phone || "-"}</div>
            </div>
          </div>

          {/* Contract Details Form */}
          <div className="space-y-4">
            <div className="font-semibold">Thông tin hợp đồng</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá thuê (VNĐ)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Nhập giá thuê"
                />
              </div>
              <div className="space-y-2">
                <Label>Tiền cọc (VNĐ)</Label>
                <Input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="Nhập tiền cọc"
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Terms and Regulations */}
          {(contractData.terms.length > 0 ||
            contractData.regulations.length > 0) && (
            <div className="space-y-4">
              {contractData.terms.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Nội dung điều khoản</div>
                  <div className="space-y-2 text-sm">
                    {contractData.terms
                      .sort((a, b) => a.order - b.order)
                      .map((term, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="font-medium">{term.name}</div>
                          <div className="text-muted-foreground mt-1">
                            {term.description}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {contractData.regulations.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Nội dung quy định</div>
                  <div className="space-y-2 text-sm">
                    {contractData.regulations
                      .sort((a, b) => a.order - b.order)
                      .map((reg, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="font-medium">{reg.title}</div>
                          <div className="text-muted-foreground mt-1">
                            {reg.description}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Signature Section */}
          <div className="space-y-4">
            <div className="font-semibold">Chữ ký chủ trọ</div>
            <div className="space-y-2">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 667,
                  height: 200,
                  className: "signature-canvas border rounded bg-white",
                }}
              />
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
              {isSigning && signatureUrl && (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Đã lưu chữ ký
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating || isSigningLandlord || isSending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || isSigningLandlord || isSending}
          >
            {isUpdating || isSigningLandlord || isSending
              ? "Đang xử lý..."
              : "Gửi hợp đồng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
