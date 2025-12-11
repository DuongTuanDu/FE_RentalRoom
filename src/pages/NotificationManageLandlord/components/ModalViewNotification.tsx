import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
  Receipt,
  Wrench,
  AlertCircle,
  Newspaper,
  Link2,
} from "lucide-react";
import type { INotification } from "@/types/notification";
import Linkify from "linkify-react";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const typeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  bill: {
    icon: <Receipt className="h-3 w-3" />,
    label: "Hóa đơn",
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  maintenance: {
    icon: <Wrench className="h-3 w-3" />,
    label: "Bảo trì",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  reminder: {
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Nhắc nhở",
    color: "#8B5CF6",
    bg: "#EDE9FE",
  },
  event: {
    icon: <Calendar className="h-3 w-3" />,
    label: "Sự kiện",
    color: "#10B981",
    bg: "#D1FAE5",
  },
  general: {
    icon: <Newspaper className="h-3 w-3" />,
    label: "Thông báo chung",
    color: "#3B82F6",
    bg: "#DBEAFE",
  },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
  const navigate = useNavigate();

  const isAdminOrStaff = userRole === "landlord" || userRole === "staff";
  const hasManagementLink =
    isAdminOrStaff && notification.link && notification.link.trim() !== "";

  const config = typeConfig[notification.type] || typeConfig.general;

  const getSenderName = () => {
    if (notification.createBy?.userInfo?.fullName) {
      return notification.createBy.userInfo.fullName;
    }
    if (notification.createBy?.username) {
      return notification.createBy.username;
    }

    switch (notification.createByRole) {
      case "landlord":
        return "Chủ trọ";
      case "staff":
        return "Nhân viên";
      case "resident":
        return "Cư dân";
      case "system":
        return "Hệ thống";
      default:
        return "Ban quản lý";
    }
  };

  const senderName = getSenderName();
  const senderAvatar = notification.createBy?.userInfo?.avatar;

  const handleNavigateToManagement = () => {
    if (notification.link) {
      navigate(notification.link);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-center">
            Chi tiết thông báo
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            {/* Title Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border-0"
                  style={{
                    backgroundColor: config.bg,
                    color: config.color,
                  }}
                >
                  {config.icon}
                  {config.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDate(notification.createdAt)}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 leading-7">
                {notification.title}
              </h3>
            </div>

            {/* Sender Info */}
            <div className="flex items-center gap-3">
              {senderAvatar ? (
                <img
                  src={senderAvatar}
                  alt={senderName}
                  className="w-9 h-9 rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Người gửi
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {senderName}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <Linkify
                options={{
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className:
                    "text-blue-600 underline hover:text-blue-800 font-medium",
                  truncate: 60,
                }}
              >
                <p className="text-base leading-7 text-gray-700 whitespace-pre-wrap">
                  {notification.content ||
                    "Nội dung thông báo sẽ hiển thị ở đây..."}
                </p>
              </Linkify>
            </div>

            {/* Link Section */}
            {hasManagementLink && (
              <div className="mt-4">
                <Button
                  onClick={handleNavigateToManagement}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium h-11 rounded-xl"
                  variant="outline"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="flex-1 text-left truncate">
                    {notification.link}
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDateTime(notification.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Images Section */}
          {notification.images && notification.images.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Hình ảnh đính kèm ({notification.images.length})
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {notification.images.map((img, index) => (
                  <a
                    key={index}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalViewNotification;
