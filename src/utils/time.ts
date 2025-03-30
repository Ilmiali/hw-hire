import moment from 'moment';

/**
 * Formats a date into a human-readable time ago string
 * @param date The date to format
 * @returns Formatted string in the following format:
 * - Less than 1 hour: "Xmin ago"
 * - Less than 24 hours: "Xh ago"
 * - Yesterday: "Yesterday HH:mm"
 * - Less than a week: "Day HH:mm"
 * - More than a week: "Month D"
 */
export function formatTimeAgo(date: Date): string {
  const now = moment();
  const targetDate = moment(date);
  const diffDays = now.diff(targetDate, 'days');
  const diffHours = now.diff(targetDate, 'hours');
  const diffMinutes = now.diff(targetDate, 'minutes');

  if (diffMinutes < 60) {
    return `${diffMinutes}min ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return `Yesterday ${targetDate.format('HH:mm')}`;
  } else if (diffDays < 7) {
    return targetDate.format('dddd HH:mm');
  } else {
    return targetDate.format('MMMM D');
  }
} 