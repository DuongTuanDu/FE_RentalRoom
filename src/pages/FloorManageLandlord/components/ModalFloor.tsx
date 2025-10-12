import { useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import type { CreateFloorRequest, IFloor } from "@/types/floor";

interface ModalFloorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  floor?: IFloor | null;
  onSubmit: (data: CreateFloorRequest | any) => void;
  isLoading: boolean;
}

export const ModalFloor = ({
  open,
  onOpenChange,
  buildingId,
  floor,
  onSubmit,
  isLoading,
}: ModalFloorProps) => {
  const isEdit = !!floor;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFloorRequest>({
    defaultValues: {
      buildingId,
      label: "",
      level: 1,
      description: "",
    },
  });

  useEffect(() => {
    if (floor) {
      reset({
        buildingId: floor.buildingId,
        label: floor.label,
        level: floor.level,
        description: floor.description || "",
      });
    } else {
      reset({
        buildingId: buildingId,
        label: "",
        level: 1,
        description: "",
      });
    }
  }, [floor, buildingId, reset, open]);

  const handleFormSubmit = (data: CreateFloorRequest) => {
    const payload = isEdit 
      ? {
          label: data.label,
          level: data.level,
          description: data.description,
        }
      : {
          ...data,
          buildingId: buildingId,
        };
    
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật Tầng" : "Thêm Tầng Mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin tầng trong tòa nhà"
              : "Thêm tầng mới vào tòa nhà"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">
              Tên tầng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              placeholder="Ví dụ: Tầng 1, Tầng trệt..."
              {...register("label", {
                required: "Tên tầng là bắt buộc",
              })}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">
              Cấp độ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="level"
              type="number"
              placeholder="Ví dụ: 1, 2, 3..."
              {...register("level", {
                required: "Cấp độ là bắt buộc",
                valueAsNumber: true,
                min: {
                  value: -2,
                  message: "Cấp độ phải lớn hơn hoặc bằng -2",
                },
              })}
            />
            {errors.level && (
              <p className="text-sm text-destructive">{errors.level.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả cho tầng..."
              rows={3}
              {...register("description")}
            />
          </div>
        </div>

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
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};