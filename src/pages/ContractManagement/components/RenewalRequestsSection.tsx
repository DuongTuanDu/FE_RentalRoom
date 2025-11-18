import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RenewalRequestsFilters } from "./RenewalRequestsFilters";
import { RenewalRequestsTable } from "./RenewalRequestsTable";
import type { IContract } from "@/types/contract";

interface RenewalRequestsSectionProps {
  data: { items: IContract[]; total: number } | undefined;
  isLoading: boolean;
  error: any;
  buildingFilter: string;
  onBuildingFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  currentPage: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  onPageLimitChange: (limit: number) => void;
  onViewDetail: (contractId: string) => void;
  onApprove: (contractId: string) => void;
  onReject: (contractId: string) => void;
  onTerminate: (contractId: string) => void;
}

export const RenewalRequestsSection = ({
  data,
  isLoading,
  error,
  buildingFilter,
  onBuildingFilterChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  pageLimit,
  onPageChange,
  onPageLimitChange,
  onViewDetail,
  onApprove,
  onReject,
  onTerminate,
}: RenewalRequestsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Yêu cầu gia hạn hợp đồng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RenewalRequestsFilters
          buildingFilter={buildingFilter}
          onBuildingFilterChange={onBuildingFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
        <RenewalRequestsTable
          data={data}
          isLoading={isLoading}
          error={error}
          currentPage={currentPage}
          pageLimit={pageLimit}
          onPageChange={onPageChange}
          onPageLimitChange={onPageLimitChange}
          onViewDetail={onViewDetail}
          onApprove={onApprove}
          onReject={onReject}
          onTerminate={onTerminate}
        />
      </CardContent>
    </Card>
  );
};

