import { useMemo, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { useGetPostDetailsResidentsQuery } from "@/services/post/post.service";

import { useGetBuildingRatingsQuery } from "@/services/building-rating/rating.service";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Spinner } from "@/components/ui/spinner";

import {
  MapPin,
  Calendar,
  DollarSign,
  Square,
  ChevronLeft,
  Building2,
  DoorOpen,
  ShieldCheck,
  Info,
  Share2,
  Heart,
  Star,
  Wifi,
  User,
  Phone,
  ExternalLink,
  Zap,
  Droplets,
  CalendarClock,
} from "lucide-react";

import ImageGallery from "./components/ImageGallery";

import { useFormatDate } from "@/hooks/useFormatDate";

import { useFormatPrice } from "@/hooks/useFormatPrice";

import type { IGetPostResidentDetailResponse } from "@/types/post";

import CreateContact from "./components/CreateContact";

import BookingAppointment from "./components/BookingAppointment";

import { BuildingDetailModal } from "../DetailBuilding/components/DetailBuildingComponent";

const PostDetailResident = () => {
  const navigate = useNavigate();

  const { slug } = useParams();

  const id = useMemo(() => slug?.split("-").pop() || "", [slug]);

  const { data, isLoading, isError } = useGetPostDetailsResidentsQuery(id, {
    skip: !id,
  });

  const post = data?.data as IGetPostResidentDetailResponse["data"] | undefined;

  const building = post?.buildingId;

  const buildingId = typeof building === "object" ? building?._id : undefined;

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const formatDate = useFormatDate();

  const formatPrice = useFormatPrice();

  const { data: ratingData } = useGetBuildingRatingsQuery(
    { buildingId: buildingId!, limit: 1 },

    { skip: !buildingId }
  );

  const ratings = ratingData?.data?.ratings || [];

  const totalRatings = ratingData?.data?.summary?.totalRatings || 0;

  const averageRating = ratingData?.data?.summary?.averageRating || 0;

  const visibleRooms = useMemo(() => {
    if (!post?.rooms) return [];

    return post.rooms.filter(
      (room: any) => room.status === "available" || room.isSoonAvailable
    );
  }, [post?.rooms]);

  const hasBookableRooms = visibleRooms.length > 0;

  // Handlers

  const handleContactCreate = () => setIsContactModalOpen(true);

  const handleBooking = () => setIsBookingModalOpen(true);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center">
                <Spinner />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="h-8 w-4/5 bg-muted rounded" />

                <div className="h-5 w-3/5 bg-muted rounded" />

                <div className="h-10 w-full bg-muted rounded mt-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
            <Info className="h-8 w-8 text-rose-500" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">Không tìm thấy bài đăng</h2>

            <p className="text-muted-foreground mt-2">
              Bài đăng có thể đã bị xóa hoặc đường dẫn không đúng.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>

            <Button onClick={() => navigate("/")}>Về trang chủ</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Back Button */}

      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ChevronLeft className="h-4 w-4" />
        Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery */}

        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            <ImageGallery images={post.images || []} title={post.title} />
          </CardContent>
        </Card>

        {/* Sidebar Summary */}

        <Card className="sticky top-4 h-fit">
          <CardHeader>
            <CardTitle className="text-2xl line-clamp-2">
              {post.title}
            </CardTitle>

            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />

              <span className="truncate">{post.address}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Giá & Diện tích */}

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />

                <span className="text-xl font-bold text-green-700">
                  {formatPrice(post.priceMin)} - {formatPrice(post.priceMax)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Square className="h-5 w-5 text-blue-600" />

                <span className="text-lg text-blue-700">
                  {post.areaMin} - {post.areaMax} m²
                </span>
              </div>
            </div>

            {/* Chủ nhà */}

            <div className="space-y-3 py-3 border-t">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4" />

                <span className="font-medium">
                  {post.landlordId?.fullName || "Chủ trọ"}
                </span>
              </div>

              {post.landlordId?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4" />

                  <a
                    href={`tel:${post.landlordId.phoneNumber}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {post.landlordId.phoneNumber}
                  </a>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Đăng ngày {formatDate(post.createdAt)}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
              </Button>

              <Button variant="outline" size="sm" className="flex-1">
                <Heart className="h-4 w-4 mr-2" /> Lưu tin
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />

                <span>An ninh tốt</span>
              </div>

              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-sky-600" />

                <span>Wifi mạnh</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4 border-t">
              {/* Cập nhật nút đặt lịch dựa trên trạng thái phòng */}

              <Button
                className="bg-[#4C9288] hover:bg-[#4C9288]/90 w-full"
                onClick={handleBooking}
                disabled={!hasBookableRooms}
              >
                {hasBookableRooms ? "Đặt lịch xem phòng" : "Hết phòng trống"}
              </Button>

              <Button
                variant="outline"
                onClick={handleContactCreate}
                className="w-full"
              >
                Yêu cầu tạo hợp đồng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mô tả chi tiết</CardTitle>
        </CardHeader>

        <CardContent>
          {post.description ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.description }}
            />
          ) : (
            <p className="text-muted-foreground">Chưa có mô tả chi tiết.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />

              <CardTitle>Thông tin tòa nhà</CardTitle>
            </div>

            {buildingId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
                onClick={() => setSelectedBuildingId(buildingId)}
              >
                Xem chi tiết
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          <CardDescription>Xem thông tin và đánh giá từ cư dân</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {building ? (
            <>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tên trọ/tòa nhà
                    </p>

                    <p className="font-medium">{building.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm text-muted-foreground">Địa chỉ</p>

                    <p className="font-medium">{building.address}</p>
                  </div>
                </div>

                {averageRating !== undefined && averageRating > 0 ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />

                    <span className="font-medium">
                      {averageRating.toFixed(1)}
                    </span>

                    <span className="text-muted-foreground">
                      ({totalRatings} đánh giá)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    Chưa có đánh giá
                  </span>
                )}
              </div>

              <div className="grid gap-6 pt-4 border-t border-border/60">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm text-muted-foreground">Giá điện</p>

                    <p className="font-medium">
                      {building.eIndexType === "included"
                        ? "Đã bao gồm"
                        : building.ePrice
                        ? `${formatPrice(building.ePrice)} ₫/${
                            building.eIndexType === "byNumber"
                              ? "kWh"
                              : "người/tháng"
                          }`
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Droplets className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm text-muted-foreground">Giá nước</p>

                    <p className="font-medium">
                      {building.wIndexType === "included"
                        ? "Đã bao gồm"
                        : building.wPrice
                        ? `${formatPrice(building.wPrice)} ₫/${
                            building.wIndexType === "byNumber"
                              ? "m³"
                              : "người/tháng"
                          }`
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Không có thông tin tòa nhà.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Phòng đang trống ({visibleRooms.length || 0})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {visibleRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleRooms.map((room: any) => {
                let badgeClass = "bg-gray-100 text-gray-800";

                let badgeLabel = "Không xác định";

                if (room.status === "available") {
                  badgeClass = "bg-emerald-100 text-emerald-800";

                  badgeLabel = "Còn trống";
                } else if (room.isSoonAvailable) {
                  badgeClass = "bg-amber-100 text-amber-800";

                  badgeLabel = "Sắp trống";
                }

                return (
                  <div
                    key={room._id}
                    className="p-5 rounded-xl border bg-card hover:shadow-lg transition-shadow relative overflow-hidden"
                  >
                    {/* Border top highlight nếu sắp trống */}

                    {room.isSoonAvailable && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-lg">
                        Phòng {room.roomNumber}
                      </h4>

                      <Badge className={badgeClass}>{badgeLabel}</Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-blue-600" />

                        <span>{room.area} m²</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />

                        <span className="font-semibold text-green-700">
                          {formatPrice(room.price)} / tháng
                        </span>
                      </div>

                      {/* Hiển thị ngày trống dự kiến */}

                      {room.isSoonAvailable && room.expectedAvailableDate && (
                        <div className="flex items-center gap-2 text-amber-700 font-medium mt-2 pt-2 border-t border-dashed border-amber-200">
                          <CalendarClock className="h-4 w-4" />

                          <span>
                            Trống từ: {formatDate(room.expectedAvailableDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 border border-dashed rounded-lg bg-slate-50">
              Hiện tại không còn phòng nào khả dụng.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal liên hệ */}

      <CreateContact
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        postId={post._id}
        buildingId={buildingId || ""}
        buildingName={typeof building === "object" ? building.name : ""}
        postTitle={post.title}
        rooms={visibleRooms}
      />

      {/* Modal đặt lịch */}

      <BookingAppointment
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        postId={post._id}
        buildingId={buildingId || ""}
        buildingName={typeof building === "object" ? building.name : ""}
        postTitle={post.title}
        address={post.address}
      />

      {/* Modal chi tiết tòa nhà */}

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

export default PostDetailResident;
