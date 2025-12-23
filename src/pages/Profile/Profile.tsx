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
  Edit,
  X,
  Check,
} from "lucide-react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/profile/profile.service";
import type { UserInfo } from "@/types/profile";
import { toast } from "sonner";

const Profile = () => {
  const { data } = useGetProfileQuery();
  const userInfo = data?.user;
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // State for address (now a single string)
  const [address, setAddress] = useState<string>("");
  const [originalAddress, setOriginalAddress] = useState<string>("");
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
        dob: formatDate(userInfo.userInfo.dob) || "",
        gender: userInfo.userInfo.gender || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);

      // Initialize address (now a string)
      const addressValue = userInfo.userInfo.address;
      if (typeof addressValue === "string") {
        setAddress(addressValue);
        setOriginalAddress(addressValue);
      } else if (Array.isArray(addressValue)) {
        // Handle legacy array format - convert to string
        const addressArray = addressValue as any[];
        if (addressArray.length > 0) {
          const firstAddr = addressArray[0] as any;
          const addressString = `${firstAddr.address || ""}, ${
            firstAddr.wardName || ""
          }, ${firstAddr.districtName || ""}, ${firstAddr.provinceName || ""}`;
          setAddress(addressString);
          setOriginalAddress(addressString);
        } else {
          setAddress("");
          setOriginalAddress("");
        }
      } else {
        setAddress("");
        setOriginalAddress("");
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

    // Kiểm tra thay đổi trong address
    const hasAddressChanges = address !== originalAddress;

    return hasFormChanges || hasAddressChanges;
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        ...formData,
        address: address,
      };

      const response = await updateProfile(payload).unwrap();
      if (response.user) {
        setOriginalData(formData);
        setOriginalAddress(address);
        toast.success("Cập nhật thông tin thành công!", {
          description: "Thông tin cá nhân của bạn đã được cập nhật.",
        });
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.message?.message || "Cập nhật thông tin thất bại!");
    }
  };

  const renderField = (
    field: keyof UserInfo | "address",
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    type: string = "text"
  ) => {
    const value =
      field === "address"
        ? address
        : (formData[field as keyof UserInfo] as string);

    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <Input
            type={type}
            value={value}
            onChange={(e) => {
              if (field === "address") {
                setAddress(e.target.value);
              } else {
                handleChange(field as keyof UserInfo, e.target.value);
              }
            }}
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

            <div className="grid gap-6">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Thông Tin Cá Nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2">
                  {renderField(
                    "phoneNumber",
                    "Số điện thoại",
                    <Phone className="w-5 h-5" />,
                    "Nhập số điện thoại"
                  )}
                  <div className="!mt-0">
                    {renderField(
                      "dob",
                      "Ngày sinh",
                      <Calendar className="w-5 h-5" />,
                      "Chọn ngày sinh",
                      "date"
                    )}
                  </div>
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
                  {renderField(
                    "address",
                    "Địa chỉ",
                    <MapPin className="w-5 h-5" />,
                    "Nhập địa chỉ của bạn"
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
