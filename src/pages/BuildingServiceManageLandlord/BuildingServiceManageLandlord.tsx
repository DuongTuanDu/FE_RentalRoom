import { useState, useEffect } from "react";
import { Plus, Filter, Edit, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useGetBuildingservicesQuery,
  useCreateBuildingservicesMutation,
  useUpdateBuildingservicesMutation,
  useDeleteBuildingservicesMutation,
  useCreateRestoreBuildingservicesMutation,
} from "@/services/building-services/building-services.service";
import type {
  IBuildingService,
  IBuildingServiceRequest,
  IUpdateBuildingServiceRequest,
} from "@/types/building-services";
import { toast } from "sonner";
import { ModalBuildingService } from "./components/ModalBuildingService";
import { DeleteBuildingServicePopup } from "./components/DeleteBuildingServicePopup";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import Permission from "@/layouts/Permission";
import { BuildingServiceActionsGuide } from "./components/BuildingServiceActionsGuide";

const BuildingServiceManageLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<IBuildingService | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const { data: initialBuildingData } = useGetBuildingsQuery({
    q: "",
    page: 1,
    limit: 1,
    status: "active",
  });

  useEffect(() => {
    if (initialBuildingData?.data?.[0]?._id && !selectedBuildingId) {
      setSelectedBuildingId(initialBuildingData.data[0]._id);
    }
  }, [initialBuildingData, selectedBuildingId]);

  const { data: services, isLoading } = useGetBuildingservicesQuery(
    { buildingId: selectedBuildingId, includeDeleted },
    { skip: !selectedBuildingId }
  );

  const [createService, { isLoading: isCreating }] =
    useCreateBuildingservicesMutation();
  const [updateService, { isLoading: isUpdating }] =
    useUpdateBuildingservicesMutation();
  const [deleteService, { isLoading: isDeleting }] =
    useDeleteBuildingservicesMutation();
  const [restoreService, { isLoading: isRestoring }] =
    useCreateRestoreBuildingservicesMutation();

  const formatPrice = useFormatPrice();

  const [formData, setFormData] = useState<IBuildingServiceRequest>({
    name: "internet",
    label: "",
    description: "",
    chargeType: "perRoom",
    fee: 0,
    currency: "VND",
  });

  const handleCreateService = async () => {
    if (!formData.label?.trim()) {
      toast.error("Vui lòng nhập tên dịch vụ");
      return;
    }
    if (formData.fee < 0) {
      toast.error("Phí dịch vụ không được âm");
      return;
    }

    try {
      await createService({
        buildingId: selectedBuildingId,
        data: formData,
      }).unwrap();
      toast.success("Tạo dịch vụ thành công");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Có lỗi xảy ra khi tạo dịch vụ");
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    // Validation
    if (!formData.label?.trim()) {
      toast.error("Vui lòng nhập tên dịch vụ");
      return;
    }
    if (formData.fee < 0) {
      toast.error("Phí dịch vụ không được âm");
      return;
    }

    try {
      const updateData: IUpdateBuildingServiceRequest = {
        label: formData.label,
        description: formData.description,
        chargeType: formData.chargeType,
        fee: formData.fee,
        currency: formData.currency,
      };
      await updateService({
        id: selectedService._id,
        buildingId: selectedBuildingId,
        data: updateData,
      }).unwrap();
      toast.success("Cập nhật dịch vụ thành công");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Có lỗi xảy ra khi cập nhật dịch vụ");
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    try {
      await deleteService({
        id: selectedService._id,
        buildingId: selectedBuildingId,
      }).unwrap();
      toast.success("Xóa dịch vụ thành công");
      setIsDeletePopupOpen(false);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Có lỗi xảy ra khi xóa dịch vụ");
    }
  };

  const handleRestoreService = async () => {
    if (!selectedService) return;
    try {
      await restoreService({
        id: selectedService._id,
        buildingId: selectedBuildingId,
      }).unwrap();
      toast.success("Khôi phục dịch vụ thành công");
      setIsDeletePopupOpen(false);
    } catch (error) {
      console.error("Error restoring service:", error);
      toast.error("Có lỗi xảy ra khi khôi phục dịch vụ");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "internet",
      label: "",
      description: "",
      chargeType: "perRoom",
      fee: 0,
      currency: "VND",
    });
    setSelectedService(null);
  };

  const openCreateModal = () => {
    setIsEdit(false);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (service: IBuildingService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      label: service.label || "",
      description: service.description || "",
      chargeType: service.chargeType,
      fee: service.fee,
      currency: service.currency,
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const openDeletePopup = (service: IBuildingService) => {
    setSelectedService(service);
    setIsDeletePopupOpen(true);
  };

  const getServiceNameLabel = (name: string) => {
    const labels: Record<string, string> = {
      internet: "Internet",
      water: "Nước",
      parking: "Bãi đỗ xe",
      cleaning: "Dịch vụ vệ sinh",
      security: "Bảo vệ",
      other: "Khác",
    };
    return labels[name] || name;
  };

  const getChargeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      perRoom: "Theo phòng",
      perPerson: "Theo người",
      included: "Bao gồm",
      fixed: "Cố định",
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý dịch vụ tòa nhà
          </h1>
          <p className="text-muted-foreground">
            Quản lý các dịch vụ của tòa nhà
          </p>
        </div>
        <Permission permission="service:create">
          <Button
            disabled={!selectedBuildingId || isCreating}
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Đang tạo..." : "Thêm dịch vụ"}
          </Button>
        </Permission>
      </div>

      <BuildingServiceActionsGuide />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <BuildingSelectCombobox
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              />
            </div>
            <div className="flex items-center space-x-2 mt-5">
              <Switch
                id="includeDeleted"
                checked={includeDeleted}
                onCheckedChange={setIncludeDeleted}
              />
              <Label htmlFor="includeDeleted">Bao gồm dịch vụ đã xóa</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedBuildingId ? (
            <div className="text-center py-8 text-muted-foreground">
              Vui lòng chọn tòa nhà để xem dịch vụ
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Đang tải...</p>
            </div>
          ) : (services || []).filter(
              (service) => includeDeleted || !service.isDeleted
            ).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {includeDeleted
                ? "Chưa có dịch vụ nào"
                : "Chưa có dịch vụ hoạt động nào"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại dịch vụ</TableHead>
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Loại phí</TableHead>
                  <TableHead>Phí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(services || [])
                  .filter((service) => includeDeleted || !service.isDeleted)
                  .map((service) => (
                    <TableRow
                      key={service._id}
                      className={service.isDeleted ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Badge
                          variant={
                            service.isDeleted ? "destructive" : "default"
                          }
                        >
                          {getServiceNameLabel(service.name)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {service.label || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {service.description || "-"}
                      </TableCell>
                      <TableCell>
                        {getChargeTypeLabel(service.chargeType)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {formatPrice(service.fee)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {service.isDeleted ? (
                          <Badge variant="destructive">Đã xóa</Badge>
                        ) : (
                          <Badge variant="default">Hoạt động</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {service.isDeleted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isRestoring}
                              onClick={() => openDeletePopup(service)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {isRestoring ? "Đang khôi phục..." : "Khôi phục"}
                            </Button>
                          ) : (
                            <>
                              <Permission permission="service:edit">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => openEditModal(service)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Permission>
                              <Permission permission="service:delete">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isDeleting}
                                  onClick={() => openDeletePopup(service)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Permission>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <ModalBuildingService
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={isEdit ? handleUpdateService : handleCreateService}
        formData={formData}
        setFormData={setFormData}
        isEdit={isEdit}
        selectedService={selectedService}
        isLoading={isEdit ? isUpdating : isCreating}
      />

      {/* Delete Popup */}
      <DeleteBuildingServicePopup
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={
          selectedService?.isDeleted
            ? handleRestoreService
            : handleDeleteService
        }
        service={selectedService}
        isRestore={selectedService?.isDeleted}
        isLoading={selectedService?.isDeleted ? isRestoring : isDeleting}
      />
    </div>
  );
};

export default BuildingServiceManageLandlord;
