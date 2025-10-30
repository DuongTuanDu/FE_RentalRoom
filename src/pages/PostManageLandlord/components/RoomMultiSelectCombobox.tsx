import { useEffect, useMemo, useState, useCallback } from "react";
import { Check, ChevronsUpDown, DoorOpen, Loader2, Search, Square } from "lucide-react";
import _ from "lodash";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGetVacantRoomsByBuildingIdQuery } from "@/services/post/post.service";

interface RoomMultiSelectComboboxProps {
  buildingId: string;
  value: string[];
  onValueChange: (ids: string[]) => void;
  disabled?: boolean;
}

export const RoomMultiSelectCombobox = ({
  buildingId,
  value,
  onValueChange,
  disabled = false,
}: RoomMultiSelectComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((v: string) => {
        setDebouncedSearch(v);
        setPage(1);
      }, 500),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setSearchInput(v);
      debouncedSetSearch(v);
    },
    [debouncedSetSearch]
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const { data, isLoading, isFetching } = useGetVacantRoomsByBuildingIdQuery(buildingId, {
    skip: !buildingId,
  } as any);

  const allRooms = useMemo(() => data?.data?.rooms ?? [], [data]);

  const filteredRooms = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return allRooms;
    return allRooms.filter((r: any) =>
      [r.roomNumber, String(r.area), String(r.price)]
        .filter(Boolean)
        .some((t: any) => String(t).toLowerCase().includes(q))
    );
  }, [allRooms, debouncedSearch]);

  const visibleRooms = useMemo(
    () => filteredRooms.slice(0, page * pageSize),
    [filteredRooms, page]
  );

  const hasMore = visibleRooms.length < filteredRooms.length;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchInput("");
      setDebouncedSearch("");
      setPage(1);
    }
  };

  const toggleSelect = (id: string) => {
    if (value.includes(id)) {
      onValueChange(value.filter((x) => x !== id));
    } else {
      onValueChange([...value, id]);
    }
  };

  const selectedCount = value.length;

  const summaryLabel = useMemo(() => {
    if (!buildingId) return "Chọn phòng...";
    if (selectedCount === 0) return "Chọn phòng...";
    if (selectedCount === 1) return "Đã chọn 1 phòng";
    return `Đã chọn ${selectedCount} phòng`;
  }, [buildingId, selectedCount]);

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
            <span className="truncate">{summaryLabel}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3 relative">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Tìm phòng theo số, diện tích, giá..."
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

          <div
            className="max-h-[320px] overflow-y-auto overscroll-auto"
            onWheel={(e) => {
              const target = e.currentTarget;
              const delta = e.deltaY;
              // Scroll inside the popover instead of the page
              target.scrollTop += delta;
              e.stopPropagation();
            }}
          >
            {(!buildingId || isLoading) ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang tải phòng trống...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchInput ? "Không tìm thấy phòng phù hợp" : "Chưa có phòng trống"}
              </div>
            ) : (
              <>
                {visibleRooms.map((room: any) => {
                  const checked = value.includes(room._id);
                  return (
                    <button
                      key={room._id}
                      onClick={() => toggleSelect(room._id)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                        checked && "bg-accent"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2 min-w-0 w-full justify-between">
                        <span className="truncate">P.{room.roomNumber}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-3 shrink-0">
                          <span className="inline-flex items-center gap-1">
                            <Square className="h-3 w-3" />
                            {room.area} m²
                          </span>
                          <span className="inline-flex items-center gap-1">
                            ₫ {room.price.toLocaleString("vi-VN")}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}

                {hasMore && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={isFetching}
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>Xem thêm</>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {!!filteredRooms.length && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              Đã chọn {selectedCount} / {filteredRooms.length} phòng hiển thị
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};


