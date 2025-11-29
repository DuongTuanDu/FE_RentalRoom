import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPostDetailsQuery } from "@/services/post/post.service";
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
} from "lucide-react";
import ImageGallery from "./components/ImageGallery";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { IGetPostDetailResponse } from "@/types/post";

const statusToBadge: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  active: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    label: "Đang hiển thị",
  },
  hidden: { bg: "bg-gray-100", text: "text-gray-800", label: "Đang ẩn" },
  expired: { bg: "bg-amber-100", text: "text-amber-800", label: "Hết hạn" },
};

const roomStatusToBadge: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  available: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    label: "Còn trống",
  },
  rented: { bg: "bg-rose-100", text: "text-rose-800", label: "Đã thuê" },
  maintenance: { bg: "bg-amber-100", text: "text-amber-800", label: "Bảo trì" },
};

const chargeTypeLabel: Record<string, string> = {
  perRoom: "Theo phòng",
  perPerson: "Theo người",
  included: "Đã bao gồm",
};

const PostDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const id = useMemo(() => slug?.split("-").pop() || "", [slug]);

  const { data, isLoading, isError } = useGetPostDetailsQuery(id, {
    skip: !id,
  });

  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  const detail = data?.data as IGetPostDetailResponse["data"] | undefined;
  const post = detail?.post;
  const building = detail?.building;
  const rooms = detail?.rooms ?? [];
  const services = detail?.services ?? [];
  const regulationsRaw = (detail as any)?.regulations;
  const regulations = Array.isArray(regulationsRaw)
    ? regulationsRaw
    : regulationsRaw
    ? [regulationsRaw]
    : [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 w-40 rounded bg-muted" />
          <div className="h-9 w-28 rounded bg-muted" />
        </div>
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
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
            <Info className="h-6 w-6 text-rose-500" />
          </div>
          <h2 className="text-xl font-semibold">
            Không thể tải chi tiết bài đăng
          </h2>
          <p className="text-muted-foreground">
            Vui lòng kiểm tra đường dẫn hoặc thử tải lại trang.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Button onClick={() => window.location.reload()}>Tải lại</Button>
          </div>
        </div>
      </div>
    );
  }

  const statusMeta = statusToBadge[post.status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: post.status,
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={`${statusMeta.bg} ${statusMeta.text}`}>
            {statusMeta.label}
          </Badge>
          {post.isDraft && <Badge variant="outline">Bản nháp</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery */}
        <Card className="lg:col-span-2 overflow-hidden py-0">
          <CardContent className="p-0">
            <ImageGallery images={post.images || []} title={post.title} />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{post.address}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-700">
                  {formatPrice(post.priceMin)} - {formatPrice(post.priceMax)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  {post.areaMin} - {post.areaMax} m²
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Đăng ngày {formatDate(post.createdAt)}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" /> Chia sẻ
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Heart className="h-4 w-4" /> Lưu
              </Button>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>An ninh tốt</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wifi className="h-4 w-4 text-sky-600" />
                <span>Internet nhanh</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span>Vị trí thuận tiện</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DoorOpen className="h-4 w-4 text-indigo-600" />
                <span>{rooms.length || 0}+ phòng</span>
              </div>
            </div>

            <div className="pt-2">
              <Button className="w-full">Liên hệ / Quan tâm</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Mô tả</CardTitle>
          <CardDescription>Thông tin chi tiết về bài đăng</CardDescription>
        </CardHeader>
        <CardContent>
          {post.description ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0"
              dangerouslySetInnerHTML={{
                __html: post.description,
              }}
            />
          ) : (
            <p className="text-muted-foreground">Chưa có mô tả.</p>
          )}
        </CardContent>
      </Card>

      {/* Building info + Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tòa nhà
            </CardTitle>
            <CardDescription>Thông tin tòa nhà nơi đặt phòng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {building ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Tên tòa nhà</p>
                    <p className="font-medium">{building.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Địa chỉ</p>
                    <p className="font-medium">{building.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Điện</p>
                    <p className="font-medium">
                      {building.eIndexType === "included"
                        ? "Đã bao gồm"
                        : `${building.ePrice?.toLocaleString()} đ / ${
                            building.eIndexType === "byNumber" ? "kWh" : "người"
                          }`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nước</p>
                    <p className="font-medium">
                      {building.wIndexType === "included"
                        ? "Đã bao gồm"
                        : `${building.wPrice?.toLocaleString()} đ / ${
                            building.wIndexType === "byNumber" ? "m³" : "người"
                          }`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Trạng thái
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          building.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {building.status === "active"
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Không có thông tin tòa nhà.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Dịch vụ
            </CardTitle>
            <CardDescription>Các phí dịch vụ đi kèm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.length ? (
              services.map((s) => (
                <div key={s._id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{s.label || s.name}</div>
                    <Badge variant="outline">
                      {chargeTypeLabel[s.chargeType] || s.chargeType}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {s.chargeType === "included"
                      ? "Đã bao gồm"
                      : `${s.fee.toLocaleString()} ${s.currency}`}
                  </div>
                  {s.description && (
                    <div className="text-sm mt-2">{s.description}</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Không có dịch vụ.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Phòng trống
          </CardTitle>
          <CardDescription>Danh sách phòng thuộc bài đăng</CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const rm = roomStatusToBadge[room.status] ?? {
                  bg: "bg-gray-100",
                  text: "text-gray-800",
                  label: room.status,
                };
                return (
                  <div
                    key={room._id}
                    className="shadow-xl hover:shadow-2xl rounded-lg p-4 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">
                        Phòng {room.roomNumber}
                      </div>
                      <Badge className={`${rm.bg} ${rm.text}`}>
                        {rm.label}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{room.area} m²</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {formatPrice(room.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Chưa có phòng nào.</p>
          )}
        </CardContent>
      </Card>

      {/* Regulations */}
      <Card>
        <CardHeader>
          <CardTitle>Nội quy</CardTitle>
          <CardDescription>
            Quy định áp dụng cho tòa nhà/bài đăng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {regulations.length ? (
            regulations.map((r) => (
              <div key={r._id} className="border rounded-md p-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Hiệu lực từ {formatDate(r.effectiveFrom)}
                  </div>
                </div>
                {r.description && (
                  <div className="text-sm mt-2">
                    {/* {r.description} */}
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: r.description }}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Chưa có nội quy.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetail;
