import { Eye, Send, CheckCircle, Edit, Trash2, Ban, XCircle, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ContractActionsMenuProps {
  contractId: string;
  status: IContractStatus;
  onViewDetail: (contractId: string) => void;
  onUpdate: (contractId: string) => void;
  onSign: (contractId: string) => void;
  onSendToTenant: (contractId: string) => void;
  onConfirmMoveIn: (contractId: string) => void;
  onDelete: (contractId: string) => void;
  onTerminate: (contractId: string) => void;
  onDisable?: (contractId: string) => void;
  onDownload?: (contractId: string) => void;
  onClone?: (contractId: string) => void;
  isSending: boolean;
  isConfirming: boolean;
  isDownloading: boolean;
  isCloning?: boolean;
  sendConfirmPopoverOpen: boolean;
  onSendPopoverOpenChange: (open: boolean) => void;
  moveInConfirmedAt: string | null;
}

export const ContractActionsMenu = ({
  contractId,
  status,
  onViewDetail,
  onUpdate,
  onSign,
  onSendToTenant,
  onConfirmMoveIn,
  onDelete,
  onTerminate,
  onDisable,
  onDownload,
  onClone,
  isSending,
  isConfirming,
  isDownloading,
  isCloning,
  sendConfirmPopoverOpen,
  onSendPopoverOpenChange,
  moveInConfirmedAt,
}: ContractActionsMenuProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewDetail(contractId)}
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Xem chi tiết</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {status !== "sent_to_tenant" && status !== "completed" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdate(contractId)}
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

      {status === "draft" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSign(contractId)}
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

      {status === "signed_by_landlord" && (
        <Popover
          open={sendConfirmPopoverOpen}
          onOpenChange={onSendPopoverOpenChange}
        >
          <TooltipProvider>
            <Tooltip open={!sendConfirmPopoverOpen ? undefined : false}>
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
                  Bạn có chắc chắn muốn gửi hợp đồng này cho khách thuê không?
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendPopoverOpenChange(false)}
                  disabled={isSending}
                >
                  Hủy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={async () => {
                    await onSendToTenant(contractId);
                    onSendPopoverOpenChange(false);
                  }}
                  disabled={isSending}
                >
                  {isSending ? "Đang gửi..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {((status === "completed" && !moveInConfirmedAt)) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onConfirmMoveIn(contractId)}
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

      {/* {status === "draft" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(contractId)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xóa hợp đồng</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )} */}

      {((status === "completed" && moveInConfirmedAt)) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onTerminate(contractId)}
              >
                <Ban className="w-4 h-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chấm dứt hợp đồng</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {onDisable &&
        (status === "draft" ||
          status === "signed_by_landlord" ||
          status === "sent_to_tenant") && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDisable(contractId)}
                >
                  <XCircle className="w-4 h-4 text-orange-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vô hiệu hóa hợp đồng</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

      {status === "completed" && onDownload && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDownload(contractId)}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 text-indigo-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tải PDF hợp đồng</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {(status === "completed" || status === "voided") && onClone && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onClone(contractId)}
                disabled={isCloning}
              >
                <Copy className="w-4 h-4 text-teal-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tạo hợp đồng mới từ hợp đồng này</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
