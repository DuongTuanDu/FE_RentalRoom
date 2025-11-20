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
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Paperclip,
  X,
  FileText,
  Download
} from "lucide-react";
import { useGetBuildingsQuery } from "@/services/building/building.service";
import {
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
} from "@/services/notification/notification.service";
import type {
  ICreateNotificationRequest,
  INotification,
} from "@/types/notification";
import { toast } from "sonner";
import { toText } from "@/utils/errors";

interface ModalCreateNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNotification?: INotification | null;
  onSuccess?: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

const ModalCreateNotification = ({
  open,
  onOpenChange,
  editingNotification = null,
  onSuccess,
}: ModalCreateNotificationProps) => {
  const [formData, setFormData] = useState<ICreateNotificationRequest>({
    title: "",
    content: "",
    type: "general",
    scope: "all",
    buildingIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: buildingsData } = useGetBuildingsQuery({
    page: 1,
    limit: 100,
  });
  const [createNotification, { isLoading: isCreating }] =
    useCreateNotificationMutation();
  const [updateNotification, { isLoading: isUpdating }] =
    useUpdateNotificationMutation();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (editingNotification) {
        setFormData({
          title: editingNotification.title,
          content: editingNotification.content,
          type: editingNotification.type,
          scope: editingNotification.scope,
          buildingId: editingNotification.buildingId,
          floorId: editingNotification.floorId,
          roomId: editingNotification.roomId,
          residentId: editingNotification.residentId,
          buildingIds: editingNotification.buildingIds || [],
        });
        setSelectedBuildings(editingNotification.buildingIds || []);
         if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = editingNotification.content || "";
          }
      } else {
        setFormData({
          title: "",
          content: "",
          type: "general",
          scope: "all",
          buildingIds: [],
        });
        setSelectedBuildings([]);
        setUploadedFiles([]);
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = "";
        }
      }
      setErrors({});
    }
  }, [open, editingNotification]);

  const typeOptions = [
    { value: "general", label: "Thông báo chung" },
    { value: "bill", label: "Hóa đơn" },
    { value: "maintenance", label: "Bảo trì" },
    { value: "reminder", label: "Nhắc nhở" },
    { value: "event", label: "Sự kiện" },
  ];

  const scopeOptions = [
    {
      value: "all",
      label: "Tất cả cư dân",
      description: "Gửi đến tất cả cư dân trong hệ thống",
    },
    {
      value: "staff_buildings",
      label: "Tòa nhà quản lý",
      description: "Gửi đến các tòa nhà mà nhân viên quản lý",
    },
    {
      value: "building",
      label: "Theo tòa nhà",
      description: "Chọn các tòa nhà cụ thể",
    },
    {
      value: "floor",
      label: "Theo tầng",
      description: "Gửi đến một tầng cụ thể",
    },
    {
      value: "room",
      label: "Theo phòng",
      description: "Gửi đến một phòng cụ thể",
    },
    {
      value: "resident",
      label: "Cá nhân",
      description: "Gửi đến một cư dân cụ thể",
    },
  ];

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      const content = contentEditableRef.current.innerHTML;
      setFormData({ ...formData, content });
      if (errors.content) setErrors({ ...errors, content: "" });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newFile: UploadedFile = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string,
            type: 'image'
          };
          setUploadedFiles(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: 'document'
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề thông báo";
    } else if (formData.title.length < 5) {
      newErrors.title = "Tiêu đề phải có ít nhất 5 ký tự";
    } else if (formData.title.length > 200) {
      newErrors.title = "Tiêu đề không được vượt quá 200 ký tự";
    }

    const textContent = contentEditableRef.current?.innerText || "";
    if (!textContent.trim()) {
      newErrors.content = "Vui lòng nhập nội dung thông báo";
    } else if (textContent.length < 10) {
      newErrors.content = "Nội dung phải có ít nhất 10 ký tự";
    }

    if (
      (formData.scope === "building" || formData.scope === "staff_buildings") &&
      selectedBuildings.length === 0
    ) {
      newErrors.buildings = "Vui lòng chọn ít nhất một tòa nhà";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const submitData: ICreateNotificationRequest = {
      title: formData.title.trim(),
      content: contentEditableRef.current?.innerHTML || "",
      type: formData.type,
      scope: formData.scope,
    };

    if (formData.scope === "building" || formData.scope === "staff_buildings") {
      submitData.buildingIds = selectedBuildings;
    }
    if (formData.scope === "floor") {
      submitData.buildingId = formData.buildingId;
      submitData.floorId = formData.floorId;
    }
    if (formData.scope === "room") {
      submitData.buildingId = formData.buildingId;
      submitData.floorId = formData.floorId;
      submitData.roomId = formData.roomId;
    }
    if (formData.scope === "resident") {
      submitData.residentId = formData.residentId;
    }

    try {
      if (editingNotification) {
        await updateNotification({
          id: editingNotification._id,
          data: submitData,
        }).unwrap();
        toast.success("Thành công", {
          description: "Thông báo đã được cập nhật thành công",
        });
      } else {
        await createNotification(submitData).unwrap();
        toast.success("Thành công", {
          description: "Thông báo đã được tạo và gửi đến cư dân",
        });
      }
      onSuccess?.();
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi không xác định.");
      toast.error(
        editingNotification ? "Cập nhật thông báo thất bại" : "Tạo thông báo thất bại",
        { description: message }
      );
      console.error(error);
    }
  };

  const handleBuildingToggle = (buildingId: string) => {
    setSelectedBuildings((prev) => {
      if (prev.includes(buildingId)) {
        return prev.filter((id) => id !== buildingId);
      }
      return [...prev, buildingId];
    });
    if (errors.buildings) setErrors({ ...errors, buildings: "" });
  };

  const handleSelectAllBuildings = () => {
    if (selectedBuildings.length === buildingsData?.data?.length) {
      setSelectedBuildings([]);
    } else {
      setSelectedBuildings(buildingsData?.data?.map((b) => b._id) || []);
    }
    if (errors.buildings) setErrors({ ...errors, buildings: "" });
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
              ? "Cập nhật thông tin thông báo cho cư dân"
              : "Điền thông tin để gửi thông báo đến cư dân"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Tiêu đề thông báo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="VD: Thông báo bảo trì hệ thống điện"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              className={errors.title ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-slate-500">{formData.title.length}/200 ký tự</p>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Nội dung thông báo <span className="text-red-500">*</span>
            </Label>
            
            <div className="border border-slate-300 rounded-t-lg bg-slate-50 p-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => execCommand('bold')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Đậm (Ctrl+B)"
                disabled={isLoading}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('italic')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Nghiêng (Ctrl+I)"
                disabled={isLoading}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('underline')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Gạch chân (Ctrl+U)"
                disabled={isLoading}
              >
                <Underline className="w-4 h-4" />
              </button>
              
              <div className="w-px h-8 bg-slate-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => execCommand('insertUnorderedList')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Danh sách dấu đầu dòng"
                disabled={isLoading}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('insertOrderedList')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Danh sách đánh số"
                disabled={isLoading}
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              
              <div className="w-px h-8 bg-slate-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => execCommand('justifyLeft')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Căn trái"
                disabled={isLoading}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyCenter')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Căn giữa"
                disabled={isLoading}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyRight')}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Căn phải"
                disabled={isLoading}
              >
                <AlignRight className="w-4 h-4" />
              </button>
              
              <div className="w-px h-8 bg-slate-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Thêm ảnh"
                disabled={isLoading}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-200 rounded transition-colors"
                title="Đính kèm file"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={contentEditableRef}
              contentEditable
              onInput={handleContentChange}
                dangerouslySetInnerHTML={{ __html: formData.content }} 
              className={`min-h-[200px] p-4 border border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.content ? "border-red-500" : "border-slate-300"
              }`}
              style={{ maxHeight: '400px', overflowY: 'auto' }}
            />

            {errors.content && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.content}
              </p>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">File đính kèm ({uploadedFiles.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative border rounded-lg p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      {file.type === 'image' ? (
                        <div className="relative">
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{file.file.name}</p>
                            <p className="text-xs text-slate-500">
                              {(file.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="flex-shrink-0 text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {file.type === 'image' && (
                        <p className="text-xs text-slate-600 mt-1 truncate">{file.file.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-base font-semibold">
                Loại thông báo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope" className="text-base font-semibold">
                Phạm vi gửi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.scope}
                onValueChange={(value: any) => {
                  setFormData({ ...formData, scope: value });
                  setSelectedBuildings([]);
                  if (errors.buildings) setErrors({ ...errors, buildings: "" });
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-slate-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(formData.scope === "building" || formData.scope === "staff_buildings") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Chọn tòa nhà <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllBuildings}
                  disabled={isLoading}
                >
                  {selectedBuildings.length === buildingsData?.data?.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Thông báo sẽ được gửi đến tất cả cư dân trong các tòa nhà được chọn
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-slate-50 max-h-[200px] overflow-y-auto">
                {buildingsData?.data?.map((building) => (
                  <div
                    key={building._id}
                    className="flex items-center space-x-2 p-2 hover:bg-white rounded transition-colors"
                  >
                    <Checkbox
                      id={building._id}
                      checked={selectedBuildings.includes(building._id)}
                      onCheckedChange={() => handleBuildingToggle(building._id)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={building._id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {building.name}
                    </label>
                  </div>
                ))}
              </div>

              {errors.buildings && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.buildings}
                </p>
              )}

              {selectedBuildings.length > 0 && (
                <p className="text-sm text-slate-600">
                  Đã chọn <span className="font-semibold">{selectedBuildings.length}</span> tòa nhà
                </p>
              )}
            </div>
          )}

          {formData.scope === "floor" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Chức năng gửi theo tầng sẽ được cập nhật sau. Vui lòng chọn phạm vi khác.
              </p>
            </div>
          )}

          {formData.scope === "room" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Chức năng gửi theo phòng sẽ được cập nhật sau. Vui lòng chọn phạm vi khác.
              </p>
            </div>
          )}

          {formData.scope === "resident" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Chức năng gửi đến cư dân cụ thể sẽ được cập nhật sau. Vui lòng chọn phạm vi khác.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {editingNotification ? "Đang cập nhật..." : "Đang tạo..."}
              </>
            ) : editingNotification ? (
              "Cập nhật thông báo"
            ) : (
              "Tạo thông báo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateNotification;