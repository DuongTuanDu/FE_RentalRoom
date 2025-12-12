import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Building2,
  Search,
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

export const MaintenanceActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Eye,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description:
        "Xem toàn bộ thông tin chi tiết về yêu cầu sửa chữa, bao gồm hình ảnh và mô tả sự cố.",
      availableWhen: "Luôn có sẵn tại mỗi dòng yêu cầu",
    },
    {
      icon: Edit2,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Cập nhật trạng thái",
      description:
        "Cập nhật tiến độ xử lý yêu cầu (Đang xử lý, Đã xong, Từ chối) và ghi chú thêm thông tin.",
      availableWhen:
        "Tại mỗi dòng yêu cầu, cho phép thay đổi trạng thái và chi phí",
    },
    {
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-700",
      title: "Trạng thái: Đang xử lý",
      description:
        "Đánh dấu yêu cầu đang được nhân viên kỹ thuật kiểm tra và sửa chữa.",
      availableWhen: "Khi cập nhật trạng thái",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Trạng thái: Đã xử lý",
      description: "Đánh dấu yêu cầu đã được hoàn thành và sửa chữa xong.",
      availableWhen: "Khi cập nhật trạng thái",
    },
    {
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Trạng thái: Từ chối",
      description:
        "Từ chối yêu cầu sửa chữa nếu không hợp lệ hoặc không thuộc phạm vi xử lý.",
      availableWhen: "Khi cập nhật trạng thái",
    },
    {
      icon: Filter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Bộ lọc",
      description:
        "Lọc danh sách yêu cầu theo trạng thái (Mới, Đang xử lý...) để dễ dàng quản lý.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Building2,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Lọc theo tòa nhà",
      description:
        "Chọn tòa nhà cụ thể để xem các yêu cầu sửa chữa thuộc tòa nhà đó.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Search,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      title: "Tìm kiếm",
      description: "Tìm kiếm nhanh yêu cầu theo tiêu đề hoặc mô tả sự cố.",
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
                  Hướng dẫn quản lý bảo trì & sửa chữa
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách xử lý các yêu cầu sửa chữa từ cư dân
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
