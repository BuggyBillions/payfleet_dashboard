export const formatterUtility = (amount: number, noSign = false) => {
  if (amount === null || amount === undefined) {
    return '';
  }
  const sign = noSign ? "" : "₦";
  return `${sign}${amount.toLocaleString("en-NG")}`
};

export const formatCompactAmount = (amount: number, noSign = false) => {
  if (amount === null || amount === undefined) {
    return '';
  }

  const absAmount = Math.abs(amount);

  if (absAmount < 1_000_000) {
    return formatterUtility(amount, noSign);
  }

  const SI_SUFFIXES = [
    { value: 1E6, symbol: "M" }, // 1,000,000
    { value: 1E9, symbol: "B" }, // 1,000,000,000
    { value: 1E12, symbol: "T" }, // 1,000,000,000,000
  ];

  const tier = SI_SUFFIXES.filter(t => absAmount >= t.value).pop();

  if (!tier) {
    return formatterUtility(amount);
  }

  const scaledValue = absAmount / tier.value;

  const formatted = parseFloat(scaledValue.toFixed(2)).toString();

  const sign = amount < 0 ? '-' : '';

  return `${sign}${formatted}${tier.symbol}`;
};

export const formatISODateToCustom = (isoString: string) => {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  let hours: string | number = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? String(hours).padStart(2, '0') : '12';

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}${ampm}`;
};

export function formatUnderScores(input?: string | null, capitalize = false) {
  if (!input) return "";

  let formatted = input.replace(/_/g, ' ');

  if (capitalize) {
    formatted = formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return formatted;
}

export const getDateDifference = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInMs = Number(end) - Number(start);

  if (diffInMs < 0) {
    return "Start date is after end date";
  }

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
  } else {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }
};

export function formatPrettyDate(dateString: string) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
      day % 10 === 2 && day !== 12 ? "nd" :
        day % 10 === 3 && day !== 13 ? "rd" :
          "th";

  return `${day}${suffix} ${month}, ${year}`;
}

/**
 * Formats a given date string into "Month (abbreviated) Day, Year".
 * e.g., "November 6, 2025" -> "Nov 6, 2025"
 * 
 * @param {string | Date} dateInput - The input date string (e.g., "2025-11-06") or Date object.
 * @returns {string} The formatted date string, or an error message if invalid.
 */
export const formatShortDate = (dateInput: string | Date) => {
  // Try parsing the input. The Date constructor can handle most standard formats.
  const dateObj = new Date(dateInput);

  // Check if the date object is valid (handles invalid input strings)
  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date input provided to formatShortDate:", dateInput);
    return "Invalid Date";
  }

  // Use Intl.DateTimeFormat for reliable and localized formatting
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short', // 'short' gives "Nov", "Dec", etc.
    day: 'numeric', // 'numeric' gives "6", "15", etc.
  };

  // Format the date using a specific locale (e.g., 'en-US' or 'en-GB')
  // 'en-US' naturally produces the "Month Day, Year" order
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateObj);

  // The output of Intl.DateTimeFormat is typically "Nov 6, 2025"
  return formattedDate;
};

/**
 * Formats a date string or Date object into localized "Month Day, Year, hh:mm AM/PM"
 * e.g., "2026-09-26T07:09:19Z" -> "Sep 26, 2026, 08:09 AM"
 */
export const formatDateTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "—";
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return String(dateInput);

  return dateObj.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function getFormattedDate() {
  const now = new Date();

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  return now.toLocaleDateString("en-US", options);
}

export const formatNumberWithCommas = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";
  // Remove existing commas first to ensure clean parsing
  const raw = String(value).replace(/,/g, "");
  const number = Number(raw);
  if (isNaN(number)) return String(value);
  return number.toLocaleString("en-US");
};

export const unformatNumber = (value: string | number): number => {
  if (value === null || value === undefined || value === "") return 0;
  const raw = String(value).replace(/,/g, "");
  const number = Number(raw);
  return isNaN(number) ? 0 : number;
};

export const getPercentOfMax = (
  values: Array<number | string>,
  value: number | string,
): number => {
  const parsedValues = values
    .map((item) => Number(String(item).replace(/[^\d.-]/g, "")))
    .filter((item) => Number.isFinite(item));

  const max = parsedValues.length > 0 ? Math.max(...parsedValues) : 0;
  const current = Number(String(value).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(current) || max <= 0) {
    return 0;
  }

  const percent = (current / max) * 100;
  return Math.min(100, Math.max(0, percent));
};

export function getInitials(firstName: string, lastName: string) {
  return firstName.trim()[0].toUpperCase() + lastName.trim()[0].toUpperCase();
}

/**
 * Resolve a human readable name for the signed-in user returned by `/me`.
 * The API does not guarantee a single field, so every known variant is tried
 * in order before falling back. An empty string is returned when nothing is
 * available and the caller supplies its own label.
 */
export const getUserDisplayName = (
  user?: Record<string, unknown> | null,
): string => {
  if (!user) return "";

  const clean = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";

  const fullName = clean(user.full_name);
  if (fullName) return fullName;

  const name = clean(user.name);
  if (name) return name;

  const parts = [clean(user.first_name), clean(user.last_name)]
    .filter(Boolean)
    .join(" ");
  if (parts) return parts;

  const companyName = clean(user.company_name);
  if (companyName) return companyName;

  const details = user.company_details;
  const companyDetailName =
    details && typeof details === "object"
      ? clean((details as Record<string, unknown>).name)
      : "";
  if (companyDetailName) return companyDetailName;

  const username = clean(user.username);
  if (username) return username;

  const email = clean(user.email);
  if (email) return email.split("@")[0];

  return "";
};

export const formatISODateToYYYYMMDD = (isoString: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string provided to formatISODateToYYYYMMDD:", isoString);
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    const amPm = Number(hour) >= 12 ? "PM" : "AM";
    return `${year}-${month}-${day} ${hour}:${minute}:${second} ${amPm}`;
  } catch (error) {
    console.error("Error formatting date to YYYY-MM-DD:", error);
    return "";
  }
};

export const getAvatarInitials = (name: string) => {
  if (!name) return "PF";
  const parts = name.replace("#", "").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};