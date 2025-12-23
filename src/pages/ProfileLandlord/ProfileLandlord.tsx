import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Shield,
  Save,
  Edit,
  X,
  Check,
  Upload,
  QrCode,
  Building,
  CreditCard,
  UserCheck,
  Loader2,
  UploadCloud,
} from "lucide-react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateBankInfoMutation,
  useUploadBankQrMutation,
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} from "@/services/profile/profile.service";
import { toast } from "sonner";

const   ProfileLandlord = () => {
  const { data, refetch } = useGetProfileQuery();
  const userInfo = data?.user;
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateBankInfo, { isLoading: isUpdatingBank }] = useUpdateBankInfoMutation();
  const [uploadBankQr, { isLoading: isUploading }] = useUploadBankQrMutation();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Address states
  const [addressDetail, setAddressDetail] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  // Bank states
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Original data để so sánh thay đổi
  const [originalData, setOriginalData] = useState<any>({});

  // Address dropdown data
  const { data: provincesData } = useGetProvincesQuery();
  const { data: districtsData } = useGetDistrictsQuery(province, { skip: !province });
  const { data: wardsData } = useGetWardsQuery(district, { skip: !district });

  // Edit name
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // QR Upload Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Load data
  useEffect(() => {
    if (userInfo?.userInfo) {
      const info = userInfo.userInfo;
      setFullName(info.fullName || "");
      setPhoneNumber(info.phoneNumber || "");
      setDob(info.dob?.split("T")[0] || "");
      setGender(info.gender || "");

      // Address (string)
      if (info.address && typeof info.address === "string") {
        setAddressDetail(info.address);
      }

      // Bank info
      if (info.bankInfo) {
        setBankName(info.bankInfo.bankName || "");
        setAccountNumber(info.bankInfo.accountNumber || "");
        setAccountName(info.bankInfo.accountName || "");
        setQrUrl(info.bankInfo.qrImageUrl  || "");
      }

      // Save original
      setOriginalData({
        fullName: info.fullName,
        phoneNumber: info.phoneNumber,
        dob: info.dob,
        gender: info.gender,
        address: info.address,
        bankInfo: info.bankInfo,
      });
    }
  }, [userInfo]);

  const hasChanges = () => {
    return (
      fullName !== originalData.fullName ||
      phoneNumber !== originalData.phoneNumber ||
      dob !== (originalData.dob?.split("T")[0] || "") ||
      gender !== originalData.gender ||
      addressDetail !== (originalData.address || "") ||
      bankName !== (originalData.bankInfo?.bankName || "") ||
      accountNumber !== (originalData.bankInfo?.accountNumber || "") ||
      accountName !== (originalData.bankInfo?.accountName || "")
      // qrUrl có thể thay đổi khi upload
    );
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        fullName,
        phoneNumber,
        dob: dob || null,
        gender,
        address: addressDetail,
      };

      await updateProfile(payload).unwrap();

      if (
        bankName !== (originalData.bankInfo?.bankName || "") ||
        accountNumber !== (originalData.bankInfo?.accountNumber || "") ||
        accountName !== (originalData.bankInfo?.accountName || "")
      ) {
        await updateBankInfo({
          bankName,
          accountNumber,
          accountName,
          qrImageUrl: qrUrl,
        }).unwrap();
      }

      setOriginalData({
        fullName,
        phoneNumber,
        dob,
        gender,
        address: addressDetail,
        bankInfo: { bankName, accountNumber, accountName, qrImageUrl: qrUrl },
      });

      toast.success("Cập nhật thông tin thành công!");
      refetch();
    } catch (err:any) {
      toast.error(err?.message?.message || "Cập nhật thất bại, vui lòng thử lại");
    }
  };

  const handleUploadQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("qrImage", file);

    try {
      const result = await uploadBankQr(formData).unwrap();
      setQrUrl(result.bankInfo.qrImageUrl || "");
      toast.success(result.message || "Upload QR thành công");
      setIsQrModalOpen(false);
    } catch (err: any) {
      console.error("Lỗi upload QR:", err);
      toast.error(err.message.message || "Upload QR thất bại, vui lòng thử lại");
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <Avatar className="h-28 w-28 border-4 border-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
                  {fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {!isEditingName ? (
                    <>
                      <h1 className="text-3xl font-bold">{fullName || "Chưa đặt tên"}</h1>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setTempName(fullName);
                          setIsEditingName(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="text-3xl font-bold h-12 max-w-md"
                        autoFocus
                      />
                      <Button size="icon" onClick={() => { setFullName(tempName); setIsEditingName(false); }}>
                        <Check className="w-5 h-5 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                  <Badge className="ml-4" variant={userInfo.isActivated ? "default" : "secondary"}>
                    <Shield className="w-3 h-3 mr-1" />
                    {userInfo.isActivated ? "Đã kích hoạt" : "Chưa kích hoạt"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {userInfo.email}</div>
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> {userInfo.role}</div>
                </div>
              </div>

              {hasChanges() && (
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={isUpdatingProfile || isUpdatingBank}
                  className="shadow-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Lưu thay đổi
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          {/* Thông tin cá nhân */}
          <Card  className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Văn Cừ"
                />
              </div>
            </CardContent>
          </Card>


          {/* Ngân hàng & QR */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  Thông tin nhận tiền chuyển khoản
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Ngân hàng</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="VD: Vietcombank CN Tân Bình" />
                  </div>
                  <div className="space-y-2">
                    <Label>Số tài khoản</Label>
                    <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="0123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><UserCheck className="w-4 h-4" /> Chủ tài khoản</Label>
                    <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="NGUYEN VAN A" />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 bg-gray-50">
                  {qrUrl ? (
                    <div className="text-center">
                      <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-lg shadow-lg mx-auto" />
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => setIsQrModalOpen(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Thay QR mới
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <QrCode className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                      <p className="mb-4">Chưa có mã QR</p>
                      <Button onClick={() => setIsQrModalOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Tải lên mã QR
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Upload QR */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              Tải lên mã QR chuyển khoản
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-upload" className="text-base font-medium">
                Chọn hình ảnh QR Code
              </Label>
              <p className="text-sm text-muted-foreground">
                Hỗ trợ định dạng: JPG, PNG, GIF (tối đa 5MB)
              </p>
            </div>
            
            <div
              className="relative border-2 border-dashed rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="qr-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadQr}
                className="hidden"
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-blue-600">Đang tải lên...</p>
                  <p className="text-xs text-muted-foreground">Vui lòng đợi trong giây lát</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <UploadCloud className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Nhấp để chọn hoặc kéo thả hình ảnh vào đây
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hỗ trợ kéo thả file trực tiếp
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Chọn file
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsQrModalOpen(false)}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Hủy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileLandlord;