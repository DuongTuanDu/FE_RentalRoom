import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  WashingMachine,
  Edit,
  Trash2,
  Building2,
  ListFilter,
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

export const LaundryActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm thiết bị",
      description:
        "Thêm mới máy giặt hoặc máy sấy cho một tầng cụ thể. Yêu cầu nhập Tuya Device ID để kết nối.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà và tầng",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Chỉnh sửa",
      description:
        "Cập nhật thông tin thiết bị như tên, công suất, hoặc ID kết nối Tuya.",
      availableWhen: "Tại mỗi dòng thiết bị trong bảng (cần quyền chỉnh sửa)",
    },
    {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Xóa thiết bị",
      description: "Xóa thiết bị giặt sấy khỏi hệ thống quản lý.",
      availableWhen: "Tại mỗi dòng thiết bị trong bảng (cần quyền xóa)",
    },
    {
      icon: WashingMachine,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Theo dõi trạng thái",
      description:
        "Xem trạng thái hoạt động (Đang chạy, Rảnh, Không xác định) của các thiết bị theo thời gian thực.",
      availableWhen: "Tự động cập nhật trên bảng danh sách",
    },
    {
      icon: Building2,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Lọc theo tòa nhà/tầng",
      description:
        "Chọn tòa nhà và tầng cụ thể để xem và quản lý danh sách thiết bị giặt sấy tại khu vực đó.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: ListFilter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Lọc theo trạng thái",
      description:
        "Lọc danh sách thiết bị theo trạng thái hoạt động: Đang chạy, Rảnh, hoặc Không xác định.",
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
                  Hướng dẫn quản lý thiết bị giặt sấy
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách quản lý và theo dõi máy giặt/sấy thông minh
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
