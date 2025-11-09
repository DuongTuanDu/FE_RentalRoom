import { useState, useEffect } from "react";
import {
  useGetBuildingsQuery,
} from "@/services/building/building.service";
import {
  useUpsertScheduleMutation,
  useGetScheduleByBuildingQuery,
  useDeleteScheduleMutation,
} from "@/services/landlord-schedule/landlord-schedule.service";
import { Calendar, Clock, Plus, Trash2, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { toText } from "@/utils/errors";
import type {
  IDefaultSlot,
  IScheduleOverride,
  DayOfWeek,
} from "@/types/landlord-schedule";
import { BuildingSelectCombobox } from "../FloorManageLandlord/components/BuildingSelectCombobox";

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

const LandlordScheduleManagement = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [defaultSlots, setDefaultSlots] = useState<IDefaultSlot[]>([]);
  const [overrides, setOverrides] = useState<IScheduleOverride[]>([]);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [editingOverrideIndex, setEditingOverrideIndex] = useState<number | null>(null);
  const [currentOverride, setCurrentOverride] = useState<IScheduleOverride>({
    date: "",
    isAvailable: false,
    startTime: "",
    endTime: "",
    note: "",
  });

  const { data: initialBuildingData } = useGetBuildingsQuery({
      q: "",
      page: 1,
      limit: 10,
      status: "active",
    });
    
  const {
    data: scheduleData,
    refetch: refetchSchedule,
  } = useGetScheduleByBuildingQuery(selectedBuildingId, {
    skip: !selectedBuildingId,
  });

  const [upsertSchedule, { isLoading: isSaving }] = useUpsertScheduleMutation();
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteScheduleMutation();


  useEffect(() => {
      if (initialBuildingData?.data?.[0]?._id && !selectedBuildingId) {
        setSelectedBuildingId(initialBuildingData.data[0]._id);
      }
  }, [initialBuildingData, selectedBuildingId]);

  useEffect(() => {
    if (scheduleData?.data) {
      setDefaultSlots(scheduleData.data.defaultSlots);
      setOverrides(scheduleData.data.overrides || []);
    } else {
      setDefaultSlots(
        DAYS_OF_WEEK.map((day) => ({
          dayOfWeek: day.value as DayOfWeek,
          isAvailable: false,
          startTime: "08:00",
          endTime: "17:00",
        }))
      );
      setOverrides([]);
    }
  }, [scheduleData]);

  const handleSlotToggle = (dayOfWeek: DayOfWeek) => {
    setDefaultSlots((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  const handleSlotTimeChange = (
    dayOfWeek: DayOfWeek,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setDefaultSlots((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSaveSchedule = async () => {
    if (!selectedBuildingId) {
      toast.error("Vui lòng chọn tòa nhà");
      return;
    }

    try {
      await upsertSchedule({
        buildingId: selectedBuildingId,
        defaultSlots,
        overrides,
      }).unwrap();

      toast.success("Lưu lịch thành công");
      refetchSchedule();
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi khi lưu lịch.");
      toast.error("Lưu lịch thất bại", { description: message });
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedBuildingId) return;

    try {
      await deleteSchedule(selectedBuildingId).unwrap();
      toast.success("Xóa lịch thành công");
      setDefaultSlots(
        DAYS_OF_WEEK.map((day) => ({
          dayOfWeek: day.value as DayOfWeek,
          isAvailable: false,
          startTime: "08:00",
          endTime: "17:00",
        }))
      );
      setOverrides([]);
      refetchSchedule();
    } catch (error: any) {
      const message = toText(error, "Đã xảy ra lỗi khi xóa lịch.");
      toast.error("Xóa lịch thất bại", { description: message });
    }
  };

  const handleOpenOverrideDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingOverrideIndex(index);
      setCurrentOverride(overrides[index]);
    } else {
      setEditingOverrideIndex(null);
      setCurrentOverride({
        date: "",
        isAvailable: true,
        startTime: "",
        endTime: "",
        note: "",
      });
    }
    setIsOverrideDialogOpen(true);
  };

  const handleSaveOverride = () => {
    if (!currentOverride.date) {
      toast.error("Vui lòng chọn ngày");
      return;
    }

    if (editingOverrideIndex !== null) {
      setOverrides((prev) =>
        prev.map((override, idx) =>
          idx === editingOverrideIndex ? currentOverride : override
        )
      );
    } else {
      setOverrides((prev) => [...prev, currentOverride]);
    }

    setIsOverrideDialogOpen(false);
    toast.success(
      editingOverrideIndex !== null
        ? "Cập nhật lịch thay đổi thành công"
        : "Thêm lịch thay đổi thành công"
    );
  };

  const handleDeleteOverride = (index: number) => {
    setOverrides((prev) => prev.filter((_, idx) => idx !== index));
    toast.success("Xóa lịch thay đổi thành công");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Quản lý Lịch Rảnh/Bận
            </h1>
            <p className="text-slate-600 mt-1">
              Thiết lập lịch rảnh để người thuê có thể đặt lịch xem phòng
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Chọn Tòa Nhà
            </CardTitle>
            <CardDescription>
              Tìm kiếm và chọn tòa nhà để xem lịch rảnh/bận và thiết lập lịch mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tòa nhà</label>
                <BuildingSelectCombobox
                  value={selectedBuildingId}
                  onValueChange={setSelectedBuildingId}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedBuildingId && (
          <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Lịch Mặc Định Theo Tuần
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const slot = defaultSlots.find(
                      (s) => s.dayOfWeek === day.value
                    );
                    return (
                      <div
                        key={day.value}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="w-24">
                          <Badge variant="outline" className="font-medium">
                            {day.label}
                          </Badge>
                        </div>
                        <Switch
                          checked={slot?.isAvailable || false}
                          onCheckedChange={() =>
                            handleSlotToggle(day.value as DayOfWeek)
                          }
                        />
                        <span className="text-sm text-slate-600 w-20">
                          {slot?.isAvailable ? "Rảnh" : "Bận"}
                        </span>
                        {slot?.isAvailable && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <Input
                              type="time"
                              value={slot.startTime || "08:00"}
                              onChange={(e) =>
                                handleSlotTimeChange(
                                  day.value as DayOfWeek,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                            <span className="text-slate-400">đến</span>
                            <Input
                              type="time"
                              value={slot.endTime || "17:00"}
                              onChange={(e) =>
                                handleSlotTimeChange(
                                  day.value as DayOfWeek,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-fit">
            <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Lịch thay đổi (Ngày cụ thể)
                  </CardTitle>
                  <Button onClick={() => handleOpenOverrideDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm thay đổi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {overrides.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Chưa có lịch thay đổi nào</p>
                    <p className="text-sm mt-1">
                      Thêm lịch thay đổi cho các ngày đặc biệt
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overrides.map((override, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-semibold">
                            {override.date ? new Date(override.date).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              weekday: 'short'
                            }) : ''}
                          </span>
                        </div>
                        <Badge
                          variant={
                            override.isAvailable ? "default" : "secondary"
                          }
                          className={
                            override.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {override.isAvailable ? "Rảnh" : "Bận"}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">
                            {override.startTime} - {override.endTime}
                          </span>
                        </div>
                        {override.note && (
                          <span className="text-sm text-slate-600 flex-1 truncate">
                            {override.note}
                          </span>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenOverrideDialog(index)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOverride(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleSaveSchedule}
                disabled={isSaving}
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Đang lưu..." : "Lưu lịch"}
              </Button>
             
            </div>
          </>
        )}
      </div>

      <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOverrideIndex !== null
                ? "Chỉnh sửa lịch thay đổi"
                : "Thêm lịch thay đổi"}
            </DialogTitle>
            <DialogDescription>
              Thiết lập lịch rảnh/bận cho ngày cụ thể
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chọn ngày</Label>
              <Input className="mt-2"
                type="date"
                value={currentOverride.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setCurrentOverride((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>
           
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thời gian bắt đầu</Label>
                <Input className="mt-2"
                  type="time"
                  value={currentOverride.startTime}
                  onChange={(e) =>
                    setCurrentOverride((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Thời gian kết thúc</Label>
                <Input className="mt-2"
                  type="time"
                  value={currentOverride.endTime}
                  onChange={(e) =>
                    setCurrentOverride((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
             <div className="flex items-center gap-4">
              <Label>Trạng thái</Label>
              <Switch 
                checked={currentOverride.isAvailable}
                onCheckedChange={(checked) =>
                  setCurrentOverride((prev) => ({
                    ...prev,
                    isAvailable: checked,
                  }))
                }
              />
              <Badge
                variant={currentOverride.isAvailable ? "default" : "secondary"}
                className={
                  currentOverride.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {currentOverride.isAvailable ? "Rảnh" : "Bận"}
              </Badge>
            </div>
            <div>
              <small className="text-gray-400">Lưu ý: Nếu thay đổi bận/rảnh cả ngày thì không cần thêm thời gian</small>
            </div>
            <div>
              <Label>Ghi chú (tùy chọn)</Label>
              <Textarea
                value={currentOverride.note}
                onChange={(e) =>
                  setCurrentOverride((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                placeholder="Nhập ghi chú cho lịch này..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOverrideDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSaveOverride}>
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordScheduleManagement;