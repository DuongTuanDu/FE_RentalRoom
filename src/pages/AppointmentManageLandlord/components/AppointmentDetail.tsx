import { useState } from "react";
import {
  useGetLandlordAppointmentDetailQuery,
  useUpdateAppointmentStatusMutation,
} from "@/services/room-appointment/room-appointment.service";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  MapPin,
  AlertCircle,
  MessageSquare,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormatDate } from "@/hooks/useFormatDate";
import { toast } from "sonner";

interface AppointmentDetailProps {
  appointmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppointmentDetail = ({
  appointmentId,
  open,
  onOpenChange,
}: AppointmentDetailProps) => {
  const formatDate = useFormatDate();

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
  const [landlordNote, setLandlordNote] = useState("");

  const { data: appointmentdata, isLoading } = useGetLandlordAppointmentDetailQuery(appointmentId!, {
    skip: !appointmentId,
  });

  const appointment = appointmentdata?.data;

  const [updateAppointmentStatus, { isLoading: isUpdating }] =
    useUpdateAppointmentStatusMutation();

  const getStatusConfig = (status: string) => {
    const statusMap = {
      pending: {
        label: "Chờ xác nhận",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
        dotColor: "bg-yellow-500",
      },
      accepted: {
        label: "Đã xác nhận",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        dotColor: "bg-green-500",
      },
      rejected: {
        label: "Đã từ chối",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        dotColor: "bg-red-500",
      },
      cancelled: {
        label: "Đã hủy",
        className: "bg-gray-50 text-gray-700 border-gray-200",
        icon: XCircle,
        dotColor: "bg-gray-500",
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      full: date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      short: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      dayOfWeek: date.toLocaleDateString("vi-VN", { weekday: "long" }),
    };
  };

  const handleOpenActionDialog = (action: "accept" | "reject") => {
    setActionType(action);
    setLandlordNote("");
    setIsActionDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!appointment || !actionType) return;

    try {
      await updateAppointmentStatus({
        id: appointment._id,
        data: {
          action: actionType,
          landlordNote: landlordNote,
        },
      }).unwrap();

      setIsActionDialogOpen(false);
      setActionType(null);
      setLandlordNote("");

      toast.success("Thành công", {
        description: `Lịch hẹn đã được ${
          actionType === "accept" ? "xác nhận" : "từ chối"
        } thành công`,
      });
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.data?.message || "Không thể cập nhật trạng thái. Vui lòng thử lại",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!appointment) return null;

  const statusConfig = getStatusConfig(appointment.status);
  const dateInfo = formatAppointmentDate(appointment.date);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-4xl h-full max-h-[90vh] overflow-y-auto p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      Chi tiết lịch hẹn xem phòng
                    </DialogTitle>
                  </div>
                </div>

                {appointment.status === "pending" && (
                  <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          Lịch hẹn đang chờ xác nhận
                        </p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Vui lòng xác nhận hoặc từ chối lịch hẹn này
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleOpenActionDialog("reject")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleOpenActionDialog("accept")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                )}
              </div>


              <div className="">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Thời gian hẹn
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Ngày hẹn</p>
                            <p className="text-lg font-bold text-blue-600 mt-1">
                              {dateInfo.short}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {dateInfo.dayOfWeek}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-indigo-100 rounded-lg">
                            <Clock className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Giờ hẹn</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">
                              {appointment.timeSlot}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-slate-600" />
                      Trọ muốn xem
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Home className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <Label className="text-xs text-slate-500 font-medium">
                            Bài đăng
                          </Label>
                          <p className="font-semibold text-slate-900 mt-1">
                            {typeof appointment.postId === "object"
                              ? appointment.postId?.title
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <Label className="text-xs text-slate-500 font-medium">
                            Tòa nhà
                          </Label>
                          <p className="font-semibold text-slate-900 mt-1">
                            {typeof appointment.buildingId === "object"
                              ? appointment.buildingId.name
                              : "—"}
                          </p>
                          {typeof appointment.buildingId === "object" &&
                            appointment.buildingId.address && (
                              <div className="flex items-start gap-2 mt-2">
                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-600">
                                  {appointment.buildingId.address}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-slate-600" />
                      Thông tin liên hệ
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-slate-500 font-medium mb-2 block">
                          Tên người liên hệ
                        </Label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <User className="w-4 h-4 text-slate-400" />
                          <p className="font-semibold text-slate-900">
                            {appointment.contactName}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-slate-500 font-medium mb-2 block">
                          Số điện thoại
                        </Label>
                        <a
                          href={`tel:${appointment.contactPhone}`}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                        >
                          <Phone className="w-4 h-4 text-green-600" />
                          <p className="font-semibold text-green-600 group-hover:text-green-700">
                            {appointment.contactPhone}
                          </p>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                  

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-slate-600" />
                      Ghi chú
                    </h3>
                    <div className="space-y-4">
                      {appointment.tenantNote ? (
                        <div>
                          <Label className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2 block">
                            Từ khách thuê
                          </Label>
                          <div className="p-4 rounded-lg border border-gray-200">
                            <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                              {appointment.tenantNote}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {appointment.landlordNote ? (
                        <div>
                          <Label className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2 block">
                            Phản hồi của bạn
                          </Label>
                          <div className="p-4 rounded-lg border border-gray-200">
                            <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                              {appointment.landlordNote}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {!appointment.tenantNote && !appointment.landlordNote && (
                        <div className="text-center py-8 text-slate-400">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Chưa có ghi chú nào</p>
                        </div>
                      )}
                    </div>
                  </div>
                 
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-slate-600" />
                      Thông tin thêm
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-slate-500 font-medium mb-1.5 block">
                          Ngày tạo
                        </Label>
                        <p className="font-medium text-slate-900 text-sm">
                          {appointment.createdAt ? formatDate(appointment.createdAt) : "—"}
                        </p>
                      </div>

                      {appointment.updatedAt &&
                        appointment.updatedAt !== appointment.createdAt && (
                          <>
                            <Separator />
                            <div>
                              <Label className="text-xs text-slate-500 font-medium mb-1.5 block">
                                Cập nhật lần cuối
                              </Label>
                              <p className="font-medium text-slate-900 text-sm">
                                {formatDate(appointment.updatedAt)}
                              </p>
                            </div>
                          </>
                        )}

                      <Separator />

                      <div>
                        <Label className="text-xs text-slate-500 font-medium mb-2 block">
                          Trạng thái hiện tại
                        </Label>
                        <Badge
                          className={`${statusConfig.className} px-3 py-1.5 text-sm font-medium border`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusConfig.dotColor} mr-2`}
                          />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {actionType === "accept" ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              {actionType === "accept" ? "Xác nhận lịch hẹn" : "Từ chối lịch hẹn"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {actionType === "accept"
                ? "Bạn có chắc chắn muốn xác nhận lịch hẹn này? Khách thuê sẽ nhận được thông báo xác nhận."
                : "Bạn có chắc chắn muốn từ chối lịch hẹn này? Hãy để lại lý do để khách thuê hiểu rõ hơn."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-600">Khách thuê:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {appointment.contactName}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-600">Ngày hẹn:</span>
                <span className="font-medium text-slate-900 text-right">
                  {formatAppointmentDate(appointment.date).full}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-600">Giờ hẹn:</span>
                <span className="font-semibold text-blue-600">
                  {appointment.timeSlot}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-semibold">
                Ghi chú {actionType === "reject" ? "(khuyến nghị)" : "(không bắt buộc)"}
              </Label>
              <Textarea
                id="note"
                placeholder={
                  actionType === "accept"
                    ? "Ví dụ: Vui lòng đến đúng giờ, gặp bảo vệ để được hướng dẫn..."
                    : "Ví dụ: Xin lỗi, thời gian này tôi không tiện. Bạn có thể chọn giờ khác..."
                }
                value={landlordNote}
                onChange={(e) => setLandlordNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className={
                actionType === "accept"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentDetail;