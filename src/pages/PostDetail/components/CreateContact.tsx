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

import {
    useCreateContactRequestMutation,
} from "@/services/contact-request/contact-request.service";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "@/services/profile/profile.service";

interface RoomOption {
  _id: string;
  roomNumber: string;
  status?: string;
  price?: number;
  area?: number;
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
    if (!contactName.trim()) {
      toast.error("Vui lòng nhập tên người liên hệ");
      return;
    }

    if (!contactPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(contactPhone.replace(/\s/g, ""))) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    if (!selectedRoomId) {
      toast.error("Vui lòng chọn phòng muốn thuê");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        postId: postId,
        buildingId: buildingId,
        roomId: selectedRoomId,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim().replace(/\s/g, ""),
        tenantNote: tenantNote.trim() 
      };

      console.log("Contact Request Payload:", payload);

      const res = await createContactRequest(payload).unwrap();

      if(!res.success) {
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
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.data?.message ||
          "Không thể gửi yêu cầu. Vui lòng thử lại",
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
      onOpenChange(false);
    }
  };

  const navigate = useNavigate();

  const handleContactRequest = () =>{
    navigate("/resident/contact-requests");
  }

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
                className="w-full border rounded-md p-2"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms
                  .filter((r) => r.status === "available" || !r.status)
                  .map((room) => (
                    <option key={room._id} value={room._id}>
                      Phòng {room.roomNumber}{" "}
                      {room.area && `(${room.area}m²)`}{" "}
                      {room.price && `- ${room.price.toLocaleString()}đ`}
                    </option>
                  ))}
              </select>
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
              onChange={(e) => setContactName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="Nhập số điện thoại (VD: 0901234567)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500">
              Chủ trọ sẽ liên hệ với bạn qua số điện thoại này
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantNote" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ghi chú (không bắt buộc)
            </Label>
            <Textarea
              id="tenantNote"
              placeholder="VD: Tôi muốn thuê trong 6 tháng, bắt đầu từ tháng sau..."
              value={tenantNote}
              onChange={(e) => setTenantNote(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
            <p className="text-xs text-slate-500">
              Thêm thông tin về thời gian thuê, yêu cầu đặc biệt...
            </p>
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
