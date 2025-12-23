import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Loader2, Zap } from "lucide-react";
import { useUpdateUtilityReadingMutation } from "@/services/utility/utility.service";
import { useRoomActiveContractQuery } from "@/services/room/room.service";
import { toast } from "sonner";
import type { IUpdateReadingRequest, IUtilityItem } from "@/types/utility";
import { Textarea } from "@/components/ui/textarea";

interface UpdateUtilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utility: IUtilityItem | null;
  onSuccess?: () => void;
}

export const UpdateUtilityDialog = ({
  open,
  onOpenChange,
  utility,
  onSuccess,
}: UpdateUtilityDialogProps) => {
  const [formData, setFormData] = useState({
    ePreviousIndex: "",
    eCurrentIndex: "",
    eUnitPrice: "",
    wPreviousIndex: "",
    wCurrentIndex: "",
    wUnitPrice: "",
    note: "",
  });

  const [updateUtilityReading, { isLoading: isUpdating }] =
    useUpdateUtilityReadingMutation();

  // Lấy hợp đồng đang active của phòng để check wIndexType (byNumber / byPerson)
  const { data: roomActiveContract } = useRoomActiveContractQuery(
    utility?.roomId?._id || "",
    {
      skip: !utility?.roomId?._id,
    }
  );

  // Set form data when utility changes
  useEffect(() => {
    if (utility && open) {
      setFormData({
        ePreviousIndex: utility.ePreviousIndex?.toString(),
        eCurrentIndex: utility.eCurrentIndex?.toString(),
        eUnitPrice: utility.eUnitPrice?.toString(),
        wPreviousIndex: utility.wPreviousIndex?.toString(),
        wCurrentIndex: utility.wCurrentIndex?.toString(),
        wUnitPrice: utility.wUnitPrice?.toString(),
        note: "",
      });
    }
  }, [utility, open]);

  // Check xem chỉ số nước tính theo đầu người hay theo số công tơ
  const isWaterByPerson =
    roomActiveContract?.contract?.wIndexType === "byPerson";

  const handleUpdate = async () => {
    if (!utility) return;

    // Validate các trường điện (bắt buộc)
    if (
      !formData.ePreviousIndex ||
      !formData.eCurrentIndex ||
      !formData.eUnitPrice
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin điện");
      return;
    }

    // Validate các trường nước chỉ khi không tính theo đầu người
    if (
      !isWaterByPerson &&
      (!formData.wPreviousIndex ||
        !formData.wCurrentIndex ||
        !formData.wUnitPrice)
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin nước");
      return;
    }

    const ePreviousIndexNum = parseFloat(formData.ePreviousIndex);
    const eCurrentIndexNum = parseFloat(formData.eCurrentIndex);
    const eUnitPriceNum = parseFloat(formData.eUnitPrice);

    if (eCurrentIndexNum < ePreviousIndexNum) {
      toast.error("Chỉ số điện hiện tại không được nhỏ hơn chỉ số trước");
      return;
    }

    if (eUnitPriceNum < 0) {
      toast.error("Đơn giá điện không được là số âm");
      return;
    }

    // Validate nước chỉ khi không tính theo đầu người
    let wPreviousIndexNum: number | undefined;
    let wCurrentIndexNum: number | undefined;
    let wUnitPriceNum: number | undefined;

    if (!isWaterByPerson) {
      wPreviousIndexNum = parseFloat(formData.wPreviousIndex);
      wCurrentIndexNum = parseFloat(formData.wCurrentIndex);
      wUnitPriceNum = parseFloat(formData.wUnitPrice);

      if (wCurrentIndexNum < wPreviousIndexNum) {
        toast.error("Chỉ số nước hiện tại không được nhỏ hơn chỉ số trước");
        return;
      }

      if (wUnitPriceNum < 0) {
        toast.error("Đơn giá nước không được là số âm");
        return;
      }
    }

    try {
      // Tạo payload: chỉ gửi các trường nước khi không tính theo đầu người
      if (isWaterByPerson) {
        // Khi tính theo đầu người, chỉ gửi thông tin điện
        const payload: Partial<IUpdateReadingRequest> = {
          eCurrentIndex: eCurrentIndexNum,
          eUnitPrice: eUnitPriceNum,
          note: formData.note,
        };

        // Kiểm tra nếu ePreviousIndex thay đổi
        if (ePreviousIndexNum !== utility.ePreviousIndex) {
          payload.ePreviousIndex = ePreviousIndexNum;
        }

        await updateUtilityReading({
          id: utility._id,
          data: payload as any,
        }).unwrap();
      } else {
        // Khi tính theo số công tơ, gửi đầy đủ thông tin điện và nước
        const payload: IUpdateReadingRequest = {
          eCurrentIndex: eCurrentIndexNum,
          eUnitPrice: eUnitPriceNum,
          wCurrentIndex: wCurrentIndexNum!,
          wUnitPrice: wUnitPriceNum!,
          note: formData.note,
        };

        // Kiểm tra nếu ePreviousIndex thay đổi
        if (ePreviousIndexNum !== utility.ePreviousIndex) {
          payload.ePreviousIndex = ePreviousIndexNum;
        }

        // Kiểm tra nếu wPreviousIndex thay đổi
        if (wPreviousIndexNum !== undefined && wPreviousIndexNum !== utility.wPreviousIndex) {
          payload.wPreviousIndex = wPreviousIndexNum;
        }

        await updateUtilityReading({
          id: utility._id,
          data: payload,
        }).unwrap();
      }

      onOpenChange(false);
      toast.success("Thành công", {
        description: "Cập nhật chỉ số điện nước thành công",
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message || "Không thể cập nhật chỉ số. Vui lòng thử lại",
      });
    }
  };

  if (!utility) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chỉ số điện nước</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border-b pb-4">
            <Label className="text-sm font-semibold mb-3">Thông tin điện <span><Zap className="w-4 h-4 text-yellow-500" /></span></Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>
                  Chỉ số trước <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ePreviousIndex}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setFormData((prev) => ({
                        ...prev,
                        ePreviousIndex: value,
                      }));
                    }
                  }}
                  placeholder="Chỉ số trước"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Chỉ số hiện tại <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.eCurrentIndex}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setFormData((prev) => ({
                        ...prev,
                        eCurrentIndex: value,
                      }));
                    }
                  }}
                  placeholder="Chỉ số hiện tại"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Đơn giá <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.eUnitPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setFormData((prev) => ({
                        ...prev,
                        eUnitPrice: value,
                      }));
                    }
                  }}
                  placeholder="Đơn giá"
                />
              </div>
            </div>
          </div>

          {!isWaterByPerson && (
            <div className="border-b pb-4">
              <Label className="text-sm font-semibold mb-3">
                Thông tin nước{" "}
                <span className="text-red-500">
                  <Droplets className="w-4 h-4 text-blue-500" />
                </span>
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>
                    Chỉ số trước <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.wPreviousIndex}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          wPreviousIndex: value,
                        }));
                      }
                    }}
                    placeholder="Chỉ số trước"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Chỉ số hiện tại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.wCurrentIndex}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          wCurrentIndex: value,
                        }));
                      }
                    }}
                    placeholder="Chỉ số hiện tại"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Đơn giá <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.wUnitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          wUnitPrice: value,
                        }));
                      }
                    }}
                    placeholder="Đơn giá"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              placeholder="Nhập ghi chú (nếu có)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

