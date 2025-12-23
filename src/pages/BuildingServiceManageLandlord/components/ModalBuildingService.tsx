import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  IBuildingService,
  IBuildingServiceRequest,
} from "@/types/building-services";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Loại dịch vụ</Label>
            <select
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value as any })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="internet">Internet</option>
              <option value="water">Nước</option>
              <option value="parking">Bãi đỗ xe</option>
              <option value="cleaning">Dịch vụ vệ sinh</option>
              <option value="security">Bảo vệ</option>
              <option value="other">Khác</option>
            </select>
          </div>

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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập mô tả dịch vụ..."
              className="w-full p-2 border rounded-md min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chargeType">Loại phí</Label>
            <select
              id="chargeType"
              value={formData.chargeType}
              onChange={(e) =>
                setFormData({ ...formData, chargeType: e.target.value as any })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="perRoom">Theo phòng</option>
              <option value="perPerson">Theo người</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee">
                Phí <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fee"
                type="number"
                min="0"
                value={formData.fee}
                onChange={(e) =>
                  setFormData({ ...formData, fee: Number(e.target.value) })
                }
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Đơn vị tiền tệ</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="VND">VND</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : isEdit
                ? "Cập nhật"
                : "Tạo dịch vụ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
