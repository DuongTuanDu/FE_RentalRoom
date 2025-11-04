import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ITerm } from "@/types/term";
import { useState, useEffect, useMemo } from "react";
import type { Element } from "slate";
import { SlateEditor } from "./SlateEditor";
import { htmlToSlate, slateToHtml } from "./slateHelpers";

type SlateValue = Element[];

interface ModalTermProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  term: ITerm | null;
  onSubmit: (data: { name: string; description: string; status?: "active" | "inactive" }) => void;
  isLoading?: boolean;
}

export const ModalTerm = ({ open, onOpenChange, term, onSubmit, isLoading = false }: ModalTermProps) => {
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

  // Reset value khi modal mở/đóng hoặc term thay đổi
  useEffect(() => {
    if (open) {
      const html = term?.description || "";
      const value = htmlToSlate(html);
      setSlateValue(value);
    } else {
      setSlateValue(initialValue);
    }
  }, [open, term, initialValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{term ? "Chỉnh sửa điều khoản" : "Thêm điều khoản"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            const name = String(formData.get("name") || "").trim();
            const status = term
              ? (String(formData.get("status") || term.status) as "active" | "inactive")
              : undefined;
            const description = slateToHtml(slateValue);
            onSubmit({ name, description: description.trim(), status });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Tên điều khoản</Label>
            <Input id="name" name="name" defaultValue={term?.name || ""} placeholder="Nhập tên" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <SlateEditor
              value={slateValue}
              onChange={setSlateValue}
              placeholder="Nhập mô tả..."
            />
          </div>
          {term && (
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select name="status" defaultValue={term.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>{term ? "Lưu thay đổi" : "Tạo mới"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};