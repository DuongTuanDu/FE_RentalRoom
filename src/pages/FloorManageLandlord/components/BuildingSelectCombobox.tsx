import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Building2,
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
import { useGetBuildingsQuery } from "@/services/building/building.service";
import type { IBuilding } from "@/types/building";

interface BuildingSelectComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const BuildingSelectCombobox = ({
  value,
  onValueChange,
  disabled = false,
}: BuildingSelectComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allBuildings, setAllBuildings] = useState<IBuilding[]>([]);

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

  const { data, isLoading, isFetching } = useGetBuildingsQuery({
    q: debouncedSearch,
    page: page,
    limit: 10,
  });

  useEffect(() => {
    if (data?.data) {
      setAllBuildings((prev) => {
        if (page === 1) {
          return data.data;
        }
        const existingIds = new Set(prev.map((b) => b._id));
        const newBuildings = data.data.filter((b) => !existingIds.has(b._id));
        return [...prev, ...newBuildings];
      });
    }
  }, [data, page]);

  const selectedBuilding = allBuildings.find((b) => b._id === value);
  const hasMore = data?.total ? allBuildings.length < data.total : false;

  const handleSelect = (buildingId: string) => {
    onValueChange(buildingId === value ? "" : buildingId);
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
            <Building2 className="h-4 w-4 shrink-0" />
            {selectedBuilding ? (
              <span className="truncate">{selectedBuilding.name}</span>
            ) : (
              <span className="text-muted-foreground">Chọn tòa nhà...</span>
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
              placeholder="Tìm kiếm tòa nhà..."
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

          {/* Buildings List */}
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </span>
              </div>
            ) : allBuildings.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchInput ? "Không tìm thấy tòa nhà nào" : "Chưa có tòa nhà"}
              </div>
            ) : (
              <>
                {allBuildings.map((building) => (
                  <button
                    key={building._id}
                    onClick={() => handleSelect(building._id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      value === building._id && "bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === building._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="font-medium truncate w-full">
                        {building.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {building.address}
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
              Hiển thị {allBuildings.length} / {data.total} tòa nhà
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
