import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useGetTenantContractDetailsQuery,
  useUpdateTenantContractMutation,
} from "@/services/contract/contract.service";
import { toast } from "sonner";
import type { IUpdateTenantContractRequest, IPerson } from "@/types/contract";
import { formatDateForInput } from "@/helpers/date";
import { Plus, Trash2 } from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";

interface UpdateTenantContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const UpdateTenantContractDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: UpdateTenantContractDialogProps) => {
  const formatDate = useFormatDate();

  // Person B (Tenant) states
  const [personBName, setPersonBName] = useState("");
  const [personBDob, setPersonBDob] = useState("");
  const [personBCccd, setPersonBCccd] = useState("");
  const [personBCccdIssuedDate, setPersonBCccdIssuedDate] = useState("");
  const [personBCccdIssuedPlace, setPersonBCccdIssuedPlace] = useState("");
  const [personBPermanentAddress, setPersonBPermanentAddress] = useState("");
  const [personBPhone, setPersonBPhone] = useState("");
  const [personBEmail, setPersonBEmail] = useState("");

  // Roommates
  const [roommates, setRoommates] = useState<IPerson[]>([]);

  // Bikes
  const [bikes, setBikes] = useState<
    { bikeNumber: string; color: string; brand: string }[]
  >([]);

  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetTenantContractDetailsQuery(contractId || "", {
      skip: !contractId || !open,
    });
  const [updateContract, { isLoading: isUpdating }] =
    useUpdateTenantContractMutation();

  // Load contract detail data into form when dialog opens
  useEffect(() => {
    if (open && contractDetail) {
      // Person B (Tenant)
      setPersonBName(contractDetail.B?.name || "");
      setPersonBDob(formatDateForInput(contractDetail.B?.dob));
      setPersonBCccd(contractDetail.B?.cccd || "");
      setPersonBCccdIssuedDate(
        formatDateForInput(contractDetail.B?.cccdIssuedDate)
      );
      setPersonBCccdIssuedPlace(contractDetail.B?.cccdIssuedPlace || "");
      setPersonBPermanentAddress(contractDetail.B?.permanentAddress || "");
      setPersonBPhone(contractDetail.B?.phone || "");
      setPersonBEmail(contractDetail.B?.email || "");

      // Roommates
      setRoommates(contractDetail.roommates || []);

      // Bikes
      setBikes(contractDetail.bikes || []);
    }
  }, [open, contractDetail]);

  const handleAddRoommate = () => {
    setRoommates([
      ...roommates,
      {
        name: "",
        dob: "",
        cccd: "",
        cccdIssuedDate: "",
        cccdIssuedPlace: "",
        permanentAddress: "",
        phone: "",
        email: "",
      },
    ]);
  };

  const handleRemoveRoommate = (index: number) => {
    setRoommates(roommates.filter((_, i) => i !== index));
  };

  const handleUpdateRoommate = (
    index: number,
    field: keyof IPerson,
    value: string
  ) => {
    const updated = [...roommates];
    updated[index] = { ...updated[index], [field]: value };
    setRoommates(updated);
  };

  const handleAddBike = () => {
    setBikes([...bikes, { bikeNumber: "", color: "", brand: "" }]);
  };

  const handleRemoveBike = (index: number) => {
    setBikes(bikes.filter((_, i) => i !== index));
  };

  const handleUpdateBike = (
    index: number,
    field: "bikeNumber" | "color" | "brand",
    value: string
  ) => {
    const updated = [...bikes];
    updated[index] = { ...updated[index], [field]: value };
    setBikes(updated);
  };

  const handleUpdateContract = async () => {
    if (!contractId || !contractDetail) return;

    if (
      !personBName ||
      !personBDob ||
      !personBCccd ||
      !personBPhone ||
      !personBEmail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bên thuê nhà");
      return;
    }

    try {
      const updateData: IUpdateTenantContractRequest = {
        B: {
          name: personBName,
          dob: personBDob,
          cccd: personBCccd,
          cccdIssuedDate: personBCccdIssuedDate,
          cccdIssuedPlace: personBCccdIssuedPlace,
          permanentAddress: personBPermanentAddress,
          phone: personBPhone,
          email: personBEmail,
        },
        roommates: roommates.filter((r) => r.name && r.cccd && r.phone),
        bikes: bikes.filter((b) => b.bikeNumber && b.brand && b.color),
      };

      await updateContract({
        id: contractId,
        data: updateData,
      }).unwrap();

      toast.success("Cập nhật hợp đồng thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi cập nhật hợp đồng"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 md:p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Cập nhật thông tin hợp đồng</DialogTitle>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : contractDetail ? (
          <div className="px-6 pb-6 space-y-6">
            {/* Preview Header */}
            <div className="space-y-3 bg-muted/40 rounded-md">
              <div className="text-center">
                <div className="font-semibold">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div>ĐỘC LẬP – TỰ DO – HẠNH PHÚC</div>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-xl font-bold">HỢP ĐỒNG THUÊ PHÒNG</div>
                <div className="text-sm text-muted-foreground">
                  Số: {contractDetail.contract?.no || "—"}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">BÊN CHO THUÊ NHÀ (BÊN A):</div>
                {/* <div>Đại diện (Ông/Bà): {contractDetail.A?.name || "—"}</div> */}
                <div>
                  Đại diện (Ông/Bà):{" "}
                  <span className="font-medium">
                    {contractDetail.A?.name || "—"}
                  </span>
                </div>
                <div>
                  Ngày sinh:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.dob
                      ? formatDate(contractDetail.B.dob)
                      : "—"}
                  </span>
                </div>
                <div>
                  CCCD:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.cccd || "—"}
                  </span>{" "}
                  Cấp ngày:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.cccdIssuedDate
                      ? formatDate(contractDetail.B.cccdIssuedDate)
                      : "—"}
                  </span>
                  , Nơi cấp:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.cccdIssuedPlace || "—"}
                  </span>
                </div>
                <div>
                  Hộ khẩu thường trú:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.permanentAddress || "—"}
                  </span>
                </div>
                <div>
                  Điện thoại:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.phone || "—"}
                  </span>
                </div>
                <div>
                  Email:{" "}
                  <span className="font-medium">
                    {contractDetail.A?.email || "—"}
                  </span>
                </div>
                <div className="font-semibold pt-2">BÊN THUÊ NHÀ (BÊN B):</div>
                <div>
                  Đại diện (Ông/Bà):{" "}
                  <Input
                    value={personBName}
                    onChange={(e) => setPersonBName(e.target.value)}
                    placeholder="Nhập tên"
                    className="inline-block w-48 h-6 text-sm"
                  />
                </div>
                <div>
                  Ngày sinh:{" "}
                  <Input
                    type="date"
                    value={personBDob}
                    onChange={(e) => setPersonBDob(e.target.value)}
                    className="inline-block w-32 h-6 text-sm"
                  />
                </div>
                <div>
                  CCCD:{" "}
                  <Input
                    value={personBCccd}
                    onChange={(e) => setPersonBCccd(e.target.value)}
                    placeholder="Nhập số CCCD"
                    className="inline-block w-40 h-6 text-sm"
                  />{" "}
                  Cấp ngày:{" "}
                  <Input
                    type="date"
                    value={personBCccdIssuedDate}
                    onChange={(e) => setPersonBCccdIssuedDate(e.target.value)}
                    className="inline-block w-32 h-6 text-sm"
                  />
                  , Nơi cấp:{" "}
                  <Input
                    value={personBCccdIssuedPlace}
                    onChange={(e) => setPersonBCccdIssuedPlace(e.target.value)}
                    placeholder="Nhập nơi cấp"
                    className="inline-block w-40 h-6 text-sm"
                  />
                </div>
                <div>
                  Hộ khẩu thường trú:{" "}
                  <Input
                    value={personBPermanentAddress}
                    onChange={(e) => setPersonBPermanentAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                    className="inline-block w-64 h-6 text-sm"
                  />
                </div>
                <div>
                  Điện thoại:{" "}
                  <Input
                    value={personBPhone}
                    onChange={(e) => setPersonBPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="inline-block w-40 h-6 text-sm"
                  />
                </div>
                <div>
                  Email:{" "}
                  <Input
                    type="email"
                    value={personBEmail}
                    onChange={(e) => setPersonBEmail(e.target.value)}
                    placeholder="Nhập email"
                    className="inline-block w-48 h-6 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Regulations */}
            {(contractDetail.terms && contractDetail.terms.length > 0) ||
            (contractDetail.regulations &&
              contractDetail.regulations.length > 0) ? (
              <div className="space-y-4">
                {contractDetail.terms && contractDetail.terms.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold">Nội dung điều khoản</div>
                    <div className="space-y-2 text-sm">
                      {[...contractDetail.terms]
                        .sort((a, b) => a.order - b.order)
                        .map((term, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="font-medium">{term.name}</div>
                            <div className="text-muted-foreground mt-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: term.description,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {contractDetail.regulations &&
                  contractDetail.regulations.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-semibold">Nội dung quy định</div>
                      <div className="space-y-2 text-sm">
                        {[...contractDetail.regulations]
                          .sort((a, b) => a.order - b.order)
                          .map((reg, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="font-medium">{reg.title}</div>
                              <div className="text-muted-foreground mt-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: reg.description,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : null}

            {/* Roommates Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Người ở cùng</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRoommate}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm người ở cùng
                </Button>
              </div>
              <div className="space-y-3">
                {roommates.map((roommate, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Người ở cùng {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRoommate(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Họ và tên</Label>
                        <Input
                          value={roommate.name}
                          onChange={(e) =>
                            handleUpdateRoommate(index, "name", e.target.value)
                          }
                          placeholder="Nhập họ tên"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Ngày sinh</Label>
                        <Input
                          type="date"
                          value={formatDateForInput(roommate.dob)}
                          onChange={(e) =>
                            handleUpdateRoommate(index, "dob", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">CCCD</Label>
                        <Input
                          value={roommate.cccd}
                          onChange={(e) =>
                            handleUpdateRoommate(index, "cccd", e.target.value)
                          }
                          placeholder="Nhập số CCCD"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Số điện thoại</Label>
                        <Input
                          value={roommate.phone}
                          onChange={(e) =>
                            handleUpdateRoommate(index, "phone", e.target.value)
                          }
                          placeholder="Nhập SĐT"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-xs">Địa chỉ thường trú</Label>
                        <Input
                          value={roommate.permanentAddress}
                          onChange={(e) =>
                            handleUpdateRoommate(
                              index,
                              "permanentAddress",
                              e.target.value
                            )
                          }
                          placeholder="Nhập địa chỉ"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {roommates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có người ở cùng. Nhấn "Thêm người ở cùng" để thêm.
                  </p>
                )}
              </div>
            </div>

            {/* Bikes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Xe máy</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBike}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm xe máy
                </Button>
              </div>
              <div className="space-y-3">
                {bikes.map((bike, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Xe máy {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBike(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Biển số</Label>
                        <Input
                          value={bike.bikeNumber}
                          onChange={(e) =>
                            handleUpdateBike(
                              index,
                              "bikeNumber",
                              e.target.value
                            )
                          }
                          placeholder="Nhập biển số"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Hãng xe</Label>
                        <Input
                          value={bike.brand}
                          onChange={(e) =>
                            handleUpdateBike(index, "brand", e.target.value)
                          }
                          placeholder="Nhập hãng xe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Màu sắc</Label>
                        <Input
                          value={bike.color}
                          onChange={(e) =>
                            handleUpdateBike(index, "color", e.target.value)
                          }
                          placeholder="Nhập màu sắc"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {bikes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có xe máy. Nhấn "Thêm xe máy" để thêm.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button onClick={handleUpdateContract} disabled={isUpdating}>
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
