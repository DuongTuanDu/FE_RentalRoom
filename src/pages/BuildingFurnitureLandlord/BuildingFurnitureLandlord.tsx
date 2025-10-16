import { useState } from "react";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  useGetBuildingFurnituresQuery,
  useCreateBuildingFurnitureMutation,
  useUpdateBuildingFurnitureMutation,
  useDeleteBuildingFurnitureMutation,
} from "@/services/building-furniture/building-furniture.service";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import { toast } from "sonner";
import type {
  IFurnitureBuilding,
  IFurnitureBuildingRequest,
  IFurnitureBuildingRequestUpdate,
} from "@/types/building-furniture";
import { ModalBuildingFurniture } from "./components/ModalBuildingFurniture";
import { DeleteBuildingFurniturePopover } from "./components/DeleteBuildingFurniturePopover";

const BuildingFurnitureLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IFurnitureBuilding | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<IFurnitureBuilding | null>(
    null
  );

  const formatDate = useFormatDate();

  // Queries & Mutations
  const { data: buildingsData } = useGetBuildingsQuery({ page: 1, limit: 100 });
  const { data, isLoading } = useGetBuildingFurnituresQuery({
    buildingId: selectedBuildingId === "all" ? "" : selectedBuildingId,
  });
  const [createBuildingFurniture, { isLoading: isCreating }] =
    useCreateBuildingFurnitureMutation();
  const [updateBuildingFurniture, { isLoading: isUpdating }] =
    useUpdateBuildingFurnitureMutation();
  const [deleteBuildingFurniture, { isLoading: isDeleting }] =
    useDeleteBuildingFurnitureMutation();

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: IFurnitureBuilding) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (item: IFurnitureBuilding) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (
    formData:
      | IFurnitureBuildingRequest
      | { id: string; data: IFurnitureBuildingRequestUpdate }
  ) => {
    try {
      if (editingItem) {
        // Update
        const updateData = formData as {
          id: string;
          data: IFurnitureBuildingRequestUpdate;
        };
        await updateBuildingFurniture(updateData).unwrap();
        toast.success("Cập nhật nội thất tòa nhà thành công!");
      } else {
        // Create
        await createBuildingFurniture(
          formData as IFurnitureBuildingRequest
        ).unwrap();
        toast.success("Thêm nội thất cho tòa nhà thành công!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast.error(
        editingItem ? "Cập nhật nội thất thất bại!" : "Thêm nội thất thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteBuildingFurniture(deletingItem._id).unwrap();
      toast.success("Xóa nội thất thành công!");
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error: any) {
      toast.error("Xóa nội thất thất bại!");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Quản lý Nội Thất Theo Tòa
          </h1>
          <p className="text-muted-foreground">
            Quản lý nội thất được cấu hình cho từng tòa nhà
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4" />
          Thêm Nội Thất Cho Tòa
        </Button>
      </div>

      {/* Filter by Building */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="building-select">Chọn tòa nhà</Label>
            <Select
              value={selectedBuildingId}
              onValueChange={setSelectedBuildingId}
            >
              <SelectTrigger id="building-select">
                <SelectValue placeholder="-- Chọn tòa nhà --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                {buildingsData?.data?.map((building) => (
                  <SelectItem key={building._id} value={building._id}>
                    {building.name} - {building.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Building Furnitures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách nội thất</CardTitle>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {data?.length || 0} nội thất
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Chưa có nội thất nào cho tòa nhà này
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleOpenCreateModal}
              >
                <Plus className="h-4 w-4" />
                Thêm nội thất đầu tiên
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tòa nhà</TableHead>
                    <TableHead>Tên nội thất</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Số lượng/phòng</TableHead>
                    <TableHead>Tổng số lượng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: IFurnitureBuilding) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col font-semibold">
                          {typeof item.buildingId === "object"
                            ? item.buildingId.name
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {typeof item.furnitureId === "object"
                          ? item.furnitureId.name
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {typeof item.furnitureId === "object"
                            ? item.furnitureId.category
                            : "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {item.quantityPerRoom}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {item.totalQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {item.status === "active"
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.notes || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit className="h-4 w-4 text-amber-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenDeleteDialog(item)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Building Furniture (Create/Edit) */}
      <ModalBuildingFurniture
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingItem(null);
          }
        }}
        buildingFurniture={editingItem}
        selectedBuildingId={
          selectedBuildingId === "all" ? "" : selectedBuildingId
        }
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Building Furniture Popover */}
      <DeleteBuildingFurniturePopover
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingItem(null);
          }
        }}
        buildingFurniture={deletingItem}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BuildingFurnitureLandlord;
