import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useGetContractDetailsQuery } from "@/services/contract/contract.service";
import type { IContractStatus } from "@/types/contract";

interface ContractDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
}

const getStatusBadge = (status: IContractStatus) => {
  const statusConfig = {
    draft: { label: "Bản nháp", className: "bg-gray-100 text-gray-800" },
    sent_to_tenant: { label: "Đã gửi", className: "bg-blue-100 text-blue-800" },
    signed_by_tenant: { label: "Đã ký bởi khách", className: "bg-yellow-100 text-yellow-800" },
    signed_by_landlord: { label: "Đã ký bởi chủ trọ", className: "bg-green-100 text-green-800" },
    completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
  };
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
};

export const ContractDetailSheet = ({
  open,
  onOpenChange,
  contractId,
}: ContractDetailSheetProps) => {
  const formatDate = useFormatDate();

  const { data: contractDetail, isLoading: isLoadingDetail } = useGetContractDetailsQuery(
    contractId || "",
    { skip: !contractId }
  );

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
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết hợp đồng
          </SheetTitle>
          <SheetDescription>
            Thông tin chi tiết về hợp đồng thuê phòng
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-500">Số hợp đồng</Label>
              <p className="font-medium">{contractDetail.contract?.no || "—"}</p>
            </div>
            <div>
              <Label className="text-slate-500">Trạng thái</Label>
              <div className="mt-1">
                {getStatusBadge(contractDetail.status)}
              </div>
            </div>
            <div>
              <Label className="text-slate-500">Tòa nhà</Label>
              <p className="font-medium">{contractDetail.buildingId?.name || "—"}</p>
            </div>
            <div>
              <Label className="text-slate-500">Phòng</Label>
              <p className="font-medium">{contractDetail.roomId?.roomNumber || "—"}</p>
            </div>
            <div>
              <Label className="text-slate-500">Giá thuê</Label>
              <p className="font-medium">
                {contractDetail.contract?.price
                  ? new Intl.NumberFormat("vi-VN").format(contractDetail.contract.price) + " VNĐ"
                  : "—"}
              </p>
            </div>
            <div>
              <Label className="text-slate-500">Tiền cọc</Label>
              <p className="font-medium">
                {contractDetail.contract?.deposit
                  ? new Intl.NumberFormat("vi-VN").format(contractDetail.contract.deposit) + " VNĐ"
                  : "—"}
              </p>
            </div>
            <div>
              <Label className="text-slate-500">Ngày ký</Label>
              <p className="font-medium">
                {contractDetail.contract?.signDate ? formatDate(contractDetail.contract.signDate) : "—"}
              </p>
            </div>
            <div>
              <Label className="text-slate-500">Địa điểm ký</Label>
              <p className="font-medium">{contractDetail.contract?.signPlace || "—"}</p>
            </div>
            <div>
              <Label className="text-slate-500">Ngày bắt đầu</Label>
              <p className="font-medium">
                {contractDetail.contract?.startDate ? formatDate(contractDetail.contract.startDate) : "—"}
              </p>
            </div>
            <div>
              <Label className="text-slate-500">Ngày kết thúc</Label>
              <p className="font-medium">
                {contractDetail.contract?.endDate ? formatDate(contractDetail.contract.endDate) : "—"}
              </p>
            </div>
            <div>
              <Label className="text-slate-500">Ngày tạo</Label>
              <p className="font-medium">
                {contractDetail.createdAt ? formatDate(contractDetail.createdAt) : "—"}
              </p>
            </div>
            <div>
              <Label className="text-slate-500">Ngày gửi cho khách</Label>
              <p className="font-medium">
                {contractDetail.sentToTenantAt ? formatDate(contractDetail.sentToTenantAt) : "—"}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-lg text-slate-700 mb-2">Thông tin chủ trọ (Bên A)</Label>
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-slate-500">Họ và tên</Label>
                <p className="font-medium">{contractDetail.A?.name || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Ngày sinh</Label>
                <p className="font-medium">{contractDetail.A?.dob || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">CCCD</Label>
                <p className="font-medium">{contractDetail.A?.cccd || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Điện thoại</Label>
                <p className="font-medium">{contractDetail.A?.phone || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Email</Label>
                <p className="font-medium">{contractDetail.A?.email || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Địa chỉ thường trú</Label>
                <p className="font-medium">{contractDetail.A?.permanentAddress || "—"}</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-lg text-slate-700 mb-2">Thông tin khách thuê (Bên B)</Label>
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-slate-500">Họ và tên</Label>
                <p className="font-medium">{contractDetail.B?.name || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Ngày sinh</Label>
                <p className="font-medium">{contractDetail.B?.dob || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">CCCD</Label>
                <p className="font-medium">{contractDetail.B?.cccd || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Điện thoại</Label>
                <p className="font-medium">{contractDetail.B?.phone || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Email</Label>
                <p className="font-medium">{contractDetail.B?.email || "—"}</p>
              </div>
              <div>
                <Label className="text-slate-500">Địa chỉ thường trú</Label>
                <p className="font-medium">{contractDetail.B?.permanentAddress || "—"}</p>
              </div>
            </div>
          </div>

          {contractDetail.terms && contractDetail.terms.length > 0 && (
            <div>
              <Label className="text-lg text-slate-700 mb-2">Điều khoản</Label>
              <div className="space-y-2">
                {contractDetail.terms
                  .sort((a, b) => a.order - b.order)
                  .map((term, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium">{term.name}</div>
                      <div className="text-sm text-slate-600 mt-1">{term.description}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {contractDetail.regulations && contractDetail.regulations.length > 0 && (
            <div>
              <Label className="text-lg text-slate-700 mb-2">Quy định</Label>
              <div className="space-y-2">
                {contractDetail.regulations
                  .sort((a, b) => a.order - b.order)
                  .map((reg, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium">{reg.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{reg.description}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {contractDetail.roommates && contractDetail.roommates.length > 0 && (
            <div>
              <Label className="text-lg text-slate-700 mb-2">Người ở cùng</Label>
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
                    <div className="font-medium">Biển số: {bike.bikeNumber}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {bike.brand} - {bike.color}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contractDetail.furnitures && contractDetail.furnitures.length > 0 && (
            <div>
              <Label className="text-lg text-slate-700 mb-2">Đồ nội thất</Label>
              <div className="space-y-2">
                {contractDetail.furnitures.map((furniture, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium">{furniture.name}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Số lượng: {furniture.quantity} | 
                      Tình trạng: {
                        furniture.condition === "good" ? "Tốt" :
                        furniture.condition === "damaged" ? "Hư hỏng" :
                        furniture.condition === "under_repair" ? "Đang sửa chữa" : furniture.condition
                      }
                      {furniture.damageCount > 0 && ` | Số chỗ hư: ${furniture.damageCount}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

