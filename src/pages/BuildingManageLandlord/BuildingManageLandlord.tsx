import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  useCreateBuildingMutation,
  useGetBuildingsQuery,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
  useCreateQuickBuildingMutation,
  useUpdateStatusMutation,
  useDownloadImportTemplateMutation,
  useImportFromExcelMutation,
} from "@/services/building/building.service";
import { Building2, Search, Plus, Edit, Eye, Zap } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import ModalBuilding from "./components/ModalBuilding";
import AlertDeleteBuilding from "./components/AlertDeleteBuilding";
import DrawerBuildingDetail from "./components/DrawerBuildingDetail";
import ModalQuickBuilding from "./components/ModalQuickBuilding";
import type {
  CreateBuildingRequest,
  CreateQuickBuildingRequest,
  IBuilding,
} from "@/types/building";
import { toast } from "sonner";
import { toText } from "@/utils/errors";
import { useSelector } from "react-redux";
import Permission from "@/layouts/Permission";

const BuildingManageLandlord = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<IBuilding | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingBuilding, setDeletingBuilding] = useState<IBuilding | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingBuilding, setViewingBuilding] = useState<IBuilding | null>(
    null
  );
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

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

  const { data, error, isLoading, refetch } = useGetBuildingsQuery({
    q: debouncedSearch,
    page: currentPage,
    limit: pageLimit,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openFileDialog = () => fileInputRef.current?.click();

  const [downloadTemplate] = useDownloadImportTemplateMutation();
  const handleDownload = async () => {
    const blob = await downloadTemplate().unwrap();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "building-import-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const [importExcel, { isLoading: isImporting }] =
    useImportFromExcelMutation();

  const handleImport = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await importExcel(fd).unwrap();
      toast.success("Import thành công", {
        description: `Đã import: ${res?.results?.buildingsCreated ?? 0} tòa, ${
          res?.results?.floorsCreated ?? 0
        } tầng, ${res?.results?.roomsCreated ?? 0} phòng`,
      });
      refetch();
    } catch (err: any) {
      toast.error("Import thất bại", {
        description: toText(err, "Vui lòng kiểm tra file và thử lại."),
      });
      console.error(err);
    }
  };

  const [createBuilding, { isLoading: isCreating }] =
    useCreateBuildingMutation();
  const [updateBuilding, { isLoading: isUpdating }] =
    useUpdateBuildingMutation();
  const [deleteBuilding, { isLoading: isDeleting }] =
    useDeleteBuildingMutation();
  const [createQuickBuilding, { isLoading: isCreatingQuick }] =
    useCreateQuickBuildingMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateStatusMutation();

  const totalPages = data?.total ? Math.ceil(data.total / pageLimit) : 0;

  const handleOpenCreateModal = () => {
    setEditingBuilding(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (building: IBuilding) => {
    setEditingBuilding(building);
    setIsModalOpen(true);
  };

  // const handleOpenDeleteDialog = (building: IBuilding) => {
  //   setDeletingBuilding(building);
  //   setIsDeleteDialogOpen(true);
  // };

  const handleOpenDrawer = (building: IBuilding) => {
    setViewingBuilding(building);
    setIsDrawerOpen(true);
  };

  const handleOpenQuickModal = () => {
    setIsQuickModalOpen(true);
  };

  const handleCreateBuilding = async (formData: CreateBuildingRequest) => {
    try {
      const res = await createBuilding(formData).unwrap();
      if (res.data) {
        setIsModalOpen(false);
        refetch();
        toast.success("Thành công", {
          description: "Tòa nhà đã được thêm thành công",
        });
      }
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi không xác định.");
      toast.error("Thêm tòa nhà thất bại", { description: message });
      console.error(error);
    }
  };

  const handleUpdateBuilding = async (formData: CreateBuildingRequest) => {
    if (!editingBuilding) return;

    try {
      const res = await updateBuilding({
        id: editingBuilding._id,
        data: formData,
      }).unwrap();

      if (res.data) {
        setIsModalOpen(false);
        setEditingBuilding(null);
        refetch();
        toast.success("Thành công", {
          description: "Tòa nhà đã được cập nhật thành công",
        });
      }
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi không xác định.");
      toast.error("Cập nhật nhà thất bại", { description: message });
      console.error(error);
    }
  };

  const handleSubmit = async (formData: CreateBuildingRequest) => {
    if (editingBuilding) {
      await handleUpdateBuilding(formData);
    } else {
      await handleCreateBuilding(formData);
    }
  };

  const handleDeleteBuilding = async () => {
    if (!deletingBuilding) return;

    try {
      await deleteBuilding(deletingBuilding._id).unwrap();
      setIsDeleteDialogOpen(false);
      setDeletingBuilding(null);
      refetch();
      toast.success("Thành công", {
        description: "Tòa nhà đã được xóa thành công",
      });
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi không xác định.");
      toast.error("Xóa nhà thất bại", { description: message });
      console.error(error);
    }
  };

  const handleCreateQuickBuilding = async (
    formData: CreateQuickBuildingRequest
  ) => {
    console.log("formData", formData);

    try {
      const res = await createQuickBuilding(formData).unwrap();
      console.log("res", res);

      // Đóng modal và refresh data khi API call thành công
      setIsQuickModalOpen(false);
      toast.success("Thành công", {
        description: res.message,
      });
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi không xác định.");
      toast.error("Thêm tòa nhà thất bại", { description: message });
      console.error(error);
    }
  };

  const handleUpdateStatus = async (building: IBuilding) => {
    try {
      const newStatus = building.status === "active" ? "inactive" : "active";
      await updateStatus({ id: building._id, status: newStatus }).unwrap();
      refetch();
      toast.success("Thành công", {
        description: `Tòa nhà đã được ${
          newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"
        } thành công`,
      });
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi không xác định.");
      toast.error("Cập nhật nhà thất bại", { description: message });
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý Tòa nhà
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý thông tin các tòa nhà trong hệ thống
              </p>
            </div>
          </div>

      <Permission permission="building:create">
          <div className="flex flex-wrap gap-3">
            {/* Nút tải template */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDownload}
            >
              Tải template excel cấu hình tòa
            </Button>

            {/* Nút import + input ẩn */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  handleImport(f);
                  e.currentTarget.value = ""; // reset để lần sau chọn lại cùng file vẫn nhận
                }
              }}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={openFileDialog}
              disabled={isImporting}
            >
              {isImporting ? "Đang import..." : "Import Excel"}
            </Button>

            {/* Nút có sẵn */}
            <Button className="gap-2" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4" />
              Thêm tòa nhà
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleOpenQuickModal}
            >
              <Zap className="w-4 h-4" />
              Thiết lập nhanh
            </Button>
          </div>
        </Permission>
          
        </div>

        {/* Filter Section */}
        <Card>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm tòa nhà theo tên"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={pageLimit.toString()}
                  onValueChange={(value) => {
                    setPageLimit(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 tòa nhà</SelectItem>
                    <SelectItem value="20">20 tòa nhà</SelectItem>
                    <SelectItem value="50">50 tòa nhà</SelectItem>
                    <SelectItem value="100">100 tòa nhà</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tòa nhà</CardTitle>
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
            ) : !data?.data || data.data.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy tòa nhà nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery
                    ? "Thử thay đổi từ khóa tìm kiếm"
                    : "Hãy thêm tòa nhà mới"}
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">
                          Tên tòa nhà
                        </TableHead>
                        <TableHead className="font-semibold">Địa chỉ</TableHead>
                        <TableHead className="font-semibold">Mô tả</TableHead>
                        <TableHead className="font-semibold">
                          Giá điện
                        </TableHead>
                        <TableHead className="font-semibold">
                          Giá nước
                        </TableHead>
                        <TableHead className="font-semibold">
                          Ngày tạo
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Trạng thái
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((building) => (
                        <TableRow
                          key={building._id}
                          className="hover:bg-slate-50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-blue-600" />
                              </div>
                              {building.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {building.address}
                          </TableCell>
                          <TableCell className="text-slate-600 max-w-xs truncate">
                            {building.description || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {formatPrice(building.ePrice)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {formatPrice(building.wPrice)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {formatDate(building.createdAt)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <Switch
                                        checked={building.status === "active"}
                                        onCheckedChange={() =>
                                          handleUpdateStatus(building)
                                        }
                                        disabled={isUpdatingStatus}
                                        className="data-[state=checked]:bg-green-600"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {building.status === "active"
                                        ? "Click để ngừng hoạt động tòa nhà"
                                        : "Click để kích hoạt tòa nhà"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Badge
                                variant={
                                  building.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={`${
                                  building.status === "active"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                } font-medium`}
                              >
                                {building.status === "active"
                                  ? "Hoạt động"
                                  : "Ngừng hoạt động"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDrawer(building)}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Permission permission="building:edit">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenEditModal(building)}
                                >
                                  <Edit className="w-4 h-4 text-amber-600" />
                                </Button>
                              </Permission>
                              {/* <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDeleteDialog(building)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button> */}
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
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageLimit + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageLimit, data.total)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{data.total}</span> tòa nhà
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Building */}
      <ModalBuilding
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingBuilding(null);
          }
        }}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        editingBuilding={editingBuilding}
      />

      {/* Alert Delete Building */}
      <AlertDeleteBuilding
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingBuilding(null);
          }
        }}
        building={deletingBuilding}
        onConfirm={handleDeleteBuilding}
        isLoading={isDeleting}
      />

      {/* Drawer Building Detail */}
      <DrawerBuildingDetail
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            setViewingBuilding(null);
          }
        }}
        building={viewingBuilding}
      />

      {/* Modal Quick Building */}
      <ModalQuickBuilding
        open={isQuickModalOpen}
        onOpenChange={(open) => {
          setIsQuickModalOpen(open);
        }}
        onSubmit={handleCreateQuickBuilding}
        isLoading={isCreatingQuick}
      />
    </div>
  );
};

export default BuildingManageLandlord;
