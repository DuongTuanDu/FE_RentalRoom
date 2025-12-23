import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, Phone, Mail, Calendar, MapPin, Crown, UserX, LogOut } from "lucide-react";
import type { IRoommate } from "@/types/roommate";
import { useFormatDateNoHours } from "@/hooks/useFormatDateNoHours";

interface RoommateCardProps {
  roommate: IRoommate;
  onViewDetail?: (userId: string) => void;
  onRemove?: (roommate: IRoommate) => void;
  canRemove?: boolean;
  isRemoving?: boolean;
  onLeave?: () => void;
  isLeaving?: boolean;
}

export const RoommateCard = ({
  roommate,
  onViewDetail,
  onRemove,
  canRemove = false,
  isRemoving = false,
  onLeave,
  isLeaving = false,
}: RoommateCardProps) => {
  const formatDate = useFormatDateNoHours();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden py-0">
      <div className="p-5 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
            <AvatarImage src={roommate.avatar} alt={roommate.fullName} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {getInitials(roommate.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg truncate">{roommate.fullName}</h3>
              {roommate.isMainTenant && (
                <Badge
                  variant="default"
                  className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Chủ phòng
                </Badge>
              )}
              {roommate.isMe && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Bạn
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{roommate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{roommate.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDate(roommate.dob)}</span>
              </div>
              {roommate.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{roommate.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Badge
                  variant="outline"
                  className={
                    roommate.gender === "male"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : roommate.gender === "female"
                      ? "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                      : ""
                  }
                >
                  {roommate.gender === "male"
                    ? "Nam"
                    : roommate.gender === "female"
                    ? "Nữ"
                    : "Khác"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {onViewDetail && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewDetail(roommate._id)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Chi tiết
                </Button>
              )}
              {canRemove && onRemove && !roommate.isMe && !roommate.isMainTenant && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => onRemove(roommate)}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Xóa
                    </>
                  )}
                </Button>
              )}
              {onLeave && !roommate.isMainTenant && roommate.isMe && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsLeaveDialogOpen(true)}
                    disabled={isLeaving}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Rời phòng
                  </Button>
                  <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận rời phòng</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn rời khỏi phòng này không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLeaving}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onLeave();
                            setIsLeaveDialogOpen(false);
                          }}
                          disabled={isLeaving}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isLeaving ? (
                            <>
                              <Spinner className="h-4 w-4 mr-2" />
                              Đang rời...
                            </>
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              Xác nhận rời phòng
                            </>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

