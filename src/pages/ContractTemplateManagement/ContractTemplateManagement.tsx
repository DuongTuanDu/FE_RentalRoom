import { useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";
import {
  useCreateContractTemplateMutation,
  useDeleteContractTemplateMutation,
  useGetContractTemplatesQuery,
  useUpdateContractTemplateMutation,
} from "@/services/contract/contract.service";
import type { IContractTemplate } from "@/types/contract";
import { CreateEditContractTemplateModal } from "./components/CreateEditContractTemplateModal";
import { DeleteContractTemplateDialog } from "./components/DeleteContractTemplateDialog";
import { Spinner } from "@/components/ui/spinner";

const ContractTemplateManagement = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IContractTemplate | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<IContractTemplate | null>(null);

  const { data: templates, isLoading, isFetching } = useGetContractTemplatesQuery();
  const [createTemplate, { isLoading: isCreating }] = useCreateContractTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateContractTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteContractTemplateMutation();

  const filteredTemplates = useMemo(() => {
    if (!selectedBuildingId) return templates ?? [];
    return (templates ?? []).filter((t) => t.buildingId === selectedBuildingId);
  }, [templates, selectedBuildingId]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IContractTemplate) => {
    setEditingItem(item);
    setSelectedBuildingId(item.buildingId);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item: IContractTemplate) => {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (payload: {
    buildingId: string;
    name: string;
    defaultTermIds: string[];
    defaultRegulationIds: string[];
    placeholders: { termsTagField: string; regulationsTagField: string };
    status?: "active" | "inactive";
  }) => {
    try {
      if (editingItem) {
        await updateTemplate({ id: editingItem._id, data: {
          name: payload.name,
          defaultTermIds: payload.defaultTermIds,
          defaultRegulationIds: payload.defaultRegulationIds,
          placeholders: payload.placeholders,
          status: payload.status || editingItem.status,
        }}).unwrap();
        toast.success("Cập nhật mẫu hợp đồng thành công");
      } else {
        await createTemplate({
          buildingId: payload.buildingId,
          name: payload.name,
          defaultTermIds: payload.defaultTermIds,
          defaultRegulationIds: payload.defaultRegulationIds,
          placeholders: payload.placeholders,
        }).unwrap();
        toast.success("Tạo mẫu hợp đồng thành công");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error?.message?.message || "Lưu mẫu hợp đồng thất bại");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteTemplate(deletingItem._id).unwrap();
      toast.success("Xóa mẫu hợp đồng thành công");
      setIsDeleteOpen(false);
      setDeletingItem(null);
    } catch (error: any) {
      toast.error(error?.message?.message || "Xóa mẫu hợp đồng thất bại");
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý mẫu hợp đồng</h1>
          <p className="text-muted-foreground">Tạo và quản lý mẫu hợp đồng cho từng tòa nhà</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm mẫu hợp đồng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          <CardDescription>Chọn tòa nhà để lọc danh sách mẫu hợp đồng</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tòa nhà</Label>
            <BuildingSelectCombobox value={selectedBuildingId} onValueChange={setSelectedBuildingId} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách mẫu hợp đồng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Tên mẫu</TableHead>
                  <TableHead>Tòa nhà</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="w-[140px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <Spinner/>
                    </TableCell>
                  </TableRow>
                ) : (filteredTemplates ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không có mẫu hợp đồng
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((t, idx) => (
                    <TableRow key={t._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.buildingId}</TableCell>
                      <TableCell>{t.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}</TableCell>
                      <TableCell>{new Date(t.updatedAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleOpenEdit(t)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleOpenDelete(t)} disabled={isDeleting}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateEditContractTemplateModal
        open={isModalOpen}
        onOpenChange={(o) => {
          setIsModalOpen(o);
          if (!o) setEditingItem(null);
        }}
        template={editingItem}
        defaultBuildingId={selectedBuildingId}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteContractTemplateDialog
        open={isDeleteOpen}
        onOpenChange={(o) => {
          setIsDeleteOpen(o);
          if (!o) setDeletingItem(null);
        }}
        template={deletingItem}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ContractTemplateManagement;
