import { useState, useMemo } from "react";
import { Bell, Search, Plus, Edit, Eye, Trash2, Users, Building2, Layers, MessageSquare, Info, Calendar, User, FileText, Settings, Clock, X } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  useGetMyNotificationsQuery,
  useGetSentNotificationsQuery,
  useGetNotificationByIdQuery,
  useDeleteNotificationMutation,
} from "@/services/notification/notification.service";
import type { INotification } from "@/types/notification";
import { toast } from "sonner";
import { toText } from "@/utils/errors";
import ModalCreateNotification from "./components/ModalCreateNotification";

const NotificationManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [filterType, setFilterType] = useState("all");
  const [filterScope, setFilterScope] = useState("all");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<INotification | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<INotification | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<INotification | null>(null);

  const { data, isLoading, error, refetch } = useGetSentNotificationsQuery();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  const typeLabels: Record<string, string> = {
    general: "Thông báo chung",
    bill: "Hóa đơn",
    maintenance: "Bảo trì",
    reminder: "Nhắc nhở",
    event: "Sự kiện",
  };

  const filteredNotifications = useMemo(() => {
    if (!data?.data) return [];
    
    return data.data.filter((notification) => {
      const matchSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === "all" || notification.type === filterType;
      return matchSearch && matchType && !notification.isDeleted;
    });
  }, [data, searchQuery, filterType]);

  const totalPages = Math.ceil(filteredNotifications.length / pageLimit);
  const paginatedData = filteredNotifications.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenCreateModal = () => {
    setEditingNotification(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notification: INotification) => {
    setEditingNotification(notification);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (notification: INotification) => {
    setViewingNotification(notification);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteDialog = (notification: INotification) => {
    setDeletingNotification(notification);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingNotification) return;

    try {
      await deleteNotification(deletingNotification._id).unwrap();
      toast.success("Thành công", {
        description: "Thông báo đã được xóa thành công",
      });
      setIsDeleteDialogOpen(false);
      setDeletingNotification(null);
      refetch();
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi không xác định.");
      toast.error("Xóa thông báo thất bại", { description: message });
      console.error(error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen">
      <div className=" mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Quản lý Thông báo</h1>
              <p className="text-slate-600 mt-1">Quản lý các thông báo gửi đến cư dân</p>
            </div>
          </div>

          <Button className="gap-2" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4" />
            Tạo thông báo mới
          </Button>
        </div>

        <Card>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm thông báo theo tiêu đề hoặc nội dung"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại thông báo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="general">Thông báo chung</SelectItem>
                  <SelectItem value="bill">Hóa đơn</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="reminder">Nhắc nhở</SelectItem>
                  <SelectItem value="event">Sự kiện</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={pageLimit.toString()}
                onValueChange={(value) => {
                  setPageLimit(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 thông báo</SelectItem>
                  <SelectItem value="20">20 thông báo</SelectItem>
                  <SelectItem value="50">50 thông báo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 font-medium">Có lỗi xảy ra khi tải dữ liệu</p>
                <p className="text-slate-600 text-sm mt-2">Vui lòng thử lại sau</p>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Không tìm thấy thông báo nào</p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Tiêu đề</TableHead>
                        <TableHead className="font-semibold">Loại</TableHead>
                        <TableHead className="font-semibold">Người tạo</TableHead>
                        <TableHead className="font-semibold">Ngày tạo</TableHead>
                        <TableHead className="text-center font-semibold">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((notification) => (
                        <TableRow key={notification._id} className="hover:bg-slate-50">
                          <TableCell className="font-medium max-w-xs">
                              <span className="truncate">{notification.title}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                notification.type === "bill"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : notification.type === "maintenance"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : notification.type === "reminder"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : notification.type === "event"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }
                            >
                              {typeLabels[notification.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            <div>
                              <div className="font-medium">{notification?.createBy?.userInfo?.fullName}</div>
                              <div className="text-xs text-slate-500">
                                {notification.createByRole === "landlord" ? "Chủ trọ" : "Nhân viên"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {formatDate(notification.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenViewModal(notification)}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenEditModal(notification)}
                              >
                                <Edit className="w-4 h-4 text-amber-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDeleteDialog(notification)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-slate-600">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * pageLimit + 1}</span> đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageLimit, filteredNotifications.length)}
                    </span>{" "}
                    trong tổng số <span className="font-medium">{filteredNotifications.length}</span> thông báo
                  </p>
                  <div className="flex items-center gap-2">
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

      <ModalCreateNotification
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingNotification={editingNotification}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />

  <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
    <DialogContent className="!max-w-4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Info className="h-5 w-5 text-blue-600" />
          Chi tiết thông báo
        </DialogTitle>
      </DialogHeader>

      {viewingNotification && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {viewingNotification.title}
                  </h3>
                  <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(viewingNotification.createdAt)}
                    </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    Tạo bởi: <strong>{viewingNotification?.createBy?.userInfo?.fullName}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold text-gray-900">Nội dung thông báo</Label>
            </div>
            <div 
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: viewingNotification.content }}
            />
          </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                Thông tin thông báo
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Loại thông báo</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {typeLabels[viewingNotification.type]}
                  </Badge>
                </div>
              </div>

          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Thông báo được tạo lúc {formatTime(viewingNotification.createdAt)}</span>
            </div>
          </div>
        </div>
      )}

      <DialogFooter className="pt-6">
        <Button 
          onClick={() => setIsViewModalOpen(false)}
          className="bg-gray-600 hover:bg-gray-700"
        >
          <X className="h-4 w-4 mr-2" />
          Đóng
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thông báo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thông báo "{deletingNotification?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa thông báo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationManagement;