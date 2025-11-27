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
import { Loader2, Plus, Trash2, Search, Zap, Droplets } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { useGetUtilityReadingsRoomQuery } from "@/services/utility/utility.service";
import { useCreateUtilityReadingsBulkMutation } from "@/services/utility/utility.service";
import { toast } from "sonner";

interface BulkReadingItem {
  roomId: string;
  eCurrentIndex: string;
  wCurrentIndex: string;
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
  const [readings, setReadings] = useState<BulkReadingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<{
    buildingId?: string;
    periodMonth?: string;
    periodYear?: string;
  }>({});

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
      setReadings([]);
      setBuildingId("");
      setErrors({});
    }
  }, [open]);

  // Initialize readings from rooms data
  useEffect(() => {
    if (roomsData?.data && open) {
      const initialReadings: BulkReadingItem[] = roomsData.data.map((room) => {
        const electricityReading = room.readingTemplate?.electricity;
        const waterReading = room.readingTemplate?.water;

        return {
          roomId: room._id,
          eCurrentIndex: electricityReading?.currentIndex?.toString() || "",
          wCurrentIndex: waterReading?.currentIndex?.toString() || "",
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
        eCurrentIndex: "",
        wCurrentIndex: "",
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

  const handleBuildingChange = (value: string) => {
    setBuildingId(value);
    if (errors.buildingId) {
      setErrors({ ...errors, buildingId: undefined });
    }
  };

  const handleMonthChange = (value: string) => {
    setPeriodMonth(value);
    if (errors.periodMonth) {
      setErrors({ ...errors, periodMonth: undefined });
    }
  };

  const handleYearChange = (value: string) => {
    setPeriodYear(value);
    if (errors.periodYear) {
      setErrors({ ...errors, periodYear: undefined });
    }
  };

  const handleCreate = async () => {
    // Validate form fields
    const newErrors: {
      buildingId?: string;
      periodMonth?: string;
      periodYear?: string;
    } = {};

    if (!buildingId) {
      newErrors.buildingId = "Vui lòng chọn tòa nhà";
    }
    if (!periodMonth) {
      newErrors.periodMonth = "Vui lòng chọn tháng";
    }
    if (!periodYear) {
      newErrors.periodYear = "Vui lòng chọn năm";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (readings.length === 0) {
      toast.error("Vui lòng thêm ít nhất một chỉ số");
      return;
    }

    const validReadings = readings.filter(
      (r) => r.roomId && r.eCurrentIndex && r.wCurrentIndex
    );

    if (validReadings.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin cho ít nhất một chỉ số");
      return;
    }

    try {
      await createUtilityReadingsBulk({
        readings: validReadings.map((r) => ({
          roomId: r.roomId,
          periodMonth: parseInt(periodMonth),
          periodYear: parseInt(periodYear),
          eCurrentIndex: parseFloat(r.eCurrentIndex),
          wCurrentIndex: parseFloat(r.wCurrentIndex),
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

  // Filter readings based on search query
  const filteredReadings = readings.filter((reading) => {
    if (!searchQuery) return true;
    const roomName = getRoomName(reading.roomId).toLowerCase();
    return roomName.includes(searchQuery.toLowerCase());
  });

  // Count valid readings
  const validReadingsCount = readings.filter(
    (r) => r.roomId && r.eCurrentIndex && r.wCurrentIndex
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo chỉ số điện nước hàng loạt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                Tòa nhà <span className="text-red-500">*</span>
              </Label>
              <BuildingSelectCombobox
                value={buildingId}
                onValueChange={handleBuildingChange}
              />
              {errors.buildingId && (
                <p className="text-sm text-red-500">{errors.buildingId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Tháng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={periodMonth}
                onValueChange={handleMonthChange}
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
              {errors.periodMonth && (
                <p className="text-sm text-red-500">{errors.periodMonth}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Năm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={periodYear}
                onValueChange={handleYearChange}
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
              {errors.periodYear && (
                <p className="text-sm text-red-500">{errors.periodYear}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Label className="text-base">Danh sách chỉ số</Label>
                {readings.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({validReadingsCount}/{readings.length} phòng hợp lệ)
                  </span>
                )}
              </div>
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

            {readings.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên phòng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {readings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm border rounded-lg">
                Chưa có chỉ số nào. Nhấn "Thêm chỉ số" để bắt đầu.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">STT</TableHead>
                        <TableHead>Phòng</TableHead>
                        <TableHead className="text-center">
                          <div className="flex gap-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>Chỉ số điện</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex gap-1">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span>Chỉ số nước</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[80px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReadings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Không tìm thấy phòng nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReadings.map((reading) => {
                          const originalIndex = readings.findIndex((r) => r === reading);
                          const isValid = reading.roomId && reading.eCurrentIndex && reading.wCurrentIndex;
                          
                          return (
                            <TableRow
                              key={originalIndex}
                              className={isValid ? "" : "bg-muted/30"}
                            >
                              <TableCell className="font-medium">
                                {originalIndex + 1}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={reading.roomId}
                                  onValueChange={(value) =>
                                    handleUpdateReading(originalIndex, "roomId", value)
                                  }
                                >
                                  <SelectTrigger className="w-full">
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
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={reading.eCurrentIndex}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                      handleUpdateReading(
                                        originalIndex,
                                        "eCurrentIndex",
                                        value
                                      );
                                    }
                                  }}
                                  placeholder="Nhập chỉ số"
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={reading.wCurrentIndex}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                      handleUpdateReading(
                                        originalIndex,
                                        "wCurrentIndex",
                                        value
                                      );
                                    }
                                  }}
                                  placeholder="Nhập chỉ số"
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveReading(originalIndex)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
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
              `Tạo ${validReadingsCount} chỉ số`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

