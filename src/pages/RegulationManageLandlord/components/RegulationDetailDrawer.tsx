import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Calendar,
  FileText,
  Building2,
  User,
  Clock,
  Eye,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import type { IRegulation } from "@/types/regulation";

interface RegulationDetailDrawerProps {
  regulation: IRegulation;
  children?: React.ReactNode;
}

const STATUS_LABELS = {
  active: "Đang áp dụng",
  inactive: "Không áp dụng",
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-red-100 text-red-800 border-red-200",
};

export const RegulationDetailSheet = ({
  regulation,
  children,
}: RegulationDetailDrawerProps) => {
  const formatDate = useFormatDate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4 text-blue-600" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto px-4">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold">
                {regulation.title}
              </SheetTitle>
              <SheetDescription className="text-sm">
                Chi tiết thông tin quy định
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Description Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Mô tả chi tiết</h3>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg border">
              {regulation.description ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0"
                  dangerouslySetInnerHTML={{
                    __html: regulation.description,
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có mô tả</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Building Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Tòa nhà</h3>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Tòa nhà:</p>
                <p className="font-mono text-sm">{regulation.buildingId.name}</p>
              </div>
            </div>

            {/* Type & Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Phân loại</h3>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Trạng thái:
                  </span>
                  <Badge
                    variant="outline"
                    className={STATUS_COLORS[regulation.status]}
                  >
                    {STATUS_LABELS[regulation.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Effective Dates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Thời gian hiệu lực</h3>
            </div>
            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Hiệu lực từ:
                </span>
              </div>
              <p className="text-sm font-mono ">
                {formatDate(regulation.effectiveFrom)}
              </p>
            </div>
          </div>

          <Separator />

          {/* System Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Thông tin hệ thống</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Người tạo</p>
                <p className="text-sm font-mono">
                  {regulation.createdBy.userInfo.fullName}
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Ngày tạo</p>
                <p className="text-sm font-mono">
                  {formatDate(regulation.createdAt)}
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Cập nhật lần cuối
                </p>
                <p className="text-sm font-mono">
                  {formatDate(regulation.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
