import { useState, useMemo } from "react";
import { useGetMyRoomQuery } from "@/services/room/room.service";
import { useGetPostRoomDetailsQuery } from "@/services/post/post.service";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { IMyRoom, IMyRoomResponse } from "@/types/room";
import type { IPerson } from "@/types/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Home,
  Users,
  FileText,
  Zap,
  Droplets,
  Sofa,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Wrench,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { CreateMaintenanceModal } from "@/pages/Maintenance/components/CreateMaintenanceModal";
import { RoommateList } from "./components/RoommateList";
import { BuildingDetailModal } from "../DetailBuilding/components/DetailBuildingComponent";
import { LaundryDevicesCard } from "./components/LaundryDevicesCard";
import { useFormatDateNoHours } from "@/hooks/useFormatDateNoHours";

const MyRoom = () => {
  const { data, isLoading, error } = useGetMyRoomQuery();
  const formatDate = useFormatDateNoHours();
  const formatPrice = useFormatPrice();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const room = data?.data?.room;
  const availableRooms = data?.data?.availableRooms || [];

  // Phòng hiện tại được hiển thị (mặc định là phòng trong response)
  const currentRoomId = selectedRoomId || room?._id;
  const currentAvailableRoom = availableRooms.find(
    (availableRoom) => availableRoom._id === currentRoomId
  );
  const isUpcomingContract =
    currentAvailableRoom?.contract?.status === "upcoming";

  // Luôn gọi API getPostRoomDetails cho phòng hiện tại (cả phòng mặc định và phòng được chọn)
  const { data: defaultRoomDetailData, isLoading: isLoadingDefaultRoomDetail } =
    useGetPostRoomDetailsQuery(room?._id || "", {
      skip: !room?._id || !!selectedRoomId, // Skip nếu đã có selectedRoomId
    });

  // Gọi API lấy thông tin chi tiết phòng khi có selectedRoomId
  const { data: roomDetailData, isLoading: isLoadingRoomDetail } =
    useGetPostRoomDetailsQuery(selectedRoomId || "", {
      skip: !selectedRoomId,
    });

  // Luôn sử dụng dữ liệu từ useGetPostRoomDetailsQuery cho tất cả thông tin phòng
  // (Thông tin tòa nhà, Thông tin phòng, Chỉ số điện nước, Đồ đạc)
  const displayData = useMemo(() => {
    // Ưu tiên dữ liệu từ phòng được chọn, nếu không có thì dùng phòng mặc định
    const roomDetail = selectedRoomId
      ? roomDetailData?.data
      : defaultRoomDetailData?.data;

    if (roomDetail) {
      return {
        room: {
          _id: roomDetail._id,
          building: roomDetail.buildingId,
          roomNumber: roomDetail.roomNumber,
          images: roomDetail.images,
          area: roomDetail.area,
          price: roomDetail.price,
          maxTenants: roomDetail.maxTenants,
          status: roomDetail.status,
          eStart: roomDetail.eStart,
          wStart: roomDetail.wStart,
          currentCount: roomDetail.currentTenantIds?.length || 0,
          // Giữ lại các thông tin từ useGetMyRoomQuery nếu không có trong roomDetail
          currentContract: room?.currentContract,
          tenants: room?.tenants,
          contractRoommates: room?.contractRoommates,
        },
        furnitures: roomDetail.furnitures || [],
        building: roomDetail.buildingId,
      };
    }

    // Fallback về dữ liệu từ useGetMyRoomQuery nếu chưa có roomDetail (chỉ dùng cho các thông tin không có trong roomDetail)
    // Không sử dụng building từ useGetMyRoomQuery nữa, chỉ dùng từ useGetPostRoomDetailsQuery
    return {
      room: room,
      furnitures: [],
      building: undefined, // Không có building nếu chưa có roomDetail
    };
  }, [selectedRoomId, roomDetailData, defaultRoomDetailData, room]);

  const displayRoom = displayData.room;

  const furnitures = displayData.furnitures;
  const displayBuilding = displayData.building;

  // Early returns sau khi đã gọi tất cả hooks
  if (
    isLoading ||
    (selectedRoomId && isLoadingRoomDetail) ||
    (!selectedRoomId && isLoadingDefaultRoomDetail)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-lg border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-md font-medium mb-2">
                {(error as any)?.message.message || "Không thể tải thông tin phòng"}
              </p>
              <p className="text-sm text-muted-foreground">
                Vui lòng thử lại sau
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!displayRoom) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Bạn chưa có phòng nào</p>
              <p className="text-sm text-muted-foreground">
                Hãy liên hệ với chủ nhà để được phân phòng
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextImage = () => {
    if (displayRoom?.images && displayRoom.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % displayRoom.images.length);
    }
  };

  const prevImage = () => {
    if (displayRoom?.images && displayRoom.images.length > 0) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + displayRoom.images.length) % displayRoom.images.length
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      rented: "default",
      available: "secondary",
      maintenance: "destructive",
    };

    const labels: Record<string, string> = {
      rented: "Đã thuê",
      available: "Có sẵn",
      maintenance: "Bảo trì",
    };

    return (
      <Badge variant={variants[status] || "default"} className="shadow-sm">
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with gradient */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-xl backdrop-blur-sm">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Phòng của tôi
              </h1>
              <p className="text-slate-600 mt-1">
                Thông tin chi tiết về phòng bạn đang thuê
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Available Rooms Selector - Hiển thị nếu có nhiều phòng */}
            {availableRooms.length > 1 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    Phòng của tôi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {availableRooms.map((availableRoom) => (
                      <button
                        key={availableRoom._id}
                        type="button"
                        onClick={() => {
                          // Nếu click vào phòng đang được chọn, reset về phòng mặc định
                          if (
                            availableRoom._id === currentRoomId &&
                            selectedRoomId
                          ) {
                            setSelectedRoomId(null);
                          } else {
                            setSelectedRoomId(availableRoom._id);
                          }
                          setCurrentImageIndex(0); // Reset image index khi chuyển phòng
                        }}
                        className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left bg-card hover:shadow-lg ${
                          availableRoom._id === currentRoomId
                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {/* Header với Room Number và Status */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xl text-foreground mb-1">
                              {availableRoom.roomNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {availableRoom.buildingName}
                            </p>
                          </div>
                          <Badge
                            variant={
                              availableRoom.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs shrink-0 ml-2"
                          >
                            {availableRoom.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Badge>
                        </div>

                        {/* Contract Information */}
                        {availableRoom.contract && (
                          <div className="mt-4 pt-4 border-t border-border/50 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Số hợp đồng</span>
                              <span className="text-xs font-semibold text-foreground">
                                {availableRoom.contract.contractNo}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Trạng thái</span>
                              <Badge
                                variant={
                                  availableRoom.contract.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs h-5"
                              >
                                {availableRoom.contract.status === "active"
                                  ? "Đang hoạt động"
                                  : "Sắp tới"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Từ</span>
                                <span className="font-medium text-foreground">
                                  {formatDate(availableRoom.contract.startDate)}
                                </span>
                              </div>
                              <span className="text-muted-foreground/50">→</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Đến</span>
                                <span className="font-medium text-foreground">
                                  {formatDate(availableRoom.contract.endDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Gallery */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="px-6">
                {displayRoom?.images && displayRoom.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50 shadow-lg group">
                      <img
                        src={
                          displayRoom.images?.[currentImageIndex] ||
                          displayRoom.images?.[0] ||
                          ""
                        }
                        alt={`Phòng ${displayRoom?.roomNumber || ""} - Ảnh ${
                          currentImageIndex + 1
                        }`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {displayRoom.images && displayRoom.images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg hover:scale-110"
                            aria-label="Ảnh trước"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          <button
                            type="button"
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg hover:scale-110"
                            aria-label="Ảnh sau"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full shadow-lg">
                            {currentImageIndex + 1}/{displayRoom.images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {displayRoom.images && displayRoom.images.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide p-2">
                        {displayRoom.images.map(
                          (image: string, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCurrentImageIndex(index)}
                              className={`relative shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${
                                currentImageIndex === index
                                  ? "shadow-lg scale-105"
                                  : "opacity-50 hover:opacity-100 hover:scale-105 shadow-md"
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-24 w-32 object-cover"
                              />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Chưa có hình ảnh
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Roommates */}
            {displayRoom?._id && (
              <RoommateList
                roomId={displayRoom._id}
                maxTenants={displayRoom.maxTenants}
                currentCount={displayRoom.currentCount}
                canManage={!isUpcomingContract}
              />
            )}

            {/* Furnitures */}
            <Card className="border-0 shadow-xl pt-0">
              <CardHeader className="bg-gradient-to-r from-amber-500/10 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Sofa className="h-5 w-5 text-amber-600" />
                  </div>
                  Đồ đạc trong phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {furnitures && furnitures.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {furnitures.map(
                      (
                        furniture: IMyRoomResponse["data"]["furnitures"][0],
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="group flex flex-col gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20 hover:shadow-lg transition-all duration-300 border-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2.5 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                <Sofa className="h-5 w-5 text-amber-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">
                                  {furniture.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Tình trạng: {furniture.condition}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="ml-3 shadow-sm shrink-0"
                            >
                              {furniture.quantity} cái
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            disabled={isUpcomingContract}
                            onClick={() => {
                              setSelectedFurnitureId(furniture._id);
                              setIsCreateMaintenanceOpen(true);
                            }}
                          >
                            <Wrench className="h-4 w-4" />
                            Yêu cầu bảo trì
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sofa className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Chưa có đồ đạc nào</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Laundry Devices */}
            <LaundryDevicesCard buildingId={displayBuilding?._id} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Building Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="border-b-0 flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  Thông tin tòa nhà
                </CardTitle>
                <div className="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() =>
                      displayBuilding?._id &&
                      setSelectedBuildingId(displayBuilding._id)
                    }
                  >
                    Xem chi tiết
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-around">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tên tòa nhà
                    </p>
                    <p className="font-bold text-lg text-primary">
                      {displayBuilding?.name || "Chưa có thông tin"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Số phòng
                    </p>
                    <p className="font-bold text-lg">
                      {displayRoom?.roomNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Địa chỉ
                    </p>
                    <p className="font-bold text-md">
                      {displayBuilding?.address || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="border-b-0">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  Thông tin phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Diện tích
                    </p>
                    <p className="font-bold text-lg">
                      {displayRoom?.area ?? 0} m²
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Giá thuê
                    </p>
                    <p className="font-bold text-lg">
                      {formatPrice(displayRoom?.price ?? 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Số người ở
                    </p>
                    <p className="font-bold text-md">
                      {displayRoom?.currentCount ?? 0}
                      <span className="text-lg text-muted-foreground">
                        /{displayRoom?.maxTenants ?? 0}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Trạng thái
                    </p>
                    <p className="font-bold text-lg">
                      {getStatusBadge(displayRoom?.status || "available")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Utility Indexes */}
            <Card className="border-0 shadow-xl pt-0 pb-5">
              <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
                <CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-lg">Chỉ số điện nước</div>
                      <p className="text-sm text-gray-400 font-normal">
                        Chỉ số hiện tại của phòng, cập nhật hàng tháng
                      </p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 space-y-4">
                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 hover:shadow-lg transition-all duration-300 border-0">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Điện</p>
                      <p className="text-2xl font-bold">
                        {displayRoom?.eStart ?? 0}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    kWh
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:shadow-lg transition-all duration-300 border-0">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Droplets className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nước</p>
                      <p className="text-2xl font-bold">
                        {displayRoom?.wStart ?? 0}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    m³
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Current Contract */}
            {displayRoom?.currentContract && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 pt-0">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    Hợp đồng hiện tại
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Số hợp đồng
                      </p>
                      <p className="text-lg font-bold">
                        {displayRoom.currentContract.no}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Giá thuê</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(displayRoom.currentContract.price)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Ngày bắt đầu
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDate(displayRoom.currentContract.startDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Ngày kết thúc
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDate(displayRoom.currentContract.endDate)}
                      </p>
                    </div>
                  </div>

                  {displayRoom.currentContract.roommates &&
                    displayRoom.currentContract.roommates.length > 0 && (
                      <div className="pt-6 border-t border-border/50">
                        <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Người ở cùng (
                          {displayRoom.currentContract.roommates.length})
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {displayRoom.currentContract.roommates.map(
                            (roommate: IPerson, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:shadow-md transition-all duration-300 border-0"
                              >
                                <div className="p-2.5 bg-primary/20 rounded-full">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">
                                    {roommate.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    CCCD: {roommate.cccd}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Contract Roommates */}
            {room?.contractRoommates && room.contractRoommates.length > 0 && (
              <Card className="border-0 shadow-xl pt-0">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    Người ở cùng hợp đồng
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="space-y-3">
                    {room.contractRoommates.map(
                      (
                        roommate: IMyRoom["contractRoommates"][0],
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 shadow hover:shadow-lg transition-all duration-300 border-0"
                        >
                          <p className="font-semibold mb-2">{roommate.name}</p>
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <span className="font-medium">CCCD:</span>{" "}
                              {roommate.cccd}
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span className="font-medium">SĐT:</span>{" "}
                              {roommate.phone}
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Ngày sinh:</span>{" "}
                              {formatDate(roommate.dob)}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create Maintenance Modal */}
        <CreateMaintenanceModal
          open={isCreateMaintenanceOpen}
          onOpenChange={(open) => {
            setIsCreateMaintenanceOpen(open);
            if (!open) {
              setSelectedFurnitureId("");
            }
          }}
          defaultFurnitureId={selectedFurnitureId}
          roomId={displayRoom?._id}
        />
      </div>

      {selectedBuildingId && (
        <BuildingDetailModal
          buildingId={selectedBuildingId}
          open={!!selectedBuildingId}
          onOpenChange={(open) => !open && setSelectedBuildingId("")}
        />
      )}
    </div>
  );
};

export default MyRoom;
