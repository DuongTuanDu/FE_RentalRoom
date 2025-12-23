import { useEffect, useState } from "react";
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
import { Phone, User, FileText, DoorOpen } from "lucide-react";
import { toast } from "sonner";

import { useCreateContactRequestMutation } from "@/services/contact-request/contact-request.service";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "@/services/profile/profile.service";

interface RoomOption {
  _id: string;
  roomNumber: string;
  status?: string;
  price?: number;
  area?: number;
  isSoonAvailable?: boolean;
  expectedAvailableDate?: string | Date;
}

interface CreateContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  buildingId: string;
  postTitle?: string;
  buildingName?: string;
  rooms?: RoomOption[];
}

const CreateContact = ({
  open,
  onOpenChange,
  postId,
  buildingId,
  postTitle,
  buildingName,
  rooms = [],
}: CreateContactModalProps) => {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [tenantNote, setTenantNote] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    contactName: "",
    contactPhone: "",
    selectedRoomId: "",
    tenantNote: "",
  });
  const [createContactRequest] = useCreateContactRequestMutation();
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (profileData) {
      setContactName(profileData.user.userInfo?.fullName || "");
      setContactPhone(profileData.user.userInfo?.phoneNumber || "");
    }
  }, [profileData]);

  const handleSubmit = async () => {
    const newErrors = {
      contactName: "",
      contactPhone: "",
      selectedRoomId: "",
      tenantNote: "",
    };

    let hasError = false;

    if (!contactName.trim()) {
      newErrors.contactName = "Vui lòng nhập tên người liên hệ";
      hasError = true;
    }

    if (!contactPhone.trim()) {
      newErrors.contactPhone = "Vui lòng nhập số điện thoại";
      hasError = true;
    } else {
      // Loại bỏ khoảng trắng và ký tự đặc biệt
      const cleanedPhone = contactPhone.replace(/[\s\-()]/g, "");
      
      // Regex cho số điện thoại Việt Nam: 
      // - Bắt đầu bằng 0 hoặc +84
      // - Sau đó là mã nhà mạng (3, 5, 7, 8, 9)
      // - Tiếp theo là 8 chữ số
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
      
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.contactPhone = "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0901234567 hoặc +84901234567)";
        hasError = true;
      }
    }

    if (!selectedRoomId) {
      newErrors.selectedRoomId = "Vui lòng chọn phòng muốn thuê";
      hasError = true;
    }

    if (!tenantNote.trim()) {
      newErrors.tenantNote = "Vui lòng nhập ghi chú (ghi rõ tháng thuê hoặc thuê bao nhiêu tháng)";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Làm sạch số điện thoại: loại bỏ khoảng trắng và ký tự đặc biệt
      const cleanedPhone = contactPhone.replace(/[\s\-()]/g, "");
      
      const payload = {
        postId: postId,
        buildingId: buildingId,
        roomId: selectedRoomId,
        contactName: contactName.trim(),
        contactPhone: cleanedPhone,
        tenantNote: tenantNote.trim(),
      };

      const res = await createContactRequest(payload).unwrap();

      if (!res.success) {
        toast.error("Có lỗi xảy ra", { description: res.message });
        throw new Error(res.message || "Đã xảy ra lỗi");
      }

      toast.success("Thành công", {
        description: "Yêu cầu liên hệ đã được gửi thành công",
      });

      setContactName("");
      setContactPhone("");
      setTenantNote("");
      setSelectedRoomId("");
      setErrors({
        contactName: "",
        contactPhone: "",
        selectedRoomId: "",
        tenantNote: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContactName("");
      setContactPhone("");
      setTenantNote("");
      setSelectedRoomId("");
      setErrors({
        contactName: "",
        contactPhone: "",
        selectedRoomId: "",
        tenantNote: "",
      });
      onOpenChange(false);
    }
  };

  const navigate = useNavigate();

  const handleContactRequest = () => {
    navigate("/resident/contact-requests");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Yêu cầu tạo hợp đồng</DialogTitle>
          <DialogDescription>
            Chọn phòng và nhập thông tin để gửi yêu cầu tạo hợp đồng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {(postTitle || buildingName) && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              {postTitle && (
                <div>
                  <Label className="text-xs text-slate-500">Bài đăng</Label>
                  <p className="text-sm font-medium">{postTitle}</p>
                </div>
              )}
              {buildingName && (
                <div>
                  <Label className="text-xs text-slate-500">Tòa nhà</Label>
                  <p className="text-sm font-medium">{buildingName}</p>
                </div>
              )}
            </div>
          )}

          {rooms && rooms.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="roomSelect" className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4" />
                Chọn phòng muốn thuê <span className="text-red-500">*</span>
              </Label>
              <select
                id="roomSelect"
                className={`w-full border rounded-md p-2 ${
                  errors.selectedRoomId ? "border-red-500" : ""
                }`}
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  if (errors.selectedRoomId) {
                    setErrors({ ...errors, selectedRoomId: "" });
                  }
                }}
                disabled={isSubmitting}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms
                  .filter((r) => r.status === "available" || r.isSoonAvailable)
                  .map((room) => {
                    let soonText = "";
                    if (room.isSoonAvailable) {
                      const dateStr = room.expectedAvailableDate
                        ? new Date(
                            room.expectedAvailableDate
                          ).toLocaleDateString("vi-VN")
                        : "Sắp tới";
                      soonText = ` (Trống từ ${dateStr})`;
                    }

                    return (
                      <option key={room._id} value={room._id}>
                        Phòng {room.roomNumber}
                        {room.area ? ` (${room.area}m²)` : ""}
                        {room.price ? ` - ${room.price.toLocaleString()}đ` : ""}
                        {soonText}
                      </option>
                    );
                  })}
              </select>
              {errors.selectedRoomId && (
                <p className="text-xs text-red-500">{errors.selectedRoomId}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="contactName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Tên người liên hệ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactName"
              placeholder="Nhập họ tên của bạn"
              value={contactName}
              onChange={(e) => {
                setContactName(e.target.value);
                if (errors.contactName) {
                  setErrors({ ...errors, contactName: "" });
                }
              }}
              disabled={isSubmitting}
              className={errors.contactName ? "border-red-500" : ""}
            />
            {errors.contactName && (
              <p className="text-xs text-red-500">{errors.contactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactPhone"
              type="number"
              placeholder="Nhập số điện thoại (VD: 0901234567)"
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
                if (errors.contactPhone) {
                  setErrors({ ...errors, contactPhone: "" });
                }
              }}
              disabled={isSubmitting}
              className={errors.contactPhone ? "border-red-500" : ""}
            />
            {errors.contactPhone ? (
              <p className="text-xs text-red-500">{errors.contactPhone}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Chủ trọ sẽ liên hệ với bạn qua số điện thoại này
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantNote" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ghi chú <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="tenantNote"
              placeholder="VD: Tôi muốn thuê trong 6 tháng, bắt đầu từ tháng 1/2024..."
              value={tenantNote}
              onChange={(e) => {
                setTenantNote(e.target.value);
                if (errors.tenantNote) {
                  setErrors({ ...errors, tenantNote: "" });
                }
              }}
              disabled={isSubmitting}
              rows={4}
              className={errors.tenantNote ? "border-red-500" : ""}
            />
            {errors.tenantNote ? (
              <p className="text-xs text-red-500">{errors.tenantNote}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Vui lòng ghi rõ tháng thuê hoặc thuê bao nhiêu tháng
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" onClick={() => handleContactRequest()}>
            Xem các yêu cầu của bạn
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang gửi...
              </>
            ) : (
              "Gửi yêu cầu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContact;
