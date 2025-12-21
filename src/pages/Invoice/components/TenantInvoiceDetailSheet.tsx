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
  FileText,
  Building2,
  Loader2,
  DollarSign,
  CreditCard,
  Clock,
  DoorOpen,
  Send,
  Mail,
  History,
  User,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useGetTenantInvoiceDetailsQuery } from "@/services/invoice/invoice.service";
import { vi } from "date-fns/locale";
import { format } from "date-fns";

interface TenantInvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
}

export const TenantInvoiceDetailSheet = ({
  open,
  onOpenChange,
  invoiceId,
}: TenantInvoiceDetailSheetProps) => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();
  const {
    data: invoice,
    isLoading,
    isError,
  } = useGetTenantInvoiceDetailsQuery(invoiceId || "", {
    skip: !invoiceId || !open,
  });

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

  const getPaymentMethodLabel = (
    method: "cash" | "bank_transfer" | "online_gateway" | null
  ) => {
    const methods = {
      cash: "Tiền mặt",
      bank_transfer: "Chuyển khoản ngân hàng",
      online_gateway: "Cổng thanh toán trực tuyến",
    };
    return method ? methods[method] : "Chưa thanh toán";
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

  if (isError || !invoice) {
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
                <SheetDescription className="flex items-center gap-2 mt-1">
                  {getStatusBadge(invoice.status)}
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-5">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin hóa đơn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Số hóa đơn</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kỳ thanh toán</p>
                  <p className="font-medium">
                    Tháng {invoice.periodMonth}/{invoice.periodYear}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ngày phát hành
                  </p>
                  <p className="font-medium">{formatDate(invoice.issuedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Hạn thanh toán
                  </p>
                  <p
                    className={`font-medium ${
                      invoice.status === "overdue"
                        ? "text-red-600"
                        : invoice.status === "paid"
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin phòng */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Thông tin phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Tòa nhà
                  </p>
                  <p className="font-medium">{invoice.buildingId.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {invoice.buildingId.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <DoorOpen className="h-4 w-4" />
                    Phòng
                  </p>
                  <p className="font-medium">{invoice.roomId.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Số hợp đồng
                  </p>
                  <p className="font-medium">
                    {invoice.contractId?.contract?.no || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin hợp đồng */}
          {invoice.contractId && (
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
                    {invoice.contractId?.contract?.no || "N/A"}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Ngày bắt đầu
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {invoice.contractId?.contract?.startDate
                      ? formatDate(invoice.contractId.contract.startDate)
                      : "N/A"}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Ngày kết thúc
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {invoice.contractId?.contract?.endDate
                      ? formatDate(invoice.contractId.contract.endDate)
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
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Tháng/Năm
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {invoice.periodMonth}/{invoice.periodYear}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Ngày phát hành
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(invoice.issuedAt)}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Hạn thanh toán
                  </label>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chi tiết hạng mục */}
          {invoice.items && invoice.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Danh sách khoản thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Loại
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Mô tả
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Số lượng
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Đơn giá
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="outline">{item.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {item.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatPrice(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {invoice.history && invoice.history.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <History className="w-4 h-4" />
                Lịch sử cập nhật
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {invoice.history.map((historyItem) => (
                      <div
                        key={historyItem._id}
                        className="relative pl-6 pb-4 border-l-2 border-slate-200 dark:border-slate-700 last:border-l-0 last:pb-0"
                      >
                        <div className="absolute -left-[5px] top-0 w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 border-2 border-background" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {historyItem.updatedBy.email}
                              </span>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(
                                new Date(historyItem.updatedAt),
                                "dd/MM/yyyy HH:mm",
                                {
                                  locale: vi,
                                }
                              )}
                            </span>
                          </div>

                          {/* Items Changes */}
                          {(historyItem.itemsDiff.updated.length > 0 ||
                            historyItem.itemsDiff.added.length > 0 ||
                            historyItem.itemsDiff.removed.length > 0) && (
                            <div className="space-y-2 mt-3">
                              {/* Updated Items */}
                              {historyItem.itemsDiff.updated.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    Đã cập nhật (
                                    {historyItem.itemsDiff.updated.length}):
                                  </p>
                                  {historyItem.itemsDiff.updated.map(
                                    (item, itemIdx) => (
                                      <div
                                        key={itemIdx}
                                        className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs space-y-1"
                                      >
                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                          {getTypeLabel(item.type)} -{" "}
                                          {item.label}
                                        </div>
                                        <div className="space-y-0.5 pl-2">
                                          {Object.entries(item.changes).map(
                                            ([key, change]) => (
                                              <div
                                                key={key}
                                                className="flex items-center gap-2 flex-wrap"
                                              >
                                                <span className="text-slate-600 dark:text-slate-400 min-w-[80px]">
                                                  {key === "quantity"
                                                    ? "Số lượng"
                                                    : key === "unitPrice"
                                                    ? "Đơn giá"
                                                    : key === "amount"
                                                    ? "Thành tiền"
                                                    : key === "label"
                                                    ? "Tên"
                                                    : key === "description"
                                                    ? "Mô tả"
                                                    : key === "currentIndex"
                                                    ? "Chỉ số hiện tại"
                                                    : key === "previousIndex"
                                                    ? "Chỉ số cũ"
                                                    : key}
                                                  :
                                                </span>
                                                <span className="line-through text-red-600 dark:text-red-400">
                                                  {typeof change.before ===
                                                    "number" &&
                                                  (key === "unitPrice" ||
                                                    key === "amount")
                                                    ? formatPrice(change.before)
                                                    : change.before}
                                                </span>
                                                <span className="text-green-600 dark:text-green-400 font-medium">
                                                  →
                                                </span>
                                                <span className="text-green-600 dark:text-green-400 font-medium">
                                                  {typeof change.after ===
                                                    "number" &&
                                                  (key === "unitPrice" ||
                                                    key === "amount")
                                                    ? formatPrice(change.after)
                                                    : change.after}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                              {/* Added Items */}
                              {historyItem.itemsDiff.added.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                    Đã thêm (
                                    {historyItem.itemsDiff.added.length}):
                                  </p>
                                  {historyItem.itemsDiff.added.map(
                                    (item, itemIdx) => (
                                      <div
                                        key={itemIdx}
                                        className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs"
                                      >
                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                          {getTypeLabel(item.type)} -{" "}
                                          {item.label}
                                        </div>
                                        {item.description && (
                                          <div className="text-slate-600 dark:text-slate-400 mt-1">
                                            {item.description}
                                          </div>
                                        )}
                                        {(item.quantity !== undefined ||
                                          item.unitPrice !== undefined ||
                                          item.amount !== undefined) && (
                                          <div className="mt-1 space-x-2 text-slate-600 dark:text-slate-400">
                                            {item.quantity !== undefined && (
                                              <span>
                                                Số lượng: {item.quantity}
                                              </span>
                                            )}
                                            {item.unitPrice !== undefined && (
                                              <span>
                                                Đơn giá:{" "}
                                                {formatPrice(item.unitPrice)}
                                              </span>
                                            )}
                                            {item.amount !== undefined && (
                                              <span>
                                                Thành tiền:{" "}
                                                {formatPrice(item.amount)}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                              {/* Removed Items */}
                              {historyItem.itemsDiff.removed.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                                    Đã xóa (
                                    {historyItem.itemsDiff.removed.length}):
                                  </p>
                                  {historyItem.itemsDiff.removed.map(
                                    (item, itemIdx) => (
                                      <div
                                        key={itemIdx}
                                        className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs"
                                      >
                                        <div className="font-medium line-through text-slate-900 dark:text-slate-100">
                                          {getTypeLabel(item.type)} -{" "}
                                          {item.label}
                                        </div>
                                        {item.description && (
                                          <div className="text-slate-600 dark:text-slate-400 mt-1 line-through">
                                            {item.description}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Meta Changes */}
                          {historyItem.metaDiff &&
                            Object.keys(historyItem.metaDiff).length > 0 && (
                              <div className="space-y-1 mt-3">
                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                  Thay đổi thông tin khác:
                                </p>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-xs space-y-0.5">
                                  {Object.entries(historyItem.metaDiff).map(
                                    ([key, change]) => (
                                      <div
                                        key={key}
                                        className="flex items-center gap-2 flex-wrap"
                                      >
                                        <span className="text-slate-600 dark:text-slate-400 min-w-[100px]">
                                          {key === "note"
                                            ? "Ghi chú"
                                            : key === "discountAmount"
                                            ? "Giảm trừ"
                                            : key === "lateFee"
                                            ? "Phí trễ hạn"
                                            : key === "status"
                                            ? "Trạng thái"
                                            : key}
                                          :
                                        </span>
                                        <span className="line-through text-red-600 dark:text-red-400">
                                          {change.before === null
                                            ? "—"
                                            : typeof change.before ===
                                                "number" &&
                                              (key === "discountAmount" ||
                                                key === "lateFee")
                                            ? formatPrice(change.before)
                                            : String(change.before)}
                                        </span>
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                          →
                                        </span>
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                          {change.after === null
                                            ? "—"
                                            : typeof change.after ===
                                                "number" &&
                                              (key === "discountAmount" ||
                                                key === "lateFee")
                                            ? formatPrice(change.after)
                                            : String(change.after)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tổng kết */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tổng kết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Tạm tính:
                </span>
                <span className="font-medium">
                  {formatPrice(invoice.subtotal)}
                </span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    Giảm giá:
                  </span>
                  <span className="font-medium text-green-600">
                    -{formatPrice(invoice.discountAmount)}
                  </span>
                </div>
              )}
              {invoice.lateFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    Phí trễ hạn:
                  </span>
                  <span className="font-medium text-red-600">
                    +{formatPrice(invoice.lateFee)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(invoice.totalAmount)}
                </span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      Đã thanh toán:
                    </span>
                    <span className="font-medium text-green-600">
                      {formatPrice(invoice.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      Còn lại:
                    </span>
                    <span className="font-bold text-orange-600">
                      {formatPrice(invoice.totalAmount - invoice.paidAmount)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Thông tin thanh toán */}
          {(invoice.status === "paid" ||
            invoice.status === "transfer_pending") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thông tin thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Phương thức thanh toán
                    </p>
                    <p className="font-medium">
                      {getPaymentMethodLabel(invoice.paymentMethod)}
                    </p>
                  </div>
                  {invoice.paidAt && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Ngày thanh toán
                      </p>
                      <p className="font-medium">
                        {formatDate(invoice.paidAt)}
                      </p>
                    </div>
                  )}
                  {invoice.paymentNote && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Ghi chú</p>
                      <p className="font-medium">{invoice.paymentNote}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Thông tin chuyển khoản */}
          {invoice.status === "transfer_pending" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Send className="w-4 h-4" />
                Thông tin yêu cầu chuyển khoản
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                {invoice.transferRequestedAt && (
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Thời gian yêu cầu
                    </label>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                      {formatDate(invoice.transferRequestedAt)}
                    </p>
                  </div>
                )}
                {invoice.transferProofImageUrl && (
                  <>
                    {invoice.transferRequestedAt && <Separator />}
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                        Ảnh chứng từ chuyển khoản
                      </label>
                      <div className="mt-2">
                        <div className="relative group inline-block">
                          <div className="aspect-square relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 max-w-xs">
                            <img
                              src={invoice.transferProofImageUrl}
                              alt="Ảnh chứng từ chuyển khoản"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    invoice.transferProofImageUrl,
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
          {invoice.emailStatus && invoice.emailStatus !== "pending" && (
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
                    {getEmailStatusBadge(invoice.emailStatus)}
                  </p>
                </div>
                {invoice.emailSentAt && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Thời gian gửi email
                      </label>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {formatDate(invoice.emailSentAt)}
                      </p>
                    </div>
                  </>
                )}
                {invoice.reminders && invoice.reminders.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        Lịch sử gửi
                      </label>
                      <div className="mt-2 space-y-2">
                        {invoice.reminders.map((reminder, idx) => (
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
