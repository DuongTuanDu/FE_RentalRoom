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
import {
  validateContractNo,
  validateCCCD,
  validatePhone,
  validateEmail,
  validateRequired,
  validateNumber,
} from "@/helpers/validation";
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
  
  // Error states
  const [contractNoError, setContractNoError] = useState("");
  const [signDateError, setSignDateError] = useState("");
  const [signPlaceError, setSignPlaceError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [depositError, setDepositError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [personANameError, setPersonANameError] = useState("");
  const [personADobError, setPersonADobError] = useState("");
  const [personACccdError, setPersonACccdError] = useState("");
  const [personACccdIssuedDateError, setPersonACccdIssuedDateError] = useState("");
  const [personACccdIssuedPlaceError, setPersonACccdIssuedPlaceError] = useState("");
  const [personAPermanentAddressError, setPersonAPermanentAddressError] = useState("");
  const [personAPhoneError, setPersonAPhoneError] = useState("");
  const [personAEmailError, setPersonAEmailError] = useState("");
  const [personABankAccountError, setPersonABankAccountError] = useState("");

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
      // Reset errors
      setStartDateError("");
      setEndDateError("");
      setPersonABankAccountError("");

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
      // Reset errors
      setStartDateError("");
      setEndDateError("");
      setPersonABankAccountError("");
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

    // Reset all errors
    setContractNoError("");
    setSignDateError("");
    setSignPlaceError("");
    setPriceError("");
    setDepositError("");
    setStartDateError("");
    setEndDateError("");
    setPersonANameError("");
    setPersonADobError("");
    setPersonACccdError("");
    setPersonACccdIssuedDateError("");
    setPersonACccdIssuedPlaceError("");
    setPersonAPermanentAddressError("");
    setPersonAPhoneError("");
    setPersonAEmailError("");
    setPersonABankAccountError("");

    let hasError = false;
    let firstErrorField: string | null = null;

    // Validate contractNo
    const contractNoErrorMsg = validateContractNo(contractNo);
    if (contractNoErrorMsg) {
      setContractNoError(contractNoErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "contractNo";
    }

    // Validate signDate
    const signDateErrorMsg = validateRequired(signDate, "Ngày ký");
    if (signDateErrorMsg) {
      setSignDateError(signDateErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "signDate";
    }

    // Validate signPlace
    const signPlaceErrorMsg = validateRequired(signPlace, "Địa điểm ký");
    if (signPlaceErrorMsg) {
      setSignPlaceError(signPlaceErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "signPlace";
    }

    // Validate price
    const priceErrorMsg = validateNumber(price, "Giá thuê");
    if (priceErrorMsg) {
      setPriceError(priceErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "price";
    }

    // Validate deposit
    const depositErrorMsg = validateNumber(deposit, "Tiền cọc");
    if (depositErrorMsg) {
      setDepositError(depositErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "deposit";
    }

    // Validate startDate
    const startDateTrimmed = startDate.trim();
    const startDateErrorMsg = validateRequired(startDateTrimmed, "Ngày bắt đầu");
    if (startDateErrorMsg) {
      setStartDateError(startDateErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "startDate";
    }

    // Validate endDate
    const endDateTrimmed = endDate.trim();
    const endDateErrorMsg = validateRequired(endDateTrimmed, "Ngày kết thúc");
    if (endDateErrorMsg) {
      setEndDateError(endDateErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "endDate";
    }

    // Validate date range
    if (startDateTrimmed && endDateTrimmed) {
      if (startDateTrimmed > endDateTrimmed) {
        setStartDateError("Ngày bắt đầu không được sau ngày kết thúc");
        setEndDateError("Ngày kết thúc không được trước ngày bắt đầu");
        hasError = true;
        if (!firstErrorField) firstErrorField = "startDate";
      }
    }

    // Validate personAName
    const personANameErrorMsg = validateRequired(personAName, "Tên bên cho thuê");
    if (personANameErrorMsg) {
      setPersonANameError(personANameErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personAName";
    }

    // Validate personADob
    const personADobErrorMsg = validateRequired(personADob, "Ngày sinh");
    if (personADobErrorMsg) {
      setPersonADobError(personADobErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personADob";
    }

    // Validate personACccd
    const personACccdErrorMsg = validateCCCD(personACccd);
    if (personACccdErrorMsg) {
      setPersonACccdError(personACccdErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personACccd";
    }

    // Validate personACccdIssuedDate
    const personACccdIssuedDateErrorMsg = validateRequired(personACccdIssuedDate, "Ngày cấp CCCD");
    if (personACccdIssuedDateErrorMsg) {
      setPersonACccdIssuedDateError(personACccdIssuedDateErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personACccdIssuedDate";
    }

    // Validate personACccdIssuedPlace
    const personACccdIssuedPlaceErrorMsg = validateRequired(personACccdIssuedPlace, "Nơi cấp CCCD");
    if (personACccdIssuedPlaceErrorMsg) {
      setPersonACccdIssuedPlaceError(personACccdIssuedPlaceErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personACccdIssuedPlace";
    }

    // Validate personAPermanentAddress
    const personAPermanentAddressErrorMsg = validateRequired(personAPermanentAddress, "Hộ khẩu thường trú");
    if (personAPermanentAddressErrorMsg) {
      setPersonAPermanentAddressError(personAPermanentAddressErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personAPermanentAddress";
    }

    // Validate personAPhone
    const personAPhoneErrorMsg = validatePhone(personAPhone);
    if (personAPhoneErrorMsg) {
      setPersonAPhoneError(personAPhoneErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personAPhone";
    }

    // Validate personAEmail
    const personAEmailErrorMsg = validateEmail(personAEmail);
    if (personAEmailErrorMsg) {
      setPersonAEmailError(personAEmailErrorMsg);
      hasError = true;
      if (!firstErrorField) firstErrorField = "personAEmail";
    }

    // Validate personABankAccount (STK) - nếu có giá trị thì phải là số
    if (personABankAccount && personABankAccount.trim() !== "") {
      if (!/^\d+$/.test(personABankAccount.trim())) {
        setPersonABankAccountError("Số tài khoản chỉ được chứa số");
        hasError = true;
        if (!firstErrorField) firstErrorField = "personABankAccount";
      } else if (personABankAccount.trim().length < 8 || personABankAccount.trim().length > 19) {
        setPersonABankAccountError("Số tài khoản phải có từ 8 đến 19 ký tự");
        hasError = true;
        if (!firstErrorField) firstErrorField = "personABankAccount";
      }
    }

    if (hasError) {
      toast.error("Vui lòng kiểm tra lại các trường thông tin");
      // Scroll to first error field
      if (firstErrorField) {
        const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
        if (errorElement) {
          (errorElement as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
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
                <div>
                  Số:{" "}
                  <Input
                    data-field="contractNo"
                    value={contractNo}
                    onChange={(e) => {
                      setContractNo(e.target.value);
                      const error = validateContractNo(e.target.value);
                      setContractNoError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateContractNo(contractNo);
                      setContractNoError(error || "");
                    }}
                    placeholder="Nhập số hợp đồng"
                    className={`inline-block w-32 h-6 text-sm ${contractNoError ? "border-red-500" : ""}`}
                  />
                </div>
                {contractNoError && (
                  <p className="text-xs text-red-500 mt-1 ml-0">{contractNoError}</p>
                )}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <div>
                  Hôm nay, ngày{" "}
                  <Input
                    data-field="signDate"
                    type="date"
                    value={signDate}
                    onChange={(e) => {
                      setSignDate(e.target.value);
                      const error = validateRequired(e.target.value, "Ngày ký");
                      setSignDateError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateRequired(signDate, "Ngày ký");
                      setSignDateError(error || "");
                    }}
                    className={`inline-block w-32 h-6 text-sm ${signDateError ? "border-red-500" : ""}`}
                  />{" "}
                  tại:{" "}
                  <Input
                    data-field="signPlace"
                    value={signPlace}
                    onChange={(e) => {
                      setSignPlace(e.target.value);
                      const error = validateRequired(e.target.value, "Địa điểm ký");
                      setSignPlaceError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateRequired(signPlace, "Địa điểm ký");
                      setSignPlaceError(error || "");
                    }}
                    placeholder="Nhập địa điểm"
                    className={`inline-block w-48 h-6 text-sm ${signPlaceError ? "border-red-500" : ""}`}
                  />
                </div>
                {(signDateError || signPlaceError) && (
                  <div className="text-xs text-red-500 mt-1">
                    {signDateError && <p>{signDateError}</p>}
                    {signPlaceError && <p>{signPlaceError}</p>}
                  </div>
                )}
              </div>
              <div className="font-semibold">BÊN CHO THUÊ NHÀ (BÊN A):</div>
              <div>
                <div>
                  Đại diện (Ông/Bà):{" "}
                  <Input
                    data-field="personAName"
                    value={personAName}
                    onChange={(e) => {
                      setPersonAName(e.target.value);
                      const error = validateRequired(e.target.value, "Tên bên cho thuê");
                      setPersonANameError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateRequired(personAName, "Tên bên cho thuê");
                      setPersonANameError(error || "");
                    }}
                    placeholder="Nhập tên"
                    className={`inline-block w-48 h-6 text-sm ${personANameError ? "border-red-500" : ""}`}
                  />
                </div>
                {personANameError && (
                  <p className="text-xs text-red-500 mt-1">{personANameError}</p>
                )}
              </div>
              <div>
                <div>
                  Ngày sinh:{" "}
                  <Input
                    data-field="personADob"
                    type="date"
                    value={personADob}
                    onChange={(e) => {
                      setPersonADob(e.target.value);
                      const error = validateRequired(e.target.value, "Ngày sinh");
                      setPersonADobError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateRequired(personADob, "Ngày sinh");
                      setPersonADobError(error || "");
                    }}
                    className={`inline-block w-32 h-6 text-sm ${personADobError ? "border-red-500" : ""}`}
                  />
                </div>
                {personADobError && (
                  <p className="text-xs text-red-500 mt-1">{personADobError}</p>
                )}
              </div>
              <div>
                <div>
                  CCCD:{" "}
                  <Input
                    data-field="personACccd"
                    value={personACccd}
                    onChange={(e) => {
                      setPersonACccd(e.target.value);
                      const error = validateCCCD(e.target.value);
                      setPersonACccdError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateCCCD(personACccd);
                      setPersonACccdError(error || "");
                    }}
                    placeholder="Nhập số CCCD"
                    className={`inline-block w-40 h-6 text-sm ${personACccdError ? "border-red-500" : ""}`}
                  />{" "}
                  Cấp ngày:{" "}
                  <Input
                    data-field="personACccdIssuedDate"
                    type="date"
                    value={personACccdIssuedDate}
                    onChange={(e) => {
                      setPersonACccdIssuedDate(e.target.value);
                      const error = validateRequired(e.target.value, "Ngày cấp CCCD");
                      setPersonACccdIssuedDateError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateRequired(personACccdIssuedDate, "Ngày cấp CCCD");
                      setPersonACccdIssuedDateError(error || "");
                    }}
                    className={`inline-block w-32 h-6 text-sm ${personACccdIssuedDateError ? "border-red-500" : ""}`}
                  />
                  , Nơi cấp:{" "}
                  <Input
                    data-field="personACccdIssuedPlace"
                    value={personACccdIssuedPlace}
                    onChange={(e) => {
                      setPersonACccdIssuedPlace(e.target.value);
                      const error = validateRequired(e.target.value, "Nơi cấp CCCD");
                      setPersonACccdIssuedPlaceError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateRequired(personACccdIssuedPlace, "Nơi cấp CCCD");
                      setPersonACccdIssuedPlaceError(error || "");
                    }}
                    placeholder="Nhập nơi cấp"
                    className={`inline-block w-40 h-6 text-sm ${personACccdIssuedPlaceError ? "border-red-500" : ""}`}
                  />
                </div>
                {(personACccdError || personACccdIssuedDateError || personACccdIssuedPlaceError) && (
                  <div className="text-xs text-red-500 mt-1">
                    {personACccdError && <p>{personACccdError}</p>}
                    {personACccdIssuedDateError && <p>{personACccdIssuedDateError}</p>}
                    {personACccdIssuedPlaceError && <p>{personACccdIssuedPlaceError}</p>}
                  </div>
                )}
              </div>
              <div>
                <div>
                  Hộ khẩu thường trú:{" "}
                  <Input
                    data-field="personAPermanentAddress"
                    value={personAPermanentAddress}
                    onChange={(e) => {
                      setPersonAPermanentAddress(e.target.value);
                      const error = validateRequired(e.target.value, "Hộ khẩu thường trú");
                      setPersonAPermanentAddressError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateRequired(personAPermanentAddress, "Hộ khẩu thường trú");
                      setPersonAPermanentAddressError(error || "");
                    }}
                    placeholder="Nhập địa chỉ"
                    className={`inline-block w-64 h-6 text-sm ${personAPermanentAddressError ? "border-red-500" : ""}`}
                  />
                </div>
                {personAPermanentAddressError && (
                  <p className="text-xs text-red-500 mt-1">{personAPermanentAddressError}</p>
                )}
              </div>
              <div>
                <div>
                  Điện thoại:{" "}
                  <Input
                    data-field="personAPhone"
                    value={personAPhone}
                    onChange={(e) => {
                      setPersonAPhone(e.target.value);
                      const error = validatePhone(e.target.value);
                      setPersonAPhoneError(error || "");
                    }}
                    onBlur={() => {
                      const error = validatePhone(personAPhone);
                      setPersonAPhoneError(error || "");
                    }}
                    placeholder="Nhập số điện thoại"
                    className={`inline-block w-40 h-6 text-sm ${personAPhoneError ? "border-red-500" : ""}`}
                  />
                </div>
                {personAPhoneError && (
                  <p className="text-xs text-red-500 mt-1">{personAPhoneError}</p>
                )}
              </div>
              <div>
                <div>
                  Email:{" "}
                  <Input
                    data-field="personAEmail"
                    type="email"
                    value={personAEmail}
                    onChange={(e) => {
                      setPersonAEmail(e.target.value);
                      const error = validateEmail(e.target.value);
                      setPersonAEmailError(error || "");
                    }}
                    onBlur={() => {
                      const error = validateEmail(personAEmail);
                      setPersonAEmailError(error || "");
                    }}
                    placeholder="Nhập email"
                    className={`inline-block w-48 h-6 text-sm ${personAEmailError ? "border-red-500" : ""}`}
                  />
                </div>
                {personAEmailError && (
                  <p className="text-xs text-red-500 mt-1">{personAEmailError}</p>
                )}
              </div>
              <div>
                <div>
                  STK:{" "}
                  <Input
                    data-field="personABankAccount"
                    value={personABankAccount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPersonABankAccount(value);
                      // Reset error khi người dùng thay đổi
                      setPersonABankAccountError("");
                      // Validate ngay khi thay đổi nếu có giá trị
                      if (value && value.trim() !== "") {
                        if (!/^\d+$/.test(value.trim())) {
                          setPersonABankAccountError("Số tài khoản chỉ được chứa số");
                        } else if (value.trim().length < 8 || value.trim().length > 19) {
                          setPersonABankAccountError("Số tài khoản phải có từ 8 đến 19 ký tự");
                        }
                      }
                    }}
                    onBlur={() => {
                      // Validate khi blur
                      if (personABankAccount && personABankAccount.trim() !== "") {
                        if (!/^\d+$/.test(personABankAccount.trim())) {
                          setPersonABankAccountError("Số tài khoản chỉ được chứa số");
                        } else if (personABankAccount.trim().length < 8 || personABankAccount.trim().length > 19) {
                          setPersonABankAccountError("Số tài khoản phải có từ 8 đến 19 ký tự");
                        }
                      }
                    }}
                    placeholder="Nhập số tài khoản"
                    className={`inline-block w-40 h-6 text-sm ${personABankAccountError ? "border-red-500" : ""}`}
                  />
                </div>
                {personABankAccountError && (
                  <p className="text-xs text-red-500 mt-1">{personABankAccountError}</p>
                )}
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
                  data-field="price"
                  type="number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    const error = validateNumber(e.target.value, "Giá thuê");
                    setPriceError(error || "");
                  }}
                  onBlur={() => {
                    const error = validateNumber(price, "Giá thuê");
                    setPriceError(error || "");
                  }}
                  placeholder="Nhập giá thuê"
                  className={priceError ? "border-red-500" : ""}
                />
                {priceError && (
                  <p className="text-sm text-red-500 mt-1">{priceError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tiền cọc (VNĐ)</Label>
                <Input
                  data-field="deposit"
                  type="number"
                  value={deposit}
                  onChange={(e) => {
                    setDeposit(e.target.value);
                    const error = validateNumber(e.target.value, "Tiền cọc");
                    setDepositError(error || "");
                  }}
                  onBlur={() => {
                    const error = validateNumber(deposit, "Tiền cọc");
                    setDepositError(error || "");
                  }}
                  placeholder="Nhập tiền cọc"
                  className={depositError ? "border-red-500" : ""}
                />
                {depositError && (
                  <p className="text-sm text-red-500 mt-1">{depositError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  data-field="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartDate(value);
                    // Validate required
                    const requiredError = validateRequired(value, "Ngày bắt đầu");
                    setStartDateError(requiredError || "");
                    // Validate date range
                    if (value && endDate) {
                      if (value > endDate) {
                        setStartDateError("Ngày bắt đầu không được sau ngày kết thúc");
                        setEndDateError("Ngày kết thúc không được trước ngày bắt đầu");
                      } else if (!requiredError) {
                        setEndDateError("");
                      }
                    }
                  }}
                  onBlur={() => {
                    // Validate required
                    const requiredError = validateRequired(startDate, "Ngày bắt đầu");
                    if (requiredError) {
                      setStartDateError(requiredError);
                    }
                    // Validate date range
                    if (startDate && endDate) {
                      if (startDate > endDate) {
                        setStartDateError("Ngày bắt đầu không được sau ngày kết thúc");
                        setEndDateError("Ngày kết thúc không được trước ngày bắt đầu");
                      }
                    }
                  }}
                  className={startDateError ? "border-red-500" : ""}
                />
                {startDateError && (
                  <p className="text-sm text-red-500 mt-1">{startDateError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  data-field="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEndDate(value);
                    // Validate required
                    const requiredError = validateRequired(value, "Ngày kết thúc");
                    setEndDateError(requiredError || "");
                    // Validate date range
                    if (value && startDate) {
                      if (value < startDate) {
                        setEndDateError("Ngày kết thúc không được trước ngày bắt đầu");
                        setStartDateError("Ngày bắt đầu không được sau ngày kết thúc");
                      } else if (!requiredError) {
                        setStartDateError("");
                      }
                    }
                  }}
                  onBlur={() => {
                    // Validate required
                    const requiredError = validateRequired(endDate, "Ngày kết thúc");
                    if (requiredError) {
                      setEndDateError(requiredError);
                    }
                    // Validate date range
                    if (startDate && endDate) {
                      if (startDate > endDate) {
                        setStartDateError("Ngày bắt đầu không được sau ngày kết thúc");
                        setEndDateError("Ngày kết thúc không được trước ngày bắt đầu");
                      }
                    }
                  }}
                  className={endDateError ? "border-red-500" : ""}
                />
                {endDateError && (
                  <p className="text-sm text-red-500 mt-1">{endDateError}</p>
                )}
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
