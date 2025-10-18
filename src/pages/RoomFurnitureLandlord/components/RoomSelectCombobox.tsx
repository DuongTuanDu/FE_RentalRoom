import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DoorOpen,
  Check,
  ChevronsUpDown,
  Search,
  Loader2,
  ChevronDown,
} from "lucide-react";
import _ from "lodash";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGetRoomsQuery } from "@/services/room/room.service";
import type { IRoom } from "@/types/room";

interface RoomSelectComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  buildingId?: string;
}

export const RoomSelectCombobox = ({
  value,
  onValueChange,
  disabled = false,
  buildingId,
}: RoomSelectComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allRooms, setAllRooms] = useState<IRoom[]>([]);

  // Debounced search function
  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setPage(1);
      }, 700),
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
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

  const { data, isLoading, isFetching } = useGetRoomsQuery({
    buildingId: buildingId || undefined,
    q: debouncedSearch,
    page: page,
    limit: 10,
  });

  useEffect(() => {
    if (data?.data) {
      setAllRooms((prev) => {
        if (page === 1) {
          return data.data;
        }
        const existingIds = new Set(prev.map((r) => r.id));
        const newRooms = data.data.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newRooms];
      });
    }
  }, [data, page]);

  const selectedRoom = allRooms.find((r) => r.id === value);
  const hasMore = data?.total ? allRooms.length < data.total : false;

  const handleSelect = (roomId: string) => {
    onValueChange(roomId === value ? "" : roomId);
    setOpen(false);
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Reset search khi đóng popover
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchInput("");
      setDebouncedSearch("");
      setPage(1);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2 truncate">
            <DoorOpen className="h-4 w-4 shrink-0" />
            {selectedRoom ? (
              <span className="truncate">Phòng {selectedRoom.roomNumber}</span>
            ) : (
              <span className="text-muted-foreground">Chọn phòng...</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 relative">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Tìm kiếm phòng..."
              value={searchInput}
              onChange={handleSearchChange}
              className="h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchInput !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Rooms List */}
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </span>
              </div>
            ) : allRooms.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchInput ? "Không tìm thấy phòng nào" : "Chưa có phòng"}
              </div>
            ) : (
              <>
                {allRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleSelect(room.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      value === room.id && "bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === room.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-medium truncate w-full text-start">
                        Phòng {room.roomNumber}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {room.area}m² • {room.maxTenants} người
                      </span>
                    </div>
                  </button>
                ))}

                {/* Manual Load More Button */}
                {hasMore && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2"
                      onClick={handleLoadMore}
                      disabled={isFetching}
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Xem thêm
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {data?.total && data.total > 0 && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              Hiển thị {allRooms.length} / {data.total} phòng
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
