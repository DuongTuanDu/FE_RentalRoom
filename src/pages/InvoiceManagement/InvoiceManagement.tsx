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
  FileText,
  Loader2,
  Edit,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import {
  useGetInvoicesQuery,
  usePayInvoiceMutation,
  useSendInvoiceMutation,
  useCreateGenerateMonthlyInvoiceMutation,
  useCreateGenerateInvoiceMutation,
  useUpdateInvoiceMutation,
  useSendDraftAllInvoicesMutation,
} from "@/services/invoice/invoice.service";
import type {
  InvoiceItem,
  IGenerateMonthlyInvoiceRequest,
  IGenerateInvoiceRequest,
  IUpdateInvoiceRequest,
  ISendDraftInvoiceRequest,
} from "@/types/invoice";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { InvoiceDetailSheet } from "./components/InvoiceDetailSheet";
import { PayInvoiceDialog } from "./components/PayInvoiceDialog";
import { GenerateMonthlyInvoiceDialog } from "./components/GenerateMonthlyInvoiceDialog";
import { GenerateInvoiceDialog } from "./components/GenerateInvoiceDialog";
import { InvoiceErrorDetailsDialog } from "./components/InvoiceErrorDetailsDialog";
import { UpdateInvoiceDialog } from "./components/UpdateInvoiceDialog";
import { SendDraftAllInvoicesDialog } from "./components/SendDraftAllInvoicesDialog";
import _ from "lodash";

const InvoiceManagement = () => {
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
  const [isGenerateMonthlyDialogOpen, setIsGenerateMonthlyDialogOpen] =
    useState(false);
  const [isGenerateInvoiceDialogOpen, setIsGenerateInvoiceDialogOpen] =
    useState(false);
  const [sendInvoicePopoverOpen, setSendInvoicePopoverOpen] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    errors: Array<{ roomNumber: string; message: string }>;
  } | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(
    null
  );
  const [isSendDraftAllDialogOpen, setIsSendDraftAllDialogOpen] =
    useState(false);

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
  const [generateMonthlyInvoice, { isLoading: isGeneratingMonthly }] =
    useCreateGenerateMonthlyInvoiceMutation();
  const [generateInvoice, { isLoading: isGeneratingInvoice }] =
    useCreateGenerateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const [sendDraftAllInvoices, { isLoading: isSendingDrafts }] =
    useSendDraftAllInvoicesMutation();

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
    paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
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

  const handleGenerateMonthlyInvoice = async (
    data: IGenerateMonthlyInvoiceRequest
  ) => {
    try {
      const response = await generateMonthlyInvoice({
        ...data,
        extraItems: data.extraItems || [],
      }).unwrap();

      // Kiểm tra nếu có lỗi trong response (một số API trả về 200 nhưng có failCount > 0)
      const responseData = response as any;
      if (
        responseData &&
        typeof responseData === "object" &&
        "failCount" in responseData &&
        Number(responseData.failCount) > 0
      ) {
        const errorData = responseData.message || [];
        const errors = errorData.map((err: any) => ({
          roomNumber: err.roomNumber || "N/A",
          message: err.message || "Không xác định",
        }));

        setErrorDetails({
          message: (responseData.message as string) || "Tạo hóa đơn có lỗi",
          errors,
        });
        setIsErrorDialogOpen(true);
        toast.error((responseData.message as string) || "Tạo hóa đơn có lỗi", {
          duration: 5000,
        });
      } else {
        toast.success("Tạo hóa đơn hàng loạt thành công!");
        setIsGenerateMonthlyDialogOpen(false);
      }
    } catch (error: any) {
      // Xử lý lỗi từ API response
      const errorResponse = error.message || error;
      console.log("errorResponse", errorResponse);

      // Nếu có cấu trúc data với danh sách lỗi chi tiết
      if (errorResponse?.data && Array.isArray(errorResponse.data)) {
        const errors = errorResponse.data.map((err: any) => ({
          roomNumber: err.roomNumber || "N/A",
          message: err.message || "Không xác định",
        }));

        setErrorDetails({
          message: errorResponse.message || "Tạo hóa đơn thất bại",
          errors,
        });
        setIsErrorDialogOpen(true);
        toast.error(errorResponse.message || "Tạo hóa đơn thất bại", {
          duration: 5000,
        });
      } else {
        toast.error(error?.message?.message || "Tạo hóa đơn thất bại!");
      }
    }
  };

  const handleGenerateInvoice = async (data: IGenerateInvoiceRequest) => {
    try {
      await generateInvoice({
        ...data,
        extraItems: data.extraItems || [],
      }).unwrap();
      toast.success("Tạo hóa đơn thành công!");
      setIsGenerateInvoiceDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message?.message || "Tạo hóa đơn thất bại!");
    }
  };

  const handleUpdateInvoice = async (
    invoiceId: string,
    data: IUpdateInvoiceRequest
  ) => {
    try {
      await updateInvoice({ id: invoiceId, data }).unwrap();
      toast.success("Cập nhật hóa đơn thành công!");
      setIsUpdateDialogOpen(false);
      setUpdatingInvoiceId(null);
      setIsDetailSheetOpen(false);
      setSelectedInvoiceId(null);
    } catch (error: any) {
      toast.error(error?.message?.message || "Cập nhật hóa đơn thất bại!");
    }
  };

  const handleSendDraftAllInvoices = async (data: ISendDraftInvoiceRequest) => {
    try {
      await sendDraftAllInvoices(data).unwrap();
      toast.success("Gửi tất cả hóa đơn nháp thành công!");
      setIsSendDraftAllDialogOpen(false);
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Gửi tất cả hóa đơn nháp thất bại!"
      );
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSendDraftAllDialogOpen(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Gửi tất cả hóa đơn nháp
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsGenerateMonthlyDialogOpen(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Tạo hóa đơn hàng loạt
          </Button>
          <Button onClick={() => setIsGenerateInvoiceDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Tạo hóa đơn
          </Button>
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
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
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
                ) : !invoicesData || invoicesData.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không có dữ liệu hóa đơn
                    </TableCell>
                  </TableRow>
                ) : (
                  invoicesData.data.map((invoice, idx) => (
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
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenDetailSheet(invoice._id)
                                  }
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xem chi tiết</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {invoice.status !== "paid" &&
                            invoice.status !== "cancelled" && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          setUpdatingInvoiceId(invoice._id);
                                          setIsUpdateDialogOpen(true);
                                        }}
                                        disabled={isUpdating}
                                      >
                                        <Edit className="h-4 w-4 text-green-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Cập nhật</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          handleOpenPayDialog(invoice._id)
                                        }
                                        disabled={isPaying}
                                      >
                                        <CreditCard className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Thanh toán</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {invoice.status === "draft" && (
                                  <Popover
                                    open={
                                      sendInvoicePopoverOpen &&
                                      sendingInvoiceId === invoice._id
                                    }
                                    onOpenChange={(open) => {
                                      setSendInvoicePopoverOpen(open);
                                      if (open) {
                                        setSendingInvoiceId(invoice._id);
                                      } else {
                                        setSendingInvoiceId(null);
                                      }
                                    }}
                                  >
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              disabled={isSending}
                                            >
                                              <Send className="h-4 w-4" />
                                            </Button>
                                          </PopoverTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Gửi email</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <PopoverContent
                                      className="w-80"
                                      align="end"
                                    >
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <h4 className="font-medium text-sm">
                                            Xác nhận gửi hóa đơn
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                            Bạn có chắc chắn muốn gửi hóa đơn{" "}
                                            <span className="font-medium">
                                              {invoice.invoiceNumber}
                                            </span>{" "}
                                            cho người thuê{" "}
                                            <span className="font-medium">
                                              {invoice.tenantId?.userInfo
                                                ?.fullName || "N/A"}
                                            </span>{" "}
                                            qua email?
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSendInvoicePopoverOpen(false);
                                              setSendingInvoiceId(null);
                                            }}
                                            disabled={isSending}
                                          >
                                            Hủy
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={async () => {
                                              if (sendingInvoiceId) {
                                                await handleSendInvoice(
                                                  sendingInvoiceId
                                                );
                                                setSendInvoicePopoverOpen(
                                                  false
                                                );
                                                setSendingInvoiceId(null);
                                              }
                                            }}
                                            disabled={isSending}
                                          >
                                            {isSending ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang gửi...
                                              </>
                                            ) : (
                                              "Xác nhận gửi"
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
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
        onUpdateClick={(invoiceId) => {
          setUpdatingInvoiceId(invoiceId);
          setIsUpdateDialogOpen(true);
        }}
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

      {/* Generate Monthly Invoice Dialog */}
      <GenerateMonthlyInvoiceDialog
        open={isGenerateMonthlyDialogOpen}
        onOpenChange={setIsGenerateMonthlyDialogOpen}
        onSubmit={handleGenerateMonthlyInvoice}
        isLoading={isGeneratingMonthly}
      />

      {/* Generate Invoice Dialog */}
      <GenerateInvoiceDialog
        open={isGenerateInvoiceDialogOpen}
        onOpenChange={setIsGenerateInvoiceDialogOpen}
        onSubmit={handleGenerateInvoice}
        isLoading={isGeneratingInvoice}
      />

      {/* Error Details Dialog */}
      <InvoiceErrorDetailsDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        errorDetails={errorDetails}
      />

      {/* Update Invoice Dialog */}
      {updatingInvoiceId && (
        <UpdateInvoiceDialog
          open={isUpdateDialogOpen}
          onOpenChange={(open) => {
            setIsUpdateDialogOpen(open);
            if (!open) setUpdatingInvoiceId(null);
          }}
          invoiceId={updatingInvoiceId}
          initialData={
            invoicesData?.data.find((inv) => inv._id === updatingInvoiceId)
              ? {
                  note:
                    invoicesData.data.find(
                      (inv) => inv._id === updatingInvoiceId
                    )?.note || "",
                  discountAmount:
                    invoicesData.data.find(
                      (inv) => inv._id === updatingInvoiceId
                    )?.discountAmount || 0,
                  lateFee:
                    invoicesData.data.find(
                      (inv) => inv._id === updatingInvoiceId
                    )?.lateFee || 0,
                  status:
                    invoicesData.data.find(
                      (inv) => inv._id === updatingInvoiceId
                    )?.status || "draft",
                }
              : undefined
          }
          onSubmit={handleUpdateInvoice}
          isLoading={isUpdating}
        />
      )}

      {/* Send Draft All Invoices Dialog */}
      <SendDraftAllInvoicesDialog
        open={isSendDraftAllDialogOpen}
        onOpenChange={setIsSendDraftAllDialogOpen}
        onSubmit={handleSendDraftAllInvoices}
        isLoading={isSendingDrafts}
      />
    </div>
  );
};

export default InvoiceManagement;
