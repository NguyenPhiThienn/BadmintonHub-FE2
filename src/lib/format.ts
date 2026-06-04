export const formatDateWithTime = (dateString: string | Date): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return typeof dateString === 'string' ? dateString : "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatDateOnly = (dateString: string | Date): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return typeof dateString === 'string' ? dateString : "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Format booking date and time from details array
export const formatBookingPlayTime = (details: { bookingDate: string; startTime: string; endTime: string }[]): string => {
  if (!details || details.length === 0) return "";

  // Get the first slot for display
  const firstSlot = details[0];
  const date = formatDateOnly(firstSlot.bookingDate);
  const time = `${firstSlot.startTime} - ${firstSlot.endTime}`;

  // If multiple slots, show count
  if (details.length > 1) {
    return `${date} ${time} (+${details.length - 1} slot)`;
  }

  return `${date} ${time}`;
};
