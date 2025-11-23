import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { useGetTenantContractDetailsQuery } from "@/services/contract/contract.service";

interface ContractDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
}

export const ContractDetailSheet = ({
  open,
  onOpenChange,
  contractId,
}: ContractDetailSheetProps) => {
  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetTenantContractDetailsQuery(contractId || "", { skip: !contractId });

  const formatDateDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (!contractId) return null;

  if (isLoadingDetail) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chi tiết hợp đồng
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!contractDetail) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chi tiết hợp đồng
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 font-medium">
                Không thể tải thông tin hợp đồng
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-screen-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết hợp đồng
          </SheetTitle>
          <SheetDescription>
            Thông tin chi tiết về hợp đồng thuê phòng
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-8 pb-4">
          {/* Contract Header */}
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
              <div>
                Hôm nay, ngày{" "}
                {formatDateDisplay(contractDetail.contract?.signDate) || "—"}{" "}
                tại: {contractDetail.contract?.signPlace || "—"}
              </div>
              <div className="font-semibold">BÊN CHO THUÊ NHÀ (BÊN A):</div>
              <div>Đại diện (Ông/Bà): {contractDetail.A?.name || "—"}</div>
              <div>
                Ngày sinh: {formatDateDisplay(contractDetail.A?.dob) || "—"}
              </div>
              <div>
                CCCD: {contractDetail.A?.cccd || "—"} Cấp ngày:{" "}
                {formatDateDisplay(contractDetail.A?.cccdIssuedDate) || "—"},
                Nơi cấp: {contractDetail.A?.cccdIssuedPlace || "—"}
              </div>
              <div>
                Hộ khẩu thường trú: {contractDetail.A?.permanentAddress || "—"}
              </div>
              <div>Điện thoại: {contractDetail.A?.phone || "—"}</div>
              <div>Email: {contractDetail.A?.email || "—"}</div>
              <div className="font-semibold pt-2">BÊN THUÊ NHÀ (BÊN B):</div>
              <div>Đại diện (Ông/Bà): {contractDetail.B?.name || "—"}</div>
              <div>
                Ngày sinh: {formatDateDisplay(contractDetail.B?.dob) || "—"}
              </div>
              <div>
                CCCD: {contractDetail.B?.cccd || "—"} Cấp ngày:{" "}
                {formatDateDisplay(contractDetail.B?.cccdIssuedDate) || "—"},
                Nơi cấp: {contractDetail.B?.cccdIssuedPlace || "—"}
              </div>
              <div>
                Hộ khẩu thường trú: {contractDetail.B?.permanentAddress || "—"}
              </div>
              <div>Điện thoại: {contractDetail.B?.phone || "—"}</div>
              <div>Email: {contractDetail.B?.email || "—"}</div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="space-y-4">
            <div className="font-semibold">Thông tin hợp đồng</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500">Giá thuê (VNĐ)</Label>
                <p className="font-medium">
                  {contractDetail.contract?.price
                    ? new Intl.NumberFormat("vi-VN").format(
                        contractDetail.contract.price
                      ) + " VNĐ"
                    : "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-500">Tiền cọc (VNĐ)</Label>
                <p className="font-medium">
                  {contractDetail.contract?.deposit
                    ? new Intl.NumberFormat("vi-VN").format(
                        contractDetail.contract.deposit
                      ) + " VNĐ"
                    : "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-500">Ngày bắt đầu</Label>
                <p className="font-medium">
                  {contractDetail.contract?.startDate
                    ? formatDateDisplay(contractDetail.contract.startDate)
                    : "—"}
                </p>
              </div>
              <div>
                <Label className="text-slate-500">Ngày kết thúc</Label>
                <p className="font-medium">
                  {contractDetail.contract?.endDate
                    ? formatDateDisplay(contractDetail.contract.endDate)
                    : "—"}
                </p>
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
                        <div key={index} className="p-3 border rounded-lg">
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
                          <div
                            key={index}
                            className="p-3 border rounded-lg"
                          >
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

          {/* Additional Info */}
          {contractDetail.roommates && contractDetail.roommates.length > 0 && (
            <div>
              <Label className="text-lg text-slate-700 mb-2">
                Người ở cùng
              </Label>
              <div className="space-y-2">
                {contractDetail.roommates.map((roommate, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium">{roommate.name}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      CCCD: {roommate.cccd} | SĐT: {roommate.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contractDetail.bikes && contractDetail.bikes.length > 0 && (
            <div>
              <Label className="text-lg text-slate-700 mb-2">Xe máy</Label>
              <div className="space-y-2">
                {contractDetail.bikes.map((bike, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium">
                      Biển số: {bike.bikeNumber}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {bike.brand} - {bike.color}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contractDetail.furnitures &&
            contractDetail.furnitures.length > 0 && (
              <div>
                <Label className="text-lg text-slate-700 mb-2">
                  Đồ nội thất
                </Label>
                <div className="space-y-2">
                  {contractDetail.furnitures.map((furniture, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium">{furniture.name}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Số lượng: {furniture.quantity} | Tình trạng:{" "}
                        {furniture.condition === "good"
                          ? "Tốt"
                          : furniture.condition === "damaged"
                          ? "Hư hỏng"
                          : furniture.condition === "under_repair"
                          ? "Đang sửa chữa"
                          : furniture.condition}
                        {furniture.damageCount > 0 &&
                          ` | Số chỗ hư: ${furniture.damageCount}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Signatures */}
          {(contractDetail.landlordSignatureUrl ||
            contractDetail.tenantSignatureUrl) && (
            <div className="space-y-4 pt-4 border-t">
              <div className="font-semibold">Chữ ký</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contractDetail.landlordSignatureUrl && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-600">
                      Chữ ký chủ trọ (Bên A)
                    </div>
                    <img
                      src={contractDetail.landlordSignatureUrl}
                      alt="Chữ ký chủ trọ"
                      className="max-w-full h-auto border rounded-lg p-2 bg-white"
                      style={{ minHeight: "200px", maxHeight: "200px" }}
                    />
                  </div>
                )}
                {contractDetail.tenantSignatureUrl && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-600">
                      Chữ ký của tôi (Bên B)
                    </div>
                    <img
                      src={contractDetail.tenantSignatureUrl}
                      alt="Chữ ký của tôi"
                      className="max-w-full h-auto border rounded-lg p-2 bg-white"
                      style={{ minHeight: "200px", maxHeight: "200px" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Renewal Request */}
          {contractDetail.renewalRequest && (
            <div className="space-y-4 pt-4 border-t">
              <div className="font-semibold">Yêu cầu gia hạn</div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <Label className="text-slate-500">Số tháng gia hạn</Label>
                    <p className="font-medium">
                      {contractDetail.renewalRequest.months} tháng
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-500">
                      Ngày kết thúc dự kiến
                    </Label>
                    <p className="font-medium">
                      {formatDateDisplay(
                        contractDetail.renewalRequest.requestedEndDate
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-500">Trạng thái</Label>
                    <p className="font-medium">
                      {contractDetail.renewalRequest.status === "pending"
                        ? "Đang chờ"
                        : contractDetail.renewalRequest.status === "approved"
                        ? "Đã chấp nhận"
                        : contractDetail.renewalRequest.status === "rejected"
                        ? "Đã từ chối"
                        : contractDetail.renewalRequest.status === "cancelled"
                        ? "Đã hủy"
                        : contractDetail.renewalRequest.status}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-500">Ngày yêu cầu</Label>
                    <p className="font-medium">
                      {formatDateDisplay(
                        contractDetail.renewalRequest.requestedAt
                      )}
                    </p>
                  </div>
                </div>
                {contractDetail.renewalRequest.note && (
                  <div className="space-y-2">
                    <Label className="text-slate-500">Ghi chú</Label>
                    <p className="text-sm text-slate-700">
                      {contractDetail.renewalRequest.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed At */}
          {contractDetail.completedAt && (
            <div className="space-y-2 pt-4 border-t">
              <div className="font-semibold">Thông tin hoàn thành</div>
              <div className="text-sm text-slate-600">
                Ngày hoàn thành: {formatDateDisplay(contractDetail.completedAt)}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
