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
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useGetTenantInvoiceDetailsQuery } from "@/services/invoice/invoice.service";

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
  const { data: invoice, isLoading, isError } = useGetTenantInvoiceDetailsQuery(
    invoiceId || "",
    { skip: !invoiceId || !open }
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
            <SheetDescription>
              Không thể tải thông tin hóa đơn
            </SheetDescription>
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
                <SheetTitle className="text-2xl font-bold">
                  Hóa đơn
                </SheetTitle>
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
                  <p className="text-sm text-muted-foreground">Ngày phát hành</p>
                  <p className="font-medium">{formatDate(invoice.issuedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hạn thanh toán</p>
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

          {/* Chi tiết hạng mục */}
          {invoice.items && invoice.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Chi tiết hạng mục
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
                <span className="font-medium">{formatPrice(invoice.subtotal)}</span>
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
          {invoice.status === "paid" && (
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
                      <p className="font-medium">{formatDate(invoice.paidAt)}</p>
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

