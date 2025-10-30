import { useState, useMemo, useCallback } from "react";
import {
  useDeleteBuildingMutation,
  useGetBuildingsQuery,
  useUpdateStatusMutation,
} from "@/services/building/building.service";
import { Building2, Search, Trash2, Eye } from "lucide-react";
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
import { useFormatPrice } from "@/hooks/useFormatPrice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import type { IBuilding } from "@/types/building";
import { toast } from "sonner";
import AlertDeleteBuilding from "../BuildingManageLandlord/components/AlertDeleteBuilding";
import DrawerBuildingDetail from "../BuildingManageLandlord/components/DrawerBuildingDetail";

const BuildingManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateStatusMutation();
  const [deleteBuilding, { isLoading: isDeleting }] =
    useDeleteBuildingMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingBuilding, setDeletingBuilding] = useState<IBuilding | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingBuilding, setViewingBuilding] = useState<IBuilding | null>(
    null
  );
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  // Debounce search với lodash
  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1); // Reset về trang 1 khi search
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

  const { data, error, isLoading } = useGetBuildingsQuery({
    q: debouncedSearch,
    page: currentPage,
    limit: pageLimit,
  });

  const totalPages = data?.total ? Math.ceil(data.total / pageLimit) : 0;

  const handleOpenDeleteDialog = (building: IBuilding) => {
    setDeletingBuilding(building);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDrawer = (building: IBuilding) => {
      setViewingBuilding(building);
      setIsDrawerOpen(true);
    };

  const handleUpdateStatus = async (building: IBuilding) => {
    try {
      const newStatus = building.status === "active" ? "inactive" : "active";
      await updateStatus({ id: building._id, status: newStatus }).unwrap();
      toast.success("Thành công", {
        description: `Tòa nhà đã được ${
          newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"
        } thành công`,
      });
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.data?.message ||
          "Không thể cập nhật trạng thái tòa nhà. Vui lòng thử lại",
      });
    }
  };

  const handleDeleteBuilding = async () => {
    if (!deletingBuilding) return;

    try {
      await deleteBuilding(deletingBuilding._id).unwrap();
      setIsDeleteDialogOpen(false);
      setDeletingBuilding(null);
      toast.success("Thành công", {
        description: "Tòa nhà đã được xóa thành công",
      });
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message || "Không thể xóa tòa nhà. Vui lòng thử lại",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý Tòa nhà
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý thông tin các tòa nhà trong hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <Card>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm tòa nhà theo tên"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={pageLimit.toString()}
                  onValueChange={(value) => {
                    setPageLimit(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 tòa nhà</SelectItem>
                    <SelectItem value="20">20 tòa nhà</SelectItem>
                    <SelectItem value="50">50 tòa nhà</SelectItem>
                    <SelectItem value="100">100 tòa nhà</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tòa nhà</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy tòa nhà nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : ""}
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">
                          Tên tòa nhà
                        </TableHead>
                        <TableHead className="font-semibold">Chủ trọ</TableHead>
                        <TableHead className="font-semibold">Địa chỉ</TableHead>
                        <TableHead className="font-semibold">Mô tả</TableHead>
                        <TableHead className="font-semibold">
                          Giá điện
                        </TableHead>
                        <TableHead className="font-semibold">
                          Giá nước
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
                      {data.data.map((building) => (
                        <TableRow
                          key={building._id}
                          className="hover:bg-slate-50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-blue-600" />
                              </div>
                              {building.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {building.landlordId?.userInfo?.fullName || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {building.address}
                          </TableCell>
                          <TableCell className="text-slate-600 max-w-xs truncate">
                            {building.description || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {formatPrice(building.ePrice)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {formatPrice(building.wPrice)}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-slate-600 text-sm">
                            {formatDate(building.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <Switch
                                        checked={building.status === "active"}
                                        onCheckedChange={() =>
                                          handleUpdateStatus(building)
                                        }
                                        disabled={isUpdatingStatus}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {building.status === "active"
                                        ? "Click để ngừng hoạt động tòa nhà"
                                        : "Click để kích hoạt tòa nhà"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDrawer(building)}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDeleteDialog(building)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
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
                    <span className="font-medium">{data.total}</span> tòa nhà
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
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
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
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
      {/* Alert Delete Building */}
      <AlertDeleteBuilding
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingBuilding(null);
          }
        }}
        building={deletingBuilding}
        onConfirm={handleDeleteBuilding}
        isLoading={isDeleting}
      />

      {/* Drawer Building Detail */}
      <DrawerBuildingDetail
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            setViewingBuilding(null);
          }
        }}
        building={viewingBuilding}
      />
    </div>
  );
};

export default BuildingManagement;
