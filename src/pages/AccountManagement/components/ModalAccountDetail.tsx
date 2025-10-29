import { useState, useEffect } from "react";
import { User, Mail, Calendar, Shield, CheckCircle, XCircle, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useGetAccountByIdQuery, useUpdateAccountRoleMutation } from "@/services/account/account.service";
import { toast } from "sonner";

interface AccountDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string | null;
}

const AccountDetailModal = ({ open, onOpenChange, accountId }: AccountDetailModalProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { data: accountData, isLoading, refetch } = useGetAccountByIdQuery(accountId || "", {
    skip: !accountId || !open,
  });

  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateAccountRoleMutation();

  const account = accountData?.user;

  useEffect(() => {
    if (account) {
      setSelectedRole(account.role);
    }
  }, [account]);

  const handleUpdateRole = async () => {
    if (!account || selectedRole === account.role) {
      toast.info("Vai trò không thay đổi");
      return;
    }

    try {
      const result = await updateRole({
        id: account._id,
        role: selectedRole as "admin" | "landlord" | "tenant",
      }).unwrap();

      toast.success("Cập nhật vai trò thành công");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Cập nhật vai trò thất bại");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "landlord":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "tenant":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: "Quản trị viên",
      landlord: "Chủ trọ",
      tenant: "Người thuê",
      resident: "Người dùng",
    };
    return roleLabels[role] || role;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return { bg: "bg-red-100", icon: "text-red-600" };
      case "landlord":
        return { bg: "bg-purple-100", icon: "text-purple-600" };
      case "tenant":
        return { bg: "bg-blue-100", icon: "text-blue-600" };
      default:
        return { bg: "bg-gray-100", icon: "text-gray-600" };
    }
  };

  const getGenderLabel = (gender: string) =>{
    switch(gender?.toLowerCase()){
      case "male": 
        return "Nam";
      case "female":
        return "Nữ";
      default:
        return "Không xác định";
    }
  }

  const availableRoles = ["landlord", "tenant"];

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!account) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Không tìm thấy tài khoản</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const roleIcon = getRoleIcon(account.role);
  const hasRoleChanged = selectedRole !== account.role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${roleIcon.bg} rounded-full flex items-center justify-center`}>
              <User className={`w-7 h-7 ${roleIcon.icon}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{account.email}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={getRoleBadgeStyle(account.role)}
                >
                  {getRoleLabel(account.role)}
                </Badge>
                {account.isActivated ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Vô hiệu hóa
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Email</label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {account.email}
                </p>
              </div>
              
              {account.userInfo && (
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    ID Thông tin người dùng
                  </label>
                  {account.userInfo && (
                  <div className="space-y-1 text-sm text-slate-700 mt-1">
                    <p><strong>Họ và tên:</strong> {account.userInfo.fullName}</p>
                    <p><strong>Số điện thoại:</strong> {account.userInfo.phoneNumber}</p>
                    <p><strong>Giới tính:</strong> {getGenderLabel(account.userInfo.gender)}</p>
                    <p><strong>Ngày sinh:</strong> {new Date(account.userInfo.dob).toLocaleDateString("vi-VN")}</p>
                   <p>
                    <strong>Địa chỉ:</strong>
                    <ul className="list-disc ml-5 mt-1 text-slate-700">
                      {account.userInfo.address.map((addr, index) => (
                        <li key={index}>
                          {addr.address}, {addr.wardName}, {addr.districtName}, {addr.provinceName}
                        </li>
                      ))}
                    </ul>
                  </p>
                  </div>
                )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader >
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Quản lý quyền
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  Vai trò hiện tại
                </label>
                <Badge
                  variant="outline"
                  className={`${getRoleBadgeStyle(account.role)} px-3 py-1`}
                >
                  {getRoleLabel(account.role)}
                </Badge>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  Thay đổi vai trò
                </label>
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasRoleChanged && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-xs text-amber-800">
                    <strong>Lưu ý:</strong> Thay đổi từ{" "}
                    <strong>{getRoleLabel(account.role)}</strong> sang{" "}
                    <strong>{getRoleLabel(selectedRole)}</strong>
                  </p>
                </div>
              )}

               {hasRoleChanged && (
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRole(account.role)}
                    >
                      Hủy thay đổi
                    </Button>
                    <Button
                      onClick={handleUpdateRole}
                      disabled={isUpdatingRole}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdatingRole ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader >
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Ngày tạo tài khoản
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {formatDate(account.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {formatDate(account.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader >
              <CardTitle className="text-base flex items-center gap-2">
                {account.isActivated ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-600" />
                )}
                Trạng thái tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {account.isActivated ? "Đang hoạt động" : "Bị vô hiệu hóa"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {account.isActivated
                      ? "Có thể đăng nhập"
                      : "Không thể đăng nhập"}
                  </p>
                </div>
                {account.isActivated ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

       
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailModal;