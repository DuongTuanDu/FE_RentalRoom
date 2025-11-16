// StaffManagementLandlord.tsx
import { useState, useMemo, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Eye, Users, Building, Shield, MoreVertical, Settings } from "lucide-react";
import _ from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetStaffListQuery,
  useGetPermissionsQuery,
  useUpdateStaffStatusMutation,
} from "@/services/staff/staff.service";
import type { IStaff } from "@/types/staff";
import { toast } from "sonner";
import InactiveStaffAccount from "./components/InactiveStaffAccount";
import ModalStaffDetail from "./components/ModalStaffDetail";
import ModalCreateStaffAccount from "./components/CreateStaffAccount";
import ModalEditStaffPermissions from "./components/ModalEditStaffPermissions";

const StaffManagementLandlord = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);
  const [isActivatedOpen, setIsActivatedOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: staffList, isLoading, isFetching, refetch } = useGetStaffListQuery();
  const { data: permissions } = useGetPermissionsQuery();
  const [updateStaffStatus, { isLoading: isUpdatingStatus }] = useUpdateStaffStatusMutation();
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const filteredStaff = useMemo(() => {
    if (!staffList) return [];
    
    let filtered = staffList;

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(staff => staff.accountId.isActivated === isActive);
    }

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(staff => 
        staff.accountId.email.toLowerCase().includes(searchLower) ||
        staff.accountId.userInfo.fullName.toLowerCase().includes(searchLower) ||
        staff.accountId.userInfo.phoneNumber.includes(searchLower)
      );
    }

    return filtered;
  }, [staffList, statusFilter, debouncedSearch]);

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * pageLimit;
    return filteredStaff.slice(startIndex, startIndex + pageLimit);
  }, [filteredStaff, currentPage, pageLimit]);

  const totalPages = Math.ceil(filteredStaff.length / pageLimit);

  const getStaffStats = () => {
    if (!staffList) {
      return { total: 0, active: 0, inactive: 0, totalBuildings: 0 };
    }

    const total = staffList.length;
    const active = staffList.filter(s => s.accountId.isActivated).length;
    const inactive = total - active;
    const totalBuildings = _.uniq(
      staffList.flatMap(s => s.assignedBuildings.map(b => b.id))
    ).length;

    return { total, active, inactive, totalBuildings };
  };

  const stats = getStaffStats();

  const handleUpdateStatus = async () => {
    if(!selectedStaff) return;
    const staff = selectedStaff;

    try {
      const result = await updateStaffStatus({ staffId: staff._id, body: { isActive: !staff.accountId.isActivated } }).unwrap();
      setIsActivatedOpen(false);
      setSelectedStaff(null);
      refetch();
      toast.success(result.message || "Cập nhật trạng thái thành công");
    } catch (error: any) {
      toast(error?.data?.message || "Cập nhật trạng thái thất bại");
    }
  }

  const handleOpenActivatedModal = (staff: IStaff) => {
    setSelectedStaff(staff);
    setIsActivatedOpen(true);
  };

  const handleOpenDetailModal = (staff: IStaff) => {
    setSelectedStaff(staff);
    setIsDetailOpen(true);
  };

  const handleOpenCreateModal = () => {
    setIsCreateOpen(true);
  };

  const handleOpenEditPermissionsModal = (staff: IStaff) => {
    setSelectedStaff(staff);
    setIsEditPermissionsOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="w-8 h-8" />
              Quản lý người quản lý tòa nhà
            </h1>
            <p className="text-slate-600 mt-1">
              Quản lý người phụ trách vận hành và giám sát các tòa nhà
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm quản lý
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tổng quản lý</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Đang hoạt động</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Vô hiệu hóa</p>
                  <p className="text-3xl font-bold text-slate-600">{stats.inactive}</p>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
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
                    <SelectItem value="10">10 quản lý</SelectItem>
                    <SelectItem value="20">20 quản lý</SelectItem>
                    <SelectItem value="50">50 quản lý</SelectItem>
                    <SelectItem value="100">100 quản lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách các quản lý ({filteredStaff.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : paginatedStaff.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy quản lý nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery || statusFilter !== "all"
                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Chưa có quản lý trong hệ thống"}
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Người quản lý</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Liên hệ</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Tòa nhà</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Ngày tạo</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStaff.map((staff) => (
                        <tr
                          key={staff._id}
                          className="border-b hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {staff.accountId.userInfo.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {staff.accountId.userInfo.fullName}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {staff.accountId.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-slate-600">
                              {staff.accountId.userInfo.phoneNumber}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            {staff.assignedBuildings.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {staff.assignedBuildings.slice(0, 2).map((building) => (
                                    <Badge
                                    key={building.id}
                                    variant="outline"
                                    className="border-purple-200"
                                    >
                                        {building.name}
                                    </Badge>
                                ))}
                                {staff.assignedBuildings.length > 2 && (
                                    <Badge
                                    variant="outline"
                                    className="bg-slate-50 text-slate-600 border-slate-200"
                                    >
                                        +{staff.assignedBuildings.length - 2}
                                    </Badge>
                                )}
                                </div>

                            ) : (
                              <span className="text-sm text-slate-400">Chưa phân công</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-600 text-sm">
                            {formatDate(staff.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center">
                              <Badge
                                variant={staff.accountId.isActivated ? "default" : "secondary"}
                                className={`${
                                  staff.accountId.isActivated
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                } font-medium`}
                              >
                                {staff.accountId.isActivated ? "Hoạt động" : "Vô hiệu hóa"}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50"
                                onClick={() => handleOpenDetailModal(staff)}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-slate-100"
                                  >
                                    <MoreVertical className="w-4 h-4 text-slate-600" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick = {() => handleOpenEditPermissionsModal(staff)}>
                                    <Settings className="!w-8 h-4" />
                                    Phân quyền
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleOpenActivatedModal(staff)}
                                    disabled={isUpdatingStatus}
                                  >
                                    <Switch
                                      checked={staff.accountId.isActivated}
                                      className="data-[state=checked]:bg-green-600"
                                    />
                                    {staff.accountId.isActivated ? "Vô hiệu hóa" : "Kích hoạt"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                      {Math.min(currentPage * pageLimit, filteredStaff.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredStaff.length}</span> quản lý
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
      
      <InactiveStaffAccount
        open={isActivatedOpen}
        onOpenChange={(open) => {
          setIsActivatedOpen(open);
          if (!open) {
            setSelectedStaff(null);
          }
        }}
        staff={selectedStaff}
        onConfirm={handleUpdateStatus}
        isActive={selectedStaff?.accountId.isActivated ?? false}
      />

      <ModalStaffDetail
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setSelectedStaff(null);
          }
        }}
        staff={selectedStaff}
      />

      <ModalCreateStaffAccount
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
        }}
        onSuccess={async () => {
          await refetch(); 
        }}
      />

        <ModalEditStaffPermissions
                  open={isEditPermissionsOpen}
                  onOpenChange={setIsEditPermissionsOpen}
                  staffId={selectedStaff?._id!}
                  staffName={selectedStaff?.accountId?.userInfo?.fullName!}
                  staffPermissions={selectedStaff?.permissions!}
                  staffBuildings={selectedStaff?.assignedBuildings?.map(b => b.id) || []}
                  onSuccess={() => {
                      setIsEditPermissionsOpen(false);
                  }}
              />
    </div>
  );
};

export default StaffManagementLandlord;