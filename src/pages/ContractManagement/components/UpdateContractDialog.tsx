import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
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
  useGetContractDetailsQuery,
  useUpdateContractMutation,
} from "@/services/contract/contract.service";
import { toast } from "sonner";
import type { IUpdateContractRequest } from "@/types/contract";
import { formatDateForInput } from "@/helpers/date";
import { useFormatDate } from "@/hooks/useFormatDate";
import type { Element } from "slate";
import { SlateEditor } from "@/pages/TermManagement/components/SlateEditor";
import {
  htmlToSlate,
  slateToHtml,
} from "@/pages/TermManagement/components/slateHelpers";
import {
  validateContractNo,
  validateCCCD,
  validatePhone,
  validateEmail,
  validateRequired,
  validateNumber,
} from "@/helpers/validation";

type SlateValue = Element[];

interface ContractFormValues {
  contractNo: string;
  signPlace: string;
  signDate: string;
  price: string;
  deposit: string;
  startDate: string;
  endDate: string;
  paymentCycleMonths: string;
  personAName: string;
  personADob: string;
  personACccd: string;
  personACccdIssuedDate: string;
  personACccdIssuedPlace: string;
  personAPermanentAddress: string;
  personAPhone: string;
  personAEmail: string;
}

interface UpdateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
  onSuccess?: () => void;
}

export const UpdateContractDialog = ({
  open,
  onOpenChange,
  contractId,
  onSuccess,
}: UpdateContractDialogProps) => {
  const calculateContractMonths = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    return years * 12 + months;
  };

  // Form with react-hook-form
  const form = useForm<ContractFormValues>({
    defaultValues: {
      contractNo: "",
      signPlace: "",
      signDate: "",
      price: "",
      deposit: "",
      startDate: "",
      endDate: "",
      paymentCycleMonths: "1",
      personAName: "",
      personADob: "",
      personACccd: "",
      personACccdIssuedDate: "",
      personACccdIssuedPlace: "",
      personAPermanentAddress: "",
      personAPhone: "",
      personAEmail: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [termSlateValues, setTermSlateValues] = useState<
    Record<number, SlateValue>
  >({});
  const [termSlateValuesInitialized, setTermSlateValuesInitialized] =
    useState(false);
  const [termNames, setTermNames] = useState<Record<number, string>>({});
  const [regulationSlateValues, setRegulationSlateValues] = useState<
    Record<number, SlateValue>
  >({});
  const [
    regulationSlateValuesInitialized,
    setRegulationSlateValuesInitialized,
  ] = useState(false);
  const [regulationNames, setRegulationNames] = useState<
    Record<number, string>
  >({});
  const [paymentCycleWarning, setPaymentCycleWarning] = useState<string>("");
  const [depositWarning, setDepositWarning] = useState<string>("");

  const formatDate = useFormatDate();
  const { data: contractDetail, isLoading: isLoadingDetail } =
    useGetContractDetailsQuery(contractId || "", {
      skip: !contractId || !open,
    });
  const [updateContract, { isLoading: isUpdating }] =
    useUpdateContractMutation();

  // Memoize sorted terms to ensure consistency
  const sortedTerms = useMemo(() => {
    if (!contractDetail?.terms || contractDetail.terms.length === 0) {
      return [];
    }
    return [...contractDetail.terms].sort((a, b) => a.order - b.order);
  }, [contractDetail?.terms]);

  // Memoize sorted regulations to ensure consistency
  const sortedRegulations = useMemo(() => {
    if (
      !contractDetail?.regulations ||
      contractDetail.regulations.length === 0
    ) {
      return [];
    }
    return [...contractDetail.regulations].sort((a, b) => a.order - b.order);
  }, [contractDetail?.regulations]);

  // Load contract detail data into form when dialog opens
  useEffect(() => {
    if (open && contractDetail) {
      form.reset({
        contractNo: contractDetail.contract?.no || "",
        signPlace: contractDetail.contract?.signPlace || "",
        signDate: formatDateForInput(contractDetail.contract?.signDate),
        price: contractDetail.contract?.price?.toString() || "",
        deposit: contractDetail.contract?.deposit?.toString() || "",
        startDate: formatDateForInput(contractDetail.contract?.startDate),
        endDate: formatDateForInput(contractDetail.contract?.endDate),
        paymentCycleMonths: contractDetail.contract?.paymentCycleMonths?.toString() || "1",
        personAName: contractDetail.A?.name || "",
        personADob: formatDateForInput(contractDetail.A?.dob),
        personACccd: contractDetail.A?.cccd || "",
        personACccdIssuedDate: formatDateForInput(
          contractDetail.A?.cccdIssuedDate
        ),
        personACccdIssuedPlace: contractDetail.A?.cccdIssuedPlace || "",
        personAPermanentAddress: contractDetail.A?.permanentAddress || "",
        personAPhone: contractDetail.A?.phone || "",
        personAEmail: contractDetail.A?.email || "",
      });

      // Initialize Slate values and names for terms
      if (sortedTerms.length > 0) {
        const newTermSlateValues: Record<number, SlateValue> = {};
        const newTermNames: Record<number, string> = {};
        sortedTerms.forEach((term, index) => {
          const html = term.description || "";
          newTermSlateValues[index] = htmlToSlate(html);
          newTermNames[index] = term.name || "";
        });
        setTermSlateValues(newTermSlateValues);
        setTermNames(newTermNames);
        setTermSlateValuesInitialized(true);
      } else {
        setTermSlateValues({});
        setTermNames({});
        setTermSlateValuesInitialized(false);
      }

      // Initialize Slate values and names for regulations
      if (sortedRegulations.length > 0) {
        const newRegulationSlateValues: Record<number, SlateValue> = {};
        const newRegulationNames: Record<number, string> = {};
        sortedRegulations.forEach((reg, index) => {
          const html = reg.description || "";
          newRegulationSlateValues[index] = htmlToSlate(html);
          newRegulationNames[index] = reg.title || "";
        });
        setRegulationSlateValues(newRegulationSlateValues);
        setRegulationNames(newRegulationNames);
        setRegulationSlateValuesInitialized(true);
      } else {
        setRegulationSlateValues({});
        setRegulationNames({});
        setRegulationSlateValuesInitialized(false);
      }
    } else if (!open) {
      // Reset when dialog closes
      setTermSlateValues({});
      setTermNames({});
      setTermSlateValuesInitialized(false);
      setRegulationSlateValues({});
      setRegulationNames({});
      setRegulationSlateValuesInitialized(false);
      form.reset();
    }
  }, [open, contractDetail, sortedTerms, sortedRegulations, form]);

  const handleUpdateContract = async (data: ContractFormValues) => {
    if (!contractId || !contractDetail) return;

    // Validate ngày tháng
    const startDate = data.startDate?.trim();
    const endDate = data.endDate?.trim();

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Tính ngày tối thiểu kết thúc (ngày bắt đầu + 1 tháng)
      const minEndDate = new Date(start);
      minEndDate.setMonth(minEndDate.getMonth() + 1);

      // Kiểm tra 1: Ngày bắt đầu có lớn hơn ngày kết thúc không (Logic cũ)
      if (start > end) {
        form.setError("startDate", {
          type: "validate",
          message: "Ngày bắt đầu không được sau ngày kết thúc",
        });
        form.setError("endDate", {
          type: "validate",
          message: "Ngày kết thúc không được trước ngày bắt đầu",
        });
        toast.error("Ngày bắt đầu không được sau ngày kết thúc");

        // Scroll tới chỗ lỗi
        const startDateElement = document.querySelector('[name="startDate"]');
        if (startDateElement) {
          (startDateElement as HTMLElement).scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }

      // Kiểm tra 2: Thời hạn có dưới 1 tháng không
      if (end < minEndDate) {
        form.setError("endDate", {
          type: "validate",
          message: "Thời hạn hợp đồng phải tối thiểu 1 tháng",
        });
        toast.error("Thời hạn hợp đồng phải tối thiểu 1 tháng");

        // Scroll tới ô ngày kết thúc
        const endDateElement = document.querySelector('[name="endDate"]');
        if (endDateElement) {
          (endDateElement as HTMLElement).scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }
    }

    // Validate lại tất cả các field trước khi submit
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại các trường thông tin");
      return;
    }

    try {
      const updateData: IUpdateContractRequest = {
        A: {
          name: data.personAName,
          dob: data.personADob,
          cccd: data.personACccd,
          cccdIssuedDate: data.personACccdIssuedDate,
          cccdIssuedPlace: data.personACccdIssuedPlace,
          permanentAddress: data.personAPermanentAddress,
          phone: data.personAPhone,
          email: data.personAEmail,
        },
        contract: {
          no: data.contractNo,
          signPlace: data.signPlace,
          signDate: data.signDate,
          price: parseFloat(data.price),
          deposit: parseFloat(data.deposit),
          startDate: data.startDate,
          endDate: data.endDate,
          paymentCycleMonths: parseFloat(data.paymentCycleMonths),
        },
        terms:
          sortedTerms.map((term, index) => ({
            name: termNames[index] || term.name,
            description: termSlateValues[index]
              ? slateToHtml(termSlateValues[index])
              : term.description,
            order: term.order,
          })) || [],
        regulations:
          sortedRegulations.map((reg, index) => ({
            title: regulationNames[index] || reg.title,
            description: regulationSlateValues[index]
              ? slateToHtml(regulationSlateValues[index])
              : reg.description,
            effectiveFrom: reg.effectiveFrom,
            order: reg.order,
          })) || [],
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
          <DialogTitle>Cập nhật hợp đồng</DialogTitle>
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
                      <FormField
                        control={form.control}
                        name="contractNo"
                        rules={{
                          validate: (value) =>
                            validateContractNo(value) || true,
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <div>
                              Số:{" "}
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nhập số hợp đồng"
                                  className="inline-block w-32 h-6 text-sm"
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs mt-1 ml-0" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name="signDate"
                        rules={{
                          validate: (value) =>
                            validateRequired(value, "Ngày ký") || true,
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <div>
                              Hôm nay, ngày{" "}
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  className="inline-block w-32 h-6 text-sm"
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs mt-1 ml-0" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="signPlace"
                        rules={{
                          validate: (value) =>
                            validateRequired(value, "Địa điểm ký") || true,
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <div>
                              tại:{" "}
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nhập địa điểm"
                                  className="inline-block w-48 h-6 text-sm"
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs mt-1 ml-0" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="font-semibold">
                      BÊN CHO THUÊ NHÀ (BÊN A):
                    </div>
                    <FormField
                      control={form.control}
                      name="personAName"
                      rules={{
                        validate: (value) =>
                          validateRequired(value, "Tên bên cho thuê") || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="flex items-start">
                          <div>Đại diện (Ông/Bà): </div>
                          <div className="flex flex-col items-start">
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
                      name="personADob"
                      rules={{
                        validate: (value) =>
                          validateRequired(value, "Ngày sinh") || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="flex items-start">
                          <div>Ngày sinh: </div>
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
                      name="personACccd"
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
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name="personACccdIssuedDate"
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
                        name="personACccdIssuedPlace"
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
                                  className="inline-block w-40 h-6 text-sm"
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
                      name="personAPermanentAddress"
                      rules={{
                        validate: (value) =>
                          validateRequired(value, "Hộ khẩu thường trú") || true,
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <div>
                            Hộ khẩu thường trú:{" "}
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nhập địa chỉ"
                                className="inline-block w-64 h-6 text-sm"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-xs mt-1 ml-0" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personAPhone"
                      rules={{
                        validate: (value) => validatePhone(value) || true,
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <div>
                            Điện thoại:{" "}
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nhập số điện thoại"
                                className="inline-block w-40 h-6 text-sm"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-xs mt-1 ml-0" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personAEmail"
                      rules={{
                        validate: (value) => validateEmail(value) || true,
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <div>
                            Email:{" "}
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Nhập email"
                                className="inline-block w-48 h-6 text-sm"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-xs mt-1 ml-0" />
                        </FormItem>
                      )}
                    />
                    <div className="font-semibold pt-2">
                      BÊN THUÊ NHÀ (BÊN B):
                    </div>
                    <div>
                      Đại diện (Ông/Bà):{" "}
                      <span className="font-medium">
                        {contractDetail.B?.name || "—"}
                      </span>
                    </div>
                    <div>
                      Ngày sinh:{" "}
                      <span className="font-medium">
                        {contractDetail.B?.dob
                          ? formatDate(contractDetail.B.dob)
                          : "—"}
                      </span>
                    </div>
                    <div>
                      CCCD:{" "}
                      <span className="font-medium">
                        {contractDetail.B?.cccd || "—"}
                      </span>{" "}
                      Cấp ngày:{" "}
                      <span className="font-medium">
                        {contractDetail.B?.cccdIssuedDate
                          ? formatDate(contractDetail.B.cccdIssuedDate)
                          : "—"}
                      </span>
                      , Nơi cấp:{" "}
                      <span className="font-medium">
                        {contractDetail.B?.cccdIssuedPlace || "—"}
                      </span>
                    </div>
                    <div>
                      Hộ khẩu thường trú:{" "}
                      <span className="font-medium">
                        {contractDetail.B?.permanentAddress || "—"}
                      </span>
                    </div>
                    <div>
                      Điện thoại:{" "}
                      <span className="font-medium">
                        {contractDetail.B?.phone || "—"}
                      </span>
                    </div>
                    <div>
                      Email:{" "}
                      <span className="font-medium">
                        {contractDetail.B?.email || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contract Details Form */}
                <div className="space-y-4">
                  <div className="font-semibold">Thông tin hợp đồng</div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      rules={{
                        validate: (value) =>
                          validateNumber(value, "Giá thuê") || true,
                      }}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <Label>Giá thuê (VNĐ)</Label>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="Nhập giá thuê"
                              onChange={(e) => {
                                field.onChange(e);
                                // Cập nhật cảnh báo tiền cọc khi giá thuê thay đổi
                                const priceValue = parseFloat(e.target.value);
                                const depositValue = parseFloat(
                                  form.getValues("deposit")
                                );
                                if (
                                  !isNaN(priceValue) &&
                                  priceValue > 0 &&
                                  !isNaN(depositValue) &&
                                  depositValue > 0
                                ) {
                                  const ratio = depositValue / priceValue;
                                  if (ratio > 1) {
                                    setDepositWarning(
                                      "Tiền cọc đang cao hơn giá thuê. Vui lòng kiểm tra lại thỏa thuận giữa hai bên."
                                    );
                                  } else {
                                    setDepositWarning("");
                                  }
                                } else {
                                  setDepositWarning("");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deposit"
                      rules={{
                        validate: (value) => {
                          const error =
                            validateNumber(value, "Tiền cọc");
                          if (error) {
                            setDepositWarning("");
                            return error;
                          }

                          const priceValue = parseFloat(
                            form.getValues("price")
                          );
                          const depositValue = parseFloat(value);
                          if (
                            !isNaN(priceValue) &&
                            priceValue > 0 &&
                            !isNaN(depositValue) &&
                            depositValue > 0
                          ) {
                            const ratio = depositValue / priceValue;
                            if (ratio > 1) {
                              setDepositWarning(
                                "Tiền cọc đang cao hơn giá thuê. Vui lòng kiểm tra lại thỏa thuận giữa hai bên."
                              );
                            } else {
                              setDepositWarning("");
                            }
                          } else {
                            setDepositWarning("");
                          }

                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <Label>Tiền cọc (VNĐ)</Label>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="Nhập tiền cọc"
                            />
                          </FormControl>
                          <FormMessage />
                          {!form.formState.errors.deposit && depositWarning && (
                            <p className="text-xs text-amber-500 mt-1">
                              {depositWarning}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentCycleMonths"
                      rules={{
                        validate: (value) => {
                          const error = validateNumber(value, "Chu kỳ thanh toán");
                          if (error) return error;

                          const cycleValue = parseFloat(value);
                          if (cycleValue < 1) {
                            return "Chu kỳ thanh toán phải từ 1 tháng trở lên";
                          }

                          const startDate = form.getValues("startDate")?.trim();
                          const endDate = form.getValues("endDate")?.trim();

                          if (startDate && endDate) {
                            const totalMonths = calculateContractMonths(startDate, endDate);

                            if (totalMonths > 0 && cycleValue > totalMonths) {
                              setPaymentCycleWarning("");
                              return "Chu kỳ thanh toán không được vượt quá thời hạn hợp đồng";
                            }

                            if (totalMonths > 0 && totalMonths % cycleValue !== 0) {
                              setPaymentCycleWarning(
                                "Chu kỳ thanh toán không chia hết cho thời hạn hợp đồng, có thể phát sinh kỳ thanh toán lẻ."
                              );
                            } else {
                              setPaymentCycleWarning("");
                            }
                          } else {
                            setPaymentCycleWarning("");
                          }

                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <Label>Chu kỳ thanh toán (tháng)</Label>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="Nhập chu kỳ thanh toán"
                              min="1"
                            />
                          </FormControl>
                          <FormMessage />
                          {paymentCycleWarning && (
                            <p className="text-xs text-amber-500 mt-1">
                              {paymentCycleWarning}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startDate"
                      rules={{
                        validate: (value) => {
                          const requiredError = validateRequired(
                            value,
                            "Ngày bắt đầu"
                          );
                          if (requiredError) return requiredError;

                          const endDate = form.getValues("endDate");
                          // So sánh trực tiếp string date (YYYY-MM-DD) để tránh vấn đề timezone
                          if (value && endDate && value > endDate) {
                            return "Ngày bắt đầu không được sau ngày kết thúc";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <Label>Ngày bắt đầu</Label>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              onChange={(e) => {
                                field.onChange(e);
                                // Trigger validation cho cả 2 trường
                                setTimeout(() => {
                                  form.trigger("startDate");
                                  form.trigger("endDate");
                                  form.trigger("paymentCycleMonths");
                                }, 0);
                              }}
                              onBlur={() => {
                                field.onBlur();
                                form.trigger("endDate");
                                form.trigger("paymentCycleMonths");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      rules={{
                        validate: (value) => {
                          const requiredError = validateRequired(
                            value,
                            "Ngày kết thúc"
                          );
                          if (requiredError) return requiredError;

                          const startDate = form.getValues("startDate");
                          // So sánh trực tiếp string date (YYYY-MM-DD) để tránh vấn đề timezone
                          if (value && startDate && value < startDate) {
                            return "Ngày kết thúc không được trước ngày bắt đầu";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <Label>Ngày kết thúc</Label>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              onChange={(e) => {
                                field.onChange(e);
                                // Trigger validation cho cả 2 trường
                                setTimeout(() => {
                                  form.trigger("startDate");
                                  form.trigger("endDate");
                                  form.trigger("paymentCycleMonths");
                                }, 0);
                              }}
                              onBlur={() => {
                                field.onBlur();
                                form.trigger("startDate");
                                form.trigger("paymentCycleMonths");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
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
                    {sortedTerms.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">Nội dung điều khoản</div>
                        <div className="space-y-4 text-sm">
                          {sortedTerms.map((term, index) => {
                            const slateValue = termSlateValues[index];
                            // Use order as part of key to ensure consistency
                            const termKey = `term-${term.order}`;
                            return (
                              <div
                                key={termKey}
                                className="p-3 bg-slate-50 rounded-lg space-y-2"
                              >
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">
                                    Tên điều khoản
                                  </Label>
                                  <Input
                                    value={termNames[index] || term.name || ""}
                                    onChange={(e) => {
                                      setTermNames((prev) => ({
                                        ...prev,
                                        [index]: e.target.value,
                                      }));
                                    }}
                                    placeholder="Nhập tên điều khoản"
                                    className="h-8 text-sm font-medium"
                                  />
                                </div>
                                <div className="mt-1">
                                  {slateValue && termSlateValuesInitialized ? (
                                    <SlateEditor
                                      key={`${termKey}-editor-${term.description?.slice(0, 20) ||
                                        "empty"
                                        }`}
                                      value={slateValue}
                                      onChange={(value) => {
                                        setTermSlateValues((prev) => ({
                                          ...prev,
                                          [index]: value,
                                        }));
                                      }}
                                      placeholder="Nhập mô tả điều khoản..."
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center p-4 border border-input rounded-md bg-background">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {sortedRegulations.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold">Nội dung quy định</div>
                        <div className="space-y-4 text-sm">
                          {sortedRegulations.map((reg, index) => {
                            const slateValue = regulationSlateValues[index];
                            const regKey = `reg-${reg.order}`;
                            return (
                              <div
                                key={regKey}
                                className="p-3 bg-slate-50 rounded-lg space-y-2"
                              >
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">
                                    Tên quy định
                                  </Label>
                                  <Input
                                    value={
                                      regulationNames[index] || reg.title || ""
                                    }
                                    onChange={(e) => {
                                      setRegulationNames((prev) => ({
                                        ...prev,
                                        [index]: e.target.value,
                                      }));
                                    }}
                                    placeholder="Nhập tên quy định"
                                    className="h-8 text-sm font-medium"
                                  />
                                </div>
                                <div className="mt-1">
                                  {slateValue &&
                                    regulationSlateValuesInitialized ? (
                                    <SlateEditor
                                      key={`${regKey}-editor-${reg.description?.slice(0, 20) || "empty"
                                        }`}
                                      value={slateValue}
                                      onChange={(value) => {
                                        setRegulationSlateValues((prev) => ({
                                          ...prev,
                                          [index]: value,
                                        }));
                                      }}
                                      placeholder="Nhập mô tả quy định..."
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center p-4 border border-input rounded-md bg-background">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Landlord Signature */}
                {contractDetail.landlordSignatureUrl && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="font-semibold">Chữ ký chủ trọ</div>
                    <div className="flex justify-center">
                      <img
                        src={contractDetail.landlordSignatureUrl}
                        alt="Chữ ký chủ trọ"
                        className="max-w-full h-auto border rounded-lg p-2 bg-white"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                  </div>
                )}
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
