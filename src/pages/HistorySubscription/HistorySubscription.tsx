import { useEffect, useState } from "react";
import {
  Package,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useGetMySubscriptionsQuery } from "@/services/package-services/package-subscription.service";
import {
  useRenewSubscriptionMutation,
  useCancelSubscriptionMutation,
} from "@/services/package-services/package-subscription.service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import moment from 'moment';
import type { ISubscription } from "@/types/package-subscription";
import { set } from "lodash";

export const HistorySubscription = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");

  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: subscriptions, isLoading, refetch } = useGetMySubscriptionsQuery();
  const [renewSubscription, { isLoading: isRenewing }] = useRenewSubscriptionMutation();
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<ISubscription | null>(null);
  const allSubscriptions: ISubscription[] = subscriptions || [];

  const formatDate = (date: string) => new Date(date).toLocaleDateString("vi-VN");
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleRenewConfirm = async () => {
    try {
      const result = await renewSubscription().unwrap();

      if (result?.data.paymentUrl) {
        toast.success("Đang chuyển bạn đến cổng thanh toán VNPay...", {
          duration: 3000,
        });
        window.location.href = result?.data.paymentUrl;
        return;
      }

      toast.info("Bạn đã có yêu cầu gia hạn rồi.");
      refetch();
      setRenewDialogOpen(false);

    } catch (err: any) {
      const message = err?.data?.message || err?.message || "Gia hạn thất bại";

      if (message.includes("30 ngày")) {
        toast.error("Chỉ được gia hạn khi gói còn ≤ 30 ngày");
      } else if (message.includes("gói trial")) {
        toast.error("Không thể gia hạn gói dùng thử");
      } else if (message.includes("đã có gói gia hạn")) {
        toast.error("Không thể gia hạn thêm", {
          description: "Bạn đã có 1 gói gia hạn đang chờ hoặc sắp kích hoạt.",
        });
      } else {
        toast.error("Gia hạn thất bại", { description: message });
      }

      setRenewDialogOpen(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!subscriptionToCancel?._id) {
      toast.error("Không tìm thấy gói cần hủy.");
      return;
    }

    try {
      await cancelSubscription(subscriptionToCancel._id).unwrap();
      toast.success("Gói dịch vụ đã được hủy thành công.");
      refetch();
      setCancelDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message?.message || "Không thể hủy gói dịch vụ lúc này.");
    }
  };

  const activeSubscription2 = allSubscriptions.find(sub => sub.status === "active");

  const hasExistingRenewal = allSubscriptions.some(sub =>
    sub.isRenewal === true &&
    sub.renewedFrom?.toString() === activeSubscription2?._id?.toString() &&
    ["pending_payment", "upcoming"].includes(sub.status)
  );

  const filteredSubscriptions = statusFilter === "all"
    ? allSubscriptions
    : allSubscriptions.filter((sub) => sub.status === statusFilter);

  const totalPages = Math.ceil(filteredSubscriptions.length / pageLimit);
  const startIndex = (currentPage - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

  const STATUS_LABELS = {
    active: "Đang hoạt động",
    expired: "Đã hết hạn",
    cancelled: "Đã hủy",
    upcoming: "Sắp kích hoạt",
  } as const;

  const STATUS_COLORS = {
    active: "bg-blue-100 text-blue-800 border-blue-200",
    expired: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    upcoming: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const activeSubscription = allSubscriptions.find(sub => sub.status === "active");

  return (
    <>
      <div className="container mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Package className="h-8 w-8" />
              Lịch sử Gói dịch vụ
            </h1>
            <p className="text-muted-foreground">Quản lý các gói dịch vụ đã và đang sử dụng</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng gói đã mua</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSubscriptions.length}</div>
              <p className="text-xs text-muted-foreground">Tất cả các gói dịch vụ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(allSubscriptions.reduce((sum, sub) => sum + sub.amount, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Tổng số tiền đã thanh toán</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Danh sách gói dịch vụ</CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium whitespace-nowrap">Trạng thái</span>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="expired">Đã hết hạn</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Package className="h-16 w-16 mx-auto text-muted-foreground/40" />
                <p className="text-lg text-muted-foreground">
                  {statusFilter === "all"
                    ? "Bạn chưa mua gói dịch vụ nào"
                    : "Không tìm thấy gói dịch vụ nào phù hợp với bộ lọc"}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên gói</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Thời hạn</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead>Còn lại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubscriptions.map((sub) => {
                        const daysLeft = calculateDaysRemaining(sub.endDate);
                        const isActive = sub.status === "active";
                        const isUpcoming = sub.status === "upcoming";

                        const canCancel = isActive || isUpcoming;

                        return (
                          <TableRow
                            key={sub._id}
                            className={`
                              transition-all duration-200
                              ${isActive ? 'bg-blue-50/50 border-l-4 border-l-blue-500 shadow-sm' : ''}
                              ${isUpcoming ? 'bg-amber-50/30 border-l-4 border-l-amber-400' : ''}
                            `}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Package className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-muted-foreground'
                                  }`} />
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {sub.packageId.name}
                                    {isActive && (
                                      <Badge variant="default" className="text-xs bg-blue-600">
                                        Hiện tại
                                      </Badge>
                                    )}
                                    {isUpcoming && (
                                      <Badge variant="secondary" className="text-xs">
                                        Sắp tới
                                      </Badge>
                                    )}
                                  </div>
                                  {sub.packageId.description && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {sub.packageId.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="font-medium">
                              {formatCurrency(sub.packageId.price)}
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {sub.packageId.durationDays} ngày
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(sub.startDate)}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(sub.endDate)}
                              </div>
                            </TableCell>

                            <TableCell>
                              {isActive ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                                  {daysLeft} ngày
                                </Badge>
                              ) : isUpcoming ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Chờ kích hoạt
                                </Badge>
                              ) : sub.status === "expired" ? (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                  0 ngày
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`flex w-fit items-center gap-1.5 font-medium ${isActive
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : isUpcoming
                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                    : STATUS_COLORS[sub.status as keyof typeof STATUS_COLORS]
                                  }`}
                              >
                                {isActive && <CheckCircle className="h-3.5 w-3.5" />}
                                {isUpcoming && <Clock className="h-3.5 w-3.5" />}
                                {sub.status === "expired" && <Clock className="h-3.5 w-3.5" />}
                                {sub.status === "cancelled" && <XCircle className="h-3.5 w-3.5" />}
                                {STATUS_LABELS[sub.status as keyof typeof STATUS_LABELS]}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              {(isActive || isUpcoming) ? (
                                <div className="flex justify-end gap-2">
                                  {isActive && !hasExistingRenewal && daysLeft <= 7 && (
                                    <Button
                                      size="sm"
                                      onClick={() => setRenewDialogOpen(true)}
                                    >
                                      {isRenewing ? (
                                        <>
                                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                          Đang xử lý...
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                          Gia hạn
                                        </>
                                      )}
                                    </Button>
                                  )}

                                  {canCancel && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setCancelDialogOpen(true);
                                        setSubscriptionToCancel(sub);
                                      }}
                                      disabled={isRenewing || isCancelling}
                                    >
                                      {isCancelling ? (
                                        <>
                                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                          Đang hủy...
                                        </>
                                      ) : (
                                        "Hủy gói"
                                      )}
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <span ></span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị <span className="font-medium">{startIndex + 1}</span> -{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredSubscriptions.length)}
                    </span>{" "}
                    trong tổng <span className="font-medium">{filteredSubscriptions.length}</span> gói
                  </p>

                  <div className="flex items-center gap-3">
                    <Select
                      value={pageLimit.toString()}
                      onValueChange={(v) => {
                        setPageLimit(Number(v));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 gói</SelectItem>
                        <SelectItem value="20">20 gói</SelectItem>
                        <SelectItem value="50">50 gói</SelectItem>
                        <SelectItem value="100">100 gói</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Xác nhận gia hạn gói dịch vụ
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Bạn sắp gia hạn gói <strong>{activeSubscription?.packageId.name}</strong></p>
              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <div className="flex justify-between"><span>Số tiền:</span> <strong>{formatCurrency(activeSubscription?.packageId.price || 0)}</strong></div>
                <div className="flex justify-between"><span>Thời gian gia hạn:</span> <strong>{activeSubscription?.packageId.durationDays} ngày</strong></div>
                <div className="flex justify-between"><span>Kích hoạt từ:</span> <strong>{activeSubscription?.endDate ? formatDate(moment(activeSubscription.endDate).add(1, 'day').format('YYYY-MM-DD')) : '—'}</strong></div>
              </div>
              <p className="font-medium text-blue-600">Bạn sẽ được chuyển đến VNPay để thanh toán.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenewConfirm} disabled={isRenewing}>
              {isRenewing ? <>Đang tạo link...</> : "Đồng ý & Thanh toán"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {subscriptionToCancel?.status === "upcoming"
                ? "Hủy gói sắp kích hoạt"
                : "Hủy gói đang hoạt động"
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <strong>Bạn sắp hủy gói dịch vụ này!</strong>
              <br /><br />
              Sau khi hủy:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Gói sẽ <strong>hết hiệu lực ngay lập tức</strong></li>
                <li>Không thể hoàn tác hành động này</li>
                <li>Bạn sẽ mất toàn bộ quyền lợi còn lại</li>
              </ul>
              <br />
              Bạn có <strong>chắc chắn</strong> muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ lại gói</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                "Có, hủy gói ngay"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HistorySubscription;