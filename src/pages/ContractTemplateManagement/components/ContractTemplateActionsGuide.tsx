import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Download,
  Building2,
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

export const ContractTemplateActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm mẫu hợp đồng",
      description:
        "Tạo mới một mẫu hợp đồng. Bạn có thể chọn các điều khoản và nội quy mặc định để áp dụng cho các hợp đồng tạo từ mẫu này.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Chỉnh sửa",
      description:
        "Cập nhật thông tin mẫu hợp đồng như tên, điều khoản, nội quy hoặc trạng thái hoạt động.",
      availableWhen:
        "Tại mỗi dòng của mẫu hợp đồng trong bảng (cần quyền chỉnh sửa)",
    },
    {
      icon: Download,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Tải PDF xem trước",
      description:
        "Tải xuống file PDF xem trước của mẫu hợp đồng để kiểm tra nội dung và bố cục.",
      availableWhen: "Tại mỗi dòng của mẫu hợp đồng trong bảng",
    },
    {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Xóa mẫu hợp đồng",
      description: "Xóa mẫu hợp đồng khỏi hệ thống.",
      availableWhen: "Tại mỗi dòng của mẫu hợp đồng trong bảng (cần quyền xóa)",
    },
    {
      icon: Building2,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Lọc theo tòa nhà",
      description:
        "Chọn tòa nhà để xem danh sách các mẫu hợp đồng áp dụng cho tòa nhà đó.",
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
                  Hướng dẫn quản lý mẫu hợp đồng
                </CardTitle>
                <CardDescription>
                  Tìm hiểu về cách tạo và quản lý các mẫu hợp đồng
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
