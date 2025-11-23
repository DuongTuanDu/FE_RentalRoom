import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface ContractFiltersProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const ContractFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ContractFiltersProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên khách thuê, tòa nhà, phòng, số hợp đồng..."
                value={searchQuery}
                onChange={onSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="sent_to_tenant">Đã gửi</SelectItem>
                <SelectItem value="signed_by_tenant">
                  Đã ký bởi khách
                </SelectItem>
                <SelectItem value="signed_by_landlord">
                  Đã ký bởi chủ trọ
                </SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="voided">Vô hiệu hóa</SelectItem>
                <SelectItem value="terminated">Đã chấm dứt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

