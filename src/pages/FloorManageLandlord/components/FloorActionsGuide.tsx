import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Zap,
  Edit,
  Building2,
  ToggleLeft,
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

export const FloorActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm tầng mới",
      description:
        "Tạo một tầng mới cho tòa nhà đã chọn. Bạn cần nhập số tầng và mô tả.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: Zap,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Thiết lập nhanh",
      description:
        "Tạo nhanh nhiều tầng cùng lúc dựa trên số lượng tầng bạn muốn.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Chỉnh sửa",
      description: "Cập nhật thông tin số tầng và mô tả của tầng đã tạo.",
      availableWhen: "Tại mỗi dòng của tầng trong bảng (cần quyền chỉnh sửa)",
    },
    {
      icon: ToggleLeft,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      title: "Kích hoạt / Vô hiệu hóa",
      description:
        "Thay đổi trạng thái hoạt động của tầng. Tầng bị vô hiệu hóa sẽ không thể thêm phòng mới.",
      availableWhen: "Tại mỗi dòng của tầng trong bảng",
    },
    {
      icon: Building2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Chọn tòa nhà",
      description:
        "Lọc danh sách tầng theo tòa nhà cụ thể để quản lý dễ dàng hơn.",
      availableWhen: "Luôn có sẵn",
    },
    // Uncomment if delete action is enabled
    // {
    //   icon: Trash2,
    //   iconBg: "bg-red-100",
    //   iconColor: "text-red-600",
    //   title: "Xóa tầng",
    //   description: "Xóa tầng khỏi hệ thống.",
    //   availableWhen: "Tại mỗi dòng của tầng trong bảng (cần quyền xóa)",
    // },
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
                  Hướng dẫn quản lý tầng
                </CardTitle>
                <CardDescription>
                  Tìm hiểu về các chức năng quản lý tầng
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
