import { useState, useMemo } from "react";
import {
  Bell,
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  X,
} from "lucide-react";
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
  useGetSentNotificationsQuery,
  useDeleteNotificationMutation,
} from "@/services/notification/notification.service";
import type { INotification } from "@/types/notification";
import { toast } from "sonner";
import { toText } from "@/utils/errors";

import ModalCreateNotification from "./components/ModalCreateNotification";
import ModalViewNotification from "./components/ModalViewNotification";

const NotificationManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [filterType, setFilterType] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<INotification | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<INotification | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<INotification | null>(null);

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
    return new Date(dateString).toLocaleDateString("vi-VN", {
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
      toast.error("Xóa thất bại", { description: toText(error) });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="!max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản lý Thông báo</h1>
            <p className="text-slate-600 mt-1">Quản lý các thông báo gửi đến cư dân</p>
          </div>
          <Button onClick={handleOpenCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo thông báo mới
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm tiêu đề hoặc nội dung..."
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
                onValueChange={(v) => {
                  setPageLimit(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / trang</SelectItem>
                  <SelectItem value="20">20 / trang</SelectItem>
                  <SelectItem value="50">50 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                Có lỗi xảy ra khi tải dữ liệu
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Không tìm thấy thông báo nào</p>
              </div>
            ) : (
              <>
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
                      {paginatedData.map((noti) => (
                        <TableRow key={noti._id} className="hover:bg-slate-50">
                          <TableCell className="font-medium max-w-xs">
                            <span className="truncate block">{noti.title}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                noti.type === "bill"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : noti.type === "maintenance"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : noti.type === "reminder"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : noti.type === "event"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }
                            >
                              {typeLabels[noti.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {noti.createBy?.userInfo?.fullName || "Hệ thống"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {noti.createByRole === "landlord" ? "Chủ trọ" : "Nhân viên"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(noti.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenViewModal(noti)}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenEditModal(noti)}
                              >
                                <Edit className="w-4 h-4 text-amber-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDeleteDialog(noti)}
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

                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-600">
                    Hiển thị {(currentPage - 1) * pageLimit + 1} -{" "}
                    {Math.min(currentPage * pageLimit, filteredNotifications.length)} trong{" "}
                    {filteredNotifications.length} thông báo
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Trước
                    </Button>
                    {Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => {
                        let pageNum =
                          totalPages <= 5
                            ? i + 1
                            : currentPage <= 3
                            ? i + 1
                            : currentPage >= totalPages - 2
                            ? totalPages - 4 + i
                            : currentPage - 2 + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
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

      <ModalViewNotification
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        notification={viewingNotification}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thông báo "<strong>{deletingNotification?.title}</strong>"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationManagement;