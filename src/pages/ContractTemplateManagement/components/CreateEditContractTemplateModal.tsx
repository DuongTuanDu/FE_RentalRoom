import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { IContractTemplate } from "@/types/contract";
import { BuildingSelectCombobox } from "@/pages/FloorManageLandlord/components/BuildingSelectCombobox";
import { TermMultiSelectCombobox } from "./TermMultiSelectCombobox";
import { RegulationMultiSelectCombobox } from "./RegulationMultiSelectCombobox";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: IContractTemplate | null;
  defaultBuildingId?: string;
  onSubmit: (data: {
    buildingId: string;
    name: string;
    defaultTermIds: string[];
    defaultRegulationIds: string[];
    placeholders: { termsTagField: string; regulationsTagField: string };
    status?: "active" | "inactive";
  }) => void | Promise<void>;
  isLoading?: boolean;
}

export const CreateEditContractTemplateModal = ({
  open,
  onOpenChange,
  template,
  defaultBuildingId,
  onSubmit,
  isLoading,
}: Props) => {
  const isEdit = Boolean(template);
  const [buildingId, setBuildingId] = useState<string>(defaultBuildingId || template?.buildingId || "");
  const [name, setName] = useState<string>(template?.name || "");
  const [status, setStatus] = useState<"active" | "inactive">(template?.status || "active");
  const [termIds, setTermIds] = useState<string[]>(template?.defaultTermIds || []);
  const [regulationIds, setRegulationIds] = useState<string[]>(template?.defaultRegulationIds || []);
  const [termsTagField, setTermsTagField] = useState<string>(template?.placeholders?.termsTagField || "TERMS");
  const [regulationsTagField, setRegulationsTagField] = useState<string>(template?.placeholders?.regulationsTagField || "REGULATIONS");

  useEffect(() => {
    if (!open) return;
    setBuildingId(defaultBuildingId || template?.buildingId || "");
    setName(template?.name || "");
    setStatus(template?.status || "active");
    setTermIds(template?.defaultTermIds || []);
    setRegulationIds(template?.defaultRegulationIds || []);
    setTermsTagField(template?.placeholders?.termsTagField || "TERMS");
    setRegulationsTagField(template?.placeholders?.regulationsTagField || "REGULATIONS");
  }, [open, template, defaultBuildingId]);

  const previewHeader = useMemo(
    () => (
      <div className="space-y-3">
        <div className="text-center">
          <div className="font-semibold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div>ĐỘC LẬP – TỰ DO – HẠNH PHÚC</div>
        </div>
        <Separator />
        <div className="text-center">
          <div className="text-xl font-bold">HỢP ĐỒNG THUÊ PHÒNG</div>
          <div className="text-sm text-muted-foreground">Số: ....../...../HĐTN</div>
        </div>
        <div className="space-y-1 text-sm">
          <div>Hôm nay, ngày... tháng... năm 202..., tại:</div>
          <div className="font-semibold">BÊN CHO THUÊ NHÀ (BÊN A):</div>
          <div>Đại diện (Ông/Bà): ...</div>
          <div>CCCD: ... Cấp ngày: ..., Nơi cấp: ...</div>
          <div>Hộ khẩu thường trú: ...</div>
          <div>Điện thoại: ...</div>
          <div>STK: ...</div>
          <div className="font-semibold pt-2">BÊN THUÊ NHÀ (BÊN B):</div>
          <div>Đại diện (Ông/Bà): ...</div>
          <div>CCCD/Passport: ... Cấp ngày: ..., Tại: ...</div>
          <div>Hộ khẩu thường trú: ...</div>
          <div>Điện thoại: ...</div>
        </div>
      </div>
    ),
    []
  );

  const handleSubmit = () => {
    if (!name || !buildingId) return;
    onSubmit({
      buildingId,
      name,
      defaultTermIds: termIds,
      defaultRegulationIds: regulationIds,
      placeholders: { termsTagField, regulationsTagField },
      status: isEdit ? status : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 md:p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Chỉnh sửa mẫu hợp đồng" : "Thêm mẫu hợp đồng mới"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left form */}
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Tên hợp đồng</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên hợp đồng" />
            </div>

            <div className="space-y-2">
              <Label>Tòa nhà</Label>
              <BuildingSelectCombobox value={buildingId} onValueChange={setBuildingId} disabled={isEdit} />
            </div>

            {isEdit && (
              <div className="flex items-center justify-between">
                <Label>Trạng thái</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={status === "active"} onCheckedChange={(v) => setStatus(v ? "active" : "inactive")} />
                  <span className="text-sm text-muted-foreground">{status === "active" ? "Hoạt động" : "Ngừng hoạt động"}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Điều khoản (Terms)</Label>
              <TermMultiSelectCombobox buildingId={buildingId} value={termIds} onValueChange={setTermIds} disabled={!buildingId} />
            </div>

            <div className="space-y-2">
              <Label>Quy định (Regulations)</Label>
              <RegulationMultiSelectCombobox buildingId={buildingId} value={regulationIds} onValueChange={setRegulationIds} disabled={!buildingId} />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placeholder điều khoản</Label>
                <Input value={termsTagField} onChange={(e) => setTermsTagField(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Placeholder quy định</Label>
                <Input value={regulationsTagField} onChange={(e) => setRegulationsTagField(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={isLoading || !name || !buildingId}>{isEdit ? "Lưu" : "Thêm mới"}</Button>
            </div>
          </div>

          {/* Right preview */}
          <div className="border-l px-6">
            <div className="bg-muted/40 rounded-md px-5 pb-5">
              {previewHeader}
              <div className="mt-4 space-y-4 text-sm">
                {termIds.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold">Nội dung điều khoản</div>
                    <Textarea value={""} readOnly className="hidden" />
                    <TermMultiSelectCombobox.ReadOnlyDescriptions buildingId={buildingId} ids={termIds} />
                  </div>
                )}

                {regulationIds.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold">Nội dung quy định</div>
                    <RegulationMultiSelectCombobox.ReadOnlyDescriptions buildingId={buildingId} ids={regulationIds} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


