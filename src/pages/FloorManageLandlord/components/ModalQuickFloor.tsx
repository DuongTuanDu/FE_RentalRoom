import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuickCreateFloorMutation } from "@/services/floor/floor.service";
import { toast } from "sonner";
import type { QuiclCreateFloorRequest } from "@/types/floor";

interface ModalQuickFloorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
}

export const ModalQuickFloor = ({
  open,
  onOpenChange,
  buildingId,
}: ModalQuickFloorProps) => {
  const [formData, setFormData] = useState<{
    fromLevel: number | string;
    toLevel: number | string;
    count: number | string;
    startLevel: number | string;
    description: string;
  }>({
    fromLevel: 1,
    toLevel: 5,
    count: 5,
    startLevel: 1,
    description: "",
  });

  const [quickCreateFloor, { isLoading }] = useQuickCreateFloorMutation();

  const handleInputChange = (field: string, value: string) => {
    if (value === "") {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setFormData((prev) => ({ ...prev, [field]: num }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buildingId) {
      toast.error("Vui lòng chọn tòa nhà trước!");
      return;
    }

    if (
      formData.fromLevel === "" ||
      formData.toLevel === "" ||
      formData.count === "" ||
      formData.startLevel === ""
    ) {
      toast.error("Vui lòng nhập đầy đủ các trường số liệu!");
      return;
    }

    if (Number(formData.fromLevel) > Number(formData.toLevel)) {
      toast.error("Tầng bắt đầu không được lớn hơn tầng kết thúc!");
      return;
    }

    try {
      const requestData: QuiclCreateFloorRequest = {
        buildingId,
        fromLevel: Number(formData.fromLevel),
        toLevel: Number(formData.toLevel),
        count: Number(formData.count),
        startLevel: Number(formData.startLevel),
        description: formData.description,
      };
      const response = (await quickCreateFloor(requestData).unwrap()) as any;

      const { createdCount, createdLevels, skippedLevels } = response;
      const skippedCount = skippedLevels?.length || 0;

      if (skippedCount > 0 && createdCount > 0) {
        toast.success(
          `Đã tạo ${createdCount} tầng. Bỏ qua các tầng trùng: ${skippedLevels.join(
            ", "
          )}`
        );
      } else {
        toast.success(
          `Tạo thành công ${createdCount} tầng: ${createdLevels.join(", ")}`
        );
      }

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Quick create floor error:", error);

      if (error.status === 409) {
        toast.warning(`Tầng này đã tồn tại`);
      } else {
        toast.error(error?.message?.message || "Tạo nhanh tầng thất bại!");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fromLevel: 1,
      toLevel: 5,
      count: 5,
      startLevel: 1,
      description: "",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thiết lập nhanh tầng</DialogTitle>
          <DialogDescription>
            Tạo nhiều tầng cùng lúc với cấu hình đơn giản
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromLevel">Tầng bắt đầu</Label>
              <Input
                id="fromLevel"
                type="number"
                value={formData.fromLevel}
                onChange={(e) => handleInputChange("fromLevel", e.target.value)}
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toLevel">Tầng kết thúc</Label>
              <Input
                id="toLevel"
                type="number"
                value={formData.toLevel}
                onChange={(e) => handleInputChange("toLevel", e.target.value)}
                placeholder="5"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Nhập mô tả chung cho các tầng..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo nhanh"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
