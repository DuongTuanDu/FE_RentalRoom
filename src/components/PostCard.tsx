import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  MapPin,
  Calendar,
  DollarSign,
  Square,
  Eye,
  User,
} from "lucide-react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/pages/PostManageLandlord/const/data";
import type { ReactNode } from "react";
import type { IPost } from "@/types/post";
import { useNavigate } from "react-router-dom";

type PostCardProps = {
  post: IPost;
  formatDate?: (dateString: string) => string;
  formatPrice?: (v: number) => string;
  className?: string;
  children?: ReactNode;
};

const PostCard = ({
  post,
  formatDate = (v) => (v ? new Date(v).toLocaleDateString() : ""),
  formatPrice = (v) => (typeof v === "number" ? v.toLocaleString("vi-VN") : ""),
  className,
}: PostCardProps) => {
  const navigate = useNavigate();
  const images = post.images || [];
  const hasImages = images.length > 0;
  const firstImage = hasImages ? images[0] : undefined;
  const extraCount = hasImages && images.length > 1 ? images.length - 1 : 0;

  return (
    <Card
      key={post._id}
      className={`overflow-hidden group hover:shadow-lg transition-all duration-200 border border-border py-0 gap-0 ${
        className || ""
      }`}
    >
      {/* Header: email chủ bài đăng (đặt trước phần Image) */}
      <div className="px-4 py-2 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex items-center gap-2 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 text-blue-600 shrink-0" />
          <span
            className="text-sm font-medium text-slate-700 truncate"
            title={post?.landlordId?.userInfo?.fullName || "Không có tên"}
          >
            {post?.landlordId?.userInfo?.fullName || "Không có tên"}
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="relative mb-2">
        {hasImages ? (
          <img
            src={firstImage}
            alt={post.title}
            className="w-full aspect-[4/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {/* Badge trạng thái */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {post.status && (
            <Badge
              variant="secondary"
              className={
                STATUS_COLORS[post.status as keyof typeof STATUS_COLORS] ||
                "bg-gray-100 text-gray-800"
              }
            >
              {STATUS_LABELS[post.status as keyof typeof STATUS_LABELS] ||
                post.status}
            </Badge>
          )}
          {post.isDraft && <Badge variant="outline">Bản nháp</Badge>}
        </div>

        {/* Số ảnh */}
        {extraCount > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
            +{extraCount}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="px-4 pb-4">
        {/* Tiêu đề */}
        <h3 className="text-base font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Địa chỉ + Ngày tạo */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{post.address}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        {/* Giá + Diện tích */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="h-3 w-3 text-green-600 shrink-0" />
            <span className="text-md font-bold text-green-700 truncate">
              {`${formatPrice(post.priceMin)} - ${formatPrice(post.priceMax)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Square className="h-3 w-3 text-blue-600 shrink-0" />
            <span className="text-xs font-medium text-blue-700 truncate">
              {post.areaMin} - {post.areaMax} m²
            </span>
          </div>
        </div>

        {/* Mô tả ngắn */}
        <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
          {(post.description || "").replace(/<[^>]*>/g, "")}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/posts/${post.slug + `-` + post._id}`)
            }
            className="gap-2 flex-1"
          >
            <Eye className="h-4 w-4" />
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
