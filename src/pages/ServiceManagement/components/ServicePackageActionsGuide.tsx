import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Package,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
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

export const ServicePackageActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm gói dịch vụ mới",
      description:
        "Tạo các gói dịch vụ mới cho chủ nhà đăng ký sử dụng. Thiết lập giá, thời hạn và giới hạn số lượng phòng.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Chỉnh sửa gói",
      description:
        "Cập nhật thông tin gói dịch vụ như tên, giá tiền, mô tả hoặc các giới hạn.",
      availableWhen: "Tại mỗi thẻ gói dịch vụ",
    },
    {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Xóa gói dịch vụ",
      description:
        "Xóa gói dịch vụ khỏi hệ thống. Lưu ý: Cần kiểm tra xem có người dùng đang sử dụng gói này không.",
      availableWhen: "Tại mỗi thẻ gói dịch vụ",
    },
    {
      icon: Clock,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Thời hạn sử dụng",
      description:
        "Thiết lập số ngày sử dụng cho mỗi gói (ví dụ: 30 ngày, 365 ngày).",
      availableWhen: "Khi tạo hoặc sửa gói",
    },
    {
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Giới hạn phòng",
      description:
        "Quy định số lượng phòng tối đa mà chủ nhà có thể quản lý với gói dịch vụ này.",
      availableWhen: "Khi tạo hoặc sửa gói",
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
                  Tìm hiểu cách tạo và quản lý các gói dịch vụ cho hệ thống
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
