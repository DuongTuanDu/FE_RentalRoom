import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Eye,
  Settings,
  ToggleLeft,
  Users,
  Search,
  Shield,
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

export const StaffActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm quản lý mới",
      description:
        "Tạo tài khoản quản lý mới và phân công phụ trách các tòa nhà cụ thể.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Eye,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description:
        "Xem thông tin cá nhân, liên hệ và danh sách các tòa nhà được phân công.",
      availableWhen: "Tại mỗi dòng nhân viên",
    },
    {
      icon: Settings,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      title: "Phân quyền",
      description:
        "Điều chỉnh quyền hạn truy cập và thao tác (Xem, Sửa, Xóa) cho từng chức năng.",
      availableWhen: "Trong menu thao tác của nhân viên",
    },
    {
      icon: ToggleLeft, // Represents Activate/Deactivate Switch
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Kích hoạt / Vô hiệu hóa",
      description:
        "Bật hoặc tắt quyền truy cập hệ thống của tài khoản quản lý.",
      availableWhen: "Trong menu thao tác của nhân viên",
    },
    {
      icon: Search,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Tìm kiếm",
      description: "Tìm kiếm nhân viên theo tên, email hoặc số điện thoại.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Filter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Lọc trạng thái",
      description:
        "Lọc danh sách nhân viên theo trạng thái hoạt động hoặc vô hiệu hóa.",
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
                  Hướng dẫn quản lý nhân viên
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách quản lý và phân quyền cho nhân viên
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
