import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Edit,
  Eye,
  Search,
  DoorOpen,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import _ from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useActiveRoomMutation,
  useAddRoomImagesMutation,
} from "@/services/room/room.service";
import { useGetFloorsQuery } from "@/services/floor/floor.service";
import { STATUS_COLORS, STATUS_LABELS, STATUS_OPTIONS } from "./const/data";
import { Spinner } from "@/components/ui/spinner";
import { ModalRoom } from "./components/ModalRoom";
import { ModalQuickRoom } from "./components/ModalQuickRoom";
import { RoomDetail } from "./components/RoomDetail";
import { toast } from "sonner";
import type { IRoom } from "@/types/room";
import Permission from "@/layouts/Permission";

const RoomManageLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);

  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [viewingRoomId, setViewingRoomId] = useState<string | null>(null);

  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 700),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

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

  const { data: floorsData } = useGetFloorsQuery(
    { buildingId: selectedBuildingId, page: 1, limit: 10, status: "active" },
    { skip: !selectedBuildingId }
  );

  const { data: roomsData, isLoading: isRoomsLoading } = useGetRoomsQuery({
    buildingId: selectedBuildingId,
    floorId:
      selectedFloorId && selectedFloorId !== "all"
        ? selectedFloorId
        : undefined,
    status: selectedStatus === "all" ? undefined : (selectedStatus as any),
    q: debouncedSearch,
    page: currentPage,
    limit: pageLimit,
  });

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [activeRoom, { isLoading: isActivating }] = useActiveRoomMutation();
  const [addRoomImages, { isLoading: isUploadingImages }] =
    useAddRoomImagesMutation();

  const totalPages = roomsData?.total
    ? Math.ceil(roomsData.total / pageLimit)
    : 0;

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenQuickModal = () => {
    setIsQuickModalOpen(true);
  };

  const handleOpenEditModal = (room: IRoom) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (room: IRoom) => {
    try {
      const currentActive = (room as any).active ?? true;
      const newActive = !currentActive;
      await activeRoom({ id: room._id, active: newActive }).unwrap();
      toast.success(
        `Phòng đã được ${newActive ? "kích hoạt" : "ngừng hoạt động"}!`
      );
    } catch (error: any) {
      toast.error("Cập nhật trạng thái hoạt động thất bại!");
    }
  };

  const handleOpenRoomDetail = (room: IRoom) => {
    setViewingRoomId(room._id);
    setIsRoomDetailOpen(true);
  };

  const handleSubmitRoom = async (data: any) => {
    // Validate: Số phòng phải chứa ít nhất 1 chữ số
    if (!/\d/.test(data.roomNumber)) {
      toast.error("Số phòng phải chứa ít nhất một chữ số (Ví dụ: P101, 101A)!");
      return;
    }

    try {
      if (editingRoom) {
        const updateData = {
          roomNumber: data.roomNumber,
          area: Number(data.area),
          price: Number(data.price),
          maxTenants: Number(data.maxTenants || 1),
          status: data.status,
          description: data.description,
          images: data.images,
          removeUrls: data.removeUrls,
          replaceAllImages: data.replaceAllImages,
        };

        await updateRoom({
          id: editingRoom._id,
          data: updateData,
        }).unwrap();

        toast.success("Cập nhật phòng thành công!");
      } else {
        const roomData = {
          buildingId: data.buildingId,
          floorId: data.floorId,
          roomNumber: data.roomNumber,
          area: Number(data.area),
          price: Number(data.price),
          maxTenants: Number(data.maxTenants || 1),
          status: data.status,
          description: data.description,
          images: data.images,
        };

        await createRoom(roomData).unwrap();
        toast.success("Thêm phòng mới thành công!");
      }

      setIsModalOpen(false);
      setEditingRoom(null);
    } catch (error: any) {
      const status = error?.status;
      const detailMessage = error?.data?.message;

      switch (status) {
        case 403:
          toast.error(
            "Bạn không có quyền thực hiện hoặc Tòa nhà đang bị khóa!"
          );
          break;
        case 404:
          toast.error("Không tìm thấy Tòa nhà hoặc Tầng!");
          break;
        case 409:
          toast.error("Số phòng này đã tồn tại trong tòa rồi!");
          break;
        case 400:
          toast.error(`Dữ liệu không hợp lệ: ${detailMessage}`);
          break;
        case 500:
          toast.error("Lỗi hệ thống (Server Error). Vui lòng thử lại sau!");
          break;
        default: {
          const actionName = editingRoom ? "Cập nhật" : "Thêm mới";
          toast.error(detailMessage || `${actionName} phòng thất bại!`);
          break;
        }
      }
    }
  };

  useEffect(() => {
    setSelectedFloorId("");
    setCurrentPage(1);
  }, [selectedBuildingId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFloorId, selectedStatus, debouncedSearch]);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Phòng
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các phòng trong tòa nhà
          </p>
        </div>
        <Permission permission="room:create">
          <div className="flex gap-2">
            <Button
              className="gap-2"
              disabled={!selectedBuildingId}
              onClick={handleOpenCreateModal}
            >
              <Plus className="h-4 w-4" />
              Thêm Phòng Mới
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedBuildingId}
              onClick={handleOpenQuickModal}
            >
              <Zap className="h-4 w-4" />
              Thiết lập nhanh
            </Button>
          </div>
        </Permission>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc phòng theo tòa nhà, tầng, trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 w-full md:w-[220px]">
              <label className="text-sm font-medium">Tòa nhà</label>
              <BuildingSelectCombobox
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              />
            </div>

            <div className="space-y-2 w-full md:w-[124px]">
              <label className="text-sm font-medium">Tầng</label>
              <Select
                value={selectedFloorId}
                onValueChange={setSelectedFloorId}
                disabled={!selectedBuildingId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedBuildingId ? "Chọn tầng..." : "Chọn tòa nhà trước"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="all">Tất cả tầng</SelectItem>
                  {floorsData?.data?.map((floor: any) => (
                    <SelectItem key={floor._id} value={floor._id}>
                      Tầng {floor.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full md:w-[150px]">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 min-w-[250px]">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Số phòng..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách phòng</CardTitle>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {roomsData?.total || 0} phòng
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isRoomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : !roomsData?.data || roomsData.data.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {searchInput || selectedStatus !== "all" || selectedFloorId
                  ? "Không tìm thấy phòng nào"
                  : "Chưa có phòng nào"}
              </p>
            </div>
          ) : (
            <div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Số phòng</TableHead>
                      <TableHead>Hình ảnh</TableHead>
                      <TableHead>Diện tích</TableHead>
                      <TableHead>Giá thuê</TableHead>
                      <TableHead>Sức chứa</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomsData.data.map((room) => (
                      <TableRow key={room._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                            {room.roomNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {room.images && room.images.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <div className="w-8 h-8 rounded-md overflow-hidden border">
                                  <img
                                    src={room.images[0]}
                                    alt={`${room.roomNumber} image`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {room.images.length > 1 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{room.images.length - 1}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                                <span className="text-xs">Chưa có ảnh</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{room.area} m²</TableCell>
                        <TableCell className="font-mono">
                          {formatPrice(room.price)}
                        </TableCell>
                        <TableCell>{room.maxTenants} người</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[room.status]}
                          >
                            {STATUS_LABELS[room.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(room.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenRoomDetail(room)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Permission permission="room:edit">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleOpenEditModal(room)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4 text-amber-600" />
                              </Button>
                            </Permission>
                            <Permission permission="room:delete">
                              <div className="flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center">
                                        <Switch
                                          checked={(room as any).active ?? true}
                                          onCheckedChange={() =>
                                            handleToggleActive(room)
                                          }
                                          disabled={isActivating}
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {(room as any).active
                                          ? "Click để ngừng hoạt động phòng"
                                          : "Click để kích hoạt phòng"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Permission>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageLimit + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageLimit, roomsData.total)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{roomsData.total}</span> phòng
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={pageLimit.toString()}
                    onValueChange={(value) => {
                      setPageLimit(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 phòng</SelectItem>
                      <SelectItem value="20">20 phòng</SelectItem>
                      <SelectItem value="50">50 phòng</SelectItem>
                      <SelectItem value="100">100 phòng</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ModalRoom
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingRoom(null);
          }
        }}
        room={editingRoom}
        onSubmit={handleSubmitRoom}
        isLoading={isCreating || isUpdating || isUploadingImages}
        defaultBuildingId={selectedBuildingId}
      />

      <RoomDetail
        open={isRoomDetailOpen}
        onOpenChange={(open) => {
          setIsRoomDetailOpen(open);
          if (!open) {
            setViewingRoomId(null);
          }
        }}
        roomId={viewingRoomId}
      />

      <ModalQuickRoom
        open={isQuickModalOpen}
        onOpenChange={(open) => {
          setIsQuickModalOpen(open);
        }}
        defaultBuildingId={selectedBuildingId}
      />
    </div>
  );
};

export default RoomManageLandlord;
