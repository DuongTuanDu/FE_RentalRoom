import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import { useGetFurnituresQuery } from "@/services/furniture/furniture.service";
import type {
  IFurnitureBuilding,
  IFurnitureBuildingRequest,
  IFurnitureBuildingRequestUpdate,
  IFurnitureBuildingItem,
} from "@/types/building-furniture";
import type { IFurniture } from "@/types/furniture";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ModalBuildingFurnitureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingFurniture?: IFurnitureBuilding | null;
  selectedBuildingId?: string;
  onSubmit: (
    data:
      | IFurnitureBuildingRequest
      | { id: string; data: IFurnitureBuildingRequestUpdate }
  ) => void;
  isLoading: boolean;
}

export const ModalBuildingFurniture = ({
  open,
  onOpenChange,
  buildingFurniture,
  selectedBuildingId,
  onSubmit,
  isLoading,
}: ModalBuildingFurnitureProps) => {
  const isEdit = !!buildingFurniture;

  // Queries
  const { data: buildingsData } = useGetBuildingsQuery({ page: 1, limit: 100 });
  const { data: furnituresData } = useGetFurnituresQuery();

  // State cho create mode (multiple items)
  const [buildingId, setBuildingId] = useState<string>("");
  const [selectedFurnitures, setSelectedFurnitures] = useState<IFurniture[]>(
    []
  );
  const [furnitureConfigs, setFurnitureConfigs] = useState<
    Record<
      string,
      {
        quantityPerRoom: number;
        totalQuantity: number;
        status: "active" | "inactive";
        notes: string;
      }
    >
  >({});

  // Form cho edit mode (single item)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IFurnitureBuildingRequestUpdate>({
    defaultValues: {
      quantityPerRoom: 0,
      totalQuantity: 0,
      status: "active",
      notes: "",
    },
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (buildingFurniture) {
      // Edit mode
      reset({
        quantityPerRoom: buildingFurniture.quantityPerRoom,
        totalQuantity: buildingFurniture.totalQuantity,
        status: buildingFurniture.status as "active" | "inactive",
        notes: buildingFurniture.notes || "",
      });
    } else {
      // Create mode
      setBuildingId(selectedBuildingId || "");
      setSelectedFurnitures([]);
      setFurnitureConfigs({});
      reset({
        quantityPerRoom: 0,
        totalQuantity: 0,
        status: "active",
        notes: "",
      });
    }
  }, [buildingFurniture, selectedBuildingId, reset, open]);

  const handleFormSubmit = (data: IFurnitureBuildingRequestUpdate) => {
    if (isEdit && buildingFurniture) {
      onSubmit({
        id: buildingFurniture._id,
        data,
      });
    }
  };

  const handleCreateSubmit = () => {
    if (!buildingId || selectedFurnitures.length === 0) return;

    const items: IFurnitureBuildingItem[] = selectedFurnitures.map(
      (furniture) => {
        const config = furnitureConfigs[furniture._id] || {
          quantityPerRoom: 0,
          totalQuantity: 0,
          status: "active" as const,
          notes: "",
        };
        return {
          furnitureId: furniture._id,
          ...config,
        };
      }
    );

    const requestData: IFurnitureBuildingRequest = {
      buildingId,
      items,
      mode: "create",
      dryRun: false,
    };

    onSubmit(requestData);
  };

  const handleSelectFurniture = (furnitureId: string) => {
    const furniture = furnituresData?.find((f) => f._id === furnitureId);
    if (!furniture) return;

    // Kiểm tra xem đã chọn chưa
    if (selectedFurnitures.find((f) => f._id === furnitureId)) return;

    // Thêm vào danh sách đã chọn
    setSelectedFurnitures([...selectedFurnitures, furniture]);

    // Khởi tạo config mặc định
    setFurnitureConfigs({
      ...furnitureConfigs,
      [furnitureId]: {
        quantityPerRoom: 1,
        totalQuantity: 10,
        status: "active",
        notes: "",
      },
    });
  };

  const handleRemoveFurniture = (furnitureId: string) => {
    setSelectedFurnitures(
      selectedFurnitures.filter((f) => f._id !== furnitureId)
    );
    const newConfigs = { ...furnitureConfigs };
    delete newConfigs[furnitureId];
    setFurnitureConfigs(newConfigs);
  };

  const updateFurnitureConfig = (
    furnitureId: string,
    field: keyof IFurnitureBuildingItem,
    value: any
  ) => {
    setFurnitureConfigs({
      ...furnitureConfigs,
      [furnitureId]: {
        ...furnitureConfigs[furnitureId],
        [field]: value,
      },
    });
  };

  // Lọc ra các furniture chưa được chọn
  const availableFurnitures =
    furnituresData?.filter(
      (f) => !selectedFurnitures.find((sf) => sf._id === f._id)
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Cập nhật Nội Thất Tòa Nhà"
              : "Thêm Nội Thất Cho Tòa Nhà"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin nội thất cho tòa nhà"
              : "Chọn và cấu hình nội thất cho tòa nhà"}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          // EDIT MODE - Single item
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên nội thất</Label>
                <div className="p-2 bg-muted rounded-md">
                  {typeof buildingFurniture?.furnitureId === "object"
                    ? buildingFurniture.furnitureId.name
                    : "—"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tòa nhà</Label>
                <div className="p-2 bg-muted rounded-md">
                  {typeof buildingFurniture?.buildingId === "object"
                    ? buildingFurniture.buildingId.name
                    : "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantityPerRoom">
                  Số lượng/phòng <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantityPerRoom"
                  type="number"
                  placeholder="0"
                  {...register("quantityPerRoom", {
                    valueAsNumber: true,
                    required: "Số lượng/phòng là bắt buộc",
                    min: {
                      value: 0,
                      message: "Số lượng phải lớn hơn hoặc bằng 0",
                    },
                  })}
                />
                {errors.quantityPerRoom && (
                  <p className="text-sm text-destructive">
                    {errors.quantityPerRoom.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalQuantity">
                  Tổng số lượng <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  placeholder="0"
                  {...register("totalQuantity", {
                    valueAsNumber: true,
                    required: "Tổng số lượng là bắt buộc",
                    min: {
                      value: 0,
                      message: "Tổng số lượng phải lớn hơn hoặc bằng 0",
                    },
                  })}
                />
                {errors.totalQuantity && (
                  <p className="text-sm text-destructive">
                    {errors.totalQuantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Trạng thái <span className="text-destructive">*</span>
              </Label>
              <Select
                value={statusValue}
                onValueChange={(value) =>
                  setValue("status", value as "active" | "inactive")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Nhập ghi chú..."
                rows={3}
                {...register("notes")}
              />
            </div>
          </div>
        ) : (
          // CREATE MODE - Multiple items with multi-select
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buildingId">
                Chọn tòa nhà <span className="text-destructive">*</span>
              </Label>
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger id="buildingId">
                  <SelectValue placeholder="-- Chọn tòa nhà --" />
                </SelectTrigger>
                <SelectContent>
                  {buildingsData?.data?.map((building) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.name} - {building.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="furniture-select">
                Chọn nội thất <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={handleSelectFurniture} value="">
                <SelectTrigger id="furniture-select">
                  <SelectValue placeholder="-- Chọn nội thất để thêm --" />
                </SelectTrigger>
                <SelectContent>
                  {availableFurnitures.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {furnituresData?.length === 0
                        ? "Chưa có nội thất nào"
                        : "Đã chọn hết nội thất"}
                    </div>
                  ) : (
                    availableFurnitures.map((furniture) => (
                      <SelectItem key={furniture._id} value={furniture._id}>
                        {furniture.name} ({furniture.category})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chọn từng nội thất từ dropdown ở trên để thêm vào danh sách
              </p>
            </div>

            {selectedFurnitures.length > 0 && (
              <div className="space-y-3">
                <Label>
                  Danh sách nội thất đã chọn ({selectedFurnitures.length})
                </Label>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {selectedFurnitures.map((furniture) => (
                    <Card key={furniture._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {furniture.name}
                            <Badge variant="outline">{furniture.category}</Badge>
                          </div>
                          {furniture.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {furniture.description}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFurniture(furniture._id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Số lượng/phòng</Label>
                          <Input
                            type="number"
                            value={
                              furnitureConfigs[furniture._id]
                                ?.quantityPerRoom || 0
                            }
                            onChange={(e) =>
                              updateFurnitureConfig(
                                furniture._id,
                                "quantityPerRoom",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Tổng số lượng</Label>
                          <Input
                            type="number"
                            value={
                              furnitureConfigs[furniture._id]?.totalQuantity ||
                              0
                            }
                            onChange={(e) =>
                              updateFurnitureConfig(
                                furniture._id,
                                "totalQuantity",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Trạng thái</Label>
                        <Select
                          value={
                            furnitureConfigs[furniture._id]?.status || "active"
                          }
                          onValueChange={(value) =>
                            updateFurnitureConfig(
                              furniture._id,
                              "status",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              Đang hoạt động
                            </SelectItem>
                            <SelectItem value="inactive">
                              Ngừng hoạt động
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Ghi chú</Label>
                        <Textarea
                          value={furnitureConfigs[furniture._id]?.notes || ""}
                          onChange={(e) =>
                            updateFurnitureConfig(
                              furniture._id,
                              "notes",
                              e.target.value
                            )
                          }
                          placeholder="Nhập ghi chú..."
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={
              isEdit ? handleSubmit(handleFormSubmit) : handleCreateSubmit
            }
            disabled={
              isLoading ||
              (!isEdit && (!buildingId || selectedFurnitures.length === 0))
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
