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

  // Set form data when utility changes
  useEffect(() => {
    if (utility && open) {
      setFormData({
        ePreviousIndex: utility.ePreviousIndex.toString(),
        eCurrentIndex: utility.eCurrentIndex.toString(),
        eUnitPrice: utility.eUnitPrice.toString(),
        wPreviousIndex: utility.wPreviousIndex.toString(),
        wCurrentIndex: utility.wCurrentIndex.toString(),
        wUnitPrice: utility.wUnitPrice.toString(),
        note: "",
      });
    }
  }, [utility, open]);

  const isWaterByPerson =
    utility?.buildingId?.wIndexType === "byPerson";

  const handleUpdate = async () => {
    if (!utility) return;

    if (
      !formData.ePreviousIndex ||
      !formData.eCurrentIndex ||
      !formData.eUnitPrice ||
      !formData.wPreviousIndex ||
      !formData.wCurrentIndex ||
      !formData.wUnitPrice
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const ePreviousIndexNum = parseFloat(formData.ePreviousIndex);
    const eCurrentIndexNum = parseFloat(formData.eCurrentIndex);
    const eUnitPriceNum = parseFloat(formData.eUnitPrice);
    const wPreviousIndexNum = parseFloat(formData.wPreviousIndex);
    const wCurrentIndexNum = parseFloat(formData.wCurrentIndex);
    const wUnitPriceNum = parseFloat(formData.wUnitPrice);

    if (eCurrentIndexNum < ePreviousIndexNum) {
      toast.error("Chỉ số điện hiện tại không được nhỏ hơn chỉ số trước");
      return;
    }

    if (wCurrentIndexNum < wPreviousIndexNum) {
      toast.error("Chỉ số nước hiện tại không được nhỏ hơn chỉ số trước");
      return;
    }

    if (eUnitPriceNum < 0 || wUnitPriceNum < 0) {
      toast.error("Đơn giá không được là số âm");
      return;
    }

    try {
      // Chỉ gửi ePreviousIndex và wPreviousIndex nếu có thay đổi
      const payload: IUpdateReadingRequest = {
        eCurrentIndex: eCurrentIndexNum,
        eUnitPrice: eUnitPriceNum,
        wCurrentIndex: wCurrentIndexNum,
        wUnitPrice: wUnitPriceNum,
        note: formData.note,
      };

      // Kiểm tra nếu ePreviousIndex thay đổi
      if (ePreviousIndexNum !== utility.ePreviousIndex) {
        payload.ePreviousIndex = ePreviousIndexNum;
      }

      // Kiểm tra nếu wPreviousIndex thay đổi
      if (wPreviousIndexNum !== utility.wPreviousIndex) {
        payload.wPreviousIndex = wPreviousIndexNum;
      }

      await updateUtilityReading({
        id: utility._id,
        data: payload,
      }).unwrap();

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

