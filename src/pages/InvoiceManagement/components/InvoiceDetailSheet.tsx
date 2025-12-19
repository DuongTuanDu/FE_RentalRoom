import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Building2,
  User,
  Loader2,
  DollarSign,
  Mail,
  CreditCard,
  Clock,
  Receipt,
  UserCheck,
  Trash2,
  Send,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useGetInvoiceDetailsQuery } from "@/services/invoice/invoice.service";
import { Button } from "@/components/ui/button";

interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onInvoiceIdChange?: (newInvoiceId: string) => void;
}

export const InvoiceDetailSheet = ({
  open,
  onOpenChange,
  invoiceId,
  onInvoiceIdChange,
}: InvoiceDetailSheetProps) => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();
  const {
    data: invoice,
    isLoading,
    isError,
  } = useGetInvoiceDetailsQuery(invoiceId || "", { skip: !invoiceId || !open });

  // Fetch related invoices if they exist
  const { data: replacedByInvoice } = useGetInvoiceDetailsQuery(
    invoice?.data?.replacedByInvoiceId || "",
    { skip: !invoice?.data?.replacedByInvoiceId || !open }
  );

  const { data: replacementOfInvoice } = useGetInvoiceDetailsQuery(
    invoice?.data?.replacementOfInvoiceId || "",
    { skip: !invoice?.data?.replacementOfInvoiceId || !open }
  );

  const getStatusBadge = (status: string) => {
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
      transfer_pending: {
        label: "Chờ xác nhận chuyển khoản",
        className: "bg-orange-100 text-orange-800 border-orange-200",
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
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const getEmailStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Chờ gửi",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      sent: {
        label: "Đã gửi",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      failed: {
        label: "Gửi thất bại",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const getInvoiceKindBadge = (kind: "periodic" | "deposit") => {
    const kindConfig = {
      deposit: {
        label: "Hóa đơn cọc",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      periodic: {
        label: "Hóa đơn kỳ",
        className: "bg-indigo-100 text-indigo-800 border-indigo-200",
      },
    };
    const config = kindConfig[kind] || kindConfig.periodic;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const methodMap: Record<string, string> = {
      cash: "Tiền mặt",
      bank_transfer: "Chuyển khoản ngân hàng",
      online_gateway: "Cổng thanh toán trực tuyến",
    };
    return method ? methodMap[method] || method : "N/A";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rent: "Tiền thuê",
      electric: "Điện",
      water: "Nước",
      service: "Dịch vụ",
      other: "Khác",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      rent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      electric:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      water: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      service:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return (
      colors[type] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto pl-2 sm:pl-4">
          <SheetHeader className="space-y-4 pb-6">
            <SheetTitle>Chi tiết hóa đơn</SheetTitle>
            <SheetDescription>Đang tải thông tin...</SheetDescription>
          </SheetHeader>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (isError || !invoice || !invoice.data) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto pl-2 sm:pl-4">
          <SheetHeader className="space-y-4 pb-6">
            <SheetTitle>Chi tiết hóa đơn</SheetTitle>
            <SheetDescription>Không thể tải thông tin hóa đơn</SheetDescription>
          </SheetHeader>
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin hóa đơn
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const invoiceData = invoice.data;

  // Handler for navigating to related invoices
  const handleViewReplacedInvoice = () => {
    if (onInvoiceIdChange && invoiceData.replacementOfInvoiceId) {
      onInvoiceIdChange(invoiceData.replacementOfInvoiceId);
    }
  };

  const handleViewReplacementInvoice = () => {
    if (onInvoiceIdChange && invoiceData.replacedByInvoiceId) {
      onInvoiceIdChange(invoiceData.replacedByInvoiceId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto pl-2 sm:pl-4">
        <SheetHeader className="space-y-4 pb-2 px-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold">Hóa đơn</SheetTitle>
                <SheetDescription className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(invoiceData.status)}
                    {invoiceData.invoiceKind && getInvoiceKindBadge(invoiceData.invoiceKind)}
                    {/* {getEmailStatusBadge(invoiceData.emailStatus)} */}
                    {invoiceData.invoiceNumber && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Receipt className="w-4 h-4" />
                        <span className="font-medium">
                          Số hóa đơn: {invoiceData.invoiceNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Replacement Banners */}
        {(invoiceData.replacementOfInvoiceId ||
          invoiceData.replacedByInvoiceId) && (
          <div className="space-y-3 mb-4">
            {/* Banner: Hóa đơn này thay thế cho hóa đơn khác */}
            {invoiceData.replacementOfInvoiceId && (
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                    <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                        Hóa đơn thay thế
                      </h4>
                    </div>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Hóa đơn này thay thế cho hóa đơn{" "}
                      <span className="font-medium">
                        {replacementOfInvoice?.data?.invoiceNumber ||
                          invoiceData.replacementOfInvoiceId}
                      </span>
                      {replacementOfInvoice?.data?.replacedAt && (
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {" "}
                          (Thay thế vào{" "}
                          {formatDate(replacementOfInvoice.data.replacedAt)})
                        </span>
                      )}
                    </p>
                    {replacementOfInvoice?.data && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        onClick={handleViewReplacedInvoice}
                      >
                        Xem hóa đơn đã bị thay thế →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Banner: Hóa đơn này đã bị thay thế bởi hóa đơn khác */}
            {invoiceData.replacedByInvoiceId && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        Hóa đơn đã bị thay thế
                      </h4>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Hóa đơn này đã bị thay thế bởi hóa đơn{" "}
                      <span className="font-medium">
                        {replacedByInvoice?.data?.invoiceNumber ||
                          invoiceData.replacedByInvoiceId}
                      </span>
                      {invoiceData.replacedAt && (
                        <span className="text-orange-600 dark:text-orange-400">
                          {" "}
                          (Thay thế vào {formatDate(invoiceData.replacedAt)})
                        </span>
                      )}
                    </p>
                    {replacedByInvoice?.data && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                        onClick={handleViewReplacementInvoice}
                      >
                        Xem hóa đơn thay thế →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6 pb-6">
          {/* Thông tin người thuê */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4" />
              Thông tin người thuê
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Họ tên
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {invoiceData.tenantId?.userInfo?.fullName || "N/A"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Số điện thoại
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {invoiceData.tenantId?.userInfo?.phoneNumber || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin phòng */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4" />
              Thông tin phòng
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Tòa nhà
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {invoiceData.buildingId?.name || "N/A"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Địa chỉ
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {invoiceData.buildingId?.address || "N/A"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Phòng
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {invoiceData.roomId?.roomNumber || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin hợp đồng */}
          {invoiceData.contractId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4" />
                Thông tin hợp đồng
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Số hợp đồng
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {invoiceData.contractId?.contract?.no || "N/A"}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Ngày bắt đầu
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {invoiceData.contractId?.contract?.startDate
                      ? formatDate(invoiceData.contractId.contract.startDate)
                      : "N/A"}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Ngày kết thúc
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {invoiceData.contractId?.contract?.endDate
                      ? formatDate(invoiceData.contractId.contract.endDate)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chi tiết hóa đơn */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <DollarSign className="w-4 h-4" />
              Chi tiết hóa đơn
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kỳ thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Loại hóa đơn
                  </label>
                  <div className="mt-1">
                    {invoiceData.invoiceKind ? (
                      getInvoiceKindBadge(invoiceData.invoiceKind)
                    ) : (
                      <span className="text-base font-medium text-slate-900 dark:text-slate-100">
                        N/A
                      </span>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Tháng/Năm
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {invoiceData.periodMonth}/{invoiceData.periodYear}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Ngày phát hành
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(invoiceData.issuedAt)}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Hạn thanh toán
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(invoiceData.dueDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danh sách items */}
          {invoiceData.items && invoiceData.items.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4" />
                Danh sách khoản thu
              </div>
              <div className="space-y-6">
                {/* Bảng Tiền phòng */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tiền phòng
                  </h4>
                  {invoiceData.items.filter((item: any) => item.type === "rent")
                    .length > 0 ? (
                    <div className="border rounded-lg overflow-x-auto border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Loại</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead className="min-w-[260px]">
                              Mô tả
                            </TableHead>
                            <TableHead className="min-w-[120px] text-center">
                              Đơn giá
                            </TableHead>
                            {invoiceData.items.some(
                              (item: any) =>
                                item.type === "rent" &&
                                (item.meta?.paymentCycleMonths ||
                                  item.meta?.billedMonths ||
                                  item.meta?.from ||
                                  item.meta?.to)
                            ) && (
                              <>
                                <TableHead className="min-w-[120px] text-center">
                                  Chu kỳ (tháng)
                                </TableHead>
                                <TableHead className="min-w-[120px] text-center">
                                  Số tháng tính
                                </TableHead>
                                <TableHead className="min-w-[140px] text-center">
                                  Từ tháng/năm
                                </TableHead>
                                <TableHead className="min-w-[140px] text-center">
                                  Đến tháng/năm
                                </TableHead>
                              </>
                            )}
                            <TableHead className="min-w-[120px]">
                              Thành tiền
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceData.items.map((item: any, index: number) => {
                            if (item.type !== "rent") return null;
                            const hasMetaInfo =
                              item.meta?.paymentCycleMonths ||
                              item.meta?.billedMonths ||
                              item.meta?.from ||
                              item.meta?.to;
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getTypeColor(item.type)}
                                  >
                                    {getTypeLabel(item.type)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-slate-900 dark:text-slate-100">
                                    {item.label || "—"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {item.description || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm text-right text-slate-900 dark:text-slate-100">
                                    {formatPrice(item.unitPrice)}
                                  </span>
                                </TableCell>
                                {hasMetaInfo && (
                                  <>
                                    <TableCell className="text-center">
                                      <span className="text-sm text-slate-900 dark:text-slate-100">
                                        {item.meta?.paymentCycleMonths
                                          ? `${item.meta.paymentCycleMonths} tháng`
                                          : "—"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-sm text-slate-900 dark:text-slate-100">
                                        {item.meta?.billedMonths
                                          ? `${item.meta.billedMonths} tháng`
                                          : "—"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-sm text-slate-900 dark:text-slate-100">
                                        {item.meta?.from
                                          ? `Tháng ${item.meta.from.month}/${item.meta.from.year}`
                                          : "—"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-sm text-slate-900 dark:text-slate-100">
                                        {item.meta?.to
                                          ? `Tháng ${item.meta.to.month}/${item.meta.to.year}`
                                          : "—"}
                                      </span>
                                    </TableCell>
                                  </>
                                )}
                                <TableCell>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {formatPrice(item.amount)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                        Tiền phòng đã thu theo kỳ (tháng này không thu)
                      </p>
                    </div>
                  )}
                </div>

                {/* Bảng Điện nước */}
                {invoiceData.items.filter(
                  (item: any) =>
                    item.type === "electric" || item.type === "water"
                ).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Điện nước
                    </h4>
                    <div className="border rounded-lg overflow-x-auto border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Loại</TableHead>
                            <TableHead className="min-w-[120px]">Tên</TableHead>
                            <TableHead className="min-w-[260px]">
                              Mô tả
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                              Chỉ số cũ
                            </TableHead>
                            <TableHead className="w-[100px]">
                              Chỉ số hiện tại
                            </TableHead>
                            <TableHead className="w-[80px]">
                              Số lượng tiêu thụ
                            </TableHead>
                            <TableHead className="min-w-[120px] text-center">
                              Đơn giá
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              Thành tiền
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceData.items.map((item: any, index: number) => {
                            if (
                              item.type !== "electric" &&
                              item.type !== "water"
                            )
                              return null;
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getTypeColor(item.type)}
                                  >
                                    {getTypeLabel(item.type)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="min-w-[120px]">
                                  <span className="text-sm text-slate-900 dark:text-slate-100">
                                    {item.label || "—"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {item.description || "—"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-slate-900 dark:text-slate-100">
                                    {(item as any).meta?.previousIndex ?? "—"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-slate-900 dark:text-slate-100">
                                    {(item as any).meta?.currentIndex ?? "—"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm text-right text-slate-900 dark:text-slate-100">
                                    {item.quantity}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm text-right text-slate-900 dark:text-slate-100">
                                    {formatPrice(item.unitPrice)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {formatPrice(item.amount)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Bảng Tiền dịch vụ và Chi phí khác */}
                {invoiceData.items.filter(
                  (item: any) =>
                    item.type === "service" || item.type === "other"
                ).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tiền dịch vụ và Chi phí khác
                    </h4>
                    <div className="border rounded-lg overflow-x-auto border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Loại</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead className="min-w-[260px]">
                              Mô tả
                            </TableHead>
                            <TableHead className="w-[80px]">Số lượng</TableHead>
                            <TableHead className="min-w-[120px] text-center">
                              Đơn giá
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              Thành tiền
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceData.items.map((item: any, index: number) => {
                            if (
                              item.type !== "service" &&
                              item.type !== "other"
                            )
                              return null;
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getTypeColor(item.type)}
                                  >
                                    {getTypeLabel(item.type)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-slate-900 dark:text-slate-100">
                                    {item.label || "—"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {item.description || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm text-right text-slate-900 dark:text-slate-100">
                                    {item.quantity}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm text-right text-slate-900 dark:text-slate-100">
                                    {formatPrice(item.unitPrice)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {formatPrice(item.amount)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tổng kết */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tổng kết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Tạm tính
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {formatPrice(invoiceData.subtotal)}
                </p>
              </div>
              {invoiceData.discountAmount > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Giảm trừ
                    </label>
                    <p className="text-base font-medium text-red-600 dark:text-red-400">
                      -{formatPrice(invoiceData.discountAmount)}
                    </p>
                  </div>
                </>
              )}
              {invoiceData.lateFee > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Phí trễ hạn
                    </label>
                    <p className="text-base font-medium text-red-600 dark:text-red-400">
                      {formatPrice(invoiceData.lateFee)}
                    </p>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Tổng cộng
                </label>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(invoiceData.totalAmount)}
                </p>
              </div>
              {invoiceData.paidAmount > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Đã thanh toán
                    </label>
                    <p className="text-base font-medium text-green-600 dark:text-green-400">
                      {formatPrice(invoiceData.paidAmount)}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Còn lại
                    </label>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatPrice(
                        invoiceData.totalAmount - invoiceData.paidAmount
                      )}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Thông tin thanh toán */}
          {(invoiceData.status === "paid" ||
            invoiceData.status === "transfer_pending") &&
            invoiceData.paymentMethod && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CreditCard className="w-4 h-4" />
                  Thông tin thanh toán
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Phương thức thanh toán
                    </label>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                      {getPaymentMethodLabel(invoiceData.paymentMethod)}
                    </p>
                  </div>
                  {invoiceData.paymentNote && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400">
                          Ghi chú thanh toán
                        </label>
                        <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1 whitespace-pre-wrap">
                          {invoiceData.paymentNote}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          {/* Thông tin chuyển khoản */}
          {invoiceData.status === "transfer_pending" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Send className="w-4 h-4" />
                Thông tin yêu cầu chuyển khoản
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                {invoiceData.transferRequestedAt && (
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Thời gian yêu cầu
                    </label>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                      {formatDate(invoiceData.transferRequestedAt)}
                    </p>
                  </div>
                )}
                {invoiceData.transferProofImageUrl && (
                  <>
                    {invoiceData.transferRequestedAt && <Separator />}
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                        Ảnh chứng từ chuyển khoản
                      </label>
                      <div className="mt-2">
                        <div className="relative group inline-block">
                          <div className="aspect-square relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 max-w-xs">
                            <img
                              src={invoiceData.transferProofImageUrl}
                              alt="Ảnh chứng từ chuyển khoản"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    invoiceData.transferProofImageUrl,
                                    "_blank"
                                  )
                                }
                                className="text-white text-sm font-medium px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
                              >
                                Xem ảnh
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Thông tin email */}
          {invoiceData.emailStatus && invoiceData.emailStatus !== "pending" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4" />
                Thông tin gửi email
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Trạng thái
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {getEmailStatusBadge(invoiceData.emailStatus)}
                  </p>
                </div>
                {invoiceData.emailSentAt && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Thời gian gửi email
                      </label>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {formatDate(invoiceData.emailSentAt)}
                      </p>
                    </div>
                  </>
                )}
                {invoiceData.reminders && invoiceData.reminders.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Lịch sử gửi
                      </label>
                      <div className="mt-2 space-y-2">
                        {invoiceData.reminders.map((reminder, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="text-slate-700 dark:text-slate-300">
                              {formatDate(reminder.sentAt)} - {reminder.channel}{" "}
                              - {reminder.status}
                            </p>
                            {reminder.note && (
                              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                                {reminder.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Ghi chú */}
          {invoiceData.note && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4" />
                Ghi chú
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {invoiceData.note}
                </p>
              </div>
            </div>
          )}

          {/* Thông tin hệ thống */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4" />
              Thông tin hệ thống
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              {invoiceData.createdBy && (
                <>
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Người tạo
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {invoiceData.createdBy}
                    </p>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Ngày tạo
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(invoiceData.createdAt)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Cập nhật lần cuối
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(invoiceData.updatedAt)}
                </p>
              </div>
              {invoiceData.isDeleted && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Trạng thái
                    </label>
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-800 border-red-200"
                    >
                      Đã xóa
                    </Badge>
                  </div>
                  {invoiceData.deletedAt && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-600 dark:text-slate-400">
                          Ngày xóa
                        </label>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          {formatDate(invoiceData.deletedAt)}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
