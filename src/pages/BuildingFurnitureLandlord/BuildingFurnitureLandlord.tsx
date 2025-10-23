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
  useApplyBuildingFurnitureToRoomsMutation,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
const BuildingFurnitureLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IFurnitureBuilding | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<IFurnitureBuilding | null>(
    null
  );

  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const [applyToRooms, { isLoading: isApplying }] =
    useApplyBuildingFurnitureToRoomsMutation();

  const formatDate = useFormatDate();

  // Queries & Mutations
  const { data: buildingsData } = useGetBuildingsQuery({ page: 1, limit: 100 });
  const { data, isLoading } = useGetBuildingFurnituresQuery(
    { buildingId: selectedBuildingId },
    { skip: !selectedBuildingId }
  );
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
                {buildingsData?.data?.map((building) => (
                  <SelectItem key={building._id} value={building._id}>
                    {building.name} - {building.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* helper text */}
            {!selectedBuildingId ? (
              <p className="text-sm text-muted-foreground">
                Vui lòng chọn một tòa nhà để xem và áp dụng cấu hình nội thất.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Building Furnitures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Danh sách nội thất ({data?.length || 0} loại nội thất)
            </CardTitle>

            {/* Nút Áp dụng */}
            <AlertDialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={!selectedBuildingId}>
                  Áp dụng xuống tất cả phòng
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Áp dụng cấu hình xuống phòng
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Thao tác này sẽ <b>ghi đè</b> số lượng nội thất cho{" "}
                    <b>tất cả phòng</b> thuộc tòa được chọn, dựa trên giá trị{" "}
                    <i>Mặc định/phòng</i> của từng mục.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isApplying}>
                    Huỷ
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={!selectedBuildingId || isApplying}
                    onClick={async () => {
                      if (!selectedBuildingId) {
                        toast.error("Vui lòng chọn một tòa nhà cụ thể.");
                        return;
                      }
                      try {
                        const res = await applyToRooms({
                          buildingId: selectedBuildingId,
                          body: {
                            mode: "set", // 👈 luôn ghi đè
                            furnitureIds: [], // rỗng = tất cả
                            roomIds: [], // rỗng = tất cả
                            floorIds: [], // rỗng = tất cả
                            // dryRun: true,        // bật nếu muốn xem trước
                          },
                        }).unwrap();

                        if (res?.success) {
                          toast.success(
                            `Áp dụng thành công: modified=${
                              res.modified ?? 0
                            }, upserted=${res.upserted ?? 0}`
                          );
                        } else if (res?.message) {
                          toast.warning(res.message);
                        } else {
                          toast.success("Đã áp dụng xong.");
                        }
                        setIsApplyOpen(false);
                      } catch (err: any) {
                        toast.error(err?.data?.message || "Áp dụng thất bại.");
                      }
                    }}
                  >
                    {isApplying ? "Đang áp dụng..." : "Xác nhận áp dụng"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedBuildingId ? (
            <div className="text-center py-12 space-y-3">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Hãy chọn một tòa nhà ở phía trên để xem danh sách nội thất.
              </p>
            </div>
          ) : isLoading ? (
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
                    <TableHead>Mặc định/phòng</TableHead>
                    <TableHead>Tổng số lượng (thực tế)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.map((item: IFurnitureBuilding) => (
                    <TableRow key={item._id}>
                      {/* Tòa nhà */}
                      <TableCell className="font-medium">
                        <div className="flex flex-col font-semibold">
                          {/* Ưu tiên field mới: item.building?.name; fallback populate cũ */}
                          {item?.buildingId?.name ??
                            (typeof item.buildingId === "object"
                              ? (item.buildingId as any).name
                              : "—")}
                        </div>
                      </TableCell>

                      {/* Tên nội thất */}
                      <TableCell className="font-medium">
                        {item?.furnitureId?.name ??
                          (typeof item.furnitureId === "object"
                            ? (item.furnitureId as any).name
                            : "—")}
                      </TableCell>

                      {/* Mặc định/phòng */}
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {item.quantityPerRoom ?? 0}
                        </Badge>
                      </TableCell>

                      {/* Tổng số lượng (thực tế) */}
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {/* field mới: totalQuantityActual; fallback: totalQuantity */}
                          {(item as any).totalQuantityActual ??
                            (item as any).totalQuantity ??
                            0}
                        </Badge>
                      </TableCell>

                      {/* Trạng thái */}
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

                      {/* Ghi chú */}
                      <TableCell className="max-w-[200px] truncate">
                        {item.notes || "—"}
                      </TableCell>

                      {/* Ngày tạo */}
                      <TableCell className="text-sm">
                        {formatDate(item.createdAt)}
                      </TableCell>

                      {/* Thao tác */}
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
