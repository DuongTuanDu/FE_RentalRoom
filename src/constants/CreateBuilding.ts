import * as z from "zod";

export const createBuildingSchema = z.object({
  name: z
    .string()
    .min(1, "Tên hộ nhà không được để trống")
    .max(100, "Tên hộ nhà không được quá 100 ký tự"),
  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(200, "Địa chỉ không được quá 200 ký tự"),
  eIndexType: z.enum(["byNumber", "byPerson", "included"]),
  ePrice: z.coerce.number().min(0, "Giá điện phải lớn hơn hoặc bằng 0"),
  wIndexType: z.enum(["byNumber", "byPerson", "included"]),
  wPrice: z.coerce.number().min(0, "Giá nước phải lớn hơn hoặc bằng 0"),
  description: z.string().optional(),
});

export type CreateBuildingFormValues = z.infer<typeof createBuildingSchema>;
