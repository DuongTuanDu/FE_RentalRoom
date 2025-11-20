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
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const {
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();

  const navigate = useNavigate();

  const allNotifications = [...unreadNotifications, ...readNotifications].slice(0, 10);

  const handleMarkAllAsRead = async () => {
    for (const noti of unreadNotifications) {
      await markAsRead(noti._id);
    }
    refetch();
  };

  const handleClickNotification = async (noti: any) => {
    if (!noti.readBy?.some((r: any) => r.residentId === noti.recipientId)) {
      await markAsRead(noti._id);
    }
    if (noti.link) {
      navigate(noti.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
            <div className="py-8 text-center text-muted-foreground">
              Chưa có thông báo nào
            </div>
          ) : (
            allNotifications.map((noti) => (
              <DropdownMenuItem
                key={noti._id}
                onClick={() => handleClickNotification(noti)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{noti.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {noti.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(noti.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
                {!noti.readBy?.some((r: any) => r.residentId === noti._id) && (
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center font-medium"
          onClick={() => navigate("/notifications")}
        >
          Xem tất cả thông báo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}