import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Building2,
  Eye,
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

export const TermActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Thêm điều khoản",
      description:
        "Tạo mới một điều khoản hợp đồng. Bạn có thể soạn thảo nội dung chi tiết và áp dụng cho các tòa nhà.",
      availableWhen: "Luôn có sẵn khi đã chọn tòa nhà",
    },
    {
      icon: Eye,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description:
        "Xem toàn bộ nội dung của điều khoản, bao gồm các định dạng văn bản.",
      availableWhen: "Tại mỗi dòng điều khoản",
    },
    {
      icon: Edit,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Chỉnh sửa",
      description:
        "Cập nhật nội dung hoặc trạng thái (Hoạt động/Ngừng hoạt động) của điều khoản.",
      availableWhen: "Tại mỗi dòng điều khoản trong bảng (cần quyền chỉnh sửa)",
    },
    {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Xóa điều khoản",
      description: "Xóa điều khoản khỏi hệ thống.",
      availableWhen: "Tại mỗi dòng điều khoản trong bảng (cần quyền xóa)",
    },
    {
      icon: Building2,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Lọc theo tòa nhà",
      description:
        "Chọn tòa nhà để xem các điều khoản áp dụng riêng cho tòa nhà đó.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Filter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Lọc trạng thái",
      description:
        "Lọc danh sách điều khoản theo trạng thái hoạt động hoặc ngừng hoạt động.",
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
                  Hướng dẫn quản lý điều khoản
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách tạo và quản lý các điều khoản hợp đồng
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
