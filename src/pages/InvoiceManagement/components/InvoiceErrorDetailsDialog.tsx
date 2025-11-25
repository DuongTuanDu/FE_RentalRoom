import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface InvoiceErrorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorDetails: {
    message: string;
    errors: Array<{ roomNumber: string; message: string }>;
  } | null;
}

export const InvoiceErrorDetailsDialog = ({
  open,
  onOpenChange,
  errorDetails,
}: InvoiceErrorDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Chi tiết lỗi tạo hóa đơn
          </DialogTitle>
          <DialogDescription>
            {errorDetails?.message}
          </DialogDescription>
        </DialogHeader>
        
        {errorDetails && errorDetails.errors.length > 0 && (
          <div className="space-y-3 py-4">
            <div className="text-sm font-medium text-muted-foreground">
              Danh sách lỗi theo phòng:
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {errorDetails.errors.map((err, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-red-200 bg-red-50"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-red-900">
                        Phòng {err.roomNumber}
                      </div>
                      <div className="text-sm text-red-700 mt-1">
                        {err.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

