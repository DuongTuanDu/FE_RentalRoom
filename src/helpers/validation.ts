/**
 * Validation helper functions for form fields
 */

/**
 * Validates contract number - must be numeric only
 */
export const validateContractNo = (value: string): string | null => {
  if (!value || value.trim() === "") {
    return "Số hợp đồng không được để trống";
  }
  if (!/^\d+$/.test(value)) {
    return "Số hợp đồng chỉ được chứa số";
  }
  return null;
};

/**
 * Validates CCCD - must be exactly 12 digits
 */
export const validateCCCD = (value: string): string | null => {
  if (!value || value.trim() === "") {
    return "Số CCCD không được để trống";
  }
  if (!/^\d+$/.test(value)) {
    return "Số CCCD chỉ được chứa số";
  }
  if (value.length !== 12) {
    return "Số CCCD phải có đúng 12 ký tự";
  }
  return null;
};

/**
 * Validates phone number - must be exactly 10 digits
 */
export const validatePhone = (value: string): string | null => {
  if (!value || value.trim() === "") {
    return "Số điện thoại không được để trống";
  }

  if (!/^\d+$/.test(value)) {
    return "Số điện thoại chỉ được chứa số";
  }

  if (value.length !== 10) {
    return "Số điện thoại phải có đúng 10 ký tự";
  }

  if (!value.startsWith("0")) {
    return "Số điện thoại phải bắt đầu bằng số 0";
  }

  return null;
};

/**
 * Validates email format
 */
export const validateEmail = (value: string): string | null => {
  if (!value || value.trim() === "") {
    return "Email không được để trống";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Email không đúng định dạng";
  }
  return null;
};

/**
 * Validates required field
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} không được để trống`;
  }
  return null;
};

/**
 * Validates number field
 */
export const validateNumber = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} không được để trống`;
  }
  if (isNaN(Number(value)) || Number(value) <= 0) {
    return `${fieldName} phải là số hợp lệ và lớn hơn 0`;
  }
  return null;
};

