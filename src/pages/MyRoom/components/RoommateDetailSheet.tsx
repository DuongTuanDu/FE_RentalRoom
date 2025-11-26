import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Crown,
  AlertCircle,
} from "lucide-react";
import { useGetRoommateDetailQuery } from "@/services/room/room.service";
import { useFormatDateNoHours } from "@/hooks/useFormatDateNoHours";

interface RoommateDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export const RoommateDetailSheet = ({
  open,
  onOpenChange,
  userId,
}: RoommateDetailSheetProps) => {
  const formatDate = useFormatDateNoHours();

  const {
    data: roommateDetail,
    isLoading,
    isError,
  } = useGetRoommateDetailQuery(userId || "", {
    skip: !userId || !open,
  });

  if (!userId) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Chi tiết người ở cùng
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (isError || !roommateDetail?.data) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Chi tiết người ở cùng
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">
              Không thể tải thông tin người ở cùng
            </p>
            <p className="text-sm text-muted-foreground">
              Vui lòng thử lại sau
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const { data: roommate } = roommateDetail;
  const userInfo = roommate.userInfo;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết người ở cùng
          </SheetTitle>
          <SheetDescription>
            Thông tin chi tiết về người ở cùng phòng
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4 pb-2">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b">
            <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
              <AvatarImage src="" alt={userInfo.fullName} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {getInitials(userInfo.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold mb-2">{userInfo.fullName}</h3>
              <div className="flex items-center justify-center gap-2">
                {roommate.isMainTenant && (
                  <Badge
                    variant="default"
                    className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Chủ phòng
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{roommate.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{userInfo.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Thông tin cá nhân</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Ngày sinh</p>
                  <p className="font-medium">
                    {formatDate(userInfo.dob)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <Badge
                    variant="outline"
                    className={
                      userInfo.gender === "male"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200"
                        : userInfo.gender === "female"
                        ? "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-200"
                        : ""
                    }
                  >
                    {userInfo.gender === "male"
                      ? "Nam"
                      : userInfo.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

