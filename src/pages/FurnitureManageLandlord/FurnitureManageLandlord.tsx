import { useState } from "react";
import { Plus, Edit, Trash2, Sofa } from "lucide-react";
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
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import {
  useGetFurnituresQuery,
  useCreateFurnitureMutation,
  useUpdateFurnitureMutation,
  useDeleteFurnitureMutation,
} from "@/services/furniture/furniture.service";
import { toast } from "sonner";
import type { IFurniture, IFurnitureRequest } from "@/types/furniture";
import { ModalFurniture } from "./components/ModalFurniture";
import { DeleteFurniturePopover } from "./components/DeleteFurniturePopover";
import Permission from "@/layouts/Permission";

const FurnitureManageLandlord = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState<IFurniture | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFurniture, setDeletingFurniture] = useState<IFurniture | null>(
    null
  );

  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  // Queries & Mutations
  const { data, isLoading } = useGetFurnituresQuery();
  const [createFurniture, { isLoading: isCreating }] =
    useCreateFurnitureMutation();
  const [updateFurniture, { isLoading: isUpdating }] =
    useUpdateFurnitureMutation();
  const [deleteFurniture, { isLoading: isDeleting }] =
    useDeleteFurnitureMutation();

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingFurniture(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (furniture: IFurniture) => {
    setEditingFurniture(furniture);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (furniture: IFurniture) => {
    setDeletingFurniture(furniture);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitFurniture = async (formData: IFurnitureRequest) => {
    try {
      if (editingFurniture) {
        await updateFurniture({
          id: editingFurniture._id,
          data: formData,
        }).unwrap();
        toast.success("Cập nhật nội thất thành công!");
      } else {
        await createFurniture(formData).unwrap();
        toast.success("Thêm nội thất mới thành công!");
      }
      setIsModalOpen(false);
      setEditingFurniture(null);
    } catch (error: any) {
      toast.error(
        editingFurniture
          ? "Cập nhật nội thất thất bại!"
          : "Thêm nội thất mới thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFurniture) return;

    try {
      await deleteFurniture(deletingFurniture._id).unwrap();
      toast.success("Xóa nội thất thành công!");
      setIsDeleteDialogOpen(false);
      setDeletingFurniture(null);
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
            Quản lý Nội Thất
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các loại nội thất cho phòng trọ
          </p>
        </div>
        <Permission  permission="furniture:create">
          <Button className="gap-2" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4" />
            Thêm Nội Thất Mới
          </Button>
        </Permission>
      </div>

      {/* Furnitures Table */}
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
              <Sofa className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Chưa có nội thất nào</p>
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
                    <TableHead>Tên nội thất</TableHead>

                    <TableHead>Giá</TableHead>

                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((furniture: IFurniture) => (
                    <TableRow key={furniture._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Sofa className="h-4 w-4 text-muted-foreground" />
                          {furniture.name}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono">
                        {furniture.price ? formatPrice(furniture.price) : "—"}
                      </TableCell>

                      <TableCell className="max-w-[200px] truncate">
                        {furniture.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            furniture.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {furniture.status === "active"
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(furniture.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Permission permission="furniture:edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenEditModal(furniture)}
                          >
                            <Edit className="h-4 w-4 text-amber-600" />
                          </Button>
                          </Permission>
                          <Permission permission="furniture:delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenDeleteDialog(furniture)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                          </Permission>
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

      {/* Modal Furniture (Create/Edit) */}
      <ModalFurniture
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingFurniture(null);
          }
        }}
        furniture={editingFurniture}
        onSubmit={handleSubmitFurniture}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Furniture Popover */}
      <DeleteFurniturePopover
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingFurniture(null);
          }
        }}
        furniture={deletingFurniture}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FurnitureManageLandlord;
