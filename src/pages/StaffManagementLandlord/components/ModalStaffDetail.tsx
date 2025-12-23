import { useState } from "react";
import { 
  User, Mail, Phone, Calendar, Shield, Building, 
  CheckCircle, XCircle, Edit, Key, Settings, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IStaff } from "@/types/staff";
import ModalEditStaffInfo from "./ModalEditStaffInfo";
import ModalEditStaffPermissions from "./ModalEditStaffPermissions";

interface ModalStaffDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: IStaff | null;
}

const ModalStaffDetail = ({ open, onOpenChange, staff }: ModalStaffDetailProps) => {
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  
  if (!staff) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getGenderLabel = (gender: string) => {
    return gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Khác";
  };

  const groupPermissions = (permissions: string[]) => {
    const groups: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }> = {};
    
    permissions.forEach(perm => {
      const [category, action] = perm.split(":");
      if (!groups[category]) {
        groups[category] = { view: false, create: false, edit: false, delete: false };
      }
      groups[category][action as keyof typeof groups[string]] = true;
    });

    return groups;
  };

  const permissionGroups = groupPermissions(staff.permissions);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      service: "Dịch vụ",
      booking: "Lịch xem phòng",
      room: "Phòng",
      floor: "Tầng",
      building: "Tòa nhà",
      contract: "Hợp đồng",
      maintenance: "Bảo trì",
      post: "Bài đăng",
      furniture: "Nội thất",
      contact: "Yêu cầu tạo hợp đồng",
      regulation: "Quy định",
      schedule: "Quản lý lịch rảnh",
      term: "Điều khoản",
      invoice: "Hóa đơn",
      resident: "Cư dân",
      report: "Báo cáo",
      "building-furniture": "Nội thất tòa nhà",
      "room-furniture": "Nội thất phòng",
      utility:"Điện nước",
      rating: "Đánh giá",
      notification: "Thống báo",
      "revenue-expenditure": "Thu chi"
    };
    return labels[category] || category;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      view: "bg-blue-100 text-blue-700",
      create: "bg-green-100 text-green-700",
      edit: "bg-amber-100 text-amber-700",
      delete: "bg-red-100 text-red-700"
    };
    return colors[action] || "bg-gray-100 text-gray-700";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      view: "Xem",
      create: "Tạo",
      edit: "Sửa",
      delete: "Xóa"
    };
    return labels[action] || action;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl !max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chi tiết Nhân viên
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Xem thông tin và quyền hạn của nhân viên
          </p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <div className="px-6 pb-6">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {staff.accountId.userInfo.fullName}
                      </h2>
                      <p className="text-slate-600 mt-1">{staff.accountId.email}</p>
                      <div className="flex items-center gap-2 mt-3">
                        {staff.accountId.isActivated ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đang hoạt động
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Vô hiệu hóa
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          <Shield className="w-3 h-3 mr-1" />
                          Nhân viên
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setIsEditInfoOpen(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                      </Button>
                      <Button 
                        size="sm" 
                        className="gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                        onClick={() => setIsEditPermissionsOpen(true)}
                      >
                        <Settings className="w-4 h-4" />
                        Phân quyền
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-0 shadow-sm p-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-slate-800">
                  <User className="w-5 h-5 text-blue-600" />
                  Thông tin cơ bản
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {staff.accountId.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      Số điện thoại
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {staff.accountId.userInfo.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <User className="w-3.5 h-3.5" />
                      Giới tính
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {getGenderLabel(staff.accountId.userInfo.gender)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Ngày sinh
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {formatDate(staff.accountId.userInfo.dob)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-0 shadow-sm p-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-slate-800">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Thời gian
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500">Ngày tạo tài khoản</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {formatDate(staff.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Tham gia công việc</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {formatDate(staff.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                    <Building className="w-5 h-5 text-purple-600" />
                    Tòa nhà quản lý
                    <Badge variant="outline" className="ml-2">
                      {staff.assignedBuildings.length} tòa
                    </Badge>
                  </h3>
                </div>
                {staff.assignedBuildings.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {staff.assignedBuildings.map((building) => (
                      <div
                        key={building.id}
                        className="border rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">
                              {building.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                             Địa chỉ: {building.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <Building className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">Chưa được phân công tòa nhà</p>
                  </div>
                )}
              </Card>

              <Card className="border-0 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                    <Key className="w-5 h-5 text-indigo-600" />
                    Quyền hạn
                    <Badge variant="outline" className="ml-2">
                      {staff.permissions.length} quyền
                    </Badge>
                  </h3>
                </div>
                
                {Object.keys(permissionGroups).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(permissionGroups).map(([category, actions]) => (
                      <div key={category} className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-2">
                              {getCategoryLabel(category)}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(actions).map(([action, hasPermission]) => (
                                hasPermission && (
                                  <Badge
                                    key={action}
                                    variant="outline"
                                    className={`${getActionColor(action)} border-0`}
                                  >
                                    {getActionLabel(action)}
                                  </Badge>
                                )
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">Chưa có quyền nào được cấp</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>

      <ModalEditStaffInfo
        open={isEditInfoOpen}
        onOpenChange={setIsEditInfoOpen}
        staff={staff}
        onSuccess={() => {
          setIsEditInfoOpen(false);
        }}
      />

      <ModalEditStaffPermissions
        open={isEditPermissionsOpen}
        onOpenChange={setIsEditPermissionsOpen}
        staffId={staff._id}
        staffName={staff.accountId.userInfo.fullName}
        staffPermissions={staff.permissions}
        staffBuildings={staff.assignedBuildings?.map((b) => b.id) || []}
        onSuccess={() => {
          setIsEditPermissionsOpen(false);
          onOpenChange(false);
        }}
      />
    </Dialog>
  );
};

export default ModalStaffDetail;