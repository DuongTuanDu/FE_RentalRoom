import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useGetTenantInvoicesQuery,
  usePayTenantInvoiceMutation,
} from "@/services/invoice/invoice.service";
import {
  FileText,
  Search,
  Eye,
  CreditCard,
  Calendar,
  Building2,
  DoorOpen,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type {
  ITenantInvoiceItem,
  IInvoicePaymentInfoResponse,
} from "@/types/invoice";
import { TenantInvoiceDetailSheet } from "./components/TenantInvoiceDetailSheet";
import {
  TenantPayInvoiceDialog,
  PaymentInfoDialog,
} from "./components/TenantPayInvoiceDialog";
import { RequestTransferConfirmationDialog } from "./components/RequestTransferConfirmationDialog";
import { useGetTenantInvoiceDetailsQuery } from "@/services/invoice/invoice.service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Invoice = () => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "sent" | "paid" | "overdue" | "cancelled"
  >("all");
  const [periodMonth, setPeriodMonth] = useState("all");
  const [periodYear, setPeriodYear] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  // Detail and actions state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] =
    useState<IInvoicePaymentInfoResponse | null>(null);
  const [isRequestTransferDialogOpen, setIsRequestTransferDialogOpen] =
    useState(false);
  const [requestTransferInvoiceId, setRequestTransferInvoiceId] = useState<
    string | null
  >(null);

  // Debounced search
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

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, periodMonth, periodYear]);

  // Fetch invoices with filters
  const {
    data: invoicesData,
    isLoading,
    isFetching,
  } = useGetTenantInvoicesQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    periodMonth: periodMonth && periodMonth !== "all" ? periodMonth : undefined,
    periodYear: periodYear && periodYear !== "all" ? periodYear : undefined,
    page: currentPage,
    limit: pageLimit,
    search: debouncedSearch || undefined,
  });

  // Fetch all invoices for statistics (without filters)
  const { data: allInvoicesData } = useGetTenantInvoicesQuery({
    page: 1,
    limit: 1000,
  });

  // Mutations
  const [payInvoice, { isLoading: isPaying }] = usePayTenantInvoiceMutation();

  const totalItems = invoicesData?.total ?? 0;
  const totalPages = invoicesData?.totalPages ?? 0;

  // Status badge helper
  const getStatusBadge = (status: ITenantInvoiceItem["status"]) => {
    const statusConfig = {
      draft: {
        label: "Nháp",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: FileText,
      },
      sent: {
        label: "Chủ trọ đã gửi",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
      },
      paid: {
        label: "Đã thanh toán",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      transfer_pending: {
        label: "Chờ chuyển tiền",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      overdue: {
        label: "Quá hạn",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
      },
      cancelled: {
        label: "Đã hủy",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: X,
      },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge className={config.className} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Handlers
  const handleOpenDetailSheet = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailSheetOpen(true);
  };

  const handleOpenPayDialog = (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    setIsPayDialogOpen(true);
  };

  const handleOpenRequestTransferDialog = (invoiceId: string) => {
    setRequestTransferInvoiceId(invoiceId);
    setIsRequestTransferDialogOpen(true);
  };

  const handlePayInvoice = async (data: {
    paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
    note: string;
  }) => {
    if (!payingInvoiceId) return;

    try {
      const response = await payInvoice({
        id: payingInvoiceId,
        data,
      }).unwrap();

      // Check if response has payment info (for bank_transfer or online_gateway)
      if (
        response &&
        response.bankInfo &&
        (data.paymentMethod === "bank_transfer" ||
          data.paymentMethod === "online_gateway")
      ) {
        setPaymentInfo(response);
        // Keep dialog open to show payment info
      } else {
        toast.success("Báo đã thanh toán hóa đơn thành công!");
        setIsPayDialogOpen(false);
        setPayingInvoiceId(null);
        setPaymentInfo(null);
      }
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Báo đã thanh toán hóa đơn thất bại!"
      );
      setPaymentInfo(null);
    }
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Statistics - calculate from all invoices (not filtered)
  const stats = useMemo(() => {
    if (!allInvoicesData?.items) {
      return {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      };
    }

    const items = allInvoicesData.items;
    const paid = items.filter(
      (inv: ITenantInvoiceItem) => inv.status === "paid"
    ).length;
    const pending = items.filter(
      (inv: ITenantInvoiceItem) =>
        inv.status === "sent" ||
        inv.status === "draft" ||
        inv.status === "transfer_pending"
    ).length;
    const overdue = items.filter(
      (inv: ITenantInvoiceItem) => inv.status === "overdue"
    ).length;

    const totalAmount = items.reduce(
      (sum: number, inv: ITenantInvoiceItem) => sum + inv.totalAmount,
      0
    );
    const paidAmount = items
      .filter((inv: ITenantInvoiceItem) => inv.status === "paid")
      .reduce(
        (sum: number, inv: ITenantInvoiceItem) => sum + inv.totalAmount,
        0
      );
    const pendingAmount = items
      .filter(
        (inv: ITenantInvoiceItem) =>
          inv.status === "sent" ||
          inv.status === "overdue" ||
          inv.status === "transfer_pending"
      )
      .reduce(
        (sum: number, inv: ITenantInvoiceItem) => sum + inv.totalAmount,
        0
      );

    return {
      total: items.length,
      paid,
      pending,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount,
    };
  }, [allInvoicesData?.items]);

  const shouldHideActions = (status: string) => {
    return ["paid", "transfer_pending", "overdue", "cancelled"].includes(
      status
    );
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Hóa đơn của tôi
              </h1>
              <p className="text-slate-600 mt-1">
                Xem và quản lý các hóa đơn thuê phòng của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Tổng hóa đơn
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Đã thanh toán
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.paid}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {formatPrice(stats.paidAmount)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Chờ thanh toán
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.pending}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {formatPrice(stats.pendingAmount)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Quá hạn</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.overdue}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo số hóa đơn, tòa nhà, phòng..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v: any) => setStatusFilter(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="sent">Đã gửi</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Period Month */}
              <div className="space-y-2">
                <Label>Tháng</Label>
                <Select value={periodMonth} onValueChange={setPeriodMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tháng" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={String(month)}>
                        Tháng {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Year */}
              <div className="space-y-2">
                <Label>Năm</Label>
                <Select value={periodYear} onValueChange={setPeriodYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn năm" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {(statusFilter !== "all" ||
              (periodMonth && periodMonth !== "all") ||
              (periodYear && periodYear !== "all") ||
              searchQuery) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setPeriodMonth("all");
                    setPeriodYear("all");
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách hóa đơn</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={String(pageLimit)}
                onValueChange={(v) => {
                  setPageLimit(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / trang</SelectItem>
                  <SelectItem value="20">20 / trang</SelectItem>
                  <SelectItem value="50">50 / trang</SelectItem>
                  <SelectItem value="100">100 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Số hóa đơn</TableHead>
                    <TableHead>Tòa nhà</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Kỳ</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Ngày phát hành</TableHead>
                    <TableHead>Hạn thanh toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[180px] text-right">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          Đang tải...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !invoicesData || invoicesData.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Không có dữ liệu hóa đơn
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoicesData.items.map(
                      (invoice: ITenantInvoiceItem, idx: number) => (
                        <TableRow
                          key={invoice._id}
                          className="hover:bg-slate-50"
                        >
                          <TableCell>
                            {(currentPage - 1) * pageLimit + idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{invoice.buildingId?.name || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DoorOpen className="h-4 w-4 text-muted-foreground" />
                              <span>{invoice.roomId?.roomNumber || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {invoice.periodMonth}/{invoice.periodYear}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatPrice(invoice.totalAmount)}
                          </TableCell>
                          <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                          <TableCell>
                            <span
                              className={
                                invoice.status === "overdue"
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {formatDate(invoice.dueDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(invoice.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleOpenDetailSheet(invoice._id)
                                      }
                                      title="Xem chi tiết"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xem chi tiết</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {!shouldHideActions(invoice.status) && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenPayDialog(invoice._id)
                                          }
                                          disabled={isPaying}
                                          className="gap-2"
                                        >
                                          <CreditCard className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Thanh toán</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenRequestTransferDialog(
                                              invoice._id
                                            )
                                          }
                                          className="gap-2"
                                        >
                                          <Upload className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Gửi yêu cầu xác nhận chuyển khoản</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {totalItems === 0 ? 0 : (currentPage - 1) * pageLimit + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageLimit, totalItems)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{totalItems}</span> bản ghi
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || isFetching}
                  >
                    Trang trước
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Trang {totalPages ? currentPage : 0} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        totalPages ? Math.min(totalPages, p + 1) : p
                      )
                    }
                    disabled={
                      totalPages === 0 ||
                      currentPage >= totalPages ||
                      isFetching
                    }
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Detail Sheet */}
        <TenantInvoiceDetailSheet
          open={isDetailSheetOpen}
          onOpenChange={(open) => {
            setIsDetailSheetOpen(open);
            if (!open) setSelectedInvoiceId(null);
          }}
          invoiceId={selectedInvoiceId}
        />

        {/* Pay Invoice Dialog */}
        <TenantPayInvoiceDialog
          open={isPayDialogOpen && !paymentInfo}
          onOpenChange={(open) => {
            setIsPayDialogOpen(open);
            if (!open) {
              setPayingInvoiceId(null);
              setPaymentInfo(null);
            }
          }}
          invoiceId={payingInvoiceId}
          onPay={handlePayInvoice}
          isLoading={isPaying}
          paymentInfo={paymentInfo}
        />

        {/* Payment Info Dialog - Show when paymentInfo is available */}
        {paymentInfo && (
          <PaymentInfoDialog
            open={!!paymentInfo}
            onOpenChange={(open) => {
              if (!open) {
                setPaymentInfo(null);
                setPayingInvoiceId(null);
                setIsPayDialogOpen(false);
              }
            }}
            paymentInfo={paymentInfo}
          />
        )}

        {/* Request Transfer Confirmation Dialog */}
        <RequestTransferConfirmationDialogWrapper
          open={isRequestTransferDialogOpen}
          onOpenChange={(open) => {
            setIsRequestTransferDialogOpen(open);
            if (!open) setRequestTransferInvoiceId(null);
          }}
          invoiceId={requestTransferInvoiceId}
        />
      </div>
    </div>
  );
};

// Wrapper component to handle invoice detail query
const RequestTransferConfirmationDialogWrapper = ({
  open,
  onOpenChange,
  invoiceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
}) => {
  const { data: invoice } = useGetTenantInvoiceDetailsQuery(invoiceId || "", {
    skip: !invoiceId || !open,
  });

  return (
    <RequestTransferConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      invoice={invoice || null}
    />
  );
};

export default Invoice;
