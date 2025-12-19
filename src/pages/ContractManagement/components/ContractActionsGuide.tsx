import { Eye, Send, CheckCircle, Edit, Ban, XCircle, Download, Copy, ChevronDown, ChevronUp, HelpCircle, ThumbsUp, X, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ContractActionsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Eye,
      iconColor: "text-blue-600",
      title: "Xem chi tiết",
      description: "Xem toàn bộ thông tin chi tiết của hợp đồng",
      availableWhen: "Luôn có sẵn cho mọi hợp đồng",
    },
    {
      icon: Edit,
      iconColor: "text-amber-600",
      title: "Cập nhật",
      description: "Chỉnh sửa thông tin hợp đồng khi chưa gửi cho khách thuê hoặc chưa hoàn thành",
      availableWhen: "Khi hợp đồng ở trạng thái: Nháp, Đã ký bởi chủ trọ",
    },
    {
      icon: CheckCircle,
      iconColor: "text-green-600",
      title: "Ký hợp đồng",
      description: "Ký hợp đồng bằng chữ ký điện tử của chủ trọ",
      availableWhen: "Khi hợp đồng ở trạng thái: Nháp",
    },
    {
      icon: Send,
      iconColor: "text-blue-600",
      title: "Gửi cho khách thuê",
      description: "Gửi hợp đồng đã ký cho khách thuê để họ xem xét và ký",
      availableWhen: "Khi hợp đồng ở trạng thái: Đã ký bởi chủ trọ",
    },
    {
      icon: Ban,
      iconColor: "text-red-600",
      title: "Chấm dứt hợp đồng",
      description: "Chấm dứt hợp đồng trước thời hạn với lý do cụ thể",
      availableWhen: "Khi hợp đồng ở trạng thái: Hoàn thành và đã xác nhận vào ở",
    },
    {
      icon: XCircle,
      iconColor: "text-orange-600",
      title: "Vô hiệu hóa hợp đồng",
      description: "Vô hiệu hóa hợp đồng khi có vấn đề phát sinh, hợp đồng sẽ không còn hiệu lực",
      availableWhen: "Khi hợp đồng ở trạng thái: Nháp, Đã ký bởi chủ trọ, Đã gửi cho khách thuê",
    },
    {
      icon: Home,
      iconColor: "text-emerald-600",
      title: "Xác nhận người thuê đã vào ở",
      description: "Xác nhận người thuê đã chuyển vào ở. Sau khi xác nhận, hợp đồng sẽ được đánh dấu là đang có hiệu lực",
      availableWhen: "Khi hợp đồng ở trạng thái: Hoàn thành và chưa xác nhận vào ở",
    },
    {
      icon: Download,
      iconColor: "text-indigo-600",
      title: "Tải PDF hợp đồng",
      description: "Tải xuống file PDF của hợp đồng đã hoàn thành để lưu trữ hoặc in",
      availableWhen: "Khi hợp đồng ở trạng thái: Hoàn thành",
    },
    {
      icon: Copy,
      iconColor: "text-teal-600",
      title: "Tạo hợp đồng mới từ hợp đồng này",
      description: "Sao chép thông tin từ hợp đồng cũ để tạo hợp đồng mới nhanh chóng",
      availableWhen: "Khi hợp đồng ở trạng thái: Đã vô hiệu hóa, Đã chấm dứt",
    },
    {
      icon: ThumbsUp,
      iconColor: "text-emerald-600",
      title: "Duyệt yêu cầu chấm dứt hợp đồng",
      description: "Phê duyệt yêu cầu chấm dứt hợp đồng do khách thuê gửi lên. Hợp đồng sẽ được cập nhật trạng thái tương ứng",
      availableWhen: "Khi có yêu cầu chấm dứt hợp đồng từ người thuê và yêu cầu đang ở trạng thái: Đang chờ xử lý (pending)",
    },
    {
      icon: X,
      iconColor: "text-red-600",
      title: "Từ chối yêu cầu chấm dứt hợp đồng",
      description: "Nhập lý do và từ chối yêu cầu chấm dứt hợp đồng của khách thuê",
      availableWhen: "Khi có yêu cầu chấm dứt hợp đồng từ người thuê và yêu cầu đang ở trạng thái: Đang chờ xử lý (pending)",
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
                  Tìm hiểu về các action có sẵn trong bảng quản lý hợp đồng
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

