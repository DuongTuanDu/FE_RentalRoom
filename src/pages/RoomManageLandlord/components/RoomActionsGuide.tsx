import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Zap,
  Edit,
  Eye,
  ToggleLeft,
  Search,
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

export const RoomActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm phòng",
      description:
        "Tạo mới một phòng với đầy đủ thông tin: số phòng, diện tích, giá, mô tả và hình ảnh.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: Zap,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Thiết lập nhanh",
      description:
        "Tạo nhanh nhiều phòng cùng lúc cho một tầng cụ thể để tiết kiệm thời gian.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Chỉnh sửa",
      description:
        "Cập nhật thông tin phòng như giá, diện tích, trạng thái, mô tả và hình ảnh.",
      availableWhen: "Tại mỗi thẻ phòng (cần quyền chỉnh sửa)",
    },
    {
      icon: Eye,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description:
        "Xem thông tin chi tiết của phòng, bao gồm hình ảnh, tiện ích và lịch sử thuê.",
      availableWhen: "Tại mỗi thẻ phòng",
    },
    {
      icon: ToggleLeft,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      title: "Kích hoạt / Vô hiệu hóa",
      description:
        "Bật/tắt trạng thái hoạt động của phòng. Phòng vô hiệu hóa sẽ không hiển thị khi tạo hợp đồng.",
      availableWhen: "Tại mỗi thẻ phòng",
    },
    {
      icon: Filter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Bộ lọc",
      description:
        "Lọc danh sách phòng theo tầng hoặc trạng thái (Trống, Đã thuê, Đang sửa...).",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Search,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      title: "Tìm kiếm",
      description: "Tìm kiếm nhanh phòng theo số phòng.",
      availableWhen: "Luôn có sẵn",
    },
    // {
    //   icon: Trash2,
    //   iconBg: "bg-red-100",
    //   iconColor: "text-red-600",
    //   title: "Xóa phòng",
    //   description: "Xóa phòng khỏi hệ thống (cần cân nhắc kỹ trước khi xóa).",
    //   availableWhen: "Tại mỗi thẻ phòng (cần quyền xóa)",
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
                  Hướng dẫn quản lý phòng
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách thiết lập và quản lý danh sách phòng trọ
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
