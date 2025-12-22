import { useState, useEffect } from "react";
import { User, Mail, Calendar, Shield, CheckCircle, XCircle, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
      toast.error(error?.message?.message || "Cập nhật vai trò thất bại");
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

 return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 border-b">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 ${roleIcon.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <User className={`w-8 h-8 ${roleIcon.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold truncate">{account.email}</DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={getRoleBadgeStyle(account.role)}>
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
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-base flex items-center gap-2 mb-4 text-slate-800">
              <Mail className="w-4 h-4 text-blue-600" />
              Thông tin cơ bản
            </h3>
            {account.userInfo ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label className="text-xs text-slate-500">Họ và tên</label>
                  <p className="text-sm font-medium text-slate-900">{account.userInfo.fullName}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Email</label>
                  <p className="text-sm font-medium text-slate-900 truncate">{account.email}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Số điện thoại</label>
                  <p className="text-sm font-medium text-slate-900">{account.userInfo.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Giới tính</label>
                  <p className="text-sm font-medium text-slate-900">{getGenderLabel(account.userInfo.gender)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">Ngày sinh</label>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(account.userInfo.dob).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Chưa có thông tin người dùng</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-3 text-slate-800">
                <Shield className="w-4 h-4 text-purple-600" />
                Quản lý quyền
              </h3>
              <div>
                <label className="text-xs text-slate-500 block mb-2">Vai trò hiện tại</label>
                <Badge variant="outline" className={`${getRoleBadgeStyle(account.role)} px-3 py-1.5`}>
                  {getRoleLabel(account.role)}
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-3 text-slate-800">
                <Calendar className="w-4 h-4 text-orange-600" />
                Thời gian
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-500">Ngày tạo</label>
                  <p className="text-sm text-slate-900">{formatDate(account.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Cập nhật cuối</label>
                  <p className="text-sm text-slate-900">{formatDate(account.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailModal;