import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Zap,
  Edit,
  Trash2,
  CheckCircle2,
  Eye,
  Filter,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export const UtilityActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Tạo chỉ số mới",
      description: "Ghi nhận chỉ số điện nước mới cho một phòng cụ thể.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Zap,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Tạo hàng loạt",
      description:
        "Nhập nhanh chỉ số điện nước cho nhiều phòng cùng lúc để tiết kiệm thời gian.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Xác nhận",
      description:
        "Xác nhận chỉ số đã nhập là chính xác. Sau khi xác nhận, chỉ số sẽ được dùng để tính hóa đơn.",
      availableWhen: "Tại mỗi dòng chỉ số đang ở trạng thái Nháp",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Chỉnh sửa",
      description: "Cập nhật lại số điện/nước nếu có sai sót khi nhập liệu.",
      availableWhen:
        "Tại mỗi dòng chỉ số (chỉ khi ở trạng thái Nháp hoặc Đã xác nhận)",
    },
    {
      icon: Eye,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Xem chi tiết",
      description:
        "Xem chi tiết chỉ số cũ, chỉ số mới, lượng tiêu thụ và thành tiền.",
      availableWhen: "Tại mỗi dòng chỉ số",
    },
    {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Xóa chỉ số",
      description: "Xóa bản ghi chỉ số nếu nhập sai hoặc không cần thiết.",
      availableWhen: "Tại mỗi dòng chỉ số (chỉ khi ở trạng thái Nháp)",
    },
    {
      icon: Filter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Bộ lọc",
      description:
        "Lọc danh sách theo tòa nhà, phòng, trạng thái, tháng/năm để dễ dàng quản lý.",
      availableWhen: "Luôn có sẵn",
    },
  ];

  return (
    <Card className="border-blue-200 bg-blue-50/50 mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Hướng dẫn quản lý điện nước
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách ghi nhận và quản lý chỉ số điện nước
                </CardDescription>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${action.iconBg} ${action.iconColor}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-sm">
                          {action.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium text-blue-600">
                            Có sẵn khi:
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.availableWhen}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
