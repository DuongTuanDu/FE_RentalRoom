import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus, Search, User, Mail, Phone, Check } from "lucide-react";
import {
  useGetRoommateSearchQuery,
  useAddRoommateMutation,
} from "@/services/room/room.service";
import { toast } from "sonner";
import _ from "lodash";

interface AddRoommateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  onSuccess?: () => void;
}

export const AddRoommateDialog = ({
  open,
  onOpenChange,
  roomId,
  onSuccess,
}: AddRoommateDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Debounced search function
  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
      }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  // Call API with debounced search query
  const { data: searchData, isLoading: isSearching } =
    useGetRoommateSearchQuery(
      { q: debouncedSearch.trim() || "" },
      {
        skip: !open || debouncedSearch.trim().length < 2, // Skip if dialog closed or search too short
      }
    );

  const [addRoommate, { isLoading: isAdding }] = useAddRoommateMutation();

  const users = searchData?.data ?? [];

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAdd = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người để thêm");
      return;
    }

    try {
      await addRoommate({
        roomId,
        userIds: selectedUserIds,
      }).unwrap();
      toast.success("Đã thêm người ở cùng vào phòng");
      setSelectedUserIds([]);
      setSearchQuery("");
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Không thể thêm người ở cùng. Vui lòng thử lại."
      );
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedUserIds([]);
      setSearchQuery("");
      setDebouncedSearch("");
      debouncedSetSearch.cancel();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Thêm người ở cùng
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm và chọn người dùng để thêm vào phòng của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Tìm theo email (tối thiểu 2 ký tự)..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* User List */}
          <div className="space-y-2">
            <Label>
              Danh sách người dùng{" "}
              {selectedUserIds.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  Đã chọn: {selectedUserIds.length}
                </Badge>
              )}
            </Label>
            <div className="border rounded-lg max-h-[300px] overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : debouncedSearch.trim().length < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    Nhập ít nhất 2 ký tự để tìm kiếm
                  </p>
                </div>
              ) : users.length > 0 ? (
                <div className="divide-y">
                  {users.map((user) => {
                    const isSelected = selectedUserIds.includes(user._id);
                    return (
                      <div
                        key={user._id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10" : ""
                        }`}
                        onClick={() => toggleUserSelection(user._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`p-2 rounded-full ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">
                                {user.fullName}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{user.email}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{user.phoneNumber}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isSelected ? (
                              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Check className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    Không tìm thấy người dùng nào với từ khóa "{debouncedSearch}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedUserIds.length === 0 || isAdding}
            className="gap-2"
          >
            {isAdding ? (
              <>
                <Spinner className="h-4 w-4" />
                Đang thêm...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Thêm ({selectedUserIds.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

