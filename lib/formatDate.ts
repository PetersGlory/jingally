/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string
 * @param format - Format type ('short' | 'long' | 'time' | 'full')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: 'short' | 'long' | 'time' | 'full' = 'short'): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  // For dates within the last 24 hours
  if (diffInDays === 0) {
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffInMinutes < 1) {
        return 'Just now';
      }
      return `${diffInMinutes} min ago`;
    }
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  // For dates within the last 7 days
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  // Format based on the specified format type
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).replace(/-/g, '/');
    
    case 'long':
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).replace(/-/g, '/');
    
    case 'time':
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    
    case 'full':
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/-/g, '/');
    
    default:
      return date.toLocaleDateString('en-GB').replace(/-/g, '/');
  }
};

/**
 * Formats a date range into a human-readable format
 * @param startDate - Start date ISO string
 * @param endDate - End date ISO string
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid date range';
  }

  const startFormatted = start.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  }).replace(/-/g, '/');

  const endFormatted = end.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace(/-/g, '/');

  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Formats a date into a time-ago format
 * @param dateString - ISO date string
 * @returns Time ago string
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};
