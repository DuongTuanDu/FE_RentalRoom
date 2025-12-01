import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  WashingMachine,
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  useGetLaundryFloorsQuery,
  useCreateLaundryFloorMutation,
  useUpdateLaundryFloorMutation,
  useDeleteLaundryFloorMutation,
} from "@/services/laundry/laundry.service";
import { socketService } from "@/services/socket/socket.service";
import { useGetFloorsQuery } from "@/services/floor/floor.service";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import type { IWasherItem, ILaundryDeviceRequest } from "@/types/laundry";
import { WasherModal } from "./components/WasherModal";
import { DeleteLaundryPopover } from "./components/DeleteLaundryPopover";

const LaundryManagement = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "running" | "idle" | "unknown"
  >("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<IWasherItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<IWasherItem | null>(null);

  const { data: initialBuildingData } = useGetBuildingsQuery({
    q: "",
    page: 1,
    limit: 10,
    status: "active",
  });

  useEffect(() => {
    if (initialBuildingData?.data?.[0]?._id && !selectedBuildingId) {
      setSelectedBuildingId(initialBuildingData.data[0]._id);
    }
  }, [initialBuildingData, selectedBuildingId]);

  const { data: floorsData } = useGetFloorsQuery(
    {
      buildingId: selectedBuildingId,
      page: 1,
      limit: 100,
      status: "active",
    },
    {
      skip: !selectedBuildingId,
    }
  );

  const {
    data: laundryDevicesData,
    isLoading: isLoadingLaundryDevices,
    refetch: refetchLaundryDevices,
  } = useGetLaundryFloorsQuery(
    {
      buildingId: selectedBuildingId,
      floorId: selectedFloorId || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      skip: !selectedBuildingId,
    }
  );

  const [createLaundryFloor, { isLoading: isCreating }] =
    useCreateLaundryFloorMutation();
  const [updateLaundryFloor, { isLoading: isUpdating }] =
    useUpdateLaundryFloorMutation();
  const [deleteLaundryFloor, { isLoading: isDeleting }] =
    useDeleteLaundryFloorMutation();

  useEffect(() => {
    setSelectedFloorId("");
  }, [selectedBuildingId]);

  const [realtimeDevices, setRealtimeDevices] = useState<IWasherItem[] | null>(
    null
  );

  const laundryDevices = useMemo(() => {
    if (realtimeDevices) return realtimeDevices;
    return laundryDevicesData?.data || [];
  }, [realtimeDevices, laundryDevicesData]);

  // Kết nối realtime trạng thái thiết bị theo TÒA (building)
  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket || !selectedBuildingId) {
      console.log(
        "[Laundry][Socket] Không có socket hoặc chưa chọn building. socket=",
        !!socket,
        "buildingId=",
        selectedBuildingId
      );
      setRealtimeDevices(null);
      return;
    }

    const payload = {
      buildingId: selectedBuildingId,
      floorId: selectedFloorId || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    };

    const handleStatus = (data: any) => {
      console.log("[Laundry][Socket] Nhận laundry_building_status:", data);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setRealtimeDevices(list as IWasherItem[]);
    };

    const handleError = (err: any) => {
      console.error("[Laundry][Socket] Nhận laundry_error:", err);
      const message =
        err?.message || "Không thể cập nhật realtime trạng thái thiết bị giặt sấy";
      toast.error(message);
    };

    console.log(
      "[Laundry][Socket] Tham gia building realtime với payload:",
      payload
    );

    socket.on("laundry_building_status", handleStatus);
    socket.on("laundry_error", handleError);

    socket.emit("join_laundry_building", payload);

    return () => {
      console.log(
        "[Laundry][Socket] Rời room building realtime:",
        selectedBuildingId
      );
      socket.emit("leave_laundry_building", { buildingId: selectedBuildingId });
      socket.off("laundry_building_status", handleStatus);
      socket.off("laundry_error", handleError);
    };
  }, [selectedBuildingId, selectedFloorId, statusFilter]);

  const handleOpenCreateModal = () => {
    if (!selectedFloorId) {
      toast.warning("Vui lòng chọn tầng trước khi thêm thiết bị");
      return;
    }
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (device: IWasherItem) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (device: IWasherItem) => {
    setDeletingDevice(device);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDevice) return;

    try {
      await deleteLaundryFloor({
        id: deletingDevice.floorId,
        deviceId: deletingDevice.deviceId,
      }).unwrap();
      toast.success("Xóa thiết bị thành công");
      setIsDeleteDialogOpen(false);
      setDeletingDevice(null);
      refetchLaundryDevices();
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi xóa thiết bị");
    }
  };

  const handleSubmitWasher = async (payload: {
    floorId: string;
    deviceId?: string;
    data: ILaundryDeviceRequest;
  }) => {
    try {
      if (payload.deviceId) {
        await updateLaundryFloor({
          id: payload.floorId,
          deviceId: payload.deviceId,
          data: payload.data,
        }).unwrap();
        toast.success("Cập nhật thiết bị thành công");
      } else {
        await createLaundryFloor({
          id: payload.floorId,
          data: payload.data,
        }).unwrap();
        toast.success("Thêm thiết bị thành công");
      }
      await refetchLaundryDevices();
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi lưu thiết bị");
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Thiết bị giặt sấy
          </h1>
          <p className="text-muted-foreground">
            Thiết lập và quản lý các thiết bị giặt sấy thông minh theo từng tòa nhà, tầng.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="gap-2"
            onClick={handleOpenCreateModal}
            disabled={!selectedBuildingId || !selectedFloorId}
          >
            <Plus className="h-4 w-4" />
            Thêm thiết bị
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>

          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Lọc theo tòa nhà, tầng và trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Tòa nhà</span>
              <BuildingSelectCombobox
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Tầng</span>
              <Select
                value={selectedFloorId || ""}
                onValueChange={(value) => setSelectedFloorId(value)}
                disabled={!selectedBuildingId || !floorsData?.data?.length}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tầng" />
                </SelectTrigger>
                <SelectContent>
                  {floorsData?.data?.map((floor) => (
                    <SelectItem key={floor._id} value={floor._id}>
                      Tầng {floor.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Trạng thái thiết bị</span>
              <Select
                value={statusFilter}
                onValueChange={(
                  value: "all" | "running" | "idle" | "unknown"
                ) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="running">Đang chạy</SelectItem>
                  <SelectItem value="idle">Rảnh</SelectItem>
                  <SelectItem value="unknown">Không xác định</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBuildingId ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Danh sách thiết bị giặt sấy</CardTitle>
                <CardDescription>
                  Các thiết bị được liên kết với hệ thống IoT (Tuya/Smart Life) theo tầng.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {laundryDevices.length} thiết bị
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLaundryDevices ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải danh sách thiết bị...
              </div>
            ) : laundryDevices.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <WashingMachine className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Chưa có thiết bị giặt sấy cho lựa chọn hiện tại.
                </p>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleOpenCreateModal}
                    disabled={!selectedFloorId}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm thiết bị đầu tiên
                  </Button>
                  {!selectedFloorId && (
                    <p className="text-xs text-muted-foreground max-w-md mx-auto !mt-2">
                      Để thêm thiết bị, vui lòng chọn <span className="font-semibold">Tòa nhà</span>{" "}
                      và <span className="font-semibold">Tầng</span> ở khung lọc phía trên, sau đó nút{" "}
                      <span className="font-semibold">“Thêm thiết bị đầu tiên”</span> sẽ được kích hoạt.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tuya Device ID</TableHead>
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Tầng</TableHead>
                      <TableHead>Công suất</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laundryDevices.map((device) => (
                      <TableRow key={device.deviceId}>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {device.tuyaDeviceId}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          {device.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize"
                          >
                            {device.type === "washer" ? "Máy giặt" : "Máy sấy"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            Tầng {device.floorLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {device.power ? `${device.power}W` : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              device.status === "idle"
                                ? "default"
                                : device.status === "running"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              device.status === "idle"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : device.status === "running"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {device.status === "running"
                              ? "Đang chạy"
                              : device.status === "idle"
                                ? "Rảnh"
                                : "Không xác định"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleOpenEditModal(device)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sửa</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleOpenDeleteDialog(device)
                                  }
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xóa</p>
                              </TooltipContent>
                            </Tooltip>
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
      ) : (
        <Card>
          <CardContent className="text-center py-12 space-y-3">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Vui lòng chọn tòa nhà và tầng để xem hoặc cấu hình thiết bị giặt sấy.
            </p>
          </CardContent>
        </Card>
      )}

      <WasherModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        floorId={selectedFloorId}
        editingWasher={editingDevice}
        onSubmit={handleSubmitWasher}
        isSubmitting={isCreating || isUpdating}
      />

      <DeleteLaundryPopover
        open={isDeleteDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingDevice(null);
          }
        }}
        washer={deletingDevice}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LaundryManagement;
