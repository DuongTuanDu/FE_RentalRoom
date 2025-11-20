import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useGetContractDetailsQuery,
  useUpdateContractMutation,
} from "@/services/contract/contract.service";
import { toast } from "sonner";
import type { IUpdateContractRequest } from "@/types/contract";
import { formatDateForInput } from "@/helpers/date";
import { useFormatDate } from "@/hooks/useFormatDate";
import type { Element } from "slate";
import { SlateEditor } from "@/pages/TermManagement/components/SlateEditor";
import { htmlToSlate, slateToHtml } from "@/pages/TermManagement/components/slateHelpers";

type SlateValue = Element[];

interface UpdateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const UpdateContractDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: UpdateContractDialogProps) => {
  // Form states
  const [contractNo, setContractNo] = useState("");
  const [signPlace, setSignPlace] = useState("");
  const [signDate, setSignDate] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [personAName, setPersonAName] = useState("");
  const [personADob, setPersonADob] = useState("");
  const [personACccd, setPersonACccd] = useState("");
  const [personACccdIssuedDate, setPersonACccdIssuedDate] = useState("");
  const [personACccdIssuedPlace, setPersonACccdIssuedPlace] = useState("");
  const [personAPermanentAddress, setPersonAPermanentAddress] = useState("");
  const [personAPhone, setPersonAPhone] = useState("");
  const [personAEmail, setPersonAEmail] = useState("");
  const [termSlateValues, setTermSlateValues] = useState<Record<number, SlateValue>>({});
  const [termSlateValuesInitialized, setTermSlateValuesInitialized] = useState(false);
  const [termNames, setTermNames] = useState<Record<number, string>>({});
  const [regulationSlateValues, setRegulationSlateValues] = useState<Record<number, SlateValue>>({});
  const [regulationSlateValuesInitialized, setRegulationSlateValuesInitialized] = useState(false);
  const [regulationNames, setRegulationNames] = useState<Record<number, string>>({});

  const formatDate = useFormatDate();
  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetContractDetailsQuery(contractId || "", {
      skip: !contractId || !open,
    });
  const [updateContract, { isLoading: isUpdating }] =
    useUpdateContractMutation();

  // Memoize sorted terms to ensure consistency
  const sortedTerms = useMemo(() => {
    if (!contractDetail?.terms || contractDetail.terms.length === 0) {
      return [];
    }
    return [...contractDetail.terms].sort((a, b) => a.order - b.order);
  }, [contractDetail?.terms]);

  // Memoize sorted regulations to ensure consistency
  const sortedRegulations = useMemo(() => {
    if (!contractDetail?.regulations || contractDetail.regulations.length === 0) {
      return [];
    }
    return [...contractDetail.regulations].sort((a, b) => a.order - b.order);
  }, [contractDetail?.regulations]);

  // Load contract detail data into form when dialog opens
  useEffect(() => {
    if (open && contractDetail) {
      // Note: contractDetail.contract only has price, other fields may need to be fetched separately
      setContractNo(contractDetail.contract?.no || "");
      setSignPlace(contractDetail.contract?.signPlace || "");
      setSignDate(formatDateForInput(contractDetail.contract?.signDate));
      setPrice(contractDetail.contract?.price?.toString() || "");
      setDeposit(contractDetail.contract?.deposit?.toString() || "");
      setStartDate(formatDateForInput(contractDetail.contract?.startDate));
      setEndDate(formatDateForInput(contractDetail.contract?.endDate));

      // Person A (Landlord)
      setPersonAName(contractDetail.A?.name || "");
      setPersonADob(formatDateForInput(contractDetail.A?.dob));
      setPersonACccd(contractDetail.A?.cccd || "");
      setPersonACccdIssuedDate(
        formatDateForInput(contractDetail.A?.cccdIssuedDate)
      );
      setPersonACccdIssuedPlace(contractDetail.A?.cccdIssuedPlace || "");
      setPersonAPermanentAddress(contractDetail.A?.permanentAddress || "");
      setPersonAPhone(contractDetail.A?.phone || "");
      setPersonAEmail(contractDetail.A?.email || "");

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
  }, [open, contractDetail, sortedTerms, sortedRegulations]);

  const handleUpdateContract = async () => {
    if (!contractId || !contractDetail) return;

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
        terms:
          sortedTerms.map((term, index) => ({
            name: termNames[index] || term.name,
            description: termSlateValues[index]
              ? slateToHtml(termSlateValues[index])
              : term.description,
            order: term.order,
          })) || [],
        regulations:
          sortedRegulations.map((reg, index) => ({
            title: regulationNames[index] || reg.title,
            description: regulationSlateValues[index]
              ? slateToHtml(regulationSlateValues[index])
              : reg.description,
            effectiveFrom: reg.effectiveFrom,
            order: reg.order,
          })) || [],
      };

      await updateContract({
        id: contractId,
        data: updateData,
      }).unwrap();

      toast.success("Cập nhật hợp đồng thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi cập nhật hợp đồng"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 md:p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Cập nhật hợp đồng</DialogTitle>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : contractDetail ? (
          <div className="px-6 pb-6 space-y-6">
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
            {(contractDetail.terms && contractDetail.terms.length > 0) ||
            (contractDetail.regulations &&
              contractDetail.regulations.length > 0) ? (
              <div className="space-y-4">
                {sortedTerms.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold">Nội dung điều khoản</div>
                    <div className="space-y-4 text-sm">
                      {sortedTerms.map((term, index) => {
                        const slateValue = termSlateValues[index];
                        // Use order as part of key to ensure consistency
                        const termKey = `term-${term.order}`;
                        return (
                          <div
                            key={termKey}
                            className="p-3 bg-slate-50 rounded-lg space-y-2"
                          >
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
            ) : null}

            {/* Landlord Signature */}
            {contractDetail.landlordSignatureUrl && (
              <div className="space-y-4 pt-4 border-t">
                <div className="font-semibold">Chữ ký chủ trọ</div>
                <div className="flex justify-center">
                  <img
                    src={contractDetail.landlordSignatureUrl}
                    alt="Chữ ký chủ trọ"
                    className="max-w-full h-auto border rounded-lg p-2 bg-white"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button onClick={handleUpdateContract} disabled={isUpdating}>
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
