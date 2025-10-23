import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useGetPostsQuery } from "@/services/post/post.service";
import { STATUS_COLORS, STATUS_LABELS } from "../const/data";
import { 
  MapPin, 
  DollarSign, 
  Square, 
  Eye,
  Image as ImageIcon,
  FileText,
  Loader2
} from "lucide-react";

interface PostDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
}

export const PostDetail = ({
  open,
  onOpenChange,
  postId,
}: PostDetailProps) => {
  const [post, setPost] = useState<any>(null);
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  const { data: postsData } = useGetPostsQuery();

  useEffect(() => {
    if (postsData?.data && postId) {
      const foundPost = postsData.data.find(p => p._id === postId);
      setPost(foundPost || null);
    }
  }, [postsData, postId]);

  if (!post) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Chi tiết Bài đăng</SheetTitle>
            <SheetDescription>
              Đang tải thông tin bài đăng...
            </SheetDescription>
          </SheetHeader>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết Bài đăng
          </SheetTitle>
          <SheetDescription>
            Thông tin chi tiết về bài đăng
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 px-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={STATUS_COLORS[post.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800"}
                >
                  {STATUS_LABELS[post.status as keyof typeof STATUS_LABELS] || post.status}
                </Badge>
                {post.isDraft && (
                  <Badge variant="outline">Bản nháp</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatPrice(post.price)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span>{post.area} m²</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{post.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            </CardContent>
          </Card>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Hình ảnh ({post.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {post.images.map((imageUrl: string, index: number) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-md border">
                        <img
                          src={imageUrl}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={() => window.open(imageUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                            Xem ảnh
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin khác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                <span className="text-sm">{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cập nhật lần cuối:</span>
                <span className="text-sm">{formatDate(post.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Slug:</span>
                <span className="text-sm font-mono">{post.slug}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
