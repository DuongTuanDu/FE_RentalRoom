import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useGetContractsQuery,
  useSignLandlordMutation,
  useSendToTenantMutation,
  useConfirmMoveInMutation,
  useGetRenewalRequestsQuery,
  useApproveExtensionMutation,
  useRejectExtensionMutation,
  useTerminateContractMutation,
  useDeleteContractMutation,
  useDisableContractMutation,
  useDownloadContractMutation,
  useCreateCloneContractMutation,
} from "@/services/contract/contract.service";
import { FileText } from "lucide-react";
import _ from "lodash";
import { toast } from "sonner";
import { ContractDetailSheet } from "./components/ContractDetailSheet";
import { UpdateContractDialog } from "./components/UpdateContractDialog";
import { ContractFilters } from "./components/ContractFilters";
import { ContractTable } from "./components/ContractTable";
import { RenewalRequestsSection } from "./components/RenewalRequestsSection";
import { ApproveExtensionDialog } from "./components/ApproveExtensionDialog";
import { RejectExtensionDialog } from "./components/RejectExtensionDialog";
import { TerminateContractDialog } from "./components/TerminateContractDialog";
import { SignContractDialog } from "./components/SignContractDialog";
import { DeleteContractDialog } from "./components/DeleteContractDialog";
import { ConfirmMoveInDialog } from "./components/ConfirmMoveInDialog";
import { DisableContractDialog } from "./components/DisableContractDialog";
import { ContractActionsGuide } from "./components/ContractActionsGuide";
import type { IContractStatus } from "@/types/contract";

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
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [sendConfirmPopoverOpen, setSendConfirmPopoverOpen] = useState<
    Record<string, boolean>
  >({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeleteContractId, setSelectedDeleteContractId] = useState<
    string | null
  >(null);

  // Renewal Requests State
  const [renewalBuildingFilter, setRenewalBuildingFilter] = useState<string>("");
  const [renewalStatusFilter, setRenewalStatusFilter] = useState<string>("all");
  const [renewalCurrentPage, setRenewalCurrentPage] = useState(1);
  const [renewalPageLimit, setRenewalPageLimit] = useState(20);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [terminateReason, setTerminateReason] = useState("");
  const [terminatedAt, setTerminatedAt] = useState("");
  const [selectedRenewalContractId, setSelectedRenewalContractId] = useState<
    string | null
  >(null);
  const [isConfirmMoveInDialogOpen, setIsConfirmMoveInDialogOpen] = useState(false);
  const [selectedConfirmMoveInContractId, setSelectedConfirmMoveInContractId] = useState<string | null>(null);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [selectedDisableContractId, setSelectedDisableContractId] = useState<string | null>(null);
  const [disableReason, setDisableReason] = useState("");

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

  // Renewal Requests Query
  const {
    data: renewalData,
    error: renewalError,
    isLoading: isRenewalLoading,
  } = useGetRenewalRequestsQuery({
    buildingId: renewalBuildingFilter || undefined,
    status:
      renewalStatusFilter !== "all"
        ? (renewalStatusFilter as "pending" | "approved" | "rejected" | "cancelled")
        : undefined,
    page: renewalCurrentPage,
    limit: renewalPageLimit,
  });

  const [approveExtension, { isLoading: isApproving }] =
    useApproveExtensionMutation();
  const [rejectExtension, { isLoading: isRejecting }] =
    useRejectExtensionMutation();
  const [terminateContract, { isLoading: isTerminating }] =
    useTerminateContractMutation();
  const [deleteContract, { isLoading: isDeleting }] =
    useDeleteContractMutation();
  const [disableContract, { isLoading: isDisabling }] =
    useDisableContractMutation();
  const [downloadContract, { isLoading: isDownloading }] =
    useDownloadContractMutation();
  const [createCloneContract, { isLoading: isCloning }] =
    useCreateCloneContractMutation();

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  // Reset renewal pagination when filter changes
  useEffect(() => {
    setRenewalCurrentPage(1);
  }, [renewalBuildingFilter, renewalStatusFilter]);

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
    setSignatureUrl("");
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

  const handleOpenConfirmMoveInDialog = (contractId: string) => {
    setSelectedConfirmMoveInContractId(contractId);
    setIsConfirmMoveInDialogOpen(true);
  };

  const handleConfirmMoveIn = async () => {
    if (!selectedConfirmMoveInContractId) return;

    try {
      await confirmMoveIn({ id: selectedConfirmMoveInContractId }).unwrap();
      toast.success("Xác nhận khách thuê vào ở thành công");
      setIsConfirmMoveInDialogOpen(false);
      setSelectedConfirmMoveInContractId(null);
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra khi xác nhận");
    }
  };

  const handleOpenDeleteDialog = (contractId: string) => {
    setSelectedDeleteContractId(contractId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteContract = async () => {
    if (!selectedDeleteContractId) return;

    try {
      await deleteContract(selectedDeleteContractId).unwrap();
      toast.success("Xóa hợp đồng thành công");
      setIsDeleteDialogOpen(false);
      setSelectedDeleteContractId(null);
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi xóa hợp đồng"
      );
    }
  };

  // Renewal Requests Handlers
  const handleOpenApproveDialog = (contractId: string) => {
    setSelectedRenewalContractId(contractId);
    setApproveNote("");
    setIsApproveDialogOpen(true);
  };

  const handleOpenRejectDialog = (contractId: string) => {
    setSelectedRenewalContractId(contractId);
    setRejectReason("");
    setIsRejectDialogOpen(true);
  };

  const handleOpenTerminateDialog = (contractId: string) => {
    setSelectedRenewalContractId(contractId);
    setTerminateReason("");
    setTerminatedAt("");
    setIsTerminateDialogOpen(true);
  };

  const handleApproveExtension = async () => {
    if (!selectedRenewalContractId) return;

    try {
      await approveExtension({
        id: selectedRenewalContractId,
        data: { note: approveNote },
      }).unwrap();
      toast.success("Phê duyệt yêu cầu gia hạn thành công");
      setIsApproveDialogOpen(false);
      setSelectedRenewalContractId(null);
      setApproveNote("");
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi phê duyệt yêu cầu"
      );
    }
  };

  const handleRejectExtension = async () => {
    if (!selectedRenewalContractId || !rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await rejectExtension({
        id: selectedRenewalContractId,
        data: { reason: rejectReason },
      }).unwrap();
      toast.success("Từ chối yêu cầu gia hạn thành công");
      setIsRejectDialogOpen(false);
      setSelectedRenewalContractId(null);
      setRejectReason("");
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi từ chối yêu cầu"
      );
    }
  };

  const handleTerminateContract = async () => {
    if (!selectedRenewalContractId || !terminateReason.trim() || !terminatedAt) {
      toast.error("Vui lòng nhập đầy đủ lý do và ngày chấm dứt hợp đồng");
      return;
    }

    try {
      await terminateContract({
        id: selectedRenewalContractId,
        data: { reason: terminateReason, terminatedAt },
      }).unwrap();
      toast.success("Chấm dứt hợp đồng thành công");
      setIsTerminateDialogOpen(false);
      setSelectedRenewalContractId(null);
      setTerminateReason("");
      setTerminatedAt("");
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi chấm dứt hợp đồng"
      );
    }
  };

  const handleOpenDisableDialog = (contractId: string) => {
    setSelectedDisableContractId(contractId);
    setDisableReason("");
    setIsDisableDialogOpen(true);
  };

  const handleDisableContract = async () => {
    if (!selectedDisableContractId || !disableReason.trim()) {
      toast.error("Vui lòng nhập lý do vô hiệu hóa");
      return;
    }

    try {
      await disableContract({
        id: selectedDisableContractId,
        data: { reason: disableReason },
      }).unwrap();
      toast.success("Vô hiệu hóa hợp đồng thành công");
      setIsDisableDialogOpen(false);
      setSelectedDisableContractId(null);
      setDisableReason("");
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi vô hiệu hóa hợp đồng"
      );
    }
  };

  const handleDownloadContract = async (contractId: string) => {
    try {
      const blob = await downloadContract({ id: contractId }).unwrap();
      
      // Tạo URL từ blob và tải file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HopDong_${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Tải hợp đồng PDF thành công");
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi tải hợp đồng PDF"
      );
    }
  };

  const handleCloneContract = async (contractId: string) => {
    try {
      await createCloneContract({ id: contractId }).unwrap();
      toast.success("Tạo hợp đồng mới từ hợp đồng cũ thành công");
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi tạo hợp đồng mới"
      );
    }
  };


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

        <ContractActionsGuide />

        <ContractFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        />

        <ContractTable
          data={data}
          isLoading={isLoading}
          error={error}
          searchQuery={searchQuery}
          currentPage={currentPage}
          pageLimit={pageLimit}
          onPageChange={setCurrentPage}
          onPageLimitChange={(limit) => {
            setPageLimit(limit);
            setCurrentPage(1);
          }}
          onViewDetail={handleOpenDetailSheet}
          onUpdate={handleOpenUpdateDialog}
          onSign={handleOpenSignDialog}
          onSendToTenant={handleSendToTenant}
          onConfirmMoveIn={handleOpenConfirmMoveInDialog}
          onDelete={handleOpenDeleteDialog}
          onTerminate={handleOpenTerminateDialog}
          onDisable={handleOpenDisableDialog}
          onDownload={handleDownloadContract}
          onClone={handleCloneContract}
          isSending={isSending}
          isConfirming={isConfirming}
          isDownloading={isDownloading}
          isCloning={isCloning}
          sendConfirmPopoverOpen={sendConfirmPopoverOpen}
          onSendPopoverOpenChange={(contractId, open) => {
            setSendConfirmPopoverOpen((prev) => ({
              ...prev,
              [contractId]: open,
            }));
          }}
        />

        <RenewalRequestsSection
          data={renewalData}
          isLoading={isRenewalLoading}
          error={renewalError}
          buildingFilter={renewalBuildingFilter}
          onBuildingFilterChange={(value) => {
            setRenewalBuildingFilter(value);
            setRenewalCurrentPage(1);
          }}
          statusFilter={renewalStatusFilter}
          onStatusFilterChange={(value) => {
            setRenewalStatusFilter(value);
            setRenewalCurrentPage(1);
          }}
          currentPage={renewalCurrentPage}
          pageLimit={renewalPageLimit}
          onPageChange={setRenewalCurrentPage}
          onPageLimitChange={(limit) => {
            setRenewalPageLimit(limit);
            setRenewalCurrentPage(1);
          }}
          onViewDetail={handleOpenDetailSheet}
          onApprove={handleOpenApproveDialog}
          onReject={handleOpenRejectDialog}
          onTerminate={handleOpenTerminateDialog}
        />
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

      <SignContractDialog
        open={isSignDialogOpen}
        onOpenChange={(open) => {
          setIsSignDialogOpen(open);
          if (!open) {
            setSelectedContractId(null);
            setSignatureUrl("");
          }
        }}
        contractId={selectedContractId}
        signatureUrl={signatureUrl}
        onSignatureUrlChange={setSignatureUrl}
        onSign={handleSignContract}
        isLoading={isSigningLandlord}
      />

      <ApproveExtensionDialog
        open={isApproveDialogOpen}
        onOpenChange={(open) => {
          setIsApproveDialogOpen(open);
          if (!open) {
            setSelectedRenewalContractId(null);
            setApproveNote("");
          }
        }}
        note={approveNote}
        onNoteChange={setApproveNote}
        onApprove={handleApproveExtension}
        isLoading={isApproving}
      />

      <RejectExtensionDialog
        open={isRejectDialogOpen}
        onOpenChange={(open) => {
          setIsRejectDialogOpen(open);
          if (!open) {
            setSelectedRenewalContractId(null);
            setRejectReason("");
          }
        }}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onReject={handleRejectExtension}
        isLoading={isRejecting}
      />

      <TerminateContractDialog
        open={isTerminateDialogOpen}
        onOpenChange={(open) => {
          setIsTerminateDialogOpen(open);
          if (!open) {
            setSelectedRenewalContractId(null);
            setTerminateReason("");
            setTerminatedAt("");
          }
        }}
        reason={terminateReason}
        onReasonChange={setTerminateReason}
        terminatedAt={terminatedAt}
        onTerminatedAtChange={setTerminatedAt}
        onTerminate={handleTerminateContract}
        isLoading={isTerminating}
      />

      <ConfirmMoveInDialog
        open={isConfirmMoveInDialogOpen}
        onOpenChange={(open) => {
          setIsConfirmMoveInDialogOpen(open);
          if (!open) {
            setSelectedConfirmMoveInContractId(null);
          }
        }}
        onConfirm={handleConfirmMoveIn}
        isLoading={isConfirming}
      />

      <DeleteContractDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setSelectedDeleteContractId(null);
          }
        }}
        onConfirm={handleDeleteContract}
        isLoading={isDeleting}
      />

      <DisableContractDialog
        open={isDisableDialogOpen}
        onOpenChange={(open) => {
          setIsDisableDialogOpen(open);
          if (!open) {
            setSelectedDisableContractId(null);
            setDisableReason("");
          }
        }}
        reason={disableReason}
        onReasonChange={setDisableReason}
        onDisable={handleDisableContract}
        isLoading={isDisabling}
      />
    </div>
  );
};

export default ContractManagement;
