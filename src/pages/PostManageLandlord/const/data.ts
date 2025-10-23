export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "hidden", label: "Ẩn" },
  { value: "expired", label: "Hết hạn" },
];

export const STATUS_LABELS = {
  active: "Hoạt động",
  hidden: "Ẩn", 
  expired: "Hết hạn",
} as const;

export const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 hover:bg-green-200",
  hidden: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  expired: "bg-red-100 text-red-800 hover:bg-red-200",
} as const;
