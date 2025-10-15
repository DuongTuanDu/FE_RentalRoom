import { useState, useEffect } from "react";
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

  const { data: districtsData } = useGetDistrictsQuery(province, {
    skip: !province,
  });

  const { data: wardsData } = useGetWardsQuery(district, {
    skip: !district,
  });

  useEffect(() => {
    if (editAddress) {
      setAddress(editAddress.address);

      // Nếu đã có ID thì dùng luôn
      if (editAddress.provinceId) {
        setProvince(editAddress.provinceId);
      } else if (editAddress.provinceName && provincesData?.data) {
        // Nếu chưa có ID, tìm từ tên
        const foundProvince = provincesData.data.find(
          (p: any) => p.ProvinceName === editAddress.provinceName
        );
        if (foundProvince) {
          setProvince(String(foundProvince.ProvinceID));
        }
      }

      if (editAddress.districtId) {
        setDistrict(editAddress.districtId);
      } else if (editAddress.districtName && districtsData?.data) {
        const foundDistrict = districtsData.data.find(
          (d: any) => d.DistrictName === editAddress.districtName
        );
        if (foundDistrict) {
          setDistrict(String(foundDistrict.DistrictID));
        }
      }

      if (editAddress.wardCode) {
        setWard(editAddress.wardCode);
      } else if (editAddress.wardName && wardsData?.data) {
        const foundWard = wardsData.data.find(
          (w: any) => w.WardName === editAddress.wardName
        );
        if (foundWard) {
          setWard(foundWard.WardCode);
        }
      }
    } else {
      setAddress("");
      setProvince("");
      setDistrict("");
      setWard("");
    }
  }, [editAddress, open, provincesData, districtsData, wardsData]);

  useEffect(() => {
    if (!province) {
      setDistrict("");
      setWard("");
    }
  }, [province]);

  useEffect(() => {
    if (!district) setWard("");
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
                  setDistrict("");
                  setWard("");
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
                  setWard("");
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
