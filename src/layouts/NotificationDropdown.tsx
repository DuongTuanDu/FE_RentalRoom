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
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export default function NotificationDropdown() {
  const {
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    refetch,
  } = useNotifications();

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth);
  const userId = user?.userInfo?._id;

  const [showAll, setShowAll] = useState(false); 
  const allNotifications = [...unreadNotifications, ...readNotifications];
  const displayedNotifications = showAll ? allNotifications : allNotifications.slice(0, 5); 

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
          {displayedNotifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Chưa có thông báo nào
            </div>
          ) : (
            displayedNotifications.map((noti) => (
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
                {!noti.readBy?.some((r: any) => r.accountId === userId) && (
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

       {allNotifications.length > 5 && !showAll && (
            <DropdownMenuItem
                className="justify-center font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                }}
            >
                Xem thêm thông báo
            </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}