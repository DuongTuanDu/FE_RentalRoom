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
import { useUpdateUtilityReadingMutation } from "@/services/utility/utility.service";
import { toast } from "sonner";
import type { IUtilityItem } from "@/types/utility";

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
    periodMonth: "",
    periodYear: "",
    currentIndex: "",
    unitPrice: "",
    readingDate: "",
  });

  const [updateUtilityReading, { isLoading: isUpdating }] =
    useUpdateUtilityReadingMutation();

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Set form data when utility changes
  useEffect(() => {
    if (utility && open) {
      const readingDate = utility.readingDate
        ? new Date(utility.readingDate).toISOString().split("T")[0]
        : "";
      setFormData({
        periodMonth: utility.periodMonth.toString(),
        periodYear: utility.periodYear.toString(),
        currentIndex: utility.currentIndex.toString(),
        unitPrice: utility.unitPrice.toString(),
        readingDate,
      });
    }
  }, [utility, open]);

  const handleUpdate = async () => {
    if (!utility) return;

    if (
      !formData.periodMonth ||
      !formData.periodYear ||
      !formData.currentIndex ||
      !formData.unitPrice ||
      !formData.readingDate
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await updateUtilityReading({
        id: utility._id,
        data: {
          periodMonth: parseInt(formData.periodMonth),
          periodYear: parseInt(formData.periodYear),
          currentIndex: parseFloat(formData.currentIndex),
          unitPrice: parseFloat(formData.unitPrice),
          readingDate: formData.readingDate,
        },
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
      <DialogContent className="w-full !max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chỉ số điện nước</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                <SelectTrigger>
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
                <SelectTrigger>
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
              value={formData.currentIndex}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentIndex: e.target.value,
                }))
              }
              placeholder="Nhập chỉ số hiện tại"
            />
          </div>
          <div className="space-y-2">
            <Label>
              Đơn giá <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  unitPrice: e.target.value,
                }))
              }
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

