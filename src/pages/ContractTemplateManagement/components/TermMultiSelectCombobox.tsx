import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTermsQuery } from "@/services/term/term.service";
import type { ITerm } from "@/types/term";

interface Props {
  buildingId: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
}

export const TermMultiSelectCombobox = ({ buildingId, value, onValueChange, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const debouncedSetSearch = useMemo(
    () => _.debounce((v: string) => { setDebouncedSearch(v); setPage(1); }, 500),
    []
  );

  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  const { data, isLoading, isFetching } = useGetTermsQuery(
    { buildingId, page: 1, limit: 100, status: "active" },
    { skip: !buildingId }
  );

  const allTerms = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return allTerms;
    return allTerms.filter((t: ITerm) =>
      [t.name, t.description].filter(Boolean).some((s) => String(s).toLowerCase().includes(q))
    );
  }, [allTerms, debouncedSearch]);

  const visible = useMemo(() => filtered.slice(0, page * pageSize), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  const toggle = (id: string) => {
    if (value.includes(id)) onValueChange(value.filter((x) => x !== id));
    else onValueChange([...value, id]);
  };

  const selectedCount = value.length;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSearchInput(""); setDebouncedSearch(""); setPage(1); } }}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="w-full justify-between">
          <span className="truncate">{selectedCount ? `${selectedCount} điều khoản đã chọn` : "Chọn điều khoản..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3 relative">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Tìm điều khoản..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); debouncedSetSearch(e.target.value); }}
              className="h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchInput !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto overscroll-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">Đang tải...</div>
            ) : visible.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Không có điều khoản</div>
            ) : (
              <>
                {visible.map((t: ITerm) => (
                  <button key={t._id} onClick={() => toggle(t._id)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent", value.includes(t._id) && "bg-accent")}> 
                    <Check className={cn("h-4 w-4", value.includes(t._id) ? "opacity-100" : "opacity-0")} />
                    <span className="truncate text-start">{t.name}</span>
                  </button>
                ))}

                {hasMore && (
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
                      {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xem thêm"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          {selectedCount > 0 && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground flex flex-wrap gap-1">
              {value.map((id) => {
                const term = allTerms.find((x) => x._id === id);
                return term ? (
                  <Badge key={id} variant="secondary" className="max-w-[200px] truncate">{term.name}</Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

TermMultiSelectCombobox.ReadOnlyDescriptions = function Descriptions({ buildingId, ids }: { buildingId: string; ids: string[] }) {
  const { data } = useGetTermsQuery(
    { buildingId, page: 1, limit: 200, status: "active" },
    { skip: !buildingId }
  );
  const all = data?.data ?? [];
  const items = ids.map((id) => all.find((t) => t._id === id)).filter(Boolean) as ITerm[];
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div key={t._id} className="prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2">
          <div className="font-medium mb-1">{t.name}</div>
          <div dangerouslySetInnerHTML={{ __html: t.description }} />
        </div>
      ))}
    </div>
  );
} as any;


