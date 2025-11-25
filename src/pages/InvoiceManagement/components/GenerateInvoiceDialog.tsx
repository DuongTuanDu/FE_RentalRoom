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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Plus, Trash2 } from "lucide-react";
import { RoomCompletedContractSelectCombobox } from "./RoomCompletedContractSelectCombobox";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetRoomsCompletedContractQuery } from "@/services/invoice/invoice.service";
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
  const [tenantId, setTenantId] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
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
        limit: 100,
      },
      {
        skip: !buildingId, // Skip query if no buildingId
      }
    );

  // Find contractId and tenantId when roomId is selected
  useEffect(() => {
    if (roomId && roomsData?.data) {
      const roomContract = roomsData.data.find(
        (item: IRoomCompletedContract) => item.room._id === roomId
      );
      if (roomContract) {
        setContractId(roomContract.contractId);
        setTenantId(roomContract.tenant._id);
      } else {
        setContractId("");
        setTenantId("");
      }
    } else {
      setContractId("");
      setTenantId("");
    }
  }, [roomId, roomsData?.data]);

  // Set default to current month/year and due date
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
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setBuildingId("");
      setRoomId("");
      setContractId("");
      setTenantId("");
      setInvoiceNumber("");
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
    if (
      !tenantId ||
      !roomId ||
      !contractId ||
      !periodMonth ||
      !periodYear ||
      !invoiceNumber ||
      !dueDate ||
      items.length === 0
    ) {
      return;
    }

    onSubmit({
      tenantId,
      roomId,
      contractId,
      periodMonth: Number(periodMonth),
      periodYear: Number(periodYear),
      invoiceNumber,
      dueDate: new Date(dueDate).toISOString(),
      items: items.map((item) => ({
        ...item,
        utilityReadingId: item.utilityReadingId || "",
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-2">
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

          <div className="space-y-2 grid grid-cols-2 gap-2">
            {/* Invoice Number */}
            <div className="space-y-2">
              <Label>
                Số hóa đơn <span className="text-red-500">*</span>
              </Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="VD: INV-2024-001"
                required
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2 !mt-0">
              <Label>
                Hạn thanh toán <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Khoản mục <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm khoản mục
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
                      Khoản mục {index + 1}
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Loại</Label>
                      <Select
                        value={item.type}
                        onValueChange={(v) =>
                          handleItemChange(index, "type", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">Tiền thuê</SelectItem>
                          <SelectItem value="electric">Điện</SelectItem>
                          <SelectItem value="water">Nước</SelectItem>
                          <SelectItem value="service">Dịch vụ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tên khoản mục *</Label>
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          handleItemChange(index, "label", e.target.value)
                        }
                        placeholder="VD: Tiền thuê tháng 1"
                        required
                      />
                    </div>
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
                !tenantId ||
                !roomId ||
                !contractId ||
                !periodMonth ||
                !periodYear ||
                !invoiceNumber ||
                !dueDate ||
                items.length === 0
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
