import { useState, useEffect, useMemo } from "react";
import {
  WashingMachine,
  Zap,
  Activity,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useGetLaundryFloorsQuery } from "@/services/laundry/laundry.service";
import { useGetMyRoomQuery } from "@/services/room/room.service";
import { socketService } from "@/services/socket/socket.service";
import type { IWasherItem } from "@/types/laundry";

export const LaundryDevicesCard = () => {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "running" | "idle" | "unknown"
  >("all");

  const { data: myRoomData } = useGetMyRoomQuery();
  const buildingId = myRoomData?.room?.building?._id || "";

  const {
    data: laundryDevicesData,
    isLoading: isLoadingLaundryDevices,
  } = useGetLaundryFloorsQuery(
    {
      buildingId,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      skip: !buildingId,
    }
  );

  const [realtimeDevices, setRealtimeDevices] = useState<IWasherItem[] | null>(
    null
  );

  const laundryDevices = useMemo(() => {
    if (realtimeDevices) return realtimeDevices;
    return laundryDevicesData?.data || [];
  }, [realtimeDevices, laundryDevicesData]);

  // Kết nối realtime trạng thái thiết bị theo TÒA (building)
  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket || !buildingId) {
      setRealtimeDevices(null);
      return;
    }

    const payload = {
      buildingId,
      status: statusFilter === "all" ? undefined : statusFilter,
    };

    const handleStatus = (data: any) => {
      console.log("[Laundry][MyRoom][Socket] Nhận laundry_building_status:", data);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setRealtimeDevices(list as IWasherItem[]);
    };

    const handleError = (err: any) => {
      console.error("[Laundry][MyRoom][Socket] Nhận laundry_error:", err);
    };

    socket.on("laundry_building_status", handleStatus);
    socket.on("laundry_error", handleError);

    socket.emit("join_laundry_building", payload);

    return () => {
      socket.emit("leave_laundry_building", { buildingId });
      socket.off("laundry_building_status", handleStatus);
      socket.off("laundry_error", handleError);
    };
  }, [buildingId, statusFilter]);

  // Tính toán thống kê
  const stats = useMemo(() => {
    const total = laundryDevices.length;
    const running = laundryDevices.filter((d) => d.status === "running").length;
    const idle = laundryDevices.filter((d) => d.status === "idle").length;

    return { total, running, idle };
  }, [laundryDevices]);

  if (!buildingId) {
    return null;
  }

  return (
    <Card className="border-0 shadow-xl pt-0">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <WashingMachine className="h-5 w-5 text-primary" />
              </div>
              Thiết bị giặt sấy
            </CardTitle>
            <CardDescription>
              Xem trạng thái các thiết bị giặt sấy trong tòa nhà của bạn
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(
                  value: "all" | "running" | "idle" | "unknown"
                ) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="running">Đang chạy</SelectItem>
                  <SelectItem value="idle">Rảnh</SelectItem>
                  <SelectItem value="unknown">Không xác định</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {laundryDevices.length} thiết bị
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoadingLaundryDevices ? (
          <div className="text-center py-12 text-muted-foreground">
            <Spinner className="h-8 w-8 mx-auto mb-2" />
            <p>Đang tải danh sách thiết bị...</p>
          </div>
        ) : laundryDevices.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <WashingMachine className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">
              Chưa có thiết bị giặt sấy trong tòa nhà của bạn
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Summary */}
            {stats.total > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Tổng</p>
                    <WashingMachine className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Đang chạy</p>
                    <Activity className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.running}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Rảnh</p>
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.idle}
                  </p>
                </div>
              </div>
            )}

            {/* Devices Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {laundryDevices.map((device) => (
                <div
                  key={device.deviceId}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-muted/30 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300 border border-border/50"
                >
                  {/* Device Image Section */}
                  <div
                    className={`relative h-48 overflow-hidden ${
                      device.status === "running"
                        ? "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20"
                        : device.status === "idle"
                          ? "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20"
                          : "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20"
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`relative transition-transform duration-500 group-hover:scale-110 ${
                          device.status === "running"
                            ? "text-amber-600 dark:text-amber-500"
                            : device.status === "idle"
                              ? "text-green-600 dark:text-green-500"
                              : "text-gray-600 dark:text-gray-500"
                        }`}
                      >
                        <WashingMachine className="h-32 w-32 drop-shadow-lg" />
                        {/* Status indicator dot */}
                        <div
                          className={`absolute top-2 right-2 h-4 w-4 rounded-full shadow-lg ${
                            device.status === "running"
                              ? "bg-amber-500 animate-pulse"
                              : device.status === "idle"
                                ? "bg-green-500"
                                : "bg-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                    {/* Status badge overlay */}
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant={
                          device.status === "idle"
                            ? "default"
                            : device.status === "running"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          device.status === "idle"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 shadow-md"
                            : device.status === "running"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 shadow-md"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 shadow-md"
                        }
                      >
                        {device.status === "running"
                          ? "Đang chạy"
                          : device.status === "idle"
                            ? "Rảnh"
                            : "Không xác định"}
                      </Badge>
                    </div>
                  </div>

                  {/* Device Info Section */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 truncate">
                          {device.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {device.type === "washer" ? "Máy giặt" : "Máy sấy"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <span className="font-medium">Tầng</span>
                        </span>
                        <span className="font-semibold">Tầng {device.floorLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

