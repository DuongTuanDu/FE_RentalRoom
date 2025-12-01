// src/components/notifications/ModalViewNotification.tsx
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Info, X, MessageSquare, ArrowRight, ExternalLink } from "lucide-react";
import type { INotification } from "@/types/notification";
import Linkify from "linkify-react";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const typeLabels: Record<string, string> = {
  general: "Thông báo chung",
  bill: "Hóa đơn",
  maintenance: "Bảo trì",
  reminder: "Nhắc nhở",
  event: "Sự kiện",
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface ModalViewNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: INotification | null;
}

const ModalViewNotification = ({
  open,
  onOpenChange,
  notification,
}: ModalViewNotificationProps) => {
  if (!notification) return null;

  const user = useSelector((state: RootState) => state.auth);
  const userRole = user?.userInfo?.role;

  const isAdminOrStaff = userRole === "landlord" || userRole === "staff";

  const hasManagementLink = isAdminOrStaff && notification.link && notification.link.trim() !== "";

  const navigate = useNavigate();

  const handleNavigateToManagement = () => {
    if (notification.link) {
      navigate(notification.link);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Info className="h-6 w-6 text-blue-600" />
            Chi tiết thông báo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {notification.title}
                </h3>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(notification.createdAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {notification.createBy?.userInfo?.fullName || "Hệ thống"}
                  </span>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 h-auto"
                style={{
                  backgroundColor:
                    notification.type === "bill"
                      ? "#dcfce7"
                      : notification.type === "maintenance"
                      ? "#ffedd5"
                      : notification.type === "reminder"
                      ? "#fef9c3"
                      : notification.type === "event"
                      ? "#f3e8ff"
                      : "#dbeafe",
                  color:
                    notification.type === "bill"
                      ? "#166534"
                      : notification.type === "maintenance"
                      ? "#9a3412"
                      : notification.type === "reminder"
                      ? "#854d0e"
                      : notification.type === "event"
                      ? "#6b21a8"
                      : "#1d4ed8",
                }}
              >
                {typeLabels[notification.type] || "Thông báo"}
              </Badge>
            </div>
          </div>

          {/* Nội dung */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              Nội dung thông báo
            </h4>
            <div className="p-4 border rounded-lg bg-gray-50 prose prose-sm max-w-none whitespace-pre-wrap">
            <Linkify
                    options={{
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-600 underline hover:text-blue-800 font-medium",
                    truncate: 60,
                    }}
                >
                    {notification.content || "Nội dung thông báo sẽ hiển thị ở đây khi bạn nhập..."}
                </Linkify>
            </div>
           
          </div>

          {notification.images && notification.images.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-gray-800">Hình ảnh</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {notification.images.map((img, index) => (
                  <a
                    key={index}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all hover:shadow-md"
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-200 flex justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Được gửi lúc {formatTime(notification.createdAt)}</span>
            </div>
            {hasManagementLink && (
              <div className="">
                <Button
                  onClick={handleNavigateToManagement}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
                >
                    <ExternalLink className="h-5 w-5" />
                    Xem chi tiết tại trang quản lý
                    <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalViewNotification;