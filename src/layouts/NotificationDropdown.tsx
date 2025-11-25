// components/layout/NotificationDropdown.tsx
import { Bell, Loader2 } from "lucide-react";
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

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<INotification | null>(null);

  const allNotifications = useMemo(() => {
    const combined = [...unreadNotifications, ...readNotifications];
    return combined.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [unreadNotifications, readNotifications]);

  const displayedNotifications = allNotifications.slice(0, 10);

  const handleMarkAllAsRead = async () => {
    for (const noti of unreadNotifications) {
      await markAsRead(noti._id);
    }
    refetch();
  };

  const handleOpenNotificationDetail = async (noti: INotification) => {
    const isUnread = !noti.readBy?.some((r: any) => r.accountId === userId);
    if (isUnread) {
      await markAsRead(noti._id);
    }

    setViewingNotification(noti);
    setIsViewModalOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
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

        <DropdownMenuContent align="end" className="w-96 p-0">
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
              displayedNotifications.map((noti) => {
                const isUnread = !noti.readBy?.some(
                  (r: any) => r.accountId === userId || r.residentId === userId
                );

                return (
                  <DropdownMenuItem
                    key={noti._id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onSelect={(e) => e.preventDefault()} 
                    onClick={() => handleOpenNotificationDetail(noti)}
                  >
                    <div className="flex gap-3 w-full">
                      {isUnread && (
                        <div className="mt-1.5">
                          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm font-medium ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                          {noti.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {noti.content.replace(/<[^>]*>/g, "").trim()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(noti.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>

          {allNotifications.length > 10 && (
            <DropdownMenuItem className="justify-center py-3 font-medium text-blue-600 hover:bg-blue-50">
              Xem tất cả thông báo
            </DropdownMenuItem>
          )}
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