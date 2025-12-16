import { useState, useEffect, useMemo } from "react";
import { Shield, Loader2, Check, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { IPermission } from "@/types/staff";
import type { IBuilding } from "@/types/building";
import {
  useUpdateStaffPermissionsMutation,
  useGetPermissionsQuery,
} from "@/services/staff/staff.service";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import { toast } from "sonner";

interface ModalEditStaffPermissionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  staffName: string;
  staffPermissions: string[];
  staffBuildings: string[];
  onSuccess?: () => void;
}

const ModalEditStaffPermissions = ({
  open,
  onOpenChange,
  staffId,
  staffName,
  staffPermissions,
  staffBuildings,
  onSuccess,
}: ModalEditStaffPermissionsProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [updateStaffPermissions, { isLoading }] =
    useUpdateStaffPermissionsMutation();
  const { data: allPermissions, isLoading: isLoadingPermissions } =
    useGetPermissionsQuery();
  const { data: allBuildings, isLoading: isLoadingBuildings } =
    useGetBuildingsQuery({
      q: "",
      page: 1,
      limit: 100,
      status: "active",
    });

  // Reset state khi modal mở với dữ liệu mới
  useEffect(() => {
    if (open && staffId) {
      setSelectedPermissions(staffPermissions);
      setSelectedBuildings(staffBuildings);
    } else if (!open) {
      setSelectedPermissions([]);
      setSelectedBuildings([]);
    }
  }, [open, staffId]);

  // Nhóm permissions theo group từ API
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

    // Sắp xếp actions theo thứ tự: view -> create -> edit -> delete
    const actionOrder = { view: 1, create: 2, edit: 3, delete: 4 };
    Object.keys(groups).forEach((groupName) => {
      groups[groupName].sort((a, b) => {
        return (
          (actionOrder[a.action as keyof typeof actionOrder] || 999) -
          (actionOrder[b.action as keyof typeof actionOrder] || 999)
        );
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

  const handleTogglePermission = (permissionCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((p) => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const handleToggleGroup = (groupName: string) => {
    const groupPermissions = permissionGroups[groupName] || [];
    const groupCodes = groupPermissions.map((p) => p.code);
    const allSelected = groupCodes.every((code) =>
      selectedPermissions.includes(code)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupCodes.includes(p))
      );
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
    const allBuildingIds =
      allBuildings?.data.map((b: IBuilding) => b._id) || [];
    const allSelected = allBuildingIds.every((id: string) =>
      selectedBuildings.includes(id)
    );

    if (allSelected) {
      setSelectedBuildings([]);
    } else {
      setSelectedBuildings(allBuildingIds);
    }
  };

  const handleSubmit = async () => {
    if (!staffId) return;

    try {
      const response = await updateStaffPermissions({
        staffId: staffId,
        body: {
          permissions: selectedPermissions,
          assignedBuildings: selectedBuildings,
        },
      }).unwrap();

      toast.success(
        response?.message || "Cập nhật quyền hạn và tòa nhà thành công"
      );

      await onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);

      const status = error?.status;
      const errorData = error?.data;
      const detailMessage = errorData?.message?.message;

      switch (status) {
        case 400:
          toast.error("Một số quyền không tồn tại. Vui lòng kiểm tra lại.");
          break;

        case 403:
          toast.error("Bạn không có quyền quản lý một số tòa nhà đã chọn!");
          break;

        case 404:
          toast.error("Không tìm thấy dữ liệu");
          break;

        case 500:
          toast.error("Lỗi hệ thống (Server Error). Vui lòng thử lại sau!");
          break;

        default:
          toast.error(detailMessage || "Cập nhật thất bại! Vui lòng thử lại.");
          break;
      }
    }
  };

  const isGroupFullySelected = (groupName: string) => {
    const groupPermissions = permissionGroups[groupName] || [];
    const groupCodes = groupPermissions.map((p) => p.code);
    return (
      groupCodes.length > 0 &&
      groupCodes.every((code) => selectedPermissions.includes(code))
    );
  };

  const isAllBuildingsSelected = useMemo(() => {
    const allBuildingIds =
      allBuildings?.data.map((b: IBuilding) => b._id) || [];
    return (
      allBuildingIds.length > 0 &&
      allBuildingIds.every((id: string) => selectedBuildings.includes(id))
    );
  }, [allBuildings, selectedBuildings]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl !max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Quản lý phân quyền nhân viên
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-1">
            Chọn quyền hạn và tòa nhà cho nhân viên{" "}
            <span className="font-semibold">{staffName}</span>
          </p>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto py-4 space-y-6 px-1">
            {/* Section: Permissions */}

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  Tòa nhà được quản lý
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {selectedBuildings.length} /{" "}
                    {allBuildings?.data.length || 0} tòa
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
                    {isAllBuildingsSelected ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Bỏ chọn tất cả
                      </>
                    ) : (
                      "Chọn tất cả"
                    )}
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
                      const isChecked = selectedBuildings.includes(
                        building._id
                      );
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
                            onCheckedChange={() =>
                              handleToggleBuilding(building._id)
                            }
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
                    {selectedPermissions.length} / {allPermissions?.length || 0}{" "}
                    quyền
                  </span>
                </div>

                {Object.entries(permissionGroups).map(
                  ([groupName, permissions]) => (
                    <Card
                      key={groupName}
                      className="p-4 border-slate-200 shadow-sm"
                    >
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
                            {isGroupFullySelected(groupName) ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Bỏ chọn tất cả
                              </>
                            ) : (
                              "Chọn tất cả"
                            )}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {permissions.map((permission) => {
                            const isChecked = selectedPermissions.includes(
                              permission.code
                            );
                            return (
                              <div
                                key={permission._id}
                                className={`flex items-center space-x-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-purple-50 border-purple-200 shadow-sm"
                                    : getActionColor(permission.action)
                                }`}
                                onClick={() =>
                                  handleTogglePermission(permission.code)
                                }
                              >
                                <Checkbox
                                  id={permission._id}
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    handleTogglePermission(permission.code)
                                  }
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
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer */}
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
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
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

export default ModalEditStaffPermissions;
