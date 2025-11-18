import { useEffect, useState } from "react";
import { Package, Calendar, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { useGetMySubscriptionsQuery } from "@/services/package-services/package-subscription.service";

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
  CardDescription,
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
import type { ISubscription } from "@/types/package-subscription";

export const HistorySubscription = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: subscriptions, isLoading } = useGetMySubscriptionsQuery();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Bây giờ subscriptions đã là array trực tiếp
  const allSubscriptions = subscriptions || [];

  useEffect(() => {
    console.log("Subscriptions:", subscriptions);
  }, [subscriptions]);

  const filteredSubscriptions = statusFilter === "all" 
    ? allSubscriptions 
    : allSubscriptions.filter(sub => sub.status === statusFilter);

  const totalPages = Math.ceil(filteredSubscriptions.length / pageLimit);
  const startIndex = (currentPage - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

  const STATUS_LABELS = {
    active: "Đang hoạt động",
    expired: "Đã hết hạn",
    cancelled: "Đã hủy"
  };

  const STATUS_COLORS = {
    active: "bg-green-100 text-green-800 border-green-200",
    expired: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Lịch sử Gói dịch vụ
          </h1>
          <p className="text-muted-foreground">
            Quản lý các gói dịch vụ đã và đang sử dụng
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng gói đã mua
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả các gói dịch vụ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng chi tiêu
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                allSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng số tiền đã thanh toán
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách gói dịch vụ</CardTitle>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
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
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !filteredSubscriptions || filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {statusFilter === "all" 
                  ? "Chưa có gói dịch vụ nào"
                  : "Không tìm thấy gói dịch vụ phù hợp"}
              </p>
            </div>
          ) : (
            <div>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubscriptions.map((subscription) => {
                      const daysRemaining = calculateDaysRemaining(subscription.endDate);
                      
                      return (
                        <TableRow key={subscription._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium">
                                  {subscription.packageId.name}
                                </div>
                                {subscription.packageId.description && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {subscription.packageId.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(subscription.packageId.price)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {subscription.packageId.durationDays} ngày
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(subscription.startDate)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(subscription.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {subscription.status === "active" ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {daysRemaining} ngày
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 w-fit ${
                                STATUS_COLORS[subscription.status as keyof typeof STATUS_COLORS]
                              }`}
                            >
                              {subscription.status === "active" && <CheckCircle className="h-3 w-3" />}
                              {subscription.status === "expired" && <Clock className="h-3 w-3" />}
                              {subscription.status === "cancelled" && <XCircle className="h-3 w-3" />}
                              {STATUS_LABELS[subscription.status as keyof typeof STATUS_LABELS]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {startIndex + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredSubscriptions.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredSubscriptions.length}</span> gói
                  </p>
                </div>
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
                      <SelectItem value="10">10 gói</SelectItem>
                      <SelectItem value="20">20 gói</SelectItem>
                      <SelectItem value="50">50 gói</SelectItem>
                      <SelectItem value="100">100 gói</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistorySubscription;