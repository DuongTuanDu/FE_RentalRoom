import { useState, useMemo, useCallback } from "react";
import {
  useGetContactsResidentQuery,
  useUpdateContactStatusResidentMutation,
} from "@/services/contact-request/contact-request.service";
import { FileText, Search, Eye} from "lucide-react";
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
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ContactStatus, IContact } from "@/types/contact-request";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ContactRequest = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [actionType, setActionType] = useState<"accepted" | "rejected" | null>(null);
  const [landlordNote, setLandlordNote] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState<IContact | null>(null);

  const formatDate = useFormatDate();
  const [updateContactStatus, { isLoading: isUpdating }] = useUpdateContactStatusResidentMutation();

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

  const { data, error, isLoading } = useGetContactsResidentQuery({
    page: currentPage,
    limit: pageLimit,
    status: statusFilter !== "all" ? statusFilter as ContactStatus : undefined,
  });

  const totalPages = data?.pagination.total ? Math.ceil(data.pagination.total / pageLimit) : 0;

  const handleOpenDetailDialog = (contact: IContact) => {
    setViewingContact(contact);
    setIsDetailDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedContact || !actionType) return;

    try {
      await updateContactStatus({
        id: selectedContact._id,
        data: {
          action: actionType,
          landlordNote: landlordNote,
        },
      }).unwrap();

      setIsActionDialogOpen(false);
      setSelectedContact(null);
      setActionType(null);
      setLandlordNote("");

      toast.success("Thành công", {
        description: `Yêu cầu đã được ${
          actionType === "accepted" ? "chấp nhận" : "từ chối"
        } thành công`,
      });
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.data?.message ||
          "Không thể cập nhật trạng thái. Vui lòng thử lại",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
      accepted: { label: "Đã duyệt", className: "bg-green-100 text-green-800" },
      rejected: { label: "Đã từ chối", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },

    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = data.data;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }
    
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((contact) => {
        const tenantName = typeof contact.tenantId === 'object' 
          ? contact.tenantId.fullName?.toLowerCase() || ''
          : '';
        const buildingName = typeof contact.buildingId === 'object'
          ? contact.buildingId.name?.toLowerCase() || ''
          : '';
        const roomName = typeof contact.roomId === 'object'
          ? contact.roomId.roomNumber?.toLowerCase() || ''
          : '';
        const contactName = contact.contactName?.toLowerCase() || '';

        return (
          tenantName.includes(searchLower) ||
          buildingName.includes(searchLower) ||
          roomName.includes(searchLower) ||
          contactName.includes(searchLower)
        );
      });
    }
    
    return filtered;
  }, [data?.data, debouncedSearch, statusFilter]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Yêu cầu Hợp đồng của tôi
              </h1>
              <p className="text-slate-600 mt-1">
                Các yêu cầu tạo hợp đồng bạn đã gửi
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tòa nhà, phòng..."
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
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Đã từ chối</SelectItem>
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
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách yêu cầu</CardTitle>
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
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy yêu cầu nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : ""}
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Tòa nhà</TableHead>
                        <TableHead className="font-semibold">Phòng</TableHead>
                        <TableHead className="font-semibold">Họ và tên</TableHead>
                        <TableHead className="font-semibold">SĐT liên hệ</TableHead>
                        <TableHead className="font-semibold">Trạng thái</TableHead>
                        <TableHead className="font-semibold">Ngày tạo</TableHead>
                        <TableHead className="text-center font-semibold">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((contact) => (
                        <TableRow key={contact._id} className="hover:bg-slate-50">
                          <TableCell className="text-slate-600">
                            {typeof contact.buildingId === 'object'
                              ? contact.buildingId.name
                              : '—'}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {typeof contact.roomId === 'object'
                              ? contact.roomId.roomNumber
                              : '—'}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {contact.contactName}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {contact.contactPhone}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(contact.status)}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {contact.createdAt ? formatDate(contact.createdAt) : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleOpenDetailDialog(contact)}
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
                      <span className="font-medium">{data.pagination.total}</span> yêu cầu
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

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "accepted" ? "Chấp nhận yêu cầu" : "Từ chối yêu cầu"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "accepted"
                ? "Bạn có chắc chắn muốn chấp nhận yêu cầu này?"
                : "Bạn có chắc chắn muốn từ chối yêu cầu này?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú của bạn..."
                value={landlordNote}
                onChange={(e) => setLandlordNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className={
                actionType === "accepted"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isUpdating ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu hợp đồng</DialogTitle>
          </DialogHeader>
          {viewingContact && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Bài đăng</Label>
                  <p className="font-medium">
                    {typeof viewingContact.postId === 'object'
                      ? viewingContact.postId?.title
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Email khách thuê</Label>
                  <p className="font-medium">
                    {typeof viewingContact.tenantId === 'object'
                      ? viewingContact.tenantId.email
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Tòa nhà</Label>
                  <p className="font-medium">
                    {typeof viewingContact.buildingId === 'object'
                      ? viewingContact.buildingId.name
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Phòng</Label>
                  <p className="font-medium">
                    {typeof viewingContact.roomId === 'object'
                      ? viewingContact.roomId.roomNumber
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Người liên hệ</Label>
                  <p className="font-medium">{viewingContact.contactName}</p>
                </div>
                <div>
                  <Label className="text-slate-500">SĐT liên hệ</Label>
                  <p className="font-medium">{viewingContact.contactPhone}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Trạng thái</Label>
                  <div className="mt-1">
                    {getStatusBadge(viewingContact.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500">Ngày tạo</Label>
                  <p className="font-medium">{viewingContact.createdAt ? formatDate(viewingContact.createdAt) : '—'}</p>
                </div>
              </div>
              {viewingContact.tenantNote && (
                <div>
                  <Label className="text-slate-500">Ghi chú từ khách thuê</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-lg">
                    {viewingContact.tenantNote}
                  </p>
                </div>
              )}
              {viewingContact.landlordNote && (
                <div>
                  <Label className="text-slate-500">Ghi chú từ chủ trọ</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-lg">
                    {viewingContact.landlordNote}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactRequest;