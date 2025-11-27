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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Droplets, Loader2, Zap } from "lucide-react";
import { RoomSelectCombobox } from "@/pages/RoomFurnitureLandlord/components/RoomSelectCombobox";
import { useCreateUtilityReadingMutation } from "@/services/utility/utility.service";
import { toast } from "sonner";

interface CreateUtilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId?: string;
  onSuccess?: () => void;
}

export const CreateUtilityDialog = ({
  open,
  onOpenChange,
  buildingId,
  onSuccess,
}: CreateUtilityDialogProps) => {
  const [formData, setFormData] = useState({
    roomId: "",
    periodMonth: "",
    periodYear: "",
    eCurrentIndex: "",
    wCurrentIndex: "",
  });

  const [createUtilityReading, { isLoading: isCreating }] =
    useCreateUtilityReadingMutation();

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Set default period to current month/year when dialog opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      setFormData({
        roomId: "",
        periodMonth: (now.getMonth() + 1).toString(),
        periodYear: now.getFullYear().toString(),
        eCurrentIndex: "",
        wCurrentIndex: "",
      });
    }
  }, [open]);

  const handleCreate = async () => {
    if (
      !formData.roomId ||
      !formData.periodMonth ||
      !formData.periodYear ||
      !formData.eCurrentIndex ||
      !formData.wCurrentIndex
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const eCurrentIndexNum = parseFloat(formData.eCurrentIndex);
    const wCurrentIndexNum = parseFloat(formData.wCurrentIndex);

    if (eCurrentIndexNum < 0) {
      toast.error("Chỉ số điện hiện tại không được là số âm");
      return;
    }

    if (wCurrentIndexNum < 0) {
      toast.error("Chỉ số nước hiện tại không được là số âm");
      return;
    }

    try {
      await createUtilityReading({
        roomId: formData.roomId,
        periodMonth: parseInt(formData.periodMonth),
        periodYear: parseInt(formData.periodYear),
        eCurrentIndex: eCurrentIndexNum,
        wCurrentIndex: wCurrentIndexNum,
      }).unwrap();

      onOpenChange(false);
      toast.success("Thành công", {
        description: "Tạo chỉ số điện nước thành công",
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message || "Không thể tạo chỉ số. Vui lòng thử lại",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo chỉ số điện nước mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Phòng <span className="text-red-500">*</span>
            </Label>
            <RoomSelectCombobox
              value={formData.roomId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, roomId: value }))
              }
              buildingId={buildingId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Tháng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.periodMonth}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, periodMonth: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Năm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.periodYear}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, periodYear: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Chỉ số điện hiện tại <span><Zap className="w-4 h-4 text-yellow-500" /></span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.eCurrentIndex}
                onChange={(e) => {
                  const value = e.target.value;
                  // Chỉ cho phép số dương hoặc rỗng
                  if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setFormData((prev) => ({
                      ...prev,
                      eCurrentIndex: value,
                    }));
                  }
                }}
                placeholder="Nhập chỉ số điện hiện tại"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Chỉ số nước hiện tại <span className="text-red-500"><Droplets className="w-4 h-4 text-blue-500" /></span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.wCurrentIndex}
                onChange={(e) => {
                  const value = e.target.value;
                  // Chỉ cho phép số dương hoặc rỗng
                  if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setFormData((prev) => ({
                      ...prev,
                      wCurrentIndex: value,
                    }));
                  }
                }}
                placeholder="Nhập chỉ số nước hiện tại"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo mới"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
