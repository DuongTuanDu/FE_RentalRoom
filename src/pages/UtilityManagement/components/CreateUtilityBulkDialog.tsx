import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetUtilityReadingsRoomQuery } from "@/services/utility/utility.service";
import { useCreateUtilityReadingsBulkMutation } from "@/services/utility/utility.service";
import { toast } from "sonner";

interface BulkReadingItem {
  roomId: string;
  type: "electricity" | "water";
  currentIndex: string;
  unitPrice: string;
}

interface CreateUtilityBulkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateUtilityBulkDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateUtilityBulkDialogProps) => {
  const [buildingId, setBuildingId] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");
  const [readingDate, setReadingDate] = useState("");
  const [readings, setReadings] = useState<BulkReadingItem[]>([]);

  const [createUtilityReadingsBulk, { isLoading: isCreating }] =
    useCreateUtilityReadingsBulkMutation();

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Get rooms for bulk reading
  const { data: roomsData } = useGetUtilityReadingsRoomQuery(
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

  // Set default period to current month/year when dialog opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      setPeriodMonth((now.getMonth() + 1).toString());
      setPeriodYear(now.getFullYear().toString());
      setReadingDate(now.toISOString().split("T")[0]);
      setReadings([]);
      setBuildingId("");
    }
  }, [open]);

  // Initialize readings from rooms data
  useEffect(() => {
    if (roomsData?.data && open) {
      const initialReadings: BulkReadingItem[] = roomsData.data.map((room) => {
        const electricityReading = room.readingTemplate?.electricity;

        return {
          roomId: room._id,
          type: "electricity",
          currentIndex: electricityReading?.currentIndex?.toString() || "",
          unitPrice: electricityReading?.unitPrice?.toString() || "",
        };
      });
      setReadings(initialReadings);
    }
  }, [roomsData, open]);

  const handleAddReading = () => {
    setReadings([
      ...readings,
      {
        roomId: "",
        type: "electricity",
        currentIndex: "",
        unitPrice: "",
      },
    ]);
  };

  const handleRemoveReading = (index: number) => {
    setReadings(readings.filter((_, i) => i !== index));
  };

  const handleUpdateReading = (
    index: number,
    field: keyof BulkReadingItem,
    value: string
  ) => {
    const updated = [...readings];
    updated[index] = { ...updated[index], [field]: value };
    setReadings(updated);
  };

  const handleCreate = async () => {
    if (!buildingId || !periodMonth || !periodYear || !readingDate) {
      toast.error("Vui lòng điền đầy đủ thông tin kỳ đọc");
      return;
    }

    if (readings.length === 0) {
      toast.error("Vui lòng thêm ít nhất một chỉ số");
      return;
    }

    const validReadings = readings.filter(
      (r) => r.roomId && r.currentIndex && r.unitPrice
    );

    if (validReadings.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin cho ít nhất một chỉ số");
      return;
    }

    try {
      await createUtilityReadingsBulk({
        readings: validReadings.map((r) => ({
          roomId: r.roomId,
          type: r.type,
          periodMonth: parseInt(periodMonth),
          periodYear: parseInt(periodYear),
          currentIndex: parseFloat(r.currentIndex),
          unitPrice: parseFloat(r.unitPrice),
          readingDate,
        })),
      }).unwrap();

      onOpenChange(false);
      toast.success("Thành công", {
        description: `Tạo ${validReadings.length} chỉ số điện nước thành công`,
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message ||
          "Không thể tạo chỉ số hàng loạt. Vui lòng thử lại",
      });
    }
  };

  const getRoomName = (roomId: string) => {
    const room = roomsData?.data?.find((r) => r._id === roomId);
    return room ? `Phòng ${room.roomNumber}` : "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo chỉ số điện nước hàng loạt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Tòa nhà <span className="text-red-500">*</span>
              </Label>
              <BuildingSelectCombobox
                value={buildingId}
                onValueChange={setBuildingId}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Ngày đọc chỉ số <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Tháng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={periodMonth}
                onValueChange={setPeriodMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Năm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={periodYear}
                onValueChange={setPeriodYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Danh sách chỉ số</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddReading}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm chỉ số
              </Button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {readings.map((reading, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Chỉ số #{index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveReading(index)}
                      className="h-8 w-8 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Phòng</Label>
                      <Select
                        value={reading.roomId}
                        onValueChange={(value) =>
                          handleUpdateReading(index, "roomId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomsData?.data?.map((room) => (
                            <SelectItem key={room._id} value={room._id}>
                              Phòng {room.roomNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Loại</Label>
                      <Select
                        value={reading.type}
                        onValueChange={(value: "electricity" | "water") =>
                          handleUpdateReading(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electricity">Điện</SelectItem>
                          <SelectItem value="water">Nước</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Chỉ số hiện tại</Label>
                      <Input
                        type="number"
                        value={reading.currentIndex}
                        onChange={(e) =>
                          handleUpdateReading(
                            index,
                            "currentIndex",
                            e.target.value
                          )
                        }
                        placeholder="Nhập chỉ số"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Đơn giá</Label>
                      <Input
                        type="number"
                        value={reading.unitPrice}
                        onChange={(e) =>
                          handleUpdateReading(
                            index,
                            "unitPrice",
                            e.target.value
                          )
                        }
                        placeholder="Nhập đơn giá"
                      />
                    </div>
                  </div>
                  {reading.roomId && (
                    <p className="text-xs text-slate-500">
                      {getRoomName(reading.roomId)}
                    </p>
                  )}
                </div>
              ))}
              {readings.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Chưa có chỉ số nào. Nhấn "Thêm chỉ số" để bắt đầu.
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              `Tạo ${readings.filter((r) => r.roomId && r.currentIndex && r.unitPrice).length} chỉ số`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

