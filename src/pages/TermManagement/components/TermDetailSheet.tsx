import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Building2, MapPin, Calendar, Loader2 } from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useGetTermDetailQuery } from "@/services/term/term.service";

interface TermDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termId: string | null;
}

const STATUS_LABELS = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

export const TermDetailSheet = ({
  open,
  onOpenChange,
  termId,
}: TermDetailSheetProps) => {
  const formatDate = useFormatDate();
  const { data: termData, isLoading, isError } = useGetTermDetailQuery(
    termId || "",
    { skip: !termId || !open }
  );

  const term = termData?.data;

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
          <SheetHeader className="space-y-4 pb-6">
            <SheetTitle>Chi tiết điều khoản</SheetTitle>
            <SheetDescription>Đang tải thông tin...</SheetDescription>
          </SheetHeader>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (isError || !term) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
          <SheetHeader className="space-y-4 pb-6">
            <SheetTitle>Chi tiết điều khoản</SheetTitle>
            <SheetDescription>Không thể tải thông tin điều khoản</SheetDescription>
          </SheetHeader>
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Không tìm thấy thông tin điều khoản</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
        <SheetHeader className="space-y-4 pb-2 px-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold">
                  {term.name}
                </SheetTitle>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Thông tin tòa nhà */}
          {term.buildingId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4" />
                Thông tin tòa nhà
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Tên tòa nhà
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {term.buildingId.name}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Địa chỉ
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {term.buildingId.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mô tả */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FileText className="w-4 h-4" />
              Mô tả
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              {term.description ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0"
                  dangerouslySetInnerHTML={{ __html: term.description }}
                />
              ) : (
                <p className="text-muted-foreground">Chưa có mô tả</p>
              )}
            </div>
          </div>

          {/* Thông tin hệ thống */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4" />
              Thông tin hệ thống
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Trạng thái
                </label>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[term.status]}
                >
                  {STATUS_LABELS[term.status]}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Ngày tạo
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(term.createdAt)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(term.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

