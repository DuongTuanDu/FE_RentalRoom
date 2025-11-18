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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRequestExtendMutation, useGetTenantContractDetailsQuery } from "@/services/contract/contract.service";
import { toast } from "sonner";
import { formatDateForInput } from "@/helpers/date";

interface RequestExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const RequestExtendDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: RequestExtendDialogProps) => {
  const [months, setMonths] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const { data: contractDetail } = useGetTenantContractDetailsQuery(
    contractId || "",
    { skip: !contractId || !open }
  );
  const [requestExtend, { isLoading: isRequesting }] = useRequestExtendMutation();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setMonths("");
      setNote("");
    }
  }, [open]);

  const handleRequestExtend = async () => {
    if (!contractId) return;

    if (!months || parseInt(months) <= 0) {
      toast.error("Vui lòng nhập số tháng gia hạn hợp lệ");
      return;
    }

    if (!note || note.trim().length === 0) {
      toast.error("Vui lòng nhập ghi chú cho yêu cầu gia hạn");
      return;
    }

    try {
      await requestExtend({
        id: contractId,
        data: {
          months: parseInt(months),
          note: note.trim(),
        },
      }).unwrap();

      toast.success("Gửi yêu cầu gia hạn thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi gửi yêu cầu gia hạn"
      );
    }
  };

  const calculateNewEndDate = () => {
    if (!contractDetail?.contract?.endDate || !months || parseInt(months) <= 0) {
      return null;
    }

    try {
      const currentEndDate = new Date(contractDetail.contract.endDate);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));
      return newEndDate.toLocaleDateString("vi-VN");
    } catch {
      return null;
    }
  };

  const newEndDate = calculateNewEndDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu gia hạn hợp đồng</DialogTitle>
          <DialogDescription>
            Gửi yêu cầu gia hạn hợp đồng thuê phòng của bạn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {contractDetail && (
            <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-sm">
              <div className="font-medium">Thông tin hợp đồng hiện tại:</div>
              <div>
                Số hợp đồng: <span className="font-medium">{contractDetail.contract?.no || "—"}</span>
              </div>
              <div>
                Ngày kết thúc hiện tại:{" "}
                <span className="font-medium">
                  {contractDetail.contract?.endDate
                    ? formatDateForInput(contractDetail.contract.endDate)
                    : "—"}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="months">Số tháng gia hạn *</Label>
            <Input
              id="months"
              type="number"
              min="1"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="Nhập số tháng muốn gia hạn (ví dụ: 3, 6, 12)"
            />
            {newEndDate && (
              <p className="text-sm text-green-600">
                Ngày kết thúc mới (dự kiến): {newEndDate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú *</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do hoặc ghi chú cho yêu cầu gia hạn..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Vui lòng giải thích lý do bạn muốn gia hạn hợp đồng
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRequesting}
          >
            Hủy
          </Button>
          <Button onClick={handleRequestExtend} disabled={isRequesting}>
            {isRequesting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

