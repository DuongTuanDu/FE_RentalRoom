import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { ModalTerm } from "./components/ModalTerm";
import { DeleteTermPopover } from "./components/DeleteTermPopover";
import { TermDetailSheet } from "./components/TermDetailSheet";
import {
  useCreateTermMutation,
  useDeleteTermMutation,
  useGetTermsQuery,
  useUpdateTermMutation,
} from "@/services/term/term.service";
import type { ITerm } from "@/types/term";
import { TermActionsGuide } from "./components/TermActionsGuide";
import Permission from "@/layouts/Permission";

// Helper function để strip HTML tags và lấy text thuần (dùng cho tooltip)
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const TermManagement = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<ITerm | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTerm, setDeletingTerm] = useState<ITerm | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  const {
    data: termsData,
    isLoading: isTermsLoading,
    isFetching: isTermsFetching,
  } = useGetTermsQuery(
    {
      buildingId: selectedBuildingId,
      page: currentPage,
      limit: pageLimit,
      status: selectedStatus === "all" ? undefined : selectedStatus,
    },
    { skip: !selectedBuildingId }
  );

  const [createTerm, { isLoading: isCreating }] = useCreateTermMutation();
  const [updateTerm, { isLoading: isUpdating }] = useUpdateTermMutation();
  const [deleteTerm, { isLoading: isDeleting }] = useDeleteTermMutation();

  const totalItems = termsData?.pagination?.total ?? 0;
  const totalPages = termsData?.pagination?.totalPages ?? 0;

  // Reset pagination when building/status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBuildingId, selectedStatus]);

  const handleOpenCreateModal = () => {
    setEditingTerm(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (term: ITerm) => {
    setEditingTerm(term);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (term: ITerm) => {
    setDeletingTerm(term);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetailSheet = (termId: string) => {
    setSelectedTermId(termId);
    setIsDetailSheetOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTerm) return;
    try {
      await deleteTerm(deletingTerm._id).unwrap();
      toast.success("Xóa điều khoản thành công");
      setIsDeleteDialogOpen(false);
      setDeletingTerm(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Xóa điều khoản thất bại");
    }
  };

  const handleSubmit = async (data: {
    name: string;
    description: string;
    status?: "active" | "inactive";
  }) => {
    const { name, description, status } = data;
    if (!name) {
      toast.error("Vui lòng nhập tên điều khoản");
      return;
    }
    try {
      if (editingTerm) {
        await updateTerm({
          id: editingTerm._id,
          data: { name, description, status: status || "active" },
        }).unwrap();
        toast.success("Cập nhật điều khoản thành công");
      } else {
        await createTerm({
          buildingId: selectedBuildingId,
          name,
          description,
        }).unwrap();
        toast.success("Tạo điều khoản thành công");
      }
      setIsModalOpen(false);
      setEditingTerm(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Lưu điều khoản thất bại");
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý điều khoản
          </h1>
          <p className="text-muted-foreground">
            Tạo và quản lý điều khoản cho từng tòa nhà
          </p>
        </div>
        <Permission permission="term:create">
          <Button
            onClick={handleOpenCreateModal}
            className="gap-2"
            disabled={!selectedBuildingId}
          >
            <Plus className="h-4 w-4" /> Thêm điều khoản
          </Button>
        </Permission>
        
      </div>

      <TermActionsGuide />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          <CardDescription>
            Chọn tòa nhà và trạng thái để xem điều khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tòa nhà</Label>
            <BuildingSelectCombobox
              value={selectedBuildingId}
              onValueChange={setSelectedBuildingId}
            />
          </div>
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v: "all" | "active" | "inactive") =>
                setSelectedStatus(v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">Danh sách điều khoản</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageLimit)}
              onValueChange={(v) => setPageLimit(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="20">20 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[140px] text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedBuildingId ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Vui lòng chọn tòa nhà để xem điều khoản
                    </TableCell>
                  </TableRow>
                ) : isTermsLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : !termsData || termsData.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không có điều khoản
                    </TableCell>
                  </TableRow>
                ) : (
                  termsData.data.map((term, idx) => {
                    const plainDescription = stripHtmlTags(
                      term.description || ""
                    );
                    return (
                      <TableRow key={term._id}>
                        <TableCell>
                          {(currentPage - 1) * pageLimit + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {term.name}
                        </TableCell>
                        <TableCell
                          className="max-w-[500px]"
                          title={plainDescription}
                        >
                          {term.description ? (
                            <div
                              className="prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0 line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: term.description,
                              }}
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              Không có mô tả
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              term.status === "active" ? "default" : "secondary"
                            }
                          >
                            {term.status === "active"
                              ? "Hoạt động"
                              : "Ngừng hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(term.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDetailSheet(term._id)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Permission permission = "term:edit">
                               <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenEditModal(term)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Permission>
                              
                            <Permission permission = "term:delete">  
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleOpenDeleteDialog(term)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            </Permission>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              <span className="font-medium">
                {totalItems === 0 ? 0 : (currentPage - 1) * pageLimit + 1}
              </span>{" "}
              đến
              <span className="font-medium">
                {" "}
                {Math.min(currentPage * pageLimit, totalItems)}
              </span>{" "}
              trong tổng số
              <span className="font-medium"> {totalItems}</span> điều khoản
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isTermsFetching}
              >
                Trang trước
              </Button>
              <div className="text-sm text-muted-foreground">
                Trang {totalPages ? currentPage : 0} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    totalPages ? Math.min(totalPages, p + 1) : p
                  )
                }
                disabled={
                  totalPages === 0 ||
                  currentPage >= totalPages ||
                  isTermsFetching
                }
              >
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <ModalTerm
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingTerm(null);
        }}
        term={editingTerm}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Term Popover */}
      <DeleteTermPopover
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setDeletingTerm(null);
        }}
        term={deletingTerm}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Term Detail Sheet */}
      <TermDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) setSelectedTermId(null);
        }}
        termId={selectedTermId}
      />
    </div>
  );
};

export default TermManagement;
