import { Eye, CheckCircle, Edit, Clock, Download, ChevronDown, ChevronUp, HelpCircle, Ban } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const TenantActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Eye,
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description: "Xem toàn bộ thông tin chi tiết của hợp đồng bao gồm thông tin phòng, giá thuê, điều khoản và quy định",
      availableWhen: "Luôn có sẵn cho mọi hợp đồng",
    },
    {
      icon: Edit,
      iconColor: "text-amber-600",
      title: "Cập nhật thông tin",
      description: "Chỉnh sửa thông tin cá nhân trong hợp đồng như thông tin người ở cùng, xe máy trước khi ký hợp đồng",
      availableWhen: "Khi hợp đồng ở trạng thái: Đã gửi (chưa ký)",
    },
    {
      icon: CheckCircle,
      iconColor: "text-green-600",
      title: "Ký hợp đồng",
      description: "Ký hợp đồng bằng chữ ký điện tử của bạn. Sau khi ký, hợp đồng sẽ được hoàn thành và bạn cần đợi chủ trọ xác nhận vào ở",
      availableWhen: "Khi hợp đồng ở trạng thái: Đã gửi (chủ trọ đã ký và gửi cho bạn)",
    },
    {
      icon: Clock,
      iconColor: "text-purple-600",
      title: "Yêu cầu gia hạn",
      description: "Gửi yêu cầu gia hạn hợp đồng khi hợp đồng sắp hết hạn. Chủ trọ sẽ xem xét và phê duyệt yêu cầu của bạn",
      availableWhen: "Khi hợp đồng còn 30 ngày hoặc ít hơn trước khi hết hạn và hợp đồng đã được ký hoặc hoàn thành",
    },
    {
      icon: Ban,
      iconColor: "text-red-600",
      title: "Yêu cầu chấm dứt hợp đồng",
      description: "Gửi yêu cầu chấm dứt hợp đồng trước thời hạn với lý do cụ thể. Chủ trọ sẽ xem xét, phê duyệt hoặc từ chối yêu cầu của bạn",
      availableWhen: "Khi hợp đồng đang trong trạng thái: Hoàn thành (đang có hiệu lực)",
    },
    {
      icon: Download,
      iconColor: "text-indigo-600",
      title: "Tải PDF hợp đồng",
      description: "Tải xuống file PDF của hợp đồng đã hoàn thành để lưu trữ, in hoặc sử dụng cho các mục đích khác",
      availableWhen: "Khi hợp đồng ở trạng thái: Hoàn thành",
    },
  ];

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Hướng dẫn các thao tác với hợp đồng</CardTitle>
                <CardDescription>
                  Tìm hiểu về các action có sẵn trong bảng quản lý hợp đồng của bạn
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
                      <div className={`p-2 rounded-lg bg-gray-50 ${action.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-sm">{action.title}</h4>
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

