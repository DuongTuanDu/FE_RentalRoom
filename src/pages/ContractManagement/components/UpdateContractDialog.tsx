import { useEffect, useState } from "react";
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

  // Person B (Tenant) states
  const [personBName, setPersonBName] = useState("");
  const [personBDob, setPersonBDob] = useState("");
  const [personBCccd, setPersonBCccd] = useState("");
  const [personBCccdIssuedDate, setPersonBCccdIssuedDate] = useState("");
  const [personBCccdIssuedPlace, setPersonBCccdIssuedPlace] = useState("");
  const [personBPermanentAddress, setPersonBPermanentAddress] = useState("");
  const [personBPhone, setPersonBPhone] = useState("");
  const [personBEmail, setPersonBEmail] = useState("");

  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetContractDetailsQuery(contractId || "", {
      skip: !contractId || !open,
    });
  const [updateContract, { isLoading: isUpdating }] =
    useUpdateContractMutation();

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

      // Person B (Tenant)
      setPersonBName(contractDetail.B?.name || "");
      setPersonBDob(formatDateForInput(contractDetail.B?.dob));
      setPersonBCccd(contractDetail.B?.cccd || "");
      setPersonBCccdIssuedDate(
        formatDateForInput(contractDetail.B?.cccdIssuedDate)
      );
      setPersonBCccdIssuedPlace(contractDetail.B?.cccdIssuedPlace || "");
      setPersonBPermanentAddress(contractDetail.B?.permanentAddress || "");
      setPersonBPhone(contractDetail.B?.phone || "");
      setPersonBEmail(contractDetail.B?.email || "");
    }
  }, [open, contractDetail]);

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

    if (
      !personBName ||
      !personBDob ||
      !personBCccd ||
      !personBPhone ||
      !personBEmail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bên thuê nhà");
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
        termIds:
          contractDetail.terms?.map((term) => ({
            name: term.name,
            description: term.description,
            order: term.order,
          })) || [],
        regulationIds:
          contractDetail.regulations?.map((reg) => ({
            title: reg.title,
            description: reg.description,
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
                  <Input
                    value={personBName}
                    onChange={(e) => setPersonBName(e.target.value)}
                    placeholder="Nhập tên"
                    className="inline-block w-48 h-6 text-sm"
                  />
                </div>
                <div>
                  Ngày sinh:{" "}
                  <Input
                    type="date"
                    value={personBDob}
                    onChange={(e) => setPersonBDob(e.target.value)}
                    className="inline-block w-32 h-6 text-sm"
                  />
                </div>
                <div>
                  CCCD:{" "}
                  <Input
                    value={personBCccd}
                    onChange={(e) => setPersonBCccd(e.target.value)}
                    placeholder="Nhập số CCCD"
                    className="inline-block w-40 h-6 text-sm"
                  />{" "}
                  Cấp ngày:{" "}
                  <Input
                    type="date"
                    value={personBCccdIssuedDate}
                    onChange={(e) => setPersonBCccdIssuedDate(e.target.value)}
                    className="inline-block w-32 h-6 text-sm"
                  />
                  , Nơi cấp:{" "}
                  <Input
                    value={personBCccdIssuedPlace}
                    onChange={(e) => setPersonBCccdIssuedPlace(e.target.value)}
                    placeholder="Nhập nơi cấp"
                    className="inline-block w-40 h-6 text-sm"
                  />
                </div>
                <div>
                  Hộ khẩu thường trú:{" "}
                  <Input
                    value={personBPermanentAddress}
                    onChange={(e) => setPersonBPermanentAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                    className="inline-block w-64 h-6 text-sm"
                  />
                </div>
                <div>
                  Điện thoại:{" "}
                  <Input
                    value={personBPhone}
                    onChange={(e) => setPersonBPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="inline-block w-40 h-6 text-sm"
                  />
                </div>
                <div>
                  Email:{" "}
                  <Input
                    type="email"
                    value={personBEmail}
                    onChange={(e) => setPersonBEmail(e.target.value)}
                    placeholder="Nhập email"
                    className="inline-block w-48 h-6 text-sm"
                  />
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
                {contractDetail.terms && contractDetail.terms.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold">Nội dung điều khoản</div>
                    <div className="space-y-2 text-sm">
                      {contractDetail.terms
                        .sort((a, b) => a.order - b.order)
                        .map((term, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="font-medium">{term.name}</div>
                            <div className="text-muted-foreground mt-1">
                              {term.description}
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
                        {contractDetail.regulations
                          .sort((a, b) => a.order - b.order)
                          .map((reg, index) => (
                            <div
                              key={index}
                              className="p-3 bg-slate-50 rounded-lg"
                            >
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
