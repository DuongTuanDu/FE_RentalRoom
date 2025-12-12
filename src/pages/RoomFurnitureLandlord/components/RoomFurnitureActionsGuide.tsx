import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Filter,
  Sofa,
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

export const RoomFurnitureActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm nội thất vào phòng",
      description:
        "Gán nội thất có sẵn vào một phòng cụ thể. Bạn cần chọn loại nội thất, số lượng và tình trạng.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Cập nhật tình trạng",
      description:
        "Cập nhật số lượng, tình trạng (Tốt, Hỏng, Đang sửa) hoặc ghi chú cho nội thất trong phòng.",
      availableWhen: "Tại mỗi dòng nội thất trong phòng (cần quyền chỉnh sửa)",
    },
    {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Xóa khỏi phòng",
      description:
        "Gỡ bỏ nội thất khỏi phòng (không xóa loại nội thất khỏi hệ thống).",
      availableWhen: "Tại mỗi dòng nội thất trong phòng (cần quyền xóa)",
    },
    {
      icon: Filter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Lọc theo phòng",
      description:
        "Chọn phòng cụ thể để xem danh sách nội thất đang có trong phòng đó.",
      availableWhen: "Luôn có sẵn sau khi chọn tòa nhà",
    },
    {
      icon: Sofa,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Quản lý nội thất chung",
      description:
        "Để tạo mới hoặc sửa loại nội thất (ví dụ: Giường, Tủ, Bàn), vui lòng truy cập trang 'Quản lý Nội thất'.",
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
                  Hướng dẫn quản lý nội thất phòng
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách phân bổ và quản lý nội thất cho từng phòng
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
