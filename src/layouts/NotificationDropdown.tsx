import {
  Bell,
  Loader2,
  ChevronDown,
  Receipt,
  Wrench,
  Calendar,
  AlertCircle,
  MessageSquare,
  Check,
  Clock,
  User,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotification";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import type { RootState } from "@/store/store";
import type { INotification } from "@/types/notification";
import ModalViewNotification from "@/pages/NotificationManageLandlord/components/ModalViewNotification";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  bill: {
    icon: <Receipt className="h-5 w-5" />,
    label: "Hóa đơn",
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  maintenance: {
    icon: <Wrench className="h-5 w-5" />,
    label: "Bảo trì",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  reminder: {
    icon: <AlertCircle className="h-5 w-5" />,
    label: "Nhắc nhở",
    color: "#8B5CF6",
    bg: "#EDE9FE",
  },
  event: {
    icon: <Calendar className="h-5 w-5" />,
    label: "Sự kiện",
    color: "#10B981",
    bg: "#D1FAE5",
  },
  general: {
    icon: <Newspaper className="h-5 w-5" />,
    label: "Thông báo chung",
    color: "#3B82F6",
    bg: "#DBEAFE",
  },
};

export default function NotificationDropdown() {
  const {
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    refetch,
  } = useNotifications();

  const user = useSelector((state: RootState) => state.auth);
  const userId = user?.userInfo?._id;
  const userRole = user?.userInfo?.role;

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] =
    useState<INotification | null>(null);
  const [displayCount, setDisplayCount] = useState(8);
  const [isOpen, setIsOpen] = useState(false);

  const allNotifications = useMemo(() => {
    const combined = [...unreadNotifications, ...readNotifications];
    return combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [unreadNotifications, readNotifications]);

  const displayedNotifications = allNotifications.slice(0, displayCount);
  const hasMore = allNotifications.length > displayCount;

  const handleMarkAllAsRead = async () => {
    for (const noti of unreadNotifications) {
      await markAsRead(noti._id);
    }
    refetch();
  };

  const handleOpenNotificationDetail = async (noti: INotification) => {
    const isUnread = !noti.readBy?.some(
      (r: any) => r.accountId === userId || r.residentId === userId
    );
    if (isUnread) {
      await markAsRead(noti._id);
    }
    setViewingNotification(noti);
    setIsViewModalOpen(true);
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  const getSenderName = (noti: INotification) => {
    if (noti.createBy?.userInfo?.fullName) {
      return noti.createBy.userInfo.fullName;
    }
    if (noti.createBy?.username) {
      return noti.createBy.username;
    }

    switch (noti.createByRole) {
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

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative",
              userRole === "resident"
                ? "text-white hover:text-white/80"
                : "text-foreground"
            )}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            {isLoading && (
              <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-primary" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-96 max-h-[80vh] p-0"
          sideOffset={8}
        >
          {/* Header */}
          <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-semibold">Thông báo</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Đọc tất cả
              </Button>
            )}
          </DropdownMenuLabel>

          {/* Content */}
          <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Không có thông báo</p>
                <p className="text-xs mt-1">Mọi thứ đều đã được cập nhật</p>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            ) : (
              <>
                {displayedNotifications.map((noti) => {
                  const isUnread = !noti.readBy?.some(
                    (r: any) =>
                      r.accountId === userId || r.residentId === userId
                  );
                  const senderName = getSenderName(noti);
                  const config = typeConfig[noti.type] || typeConfig.general;

                  return (
                    <DropdownMenuItem
                      key={noti._id}
                      className="p-0 cursor-pointer border-b last:border-b-0"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => handleOpenNotificationDetail(noti)}
                    >
                      <div
                        className={cn(
                          "flex gap-3 w-full px-4 py-3 hover:bg-accent/50 transition-colors",
                          isUnread && "bg-blue-50/50"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: config.bg }}
                          >
                            <div style={{ color: config.color }}>
                              {config.icon}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                "font-medium text-sm truncate flex-1",
                                !isUnread && "text-muted-foreground"
                              )}
                            >
                              {noti.title}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(noti.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {noti.content}
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                            <User className="h-3 w-3" />
                            <span>{senderName}</span>
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {isUnread && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}

                {/* Load more */}
                {hasMore && (
                  <div className="sticky bottom-0 bg-white p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleLoadMore}
                    >
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Xem thêm ({allNotifications.length - displayCount})
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModalViewNotification
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) setViewingNotification(null);
        }}
        notification={viewingNotification}
      />
    </>
  );
}
