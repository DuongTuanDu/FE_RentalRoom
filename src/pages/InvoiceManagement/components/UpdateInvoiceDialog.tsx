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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { IUpdateInvoiceRequest } from "@/types/invoice";
interface InvoiceItem {
  type: "rent" | "electric" | "water" | "service" | "other";
  label: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  meta?: {
    previousIndex: number;
    currentIndex: number;
  };
}

interface UpdateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  initialData?: {
    items?: InvoiceItem[];
    note?: string;
    discountAmount?: number;
    lateFee?: number;
    status?:
      | "draft"
      | "sent"
      | "paid"
      | "transfer_pending"
      | "overdue"
      | "cancelled"
      | "replaced";
  };
  onSubmit: (invoiceId: string, data: IUpdateInvoiceRequest) => void;
  isLoading: boolean;
}

export const UpdateInvoiceDialog = ({
  open,
  onOpenChange,
  invoiceId,
  initialData,
  onSubmit,
  isLoading,
}: UpdateInvoiceDialogProps) => {
  const formatPrice = useFormatPrice();
  const [note, setNote] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [lateFee, setLateFee] = useState("0");
  const [status, setStatus] = useState<
    "draft" | "sent" | "paid" | "transfer_pending" | "overdue" | "cancelled" | "replaced"
  >("draft");
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Determine if update is allowed based on status
  const currentStatus = initialData?.status || "draft";
  const canUpdate = !["paid", "transfer_pending", "cancelled"].includes(
    currentStatus
  );
  const canUpdateItems = currentStatus === "draft" || currentStatus === "sent";
  const canUpdateStatus = currentStatus === "draft";
  const canUpdateAllItems = currentStatus === "draft";
  const canOnlyUpdateOtherItems = currentStatus === "sent";

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open && initialData) {
      setNote(initialData.note || "");
      setDiscountAmount(String(initialData.discountAmount || 0));
      setLateFee(String(initialData.lateFee || 0));
      setStatus(initialData.status || "draft");
      setItems(initialData.items ? [...initialData.items] : []);
    } else if (!open) {
      setNote("");
      setDiscountAmount("0");
      setLateFee("0");
      setStatus("draft");
      setItems([]);
    }
  }, [open, initialData]);

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
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const item = items[index];
    // If status is sent, only allow removing "other" type items
    if (canOnlyUpdateOtherItems && item.type !== "other") {
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const item = items[index];
    // If status is sent, only allow updating "other" type items
    if (canOnlyUpdateOtherItems && item.type !== "other") {
      return;
    }

    const updatedItems = [...items];
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: Number(value) || 0,
        amount:
          (field === "quantity"
            ? Number(value)
            : updatedItems[index].quantity) *
          (field === "unitPrice"
            ? Number(value)
            : updatedItems[index].unitPrice),
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }
    setItems(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId || !canUpdate) return;

    const updateData: IUpdateInvoiceRequest = {
      note,
      discountAmount: Number(discountAmount) || 0,
      lateFee: Number(lateFee) || 0,
    };

    // Add status only if draft
    if (canUpdateStatus) {
      (updateData as any).status = status;
    }

    // Add items if allowed
    if (canUpdateItems) {
      // Filter items based on status
      let itemsToSend: InvoiceItem[] = [];
      if (canUpdateAllItems) {
        // Draft: send all items
        itemsToSend = items;
      } else if (canOnlyUpdateOtherItems) {
        // Sent: send "other" type items and electric/water items (for updating currentIndex)
        itemsToSend = items.filter(
          (item) =>
            item.type === "other" ||
            item.type === "electric" ||
            item.type === "water"
        );
      }

      if (itemsToSend.length > 0) {
        (updateData as any).items = itemsToSend;
      }
    }

    onSubmit(invoiceId, updateData);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rent: "Tiền thuê",
      electric: "Điện",
      water: "Nước",
      service: "Dịch vụ",
      other: "Khác",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      rent: "bg-blue-100 text-blue-800",
      electric: "bg-yellow-100 text-yellow-800",
      water: "bg-cyan-100 text-cyan-800",
      service: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (!canUpdate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Cập nhật hóa đơn
            </DialogTitle>
            <DialogDescription>
              Không thể cập nhật hóa đơn với trạng thái này
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Hóa đơn có trạng thái <strong>{currentStatus}</strong> không thể
              được cập nhật.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Cập nhật hóa đơn
          </DialogTitle>
          <DialogDescription>
            {currentStatus === "draft" && "Cập nhật đầy đủ thông tin hóa đơn"}
            {currentStatus === "sent" &&
              "Cập nhật items (chỉ loại 'Khác'), ghi chú, giảm trừ, phí trễ hạn"}
            {currentStatus === "overdue" &&
              "Cập nhật ghi chú, giảm trừ, phí trễ hạn"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Items (only for draft and sent) */}
          {canUpdateItems && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Danh mục hóa đơn</CardTitle>
                  {canUpdateAllItems && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm mục
                    </Button>
                  )}
                  {canOnlyUpdateOtherItems && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm mục (chỉ loại "Khác")
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có mục nào
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Bảng Tiền phòng */}
                    {items.filter((item) => item.type === "rent").length >
                      0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Tiền phòng</h4>
                        <div className="border rounded-lg max-w-5xl overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[120px]">
                                  Loại
                                </TableHead>
                                <TableHead>Tên</TableHead>
                                <TableHead className="min-w-[260px]">
                                  Mô tả
                                </TableHead>
                                <TableHead className="min-w-[120px] text-center">
                                  Đơn giá
                                </TableHead>
                                <TableHead className="min-w-[120px]">
                                  Thành tiền
                                </TableHead>
                                <TableHead className="w-[80px] text-center">
                                  Thao tác
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item, index) => {
                                if (item.type !== "rent") return null;
                                const isEditable = canUpdateAllItems;
                                const isReadOnly = !isEditable;

                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={getTypeColor(item.type)}
                                      >
                                        {getTypeLabel(item.type)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm">
                                        {item.label || "—"}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {isReadOnly ? (
                                        <span className="text-sm text-muted-foreground">
                                          {item.description || "—"}
                                        </span>
                                      ) : (
                                        <Input
                                          value={item.description}
                                          onChange={(e) =>
                                            handleUpdateItem(
                                              index,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Mô tả"
                                          className="h-8"
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-sm text-right">
                                        {formatPrice(item.unitPrice)}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm font-medium text-center">
                                        {formatPrice(item.amount)}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isEditable ? (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleRemoveItem(index)
                                          }
                                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          Chỉ đọc
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Bảng Điện nước */}
                    {items.filter(
                      (item) =>
                        item.type === "electric" || item.type === "water"
                    ).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Điện nước</h4>
                        <div className="border rounded-lg max-w-5xl overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[120px]">
                                  Loại
                                </TableHead>
                                <TableHead className="min-w-[120px]">
                                  Tên
                                </TableHead>
                                <TableHead className="min-w-[260px]">
                                  Mô tả
                                </TableHead>
                                <TableHead className="min-w-[100px]">
                                  Chỉ số cũ
                                </TableHead>
                                <TableHead className="w-[100px]">
                                  Chỉ số hiện tại
                                </TableHead>
                                <TableHead className="w-[80px]">
                                  Số lượng tiêu thụ
                                </TableHead>
                                <TableHead className="min-w-[120px] text-center">
                                  Đơn giá
                                </TableHead>
                                <TableHead className="min-w-[120px]">
                                  Thành tiền
                                </TableHead>
                                <TableHead className="w-[80px] text-center">
                                  Thao tác
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item, index) => {
                                if (
                                  item.type !== "electric" &&
                                  item.type !== "water"
                                )
                                  return null;
                                const isEditable = canUpdateAllItems;
                                const isReadOnly = !isEditable;
                                const canEditCurrentIndex =
                                  canUpdateAllItems || canUpdateItems; // Cho phép sửa khi draft hoặc sent

                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={getTypeColor(item.type)}
                                      >
                                        {getTypeLabel(item.type)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="min-w-[120px]">
                                      <span className="text-sm">
                                        {item.label || "—"}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {isReadOnly ? (
                                        <span className="text-sm text-muted-foreground">
                                          {item.description || "—"}
                                        </span>
                                      ) : (
                                        <Input
                                          value={item.description}
                                          onChange={(e) =>
                                            handleUpdateItem(
                                              index,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Mô tả"
                                          className="h-8"
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm">
                                        {item.meta?.previousIndex ?? "—"}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {canEditCurrentIndex ? (
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={item.meta?.currentIndex ?? ""}
                                          onChange={(e) => {
                                            const updatedItems = [...items];
                                            updatedItems[index] = {
                                              ...updatedItems[index],
                                              meta: {
                                                previousIndex:
                                                  item.meta?.previousIndex ?? 0,
                                                currentIndex:
                                                  Number(e.target.value) || 0,
                                              },
                                            };
                                            setItems(updatedItems);
                                          }}
                                          placeholder="Chỉ số hiện tại"
                                          className="h-8"
                                        />
                                      ) : (
                                        <span className="text-sm">
                                          {item.meta?.currentIndex ?? "—"}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-sm text-right">
                                        {item.quantity}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-sm text-right">
                                        {formatPrice(item.unitPrice)}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm font-medium text-center">
                                        {formatPrice(item.amount)}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isEditable ? (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleRemoveItem(index)
                                          }
                                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          Chỉ đọc
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Bảng Tiền dịch vụ và Chi phí khác */}
                    {items.filter(
                      (item) => item.type === "service" || item.type === "other"
                    ).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Tiền dịch vụ và Chi phí khác
                        </h4>
                        <div className="border rounded-lg max-w-5xl overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[120px]">
                                  Loại
                                </TableHead>
                                <TableHead>Tên</TableHead>
                                <TableHead className="min-w-[260px]">
                                  Mô tả
                                </TableHead>
                                <TableHead className="w-[80px]">
                                  Số lượng
                                </TableHead>
                                <TableHead className="min-w-[120px] text-center">
                                  Đơn giá
                                </TableHead>
                                <TableHead className="min-w-[120px]">
                                  Thành tiền
                                </TableHead>
                                <TableHead className="w-[80px] text-center">
                                  Thao tác
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item, index) => {
                                if (
                                  item.type !== "service" &&
                                  item.type !== "other"
                                )
                                  return null;
                                const isEditable =
                                  canUpdateAllItems ||
                                  (canOnlyUpdateOtherItems &&
                                    item.type === "other");
                                const isReadOnly = !isEditable;

                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={getTypeColor(item.type)}
                                      >
                                        {getTypeLabel(item.type)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm">
                                        {item.label || "—"}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {isReadOnly ? (
                                        <span className="text-sm text-muted-foreground">
                                          {item.description || "—"}
                                        </span>
                                      ) : (
                                        <Input
                                          value={item.description}
                                          onChange={(e) =>
                                            handleUpdateItem(
                                              index,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Mô tả"
                                          className="h-8"
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isEditable && item.type === "other" ? (
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={item.quantity}
                                          onChange={(e) =>
                                            handleUpdateItem(
                                              index,
                                              "quantity",
                                              e.target.value
                                            )
                                          }
                                          className="h-8 text-right"
                                        />
                                      ) : (
                                        <span className="text-sm text-right">
                                          {item.quantity}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isEditable && item.type === "other" ? (
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={item.unitPrice}
                                          onChange={(e) =>
                                            handleUpdateItem(
                                              index,
                                              "unitPrice",
                                              e.target.value
                                            )
                                          }
                                          className="h-8 text-right"
                                        />
                                      ) : (
                                        <span className="text-sm text-right">
                                          {formatPrice(item.unitPrice)}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm font-medium text-center">
                                        {formatPrice(item.amount)}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isEditable ? (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleRemoveItem(index)
                                          }
                                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          Chỉ đọc
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {canOnlyUpdateOtherItems && (
                      <p className="text-xs text-muted-foreground">
                        <strong>Lưu ý:</strong> Chỉ có thể chỉnh sửa hoặc thêm
                        mới các mục có loại "Khác". Các mục khác (Tiền thuê,
                        Điện, Nước, Dịch vụ) không thể chỉnh sửa hoặc xóa.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Discount Amount */}
          <div className="space-y-2">
            <Label>Giảm trừ (VND)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Late Fee */}
          <div className="space-y-2">
            <Label>Phí trễ hạn (VND)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={lateFee}
              onChange={(e) => setLateFee(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={4}
            />
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
            <Button type="submit" disabled={isLoading || !invoiceId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
