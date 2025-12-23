// ModalEditStaffInfo.tsx
import { useState, useEffect } from "react";
import { User, Phone, Calendar, Loader2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IStaff } from "@/types/staff";
import { useUpdateStaffInfoMutation } from "@/services/staff/staff.service";
import { toast } from "sonner";

interface ModalEditStaffInfoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: IStaff | null;
  onSuccess?: () => void;
}

const ModalEditStaffInfo = ({ open, onOpenChange, staff, onSuccess }: ModalEditStaffInfoProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "",
    dob: "",
    address: "",
  });

  const [updateStaffInfo, { isLoading }] = useUpdateStaffInfoMutation();

  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.accountId.userInfo.fullName || "",
        phoneNumber: staff.accountId.userInfo.phoneNumber || "",
        gender: staff.accountId.userInfo.gender || "",
        dob: staff.accountId.userInfo.dob ? staff.accountId.userInfo.dob.split("T")[0] : "",
        address: staff.accountId.userInfo.address || "",
      });
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;

    try {
      await updateStaffInfo({
        staffId: staff._id,
        body: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          dob: formData.dob,
          address: formData.address
        },
      }).unwrap();

      toast.success("Cập nhật thông tin nhân viên thành công");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message?.message || "Cập nhật thông tin thất bại");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Chỉnh sửa thông tin nhân viên
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Họ và tên 
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  Số điện thoại 
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Giới tính 
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Ngày sinh 
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-1.5">
                <Map className="w-4 h-4" />
                Địa chỉ
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditStaffInfo;