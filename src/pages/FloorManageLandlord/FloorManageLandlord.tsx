import { useState, useEffect } from "react";
import { Building2, Plus, Edit, Trash2, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useCreateFloorMutation,
  useDeleteFloorMutation,
  useGetFloorsQuery,
  useUpdateFloorMutation,
} from "@/services/floor/floor.service";
import { useFormatDate } from "@/hooks/useFormatDate";
import { toast } from "sonner";
import type { CreateFloorRequest, IFloor } from "@/types/floor";
import { ModalFloor } from "./components/ModalFloor";
import { DeleteFloorPopover } from "./components/DeleteFloorPopover";

const FloorManageLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<IFloor | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<IFloor | null>(null);
  const formatDate = useFormatDate();

  const { data: buildingData, isLoading: isBuildingLoading } =
    useGetBuildingsQuery({
      q: "",
      page: 1,
      limit: 10,
    });

  const { data: floorsData, isLoading: isFloorsLoading } = useGetFloorsQuery(
    {
      buildingId: selectedBuildingId,
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

  useEffect(() => {
    if (buildingData?.data?.[0]?._id && !selectedBuildingId) {
      setSelectedBuildingId(buildingData.data[0]._id);
    }
  }, [buildingData, selectedBuildingId]);

  const selectedBuilding = buildingData?.data?.find(
    (b) => b._id === selectedBuildingId
  );

  const handleOpenCreateModal = () => {
    setSelectedFloor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (floor: IFloor) => {
    setSelectedFloor(floor);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (floor: IFloor) => {
    setFloorToDelete(floor);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitFloor = async (data: CreateFloorRequest) => {
    try {
      if (selectedFloor) {
        await updateFloor({
          id: selectedFloor.id,
          label: data.label,
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
    } catch (error) {
      toast.error(
        selectedFloor ? "Cập nhật tầng thất bại!" : "Thêm tầng mới thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!floorToDelete) return;

    try {
      await deleteFloor(floorToDelete.id).unwrap();
      toast.success("Xóa tầng thành công!");
      setIsDeleteDialogOpen(false);
      setFloorToDelete(null);
    } catch (error) {
      toast.error("Xóa tầng thất bại!");
      console.error(error);
    }
  };

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
        <Button
          className="gap-2"
          onClick={handleOpenCreateModal}
          disabled={!selectedBuildingId}
        >
          <Plus className="h-4 w-4" />
          Thêm Tầng Mới
        </Button>
      </div>

      {/* Building Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Chọn Tòa Nhà
          </CardTitle>
          <CardDescription>
            Chọn tòa nhà để xem và quản lý danh sách tầng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tòa nhà</label>
              <Select
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
                disabled={isBuildingLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tòa nhà..." />
                </SelectTrigger>
                <SelectContent>
                  {buildingData?.data?.map((building) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBuilding && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Thông tin tòa nhà</label>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm font-medium">{selectedBuilding.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBuilding.address}
                  </p>
                  {selectedBuilding.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedBuilding.description}
                    </p>
                  )}
                </div>
              </div>
            )}
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
                {floorsData?.length || 0} tầng
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isFloorsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : floorsData && floorsData.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Cấp độ</TableHead>
                      <TableHead>Tên tầng</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {floorsData.map((floor) => (
                      <TableRow key={floor.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {floor.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {floor.label}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {floor.description || "—"}
                        </TableCell>
                        <TableCell>{formatDate(floor.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenEditModal(floor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleOpenDeleteDialog(floor)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Chưa có tầng nào trong tòa nhà này
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="h-4 w-4" />
                  Thêm Tầng Đầu Tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Building Selected State */}
      {!selectedBuildingId && !isBuildingLoading && (
        <Card>
          <CardContent className="text-center py-12 space-y-3">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
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
    </div>
  );
};

export default FloorManageLandlord;
