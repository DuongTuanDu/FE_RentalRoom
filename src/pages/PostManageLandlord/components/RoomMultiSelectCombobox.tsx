import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Check,
  ChevronsUpDown,
  DoorOpen,
  Loader2,
  Search,
  Square,
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

  const safeValue = Array.isArray(value) ? value : [];

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

  const { data, isLoading, isFetching } = useGetVacantRoomsByBuildingIdQuery(
    buildingId,
    {
      skip: !buildingId,
    } as any
  );

  const allRooms = useMemo(() => {
    const rooms = data?.data?.rooms ?? [];

    const filtered = rooms.filter((r: any) => {
      return (
        r.status === "available" ||
        (r.status === "rented" && r.expectedAvailableDate)
      );
    });

    return filtered.sort((a: any, b: any) => {
      const isSoonA = a.status === "rented" && a.expectedAvailableDate;
      const isSoonB = b.status === "rented" && b.expectedAvailableDate;

      if (isSoonA && !isSoonB) return -1;
      if (!isSoonA && isSoonB) return 1;
      return 0;
    });
  }, [data]);

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

  const areAllFilteredSelected = useMemo(() => {
    if (filteredRooms.length === 0) return false;
    return filteredRooms.every((room: any) =>
      safeValue.includes(String(room._id))
    );
  }, [filteredRooms, safeValue]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchInput("");
      setDebouncedSearch("");
      setPage(1);
    }
  };

  const toggleSelect = (id: string) => {
    const strId = String(id);
    if (safeValue.includes(strId)) {
      onValueChange(safeValue.filter((x) => x !== strId));
    } else {
      onValueChange([...safeValue, strId]);
    }
  };

  const toggleSelectAll = () => {
    if (areAllFilteredSelected) {
      const filteredIds = new Set(filteredRooms.map((r: any) => String(r._id)));
      const newValue = safeValue.filter((id) => !filteredIds.has(id));
      onValueChange(newValue);
    } else {
      const filteredIds = filteredRooms.map((r: any) => String(r._id));
      const newValue = Array.from(new Set([...safeValue, ...filteredIds]));
      onValueChange(newValue);
    }
  };

  const selectedCount = safeValue.length;

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
          type="button"
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
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
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

          {!isLoading && filteredRooms.length > 0 && (
            <div className="border-b">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSelectAll();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors font-medium text-primary"
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border border-primary",
                    areAllFilteredSelected
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50"
                  )}
                >
                  {areAllFilteredSelected && <Check className="h-3 w-3" />}
                </div>
                {areAllFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
          )}

          <div
            className="max-h-[320px] overflow-y-auto overscroll-auto"
            onWheel={(e) => {
              const target = e.currentTarget;
              const delta = e.deltaY;
              target.scrollTop += delta;
              e.stopPropagation();
            }}
          >
            {!buildingId || isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang tải phòng trống...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchInput
                  ? "Không tìm thấy phòng phù hợp"
                  : "Chưa có phòng trống"}
              </div>
            ) : (
              <>
                {visibleRooms.map((room: any) => {
                  const strId = String(room._id);
                  const checked = safeValue.includes(strId);

                  // Xác định xem có phải là phòng sắp trống không
                  const isSoonAvailable =
                    room.status === "rented" && room.expectedAvailableDate;

                  return (
                    <button
                      key={room._id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSelect(strId);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                        checked && "bg-accent/50",
                        isSoonAvailable
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-primary",
                          checked
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>

                      <div className="flex items-center gap-2 min-w-0 w-full justify-between text-left">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">
                              P.{room.roomNumber}
                            </span>

                            {isSoonAvailable && (
                              <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800 border border-yellow-200 whitespace-nowrap shadow-sm">
                                Trống từ{" "}
                                {new Date(
                                  room.expectedAvailableDate
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-muted-foreground flex items-center gap-3 shrink-0 mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Square className="h-3 w-3" />
                              {room.area} m²
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono">
                              ₫{room.price.toLocaleString("vi-VN")}
                            </span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {hasMore && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => p + 1);
                      }}
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
            <div className="border-t px-3 py-2 text-xs text-muted-foreground flex justify-between items-center bg-muted/20">
              <span>Hiển thị: {filteredRooms.length} phòng</span>
              <span className="font-medium text-primary">
                Đã chọn: {selectedCount}
              </span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
