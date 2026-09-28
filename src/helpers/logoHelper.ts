/**
 * Normalizes any company logo or avatar path into a full loadable URL.
 * Handles absolute HTTP/HTTPS URLs, data/blob URIs, and backend storage paths.
 */
export const getCompanyLogoUrl = (logo?: string | null): string | null => {
  if (!logo || typeof logo !== "string" || !logo.trim()) return null;
  const trimmed = logo.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/storage/")) {
    return `https://api.payfleet.com.ng${trimmed}`;
  }
  if (trimmed.startsWith("storage/")) {
    return `https://api.payfleet.com.ng/${trimmed}`;
  }
  return `https://api.payfleet.com.ng/storage/${trimmed}`;
};

/**
 * Extracts 1-2 letter uppercase initials from a person or company name.
 */
export const getAvatarInitials = (name?: string | null): string => {
  if (!name || typeof name !== "string" || !name.trim()) return "PF";
  const parts = name.replace("#", "").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
