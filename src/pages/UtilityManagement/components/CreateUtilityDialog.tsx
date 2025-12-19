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
import { Droplets, Loader2, Zap } from "lucide-react";
import { RoomCompletedContractSelectCombobox } from "@/pages/InvoiceManagement/components/RoomCompletedContractSelectCombobox";
import { useCreateUtilityReadingMutation, useGetUtilityReadingsQuery } from "@/services/utility/utility.service";
import { toast } from "sonner";

interface CreateUtilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId?: string;
  onSuccess?: () => void;
}

export const CreateUtilityDialog = ({
  open,
  onOpenChange,
  buildingId,
  onSuccess,
}: CreateUtilityDialogProps) => {
  const [formData, setFormData] = useState({
    roomId: "",
    periodMonth: "",
    periodYear: "",
    eCurrentIndex: "",
    wCurrentIndex: "",
  });

  const [errors, setErrors] = useState({
    eCurrentIndex: "",
    wCurrentIndex: "",
  });

  const [createUtilityReading, { isLoading: isCreating }] =
    useCreateUtilityReadingMutation();

  const { data: previousReadingsData, isLoading: isLoadingPrevious } = useGetUtilityReadingsQuery(
    {
      roomId: formData.roomId || undefined,
      page: 1,
      limit: 100,
    },
    {
      skip: !formData.roomId,
    }
  );

  const previousReading = (() => {
    if (!previousReadingsData?.items || previousReadingsData.items.length === 0) {
      return undefined;
    }

    const items = previousReadingsData.items;
    
    if (formData.periodMonth && formData.periodYear && 
        formData.periodMonth !== "" && formData.periodYear !== "") {
      const currentPeriodMonth = parseInt(formData.periodMonth);
      const currentPeriodYear = parseInt(formData.periodYear);
      
      // Validate parsed values
      if (!isNaN(currentPeriodMonth) && !isNaN(currentPeriodYear)) {
        const filtered = items.filter((reading) => {
          if (reading.periodYear < currentPeriodYear) {
            return true;
          }
          if (reading.periodYear === currentPeriodYear && reading.periodMonth < currentPeriodMonth) {
            return true;
          }
          return false;
        });

        if (filtered.length > 0) {
          // Create a copy before sorting to avoid mutating the original array
          return [...filtered].sort((a, b) => {
            if (b.periodYear !== a.periodYear) {
              return b.periodYear - a.periodYear;
            }
            return b.periodMonth - a.periodMonth;
          })[0];
        }
      }
    }

    // Create a copy before sorting to avoid mutating the original array
    return [...items].sort((a, b) => {
      if (b.periodYear !== a.periodYear) {
        return b.periodYear - a.periodYear;
      }
      return b.periodMonth - a.periodMonth;
    })[0];
  })();

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Set default period to current month/year when dialog opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      setFormData({
        roomId: "",
        periodMonth: (now.getMonth() + 1).toString(),
        periodYear: now.getFullYear().toString(),
        eCurrentIndex: "",
        wCurrentIndex: "",
      });
      setErrors({
        eCurrentIndex: "",
        wCurrentIndex: "",
      });
    }
  }, [open]);

  // Validate current index against previous reading
  const validateIndex = (type: "electricity" | "water", value: string) => {
    if (!previousReading || !value || value === "") {
      return "";
    }

    const currentValue = parseFloat(value);
    if (isNaN(currentValue)) {
      return "";
    }

    const previousValue = type === "electricity" 
      ? previousReading.eCurrentIndex 
      : previousReading.wCurrentIndex;

    if (currentValue < previousValue) {
      return `Chỉ số ${type === "electricity" ? "điện" : "nước"} hiện tại không được nhỏ hơn chỉ số kỳ trước (${previousValue.toLocaleString()})`;
    }

    return "";
  };

  // Reset errors when previousReading changes
  useEffect(() => {
    if (previousReading) {
      // Re-validate current values
      if (formData.eCurrentIndex) {
        const currentValue = parseFloat(formData.eCurrentIndex);
        if (!isNaN(currentValue) && currentValue < previousReading.eCurrentIndex) {
          setErrors((prev) => ({
            ...prev,
            eCurrentIndex: `Chỉ số điện hiện tại không được nhỏ hơn chỉ số kỳ trước (${previousReading.eCurrentIndex.toLocaleString()})`,
          }));
        } else {
          setErrors((prev) => ({ ...prev, eCurrentIndex: "" }));
        }
      }
      if (formData.wCurrentIndex) {
        const currentValue = parseFloat(formData.wCurrentIndex);
        if (!isNaN(currentValue) && currentValue < previousReading.wCurrentIndex) {
          setErrors((prev) => ({
            ...prev,
            wCurrentIndex: `Chỉ số nước hiện tại không được nhỏ hơn chỉ số kỳ trước (${previousReading.wCurrentIndex.toLocaleString()})`,
          }));
        } else {
          setErrors((prev) => ({ ...prev, wCurrentIndex: "" }));
        }
      }
    } else {
      // Clear errors if no previous reading
      setErrors({
        eCurrentIndex: "",
        wCurrentIndex: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousReading]);

  const handleCreate = async () => {
    if (
      !formData.roomId ||
      !formData.periodMonth ||
      !formData.periodYear ||
      !formData.eCurrentIndex ||
      !formData.wCurrentIndex
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const eCurrentIndexNum = parseFloat(formData.eCurrentIndex);
    const wCurrentIndexNum = parseFloat(formData.wCurrentIndex);

    if (eCurrentIndexNum < 0) {
      toast.error("Chỉ số điện hiện tại không được là số âm");
      return;
    }

    if (wCurrentIndexNum < 0) {
      toast.error("Chỉ số nước hiện tại không được là số âm");
      return;
    }

    // Validate against previous reading
    if (previousReading) {
      if (eCurrentIndexNum < previousReading.eCurrentIndex) {
        setErrors((prev) => ({
          ...prev,
          eCurrentIndex: `Chỉ số điện hiện tại không được nhỏ hơn chỉ số kỳ trước (${previousReading.eCurrentIndex.toLocaleString()})`,
        }));
        toast.error("Vui lòng kiểm tra lại chỉ số điện");
        return;
      }

      if (wCurrentIndexNum < previousReading.wCurrentIndex) {
        setErrors((prev) => ({
          ...prev,
          wCurrentIndex: `Chỉ số nước hiện tại không được nhỏ hơn chỉ số kỳ trước (${previousReading.wCurrentIndex.toLocaleString()})`,
        }));
        toast.error("Vui lòng kiểm tra lại chỉ số nước");
        return;
      }
    }

    // Clear errors if validation passes
    setErrors({
      eCurrentIndex: "",
      wCurrentIndex: "",
    });

    try {
      await createUtilityReading({
        roomId: formData.roomId,
        periodMonth: parseInt(formData.periodMonth),
        periodYear: parseInt(formData.periodYear),
        eCurrentIndex: eCurrentIndexNum,
        wCurrentIndex: wCurrentIndexNum,
      }).unwrap();

      onOpenChange(false);
      toast.success("Thành công", {
        description: "Tạo chỉ số điện nước thành công",
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description:
          error?.message?.message || "Không thể tạo chỉ số. Vui lòng thử lại",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo chỉ số điện nước mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Phòng <span className="text-red-500">*</span>
            </Label>
            <RoomCompletedContractSelectCombobox
              value={formData.roomId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, roomId: value }))
              }
              buildingId={buildingId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Tháng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.periodMonth}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, periodMonth: value }))
                }
              >
                <SelectTrigger className="w-full">
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
                value={formData.periodYear}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, periodYear: value }))
                }
              >
                <SelectTrigger className="w-full">
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
          {/* Previous indexes display */}
          {formData.roomId && (
            <>
              {isLoadingPrevious ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Đang tải chỉ số trước đó...</p>
                </div>
              ) : previousReading ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    {formData.periodMonth && formData.periodYear && formData.periodMonth !== "" && formData.periodYear !== ""
                      ? "Chỉ số điện nước kỳ trước:"
                      : "Chỉ số điện nước gần nhất:"}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-700">
                        Chỉ số điện
                      </Label>
                      <div className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {previousReading.eCurrentIndex.toLocaleString()}
                        <span className="text-xs text-blue-600 font-normal ml-1">
                          (Tháng {previousReading.periodMonth}/{previousReading.periodYear})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-700">
                        Chỉ số nước
                      </Label>
                      <div className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        {previousReading.wCurrentIndex.toLocaleString()}
                        <span className="text-xs text-blue-600 font-normal ml-1">
                          (Tháng {previousReading.periodMonth}/{previousReading.periodYear})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Chưa có chỉ số điện nước trước đó cho phòng này</p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Chỉ số điện hiện tại <span><Zap className="w-4 h-4 text-yellow-500" /></span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.eCurrentIndex}
                onChange={(e) => {
                  const value = e.target.value;
                  // Chỉ cho phép số dương hoặc rỗng
                  if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setFormData((prev) => ({
                      ...prev,
                      eCurrentIndex: value,
                    }));
                    // Validate immediately
                    const error = validateIndex("electricity", value);
                    setErrors((prev) => ({ ...prev, eCurrentIndex: error }));
                  }
                }}
                placeholder="Nhập chỉ số điện hiện tại"
                className={errors.eCurrentIndex ? "border-red-500" : ""}
              />
              {errors.eCurrentIndex && (
                <p className="text-sm text-red-500 mt-1">{errors.eCurrentIndex}</p>
              )}
            </div>
            <div className="space-y-2 !mt-0">
              <Label>
                Chỉ số nước hiện tại <span className="text-red-500"><Droplets className="w-4 h-4 text-blue-500" /></span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.wCurrentIndex}
                onChange={(e) => {
                  const value = e.target.value;
                  // Chỉ cho phép số dương hoặc rỗng
                  if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setFormData((prev) => ({
                      ...prev,
                      wCurrentIndex: value,
                    }));
                    // Validate immediately
                    const error = validateIndex("water", value);
                    setErrors((prev) => ({ ...prev, wCurrentIndex: error }));
                  }
                }}
                placeholder="Nhập chỉ số nước hiện tại"
                className={errors.wCurrentIndex ? "border-red-500" : ""}
              />
              {errors.wCurrentIndex && (
                <p className="text-sm text-red-500 mt-1">{errors.wCurrentIndex}</p>
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
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || !!errors.eCurrentIndex || !!errors.wCurrentIndex}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo mới"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
