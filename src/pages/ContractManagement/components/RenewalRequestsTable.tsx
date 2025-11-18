import { Clock, Eye, CheckCircle, XCircle, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormatDate } from "@/hooks/useFormatDate";
import type { IContract } from "@/types/contract";

interface RenewalRequestsTableProps {
  data: { items: IContract[]; total: number } | undefined;
  isLoading: boolean;
  error: any;
  currentPage: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
  onPageLimitChange: (limit: number) => void;
  onViewDetail: (contractId: string) => void;
  onApprove: (contractId: string) => void;
  onReject: (contractId: string) => void;
  onTerminate: (contractId: string) => void;
}

const getRenewalStatusBadge = (
  status: "pending" | "approved" | "rejected" | "cancelled"
) => {
  const statusConfig = {
    pending: {
      label: "Chờ xử lý",
      className: "bg-yellow-100 text-yellow-800",
    },
    approved: {
      label: "Đã phê duyệt",
      className: "bg-green-100 text-green-800",
    },
    rejected: {
      label: "Đã từ chối",
      className: "bg-red-100 text-red-800",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-gray-100 text-gray-800",
    },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
};

export const RenewalRequestsTable = ({
  data,
  isLoading,
  error,
  currentPage,
  pageLimit,
  onPageChange,
  onPageLimitChange,
  onViewDetail,
  onApprove,
  onReject,
  onTerminate,
}: RenewalRequestsTableProps) => {
  const formatDate = useFormatDate();
  const totalPages = data?.total ? Math.ceil(data.total / pageLimit) : 0;

  return (
    <>
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
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Không có yêu cầu gia hạn nào
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
                    Ngày hết hạn hiện tại
                  </TableHead>
                  <TableHead className="font-semibold">
                    Gia hạn thêm
                  </TableHead>
                  <TableHead className="font-semibold">
                    Ngày hết hạn mới
                  </TableHead>
                  <TableHead className="font-semibold">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-semibold">
                    Ngày yêu cầu
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((contract) => {
                  const renewalContract = contract as any; // Type assertion vì API trả về contract có renewalRequest
                  return (
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
                      <TableCell className="text-slate-600 text-sm">
                        {contract.contract?.endDate
                          ? formatDate(contract.contract.endDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {renewalContract.renewalRequest?.months || "—"}{" "}
                        tháng
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {renewalContract.renewalRequest?.requestedEndDate
                          ? formatDate(
                              renewalContract.renewalRequest.requestedEndDate
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {renewalContract.renewalRequest?.status
                          ? getRenewalStatusBadge(
                              renewalContract.renewalRequest.status
                            )
                          : "—"}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {renewalContract.renewalRequest?.requestedAt
                          ? formatDate(
                              renewalContract.renewalRequest.requestedAt
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => onViewDetail(contract._id)}
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xem chi tiết</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {renewalContract.renewalRequest?.status ===
                            "pending" && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => onApprove(contract._id)}
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Phê duyệt</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => onReject(contract._id)}
                                    >
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Từ chối</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}

                          {contract.status === "completed" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onTerminate(contract._id)}
                                  >
                                    <Ban className="w-4 h-4 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Chấm dứt hợp đồng</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                <span className="font-medium">{data.total}</span> yêu cầu
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
                    <SelectItem value="10">10 yêu cầu</SelectItem>
                    <SelectItem value="20">20 yêu cầu</SelectItem>
                    <SelectItem value="50">50 yêu cầu</SelectItem>
                    <SelectItem value="100">100 yêu cầu</SelectItem>
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
                            currentPage === pageNum ? "default" : "outline"
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
    </>
  );
};

