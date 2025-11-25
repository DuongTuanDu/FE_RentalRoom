import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useGetTenantContractDetailsQuery,
  useUpdateTenantContractMutation,
} from "@/services/contract/contract.service";
import { toast } from "sonner";
import type { IUpdateTenantContractRequest, IPerson } from "@/types/contract";
import { formatDateForInput } from "@/helpers/date";
import { Plus, Trash2 } from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  validateCCCD,
  validatePhone,
  validateEmail,
  validateRequired,
} from "@/helpers/validation";

interface TenantContractFormValues {
  personBName: string;
  personBDob: string;
  personBCccd: string;
  personBCccdIssuedDate: string;
  personBCccdIssuedPlace: string;
  personBPermanentAddress: string;
  personBPhone: string;
  personBEmail: string;
  roommates: IPerson[];
  bikes: {
    bikeNumber: string;
    color: string;
    brand: string;
  }[];
}

interface UpdateTenantContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const UpdateTenantContractDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: UpdateTenantContractDialogProps) => {
  const formatDate = useFormatDate();

  // Form with react-hook-form
  const form = useForm<TenantContractFormValues>({
    defaultValues: {
      personBName: "",
      personBDob: "",
      personBCccd: "",
      personBCccdIssuedDate: "",
      personBCccdIssuedPlace: "",
      personBPermanentAddress: "",
      personBPhone: "",
      personBEmail: "",
      roommates: [],
      bikes: [],
    },
    mode: "onBlur",
  });

  const {
    fields: roommateFields,
    append: appendRoommate,
    remove: removeRoommate,
  } = useFieldArray({
    control: form.control,
    name: "roommates",
  });

  const {
    fields: bikeFields,
    append: appendBike,
    remove: removeBike,
  } = useFieldArray({
    control: form.control,
    name: "bikes",
  });

  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetTenantContractDetailsQuery(contractId || "", {
      skip: !contractId || !open,
    });
  const [updateContract, { isLoading: isUpdating }] =
    useUpdateTenantContractMutation();

  // Load contract detail data into form when dialog opens
  useEffect(() => {
    if (open && contractDetail) {
      form.reset({
        personBName: contractDetail.B?.name || "",
        personBDob: formatDateForInput(contractDetail.B?.dob),
        personBCccd: contractDetail.B?.cccd || "",
        personBCccdIssuedDate: formatDateForInput(
          contractDetail.B?.cccdIssuedDate
        ),
        personBCccdIssuedPlace: contractDetail.B?.cccdIssuedPlace || "",
        personBPermanentAddress: contractDetail.B?.permanentAddress || "",
        personBPhone: contractDetail.B?.phone || "",
        personBEmail: contractDetail.B?.email || "",
        roommates: contractDetail.roommates || [],
        bikes: contractDetail.bikes || [],
      });
    } else if (!open) {
      // Reset when dialog closes
      form.reset();
    }
  }, [open, contractDetail, form]);

  const handleAddRoommate = () => {
    appendRoommate({
      name: "",
      dob: "",
      cccd: "",
      cccdIssuedDate: "",
      cccdIssuedPlace: "",
      permanentAddress: "",
      phone: "",
      email: "",
    });
  };

  const handleAddBike = () => {
    appendBike({
      bikeNumber: "",
      color: "",
      brand: "",
    });
  };

  const handleUpdateContract = async (data: TenantContractFormValues) => {
    if (!contractId || !contractDetail) return;

    try {
      const updateData: IUpdateTenantContractRequest = {
        B: {
          name: data.personBName,
          dob: data.personBDob,
          cccd: data.personBCccd,
          cccdIssuedDate: data.personBCccdIssuedDate,
          cccdIssuedPlace: data.personBCccdIssuedPlace,
          permanentAddress: data.personBPermanentAddress,
          phone: data.personBPhone,
          email: data.personBEmail,
        },
        roommates: data.roommates.filter((r) => r.name && r.cccd && r.phone),
        bikes: data.bikes.filter((b) => b.bikeNumber && b.brand && b.color),
      };

      await updateContract({
        id: contractId,
        data: updateData,
      }).unwrap();

      toast.success("Cập nhật hợp đồng thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.message?.message || "Có lỗi xảy ra khi cập nhật hợp đồng"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 md:p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Cập nhật thông tin hợp đồng</DialogTitle>
        </DialogHeader>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : contractDetail ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateContract)}>
              <div className="px-6 pb-6 space-y-6">
                {/* Preview Header */}
                <div className="space-y-3 bg-muted/40 rounded-md">
                  <div className="text-center">
                    <div className="font-semibold">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </div>
                    <div>ĐỘC LẬP – TỰ DO – HẠNH PHÚC</div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-xl font-bold">HỢP ĐỒNG THUÊ PHÒNG</div>
                    <div className="text-sm text-muted-foreground">
                      Số: {contractDetail.contract?.no || "—"}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">
                      BÊN CHO THUÊ NHÀ (BÊN A):
                    </div>
                    <div>
                      Đại diện (Ông/Bà):{" "}
                      <span className="font-medium">
                        {contractDetail.A?.name || "—"}
                      </span>
                    </div>
                    <div>
                      Ngày sinh:{" "}
                      <span className="font-medium">
                        {contractDetail.A?.dob
                          ? formatDate(contractDetail.A.dob)
                          : "—"}
                      </span>
                    </div>
                    <div>
                      CCCD:{" "}
                      <span className="font-medium">
                        {contractDetail.A?.cccd || "—"}
                      </span>{" "}
                      Cấp ngày:{" "}
                      <span className="font-medium">
                        {contractDetail.A?.cccdIssuedDate
                          ? formatDate(contractDetail.A.cccdIssuedDate)
                          : "—"}
                      </span>
                      , Nơi cấp:{" "}
                      <span className="font-medium">
                        {contractDetail.A?.cccdIssuedPlace || "—"}
                      </span>
                    </div>
                    <div>
                      Hộ khẩu thường trú:{" "}
                      <span className="font-medium">
                        {contractDetail.A?.permanentAddress || "—"}
                      </span>
                    </div>
                    <div>
                      Điện thoại:{" "}
                      <span className="font-medium">
                        {contractDetail.A?.phone || "—"}
                      </span>
                    </div>
                    <div>
                      Email:{" "}
                      <span className="font-medium">
                        {contractDetail.A?.email || "—"}
                      </span>
                    </div>
                    <div className="font-semibold pt-2">
                      BÊN THUÊ NHÀ (BÊN B):
                    </div>
                    <FormField
                      control={form.control}
                      name="personBName"
                      rules={{
                        validate: (value) =>
                          validateRequired(value, "Tên bên thuê nhà") || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="flex items-start">
                          <div>Đại diện (Ông/Bà): </div>
                          <div className="flex flex-col">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nhập tên"
                                className="inline-block w-48 h-6 text-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs mt-1" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personBDob"
                      rules={{
                        validate: (value) =>
                          validateRequired(value, "Ngày sinh") || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="flex items-start">
                          <div>Ngày sinh: </div>
                          <div className="flex flex-col">
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                className="inline-block w-32 h-6 text-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs mt-1" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name="personBCccd"
                        rules={{
                          validate: (value) => validateCCCD(value) || true,
                        }}
                        render={({ field }) => (
                          <FormItem className="flex items-start">
                            <div>CCCD: </div>
                            <div className="flex flex-col items-start">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nhập số CCCD"
                                  className="inline-block w-40 h-6 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs mt-1" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personBCccdIssuedDate"
                        rules={{
                          validate: (value) =>
                            validateRequired(value, "Ngày cấp CCCD") || true,
                        }}
                        render={({ field }) => (
                          <FormItem className="flex items-start">
                            <div>
                              <span>Cấp ngày: </span>
                            </div>
                            <div className="flex flex-col items-start">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  className="inline-block w-32 h-6 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs mt-1" />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personBCccdIssuedPlace"
                        rules={{
                          validate: (value) =>
                            validateRequired(value, "Nơi cấp CCCD") || true,
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <div>
                              <span>, Nơi cấp: </span>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nhập nơi cấp"
                                  className="inline-block w-36 h-6 text-sm"
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs mt-1 ml-0" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="personBPermanentAddress"
                      rules={{
                        validate: (value) =>
                          validateRequired(value, "Hộ khẩu thường trú") || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="flex items-start">
                          <div>Hộ khẩu thường trú: </div>
                          <div className="flex flex-col">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nhập địa chỉ"
                                className="inline-block w-64 h-6 text-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs mt-1" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personBPhone"
                      rules={{
                        validate: (value) => validatePhone(value) || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="flex items-start">
                          <div>Điện thoại: </div>
                          <div className="flex flex-col">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nhập số điện thoại"
                                className="inline-block w-40 h-6 text-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs mt-1 ml-0" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personBEmail"
                      rules={{
                        validate: (value) => validateEmail(value) || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="flex items-start">
                          <div>Email: </div>
                          <div className="flex flex-col">
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Nhập email"
                                className="inline-block w-48 h-6 text-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-xs mt-1 ml-0" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Terms and Regulations */}
                {(contractDetail.terms && contractDetail.terms.length > 0) ||
                (contractDetail.regulations &&
                  contractDetail.regulations.length > 0) ? (
                  <div className="space-y-4">
                    {contractDetail.terms &&
                      contractDetail.terms.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-semibold">
                            Nội dung điều khoản
                          </div>
                          <div className="space-y-2 text-sm">
                            {[...contractDetail.terms]
                              .sort((a, b) => a.order - b.order)
                              .map((term, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-slate-50 rounded-lg"
                                >
                                  <div className="font-medium">{term.name}</div>
                                  <div className="text-muted-foreground mt-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: term.description,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {contractDetail.regulations &&
                      contractDetail.regulations.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-semibold">Nội dung quy định</div>
                          <div className="space-y-2 text-sm">
                            {[...contractDetail.regulations]
                              .sort((a, b) => a.order - b.order)
                              .map((reg, index) => (
                                <div
                                  key={index}
                                  className="p-3 border rounded-lg"
                                >
                                  <div className="font-medium">{reg.title}</div>
                                  <div className="text-muted-foreground mt-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:mb-2 [&_p]:mt-0">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: reg.description,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : null}

                {/* Roommates Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Người ở cùng</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRoommate}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm người ở cùng
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {roommateFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Label>Người ở cùng {index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoommate(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`roommates.${index}.name`}
                            rules={{
                              validate: (value) =>
                                validateRequired(value, "Họ và tên") || true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <Label className="text-xs">Họ và tên</Label>
                                <FormControl>
                                  <Input {...field} placeholder="Nhập họ tên" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`roommates.${index}.dob`}
                            rules={{
                              validate: (value) =>
                                validateRequired(value, "Ngày sinh") || true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <Label className="text-xs">Ngày sinh</Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="date"
                                    value={formatDateForInput(field.value)}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`roommates.${index}.cccd`}
                            rules={{
                              validate: (value) => validateCCCD(value) || true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <Label className="text-xs">CCCD</Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nhập số CCCD"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`roommates.${index}.phone`}
                            rules={{
                              validate: (value) => validatePhone(value) || true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <Label className="text-xs">Số điện thoại</Label>
                                <FormControl>
                                  <Input {...field} placeholder="Nhập SĐT" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`roommates.${index}.permanentAddress`}
                            rules={{
                              validate: (value) =>
                                validateRequired(value, "Địa chỉ thường trú") ||
                                true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1 col-span-2">
                                <Label className="text-xs">
                                  Địa chỉ thường trú
                                </Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nhập địa chỉ"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    {roommateFields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có người ở cùng. Nhấn "Thêm người ở cùng" để thêm.
                      </p>
                    )}
                  </div>
                </div>

                {/* Bikes Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Xe máy</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBike}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm xe máy
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {bikeFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Label>Xe máy {index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBike(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <FormField
                            control={form.control}
                            name={`bikes.${index}.bikeNumber`}
                            rules={{
                              validate: (value) =>
                                validateRequired(value, "Biển số") || true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <Label className="text-xs">Biển số</Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nhập biển số"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`bikes.${index}.brand`}
                            rules={{
                              validate: (value) =>
                                validateRequired(value, "Hãng xe") || true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <Label className="text-xs">Hãng xe</Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nhập hãng xe"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`bikes.${index}.color`}
                            rules={{
                              validate: (value) =>
                                validateRequired(value, "Màu sắc") || true,
                            }}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <Label className="text-xs">Màu sắc</Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nhập màu sắc"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    {bikeFields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có xe máy. Nhấn "Thêm xe máy" để thêm.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        ) : null}
        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button
            onClick={form.handleSubmit(handleUpdateContract)}
            disabled={isUpdating}
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
