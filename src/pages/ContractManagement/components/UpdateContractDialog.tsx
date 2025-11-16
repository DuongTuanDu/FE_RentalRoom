import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useGetContractDetailsQuery, useUpdateContractMutation } from "@/services/contract/contract.service";
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

  const { data: contractDetail, isLoading: isLoadingDetail } = useGetContractDetailsQuery(
    contractId || "",
    { skip: !contractId || !open }
  );
  const [updateContract, { isLoading: isUpdating }] = useUpdateContractMutation();

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
      
      setPersonAName(contractDetail.A?.name || "");
      setPersonADob(formatDateForInput(contractDetail.A?.dob));
      setPersonACccd(contractDetail.A?.cccd || "");
      setPersonACccdIssuedDate(formatDateForInput(contractDetail.A?.cccdIssuedDate));
      setPersonACccdIssuedPlace(contractDetail.A?.cccdIssuedPlace || "");
      setPersonAPermanentAddress(contractDetail.A?.permanentAddress || "");
      setPersonAPhone(contractDetail.A?.phone || "");
      setPersonAEmail(contractDetail.A?.email || "");
    }
  }, [open, contractDetail]);

  const handleUpdateContract = async () => {
    if (!contractId || !contractDetail) return;

    if (!contractNo || !signPlace || !signDate || !price || !deposit || !startDate || !endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin hợp đồng");
      return;
    }

    if (!personAName || !personADob || !personACccd || !personAPhone || !personAEmail) {
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
        termIds: contractDetail.terms?.map((term) => ({
          name: term.name,
          description: term.description,
          order: term.order,
        })) || [],
        regulationIds: contractDetail.regulations?.map((reg) => ({
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật hợp đồng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin hợp đồng
          </DialogDescription>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : contractDetail ? (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-lg text-slate-700 mb-3">Thông tin hợp đồng</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số hợp đồng</Label>
                  <Input
                    value={contractNo}
                    onChange={(e) => setContractNo(e.target.value)}
                    placeholder="Nhập số hợp đồng"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa điểm ký</Label>
                  <Input
                    value={signPlace}
                    onChange={(e) => setSignPlace(e.target.value)}
                    placeholder="Nhập địa điểm ký"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày ký</Label>
                  <Input
                    type="date"
                    value={signDate}
                    onChange={(e) => setSignDate(e.target.value)}
                  />
                </div>
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

            <Separator />

            <div>
              <Label className="text-lg text-slate-700 mb-3">Thông tin chủ trọ (Bên A)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={personAName}
                    onChange={(e) => setPersonAName(e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={personADob}
                    onChange={(e) => setPersonADob(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CCCD</Label>
                  <Input
                    value={personACccd}
                    onChange={(e) => setPersonACccd(e.target.value)}
                    placeholder="Nhập số CCCD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày cấp CCCD</Label>
                  <Input
                    type="date"
                    value={personACccdIssuedDate}
                    onChange={(e) => setPersonACccdIssuedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nơi cấp CCCD</Label>
                  <Input
                    value={personACccdIssuedPlace}
                    onChange={(e) => setPersonACccdIssuedPlace(e.target.value)}
                    placeholder="Nhập nơi cấp"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ thường trú</Label>
                  <Input
                    value={personAPermanentAddress}
                    onChange={(e) => setPersonAPermanentAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Điện thoại</Label>
                  <Input
                    value={personAPhone}
                    onChange={(e) => setPersonAPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={personAEmail}
                    onChange={(e) => setPersonAEmail(e.target.value)}
                    placeholder="Nhập email"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdateContract}
            disabled={isUpdating}
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

