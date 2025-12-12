import { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
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

export const ContactRequestActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Chấp nhận yêu cầu",
      description:
        "Đồng ý với yêu cầu liên hệ từ khách thuê. Sau khi chấp nhận, bạn có thể tạo hợp đồng cho khách.",
      availableWhen: "Khi yêu cầu đang ở trạng thái 'Chờ duyệt' (pending)",
    },
    {
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Từ chối yêu cầu",
      description:
        "Từ chối yêu cầu liên hệ nếu thấy không phù hợp. Bạn có thể thêm ghi chú lý do từ chối.",
      availableWhen: "Khi yêu cầu đang ở trạng thái 'Chờ duyệt' (pending)",
    },
    {
      icon: Plus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Tạo hợp đồng",
      description:
        "Bắt đầu quy trình tạo hợp đồng mới dựa trên thông tin từ yêu cầu liên hệ này.",
      availableWhen:
        "Khi yêu cầu đã được 'Chấp nhận' (accepted) và chưa có hợp đồng nào được tạo",
    },
    {
      icon: Eye,
      iconBg: "bg-slate-100",
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description:
        "Xem toàn bộ thông tin chi tiết của yêu cầu, bao gồm thông tin khách thuê, bài đăng, và các ghi chú.",
      availableWhen: "Luôn có sẵn tại mỗi dòng yêu cầu",
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
                  Hướng dẫn xử lý yêu cầu hợp đồng
                </CardTitle>
                <CardDescription>
                  Tìm hiểu cách xử lý các yêu cầu liên hệ từ khách thuê
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
