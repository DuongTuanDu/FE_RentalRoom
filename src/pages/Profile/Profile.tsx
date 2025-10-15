import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Save,
  Trash2,
  Plus,
  Edit,
  X,
  Check,
} from "lucide-react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/profile/profile.service";
import { AddAddressModal } from "./components/AddAddressModal";
import type { UserAddress, UserInfo } from "@/types/profile";
import { toast } from "sonner";

const Profile = () => {
  const { data } = useGetProfileQuery();
  const userInfo = data?.user;
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  // State for addresses
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [originalAddresses, setOriginalAddresses] = useState<UserAddress[]>([]); // THÊM STATE NÀY
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [tempFullName, setTempFullName] = useState("");

  // State for form data
  const [formData, setFormData] = useState<UserInfo>({
    _id: "",
    fullName: "",
    phoneNumber: "",
    dob: "",
    gender: "",
  });

  const [originalData, setOriginalData] = useState<UserInfo>({
    _id: "",
    fullName: "",
    phoneNumber: "",
    dob: "",
    gender: "",
  });

  // Initialize data when userInfo is loaded
  useEffect(() => {
    if (userInfo) {
      const initialData: UserInfo = {
        _id: userInfo.userInfo._id || "",
        fullName: userInfo.userInfo.fullName || "",
        phoneNumber: userInfo.userInfo.phoneNumber || "",
        dob: userInfo.userInfo.dob || "",
        gender: userInfo.userInfo.gender || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);

      // Initialize addresses
      if (userInfo.userInfo.address && userInfo.userInfo.address.length > 0) {
        const addressesWithId = userInfo.userInfo.address.map(
          (addr: any, index: number) => ({
            ...addr,
            id: addr._id || `${index}-${Date.now()}`,
          })
        );
        setAddresses(addressesWithId);
        setOriginalAddresses([...addressesWithId]); // LƯU ĐỊA CHỈ GỐC
        setSelectedAddressId(addressesWithId[0].id);
      }
    }
  }, [userInfo]);

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    // Kiểm tra thay đổi trong formData
    const hasFormChanges = Object.keys(formData).some(
      (key) =>
        formData[key as keyof UserInfo] !== originalData[key as keyof UserInfo]
    );

    // Kiểm tra thay đổi trong addresses
    const hasAddressChanges =
      JSON.stringify(addresses) !== JSON.stringify(originalAddresses);

    return hasFormChanges || hasAddressChanges;
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        ...formData,
        address: addresses.map((addr) => ({
          address: addr.address,
          provinceName: addr.provinceName,
          districtName: addr.districtName,
          wardName: addr.wardName,
        })),
      };

      const response = await updateProfile(payload).unwrap();
      if (response.user) {
        // Cập nhật originalData và originalAddresses sau khi lưu thành công
        setOriginalData(formData);
        setOriginalAddresses([...addresses]);

        toast.success("Cập nhật thông tin thành công!", {
          description: "Thông tin cá nhân của bạn đã được cập nhật.",
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleAddAddress = (
    newAddress: Omit<UserAddress, "_id"> & { _id?: string }
  ) => {
    const addressWithId: UserAddress = {
      ...newAddress,
      _id: newAddress._id || Date.now().toString(),
    };
    setAddresses((prev) => [...prev, addressWithId]);
    setSelectedAddressId(addressWithId._id || "");
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleUpdateAddress = (updatedAddress: UserAddress) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr._id === updatedAddress._id ? updatedAddress : addr
      )
    );
  };

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      if (selectedAddressId === addressId && addresses.length > 1) {
        const remainingAddresses = addresses.filter(
          (addr) => addr._id !== addressId
        );
        setSelectedAddressId(remainingAddresses[0]?._id || "");
      } else if (addresses.length === 1) {
        setSelectedAddressId("");
      }
    }
  };

  const renderField = (
    field: keyof UserInfo,
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    type: string = "text"
  ) => {
    const value = formData[field] as string;

    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <Input
            type={type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={placeholder}
            className="max-w-sm"
          />
        </div>
      </div>
    );
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-gray-600">Đang tải thông tin...</div>
      </div>
    );
  }

  const selectedAddress = addresses.find(
    (addr) => addr._id === selectedAddressId
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              <Avatar className="h-24 w-24 border-4 border-blue-100 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                  {getInitials(formData.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {!isEditingFullName ? (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {formData.fullName || "Chưa cập nhật"}
                      </h2>
                      <button
                        onClick={() => {
                          setTempFullName(formData.fullName);
                          setIsEditingFullName(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        title="Chỉnh sửa tên"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={tempFullName}
                        onChange={(e) => setTempFullName(e.target.value)}
                        className="max-w-sm text-2xl font-bold h-10"
                        placeholder="Nhập họ và tên"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        className="bg-green-600 hover:bg-green-700 h-8 w-8"
                        onClick={() => {
                          handleChange("fullName", tempFullName);
                          setIsEditingFullName(false);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => {
                          setTempFullName(formData.fullName);
                          setIsEditingFullName(false);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <Shield className="w-3 h-3 mr-1" />
                    {userInfo.isActivated ? "Đã kích hoạt" : "Chưa kích hoạt"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span>{userInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{userInfo.role}</span>
                </div>
              </div>

              {hasChanges() && (
                <Button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-white shadow-md"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              )}
            </div>

            <Separator className="my-6" />

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Thông Tin Cá Nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderField(
                    "phoneNumber",
                    "Số điện thoại",
                    <Phone className="w-5 h-5" />,
                    "Nhập số điện thoại"
                  )}
                  {renderField(
                    "dob",
                    "Ngày sinh",
                    <Calendar className="w-5 h-5" />,
                    "Chọn ngày sinh",
                    "date"
                  )}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Giới tính</p>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleChange("gender", value)}
                      >
                        <SelectTrigger className="max-w-sm">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Địa Chỉ
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingAddress(null);
                        setShowAddModal(true);
                      }}
                      variant={"outline"}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm mới
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {addresses.length > 0 ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          Chọn địa chỉ hiển thị
                        </p>
                        <Select
                          value={selectedAddressId}
                          onValueChange={setSelectedAddressId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn địa chỉ" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((addr) => (
                              <SelectItem key={addr._id} value={addr._id || ""}>
                                {addr.address}, {addr.wardName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedAddress && (
                        <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {selectedAddress.address}
                                </p>
                                <p className="text-gray-600">
                                  {selectedAddress.wardName},{" "}
                                  {selectedAddress.districtName}
                                </p>
                                <p className="text-gray-600">
                                  {selectedAddress.provinceName}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAddress(selectedAddress)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDeleteAddress(selectedAddress._id || "")
                              }
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="mb-2">Chưa có địa chỉ nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddAddressModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingAddress(null);
        }}
        onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
        editAddress={editingAddress}
      />
    </div>
  );
};

export default Profile;
