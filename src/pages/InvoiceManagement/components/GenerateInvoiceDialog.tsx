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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  FileText,
  Plus,
  Trash2,
  Building2,
  Zap,
  Droplets,
  AlertCircle,
} from "lucide-react";
import { RoomCompletedContractSelectCombobox } from "./RoomCompletedContractSelectCombobox";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetRoomsCompletedContractQuery } from "@/services/invoice/invoice.service";
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
import type {
  IGenerateInvoiceRequest,
  IRoomCompletedContract,
} from "@/types/invoice";

interface InvoiceItem {
  type: "rent" | "electric" | "water" | "service" | "other";
  label: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  utilityReadingId: string;
}

interface GenerateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: IGenerateInvoiceRequest) => void;
  isLoading: boolean;
}

export const GenerateInvoiceDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: GenerateInvoiceDialogProps) => {
  const [buildingId, setBuildingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [contractId, setContractId] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueDateError, setDueDateError] = useState("");
  const [includeRent, setIncludeRent] = useState(true);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Get rooms with completed contracts
  const { data: roomsData, isLoading: isLoadingRooms } =
    useGetRoomsCompletedContractQuery(
      {
        buildingId: buildingId || undefined,
        page: 1,
        limit: 10,
      },
      {
        skip: !buildingId,
      }
    );

  // Get room contract info for selected room
  const { data: selectedRoomContractData, isLoading: isLoadingSelectedRoom } =
    useGetRoomsCompletedContractQuery(
      {
        buildingId: buildingId || undefined,
        roomId: roomId || undefined,
        page: 1,
        limit: 100,
      },
      {
        skip: !buildingId || !roomId,
      }
    );

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
        roomId: roomId || undefined,
        periodMonth: periodMonth || undefined,
        periodYear: periodYear || undefined,
        page: 1,
        limit: 100,
      },
      {
        skip: !buildingId || !roomId || !periodMonth || !periodYear,
      }
    );

  // Find contractId when roomId is selected
  useEffect(() => {
    if (roomId && roomsData?.data) {
      const roomContract = roomsData.data.find(
        (item: IRoomCompletedContract) => item.room._id === roomId
      );
      if (roomContract) {
        setContractId(roomContract.contractId);
      } else {
        setContractId("");
      }
    } else {
      setContractId("");
    }
  }, [roomId, roomsData?.data]);

  const getPeriodDateRange = () => {
    if (!periodMonth || !periodYear) return null;

    const month = Number(periodMonth);
    const year = Number(periodYear);

    const periodStart = new Date(year, month - 1, 1);

    const periodEnd = new Date(year, month, 0);

    return { periodStart, periodEnd };
  };

  const validateDueDate = (dateValue: string) => {
    if (!dateValue) {
      setDueDateError("");
      return true;
    }

    const range = getPeriodDateRange();
    if (!range) {
      setDueDateError("");
      return true;
    }

    const selectedDate = new Date(dateValue);
    selectedDate.setHours(0, 0, 0, 0);

    const { periodStart } = range;
    const periodStartDate = new Date(periodStart);
    periodStartDate.setHours(0, 0, 0, 0);

    if (selectedDate < periodStartDate) {
      const startDateStr = periodStartDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      setDueDateError(
        `Hạn thanh toán phải sau hoặc bằng ngày bắt đầu kỳ (${startDateStr})`
      );
      return false;
    }

    setDueDateError("");
    return true;
  };

  useEffect(() => {
    if (open) {
      const now = new Date();
      setPeriodMonth(String(now.getMonth() + 1));
      setPeriodYear(String(now.getFullYear()));

      // Set due date to end of current month
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const year = lastDay.getFullYear();
      const month = String(lastDay.getMonth() + 1).padStart(2, "0");
      const day = String(lastDay.getDate()).padStart(2, "0");
      setDueDate(`${year}-${month}-${day}`);
      setDueDateError("");
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setBuildingId("");
      setRoomId("");
      setContractId("");
      setIncludeRent(true);
      setItems([]);
    }
  }, [open]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        type: "other",
        label: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        utilityReadingId: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate amount if quantity or unitPrice changes
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].amount =
        newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !periodMonth || !periodYear || !dueDate) {
      return;
    }

    // Validate before submit
    if (!validateDueDate(dueDate)) {
      return;
    }

    onSubmit({
      roomId,
      periodMonth: Number(periodMonth),
      periodYear: Number(periodYear),
      dueDate: new Date(dueDate).toISOString(),
      includeRent,
      extraItems: items.map((item) => ({
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tạo hóa đơn tùy chỉnh
          </DialogTitle>
          <DialogDescription>
            Tạo hóa đơn với các khoản mục tùy chỉnh
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Building */}
          <div className="space-y-2 grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <BuildingSelectCombobox
                value={buildingId}
                onValueChange={setBuildingId}
              />
            </div>

            {/* Room */}
            <div className="space-y-2 !mt-0">
              <Label>
                Phòng <span className="text-red-500">*</span>
              </Label>
              <RoomCompletedContractSelectCombobox
                value={roomId}
                onValueChange={setRoomId}
                buildingId={buildingId || undefined}
              />
            </div>
          </div>

          {/* Contract - Auto-filled, display only */}
          {roomId && (
            <div className="space-y-2">
              <Label>Hợp đồng</Label>
              <div className="px-3 py-2 border rounded-md bg-slate-50 dark:bg-slate-900">
                {isLoadingRooms ? (
                  <span className="text-sm text-muted-foreground">
                    Đang tải...
                  </span>
                ) : contractId && roomsData?.data ? (
                  (() => {
                    const roomContract = roomsData.data.find(
                      (item: IRoomCompletedContract) =>
                        item.contractId === contractId
                    );
                    return roomContract ? (
                      <span className="text-sm">
                        {roomContract.contract.no} -{" "}
                        {roomContract.tenant.fullName ||
                          roomContract.tenant.email}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Không tìm thấy hợp đồng
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Chưa có hợp đồng
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 grid grid-cols-2 gap-2">
            {/* Period Month */}
            {/* <div className="space-y-2">
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
            </div> */}

            {/* Period Year */}
            {/* <div className="space-y-2 !mt-0">
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
            </div> */}

            {/* Period Month */}
            <div className="space-y-2">
              <Label>
                Tháng <span className="text-red-500">*</span>
              </Label>
              <Select value={periodMonth} disabled>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tháng hiện tại" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chỉ được tạo hóa đơn cho tháng hiện tại.
              </p>
            </div>

            {/* Period Year */}
            <div className="space-y-2 !mt-0">
              <Label>
                Năm <span className="text-red-500">*</span>
              </Label>
              <Select value={periodYear} disabled>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Năm hiện tại" />
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

          {/* Due Date */}
          <div className="space-y-2">
            <Label>
              Hạn thanh toán <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={
                periodMonth && periodYear
                  ? (() => {
                      const range = getPeriodDateRange();
                      if (range) {
                        const year = range.periodStart.getFullYear();
                        const month = String(
                          range.periodStart.getMonth() + 1
                        ).padStart(2, "0");
                        const day = String(
                          range.periodStart.getDate()
                        ).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                      }
                      return undefined;
                    })()
                  : undefined
              }
              required
              className={dueDateError ? "border-red-500" : ""}
            />
            {dueDateError && (
              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{dueDateError}</span>
              </div>
            )}
            {periodMonth && periodYear && !dueDateError && (
              <p className="text-xs text-muted-foreground">
                Hạn thanh toán phải sau hoặc bằng ngày bắt đầu kỳ{" "}
                {(() => {
                  const range = getPeriodDateRange();
                  if (range) {
                    return range.periodStart.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                  }
                  return "";
                })()}{" "}
                (có thể là bất kỳ ngày nào trong kỳ hoặc sau đó)
              </p>
            )}
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
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">#</TableHead>
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

          {/* Room Price Info */}
          {roomId && selectedRoomContractData?.data && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Giá phòng
                </CardTitle>
                <CardDescription className="text-xs">
                  Thông tin giá phòng theo hợp đồng
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSelectedRoom ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Đang tải...
                    </span>
                  </div>
                ) : selectedRoomContractData?.data &&
                  selectedRoomContractData.data.length > 0 ? (
                  (() => {
                    const selectedRoomContract =
                      selectedRoomContractData.data[0];
                    return (
                      <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Phòng:
                            </span>
                            <span className="text-sm font-medium">
                              Phòng {selectedRoomContract.room.roomNumber}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Số hợp đồng:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedRoomContract.contract.no}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-purple-200 dark:border-purple-800">
                            <span className="text-sm font-medium text-muted-foreground">
                              Giá phòng/tháng:
                            </span>
                            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                              {selectedRoomContract.contract.price.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Không tìm thấy thông tin hợp đồng
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Utility Readings Info */}
          {buildingId && roomId && periodMonth && periodYear && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Chỉ số điện nước
                </CardTitle>
                <CardDescription className="text-xs">
                  Thông tin chỉ số điện nước kỳ {periodMonth}/{periodYear}
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
                  <div className="space-y-3">
                    {utilityReadings.items.map((reading) => (
                      <div
                        key={reading._id}
                        className="p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          {/* Electricity */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                              <span className="text-xs font-medium">Điện</span>
                            </div>
                            <div className="text-xs space-y-0.5">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Chỉ số cũ:
                                </span>
                                <span className="font-medium">
                                  {reading.ePreviousIndex.toLocaleString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Chỉ số mới:
                                </span>
                                <span className="font-medium">
                                  {reading?.eCurrentIndex?.toLocaleString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Tiêu thụ:
                                </span>
                                <span className="font-medium">
                                  {reading.eConsumption.toLocaleString("vi-VN")}{" "}
                                  kWh
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Đơn giá:
                                </span>
                                <span className="font-medium">
                                  {reading.eUnitPrice.toLocaleString("vi-VN")}{" "}
                                  đ/kWh
                                </span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-green-200 dark:border-green-800">
                                <span className="text-muted-foreground font-medium">
                                  Thành tiền:
                                </span>
                                <span className="font-semibold text-green-700 dark:text-green-300">
                                  {reading.eAmount.toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Water */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-medium">Nước</span>
                            </div>
                            <div className="text-xs space-y-0.5">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Chỉ số cũ:
                                </span>
                                <span className="font-medium">
                                  {reading.wPreviousIndex.toLocaleString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Chỉ số mới:
                                </span>
                                <span className="font-medium">
                                  {reading?.wCurrentIndex?.toLocaleString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Tiêu thụ:
                                </span>
                                <span className="font-medium">
                                  {reading.wConsumption.toLocaleString("vi-VN")}{" "}
                                  m³
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Đơn giá:
                                </span>
                                <span className="font-medium">
                                  {reading.wUnitPrice.toLocaleString("vi-VN")}{" "}
                                  đ/m³
                                </span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-green-200 dark:border-green-800">
                                <span className="text-muted-foreground font-medium">
                                  Thành tiền:
                                </span>
                                <span className="font-semibold text-green-700 dark:text-green-300">
                                  {reading.wAmount.toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Tổng cộng:
                            </span>
                            <span className="text-sm font-bold text-green-700 dark:text-green-300">
                              {(
                                reading.eAmount + reading.wAmount
                              ).toLocaleString("vi-VN")}{" "}
                              đ
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground">
                              Trạng thái:
                            </span>
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
                          </div>
                        </div>
                      </div>
                    ))}
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

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Chi phí phát sinh</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm chi phí phát sinh
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
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
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Tên chi phí</Label>
                    <Input
                      value={item.label}
                      onChange={(e) =>
                        handleItemChange(index, "label", e.target.value)
                      }
                      placeholder="VD: Tiền thuê tháng 1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      placeholder="Mô tả chi tiết..."
                    />
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
                          handleItemChange(
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
                          handleItemChange(
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
                          handleItemChange(
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

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  Chưa có khoản mục nào. Nhấn "Thêm khoản mục" để thêm.
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
              disabled={
                isLoading ||
                !roomId ||
                !periodMonth ||
                !periodYear ||
                !dueDate ||
                !!dueDateError
              }
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
