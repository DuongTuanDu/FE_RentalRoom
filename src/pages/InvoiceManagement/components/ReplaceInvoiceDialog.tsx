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
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import type { CreateInvoiceReplaceRequest } from "@/types/invoice";
import { useGetInvoiceDetailsQuery } from "@/services/invoice/invoice.service";
import { skipToken } from "@reduxjs/toolkit/query/react";

interface InvoiceItem {
  type: "rent" | "electric" | "water" | "service" | "other";
  label: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  utilityReadingId?: string;
  meta?: {
    previousIndex: number;
    currentIndex: number;
  };
}

interface ReplaceInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onSubmit: (invoiceId: string, data: CreateInvoiceReplaceRequest) => void;
  isLoading: boolean;
}

export const ReplaceInvoiceDialog = ({
  open,
  onOpenChange,
  invoiceId,
  onSubmit,
  isLoading,
}: ReplaceInvoiceDialogProps) => {
  const formatPrice = useFormatPrice();
  const [note, setNote] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [lateFee, setLateFee] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Fetch invoice details
  const { data: invoiceData, isLoading: isLoadingInvoice } =
    useGetInvoiceDetailsQuery(invoiceId && open ? invoiceId : skipToken);

  // Initialize form when dialog opens or invoice data changes
  useEffect(() => {
    if (open && invoiceData?.data) {
      const invoice = invoiceData.data;
      setNote(invoice.note || "");
      setDiscountAmount(String(invoice.discountAmount || 0));
      setLateFee(String(invoice.lateFee || 0));
      
      // Set due date from invoice or default to current date
      if (invoice.dueDate) {
        const date = new Date(invoice.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        setDueDate(`${year}-${month}-${day}`);
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        setDueDate(`${year}-${month}-${day}`);
      }

      // Initialize items from invoice
      if (invoice.items && invoice.items.length > 0) {
        setItems(
          invoice.items.map((item) => ({
            type: item.type,
            label: item.label,
            description: item.description || "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            meta: item.meta,
          }))
        );
      } else {
        setItems([]);
      }
    } else if (!open) {
      setNote("");
      setDiscountAmount("0");
      setLateFee("0");
      setDueDate("");
      setItems([]);
    }
  }, [open, invoiceData]);

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
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
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
    } else if (field === "type") {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
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
    if (!invoiceId || !dueDate) return;

    const replaceData: CreateInvoiceReplaceRequest = {
      items: items.map((item) => ({
        type: item.type,
        label: item.label,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        utilityReadingId: item.utilityReadingId,
        meta: item.meta,
      })),
      note: note || undefined,
      discountAmount: Number(discountAmount) || 0,
      lateFee: Number(lateFee) || 0,
      dueDate: new Date(dueDate).toISOString(),
    };

    onSubmit(invoiceId, replaceData);
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

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalAmount =
    subtotal + Number(lateFee || 0) - Number(discountAmount || 0);

  if (isLoadingInvoice) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Thay thế hóa đơn
            </DialogTitle>
            <DialogDescription>Đang tải thông tin hóa đơn...</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!invoiceData?.data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Thay thế hóa đơn
            </DialogTitle>
            <DialogDescription>
              Không thể tải thông tin hóa đơn
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin hóa đơn
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const invoice = invoiceData.data;

  // Check if invoice status is "sent"
  if (invoice.status !== "sent") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Thay thế hóa đơn
            </DialogTitle>
            <DialogDescription>
              Chỉ có thể thay thế hóa đơn có trạng thái "Đã gửi"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Hóa đơn <strong>{invoice.invoiceNumber}</strong> có trạng thái{" "}
              <strong>{invoice.status}</strong> không thể được thay thế. Chỉ có
              thể thay thế hóa đơn có trạng thái "Đã gửi".
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
            <RefreshCw className="h-5 w-5" />
            Thay thế hóa đơn
          </DialogTitle>
          <DialogDescription>
            Tạo hóa đơn mới thay thế cho hóa đơn{" "}
            <strong>{invoice.invoiceNumber}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Invoice Info */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base">Thông tin hóa đơn cũ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Số hóa đơn:</span>{" "}
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kỳ:</span>{" "}
                  <span className="font-medium">
                    {invoice.periodMonth}/{invoice.periodYear}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phòng:</span>{" "}
                  <span className="font-medium">
                    {invoice.roomId?.roomNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Người thuê:</span>{" "}
                  <span className="font-medium">
                    {invoice.tenantId?.userInfo?.fullName || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Danh mục hóa đơn</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm mục
                </Button>
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
                  {items.filter((item) => item.type === "rent").length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Tiền phòng</h4>
                      <div className="border rounded-lg max-w-5xl overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[120px]">Loại</TableHead>
                              <TableHead>Tên</TableHead>
                              <TableHead className="min-w-[260px]">Mô tả</TableHead>
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
                                    <Input
                                      value={item.label}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          index,
                                          "label",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Tên mục"
                                      className="h-8"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.description || ""}
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
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveItem(index)}
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
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
                    (item) => item.type === "electric" || item.type === "water"
                  ).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Điện nước</h4>
                      <div className="border rounded-lg max-w-5xl overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[120px]">Loại</TableHead>
                              <TableHead className="min-w-[120px]">Tên</TableHead>
                              <TableHead className="min-w-[260px]">Mô tả</TableHead>
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
                                    <Input
                                      value={item.label}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          index,
                                          "label",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Tên mục"
                                      className="h-8"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.description || ""}
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
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm">
                                      {item.meta?.previousIndex ?? "—"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.meta?.currentIndex ?? ""}
                                      onChange={(e) => {
                                        const updatedItems = [...items];
                                        const currentIndex = Number(e.target.value) || 0;
                                        const previousIndex = item.meta?.previousIndex ?? 0;
                                        const quantity = Math.max(0, currentIndex - previousIndex);
                                        updatedItems[index] = {
                                          ...updatedItems[index],
                                          quantity,
                                          amount: quantity * updatedItems[index].unitPrice,
                                          meta: {
                                            previousIndex,
                                            currentIndex,
                                          },
                                        };
                                        setItems(updatedItems);
                                      }}
                                      placeholder="Chỉ số hiện tại"
                                      className="h-8"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-sm text-right">
                                      {item.quantity}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
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
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium text-center">
                                      {formatPrice(item.amount)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveItem(index)}
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
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
                              <TableHead className="w-[120px]">Loại</TableHead>
                              <TableHead>Tên</TableHead>
                              <TableHead className="min-w-[260px]">Mô tả</TableHead>
                              <TableHead className="w-[80px]">Số lượng</TableHead>
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
                                    <Input
                                      value={item.label}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          index,
                                          "label",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Tên mục"
                                      className="h-8"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.description || ""}
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
                                  </TableCell>
                                  <TableCell className="text-center">
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
                                  </TableCell>
                                  <TableCell className="text-center">
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
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium text-center">
                                      {formatPrice(item.amount)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveItem(index)}
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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

          {/* Due Date */}
          <div className="space-y-2">
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

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm trừ:</span>
                  <span className="font-medium text-red-600">
                    -{formatPrice(Number(discountAmount || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí trễ hạn:</span>
                  <span className="font-medium text-orange-600">
                    +{formatPrice(Number(lateFee || 0))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="font-bold text-lg">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !invoiceId || !dueDate}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo hóa đơn thay thế"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
