import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  FileText,
  Zap,
  Droplet,
  Calendar,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { IBuilding } from "@/types/building";

interface DrawerBuildingDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building: IBuilding | null;
}

const getIndexTypeLabel = (type: string) => {
  const labels = {
    byNumber: "Theo chỉ số",
    byPerson: "Theo đầu người",
    included: "Đã bao gồm trong giá thuê",
  };
  return labels[type as keyof typeof labels] || type;
};

const DrawerBuildingDetail = ({
  open,
  onOpenChange,
  building,
}: DrawerBuildingDetailProps) => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  if (!building) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto pl-2 sm:pl-4">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold">
                  {building.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {building.address}
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FileText className="w-4 h-4" />
              Thông tin cơ bản
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Tên tòa nhà
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {building.name}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Địa chỉ
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {building.address}
                </p>
              </div>
              {building.description && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Mô tả
                    </label>
                    <p className="text-base text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      {building.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Thông tin điện */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
              <Zap className="w-4 h-4" />
              Thông tin điện
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-amber-700 dark:text-amber-400 mr-2">
                    Loại chỉ số
                  </label>
                  <Badge
                    variant="outline"
                    className="mt-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                  >
                    {getIndexTypeLabel(building.eIndexType)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-amber-700 dark:text-amber-400">
                    Đơn giá
                  </label>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {formatPrice(building.ePrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin nước */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
              <Droplet className="w-4 h-4" />
              Thông tin nước
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-blue-700 dark:text-blue-400 mr-2">
                    Loại chỉ số
                  </label>
                  <Badge
                    variant="outline"
                    className="mt-2 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300"
                  >
                    {getIndexTypeLabel(building.wIndexType)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-blue-700 dark:text-blue-400">
                    Đơn giá
                  </label>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {formatPrice(building.wPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4" />
              Thông tin hệ thống
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Ngày tạo
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(building.createdAt)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(building.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DrawerBuildingDetail;