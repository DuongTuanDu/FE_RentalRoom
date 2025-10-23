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
  const [formData, setFormData] = useState({
    fromLevel: 1,
    toLevel: 5,
    count: 5,
    startLevel: 1,
    description: "",
  });

  const [quickCreateFloor, { isLoading }] = useQuickCreateFloorMutation();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buildingId) {
      toast.error("Vui lòng chọn tòa nhà trước!");
      return;
    }

    if (formData.fromLevel > formData.toLevel) {
      toast.error("Tầng bắt đầu không được lớn hơn tầng kết thúc!");
      return;
    }

    if (formData.count <= 0) {
      toast.error("Số lượng tầng phải lớn hơn 0!");
      return;
    }

    try {
      const requestData: QuiclCreateFloorRequest = {
        buildingId,
        fromLevel: formData.fromLevel,
        toLevel: formData.toLevel,
        count: formData.count,
        startLevel: formData.startLevel,
        description: formData.description,
      };

      await quickCreateFloor(requestData).unwrap();
      toast.success("Tạo nhanh tầng thành công!");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        fromLevel: 1,
        toLevel: 5,
        count: 5,
        startLevel: 1,
        description: "",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Tạo nhanh tầng thất bại!");
      console.error("Quick create floor error:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setFormData({
      fromLevel: 1,
      toLevel: 5,
      count: 5,
      startLevel: 1,
      description: "",
    });
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
                min="1"
                value={formData.fromLevel}
                onChange={(e) => handleInputChange("fromLevel", parseInt(e.target.value) || 1)}
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toLevel">Tầng kết thúc</Label>
              <Input
                id="toLevel"
                type="number"
                min="1"
                value={formData.toLevel}
                onChange={(e) => handleInputChange("toLevel", parseInt(e.target.value) || 1)}
                placeholder="5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="count">Số lượng tầng</Label>
              <Input
                id="count"
                type="number"
                min="1"
                value={formData.count}
                onChange={(e) => handleInputChange("count", parseInt(e.target.value) || 1)}
                placeholder="5"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startLevel">Tầng bắt đầu tạo</Label>
              <Input
                id="startLevel"
                type="number"
                min="1"
                value={formData.startLevel}
                onChange={(e) => handleInputChange("startLevel", parseInt(e.target.value) || 1)}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
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
