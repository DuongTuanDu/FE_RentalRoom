import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Calendar,
  Save,
  Clock,
  Plus,
  Edit,
  Building2,
  ListRestart,
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

export const ScheduleActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Calendar,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Lịch mặc định",
      description:
        "Thiết lập lịch rảnh/bận định kỳ cho các ngày trong tuần (Thứ 2 - Chủ Nhật) để khách có thể đặt lịch hẹn.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm lịch thay đổi",
      description:
        "Tạo lịch ngoại lệ cho các ngày cụ thể (ví dụ: ngày nghỉ lễ, ngày bận đột xuất) khác với lịch mặc định.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: ToggleLeft,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Bật/Tắt Rảnh",
      description:
        "Chuyển đổi trạng thái Rảnh/Bận cho từng ngày trong tuần hoặc ngày cụ thể.",
      availableWhen: "Tại mỗi dòng lịch",
    },
    {
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Khung giờ",
      description:
        "Thiết lập giờ bắt đầu và giờ kết thúc cho khoảng thời gian rảnh trong ngày.",
      availableWhen: "Tại mỗi dòng lịch (khi trạng thái là Rảnh)",
    },
    {
      icon: Save,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      title: "Lưu lịch",
      description:
        "Lưu lại tất cả các thay đổi về lịch mặc định và lịch ngoại lệ vào hệ thống.",
      availableWhen: "Luôn có sẵn (nút ở cuối trang)",
    },
    {
      icon: ListRestart,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Xóa toàn bộ lịch",
      description:
        "Xóa tất cả thiết lập lịch của tòa nhà hiện tại và đưa về trạng thái mặc định.",
      availableWhen: "Luôn có sẵn (cần xác nhận)",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Sửa lịch thay đổi",
      description:
        "Chỉnh sửa thông tin ngày, giờ hoặc trạng thái của một lịch ngoại lệ đã tạo.",
      availableWhen: "Tại danh sách lịch thay đổi",
    },
    {
      icon: Building2,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Chọn tòa nhà",
      description:
        "Chọn tòa nhà để thiết lập lịch xem phòng riêng biệt cho từng địa điểm.",
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
                  Hướng dẫn quản lý lịch xem phòng
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách thiết lập thời gian rảnh để khách đặt lịch
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
