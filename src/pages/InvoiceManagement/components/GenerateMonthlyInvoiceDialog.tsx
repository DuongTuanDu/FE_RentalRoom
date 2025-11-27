import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, Plus, Trash2, Building2, Zap } from "lucide-react";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetBuildingservicesQuery } from "@/services/building-services/building-services.service";
import { useGetUtilityReadingsQuery } from "@/services/utility/utility.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GenerateMonthlyInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    buildingId: string;
    periodMonth: number;
    periodYear: number;
    includeRent: boolean;
    extraItems: {
      label: string;
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }[];
  }) => void;
  isLoading: boolean;
}

interface ExtraItem {
  label: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export const GenerateMonthlyInvoiceDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: GenerateMonthlyInvoiceDialogProps) => {
  const [buildingId, setBuildingId] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");
  const [includeRent, setIncludeRent] = useState(true);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Get building services
  const { data: buildingServices, isLoading: isLoadingServices } =
    useGetBuildingservicesQuery(
      {
        buildingId: buildingId || "",
        includeDeleted: false,
      },
      {
        skip: !buildingId,
      }
    );

  // Get utility readings
  const { data: utilityReadings, isLoading: isLoadingUtilities } =
    useGetUtilityReadingsQuery(
      {
        buildingId: buildingId || undefined,
        periodMonth: periodMonth || undefined,
        periodYear: periodYear || undefined,
        page: 1,
        limit: 100,
      },
      {
        skip: !buildingId || !periodMonth || !periodYear,
      }
    );

  // Set default to current month/year
  useEffect(() => {
    if (open) {
      const now = new Date();
      setPeriodMonth(String(now.getMonth() + 1));
      setPeriodYear(String(now.getFullYear()));
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setBuildingId("");
      setIncludeRent(true);
      setExtraItems([]);
    }
  }, [open]);

  const handleAddExtraItem = () => {
    setExtraItems([
      ...extraItems,
      {
        label: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveExtraItem = (index: number) => {
    setExtraItems(extraItems.filter((_, i) => i !== index));
  };

  const handleExtraItemChange = (
    index: number,
    field: keyof ExtraItem,
    value: any
  ) => {
    const newItems = [...extraItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate amount if quantity or unitPrice changes
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].amount =
        newItems[index].quantity * newItems[index].unitPrice;
    }

    setExtraItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingId || !periodMonth || !periodYear) {
      return;
    }
    onSubmit({
      buildingId,
      periodMonth: Number(periodMonth),
      periodYear: Number(periodYear),
      includeRent,
      extraItems: extraItems.map((item) => ({
        label: item.label,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tạo hóa đơn tháng
          </DialogTitle>
          <DialogDescription>
            Tạo hóa đơn tự động hàng loạt cho tất cả các phòng đang được thuê
            trong tòa nhà đã chọn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Building */}
          <div className="space-y-2 grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>
                Tòa nhà <span className="text-red-500">*</span>
              </Label>
              <BuildingSelectCombobox
                value={buildingId}
                onValueChange={setBuildingId}
              />
            </div>

            {/* Period Month */}
            <div className="space-y-2 !mt-0">
              <Label>
                Tháng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={periodMonth}
                onValueChange={setPeriodMonth}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period Year */}
            <div className="space-y-2 !mt-0">
              <Label>
                Năm <span className="text-red-500">*</span>
              </Label>
              <Select value={periodYear} onValueChange={setPeriodYear} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Building Services Info */}
          {buildingId && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Dịch vụ tòa nhà
                </CardTitle>
                <CardDescription className="text-xs">
                  Thông tin các dịch vụ được áp dụng cho tòa nhà
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingServices ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Đang tải...
                    </span>
                  </div>
                ) : buildingServices && buildingServices.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Tên dịch vụ</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Loại tính phí</TableHead>
                          <TableHead className="text-right">Giá</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buildingServices
                          .filter((service) => !service.isDeleted)
                          .map((service, index) => (
                            <TableRow key={service._id}>
                              <TableCell className="text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {service.label || service.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {service.description || "—"}
                              </TableCell>
                              <TableCell>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                  {service.chargeType === "perRoom"
                                    ? "Theo phòng"
                                    : service.chargeType === "perPerson"
                                    ? "Theo người"
                                    : service.chargeType === "included"
                                    ? "Đã bao gồm"
                                    : "Cố định"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-semibold text-blue-700 dark:text-blue-300">
                                {service.fee.toLocaleString("vi-VN")}{" "}
                                {service.currency}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Chưa có dịch vụ nào được cấu hình
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Utility Readings Info */}
          {buildingId && periodMonth && periodYear && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Chỉ số điện nước
                </CardTitle>
                <CardDescription className="text-xs">
                  Tổng hợp chỉ số điện nước kỳ {periodMonth}/{periodYear} của
                  tất cả các phòng
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUtilities ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Đang tải...
                    </span>
                  </div>
                ) : utilityReadings && utilityReadings.items.length > 0 ? (
                  <div className="rounded-md border max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phòng</TableHead>
                          <TableHead className="text-center">
                            Điện (kWh)
                          </TableHead>
                          <TableHead className="text-center">
                            Đơn giá điện
                          </TableHead>
                          <TableHead className="text-right">
                            Tiền điện
                          </TableHead>
                          <TableHead className="text-center">
                            Nước (m³)
                          </TableHead>
                          <TableHead className="text-center">
                            Đơn giá nước
                          </TableHead>
                          <TableHead className="text-right">
                            Tiền nước
                          </TableHead>
                          <TableHead className="text-right">
                            Tổng cộng
                          </TableHead>
                          <TableHead className="text-center">
                            Trạng thái
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {utilityReadings.items.map((reading) => (
                          <TableRow key={reading._id}>
                            <TableCell className="font-medium">
                              {reading.roomId.roomNumber}
                            </TableCell>
                            <TableCell className="text-center">
                              {reading.eConsumption.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {reading.eUnitPrice.toLocaleString("vi-VN")} đ/kWh
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reading.eAmount.toLocaleString("vi-VN")} đ
                            </TableCell>
                            <TableCell className="text-center">
                              {reading.wConsumption.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {reading.wUnitPrice.toLocaleString("vi-VN")} đ/m³
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reading.wAmount.toLocaleString("vi-VN")} đ
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-700 dark:text-green-300">
                              {(
                                reading.eAmount + reading.wAmount
                              ).toLocaleString("vi-VN")}{" "}
                              đ
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  reading.status === "confirmed"
                                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                    : reading.status === "billed"
                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {reading.status === "confirmed"
                                  ? "Đã xác nhận"
                                  : reading.status === "billed"
                                  ? "Đã xuất hóa đơn"
                                  : "Nháp"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {utilityReadings.total > utilityReadings.items.length && (
                      <div className="text-center py-2 text-xs text-muted-foreground border-t bg-muted/50">
                        Hiển thị {utilityReadings.items.length} /{" "}
                        {utilityReadings.total} phòng
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Chưa có chỉ số điện nước cho kỳ này
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Include Rent */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeRent"
              checked={includeRent}
              onCheckedChange={(checked) => setIncludeRent(checked === true)}
            />
            <Label
              htmlFor="includeRent"
              className="text-sm font-normal cursor-pointer"
            >
              Bao gồm tiền thuê
            </Label>
          </div>

          {/* Extra Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Chi phí phát sinh (tùy chọn)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExtraItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm chi phí phát sinh
              </Button>
            </div>

            <div className="space-y-3">
              {extraItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 bg-slate-50 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Phát sinh {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExtraItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tên chi phí *</Label>
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          handleExtraItemChange(index, "label", e.target.value)
                        }
                        placeholder="VD: Phí dịch vụ"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleExtraItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Mô tả chi tiết..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Số lượng *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          handleExtraItemChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Đơn giá *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleExtraItemChange(
                            index,
                            "unitPrice",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Thành tiền</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) =>
                          handleExtraItemChange(
                            index,
                            "amount",
                            Number(e.target.value)
                          )
                        }
                        readOnly
                        className="bg-slate-100 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {extraItems.length === 0 && (
                <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg text-sm">
                  Chưa có chi phí phát sinh nào. Nhấn "Thêm chi phí phát sinh"
                  để thêm.
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !buildingId || !periodMonth || !periodYear}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo hóa đơn"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
