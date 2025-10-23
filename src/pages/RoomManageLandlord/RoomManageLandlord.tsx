import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit, Trash2, Eye, Search, DoorOpen, Image as ImageIcon, Zap } from "lucide-react";
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
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useAddRoomImagesMutation,
} from "@/services/room/room.service";
import { useGetFloorsQuery } from "@/services/floor/floor.service";
import { STATUS_COLORS, STATUS_LABELS, STATUS_OPTIONS } from "./const/data";
import { Spinner } from "@/components/ui/spinner";
import { ModalRoom } from "./components/ModalRoom";
import { ModalQuickRoom } from "./components/ModalQuickRoom";
import { DeleteRoomPopover } from "./components/DeleteRoomPopover";
import { RoomDetail } from "./components/RoomDetail";
import { toast } from "sonner";
import type { IRoom } from "@/types/room";

const RoomManageLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<IRoom | null>(null);

  // Room detail drawer states
  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [viewingRoomId, setViewingRoomId] = useState<string | null>(null);

  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  // Debounced search
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

  // Auto-select first building
  const { data: initialBuildingData } = useGetBuildingsQuery({
    q: "",
    page: 1,
    limit: 1,
  });

  useEffect(() => {
    if (initialBuildingData?.data?.[0]?._id && !selectedBuildingId) {
      setSelectedBuildingId(initialBuildingData.data[0]._id);
    }
  }, [initialBuildingData, selectedBuildingId]);

  // Fetch floors based on selected building
  const { data: floorsData, isLoading: isFloorsLoading } = useGetFloorsQuery(
    { buildingId: selectedBuildingId },
    { skip: !selectedBuildingId }
  );

  // Fetch rooms
  const { data: roomsData, isLoading: isRoomsLoading } = useGetRoomsQuery({
    buildingId: selectedBuildingId,
    floorId: selectedFloorId && selectedFloorId !== "all" ? selectedFloorId : undefined,
    status: selectedStatus === "all" ? undefined : (selectedStatus as any),
    q: debouncedSearch,
    page: currentPage,
    limit: pageLimit,
  });

  // Mutations
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();
  const [addRoomImages, { isLoading: isUploadingImages }] = useAddRoomImagesMutation();

  const totalPages = roomsData?.total
    ? Math.ceil(roomsData.total / pageLimit)
    : 0;

  // Handlers
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

  const handleOpenDeleteDialog = (room: IRoom) => {
    setDeletingRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenRoomDetail = (room: IRoom) => {
    setViewingRoomId(room.id);
    setIsRoomDetailOpen(true);
  };

  const handleSubmitRoom = async (data: any) => {
    try {
      if (editingRoom) {
        // For edit mode, only send the fields that can be updated
        const updateData = {
          roomNumber: data.roomNumber,
          area: data.area,
          price: data.price,
          maxTenants: data.maxTenants,
          status: data.status,
          description: data.description,
          images: data.images,
          removeUrls: data.removeUrls,
          replaceAllImages: data.replaceAllImages,
        };
        
        console.log('Updating room with filtered data:', updateData);
        
        await updateRoom({
          id: editingRoom.id,
          data: updateData,
        }).unwrap();
        toast.success("Cập nhật phòng thành công!");
      } else {
        // For create mode, create room first then upload images if any
        const roomData = {
          buildingId: data.buildingId,
          floorId: data.floorId,
          roomNumber: data.roomNumber,
          area: data.area,
          price: data.price,
          maxTenants: data.maxTenants,
          status: data.status,
          description: data.description,
        };
        
        console.log('Creating room with data:', roomData);
        
        const createdRoom = await createRoom(roomData).unwrap();
        toast.success("Thêm phòng mới thành công!");
        
        // Upload images if any were selected
        if (data.images && data.images.length > 0) {
          try {
            await addRoomImages({
              id: createdRoom.id,
              images: data.images,
            }).unwrap();
            toast.success("Tải lên ảnh thành công!");
          } catch (imageError) {
            console.error('Image upload failed:', imageError);
            toast.error("Tải lên ảnh thất bại!");
          }
        }
      }
      setIsModalOpen(false);
      setEditingRoom(null);
    } catch (error: any) {
      toast.error(
        editingRoom ? "Cập nhật phòng thất bại!" : "Thêm phòng mới thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRoom) return;

    try {
      await deleteRoom(deletingRoom.id).unwrap();
      toast.success("Xóa phòng thành công!");
      setIsDeleteDialogOpen(false);
      setDeletingRoom(null);
    } catch (error: any) {
      toast.error("Xóa phòng thất bại!");
      console.error(error);
    }
  };

  // Reset floor when building changes
  useEffect(() => {
    setSelectedFloorId("");
    setCurrentPage(1);
  }, [selectedBuildingId]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFloorId, selectedStatus, debouncedSearch]);

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Phòng
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các phòng trong tòa nhà
          </p>
        </div>
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
      </div>


      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc phòng theo tòa nhà, tầng, trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Building Select */}
            <div className="space-y-2 w-full md:w-[220px]">
              <label className="text-sm font-medium">Tòa nhà</label>
              <BuildingSelectCombobox
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              />
            </div>

            {/* Floor Select */}
            <div className="space-y-2 w-full md:w-[124px]">
              <label className="text-sm font-medium">Tầng</label>
              <Select
                value={selectedFloorId}
                onValueChange={setSelectedFloorId}
                disabled={!selectedBuildingId || isFloorsLoading}
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

            {/* Status Select */}
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

            {/* Search */}
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

      {/* Rooms Table */}
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
                      <TableRow key={room.id}>
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
                                  <Badge variant="secondary" className="text-xs">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenEditModal(room)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4 text-amber-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenDeleteDialog(room)}
                              title="Xóa phòng"
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

              {/* Pagination */}
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

      {/* Modal Room (Create/Edit) */}
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

      {/* Delete Room Popover */}
      <DeleteRoomPopover
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingRoom(null);
          }
        }}
        room={deletingRoom}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Room Detail Drawer */}
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

      {/* Quick Create Modal */}
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