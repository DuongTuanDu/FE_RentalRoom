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
import { Loader2 } from "lucide-react";
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
    type: "electricity" as "electricity" | "water",
    periodMonth: "",
    periodYear: "",
    currentIndex: "",
    unitPrice: "",
    readingDate: "",
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
        type: "electricity",
        periodMonth: (now.getMonth() + 1).toString(),
        periodYear: now.getFullYear().toString(),
        currentIndex: "",
        unitPrice: "",
        readingDate: now.toISOString().split("T")[0],
      });
    }
  }, [open]);

  const handleCreate = async () => {
    if (
      !formData.roomId ||
      !formData.periodMonth ||
      !formData.periodYear ||
      !formData.currentIndex ||
      !formData.unitPrice ||
      !formData.readingDate
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const currentIndexNum = parseFloat(formData.currentIndex);
    const unitPriceNum = parseFloat(formData.unitPrice);

    if (currentIndexNum < 0) {
      toast.error("Chỉ số hiện tại không được là số âm");
      return;
    }

    if (unitPriceNum < 0) {
      toast.error("Đơn giá không được là số âm");
      return;
    }

    try {
      await createUtilityReading({
        roomId: formData.roomId,
        type: formData.type,
        periodMonth: parseInt(formData.periodMonth),
        periodYear: parseInt(formData.periodYear),
        currentIndex: currentIndexNum,
        unitPrice: unitPriceNum,
        readingDate: formData.readingDate,
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
      <DialogContent className="w-full !max-w-xl">
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                Loại <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "electricity" | "water") =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">Điện</SelectItem>
                  <SelectItem value="water">Nước</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          <div className="space-y-2">
            <Label>
              Chỉ số hiện tại <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.currentIndex}
              onChange={(e) => {
                const value = e.target.value;
                // Chỉ cho phép số dương hoặc rỗng
                if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setFormData((prev) => ({
                    ...prev,
                    currentIndex: value,
                  }));
                }
              }}
              placeholder="Nhập chỉ số hiện tại"
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
              value={formData.unitPrice}
              onChange={(e) => {
                const value = e.target.value;
                // Chỉ cho phép số dương hoặc rỗng
                if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setFormData((prev) => ({
                    ...prev,
                    unitPrice: value,
                  }));
                }
              }}
              placeholder="Nhập đơn giá"
            />
          </div>
          <div className="space-y-2">
            <Label>
              Ngày đọc chỉ số <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.readingDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  readingDate: e.target.value,
                }))
              }
            />
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
