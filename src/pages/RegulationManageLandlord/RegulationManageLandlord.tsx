import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Shield,
} from "lucide-react";
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
import { useFormatDate } from "@/hooks/useFormatDate";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useGetRegulationsQuery,
  useCreateRegulationMutation,
  useUpdateRegulationMutation,
  useDeleteRegulationMutation,
} from "@/services/regulation/regulation.service";
import { Spinner } from "@/components/ui/spinner";
import { ModalRegulation } from "./components/ModalRegulation";
import { DeleteRegulationPopover } from "./components/DeleteRegulationPopover";
import { RegulationDetailSheet } from "./components/RegulationDetailDrawer";
import { toast } from "sonner";
import type { IRegulation, IRegulationRequest } from "@/types/regulation";
import { RegulationActionsGuide } from "./components/RegulationActionsGuide";

const RegulationManageLandlord = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegulation, setEditingRegulation] =
    useState<IRegulation | null>(null);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRegulation, setDeletingRegulation] =
    useState<IRegulation | null>(null);

  const formatDate = useFormatDate();

  // Auto-select first building
  const { data: initialBuildingData } = useGetBuildingsQuery({
    q: "",
    page: 1,
    limit: 1,
  });

  useEffect(() => {
    if (initialBuildingData?.data?.[0]?._id && !selectedBuildingId) {
      setSelectedBuildingId(initialBuildingData.data[0]._id);
    }
  }, [initialBuildingData, selectedBuildingId]);

  // Fetch regulations
  const { data: regulationsData, isLoading: isRegulationsLoading } =
    useGetRegulationsQuery(
      { buildingId: selectedBuildingId },
      { skip: !selectedBuildingId }
    );

  // Mutations
  const [createRegulation, { isLoading: isCreating }] =
    useCreateRegulationMutation();
  const [updateRegulation, { isLoading: isUpdating }] =
    useUpdateRegulationMutation();
  const [deleteRegulation, { isLoading: isDeleting }] =
    useDeleteRegulationMutation();

  // Pagination
  const totalPages = Math.ceil((regulationsData?.length || 0) / pageLimit);
  const paginatedRegulations =
    regulationsData?.slice(
      (currentPage - 1) * pageLimit,
      currentPage * pageLimit
    ) || [];

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingRegulation(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (regulation: IRegulation) => {
    setEditingRegulation(regulation);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (regulation: IRegulation) => {
    setDeletingRegulation(regulation);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitRegulation = async (data: IRegulationRequest) => {
    try {
      if (editingRegulation) {
        await updateRegulation({
          id: editingRegulation._id,
          data: {
            title: data.title,
            description: data.description,
            status: editingRegulation.status,
            effectiveFrom: data.effectiveFrom,
          },
        }).unwrap();
        toast.success("Cập nhật quy định thành công!");
      } else {
        await createRegulation(data).unwrap();
        toast.success("Thêm quy định mới thành công!");
      }
      setIsModalOpen(false);
      setEditingRegulation(null);
    } catch (error: any) {
      toast.error(
        editingRegulation
          ? "Cập nhật quy định thất bại!"
          : "Thêm quy định mới thất bại!"
      );
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRegulation) return;

    try {
      await deleteRegulation(deletingRegulation._id).unwrap();
      toast.success("Xóa quy định thành công!");
      setIsDeleteDialogOpen(false);
      setDeletingRegulation(null);
    } catch (error: any) {
      toast.error("Xóa quy định thất bại!");
      console.error(error);
    }
  };

  // Reset page when building changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBuildingId]);

  const STATUS_LABELS = {
    active: "Đang áp dụng",
    inactive: "Không áp dụng",
  };

  const STATUS_COLORS = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Quy định
          </h1>
          <p className="text-muted-foreground">
            Quản lý các quy định và nội quy của tòa nhà
          </p>
        </div>
        <Button
          className="gap-2"
          disabled={!selectedBuildingId}
          onClick={handleOpenCreateModal}
        >
          <Plus className="h-4 w-4" />
          Thêm Quy định Mới
        </Button>
      </div>
      <RegulationActionsGuide />

      {/* Building Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn tòa nhà</CardTitle>
          <CardDescription>Chọn tòa nhà để xem quy định</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Building Select */}
            <div className="space-y-2 w-full md:w-[300px]">
              <label className="text-sm font-medium">Tòa nhà</label>
              <BuildingSelectCombobox
                value={selectedBuildingId}
                onValueChange={setSelectedBuildingId}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách quy định</CardTitle>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {regulationsData?.length || 0} quy định
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isRegulationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : !regulationsData || regulationsData.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Chưa có quy định nào</p>
            </div>
          ) : (
            <div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Hiệu lực từ</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRegulations.map((regulation) => (
                      <TableRow key={regulation._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {regulation.title}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[regulation.status]}
                          >
                            {STATUS_LABELS[regulation.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(regulation.effectiveFrom)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(regulation.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <RegulationDetailSheet regulation={regulation}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </RegulationDetailSheet>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenEditModal(regulation)}
                            >
                              <Edit className="h-4 w-4 text-amber-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenDeleteDialog(regulation)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * pageLimit + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * pageLimit,
                          regulationsData?.length || 0
                        )}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">
                        {regulationsData?.length || 0}
                      </span>{" "}
                      quy định
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={pageLimit.toString()}
                      onValueChange={(value) => {
                        setPageLimit(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 quy định</SelectItem>
                        <SelectItem value="20">20 quy định</SelectItem>
                        <SelectItem value="50">50 quy định</SelectItem>
                        <SelectItem value="100">100 quy định</SelectItem>
                      </SelectContent>
                    </Select>
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

      {/* Modal Regulation (Create/Edit) */}
      <ModalRegulation
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingRegulation(null);
          }
        }}
        regulation={editingRegulation}
        onSubmit={handleSubmitRegulation}
        isLoading={isCreating || isUpdating}
        defaultBuildingId={selectedBuildingId}
      />

      {/* Delete Regulation Popover */}
      <DeleteRegulationPopover
        open={isDeleteDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingRegulation(null);
          }
        }}
        regulation={deletingRegulation}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RegulationManageLandlord;
