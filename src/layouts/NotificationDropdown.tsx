// components/layout/NotificationDropdown.tsx
import { Bell, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

const typeLabels: Record<string, string> = {
  general: "Chung",
  bill: "Hóa đơn",
  maintenance: "Bảo trì",
  reminder: "Nhắc nhở",
  event: "Sự kiện",
};

const typeColors: Record<string, string> = {
  bill: "bg-green-100 text-green-800",
  maintenance: "bg-orange-100 text-orange-800",
  reminder: "bg-yellow-100 text-yellow-800",
  event: "bg-purple-100 text-purple-800",
  general: "bg-blue-100 text-blue-800",
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
  const [viewingNotification, setViewingNotification] = useState<INotification | null>(null);
  const [displayCount, setDisplayCount] = useState(8);

  const allNotifications = useMemo(() => {
    const combined = [...unreadNotifications, ...readNotifications];
    return combined.sort((a, b) =>
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
    setDisplayCount(prev => prev + 10);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
            <Bell className={`h-5 w-5 ${userRole === "resident" ? "text-white" : "text-foreground"}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            {isLoading && (
              <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
          <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
            <span className="text-lg font-semibold">Thông báo</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="max-h-96 overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Đang tải thông báo...
              </div>
            ) : (
              <>
                {displayedNotifications.map((noti) => {
                  const isUnread = !noti.readBy?.some(
                    (r: any) => r.accountId === userId || r.residentId === userId
                  );
                  const senderName = noti.createBy?.userInfo?.fullName || "Hệ thống";

                  return (
                    <DropdownMenuItem
                      key={noti._id}
                      className="p-0 cursor-pointer select-none"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => handleOpenNotificationDetail(noti)}
                    >
                      <div className="flex gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${typeColors[noti.type] || "bg-gray-400"}`}>
                            {noti.type === "bill" ? "HĐ" :
                             noti.type === "maintenance" ? "BT" :
                             noti.type === "reminder" ? "NH" :
                             noti.type === "event" ? "SK" : "TB"}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[noti.type] || "bg-gray-100 text-gray-800"}`}>
                              {typeLabels[noti.type] || "Thông báo"}
                            </span>
                            {isUnread && <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />}
                          </div>

                          <p className={`font-medium text-sm truncate ${!isUnread && "text-muted-foreground"}`}>
                            {noti.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {noti.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(noti.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </span>
                            <span>•</span>
                            <span>{senderName}</span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}

                {hasMore && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-blue-600 hover:bg-blue-50"
                      onClick={handleLoadMore}
                    >
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Xem thêm thông báo
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