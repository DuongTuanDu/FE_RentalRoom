import { useState, useMemo, useCallback } from "react";
import {
  useGetLandlordAppointmentsQuery,
} from "@/services/room-appointment/room-appointment.service";
import { Calendar, Search, Eye, Clock } from "lucide-react";
import _ from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AppointmentStatus, IRoomAppointment } from "@/types/room-appointment";
import AppointmentDetail from "./components/AppointmentDetail";

const AppointmentManageLandlord = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 700),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

   const { data, error, isLoading } = useGetLandlordAppointmentsQuery({
    page: currentPage,
    limit: pageLimit,
    status: statusFilter !== "all" ? statusFilter as AppointmentStatus : undefined,
  });

  const totalPages = data?.pagination.total ? Math.ceil(data.pagination.total / pageLimit) : 0;

  const handleOpenDetailModal = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800" },
      accepted: { label: "Đã xác nhận", className: "bg-green-100 text-green-800" },
      rejected: { label: "Đã từ chối", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Đã hủy", className: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = [...data.data];
    
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter);
    }
    
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((appointment) => {
        const buildingName = typeof appointment.buildingId === 'object'
          ? appointment.buildingId.name?.toLowerCase() || ''
          : '';
        const contactName = appointment.contactName?.toLowerCase() || '';
        const contactPhone = appointment.contactPhone?.toLowerCase() || '';

        return (
          buildingName.includes(searchLower) ||
          contactName.includes(searchLower) ||
          contactPhone.includes(searchLower)
        );
      });
    }
    
    return filtered;
  }, [data?.data, debouncedSearch, statusFilter]);


  return (
    <div className="">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý Lịch hẹn Xem phòng
              </h1>
              <p className="text-slate-600 mt-1">
                Xử lý các lịch hẹn xem phòng từ khách thuê
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên khách thuê, tòa nhà, số điện thoại..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ xác nhận</SelectItem>
                    <SelectItem value="accept">Đã xác nhận</SelectItem>
                    <SelectItem value="reject">Đã từ chối</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={pageLimit.toString()}
                  onValueChange={(value) => {
                    setPageLimit(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                    <SelectItem value="100">100 / trang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Danh sách lịch hẹn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 font-medium">
                  Có lỗi xảy ra khi tải dữ liệu
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Vui lòng thử lại sau
                </p>
              </div>
            ) : !filteredData || filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy lịch hẹn nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : "Chưa có lịch hẹn nào được tạo"}
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Khách thuê</TableHead>
                        <TableHead className="font-semibold">Tòa nhà</TableHead>
                        <TableHead className="font-semibold">Ngày hẹn</TableHead>
                        <TableHead className="font-semibold">Giờ hẹn</TableHead>
                        <TableHead className="font-semibold">Số điện thoại</TableHead>
                        <TableHead className="font-semibold">Trạng thái</TableHead>
                        <TableHead className="text-center font-semibold">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((appointment) => (
                        <TableRow key={appointment._id} className="hover:bg-slate-50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">
                                {appointment.contactName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {typeof appointment.buildingId === 'object'
                              ? appointment.buildingId.name
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-900">
                                {formatAppointmentDate(appointment.date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-blue-600">
                                {appointment.timeSlot}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {appointment.contactPhone}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleOpenDetailModal(appointment._id)}
                                    >
                                      <Eye className="w-4 h-4 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xem chi tiết</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {data && data.pagination.total > 0 && totalPages > 0 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-slate-600">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * pageLimit + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * pageLimit, data.pagination.total)}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">{data.pagination.total}</span> lịch hẹn
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                                variant={
                                  currentPage === pageNum ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-9"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AppointmentDetail
        appointmentId={selectedAppointmentId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </div>
  );
};

export default AppointmentManageLandlord;