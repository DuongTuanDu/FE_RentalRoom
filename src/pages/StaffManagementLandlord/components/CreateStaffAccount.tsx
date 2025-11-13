import { useState, useEffect, useMemo } from "react";
import { UserPlus, Loader2, Building, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IPermission } from "@/types/staff";
import type { IBuilding } from "@/types/building";
import {
  useCreateStaffMutation,
  useGetPermissionsQuery,
} from "@/services/staff/staff.service";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import { toast } from "sonner";

interface ModalCreateStaffAccountProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ModalCreateStaffAccount = ({
  open,
  onOpenChange,
  onSuccess,
}: ModalCreateStaffAccountProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    dob: "",
    gender: "Nam",
    address: "",
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createStaff, { isLoading }] = useCreateStaffMutation();
  const { data: allPermissions, isLoading: isLoadingPermissions } = useGetPermissionsQuery();
  const { data: allBuildings, isLoading: isLoadingBuildings } = useGetBuildingsQuery({
    q: "",
    page: 1,
    limit: 100,
    status: "active",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
        dob: "",
        gender: "Nam",
        address: "",
      });
      setSelectedPermissions([]);
      setSelectedBuildings([]);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (open && allPermissions && allPermissions.length > 0) {
      const viewPermissions = allPermissions
        .filter((permission: IPermission) => permission.action === "view")
        .map((permission: IPermission) => permission.code);
      
      setSelectedPermissions(viewPermissions);
    }
  }, [open, allPermissions]);

  const permissionGroups = useMemo(() => {
    if (!allPermissions) return {};
    
    const groups: Record<string, IPermission[]> = {};
    allPermissions.forEach((permission: IPermission) => {
      const groupName = permission.group;
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(permission);
    });

    const actionOrder = { view: 1, create: 2, edit: 3, delete: 4 };
    Object.keys(groups).forEach(groupName => {
      groups[groupName].sort((a, b) => {
        return (actionOrder[a.action as keyof typeof actionOrder] || 999) - 
               (actionOrder[b.action as keyof typeof actionOrder] || 999);
      });
    });

    return groups;
  }, [allPermissions]);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      view: "Xem",
      create: "Tạo",
      edit: "Sửa",
      delete: "Xóa",
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      view: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
      create: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
      edit: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
      delete: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    };
    return colors[action] || "border-slate-200 hover:bg-slate-50";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!formData.fullName) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleTogglePermission = (permissionCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((p) => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const handleToggleGroup = (groupName: string) => {
    const groupPermissions = permissionGroups[groupName] || [];
    const groupCodes = groupPermissions.map(p => p.code);
    const allSelected = groupCodes.every((code) => selectedPermissions.includes(code));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupCodes.includes(p)));
    } else {
      setSelectedPermissions((prev) => {
        const newPermissions = [...prev];
        groupCodes.forEach((code) => {
          if (!newPermissions.includes(code)) {
            newPermissions.push(code);
          }
        });
        return newPermissions;
      });
    }
  };

  const handleToggleBuilding = (buildingId: string) => {
    setSelectedBuildings((prev) =>
      prev.includes(buildingId)
        ? prev.filter((b) => b !== buildingId)
        : [...prev, buildingId]
    );
  };

  const handleSelectAllBuildings = () => {
    const allBuildingIds = allBuildings?.data.map((b: IBuilding) => b._id) || [];
    const allSelected = allBuildingIds.every((id: string) => selectedBuildings.includes(id));
    
    if (allSelected) {
      setSelectedBuildings([]);
    } else {
      setSelectedBuildings(allBuildingIds);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      await createStaff({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address,
        assignedBuildings: selectedBuildings,
        permissions: selectedPermissions,
      }).unwrap();

      toast.success("Tạo tài khoản nhân viên thành công");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Tạo tài khoản thất bại");
    }
  };

  const isGroupFullySelected = (groupName: string) => {
    const groupPermissions = permissionGroups[groupName] || [];
    const groupCodes = groupPermissions.map(p => p.code);
    return groupCodes.length > 0 && groupCodes.every((code) => selectedPermissions.includes(code));
  };

  const isAllBuildingsSelected = useMemo(() => {
    const allBuildingIds = allBuildings?.data.map((b: IBuilding) => b._id) || [];
    return allBuildingIds.length > 0 && allBuildingIds.every((id: string) => selectedBuildings.includes(id));
  }, [allBuildings, selectedBuildings]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl !max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 " />
            Tạo tài khoản nhân viên mới
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-1">
            Điền thông tin để tạo tài khoản và phân quyền cho nhân viên
          </p>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto py-4 space-y-6 px-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Thông tin cơ bản
                </h3>
              </div>

              <Card className="p-4 border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      placeholder="0901234567"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className={errors.phoneNumber ? "border-red-500" : ""}
                    />
                    {errors.phoneNumber && (
                      <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-sm font-medium">
                      Ngày sinh
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      Giới tính
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Địa chỉ
                    </Label>
                    <Input
                      id="address"
                      placeholder="An cảnh lê lợi"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  Tòa nhà được quản lý
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {selectedBuildings.length} / {allBuildings?.data.length || 0} tòa
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllBuildings}
                    className={`h-7 text-xs ${
                      isAllBuildingsSelected
                        ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        : "text-slate-600"
                    }`}
                  >
                    {isAllBuildingsSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </Button>
                </div>
              </div>

              <Card className="p-4 border-slate-200 shadow-sm">
                {isLoadingBuildings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : allBuildings?.data ?? [] ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {allBuildings?.data.map((building: IBuilding) => {
                      const isChecked = selectedBuildings.includes(building._id);
                      return (
                        <div
                          key={building._id}
                          className={`flex items-center space-x-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-purple-50 border-purple-200 shadow-sm"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                          onClick={() => handleToggleBuilding(building._id)}
                        >
                          <Checkbox
                            id={building._id}
                            checked={isChecked}
                            onCheckedChange={() => handleToggleBuilding(building._id)}
                          />
                          <Label
                            htmlFor={building._id}
                            className="text-xs font-medium cursor-pointer flex-1 truncate"
                            title={building.name}
                          >
                            {building.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Không có tòa nhà nào
                  </div>
                )}
              </Card>
            </div>

            {isLoadingPermissions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    Quyền hạn chức năng
                  </h3>
                  <span className="text-sm text-slate-500">
                    {selectedPermissions.length} / {allPermissions?.length || 0} quyền
                  </span>
                </div>

                {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                  <Card key={groupName} className="p-4 border-slate-200 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <Label className="text-sm font-semibold text-slate-800">
                          {groupName}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleGroup(groupName)}
                          className={`h-7 text-xs ${
                            isGroupFullySelected(groupName)
                              ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              : "text-slate-600"
                          }`}
                        >
                          {isGroupFullySelected(groupName) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {permissions.map((permission) => {
                          const isChecked = selectedPermissions.includes(permission.code);
                          return (
                            <div
                              key={permission._id}
                              className={`flex items-center space-x-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-purple-50 border-purple-200 shadow-sm"
                                  : getActionColor(permission.action)
                              }`}
                              onClick={() => handleTogglePermission(permission.code)}
                            >
                              <Checkbox
                                id={permission._id}
                                checked={isChecked}
                                onCheckedChange={() => handleTogglePermission(permission.code)}
                              />
                              <Label
                                htmlFor={permission._id}
                                className="text-xs font-medium cursor-pointer flex-1"
                              >
                                {getActionLabel(permission.action)}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Đã chọn:{" "}
                <span className="font-semibold text-purple-600">
                  {selectedPermissions.length}
                </span>{" "}
                quyền,{" "}
                <span className="font-semibold text-purple-600">
                  {selectedBuildings.length}
                </span>{" "}
                tòa nhà
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo tài khoản"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateStaffAccount;