import { useState } from "react";
import { useGetAnalysisQuery } from "@/services/analysis/analysis.service";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Building2,
  Package,
  DollarSign,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DashBoard = () => {
  const [filter, setFilter] = useState<"today" | "week" | "month" | "year" | "custom">("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading, isError } = useGetAnalysisQuery({
    filter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const formatPrice = useFormatPrice();

  const areaChartConfig = {
    count: {
      label: "Số lượng",
      color: "#3b82f6",
    },
    revenue: {
      label: "Doanh thu",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const pieChartConfig = {
    count: {
      label: "Số lượng",
    },
    revenue: {
      label: "Doanh thu",
    },
  } satisfies ChartConfig;

  const COLORS = [
    "#3b82f6",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const areaChartData = data?.data?.charts?.dailyTrend?.map((item) => ({
    date: item.date,
    count: item.count,
    revenue: item.revenue,
  })) || [];

  const pieChartData = data?.data?.charts?.packagePie?.map((item) => ({
    name: item._id,
    value: item.count,
    revenue: item.revenue,
  })) || [];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const summary = data.data.summary;
  const currentStatus = data.data.currentStatus;
  const topLandlords = data.data.topLandlords;

  return (
    <div className="min-h-screen bg-slate-50 px-3">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Bảng Điều Khiển</h1>
              <p className="text-slate-600 mt-1">
                Tổng quan thống kê hệ thống
              </p>
            </div>
            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
                <SelectItem value="custom">Tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Custom Date Range */}
          {filter === "custom" && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tổng Người Dùng</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {formatNumber(summary.totalUsers)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{formatNumber(summary.newUsersThisPeriod)}
                </span>
                <span>người dùng mới</span>
              </p>
            </CardContent>
          </Card>

          {/* Total Landlords */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tổng Chủ Trọ</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {formatNumber(summary.totalLandlords)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Chủ trọ đã đăng ký
              </p>
            </CardContent>
          </Card>

          {/* Total Packages */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tổng Gói Dịch Vụ</CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {formatNumber(summary.totalPackages)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {formatNumber(summary.activePackages)}
                </span> đang hoạt động
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tổng Doanh Thu</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {formatPrice(summary.totalRevenueThisPeriod)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatNumber(summary.paidSubscriptionsThisPeriod)}
                </span> gói đã thanh toán
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart - Daily Trend */}
          <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>Xu Hướng Hàng Ngày</CardTitle>
                <CardDescription>
                  Biểu đồ số lượng và doanh thu theo ngày
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={areaChartConfig} className="aspect-auto h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <defs>
                      <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--chart-2))"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--chart-2))"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("vi-VN", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <RechartsTooltip
                      content={({ active, payload, label }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          label={label}
                          labelFormatter={(value) => {
                            return new Date(value).toLocaleDateString("vi-VN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
                          }}
                          formatter={(value: any, name: any) => {
                            const nameStr = String(name);
                            if (nameStr === "revenue" || nameStr.includes("revenue")) {
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
                                  <span className="text-muted-foreground">Doanh thu:</span>
                                  <span className="font-medium">{formatPrice(value)}</span>
                                </div>
                              );
                            }
                            return (
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                                <span className="text-muted-foreground">Số lượng:</span>
                                <span className="font-medium">{formatNumber(value)}</span>
                              </div>
                            );
                          }}
                          indicator="dot"
                        />
                      )}
                    />
                    <Area
                      dataKey="count"
                      type="natural"
                      fill="url(#fillCount)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Area
                      dataKey="revenue"
                      type="natural"
                      fill="url(#fillRevenue)"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                    />
                    <RechartsLegend
                      content={({ payload }) => (
                        <ChartLegendContent
                          payload={payload}
                        />
                      )}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Package Distribution */}
          <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>Phân Bố Gói Dịch Vụ</CardTitle>
                <CardDescription>
                  Tỷ lệ các gói dịch vụ theo số lượng
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={pieChartConfig} className="aspect-auto h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="font-medium">{data.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Số lượng: {formatNumber(data.value)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Doanh thu: {formatPrice(data.revenue)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards and Top Landlords */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái Gói Dịch Vụ</CardTitle>
              <CardDescription>Thống kê trạng thái hiện tại</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Đang hoạt động</span>
                </div>
                <span className="font-semibold">{formatNumber(currentStatus.active)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Đã hết hạn</span>
                </div>
                <span className="font-semibold">{formatNumber(currentStatus.expired)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Sắp tới</span>
                </div>
                <span className="font-semibold">{formatNumber(currentStatus.upcoming)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Chờ thanh toán</span>
                </div>
                <span className="font-semibold">{formatNumber(currentStatus.pending_payment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                  <span className="text-sm">Đã hủy</span>
                </div>
                <span className="font-semibold">{formatNumber(currentStatus.cancelled)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Landlords */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Chủ Trọ</CardTitle>
              <CardDescription>Danh sách chủ trọ có doanh thu cao nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Số gói</TableHead>
                    <TableHead className="text-right">Tổng chi tiêu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLandlords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-14">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    topLandlords.map((landlord, index) => (
                      <TableRow key={landlord._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{landlord.email}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(landlord.subscriptionCount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPrice(landlord.totalSpent)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Gói Dùng Thử</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.trialPackages)}</div>
              <p className="text-xs text-muted-foreground">
                Gói đang trong thời gian dùng thử
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Gói Đang Hoạt Động</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.activePackages)}</div>
              <p className="text-xs text-muted-foreground">
                Gói dịch vụ đang được sử dụng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Gói Đã Thanh Toán</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(summary.paidSubscriptionsThisPeriod)}
              </div>
              <p className="text-xs text-muted-foreground">
                Gói đã thanh toán trong kỳ này
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
