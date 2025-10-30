import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Zap } from "lucide-react";

// Type definition
interface QuickBuildingFormData {
  name: string;
  address: string;
  eIndexType: "byNumber" | "included";
  ePrice: number;
  wIndexType: "byNumber" | "byPerson" | "included";
  wPrice: number;
  floors: {
    count: number;
    startLevel: number;
    description?: string;
  };
  rooms: {
    perFloor: number;
    seqStart: number;
    defaults: {
      area: number;
      price: number;
      maxTenants: number;
      status: "available" | "rented";
      description?: string;
      eStart: number;
      wStart: number;
    };
  };
  dryRun?: boolean;
}

interface ModalQuickBuildingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuickBuildingFormData) => void;
  isLoading?: boolean;
}

const ModalQuickBuilding = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ModalQuickBuildingProps) => {
  const form = useForm<QuickBuildingFormData>({
    defaultValues: {
      name: "",
      address: "",
      eIndexType: "byNumber",
      ePrice: 0,

      wIndexType: "byNumber",
      wPrice: 0,
      floors: {
        count: 0,
        startLevel: 0,
        description: "",
      },
      rooms: {
        perFloor: 0,
        seqStart: 0,
        defaults: {
          area: 0,
          price: 0,
          maxTenants: 0,
          status: "available",
          description: "",
        },
      },
      dryRun: false,
    },
  });

  const handleSubmit = (data: QuickBuildingFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Thiết lập nhanh tòa nhà
          </DialogTitle>
          <DialogDescription>
            Tạo tòa nhà với các tầng và phòng tự động theo cấu hình
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Thông tin cơ bản */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Thông tin tòa nhà
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên tòa nhà *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên tòa nhà" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập địa chỉ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Điện & Nước */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cấu hình điện & nước</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="eIndexType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hình thức tính điện *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hình thức" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="byNumber">
                              Theo số (kWh)
                            </SelectItem>
                            <SelectItem value="byPerson">
                              Theo đầu người
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="ePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn giá điện *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="VD: 3500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="wIndexType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hình thức tính nước *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hình thức" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="byNumber">
                              Theo số (m³)
                            </SelectItem>
                            <SelectItem value="byPerson">Theo người</SelectItem>
                            <SelectItem value="included">
                              Đã bao gồm trong giá thuê
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="wPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn giá nước *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="VD: 15000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cấu hình tầng */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cấu hình tầng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control as any}
                    name="floors.count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tầng *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Số tầng"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="floors.startLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tầng bắt đầu *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Tầng bắt đầu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="floors.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả tầng</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả về các tầng (tùy chọn)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Cấu hình phòng */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cấu hình phòng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="rooms.perFloor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số phòng mỗi tầng *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Số phòng mỗi tầng"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="rooms.seqStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số thứ tự bắt đầu *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Số thứ tự bắt đầu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">
                    Thông tin mặc định cho phòng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="rooms.defaults.area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diện tích (m²) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Diện tích phòng"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="rooms.defaults.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá thuê (VNĐ) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Giá thuê phòng"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="rooms.defaults.maxTenants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số người tối đa *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Số người tối đa"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="rooms.defaults.status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trạng thái mặc định *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Có sẵn</SelectItem>
                              <SelectItem value="rented">Đã thuê</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control as any}
                    name="rooms.defaults.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả phòng</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả mặc định cho các phòng (tùy chọn)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Tạo tòa nhà"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalQuickBuilding;
