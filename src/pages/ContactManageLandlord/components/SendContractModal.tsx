import { useEffect, useRef, useState, useMemo } from "react";
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
import type { Element } from "slate";
import { SlateEditor } from "@/pages/TermManagement/components/SlateEditor";
import { htmlToSlate, slateToHtml } from "@/pages/TermManagement/components/slateHelpers";

type SlateValue = Element[];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractData: IContractData | null;
}

export const SendContractModal = ({
  open,
  onOpenChange,
  contractData,
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

  // Terms states
  const [termSlateValues, setTermSlateValues] = useState<Record<number, SlateValue>>({});
  const [termSlateValuesInitialized, setTermSlateValuesInitialized] = useState(false);
  const [termNames, setTermNames] = useState<Record<number, string>>({});

  // Regulations states
  const [regulationSlateValues, setRegulationSlateValues] = useState<Record<number, SlateValue>>({});
  const [regulationSlateValuesInitialized, setRegulationSlateValuesInitialized] = useState(false);
  const [regulationNames, setRegulationNames] = useState<Record<number, string>>({});

  const [updateContract, { isLoading: isUpdating }] =
    useUpdateContractMutation();
  const [signLandlord, { isLoading: isSigningLandlord }] =
    useSignLandlordMutation();
  const [sendToTenant, { isLoading: isSending }] = useSendToTenantMutation();

  // Memoize sorted terms to ensure consistency
  const sortedTerms = useMemo(() => {
    if (!contractData?.terms || contractData.terms.length === 0) {
      return [];
    }
    return [...contractData.terms].sort((a, b) => a.order - b.order);
  }, [contractData?.terms]);

  // Memoize sorted regulations to ensure consistency
  const sortedRegulations = useMemo(() => {
    if (!contractData?.regulations || contractData.regulations.length === 0) {
      return [];
    }
    return [...contractData.regulations].sort((a, b) => a.order - b.order);
  }, [contractData?.regulations]);

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

      // Initialize Slate values and names for terms
      if (sortedTerms.length > 0) {
        const newTermSlateValues: Record<number, SlateValue> = {};
        const newTermNames: Record<number, string> = {};
        sortedTerms.forEach((term, index) => {
          const html = term.description || "";
          newTermSlateValues[index] = htmlToSlate(html);
          newTermNames[index] = term.name || "";
        });
        setTermSlateValues(newTermSlateValues);
        setTermNames(newTermNames);
        setTermSlateValuesInitialized(true);
      } else {
        setTermSlateValues({});
        setTermNames({});
        setTermSlateValuesInitialized(false);
      }

      // Initialize Slate values and names for regulations
      if (sortedRegulations.length > 0) {
        const newRegulationSlateValues: Record<number, SlateValue> = {};
        const newRegulationNames: Record<number, string> = {};
        sortedRegulations.forEach((reg, index) => {
          const html = reg.description || "";
          newRegulationSlateValues[index] = htmlToSlate(html);
          newRegulationNames[index] = reg.title || "";
        });
        setRegulationSlateValues(newRegulationSlateValues);
        setRegulationNames(newRegulationNames);
        setRegulationSlateValuesInitialized(true);
      } else {
        setRegulationSlateValues({});
        setRegulationNames({});
        setRegulationSlateValuesInitialized(false);
      }
    } else if (!open) {
      // Reset when dialog closes
      setTermSlateValues({});
      setTermNames({});
      setTermSlateValuesInitialized(false);
      setRegulationSlateValues({});
      setRegulationNames({});
      setRegulationSlateValuesInitialized(false);
    }
  }, [open, contractData, sortedTerms, sortedRegulations]);

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
        terms: sortedTerms.map((term, index) => ({
          name: termNames[index] || term.name,
          description: termSlateValues[index]
            ? slateToHtml(termSlateValues[index])
            : term.description,
          order: term.order,
        })),
        regulations: sortedRegulations.map((reg, index) => ({
          title: regulationNames[index] || reg.title,
          description: regulationSlateValues[index]
            ? slateToHtml(regulationSlateValues[index])
            : reg.description,
          effectiveFrom: reg.effectiveFrom,
          order: reg.order,
        })),
      };

      // Update contract first
      await updateContract({
        id: contractData._id,
        data: updateData,
      }).unwrap();

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
              {sortedTerms.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Nội dung điều khoản</div>
                  <div className="space-y-4 text-sm">
                    {sortedTerms.map((term, index) => {
                      const slateValue = termSlateValues[index];
                      const termKey = `term-${term.order}`;
                      return (
                        <div key={termKey} className="p-3 bg-slate-50 rounded-lg space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Tên điều khoản</Label>
                            <Input
                              value={termNames[index] || term.name || ""}
                              onChange={(e) => {
                                setTermNames((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }));
                              }}
                              placeholder="Nhập tên điều khoản"
                              className="h-8 text-sm font-medium"
                            />
                          </div>
                          <div className="mt-1">
                            {slateValue && termSlateValuesInitialized ? (
                              <SlateEditor
                                key={`${termKey}-editor-${term.description?.slice(0, 20) || 'empty'}`}
                                value={slateValue}
                                onChange={(value) => {
                                  setTermSlateValues((prev) => ({
                                    ...prev,
                                    [index]: value,
                                  }));
                                }}
                                placeholder="Nhập mô tả điều khoản..."
                              />
                            ) : (
                              <div className="flex items-center justify-center p-4 border border-input rounded-md bg-background">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sortedRegulations.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Nội dung quy định</div>
                  <div className="space-y-4 text-sm">
                    {sortedRegulations.map((reg, index) => {
                      const slateValue = regulationSlateValues[index];
                      const regKey = `reg-${reg.order}`;
                      return (
                        <div key={regKey} className="p-3 bg-slate-50 rounded-lg space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Tên quy định</Label>
                            <Input
                              value={regulationNames[index] || reg.title || ""}
                              onChange={(e) => {
                                setRegulationNames((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }));
                              }}
                              placeholder="Nhập tên quy định"
                              className="h-8 text-sm font-medium"
                            />
                          </div>
                          <div className="mt-1">
                            {slateValue && regulationSlateValuesInitialized ? (
                              <SlateEditor
                                key={`${regKey}-editor-${reg.description?.slice(0, 20) || 'empty'}`}
                                value={slateValue}
                                onChange={(value) => {
                                  setRegulationSlateValues((prev) => ({
                                    ...prev,
                                    [index]: value,
                                  }));
                                }}
                                placeholder="Nhập mô tả quy định..."
                              />
                            ) : (
                              <div className="flex items-center justify-center p-4 border border-input rounded-md bg-background">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
