import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  IBuildingService,
  IBuildingServiceRequest,
} from "@/types/building-services";
import { useEffect } from "react";

interface ModalBuildingServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: IBuildingServiceRequest;
  setFormData: (data: IBuildingServiceRequest) => void;
  isEdit: boolean;
  selectedService?: IBuildingService | null;
  isLoading?: boolean;
}

export const ModalBuildingService = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
  isLoading = false,
}: ModalBuildingServiceProps) => {
  const isWaterService = formData.name as "water" === "water";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Loại dịch vụ */}
          <div className="space-y-2">
            <Label htmlFor="name">Loại dịch vụ</Label>
            <Select
              value={formData.name}
              onValueChange={(value) =>
                setFormData({ ...formData, name: value as any })
              }
              disabled={isLoading || (isEdit && isWaterService)}
            >
              <SelectTrigger id="name">
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internet">Internet</SelectItem>
                <SelectItem value="water">Nước</SelectItem>
                <SelectItem value="parking">Bãi đỗ xe</SelectItem>
                <SelectItem value="cleaning">Dịch vụ vệ sinh</SelectItem>
                <SelectItem value="security">Bảo vệ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tên dịch vụ */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Tên dịch vụ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="Nhập tên dịch vụ..."
              disabled={isWaterService || isLoading}
              required={!isWaterService}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập mô tả dịch vụ..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chargeType">Loại phí</Label>
            {isWaterService ? (
              <Input value="Theo người" disabled />
            ) : (
              <Select
                value={formData.chargeType}
                onValueChange={(value) =>
                  setFormData({ ...formData, chargeType: value as any })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="chargeType">
                  <SelectValue placeholder="Chọn loại phí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perRoom">Theo phòng</SelectItem>
                  <SelectItem value="perPerson">Theo người</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee">
                Phí dịch vụ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fee"
                type="number"
                min="0"
                value={formData.fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fee: Number(e.target.value) || 0,
                  })
                }
                placeholder="0"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Đơn vị tiền tệ</Label>
              <Input value="VND" disabled />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <>Đang xử lý...</>
            ) : isEdit ? (
              "Cập nhật dịch vụ"
            ) : (
              "Tạo dịch vụ"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};