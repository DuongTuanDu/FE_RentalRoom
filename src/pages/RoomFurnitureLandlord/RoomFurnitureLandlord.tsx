import { useState } from "react";
import { Plus, Edit, Sofa, DoorOpen, BedDouble } from "lucide-react";
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
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { RoomSelectCombobox } from "./components/RoomSelectCombobox";
import { ModalRoomFurniture } from "./components/ModalRoomFurniture";
import { DeleteRoomFurniturePopover } from "./components/DeleteRoomFurniturePopover";
import {
  useGetRoomFurnituresQuery,
  useCreateRoomFurnitureMutation,
  useUpdateRoomFurnitureMutation,
  useDeleteRoomFurnitureMutation,
} from "@/services/room-furniture/room-furniture.service";
import { toast } from "sonner";
import type {
  IFurnitureRoom,
  IFurnitureRoomRequest,
} from "@/types/room-furniture";

const CONDITION_LABELS = {
  good: "Tốt",
  damaged: "Hỏng",
  under_repair: "Đang sửa chữa",
};

const CONDITION_COLORS = {
  good: "bg-green-100 text-green-800",
  damaged: "bg-red-100 text-red-800",
  under_repair: "bg-yellow-100 text-yellow-800",
};

const RoomFurnitureLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomFurniture, setEditingRoomFurniture] =
    useState<IFurnitureRoom | null>(null);

  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  // Fetch room furnitures
  const { data: roomFurnituresData, isLoading } = useGetRoomFurnituresQuery({
    roomId: selectedRoomId || undefined,
  });

  // Mutations
  const [createRoomFurniture, { isLoading: isCreating }] =
    useCreateRoomFurnitureMutation();
  const [updateRoomFurniture, { isLoading: isUpdating }] =
    useUpdateRoomFurnitureMutation();
  const [deleteRoomFurniture, { isLoading: isDeleting }] =
    useDeleteRoomFurnitureMutation();

  // Use room furnitures data directly
  const filteredRoomFurnitures = roomFurnituresData || [];

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingRoomFurniture(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (roomFurniture: IFurnitureRoom) => {
    setEditingRoomFurniture(roomFurniture);
    setIsModalOpen(true);
  };

  const handleSubmitRoomFurniture = async (data: IFurnitureRoomRequest) => {
    try {
      if (editingRoomFurniture) {
        await updateRoomFurniture({
          id: editingRoomFurniture._id,
          data: {
            quantity: data.quantity,
            condition: data.condition,
            status: "active" as const,
            notes: data.notes,
          },
        }).unwrap();
        toast.success("Cập nhật nội thất phòng thành công!");
      } else {
        await createRoomFurniture(data).unwrap();
        toast.success("Thêm nội thất phòng mới thành công!");
      }
      setIsModalOpen(false);
      setEditingRoomFurniture(null);
    } catch (error: any) {
      toast.error(
        editingRoomFurniture
          ? "Cập nhật nội thất phòng thất bại!"
          : "Thêm nội thất phòng mới thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async (roomFurniture: IFurnitureRoom) => {
    try {
      await deleteRoomFurniture(roomFurniture._id).unwrap();
      toast.success("Xóa nội thất phòng thành công!");
    } catch (error: any) {
      toast.error("Xóa nội thất phòng thất bại!");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý nội thất phòng
          </h1>
          <p className="text-muted-foreground">
            Quản lý nội thất trong từng phòng
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm nội thất phòng
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          <CardDescription>
            Chọn tòa nhà và phòng để xem nội thất
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Building Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tòa nhà</label>
              <BuildingSelectCombobox
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              />
            </div>

            {/* Room Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phòng</label>
              <RoomSelectCombobox
                value={selectedRoomId}
                onValueChange={setSelectedRoomId}
                buildingId={selectedBuildingId}
                disabled={!selectedBuildingId}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sofa className="h-5 w-5" />
            Danh sách nội thất phòng
          </CardTitle>
          <CardDescription>
            {filteredRoomFurnitures.length} nội thất phòng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-muted-foreground">Đang tải...</span>
            </div>
          ) : filteredRoomFurnitures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {selectedRoomId
                ? "Không có nội thất nào trong phòng này"
                : "Vui lòng chọn tòa nhà và phòng để xem nội thất"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Nội thất</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tình trạng</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoomFurnitures.map((roomFurniture) => (
                    <TableRow key={roomFurniture._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              Phòng {roomFurniture.roomId.roomNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {roomFurniture.roomId.area}m² •{" "}
                              {roomFurniture.roomId.maxTenants} người
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">
                              {roomFurniture.furnitureId.name || "Nội thất"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {roomFurniture.furnitureId.category} •{" "}
                              {formatPrice(
                                roomFurniture.furnitureId.price || 0
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {roomFurniture.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={CONDITION_COLORS[roomFurniture.condition]}
                        >
                          {CONDITION_LABELS[roomFurniture.condition]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {roomFurniture.notes || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(roomFurniture.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(roomFurniture)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeleteRoomFurniturePopover
                            roomFurniture={roomFurniture}
                            onConfirm={() => handleConfirmDelete(roomFurniture)}
                            isOpen={false}
                            onOpenChange={() => {}}
                            isLoading={isDeleting}
                          />
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

      {/* Modals */}
      <ModalRoomFurniture
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoomFurniture(null);
        }}
        onSubmit={handleSubmitRoomFurniture}
        editingRoomFurniture={editingRoomFurniture}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default RoomFurnitureLandlord;
