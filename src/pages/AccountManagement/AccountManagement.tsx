import { useState, useMemo, useCallback } from "react";
import { Search, Edit, Trash2, Eye, User, UserCheck } from "lucide-react";
import _, { set } from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAccountsQuery, useUpdateAccountStatusMutation } from "@/services/account/account.service";
import type { IAccount } from "@/types/account";
import { toast } from "sonner";
import AlertInactiveAccount from "./components/AlertInactiveAccount";
import AccountDetailModal from "./components/ModalAccountDetail";

const AccountManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isActivatedOpen, setIsActivatedOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [isAccountDetailOpen, setIsAccountDetailOpen] = useState(false);

  const { data: accountsData, isLoading, isFetching, refetch } = useGetAccountsQuery({
    page: 1,
    limit: 1000,
    search: debouncedSearch,
  });

  const [updateAccountStatus, { isLoading: isUpdatingStatus }] = useUpdateAccountStatusMutation();

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 700),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  const handleUpdateStatus = async () => {
    if (!selectedAccount) return;
    const account = selectedAccount;

    try {
      const result = await updateAccountStatus({ id: account._id }).unwrap();
      setIsActivatedOpen(false);
      setSelectedAccount(null);
      toast.success(result.message || "Cập nhật trạng thái thành công");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleOpenActivatedDialog = (account: IAccount) => {
    setSelectedAccount(account);
    setIsActivatedOpen(true);
  };

  const handleOpenAccountDetail = (account: IAccount) => {
    setIsAccountDetailOpen(true);
    setSelectedAccount(account);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const availableRoles = useMemo(() => {
    if (!accountsData?.users) return [];
    
    const roles = _.uniq(accountsData.users.map(user => user.role));
    return roles.sort();
  }, [accountsData?.users]);

  const filteredAccounts = useMemo(() => {
    if (!accountsData?.users) return [];
    
    let filtered = accountsData.users;

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    return filtered;
  }, [accountsData?.users, roleFilter]);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageLimit;
    return filteredAccounts.slice(startIndex, startIndex + pageLimit);
  }, [filteredAccounts, currentPage, pageLimit]);

  const totalPages = Math.ceil(filteredAccounts.length / pageLimit);

  const getAccountStats = () => {
    if (!accountsData?.users) {
      return { total: 0, byRole: {}, active: 0 };
    }

    const users = accountsData.users;
    const total = users.length;
    const active = users.filter(u => u.isActivated).length;
    
    const byRole: Record<string, number> = {};
    users.forEach(user => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
    });

    return { total, byRole, active };
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

  const stats = getAccountStats();

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <User className="w-8 h-8 " />
              Quản lý Tài khoản
            </h1>
            <p className="text-slate-600 mt-1">
              Quản lý tài khoản người dùng trong hệ thống
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-auto-fit gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
          <Card>
            <CardContent className="pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tổng tài khoản</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {availableRoles.map((role) => {
            const roleIcon = getRoleIcon(role);
            return (
              <Card key={role}>
                <CardContent className="pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">{getRoleLabel(role)}</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats.byRole[role] || 0}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${roleIcon.bg} rounded-lg flex items-center justify-center`}>
                      <UserCheck className={`w-6 h-6 ${roleIcon.icon}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardContent className="pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-3">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo email"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={pageLimit.toString()}
                  onValueChange={(value) => {
                    setPageLimit(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 tài khoản</SelectItem>
                    <SelectItem value="20">20 tài khoản</SelectItem>
                    <SelectItem value="50">50 tài khoản</SelectItem>
                    <SelectItem value="100">100 tài khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách tài khoản ({filteredAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : paginatedAccounts.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy tài khoản nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery || roleFilter !== "all"
                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Chưa có tài khoản trong hệ thống"}
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Vai trò</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Ngày tạo</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAccounts.map((account) => {
                        const roleIcon = getRoleIcon(account.role);
                        return (
                          <tr
                            key={account._id}
                            className="border-b hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 ${roleIcon.bg} rounded-lg flex items-center justify-center`}>
                                  <User className={`w-4 h-4 ${roleIcon.icon}`} />
                                </div>
                                <span className="font-medium text-slate-900">{account.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={getRoleBadgeStyle(account.role)}
                              >
                                {getRoleLabel(account.role)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-sm">
                              {formatDate(account.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-3">
                                <Badge
                                  variant={account.isActivated ? "default" : "secondary"}
                                  className={`${
                                    account.isActivated
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-gray-100 text-gray-600 border-gray-200"
                                  } font-medium`}
                                >
                                  {account.isActivated ? "Hoạt động" : "Vô hiệu hóa"}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenAccountDetail(account)} 
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </Button>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center">
                                        <Switch
                                          checked={account.isActivated}
                                          onClick={() => handleOpenActivatedDialog(account)}
                                          disabled={isUpdatingStatus}
                                          className="data-[state=checked]:bg-green-600"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {account.isActivated
                                          ? "Click để vô hiệu hóa tài khoản"
                                          : "Click để kích hoạt tài khoản"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-slate-600">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageLimit + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageLimit, filteredAccounts.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredAccounts.length}</span> tài khoản
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-9"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AccountDetailModal
        open={isAccountDetailOpen}
        onOpenChange={(open) => {
          setIsAccountDetailOpen(open);
          if (!open) {
            setSelectedAccount(null);
          }
        }}
        accountId={selectedAccount?._id || ""}

      />

      <AlertInactiveAccount
        open={isActivatedOpen}
        onOpenChange={(open) => {
          setIsActivatedOpen(open);
          if (!open) {
            setSelectedAccount(null);
          }
        }}
        account={selectedAccount}
        onConfirm={handleUpdateStatus}
        isActive={selectedAccount?.isActivated ?? false}
      />
    </div>
  );
};

export default AccountManagement;