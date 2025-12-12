import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Package,
  Zap,
  CreditCard,
  Clock,
  History,
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

export const ServiceActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Zap,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Dùng thử miễn phí",
      description:
        "Kích hoạt gói dùng thử để trải nghiệm đầy đủ tính năng trong thời gian giới hạn. Chỉ áp dụng một lần.",
      availableWhen: "Khi chưa từng sử dụng gói dùng thử",
    },
    {
      icon: CreditCard,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Mua gói dịch vụ",
      description:
        "Thanh toán trực tuyến để mua gói dịch vụ mới hoặc gia hạn gói hiện tại.",
      availableWhen:
        "Khi không có gói đang hoạt động hoặc muốn gia hạn (cần hủy gói cũ trước nếu đổi loại gói)",
    },
    {
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Quản lý gói",
      description:
        "Xem thông tin chi tiết các gói dịch vụ có sẵn, so sánh giá và tính năng.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: History,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Lịch sử giao dịch",
      description:
        "Xem lại lịch sử mua và kích hoạt các gói dịch vụ trước đây.",
      availableWhen: "Luôn có sẵn (nút 'Xem lịch sử gói dịch vụ')",
    },
    {
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Gia hạn tự động",
      description:
        "Thông tin về việc gia hạn gói dịch vụ khi gói hiện tại sắp hết hạn.",
      availableWhen: "Thông tin tham khảo",
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
                  Hướng dẫn quản lý gói dịch vụ
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách chọn và kích hoạt gói dịch vụ phù hợp
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
