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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useRequestTerminateMutation,
  useGetTenantContractDetailsQuery,
} from "@/services/contract/contract.service";
import { toast } from "sonner";

interface RequestTerminateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const RequestTerminateDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: RequestTerminateDialogProps) => {
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const { data: contractDetail } = useGetTenantContractDetailsQuery(
    contractId || "",
    { skip: !contractId || !open }
  );
  const [requestTerminate, { isLoading: isRequesting }] =
    useRequestTerminateMutation();

  useEffect(() => {
    if (open) {
      setReason("");
      setNote("");
    }
  }, [open]);

  const handleRequestTerminate = async () => {
    if (!contractId) return;

    if (!reason || reason.trim().length === 0) {
      toast.error("Vui lòng nhập lý do chấm dứt hợp đồng");
      return;
    }

    try {
      await requestTerminate({
        id: contractId,
        data: {
          reason: reason.trim(),
          note: note.trim(),
        },
      }).unwrap();

      toast.success("Gửi yêu cầu chấm dứt hợp đồng thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.message?.message ||
          "Có lỗi xảy ra khi gửi yêu cầu chấm dứt hợp đồng"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu chấm dứt hợp đồng</DialogTitle>
          <DialogDescription>
            Gửi yêu cầu chấm dứt hợp đồng trước hạn tới chủ trọ. Vui lòng nêu
            rõ lý do để chủ trọ xem xét.
          </DialogDescription>
        </DialogHeader>

        {contractDetail && (
          <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm space-y-1">
            <div>
              Số hợp đồng:{" "}
              <span className="font-medium">
                {contractDetail.contract?.no || "—"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="terminate-reason">
              Lý do chấm dứt hợp đồng *
            </Label>
            <Textarea
              id="terminate-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả lý do bạn muốn chấm dứt hợp đồng (ví dụ: thay đổi công việc, chuyển nơi ở, ...)"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terminate-note">Ghi chú thêm (không bắt buộc)</Label>
            <Textarea
              id="terminate-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bạn có thể cung cấp thêm thông tin để chủ trọ hiểu rõ hơn về yêu cầu của bạn..."
              rows={3}
            />
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
          <Button onClick={handleRequestTerminate} disabled={isRequesting}>
            {isRequesting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


