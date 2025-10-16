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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { IFurniture, IFurnitureRequest } from "@/types/furniture";

interface ModalFurnitureProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    furniture?: IFurniture | null;
    onSubmit: (data: IFurnitureRequest) => void;
    isLoading: boolean;
}

export const ModalFurniture = ({
    open,
    onOpenChange,
    furniture,
    onSubmit,
    isLoading,
}: ModalFurnitureProps) => {
    const isEdit = !!furniture;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IFurnitureRequest>({
        defaultValues: {
            name: "",
            category: "",
            price: 0,
            warrantyMonths: 0,
            description: "",
            status: "active",
        },
    });

    const statusValue = watch("status");

    useEffect(() => {
        if (furniture) {
            reset({
                name: furniture.name,
                category: furniture.category,
                price: furniture.price || 0,
                warrantyMonths: furniture.warrantyMonths || 0,
                description: furniture.description || "",
                status: furniture.status,
            });
        } else {
            reset({
                name: "",
                category: "",
                price: 0,
                warrantyMonths: 0,
                description: "",
                status: "active",
            });
        }
    }, [furniture, reset, open]);

    const handleFormSubmit = (data: IFurnitureRequest) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật Nội Thất" : "Thêm Nội Thất Mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Cập nhật thông tin nội thất"
                            : "Thêm nội thất mới vào hệ thống"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Tên nội thất <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ví dụ: Giường ngủ, Bàn học..."
                                {...register("name", {
                                    required: "Tên nội thất là bắt buộc",
                                })}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Danh mục <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="category"
                                placeholder="Ví dụ: Phòng ngủ, Bàn, Tủ..."
                                {...register("category", {
                                    required: "Danh mục là bắt buộc",
                                })}
                            />
                            {errors.category && (
                                <p className="text-sm text-destructive">
                                    {errors.category.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Giá (VNĐ)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="0"
                                {...register("price", {
                                    valueAsNumber: true,
                                    min: {
                                        value: 0,
                                        message: "Giá phải lớn hơn hoặc bằng 0",
                                    },
                                })}
                            />
                            {errors.price && (
                                <p className="text-sm text-destructive">{errors.price.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warrantyMonths">Bảo hành (tháng)</Label>
                            <Input
                                id="warrantyMonths"
                                type="number"
                                placeholder="0"
                                {...register("warrantyMonths", {
                                    valueAsNumber: true,
                                    min: {
                                        value: 0,
                                        message: "Thời gian bảo hành phải lớn hơn hoặc bằng 0",
                                    },
                                })}
                            />
                            {errors.warrantyMonths && (
                                <p className="text-sm text-destructive">
                                    {errors.warrantyMonths.message}
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
                            onValueChange={(value) => setValue("status", value as "active" | "inactive")}
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
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Nhập mô tả chi tiết về nội thất..."
                            rows={4}
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