import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Edit,
  Layers,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useCreateFloorMutation,
  useDeleteFloorMutation,
  useGetFloorsQuery,
  useUpdateFloorMutation,
  useUpdateStatusFloorMutation,
} from "@/services/floor/floor.service";
import { useFormatDate } from "@/hooks/useFormatDate";
import { toast } from "sonner";
import type { CreateFloorRequest, IFloor } from "@/types/floor";
import { ModalFloor } from "./components/ModalFloor";
import { DeleteFloorPopover } from "./components/DeleteFloorPopover";
import { BuildingSelectCombobox } from "./components/BuildingSelectCombobox";
import { ModalQuickFloor } from "./components/ModalQuickFloor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Permission from "@/layouts/Permission";
import { FloorActionsGuide } from "./components/FloorActionsGuide";

const FloorManageLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<IFloor | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<IFloor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const formatDate = useFormatDate();

  const { data: initialBuildingData } = useGetBuildingsQuery({
    q: "",
    page: 1,
    limit: 10,
    status: "active",
  });

  const { data: floorsData, isLoading: isFloorsLoading } = useGetFloorsQuery(
    {
      buildingId: selectedBuildingId,
      page: currentPage,
      limit: pageSize,
    },
    {
      skip: !selectedBuildingId,
    }
  );

  const [createFloor, { isLoading: isCreatingFloor }] =
    useCreateFloorMutation();
  const [updateFloor, { isLoading: isUpdatingFloor }] =
    useUpdateFloorMutation();
  const [deleteFloor, { isLoading: isDeletingFloor }] =
    useDeleteFloorMutation();
  const [updateStatusFloor, { isLoading: isUpdatingStatusFloor }] =
    useUpdateStatusFloorMutation();

  // Auto-select first building
  useEffect(() => {
    if (initialBuildingData?.data?.[0]?._id && !selectedBuildingId) {
      setSelectedBuildingId(initialBuildingData.data[0]._id);
    }
  }, [initialBuildingData, selectedBuildingId]);

  // Reset page when building changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBuildingId]);

  const handleOpenCreateModal = () => {
    setSelectedFloor(null);
    setIsModalOpen(true);
  };

  const handleOpenQuickModal = () => {
    setIsQuickModalOpen(true);
  };

  const handleOpenEditModal = (floor: IFloor) => {
    setSelectedFloor(floor);
    setIsModalOpen(true);
  };

  const handleSubmitFloor = async (data: CreateFloorRequest) => {
    try {
      if (selectedFloor) {
        await updateFloor({
          id: selectedFloor._id,
          level: data.level,
          description: data.description || "",
        }).unwrap();
        toast.success("Cập nhật tầng thành công!");
      } else {
        await createFloor(data).unwrap();
        toast.success("Thêm tầng mới thành công!");
      }
      setIsModalOpen(false);
      setSelectedFloor(null);
    } catch (error: any) {
      console.log(error.message.message || "Đã xảy ra lỗi!");
    }
  };

  const handleConfirmDelete = async () => {
    if (!floorToDelete) return;

    try {
      await deleteFloor(floorToDelete._id).unwrap();
      toast.success("Xóa tầng thành công!");
      setIsDeleteDialogOpen(false);
      setFloorToDelete(null);
    } catch (error) {
      toast.error("Xóa tầng thất bại!");
      console.error(error);
    }
  };

  const handleToggleStatus = async (floor: IFloor) => {
    try {
      const newStatus = floor.status === "active" ? "inactive" : "active";
      await updateStatusFloor({
        id: floor._id,
        status: newStatus,
      }).unwrap();
      toast.success(
        `Tầng đã được ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"}!`
      );
    } catch (error: any) {
      toast.error(error.message.message || "Cập nhật trạng thái thất bại!");
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const totalPages = floorsData?.pagination?.totalPages ?? 0;

  return (
    <div className="container mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Tầng
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các tầng trong tòa nhà
          </p>
        </div>

        <Permission permission="floor:create">
          <div className="flex gap-2">
            <Button
              className="gap-2"
              variant="outline"
              onClick={handleOpenCreateModal}
              disabled={!selectedBuildingId}
            >
              <Plus className="h-4 w-4 text-green-600" />
              Thêm Tầng Mới
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleOpenQuickModal}
              disabled={!selectedBuildingId}
            >
              <Zap className="h-4 w-4 text-yellow-600" />
              Thiết lập nhanh
            </Button>
          </div>
        </Permission>
      </div>

      {/* Guide Section */}
      <FloorActionsGuide />

      {/* Building Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Chọn Tòa Nhà
          </CardTitle>
          <CardDescription>
            Tìm kiếm và chọn tòa nhà để xem danh sách tầng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tòa nhà</label>
              <BuildingSelectCombobox
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floors Table Card */}
      {selectedBuildingId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh Sách Tầng</CardTitle>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {floorsData?.data.length || 0} tầng
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isFloorsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : floorsData && floorsData.data.length > 0 ? (
              <>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tầng</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {floorsData.data.map((floor) => (
                        <TableRow key={floor._id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              Tầng {floor.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {floor.description || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                floor.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                floor.status === "active"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }
                            >
                              {floor.status === "active"
                                ? "Hoạt động"
                                : "Ngừng hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(floor.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Permission permission="floor:edit">
                                <div className="flex items-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center">
                                          <Switch
                                            checked={floor.status === "active"}
                                            onCheckedChange={() =>
                                              handleToggleStatus(floor)
                                            }
                                            disabled={isUpdatingStatusFloor}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {floor.status === "active"
                                            ? "Click để ngừng hoạt động tòa nhà"
                                            : "Click để kích hoạt tòa nhà"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleOpenEditModal(floor)}
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="h-4 w-4 text-amber-600" />
                                </Button>
                              </Permission>

                              {/* <Permission permission="floor:delete">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleOpenDeleteDialog(floor)}
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </Permission> */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-muted-foreground">
                        Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                        {Math.min(
                          currentPage * pageSize,
                          floorsData?.pagination.total || 0
                        )}{" "}
                        trong tổng số {floorsData?.pagination.total || 0} tầng
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          Hiển thị:
                        </span>
                        <Select
                          value={pageSize.toString()}
                          onValueChange={(value) =>
                            handlePageSizeChange(Number(value))
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNumber =
                              Math.max(
                                1,
                                Math.min(totalPages - 4, currentPage - 2)
                              ) + i;
                            if (pageNumber > totalPages) return null;

                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  currentPage === pageNumber
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNumber)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNumber}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Layers className="h-12 w-12 mx-auto text-slate-400" />
                <p className="text-muted-foreground">
                  Chưa có tầng nào trong tòa nhà này
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="h-4 w-4 text-green-600" />
                  Thêm Tầng Đầu Tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Building Selected State */}
      {!selectedBuildingId && (
        <Card>
          <CardContent className="text-center py-12 space-y-3">
            <Building2 className="h-12 w-12 mx-auto text-blue-200" />
            <p className="text-muted-foreground">
              Vui lòng chọn một tòa nhà để xem danh sách tầng
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal Floor (Create/Edit) */}
      <ModalFloor
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        buildingId={selectedBuildingId}
        floor={selectedFloor}
        onSubmit={handleSubmitFloor}
        isLoading={isCreatingFloor || isUpdatingFloor}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteFloorPopover
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        floor={floorToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingFloor}
      />

      {/* Quick Create Floor Modal */}
      <ModalQuickFloor
        open={isQuickModalOpen}
        onOpenChange={setIsQuickModalOpen}
        buildingId={selectedBuildingId}
      />
    </div>
  );
};

export default FloorManageLandlord;
