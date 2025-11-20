import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormatDate } from "@/hooks/useFormatDate";
import type { IContract, IContractStatus } from "@/types/contract";
import { ContractActionsMenu } from "./ContractActionsMenu";

interface ContractTableProps {
  data: { items: IContract[]; total: number } | undefined;
  isLoading: boolean;
  error: any;
  searchQuery: string;
  currentPage: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  onPageLimitChange: (limit: number) => void;
  onViewDetail: (contractId: string) => void;
  onUpdate: (contractId: string) => void;
  onSign: (contractId: string) => void;
  onSendToTenant: (contractId: string) => void;
  onConfirmMoveIn: (contractId: string) => void;
  onDelete: (contractId: string) => void;
  onTerminate: (contractId: string) => void;
  isSending: boolean;
  isConfirming: boolean;
  sendConfirmPopoverOpen: Record<string, boolean>;
  onSendPopoverOpenChange: (contractId: string, open: boolean) => void;
}

const getStatusBadge = (status: IContractStatus) => {
  const statusConfig = {
    draft: { label: "Bản nháp", className: "bg-gray-100 text-gray-800" },
    sent_to_tenant: {
      label: "Đã gửi",
      className: "bg-blue-100 text-blue-800",
    },
    signed_by_tenant: {
      label: "Đã ký bởi khách",
      className: "bg-yellow-100 text-yellow-800",
    },
    signed_by_landlord: {
      label: "Đã ký bởi chủ trọ",
      className: "bg-green-100 text-green-800",
    },
    completed: {
      label: "Hoàn thành",
      className: "bg-green-100 text-green-800",
    },
  };
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
};

export const ContractTable = ({
  data,
  isLoading,
  error,
  searchQuery,
  currentPage,
  pageLimit,
  onPageChange,
  onPageLimitChange,
  onViewDetail,
  onUpdate,
  onSign,
  onSendToTenant,
  onConfirmMoveIn,
  onDelete,
  onTerminate,
  isSending,
  isConfirming,
  sendConfirmPopoverOpen,
  onSendPopoverOpenChange,
}: ContractTableProps) => {
  const formatDate = useFormatDate();
  const totalPages = data?.total ? Math.ceil(data.total / pageLimit) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách hợp đồng</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 font-medium">
              Có lỗi xảy ra khi tải dữ liệu
            </p>
            <p className="text-slate-600 text-sm mt-2">
              Vui lòng thử lại sau
            </p>
          </div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">
              Không tìm thấy hợp đồng nào
            </p>
            <p className="text-slate-500 text-sm mt-2">
              {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : ""}
            </p>
          </div>
        ) : (
          <div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">
                      Số hợp đồng
                    </TableHead>
                    <TableHead className="font-semibold">
                      Khách thuê
                    </TableHead>
                    <TableHead className="font-semibold">Tòa nhà</TableHead>
                    <TableHead className="font-semibold">Phòng</TableHead>
                    <TableHead className="font-semibold">
                      Trạng thái
                    </TableHead>
                    <TableHead className="font-semibold">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((contract) => (
                    <TableRow
                      key={contract._id}
                      className="hover:bg-slate-50"
                    >
                      <TableCell className="text-slate-600 font-medium">
                        {contract.contract?.no || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {contract.tenantId?.userInfo?.fullName || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {contract.buildingId?.name || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {contract.roomId?.roomNumber || "—"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.status)}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {contract.createdAt
                          ? formatDate(contract.createdAt)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <ContractActionsMenu
                          contractId={contract._id}
                          status={contract.status}
                          moveInConfirmedAt={contract.moveInConfirmedAt}
                          onViewDetail={onViewDetail}
                          onUpdate={onUpdate}
                          onSign={onSign}
                          onSendToTenant={onSendToTenant}
                          onConfirmMoveIn={onConfirmMoveIn}
                          onDelete={onDelete}
                          onTerminate={onTerminate}
                          isSending={isSending}
                          isConfirming={isConfirming}
                          sendConfirmPopoverOpen={
                            sendConfirmPopoverOpen[contract._id] || false
                          }
                          onSendPopoverOpenChange={(open) =>
                            onSendPopoverOpenChange(contract._id, open)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data && data.total > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-slate-600">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pageLimit + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageLimit, data.total)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{data.total}</span> hợp đồng
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={pageLimit.toString()}
                    onValueChange={(value) => {
                      onPageLimitChange(Number(value));
                      onPageChange(1);
                    }}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 hợp đồng</SelectItem>
                      <SelectItem value="20">20 hợp đồng</SelectItem>
                      <SelectItem value="50">50 hợp đồng</SelectItem>
                      <SelectItem value="100">100 hợp đồng</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              currentPage === pageNum
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => onPageChange(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

