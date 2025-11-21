import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useGetTenantContractsQuery,
  useGetUpcomingExpireQuery,
  useDownloadTenantContractMutation,
} from "@/services/contract/contract.service";
import { FileText, Search, Eye, Edit, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";
import _ from "lodash";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IContractStatus } from "@/types/contract";
import { ContractDetailSheet } from "./components/ContractDetailSheet";
import { UpdateTenantContractDialog } from "./components/UpdateTenantContractDialog";
import { SignTenantDialog } from "./components/SignTenantDialog";
import { RequestExtendDialog } from "./components/RequestExtendDialog";

const Contract = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);

  const formatDate = useFormatDate();
  const { data, error, isLoading } = useGetTenantContractsQuery({
    page: currentPage,
    limit: pageLimit,
    status: statusFilter !== "all" ? (statusFilter as IContractStatus) : undefined,
  });

  // Lấy danh sách hợp đồng sắp hết hạn
  const { data: upcomingExpireData } = useGetUpcomingExpireQuery({
    page: 1,
    limit: 5,
    days: 30, // Hiển thị hợp đồng hết hạn trong 30 ngày tới
  });

  const [downloadTenantContract, { isLoading: isDownloading }] =
    useDownloadTenantContractMutation();

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 700),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  const handleOpenDetailSheet = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsDetailSheetOpen(true);
  };

  const handleOpenUpdateDialog = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsUpdateDialogOpen(true);
  };

  const handleOpenSignDialog = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsSignDialogOpen(true);
  };

  const handleOpenExtendDialog = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsExtendDialogOpen(true);
  };

  const handleDownloadContract = async (contractId: string) => {
    try {
      const blob = await downloadTenantContract({ id: contractId }).unwrap();
      
      // Tạo URL từ blob và tải file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HopDong_${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Tải hợp đồng PDF thành công");
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi tải hợp đồng PDF"
      );
    }
  };

  const getStatusBadge = (status: IContractStatus) => {
    const statusConfig = {
      draft: { label: "Bản nháp", className: "bg-gray-100 text-gray-800" },
      sent_to_tenant: {
        label: "Đã gửi",
        className: "bg-blue-100 text-blue-800",
      },
      signed_by_tenant: {
        label: "Đã ký",
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
      voided: {
        label: "Vô hiệu hóa",
        className: "bg-red-100 text-red-800",
      },
      terminated: {
        label: "Đã chấm dứt",
        className: "bg-red-100 text-red-800",
      },
    };
    const config = statusConfig[status];
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  // Tính toán totalPages từ API response
  const totalPages = data?.total ? Math.ceil(data.total / pageLimit) : 0;

  // Tính số ngày còn lại đến khi hết hạn
  const getDaysUntilExpire = (endDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expireDate = new Date(endDate);
    expireDate.setHours(0, 0, 0, 0);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Hợp đồng của tôi
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý và theo dõi các hợp đồng thuê phòng của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Cảnh báo hợp đồng sắp hết hạn */}
        {upcomingExpireData && upcomingExpireData.items && upcomingExpireData.items.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-1">
                    Cảnh báo hợp đồng sắp hết hạn
                  </h3>
                  <p className="text-sm text-orange-700">
                    Bạn có {upcomingExpireData.items.length} hợp đồng sắp hết hạn trong 30 ngày tới.
                    Vui lòng xem chi tiết và gia hạn nếu cần.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tòa nhà, phòng, số hợp đồng..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="sent_to_tenant">Đã gửi</SelectItem>
                    <SelectItem value="signed_by_tenant">Đã ký</SelectItem>
                    <SelectItem value="signed_by_landlord">Đã ký bởi chủ trọ</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
                        <TableHead className="font-semibold">Tòa nhà</TableHead>
                        <TableHead className="font-semibold">Phòng</TableHead>
                        <TableHead className="font-semibold">
                          Trạng thái
                        </TableHead>
                        <TableHead className="font-semibold">
                          Ngày bắt đầu
                        </TableHead>
                        <TableHead className="font-semibold">
                          Ngày kết thúc
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((contract) => {
                        const daysUntilExpire = contract.contract?.endDate
                          ? getDaysUntilExpire(contract.contract.endDate)
                          : null;
                        const isExpiringSoon = daysUntilExpire !== null && daysUntilExpire <= 30 && daysUntilExpire >= 0;

                        return (
                          <TableRow
                            key={contract._id}
                            className="hover:bg-slate-50"
                          >
                            <TableCell className="text-slate-600 font-medium">
                              {contract.contract?.no || "—"}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {contract.buildingId?.name || "—"}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {contract.roomId?.roomNumber || "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(contract.status)}
                                {isExpiringSoon && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Clock className="w-4 h-4 text-orange-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Còn {daysUntilExpire} ngày nữa sẽ hết hạn</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">
                              {contract.contract?.startDate
                                ? formatDate(contract.contract.startDate)
                                : "—"}
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">
                              {contract.contract?.endDate
                                ? formatDate(contract.contract.endDate)
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
                                        onClick={() =>
                                          handleOpenDetailSheet(contract._id)
                                        }
                                      >
                                        <Eye className="w-4 h-4 text-blue-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Xem chi tiết</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {contract.status === "sent_to_tenant" && (
                                  <>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                              handleOpenUpdateDialog(contract._id)
                                            }
                                          >
                                            <Edit className="h-4 w-4 text-amber-600" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Cập nhật thông tin</p>
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
                                            onClick={() =>
                                              handleOpenSignDialog(contract._id)
                                            }
                                          >
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Ký hợp đồng</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </>
                                )}

                                {(contract.status === "signed_by_landlord" ||
                                  contract.status === "completed") &&
                                  isExpiringSoon && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                              handleOpenExtendDialog(contract._id)
                                            }
                                          >
                                            <Clock className="w-4 h-4 text-purple-600" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Yêu cầu gia hạn</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                {contract.status === "completed" && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                            handleDownloadContract(contract._id)
                                          }
                                          disabled={isDownloading}
                                        >
                                          <Download className="w-4 h-4 text-indigo-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Tải PDF hợp đồng</p>
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
                      <span className="font-medium">{data.total}</span> hợp đồng
                    </p>
                    <div className="flex items-center gap-2">
                      <Select
                        value={pageLimit.toString()}
                        onValueChange={(value) => {
                          setPageLimit(Number(value));
                          setCurrentPage(1);
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
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
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
                                onClick={() => setCurrentPage(pageNum)}
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
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
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
      </div>

      {/* Sheet Chi tiết hợp đồng */}
      <ContractDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open: boolean) => {
          setIsDetailSheetOpen(open);
          if (!open) {
            setSelectedContractId(null);
          }
        }}
        contractId={selectedContractId}
      />

      {/* Dialog Cập nhật hợp đồng */}
      <UpdateTenantContractDialog
        open={isUpdateDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsUpdateDialogOpen(open);
          if (!open) {
            setSelectedContractId(null);
          }
        }}
        contractId={selectedContractId}
        onSuccess={() => {
          setSelectedContractId(null);
        }}
      />

      {/* Dialog Ký hợp đồng */}
      <SignTenantDialog
        open={isSignDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsSignDialogOpen(open);
          if (!open) {
            setSelectedContractId(null);
          }
        }}
        contractId={selectedContractId}
        onSuccess={() => {
          setSelectedContractId(null);
        }}
      />

      {/* Dialog Yêu cầu gia hạn */}
      <RequestExtendDialog
        open={isExtendDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsExtendDialogOpen(open);
          if (!open) {
            setSelectedContractId(null);
          }
        }}
        contractId={selectedContractId}
        onSuccess={() => {
          setSelectedContractId(null);
        }}
      />
    </div>
  );
};

export default Contract;
