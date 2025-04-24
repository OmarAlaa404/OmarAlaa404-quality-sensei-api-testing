import { format, parseISO } from 'date-fns';

/**
 * Format a date string to a human-readable format
 * @param dateString - Date string in ISO format or any format parseISO can handle
 * @param formatStr - Date-fns format string (default: 'MMM d, yyyy')
 * @returns Formatted date string or empty string if date is invalid
 */
export function formatDate(dateString?: string | null, formatStr = 'MMM d, yyyy'): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Invalid date format:', error);
    return '';
  }
}
