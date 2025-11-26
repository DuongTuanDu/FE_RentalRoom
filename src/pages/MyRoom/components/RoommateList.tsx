import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Users, UserPlus, AlertCircle } from "lucide-react";
import {
  useGetRoommatesByRoomIdQuery,
  useRemoveRoommateMutation,
} from "@/services/room/room.service";
import { RoommateCard } from "./RoommateCard";
import { AddRoommateDialog } from "./AddRoommateDialog";
import { RoommateDetailSheet } from "./RoommateDetailSheet";
import { DeleteRoommateDialog } from "./DeleteRoommateDialog";
import { toast } from "sonner";
import type { IRoommate } from "@/types/roommate";

interface RoommateListProps {
  roomId: string;
  maxTenants: number;
  currentCount: number;
}

export const RoommateList = ({
  roomId,
  maxTenants,
  currentCount,
}: RoommateListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roommateToDelete, setRoommateToDelete] = useState<IRoommate | null>(null);

  const {
    data: roommateData,
    isLoading,
    error,
    refetch,
  } = useGetRoommatesByRoomIdQuery(roomId, {
    skip: !roomId,
  });

  const [removeRoommate, { isLoading: isRemoving }] = useRemoveRoommateMutation();

  const handleOpenDeleteDialog = (roommate: IRoommate) => {
    setRoommateToDelete(roommate);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roommateToDelete) return;

    setRemovingUserId(roommateToDelete._id);
    try {
      await removeRoommate({
        roomId,
        userIds: [roommateToDelete._id],
      }).unwrap();
      toast.success("Đã xóa người ở cùng khỏi phòng");
      setIsDeleteDialogOpen(false);
      setRoommateToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Không thể xóa người ở cùng. Vui lòng thử lại."
      );
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleViewDetail = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailSheetOpen(true);
  };

  const canAddMore = roommateData?.data?.canAddMore ?? false;
  const roommates = roommateData?.data?.roommates ?? [];
  // Determine isMainTenant from API response
  const finalIsMainTenant = roommateData?.data?.isMainTenant ?? false;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Người ở cùng
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Người ở cùng
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">
              Không thể tải danh sách người ở cùng
            </p>
            <p className="text-sm text-muted-foreground">
              Vui lòng thử lại sau
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Người ở cùng
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="shadow-sm">
                {currentCount}/{maxTenants}
              </Badge>
              {finalIsMainTenant && canAddMore && (
                <Button
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Thêm người
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          {roommates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {roommates.map((roommate: IRoommate) => (
                <RoommateCard
                  key={roommate._id}
                  roommate={roommate}
                  onViewDetail={handleViewDetail}
                  onRemove={finalIsMainTenant ? handleOpenDeleteDialog : undefined}
                  canRemove={finalIsMainTenant && !roommate.isMainTenant}
                  isRemoving={isRemoving && removingUserId === roommate._id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm mb-4">Chưa có người ở cùng nào</p>
              {finalIsMainTenant && canAddMore && (
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Thêm người ở cùng
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddRoommateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        roomId={roomId}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refetch();
        }}
      />

      <RoommateDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) {
            setSelectedUserId(null);
          }
        }}
        userId={selectedUserId}
      />

      <DeleteRoommateDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setRoommateToDelete(null);
          }
        }}
        roommate={roommateToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isRemoving}
      />
    </>
  );
};

