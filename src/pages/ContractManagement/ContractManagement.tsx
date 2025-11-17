import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useGetContractsQuery,
  useSignLandlordMutation,
  useSendToTenantMutation,
  useConfirmMoveInMutation,
} from "@/services/contract/contract.service";
import { FileText, Search, Eye, Send, CheckCircle, Edit } from "lucide-react";
import _ from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { IContractStatus } from "@/types/contract";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import { uploadFile, UPLOAD_CLINSKIN_PRESET } from "@/helpers/cloudinary";
import { ContractDetailSheet } from "./components/ContractDetailSheet";
import { UpdateContractDialog } from "./components/UpdateContractDialog";

const ContractManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [sendConfirmPopoverOpen, setSendConfirmPopoverOpen] = useState<
    Record<string, boolean>
  >({});

  const formatDate = useFormatDate();
  const { data, error, isLoading } = useGetContractsQuery({
    page: currentPage,
    limit: pageLimit,
    status:
      statusFilter !== "all" ? (statusFilter as IContractStatus) : undefined,
    search: debouncedSearch || undefined,
  });
  const [signLandlord, { isLoading: isSigningLandlord }] =
    useSignLandlordMutation();
  const [sendToTenant, { isLoading: isSending }] = useSendToTenantMutation();
  const [confirmMoveIn, { isLoading: isConfirming }] =
    useConfirmMoveInMutation();

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1); // Reset về trang 1 khi search
      }, 700),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  const handleOpenDetailSheet = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsDetailSheetOpen(true);
  };

  const handleOpenUpdateDialog = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsUpdateDialogOpen(true);
  };

  const handleOpenSignDialog = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsSignDialogOpen(true);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setSignatureUrl("");
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureUrl("");
    }
  };

  const handleSaveSignature = async () => {
    if (!signatureRef.current) return;

    const isEmpty = signatureRef.current.isEmpty();
    if (isEmpty) {
      toast.error("Vui lòng ký vào ô chữ ký");
      return;
    }

    try {
      setIsUploadingSignature(true);
      const dataURL = signatureRef.current.toDataURL("image/png");

      const response = await fetch(dataURL);
      const blob = await response.blob();

      const uploadResult = await uploadFile({
        file: blob,
        type: UPLOAD_CLINSKIN_PRESET,
      });

      setSignatureUrl(uploadResult.secure_url);
      toast.success("Lưu chữ ký thành công");
    } catch (error: any) {
      console.error("Error uploading signature:", error);
      toast.error(error?.message?.message || "Không thể lưu chữ ký");
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleSignContract = async () => {
    if (!selectedContractId || !signatureUrl) {
      toast.error("Vui lòng lưu chữ ký trước khi ký hợp đồng");
      return;
    }

    try {
      await signLandlord({
        id: selectedContractId,
        data: { signatureUrl },
      }).unwrap();

      toast.success("Ký hợp đồng thành công");
      setIsSignDialogOpen(false);
      setSelectedContractId(null);
      setSignatureUrl("");
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi ký hợp đồng");
    }
  };

  const handleSendToTenant = async (contractId: string) => {
    try {
      await sendToTenant({ id: contractId }).unwrap();
      toast.success("Gửi hợp đồng tới khách thuê thành công");
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi gửi hợp đồng");
    }
  };

  const handleConfirmMoveIn = async (contractId: string) => {
    try {
      await confirmMoveIn({ id: contractId }).unwrap();
      toast.success("Xác nhận khách thuê vào ở thành công");
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi xác nhận");
    }
  };

  const getStatusBadge = (status: IContractStatus) => {
    const statusConfig = {
      draft: { label: "Bản nháp", className: "bg-gray-100 text-gray-800" },
      sent_to_tenant: {
        label: "Đã gửi",
        className: "bg-blue-100 text-blue-800",
      },
      signed_by_tenant: {
        label: "Đã ký bởi khách",
        className: "bg-yellow-100 text-yellow-800",
      },
      signed_by_landlord: {
        label: "Đã ký bởi chủ trọ",
        className: "bg-green-100 text-green-800",
      },
      completed: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800",
      },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  // Tính toán totalPages từ API response
  const totalPages = data?.total ? Math.ceil(data.total / pageLimit) : 0;

  return (
    <div className="">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý Hợp đồng
              </h1>
              <p className="text-slate-600 mt-1">
                Quản lý và theo dõi các hợp đồng thuê phòng
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên khách thuê, tòa nhà, phòng, số hợp đồng..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="sent_to_tenant">Đã gửi</SelectItem>
                    <SelectItem value="signed_by_tenant">
                      Đã ký bởi khách
                    </SelectItem>
                    <SelectItem value="signed_by_landlord">
                      Đã ký bởi chủ trọ
                    </SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách hợp đồng</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 font-medium">
                  Có lỗi xảy ra khi tải dữ liệu
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Vui lòng thử lại sau
                </p>
              </div>
            ) : !data?.items || data.items.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Không tìm thấy hợp đồng nào
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : ""}
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">
                          Số hợp đồng
                        </TableHead>
                        <TableHead className="font-semibold">
                          Khách thuê
                        </TableHead>
                        <TableHead className="font-semibold">Tòa nhà</TableHead>
                        <TableHead className="font-semibold">Phòng</TableHead>
                        <TableHead className="font-semibold">
                          Trạng thái
                        </TableHead>
                        <TableHead className="font-semibold">
                          Ngày tạo
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((contract) => (
                        <TableRow
                          key={contract._id}
                          className="hover:bg-slate-50"
                        >
                          <TableCell className="text-slate-600 font-medium">
                            {contract.contract?.no || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {contract.tenantId?.userInfo?.fullName || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {contract.buildingId?.name || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {contract.roomId?.roomNumber || "—"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(contract.status)}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {contract.createdAt
                              ? formatDate(contract.createdAt)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleOpenDetailSheet(contract._id)
                                      }
                                    >
                                      <Eye className="w-4 h-4 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xem chi tiết</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {contract.status !== "sent_to_tenant" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                          handleOpenUpdateDialog(contract._id)
                                        }
                                      >
                                        <Edit className="h-4 w-4 text-amber-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Cập nhật</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {contract.status === "draft" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                          handleOpenSignDialog(contract._id)
                                        }
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ký hợp đồng</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {contract.status === "signed_by_landlord" && (
                                <Popover
                                  open={
                                    sendConfirmPopoverOpen[contract._id] ||
                                    false
                                  }
                                  onOpenChange={(open) => {
                                    setSendConfirmPopoverOpen((prev) => ({
                                      ...prev,
                                      [contract._id]: open,
                                    }));
                                  }}
                                >
                                  <TooltipProvider>
                                    <Tooltip
                                      open={
                                        !sendConfirmPopoverOpen[contract._id]
                                          ? undefined
                                          : false
                                      }
                                    >
                                      <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={isSending}
                                          >
                                            <Send className="w-4 h-4 text-blue-600" />
                                          </Button>
                                        </PopoverTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Gửi cho khách thuê</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <h4 className="font-medium leading-none">
                                          Xác nhận gửi hợp đồng
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          Bạn có chắc chắn muốn gửi hợp đồng này
                                          cho khách thuê không?
                                        </p>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSendConfirmPopoverOpen(
                                              (prev) => ({
                                                ...prev,
                                                [contract._id]: false,
                                              })
                                            );
                                          }}
                                          disabled={isSending}
                                        >
                                          Hủy
                                        </Button>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={async () => {
                                            await handleSendToTenant(
                                              contract._id
                                            );
                                            setSendConfirmPopoverOpen(
                                              (prev) => ({
                                                ...prev,
                                                [contract._id]: false,
                                              })
                                            );
                                          }}
                                          disabled={isSending}
                                        >
                                          {isSending
                                            ? "Đang gửi..."
                                            : "Xác nhận"}
                                        </Button>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}

                              {contract.status === "signed_by_tenant" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                          handleConfirmMoveIn(contract._id)
                                        }
                                        disabled={isConfirming}
                                      >
                                        <CheckCircle className="w-4 h-4 text-purple-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Xác nhận vào ở</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {data && data.total > 0 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-slate-600">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * pageLimit + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * pageLimit, data.total)}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">{data.total}</span> hợp đồng
                    </p>
                    <div className="flex items-center gap-2">
                      <Select
                        value={pageLimit.toString()}
                        onValueChange={(value) => {
                          setPageLimit(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 hợp đồng</SelectItem>
                          <SelectItem value="20">20 hợp đồng</SelectItem>
                          <SelectItem value="50">50 hợp đồng</SelectItem>
                          <SelectItem value="100">100 hợp đồng</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-9"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sheet Chi tiết hợp đồng */}
      <ContractDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) {
            setSelectedContractId(null);
          }
        }}
        contractId={selectedContractId}
      />

      {/* Dialog Cập nhật hợp đồng */}
      <UpdateContractDialog
        open={isUpdateDialogOpen}
        onOpenChange={(open) => {
          setIsUpdateDialogOpen(open);
          if (!open) {
            setSelectedContractId(null);
          }
        }}
        contractId={selectedContractId}
        onSuccess={() => {
          setSelectedContractId(null);
        }}
      />

      {/* Dialog Ký hợp đồng */}
      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader>
            <DialogTitle>Ký hợp đồng</DialogTitle>
            <DialogDescription>
              Vui lòng ký vào ô chữ ký bên dưới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "signature-canvas border rounded bg-white",
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearSignature}
                disabled={isUploadingSignature}
              >
                Xóa
              </Button>
              <Button
                type="button"
                onClick={handleSaveSignature}
                disabled={isUploadingSignature}
              >
                {isUploadingSignature ? "Đang tải lên..." : "Lưu chữ ký"}
              </Button>
            </div>
            {signatureUrl && (
              <div className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Đã lưu chữ ký
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSignDialogOpen(false);
                setSelectedContractId(null);
                setSignatureUrl("");
              }}
              disabled={isSigningLandlord}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSignContract}
              disabled={!signatureUrl || isSigningLandlord}
            >
              {isSigningLandlord ? "Đang xử lý..." : "Ký hợp đồng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractManagement;
