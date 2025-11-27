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
import { Button } from "@/components/ui/button";
import {
  FileText,
  Building2,
  User,
  Loader2,
  DollarSign,
  Mail,
  CreditCard,
  Clock,
  Edit,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useGetInvoiceDetailsQuery } from "@/services/invoice/invoice.service";

interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onUpdateClick?: (invoiceId: string) => void;
}

export const InvoiceDetailSheet = ({
  open,
  onOpenChange,
  invoiceId,
  onUpdateClick,
}: InvoiceDetailSheetProps) => {
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();
  const { data: invoice, isLoading, isError } = useGetInvoiceDetailsQuery(
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

  const invoiceData = invoice.data;

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
                  {getStatusBadge(invoiceData.status)}
                  {getEmailStatusBadge(invoiceData.emailStatus)}
                </SheetDescription>
              </div>
            </div>
            {onUpdateClick && invoiceId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateClick(invoiceId)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Cập nhật
              </Button>
            )}
          </div>
        </SheetHeader>

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
                  Email
                </label>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {invoiceData.tenantId?.email || "N/A"}
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
              <Card className="py-0">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Loại
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Mô tả
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Số lượng
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Đơn giá
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {invoiceData.items.map((item, idx) => (
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
                      {formatPrice(invoiceData.totalAmount - invoiceData.paidAmount)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Thông tin thanh toán */}
          {invoiceData.status === "paid" && invoiceData.paymentMethod && (
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
                    {invoiceData.paymentMethod}
                  </p>
                </div>
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
                              {formatDate(reminder.sentAt)} - {reminder.channel} -{" "}
                              {reminder.status}
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
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

