import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Calendar,
  Search,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
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
import { useGetPostDetailsResidentsQuery } from "@/services/post/post.service";
import { toast } from "sonner";
import CreateContact from "../PostDetail/components/CreateContact";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const {
    data: appointmentsData,
    isLoading: loadingAppointments,
    error: errorAppointments,
  } = useGetTenantAppointmentsQuery();

  const [cancelAppointment, { isLoading: cancelling }] =
    useCancelAppointmentMutation();

  const { data: postDetailData, isFetching: loadingPostDetail } =
    useGetPostDetailsResidentsQuery(selectedPostId!, {
      skip: !selectedPostId,
    });

  const postDetail = postDetailData?.data;
  const fullRooms = postDetail?.rooms ?? [];

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 600),
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

  const handleCancelClick = (id: string) => {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;
    try {
      await cancelAppointment(appointmentToCancel).unwrap();
      toast.success("Đã hủy lịch hẹn thành công");
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
    } catch (error: any) {
      toast.error(error.message.message || "Hủy lịch thất bại, vui lòng thử lại");
    }
  };

  const handleRequestContract = (appointment: any) => {
    const postId =
      typeof appointment.postId === "object"
        ? appointment.postId._id
        : appointment.postId;
    if (!postId) {
      toast.error("Không tìm thấy bài đăng");
      return;
    }
    setSelectedPostId(postId);
  };

  useEffect(() => {
    if (selectedPostId && postDetail && !loadingPostDetail) {
      setIsContactModalOpen(true);
    }
  }, [selectedPostId, postDetail, loadingPostDetail]);

  const navigate = useNavigate();
  const handleViewDetail = (postId: string) => {
    if (!postId) {
      toast.error("Không tìm thấy bài đăng");
      return;
    }
    navigate(`/posts/${postId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Chờ xác nhận",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      accepted: {
        label: "Đã xác nhận",
        className: "bg-green-100 text-green-800 border-green-300",
      },
      rejected: {
        label: "Đã từ chối",
        className: "bg-red-100 text-red-800 border-red-300",
      },
      cancelled: {
        label: "Đã hủy",
        className: "bg-gray-100 text-gray-800 border-gray-300",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredAppointments = useMemo(() => {
    if (!appointmentsData?.data) return [];

    let list = appointmentsData.data;

    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((a) => {
        const building =
          typeof a.buildingId === "object"
            ? a.buildingId.name?.toLowerCase()
            : "";
        const post =
          typeof a.postId === "object" ? a.postId.title?.toLowerCase() : "";
        return building.includes(q) || post.includes(q);
      });
    }

    return list;
  }, [appointmentsData?.data, statusFilter, debouncedSearch]);

  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / pageLimit);
  const paginated = filteredAppointments.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit
  );
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-xl">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Lịch hẹn xem phòng của tôi
            </h1>
            <p className="text-slate-600">
              Quản lý và theo dõi tất cả lịch hẹn bạn đã đặt
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm tòa nhà, tiêu đề bài đăng..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="accepted">Đã xác nhận</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={pageLimit.toString()}
                onValueChange={(v) => {
                  setPageLimit(+v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} / trang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loadingAppointments ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            </CardContent>
          </Card>
        ) : errorAppointments || filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">
                Chưa có lịch hẹn nào
              </p>
              <p className="text-slate-500 mt-2">
                {searchQuery
                  ? "Không tìm thấy kết quả phù hợp"
                  : "Bạn chưa đặt lịch xem phòng"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {paginated.map((appt) => (
              <Card
                key={appt._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle
                        className="text-xl text-blue-600"
                        onClick={() =>
                          handleViewDetail(
                            typeof appt.postId === "object"
                              ? appt.postId._id
                              : ""
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {typeof appt.postId === "object"
                          ? appt.postId?.title
                          : "Bài đăng không tồn tại"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-slate-600">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">
                          {typeof appt.buildingId === "object"
                            ? appt.buildingId?.name
                            : "—"}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-700">
                        Thông tin lịch hẹn
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-slate-500">Ngày hẹn</p>
                            <p className="font-medium">
                              {formatDate(appt.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-slate-500">Giờ hẹn</p>
                            <p className="font-medium text-lg text-blue-600">
                              {appt.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-slate-500">Địa chỉ</p>
                            <p className="font-medium">
                              {typeof appt.postId === "object"
                                ? appt.postId?.address
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-700">
                        Thông tin liên hệ
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                          <User className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-slate-500">Người đặt</p>
                            <p className="font-medium">{appt.contactName}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-slate-500">Số điện thoại</p>
                            <p className="font-medium">{appt.contactPhone}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-slate-500">Email chủ trọ</p>
                            <p>
                              {typeof appt.landlordId === "object"
                                ? appt.landlordId.email
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(appt.tenantNote || appt.landlordNote) && (
                    <div className="pt-6 border-t">
                      <h3 className="font-semibold text-slate-700 mb-3">
                        Ghi chú
                      </h3>
                      {appt.tenantNote && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-3">
                          <p className="text-sm text-slate-600 font-medium mb-1">
                            Ghi chú của bạn:
                          </p>
                          <p>{appt.tenantNote}</p>
                        </div>
                      )}
                      {appt.landlordNote && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-orange-700 font-medium mb-1">
                            Phản hồi từ chủ trọ:
                          </p>
                          <p>{appt.landlordNote}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-sm text-slate-500">
                      Đặt lúc: {formatTime(appt.createdAt)}
                    </p>

                    <div className="flex gap-3">
                      {appt.status === "pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(appt._id)}
                        >
                          <X className="w-4 h-4 mr-1" /> Hủy lịch
                        </Button>
                      )}

                      {appt.status === "accepted" && (
                        <Button
                          onClick={() => handleRequestContract(appt)}
                          disabled={loadingPostDetail}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          {loadingPostDetail ? (
                            <>
                              Đang tải{" "}
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            </>
                          ) : (
                            "Yêu cầu tạo hợp đồng"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-600">
                  Hiển thị {(currentPage - 1) * pageLimit + 1} -{" "}
                  {Math.min(currentPage * pageLimit, totalItems)} trong tổng{" "}
                  {totalItems}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => i + Math.max(1, currentPage - 2)
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
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
            <AlertDialogTitle>Xác nhận hủy lịch hẹn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelling}
            >
              {cancelling ? "Đang hủy..." : "Có, hủy lịch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {postDetail && (
        <CreateContact
          open={isContactModalOpen}
          onOpenChange={(open) => {
            setIsContactModalOpen(open);
            if (!open) {
              setSelectedPostId(null);
            }
          }}
          postId={postDetail._id}
          buildingId={
            typeof postDetail.buildingId === "object"
              ? postDetail.buildingId._id
              : postDetail.buildingId
          }
          buildingName={
            typeof postDetail.buildingId === "object"
              ? postDetail.buildingId.name
              : ""
          }
          postTitle={postDetail.title}
          rooms={fullRooms}
        />
      )}
    </div>
  );
};

export default MyAppointments;
