import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState, useMemo } from "react";
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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, Calendar } from "lucide-react";
import { BuildingSelectCombobox } from "../../FloorManageLandlord/components/BuildingSelectCombobox";
import type { IRegulation, IRegulationRequest } from "@/types/regulation";
import type { Element } from "slate";
import { SlateEditor } from "../../TermManagement/components/SlateEditor";
import { htmlToSlate, slateToHtml } from "../../TermManagement/components/slateHelpers";

type SlateValue = Element[];

const regulationSchema = z.object({
  buildingId: z.string().min(1, "Vui lòng chọn tòa nhà"),
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề không được quá 200 ký tự"),
  effectiveFrom: z.string().min(1, "Vui lòng chọn ngày hiệu lực từ"),
});

type RegulationFormValues = z.infer<typeof regulationSchema>;

interface ModalRegulationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regulation?: IRegulation | null;
  onSubmit: (data: IRegulationRequest) => Promise<void>;
  isLoading?: boolean;
  defaultBuildingId?: string;
}

export const ModalRegulation = ({
  open,
  onOpenChange,
  regulation,
  onSubmit,
  isLoading = false,
  defaultBuildingId = "",
}: ModalRegulationProps) => {
  const isEditMode = !!regulation;

  const initialValue: SlateValue = useMemo(
    () => [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ],
    []
  );

  const [slateValue, setSlateValue] = useState<SlateValue>(initialValue);
  const [descriptionError, setDescriptionError] = useState<string>("");

  const form = useForm<RegulationFormValues>({
    resolver: zodResolver(regulationSchema) as any,
    defaultValues: {
      buildingId: "",
      title: "",
      effectiveFrom: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (regulation) {
        form.reset({
          buildingId: regulation.buildingId,
          title: regulation.title,
          effectiveFrom: regulation.effectiveFrom.split("T")[0],
        });
        const html = regulation.description || "";
        const value = htmlToSlate(html);
        setSlateValue(value);
      } else {
        form.reset({
          buildingId: defaultBuildingId,
          title: "",
          effectiveFrom: "",
        });
        setSlateValue(initialValue);
      }
      setDescriptionError("");
    } else {
      setSlateValue(initialValue);
      setDescriptionError("");
    }
  }, [open, regulation, defaultBuildingId, form, initialValue]);

  const handleSubmit = async (data: RegulationFormValues) => {
    // Validate description
    const description = slateToHtml(slateValue).trim();
    if (!description) {
      setDescriptionError("Mô tả không được để trống");
      return;
    }
    if (description.length > 1000) {
      setDescriptionError("Mô tả không được quá 1000 ký tự");
      return;
    }
    setDescriptionError("");

    // Convert dates to ISO format
    const formattedData: IRegulationRequest = {
      ...data,
      description,
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

              <div className="space-y-2">
                <FormLabel>
                  Mô tả <span className="text-red-500">*</span>
                </FormLabel>
                <SlateEditor
                  value={slateValue}
                  onChange={setSlateValue}
                  placeholder="Mô tả chi tiết về quy định..."
                />
                {descriptionError && (
                  <p className="text-sm font-medium text-destructive">
                    {descriptionError}
                  </p>
                )}
              </div>
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
