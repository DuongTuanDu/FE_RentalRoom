import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import {
  Building2,
  MapPin,
  FileText,
  Zap,
  Droplet,
  Calendar,
  Star,
  Trash2,
  MessageCircle,
} from "lucide-react";

import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { IBuilding } from "@/types/building";

import {
  useGetBuildingRatingsQuery,
  useDeleteRatingByLandlordMutation,
} from "@/services/building-rating/rating.service";

interface DrawerBuildingDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building: IBuilding | null;
}

const getWIndexTypeLabel = (type: string) => {
  const labels = { byNumber: "Theo chỉ số", byPerson: "Theo đầu người" };
  return labels[type as keyof typeof labels] || type;
};

const getEIndexTypeLabel = (type: string) => {
  const labels = { byNumber: "Theo chỉ số", included: "Đã bao gồm trong giá thuê" };
  return labels[type as keyof typeof labels] || type;
};

const DrawerBuildingDetail = ({
  open,
  onOpenChange,
  building,
}: DrawerBuildingDetailProps) => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  const buildingId = building?._id;
  const { data: ratingsData, isLoading: loadingRatings, refetch } = useGetBuildingRatingsQuery(
    { buildingId: buildingId!, limit: 50 },
    { skip: !open || !buildingId }
  );

  const [deleteRating] = useDeleteRatingByLandlordMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const ratings = ratingsData?.data?.ratings || [];
  const totalRatings = ratingsData?.data?.summary?.totalRatings || 0;
  const averageRating = ratingsData?.data?.summary?.averageRating || 0;

  const handleDeleteRating = async (ratingId: string) => {
    try {
      await deleteRating(ratingId).unwrap();
      toast.success("Đã xóa đánh giá thành công");
      refetch();
    } catch (err) {
      toast.error("Không thể xóa đánh giá. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (value: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (!building) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold">
                  {building.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {building.address}
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FileText className="w-4 h-4" />
              Thông tin cơ bản
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Tên tòa nhà
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {building.name}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Địa chỉ
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {building.address}
                </p>
              </div>
              {building.description && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Mô tả
                    </label>
                    <p className="text-base text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      {building.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Thông tin điện */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
              <Zap className="w-4 h-4" />
              Thông tin điện
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-amber-700 dark:text-amber-400 mr-2">
                    Loại chỉ số
                  </label>
                  <Badge
                    variant="outline"
                    className="mt-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                  >
                    {getEIndexTypeLabel(building.eIndexType)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-amber-700 dark:text-amber-400">
                    Đơn giá
                  </label>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {formatPrice(building.ePrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin nước */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
              <Droplet className="w-4 h-4" />
              Thông tin nước
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-blue-700 dark:text-blue-400 mr-2">
                    Loại chỉ số
                  </label>
                  <Badge
                    variant="outline"
                    className="mt-2 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300"
                  >
                    {getWIndexTypeLabel(building.wIndexType)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-blue-700 dark:text-blue-400">
                    Đơn giá
                  </label>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {formatPrice(building.wPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* === ĐÁNH GIÁ TÒA NHÀ – PHIÊN BẢN GỌN ĐẸP === */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Đánh giá từ cư dân ({totalRatings})
            </h3>
            {averageRating > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full text-sm">
                <span className="font-bold">{averageRating.toFixed(1)}</span>
                <div className="flex">{renderStars(Math.round(averageRating))}</div>
              </div>
            )}
          </div>

          {loadingRatings ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : ratings.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có đánh giá nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ratings.map((r) => (
                <div
                  key={r._id}
                  className="rounded-lg border bg-card p-4 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={r.user.avatar} />
                      <AvatarFallback>{r.user.fullName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm">{r.user.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex">{renderStars(r.rating)}</div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {r.rating}.0 • {formatDate(r.createdAt)}
                            </span>
                          </div>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa đánh giá?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Đánh giá này sẽ bị xóa vĩnh viễn và không thể khôi phục.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRating(r._id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {r.comment && (
                        <p className="text-sm text-foreground leading-relaxed">{r.comment}</p>
                      )}

                      {r.images && r.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Review"
                              className="h-20 w-20 rounded-md object-cover border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Metadata */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4" />
              Thông tin hệ thống
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Ngày tạo
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(building.createdAt)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(building.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DrawerBuildingDetail;
