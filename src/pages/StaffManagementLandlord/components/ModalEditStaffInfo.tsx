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

  const [errors, setErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    gender?: string;
    dob?: string;
    address?: string;
  }>({});

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
      setErrors({});
    }
  }, [staff]);

  const validate = () => {
    const newErrors: {
      fullName?: string;
      phoneNumber?: string;
      gender?: string;
      dob?: string;
      address?: string;
    } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc.";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc.";
    } else {
      // [Suy luận] Validate cơ bản cho số điện thoại Việt Nam: 10 chữ số và bắt đầu bằng 0
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số và bắt đầu bằng 0.";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Giới tính là bắt buộc.";
    }

    if (!formData.dob) {
      newErrors.dob = "Ngày sinh là bắt buộc.";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Ngày sinh không được lớn hơn ngày hiện tại.";
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;

    const isValid = validate();
    if (!isValid) return;

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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
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
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
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
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                )}
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
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                )}
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
              {errors.dob && (
                <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1.5">
                <Map className="w-4 h-4" />
                Địa chỉ
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
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