import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} from "@/services/profile/profile.service";
import type { UserAddress } from "@/types/profile";

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    _id: string;
    address: string;
    provinceName: string;
    districtName: string;
    wardName: string;
    provinceId?: string;
    districtId?: string;
    wardCode?: string;
  }) => void;
  editAddress: UserAddress | null;
}

export const AddAddressModal = ({
  open,
  onClose,
  onSave,
  editAddress,
}: AddAddressModalProps) => {
  const { data: provincesData } = useGetProvincesQuery();
  const [province, setProvince] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [ward, setWard] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Flag để đánh dấu đang trong quá trình khởi tạo từ editAddress
  const isInitializing = useRef(false);

  const { data: districtsData } = useGetDistrictsQuery(province, {
    skip: !province,
  });

  const { data: wardsData } = useGetWardsQuery(district, {
    skip: !district,
  });

  // Reset form khi modal đóng/mở hoặc editAddress thay đổi
  useEffect(() => {
    if (!open) {
      // Reset khi đóng modal
      setAddress("");
      setProvince("");
      setDistrict("");
      setWard("");
      isInitializing.current = false;
      return;
    }

    if (editAddress) {
      // Đánh dấu đang khởi tạo
      isInitializing.current = true;
      setAddress(editAddress.address);

      // Chỉ set province, các level khác sẽ được xử lý trong useEffect riêng
      if (editAddress.provinceId) {
        setProvince(editAddress.provinceId);
      } else if (editAddress.provinceName && provincesData?.data) {
        const foundProvince = provincesData.data.find(
          (p: any) => p.ProvinceName === editAddress.provinceName
        );
        if (foundProvince) {
          setProvince(String(foundProvince.ProvinceID));
        }
      }
    } else {
      // Thêm mới - reset form
      isInitializing.current = false;
      setAddress("");
      setProvince("");
      setDistrict("");
      setWard("");
    }
  }, [open, editAddress, provincesData]);

  // Set district sau khi districtsData đã fetch xong
  useEffect(() => {
    // Chỉ chạy khi đang khởi tạo từ editAddress
    if (!isInitializing.current || !editAddress) return;
    
    // Đợi districtsData sẵn sàng
    if (!districtsData?.data || !province) return;

    // Set district
    if (editAddress.districtId) {
      setDistrict(editAddress.districtId);
    } else if (editAddress.districtName) {
      const foundDistrict = districtsData.data.find(
        (d: any) => d.DistrictName === editAddress.districtName
      );
      if (foundDistrict) {
        setDistrict(String(foundDistrict.DistrictID));
      }
    }
  }, [districtsData, province, editAddress]);

  // Set ward sau khi wardsData đã fetch xong
  useEffect(() => {
    // Chỉ chạy khi đang khởi tạo từ editAddress
    if (!isInitializing.current || !editAddress) return;
    
    // Đợi wardsData sẵn sàng
    if (!wardsData?.data || !district) return;

    // Set ward và kết thúc quá trình khởi tạo
    if (editAddress.wardCode) {
      setWard(editAddress.wardCode);
    } else if (editAddress.wardName) {
      const foundWard = wardsData.data.find(
        (w: any) => w.WardName === editAddress.wardName
      );
      if (foundWard) {
        setWard(foundWard.WardCode);
      }
    }

    // Kết thúc quá trình khởi tạo
    isInitializing.current = false;
  }, [wardsData, district, editAddress]);

  // Reset district và ward khi province thay đổi (do user chọn)
  useEffect(() => {
    // Không reset khi đang khởi tạo từ editAddress
    if (isInitializing.current) return;

    if (!province) {
      setDistrict("");
      setWard("");
    } else {
      // User chọn province mới → reset district và ward
      setDistrict("");
      setWard("");
    }
  }, [province]);

  // useEffect 5: Reset ward khi district thay đổi (do user chọn)
  useEffect(() => {
    // Không reset khi đang khởi tạo từ editAddress
    if (isInitializing.current) return;

    if (!district) {
      setWard("");
    } else {
      // User chọn district mới → reset ward
      setWard("");
    }
  }, [district]);

  const handleSave = () => {
    if (!address || !province || !district || !ward) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ!");
      return;
    }

    const provinceObj = provincesData?.data?.find(
      (p: any) => p.ProvinceID === Number(province)
    );
    const districtObj = districtsData?.data?.find(
      (d: any) => d.DistrictID === Number(district)
    );
    const wardObj = wardsData?.data?.find((w: any) => w.WardCode === ward);

    onSave({
      _id: editAddress?._id || Date.now().toString(),
      address,
      provinceName: provinceObj?.ProvinceName || "",
      districtName: districtObj?.DistrictName || "",
      wardName: wardObj?.WardName || "",
      provinceId: province,
      districtId: district,
      wardCode: ward,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>
            {editAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Tỉnh/Thành phố</p>
              <Select
                value={province}
                onValueChange={(value) => {
                  setProvince(value);
                  // Khi user chọn province mới, reset được xử lý trong useEffect
                }}
                disabled={!provincesData?.data?.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {provincesData?.data?.map((prov: any) => (
                    <SelectItem
                      key={prov.ProvinceID}
                      value={String(prov.ProvinceID)}
                    >
                      {prov.ProvinceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Quận/Huyện</p>
              <Select
                value={district}
                onValueChange={(value) => {
                  setDistrict(value);
                  // Khi user chọn district mới, reset được xử lý trong useEffect
                }}
                disabled={!province}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {districtsData?.data?.map((dist: any) => (
                    <SelectItem
                      key={dist.DistrictID}
                      value={String(dist.DistrictID)}
                    >
                      {dist.DistrictName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Phường/Xã</p>
              <Select value={ward} onValueChange={setWard} disabled={!district}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {wardsData?.data?.map((w: any) => (
                    <SelectItem key={w.WardCode} value={w.WardCode}>
                      {w.WardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Địa chỉ chi tiết</p>
            <Input
              placeholder="Nhập số nhà, tên đường..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            {editAddress ? "Cập nhật" : "Thêm địa chỉ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};