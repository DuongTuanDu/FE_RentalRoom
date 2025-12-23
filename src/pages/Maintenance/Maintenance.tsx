import { useState, useEffect } from "react";
import { useGetTenantMaintenancesQuery } from "@/services/maintenance/maintenance.service";
import { useGetMyRoomQuery } from "@/services/room/room.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Filter,
  Search,
  User,
} from "lucide-react";
import { MaintenanceDetailModal } from "./components/MaintenanceDetailModal";
import { CreateMaintenanceModal } from "./components/CreateMaintenanceModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Maintenance = () => {
  const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "open" | "in_progress" | "resolved" | "rejected" | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(9);

  const { data, isLoading, error, isFetching } = useGetTenantMaintenancesQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    limit: pageLimit,
  });
  const allMaintenances = data?.requests || [];
  const totalItems = data?.total || 0;

  // Get available rooms for maintenance modal
  const { data: myRoomData } = useGetMyRoomQuery();
  const availableRooms = myRoomData?.data?.availableRooms || [];

  // Reset to page 1 and clear list when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      open: "Mới tạo",
      in_progress: "Đang xử lý",
      resolved: "Đã giải quyết",
      rejected: "Từ chối",
    };

    const icons: Record<string, React.ReactNode> = {
      open: <AlertCircle className="h-3 w-3" />,
      in_progress: <Clock className="h-3 w-3" />,
      resolved: <CheckCircle2 className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
    };

    return (
      <Badge variant={variants[status] || "default"} className="gap-1">
        {icons[status]}
        {labels[status] || status}
      </Badge>
    );
  };

  // Filter by search query (client-side since API doesn't support search)
  const filteredMaintenances = allMaintenances.filter((item) => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.itemName && item.itemName.toLowerCase().includes(query))
    );
  });

  const hasMore = totalItems > allMaintenances.length;

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Đang tải yêu cầu bảo trì...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-medium mb-2">
                Không thể tải yêu cầu bảo trì
              </p>
              <p className="text-sm text-muted-foreground">
                Vui lòng thử lại sau
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl backdrop-blur-sm">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Yêu cầu bảo trì
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý các yêu cầu sửa chữa và bảo trì
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-lg"
          >
            <Wrench className="h-4 w-4" />
            Tạo yêu cầu mới
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề hoặc đồ đạc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="open">Mới tạo</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance List */}
        {filteredMaintenances.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium mb-2">Chưa có yêu cầu bảo trì nào</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Tạo yêu cầu bảo trì đầu tiên của bạn
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="outline"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Tạo yêu cầu mới
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaintenances.map(
              (maintenance) => (
                <Card
                  key={maintenance._id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col py-0"
                  onClick={() => setSelectedMaintenance(maintenance._id)}
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Header with badges */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {maintenance.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(maintenance.status)}
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="space-y-2 text-sm">
                        {maintenance.itemName && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Wrench className="h-3.5 w-3.5 shrink-0" />
                            <span
                              className="truncate"
                              title={maintenance.itemName}
                            >
                              {maintenance.itemName}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">Phòng:</span>
                          <span className="font-medium">
                            {maintenance.roomNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">Số lượng:</span>
                          <span className="font-medium">
                            {maintenance.affectedQuantity}
                          </span>
                        </div>
                        {maintenance.assignee && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            <span
                              className="truncate"
                              title={maintenance.assignee.name}
                            >
                              {maintenance.assignee.name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-xs">
                            {new Date(maintenance.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMaintenance(maintenance._id);
                        }}
                        className="w-full gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}

        {/* Load More */}
        {filteredMaintenances.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-4">
            {hasMore && (
              <p className="text-sm text-muted-foreground">
                Đã hiển thị{" "}
                <span className="font-medium">
                  {filteredMaintenances.length}
                </span>{" "}
                trong tổng số <span className="font-medium">{totalItems}</span>{" "}
                yêu cầu
              </p>
            )}
            {hasMore && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isFetching}
                className="min-w-[200px] gap-2"
              >
                {isFetching ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Đang tải...
                  </>
                ) : (
                  <>Xem thêm</>
                )}
              </Button>
            )}
            {!hasMore && filteredMaintenances.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Đã hiển thị hết tất cả yêu cầu
              </p>
            )}
          </div>
        )}

        {/* Modals */}
        {selectedMaintenance && (
          <MaintenanceDetailModal
            open={!!selectedMaintenance}
            onOpenChange={(open) => !open && setSelectedMaintenance(null)}
            maintenanceId={selectedMaintenance}
          />
        )}

        <CreateMaintenanceModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          availableRooms={availableRooms}
        />
      </div>
    </div>
  );
};

export default Maintenance;
