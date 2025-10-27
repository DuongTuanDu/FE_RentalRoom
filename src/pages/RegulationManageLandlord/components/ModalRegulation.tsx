import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, Calendar } from "lucide-react";
import { BuildingSelectCombobox } from "../../FloorManageLandlord/components/BuildingSelectCombobox";
import type { IRegulation, IRegulationRequest } from "@/types/regulation";

const regulationSchema = z
  .object({
    buildingId: z.string().min(1, "Vui lòng chọn tòa nhà"),
    title: z
      .string()
      .min(1, "Tiêu đề không được để trống")
      .max(200, "Tiêu đề không được quá 200 ký tự"),
    description: z
      .string()
      .min(1, "Mô tả không được để trống")
      .max(1000, "Mô tả không được quá 1000 ký tự"),
    type: z.enum(["entry_exit", "pet_policy", "common_area", "other"]),
    effectiveFrom: z.string().min(1, "Vui lòng chọn ngày hiệu lực từ"),
  })

type RegulationFormValues = z.infer<typeof regulationSchema>;

interface ModalRegulationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regulation?: IRegulation | null;
  onSubmit: (data: IRegulationRequest) => Promise<void>;
  isLoading?: boolean;
  defaultBuildingId?: string;
}

const TYPE_OPTIONS = [
  { value: "entry_exit", label: "Ra vào" },
  { value: "pet_policy", label: "Thú cưng" },
  { value: "common_area", label: "Khu vực chung" },
  { value: "other", label: "Khác" },
];

export const ModalRegulation = ({
  open,
  onOpenChange,
  regulation,
  onSubmit,
  isLoading = false,
  defaultBuildingId = "",
}: ModalRegulationProps) => {
  const isEditMode = !!regulation;

  const form = useForm<RegulationFormValues>({
    resolver: zodResolver(regulationSchema) as any,
    defaultValues: {
      buildingId: "",
      title: "",
      description: "",
      type: "entry_exit",
      effectiveFrom: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (regulation) {
        form.reset({
          buildingId: regulation.buildingId,
          title: regulation.title,
          description: regulation.description,
          type: regulation.type,
          effectiveFrom: regulation.effectiveFrom.split("T")[0],
        });
      } else {
        form.reset({
          buildingId: defaultBuildingId,
          title: "",
          description: "",
          type: "entry_exit",
          effectiveFrom: "",
        });
      }
    }
  }, [open, regulation, defaultBuildingId, form]);

  const handleSubmit = async (data: RegulationFormValues) => {
    // Convert dates to ISO format
    const formattedData: IRegulationRequest = {
      ...data,
      effectiveFrom: new Date(data.effectiveFrom).toISOString(),
    };
    await onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 ${
                isEditMode ? "bg-amber-500" : "bg-blue-500"
              } rounded-lg`}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditMode ? "Cập nhật quy định" : "Thêm quy định mới"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEditMode
                  ? "Chỉnh sửa thông tin quy định"
                  : "Điền thông tin để thêm quy định vào hệ thống"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* Building Selection */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-semibold">Tòa nhà</h3>
              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <BuildingSelectCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading || isEditMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Regulation Info */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-semibold">Thông tin quy định</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiêu đề <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Giờ ra vào tòa nhà"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Loại quy định <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại quy định..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mô tả <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về quy định..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Effective Dates */}
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Thời gian hiệu lực
              </h3>

                <FormField
                  control={form.control}
                  name="effectiveFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hiệu lực từ <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    {isEditMode ? "Cập nhật" : "Thêm quy định"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
