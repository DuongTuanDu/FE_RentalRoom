import { useState, useMemo, useCallback } from "react";
import { useGetMaintenancesQuery } from "@/services/maintenance/maintenance.service";
import { Wrench, Search, Eye, Edit2, Loader2 } from "lucide-react";
import _ from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IMaintenanceItem } from "@/types/maintenance";
import { MaintenanceDetailSheet } from "./components/MaintenanceDetailSheet";
import { UpdateMaintenanceDialog } from "./components/UpdateMaintenanceDialog";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { MaintenanceActionsGuide } from "./components/MaintenanceActionsGuide";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  open: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  rejected: "Đã từ chối",
};

const MaintenanceManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [buildingFilter, setBuildingFilter] = useState<string>("");
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [viewingMaintenance, setViewingMaintenance] =
    useState<IMaintenanceItem | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updatingMaintenance, setUpdatingMaintenance] =
    useState<IMaintenanceItem | null>(null);

  const formatDate = useFormatDate();

  // Debounce search với lodash
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

  const { data, error, isLoading, isFetching } = useGetMaintenancesQuery({
    q: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    buildingId: buildingFilter || undefined,
    page: currentPage,
    limit: pageLimit,
  });

  const totalPages = data?.total ? Math.ceil(data.total / pageLimit) : 0;

  const handleOpenDetailSheet = (maintenance: IMaintenanceItem) => {
    setViewingMaintenance(maintenance);
    setIsDetailSheetOpen(true);
  };

  const handleOpenUpdateDialog = (maintenance: IMaintenanceItem) => {
    setUpdatingMaintenance(maintenance);
    setIsUpdateDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý Yêu cầu Sửa chữa
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý các yêu cầu sửa chữa từ cư dân
              </p>
            </div>
          </div>
        </div>
        <MaintenanceActionsGuide />

        {/* Filter Section */}
        <Card>
          <CardContent>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                    disabled={isFetching}
                  />
                  {isFetching && searchQuery && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                  )}
                </div>
              </div>
              <div className="w-[200px]">
                <BuildingSelectCombobox
                  value={buildingFilter}
                  onValueChange={(value) => {
                    setBuildingFilter(value);
                    setCurrentPage(1);
                  }}
                  disabled={isFetching}
                />
              </div>
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                  disabled={isFetching}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="open">Mới</SelectItem>
                    <SelectItem value="in_progress">Đang xử lý</SelectItem>
                    <SelectItem value="resolved">Đã xử lý</SelectItem>
                    <SelectItem value="rejected">Đã từ chối</SelectItem>
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
                  disabled={isFetching}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách yêu cầu sửa chữa</CardTitle>
              {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 font-medium">
                  Có lỗi xảy ra khi tải dữ liệu
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Vui lòng thử lại sau
                </p>
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy yêu cầu nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : ""}
                </p>
              </div>
            ) : (
              <div className="relative">
                {isFetching && !isLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      <span className="text-sm font-medium text-slate-700">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </div>
                )}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Tiêu đề</TableHead>
                        <TableHead className="font-semibold">Phòng</TableHead>
                        <TableHead className="font-semibold">
                          Người báo
                        </TableHead>
                        <TableHead className="font-semibold">
                          Người được giao
                        </TableHead>
                        <TableHead className="font-semibold">
                          Chi phí sửa chữa
                        </TableHead>
                        <TableHead className="font-semibold">
                          Phải trả
                        </TableHead>
                        <TableHead className="font-semibold">
                          Trạng thái
                        </TableHead>
                        <TableHead className="font-semibold">
                          Ngày tạo
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((maintenance) => (
                        <TableRow
                          key={maintenance._id}
                          className="hover:bg-slate-50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {maintenance.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {maintenance.roomNumber || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {maintenance.reportedBy || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {maintenance.assignee?.name || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {maintenance.repairCost
                              ? `${maintenance.repairCost.toLocaleString(
                                  "vi-VN"
                                )} VNĐ`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                maintenance.mustPay
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {maintenance.mustPay ? "Có" : "Không"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                STATUS_COLORS[
                                  maintenance.status as keyof typeof STATUS_COLORS
                                ] || "bg-gray-100 text-gray-800"
                              }
                            >
                              {STATUS_LABELS[
                                maintenance.status as keyof typeof STATUS_LABELS
                              ] || maintenance.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {formatDate(maintenance.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleOpenDetailSheet(maintenance)
                                      }
                                    >
                                      <Eye className="w-4 h-4 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xem chi tiết</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleOpenUpdateDialog(maintenance)
                                      }
                                    >
                                      <Edit2 className="w-4 h-4 text-orange-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cập nhật</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-slate-600">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * pageLimit + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * pageLimit, data.total)}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">{data.total}</span> yêu cầu
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1 || isFetching}
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
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-9"
                                disabled={isFetching}
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
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages || isFetching}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Detail Sheet */}
      <MaintenanceDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) {
            setViewingMaintenance(null);
          }
        }}
        maintenanceId={viewingMaintenance?._id}
      />

      {/* Update Maintenance Dialog */}
      <UpdateMaintenanceDialog
        open={isUpdateDialogOpen}
        onOpenChange={(open) => {
          setIsUpdateDialogOpen(open);
          if (!open) {
            setUpdatingMaintenance(null);
          }
        }}
        maintenance={updatingMaintenance}
      />
    </div>
  );
};

export default MaintenanceManagement;
