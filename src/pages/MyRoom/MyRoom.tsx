import { useState } from "react";
import { useGetMyRoomQuery } from "@/services/room/room.service";
import { useFormatDate } from "@/hooks/useFormatDate";
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
  Ruler,
  DollarSign,
  Users,
  FileText,
  Zap,
  Droplets,
  Sofa,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Sparkles,
  Wrench,
} from "lucide-react";
import { CreateMaintenanceModal } from "@/pages/Maintenance/components/CreateMaintenanceModal";
import { RoommateList } from "./components/RoommateList";

const MyRoom = () => {
  const { data, isLoading, error } = useGetMyRoomQuery();
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string>("");

  if (isLoading) {
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
        <Card className="max-w-md border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-medium mb-2">
                Không thể tải thông tin phòng
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

  const room = data?.room;

  if (!room) {
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
    if (room.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room.images && room.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + room.images.length) % room.images.length
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
            <div className="p-3 bg-primary/20 rounded-xl backdrop-blur-sm">
              <Home className="h-6 w-6 text-primary" />
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
            {/* Image Gallery */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="px-6">
                {room?.images && room.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50 shadow-lg group">
                      <img
                        src={
                          room.images?.[currentImageIndex] ||
                          room.images?.[0] ||
                          ""
                        }
                        alt={`Phòng ${room?.roomNumber || ""} - Ảnh ${
                          currentImageIndex + 1
                        }`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {room.images && room.images.length > 1 && (
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
                            {currentImageIndex + 1}/{room.images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {room.images && room.images.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide p-2">
                        {room.images.map((image: string, index: number) => (
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
                        ))}
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

            {/* Room Information */}
            <Card className="border-0 shadow-xl py-0">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  Thông tin phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/20 rounded-xl group-hover:scale-110 transition-transform">
                        <Ruler className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Diện tích
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {room?.area ?? 0} m²
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Giá thuê
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {formatPrice(room?.price ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Số người ở
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {room?.currentCount ?? 0}
                          <span className="text-lg text-muted-foreground">
                            /{room?.maxTenants ?? 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Trạng thái
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(room?.status || "available")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Contract */}
            {room?.currentContract && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 pt-0">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    Hợp đồng hiện tại
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Số hợp đồng
                      </p>
                      <p className="text-lg font-bold">
                        {room.currentContract.no}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Giá thuê</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(room.currentContract.price)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Ngày bắt đầu
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDate(room.currentContract.startDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Ngày kết thúc
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDate(room.currentContract.endDate)}
                      </p>
                    </div>
                  </div>

                  {room.currentContract.roommates &&
                    room.currentContract.roommates.length > 0 && (
                      <div className="pt-6 border-t border-border/50">
                        <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Người ở cùng ({room.currentContract.roommates.length})
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {room.currentContract.roommates.map(
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

            {/* Roommates */}
            {room?._id && (
              <RoommateList
                roomId={room._id}
                maxTenants={room.maxTenants}
                currentCount={room.currentCount}
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
                {data?.furnitures && data.furnitures.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.furnitures.map(
                      (
                        furniture: IMyRoomResponse["furnitures"][0],
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Building Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="border-b-0">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  Thông tin tòa nhà
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-around">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tên tòa nhà
                    </p>
                    <p className="font-bold text-lg">
                      {room?.building?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Số phòng
                    </p>
                    <p className="font-bold text-lg">
                      {room?.roomNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Địa chỉ
                    </p>
                    <p className="font-bold text-md">
                      {room?.building?.address || "N/A"}
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
                        Chỉ số bắt đầu khi nhận phòng
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
                      <p className="text-2xl font-bold">{room?.eStart ?? 0}</p>
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
                      <p className="text-2xl font-bold">{room?.wStart ?? 0}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    m³
                  </span>
                </div>
              </CardContent>
            </Card>

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
        />
      </div>
    </div>
  );
};

export default MyRoom;
