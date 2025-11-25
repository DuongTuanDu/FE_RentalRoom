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
import { Loader2, FileText } from "lucide-react";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";

interface GenerateMonthlyInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    buildingId: string;
    periodMonth: number;
    periodYear: number;
    includeRent: boolean;
  }) => void;
  isLoading: boolean;
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

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

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
    }
  }, [open]);

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
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tạo hóa đơn tháng
          </DialogTitle>
          <DialogDescription>
            Tạo hóa đơn tự động hàng loạt cho tất cả các phòng đang được thuê trong tòa nhà đã chọn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Building */}
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
          <div className="space-y-2">
            <Label>
              Tháng <span className="text-red-500">*</span>
            </Label>
            <Select
              value={periodMonth}
              onValueChange={setPeriodMonth}
              required
            >
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label>
              Năm <span className="text-red-500">*</span>
            </Label>
            <Select
              value={periodYear}
              onValueChange={setPeriodYear}
              required
            >
              <SelectTrigger>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !buildingId || !periodMonth || !periodYear}>
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

