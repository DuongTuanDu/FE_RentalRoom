import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Eye,
  Send,
  CreditCard,
  Calendar,
  Building2,
  DoorOpen,
  User,
  Filter,
  X,
} from "lucide-react";
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
import {
  useGetInvoicesQuery,
  usePayInvoiceMutation,
  useSendInvoiceMutation,
} from "@/services/invoice/invoice.service";
import type { InvoiceItem } from "@/types/invoice";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { InvoiceDetailSheet } from "./components/InvoiceDetailSheet";
import { PayInvoiceDialog } from "./components/PayInvoiceDialog";
import _ from "lodash";

const InvoiceManagement = () => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "sent" | "paid" | "overdue" | "cancelled"
  >("all");
  const [buildingId, setBuildingId] = useState("");
  const [roomId, setRoomId] = useState("");
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
  }, [statusFilter, buildingId, roomId, periodMonth, periodYear]);

  // Fetch invoices
  const {
    data: invoicesData,
    isLoading,
    isFetching,
  } = useGetInvoicesQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    buildingId: buildingId || undefined,
    roomId: roomId || undefined,
    periodMonth: periodMonth && periodMonth !== "all" ? periodMonth : undefined,
    periodYear: periodYear && periodYear !== "all" ? periodYear : undefined,
    page: currentPage,
    limit: pageLimit,
    search: debouncedSearch || undefined,
  });

  // Mutations
  const [payInvoice, { isLoading: isPaying }] = usePayInvoiceMutation();
  const [sendInvoice, { isLoading: isSending }] = useSendInvoiceMutation();

  const totalItems = invoicesData?.total ?? 0;
  const totalPages = Math.ceil(totalItems / pageLimit);

  // Status badge helper
  const getStatusBadge = (status: InvoiceItem["status"]) => {
    const statusConfig = {
      draft: {
        label: "Nháp",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      sent: {
        label: "Đã gửi",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      paid: {
        label: "Đã thanh toán",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      overdue: {
        label: "Quá hạn",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      cancelled: {
        label: "Đã hủy",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={config.className} variant="outline">
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

  const handlePayInvoice = async (data: {
    paymentMethod: string;
    paidAt: string;
    note: string;
  }) => {
    if (!payingInvoiceId) return;

    try {
      await payInvoice({
        id: payingInvoiceId,
        data,
      }).unwrap();
      toast.success("Đánh dấu thanh toán thành công!");
      setIsPayDialogOpen(false);
      setPayingInvoiceId(null);
    } catch (error: any) {
      toast.error(error?.message?.message || "Đánh dấu thanh toán thất bại!");
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await sendInvoice(invoiceId).unwrap();
      toast.success("Gửi hóa đơn thành công!");
    } catch (error: any) {
      toast.error(error?.message?.message || "Gửi hóa đơn thất bại!");
    }
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Hóa đơn
          </h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi các hóa đơn thuê phòng
          </p>
        </div>
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
              placeholder="Tìm kiếm theo số hóa đơn, tên người thuê, phòng..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Building Filter */}
            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <BuildingSelectCombobox
                value={buildingId}
                onValueChange={setBuildingId}
              />
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
            buildingId ||
            roomId ||
            (periodMonth && periodMonth !== "all") ||
            (periodYear && periodYear !== "all") ||
            searchQuery) && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setBuildingId("");
                  setRoomId("");
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
              onValueChange={(v) => setPageLimit(Number(v))}
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
                  <TableHead>Người thuê</TableHead>
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
                      colSpan={11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : !invoicesData || invoicesData.items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không có dữ liệu hóa đơn
                    </TableCell>
                  </TableRow>
                ) : (
                  invoicesData.items.map((invoice, idx) => (
                    <TableRow key={invoice._id}>
                      <TableCell>
                        {(currentPage - 1) * pageLimit + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {invoice.tenantId?.userInfo?.fullName || "N/A"}
                          </span>
                        </div>
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
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetailSheet(invoice._id)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status !== "paid" &&
                            invoice.status !== "cancelled" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenPayDialog(invoice._id)
                                  }
                                  title="Thanh toán"
                                  disabled={isPaying}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleSendInvoice(invoice._id)}
                                  title="Gửi email"
                                  disabled={isSending}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
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
              trong tổng số <span className="font-medium">{totalItems}</span>{" "}
              bản ghi
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
                  totalPages === 0 || currentPage >= totalPages || isFetching
                }
              >
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Sheet */}
      <InvoiceDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) setSelectedInvoiceId(null);
        }}
        invoiceId={selectedInvoiceId}
      />

      {/* Pay Invoice Dialog */}
      <PayInvoiceDialog
        open={isPayDialogOpen}
        onOpenChange={(open) => {
          setIsPayDialogOpen(open);
          if (!open) setPayingInvoiceId(null);
        }}
        invoiceId={payingInvoiceId}
        onPay={handlePayInvoice}
        isLoading={isPaying}
      />
    </div>
  );
};

export default InvoiceManagement;
