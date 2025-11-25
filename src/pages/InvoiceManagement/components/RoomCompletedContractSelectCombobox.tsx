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
import { useGetRoomsCompletedContractQuery } from "@/services/invoice/invoice.service";
import type { IRoomCompletedContract } from "@/types/invoice";

interface RoomCompletedContractSelectComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  buildingId?: string;
}

interface RoomData {
  _id: string;
  roomNumber: string;
  contractId: string;
  area?: number;
  maxTenants?: number;
}

export const RoomCompletedContractSelectCombobox = ({
  value,
  onValueChange,
  disabled = false,
  buildingId,
}: RoomCompletedContractSelectComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allRooms, setAllRooms] = useState<RoomData[]>([]);

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

  // Reset rooms when buildingId changes
  useEffect(() => {
    setAllRooms([]);
    setPage(1);
    if (!buildingId) {
      setSearchInput("");
      setDebouncedSearch("");
    }
  }, [buildingId]);

  // Only fetch when buildingId is provided
  const { data, isLoading, isFetching } = useGetRoomsCompletedContractQuery(
    {
      buildingId: buildingId || undefined,
      page: page,
      limit: 10,
    },
    {
      skip: !buildingId, // Skip query if no buildingId
    }
  );

  // Extract unique rooms from completed contracts
  useEffect(() => {
    if (data?.data) {
      const roomMap = new Map<string, RoomData>();
      
      // Extract rooms from completed contracts
      data.data.forEach((item: IRoomCompletedContract) => {
        if (item.room && !roomMap.has(item.room._id)) {
          roomMap.set(item.room._id, {
            _id: item.room._id,
            roomNumber: item.room.roomNumber,
            contractId: item.contractId,
          });
        }
      });

      const newRooms = Array.from(roomMap.values());
      
      // Filter by search if needed
      const filteredRooms = debouncedSearch
        ? newRooms.filter((room) =>
            room.roomNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : newRooms;

      setAllRooms((prev) => {
        if (page === 1) {
          return filteredRooms;
        }
        const existingIds = new Set(prev.map((r) => r._id));
        const newRoomsToAdd = filteredRooms.filter(
          (r) => !existingIds.has(r._id)
        );
        return [...prev, ...newRoomsToAdd];
      });
    }
  }, [data, page, debouncedSearch]);

  const selectedRoom = allRooms.find((r) => r._id === value);
  const hasMore = data?.data ? data.data.length >= 10 : false;

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
          disabled={disabled || !buildingId}
        >
          <span className="flex items-center gap-2 truncate">
            <DoorOpen className="h-4 w-4 shrink-0" />
            {selectedRoom ? (
              <span className="truncate">Phòng {selectedRoom.roomNumber}</span>
            ) : !buildingId ? (
              <span className="text-muted-foreground">Vui lòng chọn tòa nhà trước</span>
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
            {!buildingId ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Vui lòng chọn tòa nhà trước
              </div>
            ) : isLoading && page === 1 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </span>
              </div>
            ) : allRooms.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchInput
                  ? "Không tìm thấy phòng nào"
                  : "Chưa có phòng có hợp đồng completed"}
              </div>
            ) : (
              <>
                {allRooms.map((room) => (
                  <button
                    key={room._id}
                    onClick={() => handleSelect(room._id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      value === room._id && "bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === room._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-medium truncate w-full text-start">
                        Phòng {room.roomNumber}
                      </span>
                      {room.area && room.maxTenants && (
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {room.area}m² • {room.maxTenants} người
                        </span>
                      )}
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
          {data?.data && data.data.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              Hiển thị {allRooms.length} / {data.data.length} phòng
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

