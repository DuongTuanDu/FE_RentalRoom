import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { IMonthlyComparisonResponse } from "@/types/revenue";

interface MonthlyComparisonChartProps {
  comparisonData: IMonthlyComparisonResponse | undefined;
  comparisonChartData: Array<{
    month: number;
    revenue: number;
    expenditure: number;
    profit: number;
    revenueChange: number;
    expenditureChange: number;
    profitChange: number;
  }>;
  comparisonChartConfig: ChartConfig;
  isComparisonLoading: boolean;
  formatPrice: (value: number) => string;
  comparisonYear: number;
}

const MonthlyComparisonChart = ({
  comparisonData,
  comparisonChartData,
  comparisonChartConfig,
  isComparisonLoading,
  formatPrice,
  comparisonYear,
}: MonthlyComparisonChartProps) => {
  if (isComparisonLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!comparisonData || comparisonChartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">
          Không có dữ liệu để so sánh cho năm {comparisonYear}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Chart */}
      <Card className="mb-6 border-0 shadow-lg">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-lg">So Sánh Thu Chi 12 Tháng</CardTitle>
            <CardDescription>
              Biểu đồ so sánh thu, chi và lợi nhuận theo từng tháng - Năm{" "}
              {comparisonData.year}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={comparisonChartConfig}
            className="aspect-auto h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={comparisonChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id="fillExpenditure"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#ef4444"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#ef4444"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-3))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-3))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => `T${value}`}
                  style={{
                    fontSize: "12px",
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => formatPrice(value)}
                  style={{
                    fontSize: "12px",
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) {
                      return null;
                    }
                    const item = payload[0]?.payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <div className="font-semibold mb-3 text-base border-b pb-2">
                          Tháng {label}
                        </div>
                        <div className="space-y-2">
                          {payload.map((entry: any, index: number) => {
                            const nameStr = String(entry.dataKey || entry.name);
                            let changeText = "";
                            if (item) {
                              if (
                                nameStr === "revenue" &&
                                item.revenueChange !== undefined
                              ) {
                                changeText = ` (${
                                  item.revenueChange >= 0 ? "+" : ""
                                }${item.revenueChange.toFixed(1)}%)`;
                              } else if (
                                nameStr === "expenditure" &&
                                item.expenditureChange !== undefined
                              ) {
                                changeText = ` (${
                                  item.expenditureChange >= 0 ? "+" : ""
                                }${item.expenditureChange.toFixed(1)}%)`;
                              } else if (
                                nameStr === "profit" &&
                                item.profitChange !== undefined
                              ) {
                                changeText = ` (${
                                  item.profitChange >= 0 ? "+" : ""
                                }${item.profitChange.toFixed(1)}%)`;
                              }
                            }
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-4 py-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                      backgroundColor: entry.color,
                                    }}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {nameStr === "revenue"
                                      ? "Thu"
                                      : nameStr === "expenditure"
                                      ? "Chi"
                                      : "Lợi nhuận"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">
                                    {formatPrice(entry.value)}
                                  </span>
                                  {changeText && (
                                    <span
                                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                        changeText.includes("-")
                                          ? "text-red-600 bg-red-50 dark:bg-red-950/20"
                                          : "text-green-600 bg-green-50 dark:bg-green-950/20"
                                      }`}
                                    >
                                      {changeText}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />
                <RechartsLegend
                  content={({ payload }) => (
                    <ChartLegendContent payload={payload} className="mt-4" />
                  )}
                />
                <Area
                  type="natural"
                  dataKey="revenue"
                  fill="url(#fillRevenue)"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
                <Area
                  type="natural"
                  dataKey="expenditure"
                  fill="url(#fillExpenditure)"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <Area
                  type="natural"
                  dataKey="profit"
                  fill="url(#fillProfit)"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tháng</TableHead>
              <TableHead className="text-right">Thu</TableHead>
              <TableHead className="text-right">% Thay đổi</TableHead>
              <TableHead className="text-right">Chi</TableHead>
              <TableHead className="text-right">% Thay đổi</TableHead>
              <TableHead className="text-right">Lợi nhuận</TableHead>
              <TableHead className="text-right">% Thay đổi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonChartData.map((item) => (
              <TableRow key={item.month}>
                <TableCell className="font-medium">Tháng {item.month}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {formatPrice(item.revenue)}
                </TableCell>
                <TableCell className="text-right">
                  {item.revenueChange !== undefined &&
                  Math.abs(item.revenueChange) > 0.01 ? (
                    <div
                      className={`flex items-center justify-end gap-1 ${
                        item.revenueChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.revenueChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {item.revenueChange >= 0 ? "+" : ""}
                        {item.revenueChange.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-red-600">
                  {formatPrice(item.expenditure)}
                </TableCell>
                <TableCell className="text-right">
                  {item.expenditureChange !== undefined &&
                  Math.abs(item.expenditureChange) > 0.01 ? (
                    <div
                      className={`flex items-center justify-end gap-1 ${
                        item.expenditureChange >= 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.expenditureChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {item.expenditureChange >= 0 ? "+" : ""}
                        {item.expenditureChange.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    item.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPrice(item.profit)}
                </TableCell>
                <TableCell className="text-right">
                  {item.profitChange !== undefined &&
                  Math.abs(item.profitChange) > 0.01 ? (
                    <div
                      className={`flex items-center justify-end gap-1 ${
                        item.profitChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.profitChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {item.profitChange >= 0 ? "+" : ""}
                        {item.profitChange.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default MonthlyComparisonChart;

