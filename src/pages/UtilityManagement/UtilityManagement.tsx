import { useState, useEffect } from "react";
import { useGetUtilityReadingsQuery } from "@/services/utility/utility.service";
import {
  Zap,
  Droplets,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { RoomSelectCombobox } from "@/pages/RoomFurnitureLandlord/components/RoomSelectCombobox";
import type { IUtilityItem } from "@/types/utility";
import { CreateUtilityDialog } from "./components/CreateUtilityDialog";
import { CreateUtilityBulkDialog } from "./components/CreateUtilityBulkDialog";
import { UpdateUtilityDialog } from "./components/UpdateUtilityDialog";
import { DetailUtilitySheet } from "./components/DetailUtilitySheet";
import { DeleteUtilityDialog } from "./components/DeleteUtilityDialog";
import { ConfirmUtilityDialog } from "./components/ConfirmUtilityDialog";
import {
  useDeleteUtilityReadingMutation,
  useConfirmUtilityReadingMutation,
} from "@/services/utility/utility.service";

const UtilityManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [buildingId, setBuildingId] = useState("");
  const [roomId, setRoomId] = useState("");
  console.log("roomId", roomId);
  
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateBulkDialogOpen, setIsCreateBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<IUtilityItem | null>(
    null
  );
  const [selectedUtilityId, setSelectedUtilityId] = useState<string | null>(
    null
  );

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Reset roomId when buildingId changes
  useEffect(() => {
    if (buildingId) {
      setRoomId("");
    }
  }, [buildingId]);

  // API queries
  const { data, error, isLoading } = useGetUtilityReadingsQuery({
    page: currentPage,
    limit: pageLimit,
    buildingId: buildingId || undefined,
    roomId: roomId || undefined,
    type:
      typeFilter !== "all"
        ? (typeFilter as "electricity" | "water")
        : undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as "draft" | "confirmed" | "billed")
        : undefined,
    periodMonth: periodMonth || undefined,
    periodYear: periodYear || undefined,
  });

  const [deleteUtilityReading, { isLoading: isDeleting }] =
    useDeleteUtilityReadingMutation();
  const [confirmUtilityReading, { isLoading: isConfirming }] =
    useConfirmUtilityReadingMutation();

  const totalPages = data?.totalPages || 0;

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleOpenCreateBulkDialog = () => {
    setIsCreateBulkDialogOpen(true);
  };

  const handleOpenEditDialog = (utility: IUtilityItem) => {
    if (utility.status !== "draft") {
      toast.error("Chỉ có thể chỉnh sửa chỉ số ở trạng thái nháp");
      return;
    }
    setSelectedUtility(utility);
    setIsEditDialogOpen(true);
  };

  const handleOpenDetailSheet = (utility: IUtilityItem) => {
    setSelectedUtilityId(utility._id);
    setIsDetailSheetOpen(true);
  };

  const handleOpenDeleteDialog = (utility: IUtilityItem) => {
    if (utility.status !== "draft") {
      toast.error("Chỉ có thể xóa chỉ số ở trạng thái nháp");
      return;
    }
    setSelectedUtility(utility);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenConfirmDialog = (utility: IUtilityItem) => {
    if (utility.status !== "draft") {
      toast.error("Chỉ có thể xác nhận chỉ số ở trạng thái nháp");
      return;
    }
    setSelectedUtility(utility);
    setIsConfirmDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUtility) return;

    try {
      await deleteUtilityReading(selectedUtility._id).unwrap();

      setIsDeleteDialogOpen(false);
      setSelectedUtility(null);
      toast.success("Thành công", {
        description: "Xóa chỉ số điện nước thành công",
      });
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message || "Không thể xóa chỉ số. Vui lòng thử lại",
      });
    }
  };

  const handleConfirm = async () => {
    if (!selectedUtility) return;

    try {
      await confirmUtilityReading(selectedUtility._id).unwrap();

      setIsConfirmDialogOpen(false);
      setSelectedUtility(null);
      toast.success("Thành công", {
        description: "Xác nhận chỉ số điện nước thành công",
      });
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message || "Không thể xác nhận chỉ số. Vui lòng thử lại",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Nháp", className: "bg-yellow-100 text-yellow-800" },
      confirmed: {
        label: "Đã xác nhận",
        className: "bg-blue-100 text-blue-800",
      },
      billed: {
        label: "Đã xuất hóa đơn",
        className: "bg-green-100 text-green-800",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    return type === "electricity" ? (
      <Zap className="w-4 h-4 text-yellow-500" />
    ) : (
      <Droplets className="w-4 h-4 text-blue-500" />
    );
  };

  const getTypeLabel = (type: string) => {
    return type === "electricity" ? "Điện" : "Nước";
  };


  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý điện nước
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý chỉ số điện nước theo phòng
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleOpenCreateBulkDialog}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo hàng loạt
            </Button>
            <Button onClick={handleOpenCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo chỉ số mới
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bộ lọc</CardTitle>
            <CardDescription>
              Bộ lọc cơ bản tìm kiếm quản lý điện nước
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block">Tòa nhà</Label>
                <BuildingSelectCombobox
                  value={buildingId}
                  onValueChange={(value) => {
                    setBuildingId(value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <Label className="mb-2 block">Phòng</Label>
                <RoomSelectCombobox
                  value={roomId}
                  onValueChange={(value) => {
                    setRoomId(value);
                    setCurrentPage(1);
                  }}
                  buildingId={buildingId || undefined}
                  disabled={!buildingId}
                />
              </div>
              <div>
                <Label className="mb-2 block">Loại</Label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="electricity">Điện</SelectItem>
                    <SelectItem value="water">Nước</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Trạng thái</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="billed">Đã xuất hóa đơn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Tháng</Label>
                <Select
                  value={periodMonth || "all"}
                  onValueChange={(value) => {
                    setPeriodMonth(value === "all" ? "" : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        Tháng {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Năm</Label>
                <Select
                  value={periodYear || "all"}
                  onValueChange={(value) => {
                    setPeriodYear(value === "all" ? "" : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách chỉ số điện nước</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            ) : !data?.items || data.items.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy chỉ số nào
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Tòa nhà</TableHead>
                        <TableHead className="font-semibold">Phòng</TableHead>
                        <TableHead className="font-semibold">Loại</TableHead>
                        <TableHead className="font-semibold">Kỳ</TableHead>
                        <TableHead className="font-semibold">
                          Chỉ số trước
                        </TableHead>
                        <TableHead className="font-semibold">
                          Chỉ số hiện tại
                        </TableHead>
                        <TableHead className="font-semibold">
                          Tiêu thụ
                        </TableHead>
                        <TableHead className="font-semibold">Đơn giá</TableHead>
                        <TableHead className="font-semibold">
                          Thành tiền
                        </TableHead>
                        <TableHead className="font-semibold">
                          Trạng thái
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((item) => (
                        <TableRow key={item._id} className="hover:bg-slate-50">
                          <TableCell className="text-slate-600">
                            {item.buildingId?.name || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            Phòng {item.roomId?.roomNumber || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              <span>{getTypeLabel(item.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {item.periodMonth}/{item.periodYear}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {item.previousIndex.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">
                            {item.currentIndex.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {item.consumption.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {item.unitPrice.toLocaleString()} đ
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">
                            {item.amount.toLocaleString()} đ
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                                        handleOpenDetailSheet(item)
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
                              {item.status === "draft" && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                            handleOpenEditDialog(item)
                                          }
                                        >
                                          <Edit className="w-4 h-4 text-green-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Chỉnh sửa</p>
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
                                            handleOpenConfirmDialog(item)
                                          }
                                        >
                                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Xác nhận</p>
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
                                            handleOpenDeleteDialog(item)
                                          }
                                        >
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Xóa</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {data && data.total > 0 && totalPages > 0 && (
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
                      <span className="font-medium">{data.total}</span> chỉ số
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Select
                          value={pageLimit.toString()}
                          onValueChange={(value) => {
                            setPageLimit(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="w-32">
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
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
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
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
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

      {/* Dialog Components */}
      <CreateUtilityDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        buildingId={buildingId || undefined}
      />

      <CreateUtilityBulkDialog
        open={isCreateBulkDialogOpen}
        onOpenChange={setIsCreateBulkDialogOpen}
      />

      <UpdateUtilityDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        utility={selectedUtility}
      />

      <DetailUtilitySheet
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        utilityId={selectedUtilityId}
      />

      <DeleteUtilityDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        utility={selectedUtility}
        isLoading={isDeleting}
      />

      <ConfirmUtilityDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirm}
        isLoading={isConfirming}
      />
    </div>
  );
};

export default UtilityManagement;
