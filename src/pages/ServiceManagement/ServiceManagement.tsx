import { useState } from "react";
import { Package, Plus, Edit, Trash2, Clock, Users } from "lucide-react";
import {
  useGetPackageServicesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} from "@/services/package-services/package-services.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useFormatDate } from "@/hooks/useFormatDate";
import { ModalPackage } from "./components/ModalPackage";
import { DeletePackagePopover } from "./components/DeletePackagePopover";
import { toast } from "sonner";
import type { IPackage as PackageType } from "@/types/package-services";
import type { CreatePackageRequest } from "@/services/package-services/package-services.service";

const ServiceManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<PackageType | null>(null);

  const formatPrice = useFormatPrice();
  const formatDate = useFormatDate();

  // Queries & Mutations
  const { data, isLoading } = useGetPackageServicesQuery();
  const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (pkg: PackageType) => {
    setDeletingPackage(pkg);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitPackage = async (formData: CreatePackageRequest) => {
    try {
      if (editingPackage) {
        await updatePackage({
          id: editingPackage._id,
          data: formData,
        }).unwrap();
        toast.success("Cập nhật gói dịch vụ thành công!");
      } else {
        await createPackage(formData).unwrap();
        toast.success("Thêm gói dịch vụ mới thành công!");
      }
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (error: any) {
      toast.error(
        editingPackage
          ? "Cập nhật gói dịch vụ thất bại!"
          : "Thêm gói dịch vụ mới thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;

    try {
      await deletePackage(deletingPackage._id).unwrap();
      toast.success("Xóa gói dịch vụ thành công!");
      setIsDeleteDialogOpen(false);
      setDeletingPackage(null);
    } catch (error: any) {
      toast.error("Xóa gói dịch vụ thất bại!");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Quản lý Gói Dịch Vụ
          </h1>
          <p className="text-muted-foreground">
            Quản lý các gói dịch vụ cho chủ nhà
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4" />
          Thêm Gói Mới
        </Button>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20 space-y-3">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Chưa có gói dịch vụ nào
            </p>
            <Button variant="outline" className="gap-2" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4" />
              Thêm gói dịch vụ đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((pkg) => (
            <Card key={pkg._id} className="relative flex flex-col transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {formatPrice(pkg.price)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {pkg.durationDays} ngày
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <CardDescription className="text-base">
                  {pkg.description || "Không có mô tả"}
                </CardDescription>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Giới hạn phòng</p>
                      <p className="text-muted-foreground">
                        Tối đa {pkg.roomLimit} phòng
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Thời hạn sử dụng</p>
                      <p className="text-muted-foreground">
                        {pkg.durationDays} ngày
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Ngày tạo: {formatDate(pkg.createdAt)}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleOpenEditModal(pkg)}
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleOpenDeleteDialog(pkg)}
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Package (Create/Edit) */}
      <ModalPackage
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingPackage(null);
          }
        }}
        package={editingPackage}
        onSubmit={handleSubmitPackage}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Package Popover */}
      <DeletePackagePopover
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingPackage(null);
          }
        }}
        package={deletingPackage}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ServiceManagement;