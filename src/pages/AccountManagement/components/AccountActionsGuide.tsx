import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Eye,
  UserCheck,
  Search,
  Filter,
  Users,
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

export const AccountActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Eye,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description:
        "Xem thông tin chi tiết của tài khoản người dùng, bao gồm thông tin cá nhân và lịch sử hoạt động.",
      availableWhen: "Tại mỗi dòng tài khoản",
    },
    {
      icon: UserCheck, // Represents the Toggle Switch
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Kích hoạt / Vô hiệu hóa",
      description:
        "Bật hoặc tắt quyền truy cập hệ thống của tài khoản người dùng bằng công tắc (switch).",
      availableWhen: "Tại mỗi dòng tài khoản",
    },
    {
      icon: Search,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      title: "Tìm kiếm",
      description: "Tìm kiếm tài khoản nhanh chóng theo địa chỉ email.",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Filter,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Lọc theo vai trò",
      description:
        "Lọc danh sách tài khoản theo vai trò (Quản trị viên, Chủ trọ, Người thuê, Người dùng).",
      availableWhen: "Luôn có sẵn",
    },
    {
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Thống kê",
      description:
        "Xem tổng quan số lượng tài khoản theo từng vai trò và trạng thái hoạt động.",
      availableWhen: "Hiển thị ở đầu trang",
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
                  Hướng dẫn quản lý tài khoản
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách quản lý và kiểm soát tài khoản người dùng
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
