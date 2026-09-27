import React, { useState } from "react";

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

export interface CompanyLogoAvatarProps {
  name?: string | null;
  logo?: string | null;
  avatar?: string | null;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  textClassName?: string;
  alt?: string;
}

/**
 * Reusable Avatar & Company Logo component that displays the company/profile
 * logo if available (and valid), with automatic fallback to name initials upon error or absence.
 */
export const CompanyLogoAvatar: React.FC<CompanyLogoAvatarProps> = ({
  name,
  logo,
  avatar,
  className = "w-9 h-9 sm:w-10 sm:h-10 rounded-xl",
  imgClassName = "w-full h-full object-cover",
  fallbackClassName = "w-full h-full bg-primary/15 dark:bg-primary/25 text-primary dark:text-emerald-400 flex items-center justify-center font-bold",
  textClassName = "text-xs font-bold",
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getCompanyLogoUrl(logo || avatar);

  if (logoUrl && !hasError) {
    return (
      <div className={`${className} overflow-hidden shrink-0 flex items-center justify-center bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10`}>
        <img
          src={logoUrl}
          alt={alt || name || "Company Logo"}
          onError={() => setHasError(true)}
          className={imgClassName}
        />
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden shrink-0`}>
      <div className={`${fallbackClassName} ${textClassName}`}>
        {getAvatarInitials(name)}
      </div>
    </div>
  );
};

export default CompanyLogoAvatar;
