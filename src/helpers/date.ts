/**
 * Converts ISO 8601 date string to YYYY-MM-DD format for HTML date input
 * @param isoDateString - ISO 8601 date string (e.g., "2025-11-16T00:00:00.000Z")
 * @returns Formatted date string in YYYY-MM-DD format, or empty string if invalid
 */
export const formatDateForInput = (isoDateString: string | null | undefined): string => {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return "";
    // Get year, month, day and format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

