import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DoorOpen, 
  MapPin, 
  Users, 
  DollarSign, 
  Ruler, 
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useGetRoomByIdQuery } from "@/services/room/room.service";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { Spinner } from "@/components/ui/spinner";
import { STATUS_COLORS, STATUS_LABELS } from "../const/data";

interface RoomDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string | null;
}

export const RoomDetail = ({ open, onOpenChange, roomId }: RoomDetailProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  const { data: room, isLoading, error } = useGetRoomByIdQuery(roomId || "", {
    skip: !roomId || !open,
  });

  const handleClose = () => {
    setCurrentImageIndex(0);
    onOpenChange(false);
  };

  const nextImage = () => {
    if (room?.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === (room.images?.length || 0) - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (room?.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? (room.images?.length || 0) - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Chi tiết phòng
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error || !room) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Chi tiết phòng
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Không thể tải thông tin phòng</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" />
                Chi tiết phòng {room.roomNumber}
              </SheetTitle>
              <SheetDescription>
                Thông tin chi tiết về phòng
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
            {/* Images Section */}
            {room.images && room.images.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Hình ảnh phòng ({room.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-video overflow-hidden rounded-lg border">
                      <img
                        src={room.images[currentImageIndex]}
                        alt={`Room image ${currentImageIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                      
                      {/* Navigation buttons */}
                      {room.images.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute left-2 top-1/2 -translate-y-1/2"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {/* Image counter */}
                      {room.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {currentImageIndex + 1} / {room.images.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail images */}
                    {room.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {room.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-video overflow-hidden rounded border-2 ${
                              index === currentImageIndex 
                                ? 'border-primary' 
                                : 'border-muted'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Chưa có hình ảnh</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DoorOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Số phòng:</span>
                      <span>{room.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Diện tích:</span>
                      <span>{room.area} m²</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Sức chứa:</span>
                      <span>{room.maxTenants} người</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Giá thuê:</span>
                      <span className="font-mono">{formatPrice(room.price)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Trạng thái:</span>
                      <Badge
                        variant="outline"
                        className={STATUS_COLORS[room.status]}
                      >
                        {STATUS_LABELS[room.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Ngày tạo:</span>
                      <span>{formatDate(room.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Vị trí
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Tòa nhà:</span>
                    <span>{room.buildingId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Địa chỉ:</span>
                    <span>{room.buildingId?.address || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Tầng:</span>
                    <span>{room.floorId?.level || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {room.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Mô tả</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {room.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Building Information */}
            {room.buildingId && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tòa nhà</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Tên tòa nhà:</span>
                      <span>{room.buildingId.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Địa chỉ:</span>
                      <span>{room.buildingId.address}</span>
                    </div>
                    {room.buildingId.ePrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Giá điện:</span>
                        <span className="font-mono">{formatPrice(room.buildingId.ePrice)}/kWh</span>
                      </div>
                    )}
                    {room.buildingId.wPrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Giá nước:</span>
                        <span className="font-mono">{formatPrice(room.buildingId.wPrice)}/m³</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
