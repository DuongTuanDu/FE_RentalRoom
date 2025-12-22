import { useState, useEffect, useMemo } from "react";
import {
  WashingMachine,
  Filter,
  Zap,
  Activity,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const Washer = () => {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "running" | "idle" | "unknown"
  >("all");

  const { data: myRoomData, isLoading: isLoadingMyRoom } = useGetMyRoomQuery();

  const buildingId = myRoomData?.data?.room?.building?._id || "";

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

  // Kết nối realtime trạng thái thiết bị theo TÒA (building) - chỉ có buildingId và status
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
      console.log("[Laundry][Resident][Socket] Nhận laundry_building_status:", data);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setRealtimeDevices(list as IWasherItem[]);
    };

    const handleError = (err: any) => {
      console.error("[Laundry][Resident][Socket] Nhận laundry_error:", err);
    };

    console.log(
      "[Laundry][Resident][Socket] Tham gia room building realtime với payload:",
      payload
    );

    socket.on("laundry_building_status", handleStatus);
    socket.on("laundry_error", handleError);

    socket.emit("join_laundry_building", payload);

    return () => {
      console.log(
        "[Laundry][Resident][Socket] Rời room building realtime:",
        buildingId
      );
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
    const washers = laundryDevices.filter((d) => d.type === "washer").length;
    const dryers = laundryDevices.filter((d) => d.type === "dryer").length;

    return { total, running, idle, washers, dryers };
  }, [laundryDevices]);

  if (isLoadingMyRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (!myRoomData?.data?.room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <WashingMachine className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Bạn chưa có phòng nào</p>
              <p className="text-sm text-muted-foreground">
                Hãy liên hệ với chủ nhà để được phân phòng
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!buildingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <WashingMachine className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Không tìm thấy thông tin tòa nhà</p>
              <p className="text-sm text-muted-foreground">
                Vui lòng liên hệ với chủ nhà để được hỗ trợ
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with gradient */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl backdrop-blur-sm">
              <WashingMachine className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Thiết bị giặt sấy
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Xem trạng thái các thiết bị giặt sấy trong tòa nhà của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {laundryDevices.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tổng thiết bị</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <WashingMachine className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Đang chạy</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.running}</p>
                  </div>
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Activity className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rảnh</p>
                    <p className="text-3xl font-bold text-green-600">{stats.idle}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Máy giặt</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.washers}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <WashingMachine className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Máy sấy</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.dryers}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Devices Grid */}
        <Card className="border-0 shadow-xl pt-0">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b-0 py-2 rounded-t-xl gap-0">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1 flex-1">
                <CardTitle className="flex items-center gap-3 text-xl">
                  Danh sách thiết bị giặt sấy
                </CardTitle>
                <CardDescription>
                  Các thiết bị được liên kết với hệ thống IoT (Tuya/Smart Life) trong tòa nhà của bạn
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    Lọc:
                  </span>
                  <Select
                    value={statusFilter}
                    onValueChange={(
                      value: "all" | "running" | "idle" | "unknown"
                    ) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-[160px]">
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
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Tầng</TableHead>
                      <TableHead>Công suất</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laundryDevices.map((device) => (
                      <TableRow key={device.deviceId}>
                        <TableCell className="font-medium">
                          {device.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize"
                          >
                            {device.type === "washer" ? "Máy giặt" : "Máy sấy"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            Tầng {device.floorLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {device.power ? `${device.power}W` : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
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
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : device.status === "running"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {device.status === "running"
                              ? "Đang chạy"
                              : device.status === "idle"
                                ? "Rảnh"
                                : "Không xác định"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Washer;
