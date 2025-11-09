import { useState, useMemo, useCallback } from "react";
import { Calendar, Search, Clock, MapPin, User, Phone, Mail, Building2, FileText, X, ChevronLeft, ChevronRight } from "lucide-react";
import _ from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
import {
  useGetTenantAppointmentsQuery,
  useCancelAppointmentMutation,
} from "@/services/room-appointment/room-appointment.service";
import { toast } from "sonner";

const MyAppointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(5);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetTenantAppointmentsQuery();

  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 700),
    []
  );

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointmentId) return;

    try {
      await cancelAppointment(selectedAppointmentId).unwrap();
      toast.success("Hủy lịch hẹn thành công");
      setCancelDialogOpen(false);
      setSelectedAppointmentId(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi hủy lịch hẹn");
      console.error("Cancel appointment error:", error);
    }
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      accepted: { label: "Đã xác nhận", className: "bg-green-100 text-green-800 border-green-300" },
      rejected: { label: "Đã từ chối", className: "bg-red-100 text-red-800 border-red-300" },
      cancelled: { label: "Đã hủy", className: "bg-gray-100 text-gray-800 border-gray-300" },
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

  const formatCreatedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = data.data;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter);
    }
    
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((appointment) => {
        const buildingName = typeof appointment.buildingId === 'object'
          ? appointment.buildingId.name?.toLowerCase() || ''
          : '';
        const postTitle = typeof appointment.postId === 'object'
          ? appointment.postId.title?.toLowerCase() || ''
          : '';

        return (
          buildingName.includes(searchLower) ||
          postTitle.includes(searchLower)
        );
      });
    }
    
    return filtered;
  }, [data?.data, debouncedSearch, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageLimit]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageLimit);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Lịch hẹn xem phòng của tôi
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý các lịch hẹn xem phòng bạn đã đặt
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent >
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên tòa nhà, tiêu đề bài đăng..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
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
                    <SelectItem value="5">5 / trang</SelectItem>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-red-600 font-medium">Có lỗi xảy ra khi tải dữ liệu</p>
                <p className="text-slate-500 text-sm mt-2">Vui lòng thử lại sau</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredData.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy lịch hẹn nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : "Bạn chưa đặt lịch hẹn nào"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paginatedData.map((appointment) => (
              <Card key={appointment._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-blue-600 mb-2">
                        {typeof appointment.postId === 'object'
                          ? appointment.postId.title
                          : '—'}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">
                          {typeof appointment.buildingId === 'object'
                            ? appointment.buildingId.name
                            : '—'}
                        </span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                          Thông tin lịch hẹn
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-500">Ngày hẹn</p>
                              <p className="font-medium text-slate-900">
                                {formatAppointmentDate(appointment.date)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-500">Giờ hẹn</p>
                              <p className="font-medium text-blue-600 text-lg">
                                {appointment.timeSlot}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-500">Địa chỉ</p>
                              <p className="text-slate-900">
                                {typeof appointment.buildingId === 'object'
                                  ? appointment.buildingId.address || appointment.postId.address
                                  : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                          Thông tin liên hệ
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-500">Người liên hệ</p>
                              <p className="font-medium text-slate-900">
                                {appointment.contactName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-500">Số điện thoại</p>
                              <p className="font-medium text-slate-900">
                                {appointment.contactPhone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-500">Email chủ trọ</p>
                              <p className="font-medium text-slate-900">
                                {typeof appointment.landlordId === 'object'
                                  ? appointment.landlordId?.email
                                  : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(appointment.tenantNote || appointment.landlordNote) && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Ghi chú
                      </h3>
                      <div className="space-y-3">
                        {appointment.tenantNote && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-slate-500">Ghi chú của bạn</p>
                              <p className="text-slate-900 bg-blue-50 p-3 rounded-lg mt-1">
                                {appointment.tenantNote}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {appointment.landlordNote && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-slate-500">Phản hồi từ chủ trọ</p>
                              <p className="text-slate-900 bg-orange-50 p-3 rounded-lg mt-1">
                                {appointment.landlordNote}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Đặt lịch lúc: {formatCreatedDate(appointment.createdAt)}
                      </p>
                      {appointment.status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(appointment._id)}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Hủy lịch hẹn
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredData.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Hiển thị <span className="font-semibold">{((currentPage - 1) * pageLimit) + 1}</span> - <span className="font-semibold">{Math.min(currentPage * pageLimit, totalItems)}</span> trong tổng số <span className="font-semibold">{totalItems}</span> lịch hẹn
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || 
                               page === totalPages || 
                               (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-slate-400">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="min-w-[2.5rem]"
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy lịch hẹn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Không, giữ lại
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? "Đang hủy..." : "Có, hủy lịch hẹn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyAppointments;