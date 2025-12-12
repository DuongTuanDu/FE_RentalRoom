import { useState, useMemo } from "react";
import {
  Users,
  DoorOpen,
  FileText,
  Building2,
  Loader2,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
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
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  useGetActivityQuery,
  useGetOverviewQuery,
} from "@/services/dashboard/dashboard.service";
import { Label } from "@/components/ui/label";

const DashboardLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");

  const { data: overviewRes, isLoading: isOverviewLoading } =
    useGetOverviewQuery({});

  const { data: activityRes, isLoading: isActivityLoading } =
    useGetActivityQuery({
      buildingId: selectedBuildingId === "all" ? undefined : selectedBuildingId,
    });

  const overviewStats = useMemo(() => {
    if (!overviewRes?.data) return null;

    const list = overviewRes.data;

    const buildingsList = list.map((b) => ({
      id: b.buildingId,
      name: b.buildingName,
    }));

    let stats = {
      totalPeople: 0,
      totalRoomsAvailable: 0,
      totalRoomsRented: 0,
      activeContracts: 0,
    };

    if (selectedBuildingId === "all") {
      stats = list.reduce(
        (acc, curr) => ({
          totalPeople: acc.totalPeople + curr.totalPeople,
          totalRoomsAvailable:
            acc.totalRoomsAvailable + curr.totalRoomsAvailable,
          totalRoomsRented: acc.totalRoomsRented + curr.totalRoomsRented,
          activeContracts: acc.activeContracts + curr.activeContracts,
        }),
        stats
      );
    } else {
      const found = list.find((b) => b.buildingId === selectedBuildingId);
      if (found) {
        stats = {
          totalPeople: found.totalPeople,
          totalRoomsAvailable: found.totalRoomsAvailable,
          totalRoomsRented: found.totalRoomsRented,
          activeContracts: found.activeContracts,
        };
      }
    }

    return { stats, buildingsList };
  }, [overviewRes, selectedBuildingId]);

  const chartData = useMemo(() => {
    if (!activityRes?.data) return [];
    const { labels, series } = activityRes.data;

    if (!labels || !series) return [];

    return labels.map((label, index) => ({
      name: label,
      "Bài đăng": series.postsActive?.[index] || 0,
      "Liên hệ": series.contactsActive?.[index] || 0,
    }));
  }, [activityRes]);

  if (isOverviewLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Tổng quan hoạt động kinh doanh của bạn
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md border">
          <Calendar className="h-4 w-4" />
          <span>Hôm nay: {new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bộ lọc thống kê
          </CardTitle>
          <CardDescription>
            Chọn tòa nhà để xem số liệu chi tiết
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <Select
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tòa nhà" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Tất cả tòa nhà</span>
                    </div>
                  </SelectItem>
                  {overviewStats?.buildingsList.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <span className="truncate">{b.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/*Tổng số phòng đã thuê */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Phòng đang thuê
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {overviewStats?.stats.totalRoomsRented || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>Đang hoạt động tốt</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <DoorOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tổng số phòng trống */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Phòng trống
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-orange-600">
                    {overviewStats?.stats.totalRoomsAvailable || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                  <span>Cần tìm khách thuê</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Số người đang ở */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng cư dân
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-indigo-600">
                    {overviewStats?.stats.totalPeople || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                  <Users className="h-3 w-3" />
                  <span>Người đang cư trú</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hợp đồng hiệu lực */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Hợp đồng hiệu lực
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">
                    {overviewStats?.stats.activeContracts || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>Đang hoạt động</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- CHART SECTION --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
              <CardDescription>
                Thống kê số lượng bài đăng và liên hệ từ khách thuê trong 6
                tháng qua
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pl-0">
          {isActivityLoading ? (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
              </div>
              <p className="text-sm text-slate-500">Đang tải biểu đồ...</p>
            </div>
          ) : (
            <div className="h-[400px] w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorPost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorContact"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px",
                    }}
                    itemStyle={{ fontSize: "14px", fontWeight: 500 }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="Bài đăng"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorPost)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Liên hệ"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorContact)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLandlord;
