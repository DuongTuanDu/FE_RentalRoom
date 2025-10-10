import { useCallback } from "react";

/**
 * Custom hook để format giá theo định dạng VNĐ
 * @example
 * const formatPrice = useFormatPrice();
 * formatPrice(150000); // "150.000 ₫"
 */
export const useFormatPrice = () => {
  const formatPrice = useCallback((price: number) => {
    if (price == null || isNaN(price)) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []);

  return formatPrice;
};
