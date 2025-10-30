export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "available", label: "Còn trống" },
  { value: "rented", label: "Đã thuê" },
];

export const STATUS_COLORS = {
  available:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rented: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  maintenance:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export const STATUS_LABELS = {
  available: "Còn trống",
  rented: "Đã thuê",
  maintenance: "Bảo trì",
};
