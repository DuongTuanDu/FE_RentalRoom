import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Zap,
  Edit,
  Eye,
  Upload,
  Download,
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

export const BuildingActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconColor: "text-slate-900",
      title: "Thêm tòa nhà",
      description: "Tạo mới một tòa nhà với đầy đủ thông tin chi tiết.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Zap,
      iconColor: "text-slate-900",
      title: "Thiết lập nhanh",
      description:
        "Tạo nhanh tòa nhà với các thông số cơ bản giúp tiết kiệm thời gian.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Download,
      iconColor: "text-slate-900",
      title: "Tải template Excel",
      description: "Tải xuống mẫu file Excel để nhập danh sách tòa nhà.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Upload,
      iconColor: "text-slate-900",
      title: "Import Excel",
      description:
        "Thêm nhiều tòa nhà cùng lúc bằng cách tải lên file Excel đã điền thông tin.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Eye,
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description: "Xem thông tin chi tiết của tòa nhà trong danh sách.",
      availableWhen: "Tại mỗi dòng của tòa nhà trong bảng",
    },
    {
      icon: Edit,
      iconColor: "text-amber-600",
      title: "Chỉnh sửa",
      description: "Cập nhật thông tin của tòa nhà đã tạo.",
      availableWhen:
        "Tại mỗi dòng của tòa nhà trong bảng (cần quyền chỉnh sửa)",
    },
    {
      icon: ToggleLeft,
      iconColor: "text-slate-900",
      title: "Kích hoạt / Vô hiệu hóa",
      description:
        "Thay đổi trạng thái hoạt động (Active/Inactive) của tòa nhà bằng nút gạt (Switch).",
      availableWhen: "Tại mỗi dòng của tòa nhà trong bảng",
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
                  Hướng dẫn quản lý tòa nhà
                </CardTitle>
                <CardDescription>
                  Tìm hiểu về các chức năng quản lý tòa nhà
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
                        className={`p-2 rounded-lg bg-gray-50 ${action.iconColor}`}
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
