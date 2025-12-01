import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { AlertCircle, Upload, X } from "lucide-react";

import { useGetBuildingsQuery } from "@/services/building/building.service";
import { useGetFloorsQuery } from "@/services/floor/floor.service";
import { useGetRoomsQuery } from "@/services/room/room.service";
import {
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
} from "@/services/notification/notification.service";

import { toast } from "sonner";
import { toText } from "@/utils/errors";
import type { IRoom } from "@/types/room";
import type { IFloor } from "@/types/floor";
import Linkify from 'linkify-react';

type ScopeType = "buildings" | "floors" | "rooms";

interface TargetSelection {
  buildings: string[];
  floors: string[];
  rooms: string[];
}

const FloorsByBuilding = ({
  buildingId,
  target,
  setTarget,
  buildingName,
}: {
  buildingId: string;
  target: TargetSelection;
  setTarget: React.Dispatch<React.SetStateAction<TargetSelection>>;
  buildingName: string;
}) => {
  const { data: floorsResponse } = useGetFloorsQuery(
    { buildingId },
    { skip: !target.buildings.includes(buildingId) }
  );
  const floors = floorsResponse?.data || [];

  if (floors.length === 0) return null;

  return (
    <div className="p-4 border rounded bg-blue-50">
      <p className="font-medium mb-3">{buildingName}</p>
      <div className="grid grid-cols-4 gap-3">
        {floors.map((floor: IFloor) => (
          <div key={floor._id} className="flex items-center gap-2">
            <Checkbox
              checked={target.floors.includes(floor._id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setTarget((prev) => ({ ...prev, floors: [...prev.floors, floor._id] }));
                } else {
                  setTarget((prev) => ({
                    ...prev,
                    floors: prev.floors.filter((id) => id !== floor._id),
                    rooms: prev.rooms.filter((r) => !r.includes(floor._id)),
                  }));
                }
              }}
            />
            <span className="text-sm">
              Tầng {floor.level ??  "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RoomsByFloor = ({
  floorId,
  target,
  setTarget,
}: {
  floorId: string;
  target: TargetSelection;
  setTarget: React.Dispatch<React.SetStateAction<TargetSelection>>;
}) => {
  const { data: roomsResponse } = useGetRoomsQuery(
    { floorId },
    { skip: !target.floors.includes(floorId) }
  );
  const rooms = roomsResponse?.data || [];

  if (rooms.length === 0) return null;

  const floorNumber = rooms[0]?.floorId?.level ?? "";

  return (
    <div className="p-4 border rounded bg-green-50">
      <p className="font-medium mb-3">Tầng {floorNumber}</p>
      <div className="grid grid-cols-5 gap-3">
        {rooms.map((room: IRoom) => (
          <div key={room._id} className="flex items-center gap-2">
            <Checkbox
              checked={target.rooms.includes(room._id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setTarget((prev) => ({ ...prev, rooms: [...prev.rooms, room._id] }));
                } else {
                  setTarget((prev) => ({
                    ...prev,
                    rooms: prev.rooms.filter((id) => id !== room._id),
                  }));
                }
              }}
            />
            <span className="text-sm">{room.roomNumber}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ModalCreateNotification = ({
  open,
  onOpenChange,
  editingNotification,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNotification?: any | null;
  onSuccess?: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general" as any,
    scope: "buildings" as ScopeType,
  });

  const [target, setTarget] = useState<TargetSelection>({
    buildings: [],
    floors: [],
    rooms: [],
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: buildingsData } = useGetBuildingsQuery({ page: 1, limit: 100 });
  const [createNotification, { isLoading: isCreating }] = useCreateNotificationMutation();
  const [updateNotification, { isLoading: isUpdating }] = useUpdateNotificationMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    if (editingNotification) {
      setFormData({
        title: editingNotification.title || "",
        content: editingNotification.content?.replace(/<[^>]*>/g, "") || "",
        type: editingNotification.type || "general",
        scope: "buildings",
      });
      setPreviewUrls(editingNotification.images || []);
    } else {
      setFormData({ title: "", content: "", type: "general", scope: "buildings" });
      setTarget({ buildings: [], floors: [], rooms: [] });
      setImages([]);
      setPreviewUrls([]);
    }
    setErrors({});
  }, [open, editingNotification]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast.error("Chỉ được chọn tối đa 10 ảnh");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!formData.content.trim()) newErrors.content = "Vui lòng nhập nội dung";

    if (target.buildings.length === 0) newErrors.target = "Vui lòng chọn ít nhất một tòa nhà";
    else if (formData.scope === "floors" && target.floors.length === 0)
      newErrors.target = "Vui lòng chọn ít nhất một tầng";
    else if (formData.scope === "rooms" && target.rooms.length === 0)
      newErrors.target = "Vui lòng chọn ít nhất một phòng";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title.trim());
    formDataToSend.append("content", formData.content.trim());
    formDataToSend.append("type", formData.type);

    // Gửi target dưới dạng chuỗi JSON (backend hiện tại chỉ nhận string)
    if (formData.scope === "buildings") {
      formDataToSend.append("target", JSON.stringify({ buildings: target.buildings }));
    } else if (formData.scope === "floors") {
      formDataToSend.append("target", JSON.stringify({ floors: target.floors }));
    } else if (formData.scope === "rooms") {
      formDataToSend.append("target", JSON.stringify({ rooms: target.rooms }));
    }

    images.forEach((image) => {
      formDataToSend.append("images", image);
    });

    try {
      if (editingNotification) {
        await updateNotification({ id: editingNotification._id, data: formDataToSend }).unwrap();
        toast.success("Cập nhật thông báo thành công");
      } else {
        await createNotification(formDataToSend).unwrap();
        toast.success("Gửi thông báo thành công");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Lỗi", { description: toText(err) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingNotification ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
          </DialogTitle>
          <DialogDescription>
            Gửi thông báo kèm hình ảnh đến cư dân
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Tiêu đề <span className="text-red-500">*</span></Label>
            <Input
              placeholder="VD: Thông báo mất điện ngày 30/12"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nội dung <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Nhập nội dung thông báo..."
              className="min-h-48 resize-none"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            />
            {errors.content && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.content}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại thông báo</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v as any }))}>
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
              <Label>Phạm vi gửi</Label>
              <Select
                value={formData.scope}
                onValueChange={(v: ScopeType) => {
                  setFormData((prev) => ({ ...prev, scope: v }));
                  setTarget({ buildings: [], floors: [], rooms: [] });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Chọn phạm vi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buildings">Theo tòa nhà</SelectItem>
                  <SelectItem value="floors">Theo tầng</SelectItem>
                  <SelectItem value="rooms">Theo phòng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chọn chi tiết */}
          <div className="border-t pt-6 space-y-6">
            <Label className="text-lg font-semibold">Chọn người nhận</Label>

            {/* Chọn tòa nhà */}
            <div>
              <Label>Chọn tòa nhà</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 max-h-60 overflow-y-auto p-3 border rounded bg-slate-50">
                {buildingsData?.data?.map((b) => (
                  <div key={b._id} className="flex items-center gap-2">
                    <Checkbox
                      checked={target.buildings.includes(b._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTarget((prev) => ({ ...prev, buildings: [...prev.buildings, b._id] }));
                        } else {
                          setTarget((prev) => ({
                            ...prev,
                            buildings: prev.buildings.filter((id) => id !== b._id),
                            floors: prev.floors.filter((f) => !f.includes(b._id)),
                            rooms: prev.rooms.filter((r) => !r.includes(b._id)),
                          }));
                        }
                      }}
                    />
                    <label className="text-sm cursor-pointer">{b.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Chọn tầng */}
            {["floors", "rooms"].includes(formData.scope) && target.buildings.length > 0 && (
              <div>
                <Label>Chọn tầng</Label>
                <div className="space-y-4 mt-3">
                  {target.buildings.map((buildingId) => {
                    const building = buildingsData?.data?.find((b) => b._id === buildingId);
                    return (
                      <FloorsByBuilding
                        key={buildingId}
                        buildingId={buildingId}
                        target={target}
                        setTarget={setTarget}
                        buildingName={building?.name ?? "Không tên"}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chọn phòng */}
            {formData.scope === "rooms" && target.floors.length > 0 && (
              <div>
                <Label>Chọn phòng</Label>
                <div className="space-y-4 mt-3">
                  {target.floors.map((floorId) => (
                    <RoomsByFloor key={floorId} floorId={floorId} target={target} setTarget={setTarget} />
                  ))}
                </div>
              </div>
            )}

            {errors.target && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.target}
              </p>
            )}
          </div>

          {/* Upload ảnh */}
          <div className="space-y-3">
            <Label>Đính kèm hình ảnh (tối đa 10 ảnh)</Label>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <label htmlFor="images" className="cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Chọn ảnh
                </label>
              </Button>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <span className="text-sm text-gray-500">
                Đã chọn: {images.length} ảnh
              </span>
            </div>

            {(previewUrls.length > 0 || editingNotification?.images?.length > 0) && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt--grid">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Đang gửi..." : editingNotification ? "Cập nhật" : "Gửi thông báo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateNotification;