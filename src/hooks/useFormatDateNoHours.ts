import { useCallback } from "react";

/**
 * Custom hook để format ngày theo locale "vi-VN"
 * @example
 * const formatDate = useFormatDate();
 * formatDate("2025-10-10T12:30:00Z"); // "10/10/2025, 19:30"
 */
export const useFormatDateNoHours = () => {
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  return formatDate;
};
