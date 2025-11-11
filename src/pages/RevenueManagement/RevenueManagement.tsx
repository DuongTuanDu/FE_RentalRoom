import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { ModalRevenue } from "./components/ModalRevenue";
import { DeleteRevenuePopover } from "./components/DeleteRevenuePopover";
import { RevenueDetailSheet } from "./components/RevenueDetailSheet";
import {
  useGetRevenuesQuery,
  useCreateRevenueMutation,
  useUpdateRevenueMutation,
  useDeleteRevenueMutation,
  useGetRevenueByStatsQuery,
  useLazyGetExportExcelRevenueQuery,
} from "@/services/revenue/revenue.service";
import type { IRevenue, IRevenueRequest } from "@/types/revenue";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useFormatDate } from "@/hooks/useFormatDate";

const RevenueManagement = () => {
  const formatPrice = useFormatPrice();
  const formatDate = useFormatDate();

  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "revenue" | "expenditure"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<IRevenue | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRevenue, setDeletingRevenue] = useState<IRevenue | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedRevenueId, setSelectedRevenueId] = useState<string | null>(
    null
  );

  const now = useMemo(() => new Date(), []);
  const [statsYear, setStatsYear] = useState<number>(now.getFullYear());
  const [statsMonth, setStatsMonth] = useState<number>(now.getMonth() + 1);
  const [statsBuildingId, setStatsBuildingId] = useState<string>("");

  const [exportBuildingId, setExportBuildingId] = useState("");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  const {
    data: revenuesData,
    isLoading: isRevenuesLoading,
    isFetching: isRevenuesFetching,
  } = useGetRevenuesQuery(
    {
      buildingId: selectedBuildingId || undefined,
      type: selectedType === "all" ? undefined : selectedType,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: currentPage,
      limit: pageLimit,
    },
    { skip: false }
  );

  const { data: statsData } = useGetRevenueByStatsQuery(
    {
      buildingId: statsBuildingId || undefined,
      year: statsYear,
      month: statsMonth,
    },
    { skip: false }
  );

  const [triggerExportExcel, { isLoading: isExporting }] =
    useLazyGetExportExcelRevenueQuery();

  const [createRevenue, { isLoading: isCreating }] = useCreateRevenueMutation();
  const [updateRevenue, { isLoading: isUpdating }] = useUpdateRevenueMutation();
  const [deleteRevenue, { isLoading: isDeleting }] = useDeleteRevenueMutation();

  const totalItems = revenuesData?.total ?? 0;
  const totalPages = Math.ceil(totalItems / pageLimit);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBuildingId, selectedType, startDate, endDate]);

  const handleOpenCreateModal = () => {
    setEditingRevenue(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (revenue: IRevenue) => {
    setEditingRevenue(revenue);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (revenue: IRevenue) => {
    setDeletingRevenue(revenue);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetailSheet = (revenueId: string) => {
    setSelectedRevenueId(revenueId);
    setIsDetailSheetOpen(true);
  };

  const handleSubmit = async (data: IRevenueRequest) => {
    try {
      if (editingRevenue) {
        await updateRevenue({
          id: editingRevenue._id,
          data,
        }).unwrap();
        toast.success("Cập nhật thu chi thành công!");
      } else {
        await createRevenue(data).unwrap();
        toast.success("Thêm thu chi mới thành công!");
      }
      setIsModalOpen(false);
      setEditingRevenue(null);
    } catch (error: any) {
      toast.error(
        error.message.message || editingRevenue
          ? "Cập nhật thu chi thất bại!"
          : "Tạo thu chi thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRevenue) return;

    try {
      await deleteRevenue(deletingRevenue._id).unwrap();
      toast.success("Xóa thu chi thành công!");
      setIsDeleteDialogOpen(false);
      setDeletingRevenue(null);
    } catch (error: any) {
      toast.error(error.message.message || "Xóa thu chi thất bại!");
      console.error(error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await triggerExportExcel({
        buildingId: exportBuildingId || undefined,
        startDate: exportStartDate || undefined,
        endDate: exportEndDate || undefined,
      }).unwrap();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `BaoCaoThuChi_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Xuất Excel thành công!");
    } catch (error: any) {
      toast.error(error.message.message || "Xuat Excel thất bại!");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Thu Chi
          </h1>
          <p className="text-muted-foreground">
            Quản lý các khoản thu chi của tòa nhà
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4" />
          Thêm Thu Chi
        </Button>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thống kê thu chi</CardTitle>
          <CardDescription>
            Xem thống kê thu chi theo tháng và năm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <BuildingSelectCombobox
                value={statsBuildingId}
                onValueChange={setStatsBuildingId}
              />
            </div>
            <div className="space-y-2">
              <Label>Năm</Label>
              <Input
                type="number"
                value={statsYear}
                onChange={(e) => setStatsYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>
            <div className="space-y-2">
              <Label>Tháng</Label>
              <Select
                value={String(statsMonth)}
                onValueChange={(v) => setStatsMonth(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {statsData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Tổng thu
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(statsData.revenue)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Tổng chi
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatPrice(statsData.expenditure)}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Lợi nhuận
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          statsData.profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPrice(statsData.profit)}
                      </p>
                    </div>
                    {statsData.profit >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Excel Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xuất Excel báo cáo</CardTitle>
          <CardDescription>Xuất báo cáo thu chi ra file Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <BuildingSelectCombobox
                value={exportBuildingId}
                onValueChange={setExportBuildingId}
              />
            </div>
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Đang xuất..." : "Xuất Excel"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          <CardDescription>
            Lọc danh sách thu chi theo các tiêu chí
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Tòa nhà</Label>
            <BuildingSelectCombobox
              value={selectedBuildingId}
              onValueChange={setSelectedBuildingId}
            />
          </div>
          <div className="space-y-2">
            <Label>Loại</Label>
            <Select
              value={selectedType}
              onValueChange={(v: "all" | "revenue" | "expenditure") =>
                setSelectedType(v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="revenue">Thu</SelectItem>
                <SelectItem value="expenditure">Chi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Từ ngày</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Đến ngày</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">Danh sách thu chi</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageLimit)}
              onValueChange={(v) => setPageLimit(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="20">20 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
                <SelectItem value="100">100 / trang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Tòa nhà</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Ngày ghi nhận</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[140px] text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRevenuesLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : !revenuesData || revenuesData.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không có dữ liệu thu chi
                    </TableCell>
                  </TableRow>
                ) : (
                  revenuesData.data.map((revenue, idx) => (
                    <TableRow key={revenue._id}>
                      <TableCell>
                        {(currentPage - 1) * pageLimit + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {revenue.buildingId?.name || "N/A"}
                      </TableCell>
                      <TableCell>{revenue.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            revenue.type === "revenue"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {revenue.type === "revenue" ? "Thu" : "Chi"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(revenue.amount)}
                      </TableCell>
                      <TableCell>{formatDate(revenue.recordedAt)}</TableCell>
                      <TableCell>{formatDate(revenue.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetailSheet(revenue._id)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditModal(revenue)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(revenue)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              <span className="font-medium">
                {totalItems === 0 ? 0 : (currentPage - 1) * pageLimit + 1}
              </span>{" "}
              đến{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageLimit, totalItems)}
              </span>{" "}
              trong tổng số <span className="font-medium">{totalItems}</span>{" "}
              bản ghi
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isRevenuesFetching}
              >
                Trang trước
              </Button>
              <div className="text-sm text-muted-foreground">
                Trang {totalPages ? currentPage : 0} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    totalPages ? Math.min(totalPages, p + 1) : p
                  )
                }
                disabled={
                  totalPages === 0 ||
                  currentPage >= totalPages ||
                  isRevenuesFetching
                }
              >
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <ModalRevenue
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingRevenue(null);
        }}
        revenue={editingRevenue}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Dialog */}
      <DeleteRevenuePopover
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setDeletingRevenue(null);
        }}
        revenue={deletingRevenue}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Revenue Detail Sheet */}
      <RevenueDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) setSelectedRevenueId(null);
        }}
        revenueId={selectedRevenueId}
      />
    </div>
  );
};

export default RevenueManagement;
