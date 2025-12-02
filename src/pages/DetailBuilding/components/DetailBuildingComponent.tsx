import { useState} from "react";
import {
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Zap,
  Droplets,
  ScrollText,
  Star,
  MessageCircle,
  AlertCircle,
  Home,
  X,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useGetBuildingByIdQuery } from "@/services/building/building.service";
import { useGetRegulationsQuery } from "@/services/regulation/regulation.service";
import {
  useGetBuildingRatingsQuery,
  useCreateOrUpdateRatingMutation,
  useDeleteMyRatingMutation,
} from "@/services/building-rating/rating.service";
import { useGetBuildingservicesQuery } from "@/services/building-services/building-services.service";
import { useSelector } from "react-redux";

interface BuildingDetailModalProps {
  buildingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BuildingDetailModal = ({
  buildingId,
  open,
  onOpenChange,
}: BuildingDetailModalProps) => {
  const {
    data: buildingData,
    isLoading: loadingBuilding,
    isFetching: fetchingBuilding,
  } = useGetBuildingByIdQuery(buildingId, { skip: !open || !buildingId });

  const { data: regulationsData, isLoading: loadingRegs } =
    useGetRegulationsQuery({ buildingId }, { skip: !open || !buildingId });

  const {
    data: ratingsData,
    isLoading: loadingRatings,
    refetch: refetchRatings,
  } = useGetBuildingRatingsQuery(
    { buildingId, limit: 50 },
    { skip: !open || !buildingId }
  );

  const { data: servicesData, isLoading: loadingServices } =
    useGetBuildingservicesQuery({ buildingId }, { skip: !open || !buildingId });

  const [createOrUpdateRating, { isLoading: isSubmittingRating }] =
    useCreateOrUpdateRatingMutation();
  const [deleteRating, { isLoading: isDeleting }] = useDeleteMyRatingMutation();

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [ratingToDelete, setRatingToDelete] = useState<string | null>(null);

  const user = useSelector((state: any) => state.auth.userInfo);

  const building = buildingData;
  const regulations = regulationsData || [];
  const ratings = ratingsData?.data?.ratings || [];
  const totalRatings = ratingsData?.data?.summary?.totalRatings || 0;
  const averageRating = ratingsData?.data?.summary?.averageRating || 0;

  const myRating = ratings.find((r) => r.user._id === user?._id);
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const openRatingModal = () => {
    if (myRating) {
      setRating(myRating.rating);
      setComment(myRating.comment || "");
      setOldImages(myRating.images || []);
      setImages([]);
      setImagesToDelete([]);
    } else {
      setRating(5);
      setComment("");
      setOldImages([]);
      setImages([]);
      setImagesToDelete([]);
    }
    setIsRatingOpen(true);
  };

  const closeRatingModal = () => {
    setIsRatingOpen(false);
    setRating(5);
    setComment("");
    setImages([]);
  };

  const handleSubmitRating = async () => {
    if (rating < 1) {
      toast.error("Vui lòng chọn số sao");
      return;
    }

    const formData = new FormData();
    formData.append("buildingId", buildingId);
    formData.append("rating", rating.toString());
    if (comment.trim()) formData.append("comment", comment.trim());

    images.forEach((img) => formData.append("images", img));

    imagesToDelete.forEach((url) => formData.append("imagesToDelete", url));

    oldImages.forEach((url) => formData.append("keepImages", url));

    try {
      await createOrUpdateRating(formData).unwrap();
      toast.success(
        myRating ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!"
      );
      closeRatingModal();
      refetchRatings();
    } catch (err) {
      console.error(err);
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
    }
  };

  const handleDeleteRating = async () => {
    if (!ratingToDelete) return;
    try {
      await deleteRating(ratingToDelete).unwrap();
      toast.success("Đã xóa đánh giá của bạn");
      setRatingToDelete(null);
      refetchRatings();
    } catch {
      toast.error("Không thể xóa đánh giá. Vui lòng thử lại.");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const renderStars = (value: number) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  const getEIndexLabel = (type?: string) => {
    const map: Record<string, string> = {
      byNumber: "Theo số điện/nước",
      byPerson: "Theo đầu người",
      included: "Bao gồm trong tiền phòng",
    };
    return type ? map[type] || type : "Chưa thiết lập";
  };

  if (loadingBuilding || fetchingBuilding) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết tòa nhà</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Spinner className="h-12 w-12" />
            <p className="text-muted-foreground">Đang tải thông tin...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!building) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết tòa nhà</DialogTitle>
          </DialogHeader>
          <div className="text-center py-32">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive opacity-70" />
            <p className="text-lg font-medium text-destructive">
              Không tìm thấy tòa nhà
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-5xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p  p-6 pb-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              Chi tiết tòa nhà
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[80vh] px-6 py-6">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-primary flex items-center gap-3 mb-4">
                  <Home className="w-9 h-9" />
                  {building.name}
                </h1>
                <div className="space-y-3 text-foreground">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Địa chỉ:
                      </span>{" "}
                      <span className="font-medium">
                        {building.address || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Chủ trọ:
                      </span>{" "}
                      <span className="font-medium text-primary">
                        {building.landlordId?.userInfo?.fullName ||
                          "Chưa có thông tin"}
                      </span>
                    </div>
                  </div>
                  {(building.landlordId?.email ||
                    building.landlordId?.userInfo?.phoneNumber) && (
                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                      {building.landlordId?.userInfo?.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {building.landlordId.userInfo.phoneNumber}
                        </div>
                      )}
                      {building.landlordId?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {building.landlordId.email}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Giá điện nước */}
              <div className="py-4 border-b">
                <h3 className="text-lg font-semibold mb-4">Giá điện nước</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex gap-2 py-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="w-4 h-4 text-yellow-500" /> Điện:
                    </span>
                    <span className="font-medium">
                      {building.ePrice?.toLocaleString()}đ{" "}
                      <span className="text-xs text-muted-foreground">
                        ({getEIndexLabel(building.eIndexType)})
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2 py-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Droplets className="w-4 h-4 text-blue-500" /> Nước:
                    </span>
                    <span className="font-medium">
                      {building.wPrice?.toLocaleString()}đ{" "}
                      <span className="text-xs text-muted-foreground">
                        ({getEIndexLabel(building.wIndexType)})
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Dịch vụ đi kèm */}
              <div className="py-4 border-b">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-4m-8 0H3m6 0h6"
                    />
                  </svg>
                  Dịch vụ đi kèm
                </h3>
                {loadingServices ? (
                  <Spinner className="h-5 w-5" />
                ) : servicesData && servicesData.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {servicesData
                      .filter((s) => !s.isDeleted)
                      .map((service) => (
                        <Badge
                          key={service._id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {service.label || service.name}
                          {service.chargeType === "perPerson" &&
                            " (theo người)"}
                          {service.chargeType === "perRoom" && " (theo phòng)"}
                        </Badge>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Không có dịch vụ bổ sung
                  </p>
                )}
              </div>

              {/* Nội quy */}
              <div className="py-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ScrollText className="w-5 h-5" />
                  Nội quy tòa nhà
                </h3>
                {loadingRegs ? (
                  <div className="text-center">
                    <Spinner className="h-5 w-5" />
                  </div>
                ) : regulations.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Chưa có nội quy nào
                  </p>
                ) : (
                  <ul className="space-y-4 text-sm">
                    {regulations.map((reg) => (
                      <li
                        key={reg._id}
                        className={`pb-4 border-b last:border-0 ${
                          reg.status !== "active" ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{reg.title}</p>
                            {reg.description && (
                              <div
                                className="mt-1 text-muted-foreground text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: reg.description,
                                }}
                              />
                            )}
                          </div>
                          <div className="text-right text-xs">
                            <Badge
                              variant={
                                reg.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {reg.status === "active" ? "Áp dụng" : "Ngừng"}
                            </Badge>
                            {reg.effectiveFrom && (
                              <p className="text-muted-foreground mt-1">
                                {formatDate(reg.effectiveFrom)}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Đánh giá từ người thuê ({totalRatings})
                  </h3>

                  <div className="flex items-center gap-4">
                    {averageRating > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                        <span className="text-2xl font-bold">
                          {averageRating.toFixed(1)}
                        </span>
                        <div className="flex">
                          {renderStars(Math.round(averageRating))}
                        </div>
                      </div>
                    )}

                    {!myRating ? (
                      <Button onClick={openRatingModal} size="sm">
                        <Star className="w-4 h-4 mr-1" />
                        Viết đánh giá
                      </Button>
                    ) : (
                      <Button
                        onClick={openRatingModal}
                        size="sm"
                        variant="outline"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Sửa đánh giá của bạn
                      </Button>
                    )}
                  </div>
                </div>

                {loadingRatings ? (
                  <div className="text-center py-8">
                    <Spinner />
                  </div>
                ) : ratings.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Chưa có đánh giá nào</p>
                    {!myRating && (
                      <Button
                        onClick={openRatingModal}
                        className="mt-4"
                        variant="outline"
                      >
                        Trở thành người đầu tiên đánh giá
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {ratings.map((r) => (
                      <Card key={r._id}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <Avatar>
                              <AvatarImage src={r.user.avatar} />
                              <AvatarFallback>
                                {r.user.fullName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold">
                                  {r.user.fullName}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(r.createdAt)}
                                  </span>

                                  {user?._id === r.user._id && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                          onClick={() =>
                                            setRatingToDelete(r._id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Xóa đánh giá này?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Hành động này không thể hoàn tác.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel
                                            onClick={() =>
                                              setRatingToDelete(null)
                                            }
                                          >
                                            Hủy
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={handleDeleteRating}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            disabled={isDeleting}
                                          >
                                            {isDeleting
                                              ? "Đang xóa..."
                                              : "Xóa vĩnh viễn"}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-1 mb-3">
                                {renderStars(r.rating)}
                                <span className="font-medium">
                                  {r.rating}.0
                                </span>
                              </div>

                              {r.comment && (
                                <p className="text-muted-foreground">
                                  {r.comment}
                                </p>
                              )}

                              {r.images && r.images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                                  {r.images.map((img, i) => (
                                    <img
                                      key={i}
                                      src={img}
                                      alt="Review"
                                      className="rounded-lg object-cover h-28 w-full"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRatingOpen}
        onOpenChange={(open) => !open && closeRatingModal()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {myRating ? "Sửa đánh giá của bạn" : "Đánh giá tòa nhà này"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label>Chọn số sao</Label>
              <div className="flex justify-center gap-3 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star
                      className={`w-12 h-12 transition-all ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400 scale-110"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Bình luận (không bắt buộc)</Label>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2 min-h-32"
              />
            </div>

            <div>
              <Label>Ảnh đánh giá</Label>

              {oldImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Ảnh hiện tại:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {oldImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt="Current"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-dashed border-gray-300"
                        />
                        <button
                          onClick={() => {
                            setOldImages((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            );
                            setImagesToDelete((prev) => [...prev, url]);
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  e.target.files && setImages(Array.from(e.target.files))
                }
                className="mt-4"
              />

            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRatingModal}>
              Hủy
            </Button>
            <Button onClick={handleSubmitRating} disabled={isSubmittingRating}>
              {isSubmittingRating
                ? "Đang gửi..."
                : myRating
                ? "Cập nhật đánh giá"
                : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
