import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle, 
  Building2, 
  Info, 
  ImageIcon,
  Paperclip,
  X,
  FileText,
} from "lucide-react";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
} from "@/services/notification/notification.service";
import type { INotification } from "@/types/notification";
import { toast } from "sonner";
import { toText } from "@/utils/errors";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

type ScopeType = "all" | "buildings" | "floors" | "rooms" | "residents";

interface FormData {
  title: string;
  content: string;
  type: "general" | "bill" | "maintenance" | "reminder" | "event";
  scope: ScopeType;
  selectedBuildings: string[];
}

const ModalCreateNotification = ({
  open,
  onOpenChange,
  editingNotification,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNotification?: INotification | null;
  onSuccess?: () => void;
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    type: "general",
    scope: "all",
    selectedBuildings: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: buildingsData } = useGetBuildingsQuery({ page: 1, limit: 100 });
  const [createNotification, { isLoading: isCreating }] = useCreateNotificationMutation();
  const [updateNotification, { isLoading: isUpdating }] = useUpdateNotificationMutation();
  const isLoading = isCreating || isUpdating;

  // Reset form khi mở modal
  useEffect(() => {
    if (!open) return;

    if (editingNotification) {
      const scope = editingNotification.target.buildings?.length
        ? "buildings" as ScopeType
        : "all";

      setFormData({
        title: editingNotification.title || "",
        content: editingNotification.content?.replace(/<[^>]*>/g, '') || "", // strip HTML nếu có
        type: editingNotification.type || "general",
        scope,
        selectedBuildings: editingNotification.target.buildings || [],
      });
    } else {
      setFormData({
        title: "",
        content: "",
        type: "general",
        scope: "all",
        selectedBuildings: [],
      });
      setUploadedFiles([]);
    }
    setErrors({});
  }, [open, editingNotification]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setUploadedFiles(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: ev.target?.result as string,
            type: 'image'
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: 'document' as const
    }))]);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    else if (formData.title.length < 5) newErrors.title = "Tiêu đề phải từ 5 ký tự";
    else if (formData.title.length > 200) newErrors.title = "Tiêu đề quá dài";

    if (!formData.content.trim()) newErrors.content = "Vui lòng nhập nội dung";
    else if (formData.content.trim().length < 10) newErrors.content = "Nội dung phải từ 10 ký tự";

    if (formData.scope === "buildings" && formData.selectedBuildings.length === 0) {
      newErrors.target = "Vui lòng chọn ít nhất một tòa nhà";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const target: any = {};
    if (formData.scope === "buildings") {
      target.buildings = formData.selectedBuildings;
    }

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("content", formData.content.trim());
    data.append("type", formData.type);
    data.append("target", JSON.stringify(target));
    uploadedFiles.forEach(f => data.append("images", f.file));

    try {
      if (editingNotification) {
        await updateNotification({ id: editingNotification._id, data: data as any }).unwrap();
        toast.success("Thành công", { description: "Đã cập nhật thông báo" });
      } else {
        await createNotification(data as any).unwrap();
        toast.success("Thành công", { description: "Đã gửi thông báo đến cư dân" });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Thất bại", { description: toText(error, "Có lỗi xảy ra") });
    }
  };

  const toggleBuilding = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBuildings: prev.selectedBuildings.includes(id)
        ? prev.selectedBuildings.filter(x => x !== id)
        : [...prev.selectedBuildings, id]
    }));
    if (errors.target) setErrors(prev => ({ ...prev, target: "" }));
  };

  const selectAllBuildings = () => {
    const all = buildingsData?.data?.map(b => b._id) || [];
    setFormData(prev => ({
      ...prev,
      selectedBuildings: prev.selectedBuildings.length === all.length ? [] : all
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingNotification ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
          </DialogTitle>
          <DialogDescription>
            {editingNotification
              ? "Cập nhật nội dung thông báo"
              : "Soạn thông báo để gửi đến cư dân"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tiêu đề */}
          <div className="space-y-2">
            <Label className="font-semibold">Tiêu đề <span className="text-red-500">*</span></Label>
            <Input
              placeholder="VD: Thông báo mất điện ngày 30/12"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
            <p className="text-xs text-slate-500">{formData.title.length}/200</p>
          </div>

          {/* Nội dung - Textarea bình thường */}
          <div className="space-y-2">
            <Label className="font-semibold">Nội dung <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Nhập nội dung thông báo..."
              className="min-h-48 resize-none"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              disabled={isLoading}
            />
            {errors.content && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.content}</p>}
          </div>

          {/* Upload file */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} disabled={isLoading}>
              <ImageIcon className="w-4 h-4 mr-2" /> Thêm ảnh
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              <Paperclip className="w-4 h-4 mr-2" /> Đính kèm
            </Button>
          </div>
          <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />

          {/* Preview files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Đính kèm ({uploadedFiles.length})</Label>
              <div className="grid grid-cols-3 gap-3">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="relative border rounded-lg p-3 bg-slate-50">
                    {file.type === 'image' ? (
                      <img src={file.preview} alt="" className="w-full h-24 object-cover rounded" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <span className="text-xs truncate">{file.file.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loại + Phạm vi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Loại thông báo</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as any }))} disabled={isLoading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Thông báo chung</SelectItem>
                  <SelectItem value="bill">Hóa đơn</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="reminder">Nhắc nhở</SelectItem>
                  <SelectItem value="event">Sự kiện</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-semibold">Phạm vi gửi</Label>
              <Select
                value={formData.scope}
                onValueChange={(v: ScopeType) => setFormData(prev => ({
                  ...prev,
                  scope: v,
                  selectedBuildings: v === "buildings" ? prev.selectedBuildings : []
                }))}
                disabled={isLoading}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cư dân</SelectItem>
                  <SelectItem value="buildings">Theo tòa nhà</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chọn tòa nhà */}
          {formData.scope === "buildings" && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Chọn tòa nhà</Label>
                <Button variant="outline" size="sm" onClick={selectAllBuildings} disabled={isLoading}>
                  {formData.selectedBuildings.length === buildingsData?.data?.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 border rounded bg-slate-50">
                {buildingsData?.data?.map(building => (
                  <div key={building._id} className="flex items-center gap-2">
                    <Checkbox
                      id={building._id}
                      checked={formData.selectedBuildings.includes(building._id)}
                      onCheckedChange={() => toggleBuilding(building._id)}
                    />
                    <label htmlFor={building._id} className="text-sm cursor-pointer flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {building.name}
                    </label>
                  </div>
                ))}
              </div>

              {errors.target && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.target}</p>}
              {formData.selectedBuildings.length > 0 && (
                <p className="text-sm text-slate-600">
                  Đã chọn <strong>{formData.selectedBuildings.length}</strong> tòa nhà
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : editingNotification ? "Cập nhật" : "Gửi thông báo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateNotification;