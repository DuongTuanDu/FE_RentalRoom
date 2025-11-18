import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";

interface RenewalRequestsFiltersProps {
  buildingFilter: string;
  onBuildingFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const RenewalRequestsFilters = ({
  buildingFilter,
  onBuildingFilterChange,
  statusFilter,
  onStatusFilterChange,
}: RenewalRequestsFiltersProps) => {
  return (
    <div className="flex gap-4 items-end mb-6">
      <div className="flex-1">
        <Label className="text-sm text-slate-600 mb-2 block">
          Lọc theo tòa nhà
        </Label>
        <BuildingSelectCombobox
          value={buildingFilter}
          onValueChange={onBuildingFilterChange}
        />
      </div>
      <div>
        <Label className="text-sm text-slate-600 mb-2 block">
          Trạng thái
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="approved">Đã phê duyệt</SelectItem>
            <SelectItem value="rejected">Đã từ chối</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

