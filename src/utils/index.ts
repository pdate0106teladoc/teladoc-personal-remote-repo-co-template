import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import { emailRegex, ERROR_MESSAGES, phoneRegex } from "@/constants";
import { Bundle, GroupProductResponse, Product } from "@/types/GrpView";
import type { GeneralSettings } from "@/types/OrgView";
import { UserKey } from "@/types/user";
import { isAxiosError } from "axios";

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: string[];
}

/**
 * Pulls the user-facing error text out of a failed API call. Prefers the
 * `details` entries, falls back to the top-level `message`, then to `fallback`
 * (network errors and timeouts have no response body).
 */
export const getApiErrorMessage = (
  err: unknown,
  fallback: string = ERROR_MESSAGES.SOMETHINGS_WRONG,
): string => {
  if (!isAxiosError(err)) return fallback;
  const data = err.response?.data as ApiErrorResponse | undefined;
  const details = data?.details?.filter(
    (detail) => typeof detail === "string" && detail.trim(),
  );
  if (details?.length) return details.join(" ");
  return data?.message?.trim() || fallback;
};

export const USERS = {
  REQUESTER: "requester",
  ADMINISTRATOR: "admin",
  VIEWER: "viewer",
  QUALITY_REVIEWER: "quality_reviewer",
  CONFIGURATOR_MANAGER: "configurator_manager",
  CONFIGURATOR: "CONFIGURATOR",
  QUALITY_MANAGER: "quality_manager",
} as const;

export const USER_ROLES = (Object.keys(USERS) as UserKey[]).reduce(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as Record<UserKey, UserKey>
);
 
export const getUserRoles = (): UserKey[] => {
  try{
    const roles = localStorage.getItem("auth-storage");
    const userRoles: UserKey[] = JSON.parse(roles || "{}").state?.roles ?? [];
    return userRoles;
  }
  catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
};

const ROLE_PRIORITY: UserKey[] = [
  "ADMINISTRATOR",
  "CONFIGURATOR_MANAGER",
  "QUALITY_MANAGER",
  "QUALITY_REVIEWER",
  "CONFIGURATOR",
  "REQUESTER",
  "VIEWER",
];

export const getHighestPriorityRole = (roles: UserKey[]): UserKey => {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return roles[0];
};

export interface Opportunity {
  opportunityName: string;
  opportunityGuid: string;
  accountName: string;
  accountGuid: string;
  contractPath: string;
  contractingAccount: string;
  revenueEffectiveDate: string;
  type: string;
  subType: string;
  subTypeDetail: string;
  clientLineOfBusiness: string;
  organizationName: string;
}

export const phoneFormat = (phone: string): string => {
  if (!phone || typeof phone !== "string") return "-";
  let cleanNumber = phone.replace(/\D/g, "");
  if (!cleanNumber) return "-";
  if (cleanNumber.length < 10) cleanNumber = cleanNumber.padStart(10, "0");
  else if (cleanNumber.length > 10) cleanNumber = cleanNumber.slice(-10);
  return cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

export const formatNumberWithCommas = (num: number | string): string => {
  if (num === null || num === undefined || num === "") return "-";
  const number = typeof num === "number" ? num : parseFloat(num);
  if (isNaN(number)) return "-";
  return number.toLocaleString();
}

export const isValidURL = (url: string): boolean => {
  if (!url.trim()) return true;
  const urlPattern =
    /^https:\/\/([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  return urlPattern.test(url.trim());
};

export const getInitials = (name: string): string =>
  name
    ?.split(" ")
    ?.map((n) => n[0]?.toUpperCase())
    ?.join("")
    ?.slice(0, 2);

export const navigationItems = [
  { key: "organization", label: "Organization" },
  { key: "group", label: "Groups" },
  { key: "opportunity", label: "Opportunities" },
  { key: "contacts", label: "Contacts" },
];

export const getSafeString = (value?: string | number): string => {
  if (typeof value === "number") {
    return value.toString();
  } else if (typeof value === "string") {
    return value && value.trim() ? value : "-";
  }
  return "-";
};

export const getValueOrNoOverride = (value: any): string => {
  if (value === null || value === undefined) {
    return "No Override";
  }
  return value;
};

export const normalizeApprovalTicket = (value?: string): string => {
  const trimmedValue = value?.trim() ?? "";
  if (!trimmedValue || trimmedValue === "-") return "";

  const ticketPattern = /^[A-Za-z]+-\d+$/;

  try {
    const url = new URL(trimmedValue);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    const segment = url.pathname.split("/").filter(Boolean).pop() ?? "";
    return ticketPattern.test(segment) ? segment.toUpperCase() : "";
  } catch {
    const upper = trimmedValue.toUpperCase();
    return ticketPattern.test(upper) ? upper : "";
  }
};

export const extractImageSrc = (htmlString: string): string | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const imgElement = doc.querySelector("img");
  return imgElement ? imgElement.getAttribute("src") : null;
};
export const formatToMMDDYYYY = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";

    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  } catch (e) {
    return "Invalid Date";
  }
};

export const isExpiringWithinDays = (endDate: string | null | undefined, daysThreshold: number = 7): boolean => {
  if (!endDate) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (isNaN(end.getTime())) return false;

    const diffInMs = end.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays >= 0 && diffInDays <= daysThreshold;
  } catch (e) {
    return false;
  }
};

const isActive = (termDate?: string): boolean => {
  if (!termDate) return true;
  const today = new Date();
  const term = new Date(termDate);
  return term >= today;
};

function filterBundles(bundles: Bundle[] = [], wantActive: boolean): any {
  return bundles
    .map((bundle) => {
      const filteredChildBundles = filterBundles(bundle.bundles, wantActive);

      const filteredProducts = (bundle.products || []).filter((p) =>
        wantActive ? isActive(p.termDate) : !isActive(p.termDate),
      );

      if (filteredChildBundles.length || filteredProducts.length) {
        return {
          ...bundle,
          bundles: filteredChildBundles,
          products: filteredProducts,
        };
      }
      return null;
    })
    .filter((b): b is any => b !== null);
}

export function splitByActivity(data: GroupProductResponse): {
  active: GroupProductResponse;
  expired: GroupProductResponse;
} {
  const activeBundles = filterBundles(data.bundles, true);
  const expiredBundles = filterBundles(data.bundles, false);

  const activeStandalone = (data.standaloneProducts || []).filter((p) =>
    isActive(p.termDate),
  );
  const expiredStandalone = (data.standaloneProducts || []).filter(
    (p) => !isActive(p.termDate),
  );

  return {
    active: {
      bundles: activeBundles,
      standaloneProducts: activeStandalone,
    },
    expired: {
      bundles: expiredBundles,
      standaloneProducts: expiredStandalone,
    },
  };
}

export const filterBundlesProducts = (data: Bundle[], q: string) => {
  if (!data) return [];
  return data.filter((bundle) =>
    (bundle.bundleName ?? "").toLowerCase().includes(q),
  );
};

export const filterStandaaloneProducts = (data: Product[], q: string) => {
  if (!data) return [];
  return data.filter((product) =>
    (product.productName ?? "").toLowerCase().includes(q),
  );
};

export const toLocalDateOnly = (v?: string) => {
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const dt = new Date(v);
  if (Number.isNaN(dt.getTime())) return undefined;
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
};

const isNonEmpty = (v?: string | null) => !!v && String(v).trim() !== "";

export const hasAny = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;
export const dateRangeCount = (from?: string, to?: string) =>
  isNonEmpty(from) || isNonEmpty(to) ? 1 : 0;

const toDate = (v?: string | Date | null) => {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};
const toDateOnly = (d?: Date) =>
  d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : undefined;

export const inRangeSingle = (
  date?: string | Date,
  start?: string | Date | null,
  end?: string | Date | null,
) => {
  const dt = toDateOnly(toDate(date));
  const s = toDateOnly(toDate(start));
  const e = toDateOnly(toDate(end));
  if (!dt) return !(s || e);
  if (s && dt < s) return false;
  if (e && dt > e) return false;
  return true;
};

export const productMatchesFilters = (
  product: Product,
  filters: any,
): boolean => {
  const {
    membershipFilter,
    bundleTypeFilter,
    serviceCategoryFilter,
    minAgeFilter,
    fromEffectiveDateRange,
    toEffectiveDateRange,
    fromTermDateRange,
    toTermDateRange,
  } = filters || {};

  if (serviceCategoryFilter?.length) {
    if (!serviceCategoryFilter.includes(product.category)) return false;
  }
  if (bundleTypeFilter?.length) {
    if (bundleTypeFilter.includes(product.productTag)) return true;
    else return false;
  }
  if (membershipFilter?.length && product.membershipFeeType) {
    if (!membershipFilter.includes(product.membershipFeeType)) return false;
  }
  if (
    minAgeFilter !== undefined &&
    minAgeFilter !== null &&
    String(minAgeFilter).trim() !== ""
  ) {
    const minAgeNum = Number(minAgeFilter);
    if (!Number.isNaN(minAgeNum) && typeof product.age === "number") {
      if (product.age < minAgeNum) return false;
    }
  }
  if (
    !inRangeSingle(
      product.effectiveDate,
      fromEffectiveDateRange || null,
      toEffectiveDateRange || null,
    )
  )
    return false;

  if (
    !inRangeSingle(
      product.termDate,
      fromTermDateRange || null,
      toTermDateRange || null,
    )
  )
    return false;
  return true;
};

export const buildVisitFeesText = (member: any, client: any) => {
  const parts: string[] = [];
  const hasMember = member !== null && member !== undefined && member !== "";
  const hasClient = client !== null && client !== undefined && client !== "";
  if (hasMember) parts.push(`${extractDisplayValue(member, "currency").raw} Member`);
  if (hasClient) parts.push(`${extractDisplayValue(client, "currency").raw} Client`);
  if (!parts.length) return null;
  return parts.join(" | ");
};

export const formatDateUTC = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = date.getUTCDate();
  let hour = date.getUTCHours();
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  const minute = date.getUTCMinutes();
  return `${month} ${day}, ${year} at ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm} UTC`;
};

export const formatUTCToEST = (utcDateString: string | null | undefined, yearNeeded?: boolean): string => {
  if (!utcDateString) return "";

  const date = new Date(utcDateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(date);
  const month = parts.find(p => p.type === "month")?.value ?? "";
  const day = parts.find(p => p.type === "day")?.value ?? "";
  const year = parts.find(p => p.type === "year")?.value ?? "";
  const hour = parts.find(p => p.type === "hour")?.value ?? "";
  const minute = parts.find(p => p.type === "minute")?.value ?? "";
  const dayPeriod = parts.find(p => p.type === "dayPeriod")?.value ?? "";
  return `${month} ${day}${yearNeeded ? `, ${year}` : ""} at ${hour}:${minute} ${dayPeriod}`;
};

export const formatUTCtoDateOnly = (utcDateString: string | null | undefined, withTime: boolean = false, withoutUTCText: boolean = false): string => {
  if (!utcDateString) return "-";

  const date = new Date(utcDateString);
  if (isNaN(date.getTime())) {
    return "-";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: withTime ? "numeric" : undefined,
    minute: withTime ? "2-digit" : undefined,
    hour12: withTime ? true : undefined,
    timeZone: "UTC",
  });

  const parts = formatter.formatToParts(date);
  const month = parts.find(p => p.type === "month")?.value ?? "";
  const day = parts.find(p => p.type === "day")?.value ?? "";
  const year = parts.find(p => p.type === "year")?.value ?? "";
  if (withTime && !withoutUTCText) {
    const hour = parts.find(p => p.type === "hour")?.value ?? "";
    const minute = parts.find(p => p.type === "minute")?.value ?? "";
    const dayPeriod = parts.find(p => p.type === "dayPeriod")?.value ?? "";
    return `${month} ${day}, ${year}, ${hour}:${minute} ${dayPeriod} UTC`;
  }
  if (withoutUTCText) {
    const hour = parts.find(p => p.type === "hour")?.value ?? "";
    const minute = parts.find(p => p.type === "minute")?.value ?? "";
    const dayPeriod = parts.find(p => p.type === "dayPeriod")?.value ?? "";
    return `${month} ${day}, ${year}, ${hour}:${minute} ${dayPeriod}`;
  }
  return `${month} ${day}, ${year}`;
};

export const formatFileSize = (sizeInBytes: number | string | null | undefined): string => {
  const bytes = Number(sizeInBytes);
  if (!bytes || Number.isNaN(bytes) || bytes < 0) return "—";

  const units = ["KB", "MB", "GB", "TB", "PB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

// Function to convert current time to UTC and calculate difference in minutes
export const getTimeDiffInMinutes = (lastUpdatedAt: string | Date): number => {
  const updated =
    lastUpdatedAt instanceof Date
      ? lastUpdatedAt.getTime()
      : new Date(lastUpdatedAt).getTime();
  if (isNaN(updated)) {
    throw new Error("Invalid lastUpdatedAt time");
  }
  const now = Date.now();

  const diffMinutes = (now - updated) / (1000 * 60);
  return Math.floor(diffMinutes);
};

export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1).toLowerCase();
}

export type FormatRelativeTimeOptions = {
  /** When true, returns "" instead of "0 mins ago" (e.g. auto-save: show "Saved" only). */
  omitZeroMinutes?: boolean;
};

export const formatRelativeTime = (
  dateString: string | null | undefined,
  options?: FormatRelativeTimeOptions,
  dateTimeNeeded: boolean = true
): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 hour ago
  if (diffMins < 60) {
    if (options?.omitZeroMinutes && diffMins === 0) {
      return "";
    }
    return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
  }

  // Less than 24 hours ago
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`;
  }

  // Yesterday
  if (diffDays === 1) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    if(!dateTimeNeeded){
      return "Yesterday";
    }
    return `Yesterday, ${displayHours}:${displayMinutes} ${ampm}`;
  }

  if (!dateTimeNeeded) {
    return `${diffDays} days ago`;
  }

  // More than 1 day ago - show full date with time
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${month}/${day}/${year}, ${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Checks whether `email` matches the app’s email regex.
 *
 * @param email - Raw email string (not trimmed by this helper).
 * @returns `true` if the pattern matches, otherwise `false`.
 *
 * @example
 * // Input:  "user@example.com"
 * // Output: true
 *
 * @example
 * // Input:  "not-an-email"
 * // Output: false
 */
export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

/**
 * Validates a US-style phone: non-digits are stripped before checking length/pattern.
 * Empty string is treated as valid (optional field).
 *
 * @param phone - Phone string, e.g. `(555) 123-4567` or `5551234567`.
 * @returns `true` if empty or if exactly 10 digits after stripping; otherwise `false`.
 *
 * @example
 * // Input:  ""
 * // Output: true
 *
 * @example
 * // Input:  "(555) 123-4567"
 * // Output: true   // digits → 5551234567
 */
export const validatePhone = (phone: string): boolean => {
  // Allow empty or valid phone numbers (10 digits)
  if (!phone) return true;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

/**
 * Triggers a browser download of `content` as `fileName` using a temporary `<a download>`.
 *
 * @param fileName - Suggested filename for the saved file (including extension).
 * @param content - File body (often CSV text or decoded binary-as-string, depending on caller).
 * @param contentType - Blob MIME type; defaults to CSV charset.
 *
 * @example
 * // Input:
 * //   fileName = "export.csv"
 * //   content  = "id,name\\n1,Acme"
 * //   contentType = "text/csv;charset=utf-8;"
 * // Effect: user’s browser downloads one file named `export.csv` with those bytes.
 */
export function downloadFile(
  fileName: string,
  content: string,
  contentType: string = "text/csv;charset=utf-8;",
) {
  const element = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  window.URL.revokeObjectURL(element.href);
}

const MIME_TYPE_MAP: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv;charset=utf-8;",
};

export function downloadBase64File(filename: string, base64Content: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = MIME_TYPE_MAP[ext] ?? "application/octet-stream";
  const decoded = atob(base64Content);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  const element = document.createElement("a");
  element.href = URL.createObjectURL(blob);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  window.URL.revokeObjectURL(element.href);
}

/**
 * Formats a date-ish value for display in local time: `"Mon D, YYYY"` (month short name).
 *
 * @param value - ISO string, timestamp number, or other `Date`-parseable input.
 * @returns Human-readable date, or `"-"` if empty, null-ish, or unparseable.
 *
 * @example
 * // Input:  "2024-06-15T12:00:00.000Z"  (interpreted in local TZ)
 * // Output: "Jun 15, 2024"              (exact string depends on locale/month)
 *
 * @example
 * // Input:  ""  or invalid
 * // Output: "-"
 */
export const formatDateLocal = (value: string | number): string => {
  if (
    value === "" ||
    value === null ||
    isNaN(new Date(value).getTime())
  ) {
    return "-";
  }
  const date = new Date(value);
  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", {
    month: "short",
  });
  const day = date.getDate();
  return `${month} ${day}, ${year}`;
};

/**
 * Encodes a storage key and byte size as a single string for APIs that expect `name:size`.
 *
 * @param storageName - File / blob identifier (without trailing `:size` unless that is part of the id).
 * @param sizeBytes - Non-negative size; callers that pass `0` usually skip encoding and send `storageName` only.
 * @returns `"${storageName}:${sizeBytes}"`.
 *
 * @example
 * // Input: storageName = "reports/Q1.pdf", sizeBytes = 1024
 * // Output: "reports/Q1.pdf:1024"
 */
export function encodeFileLinkWithSize(
  storageName: string,
  sizeBytes: number,
): string {
  return `${storageName}:${sizeBytes}`;
}

const UPLOAD_TIMESTAMP_SUFFIX = /_\d{14}$/;

export function removeTrailingTimestamp(filename: string): string {
  if (!filename) return filename;
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return filename.replace(UPLOAD_TIMESTAMP_SUFFIX, "");
  }

  const name = filename.slice(0, lastDotIndex);
  const ext = filename.slice(lastDotIndex + 1);
  const withoutTs = name.replace(UPLOAD_TIMESTAMP_SUFFIX, "");
  const displayBase = withoutTs.length > 0 ? withoutTs : name;
  return `${displayBase}.${ext}`;
}

export const isDateInPast = (dateToCheck: string | undefined): boolean => {
  if (!dateToCheck) return false;
  const planned = new Date(dateToCheck);
  if (isNaN(planned.getTime())) return false;
  const now = new Date();
  const nowUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  const DateUTC = new Date(Date.UTC(
    planned.getUTCFullYear(),
    planned.getUTCMonth(),
    planned.getUTCDate(),
  ));
  return DateUTC < nowUTC;
};

/**
 * Parses a string file-link entry: either a bare path or `path:12345` where `12345` is digits (bytes).
 *
 * @param entry - Raw string from API or user state.
 * @returns `{ storageName, sizeBytes }` — if no valid `:digits` suffix, the whole string is `storageName` and size is `0`.
 *
 * @example
 * // Input:  "folder/doc.pdf"
 * // Output: { storageName: "folder/doc.pdf", sizeBytes: 0 }
 *
 * @example
 * // Input:  "folder/doc.pdf:2048"
 * // Output: { storageName: "folder/doc.pdf", sizeBytes: 2048 }
 */
export function parseFileLinkEntry(entry: string): {
  storageName: string;
  sizeBytes: number;
} {
  const lastColon = entry.lastIndexOf(":");
  if (lastColon === -1) {
    return { storageName: entry, sizeBytes: 0 };
  }
  const sizePart = entry.slice(lastColon + 1);
  if (/^\d+$/.test(sizePart)) {
    return {
      storageName: entry.slice(0, lastColon),
      sizeBytes: Number(sizePart),
    };
  }
  return { storageName: entry, sizeBytes: 0 };
}

export type FileLinkItem =
  | string
  | { name: string; sizeBytes?: number };

/**
 * Normalizes API / UI file-link items to `{ storageName, sizeBytes }`.
 * Strings use {@link parseFileLinkEntry}; objects prefer explicit `sizeBytes` when set.
 *
 * @param entry - `string` or `{ name, sizeBytes? }`.
 * @returns Parsed storage name and size (invalid objects → `{ storageName: "", sizeBytes: 0 }`).
 *
 * @example
 * // Input:  { name: "a.png:100", sizeBytes: 200 }
 * // (`sizeBytes` on the object wins over suffix parsed from `name`)
 * // Output: { storageName: "a.png", sizeBytes: 200 }
 *
 * @example
 * // Input:  { name: "a.png:100" }
 * // Output: { storageName: "a.png", sizeBytes: 100 }
 */
export function normalizeFileLinkEntry(entry: FileLinkItem): {
  storageName: string;
  sizeBytes: number;
} {
  if (typeof entry === "string") {
    return parseFileLinkEntry(entry);
  }
  if (
    entry &&
    typeof entry === "object" &&
    typeof entry.name === "string"
  ) {
    const parsed = parseFileLinkEntry(entry.name);
    const fromPayload =
      typeof entry.sizeBytes === "number" && Number.isFinite(entry.sizeBytes)
        ? entry.sizeBytes
        : parsed.sizeBytes;
    return { storageName: parsed.storageName, sizeBytes: fromPayload };
  }
  return { storageName: "", sizeBytes: 0 };
}

/**
 * Maps mixed `fileLink` list entries to the string shape expected by PATCH / upload state.
 *
 * - **String** entries are returned unchanged (caller already has the wire format).
 * - **Object** entries are normalized; if `sizeBytes > 0`, result is {@link encodeFileLinkWithSize};
 *   otherwise only `storageName` is returned.
 *
 * @param items - `undefined` / `null` / `[]` → empty array.
 * @returns Homogeneous `string[]` for payloads.
 *
 * @example
 * // Input `items`:
 * // [
 * //   "legacy/as-is.pdf",
 * //   { name: "new/upload.bin", sizeBytes: 4096 },
 * //   { name: "no-size.txt" },
 * // ]
 * //
 * // Output:
 * // [
 * //   "legacy/as-is.pdf",
 * //   "new/upload.bin:4096",
 * //   "no-size.txt",
 * // ]
 */
export function fileLinkItemsToEncodedStrings(
  items: FileLinkItem[] | undefined | null,
): string[] {
  if (!items?.length) return [];
  return items.map((entry) => {
    if (typeof entry === "string") return entry;
    const { storageName, sizeBytes } = normalizeFileLinkEntry(entry);
    if (sizeBytes > 0) return encodeFileLinkWithSize(storageName, sizeBytes);
    return storageName;
  });
};

/**
 * Flattens a metadata API tree into a flat map: each leaf `{ value, ... }` becomes
 * one entry keyed by its full dot path (same shape as UI `fieldKey`).
 *
 * @param meta - Nested metadata from `client-configurations/metadata/...` (or a subtree).
 * @param parentPath - For internal recursion only; callers omit.
 * @returns Dot-path keys → each leaf’s `value`.
 *
 * @example
 * // Input `meta`:
 * // {
 * //   overview: {
 * //     billingOverView: {
 * //       paymentTerms: { value: "Net 30", editable: true, uiComponentType: "text" },
 * //     },
 * //   },
 * // }
 * //
 * // Output:
 * // {
 * //   "overview.billingOverView.paymentTerms": "Net 30",
 * // }
 */
export const extractFormData = (
  meta: any,
  parentPath = "",
): Record<string, any> => {
  const result: Record<string, any> = {};

  Object.entries(meta ?? {}).forEach(([key, value]: [string, any]) => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (value && typeof value === "object" && "value" in value) {
      // Metadata leaf node (field descriptor) → preserve full dot path key.
      result[currentPath] = value.value;
      return;
    }

    if (value && typeof value === "object") {
      Object.assign(result, extractFormData(value, currentPath));
    }
  });

  return result;
};

export const getNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

export const getOrgConfigFromGeneralSettings = (
  generalSettings?: GeneralSettings | null,
  updatedAt?: string,
) => ({
  orgName: generalSettings?.overview?.accountOverview?.organizationName || "",
  orgId: generalSettings?.overview?.accountOverview?.organizationId || "",
  updatedAt: updatedAt ?? generalSettings?.updatedAt ?? "",
});

/**
 * Builds flat form keys from live entity data using metadata as the field path guide.
 * Used when remounting an edit page so in-progress changes survive navigation.
 */
export const extractFormDataFromEntity = (
  entity: any,
  meta: any,
  parentPath = "",
): Record<string, any> => {
  const result: Record<string, any> = {};

  Object.entries(meta ?? {}).forEach(([key, value]: [string, any]) => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (value && typeof value === "object" && "value" in value) {
      result[currentPath] = getNestedValue(entity, currentPath);
      return;
    }

    if (value && typeof value === "object") {
      Object.assign(result, extractFormDataFromEntity(entity, value, currentPath));
    }
  });

  return result;
};

/**
 * Converts a metadata-shaped payload (each leaf is `{value, dataType, ...}`) into
 * the underlying data shape by recursively unwrapping leaves and preserving
 * arrays / nested objects. Used to seed the live entity store from the metadata
 * endpoint in edit mode, so the draft state survives a page refresh.
 */
export const extractEntityData = (meta: any): any => {
  if (meta === null || meta === undefined) return meta;

  if (Array.isArray(meta)) {
    return meta.map((item) => extractEntityData(item));
  }

  if (typeof meta === "object") {
    if ("value" in meta && "dataType" in meta) {
      return meta.value;
    }
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(meta)) {
      result[key] = extractEntityData(val);
    }
    return result;
  }

  return meta;
};

function assignDeepPath(target: any, pathParts: string[], value: any): void {
  if (pathParts.length === 1) {
    target[pathParts[0]] = value;
    return;
  }
  const [head, ...rest] = pathParts;
  const next = rest[0];
  if (/^\d+$/.test(next)) {
    const idx = parseInt(next, 10);
    if (!Array.isArray(target[head])) target[head] = [];
    while (target[head].length <= idx) target[head].push(undefined);
    if (rest.length === 1) {
      target[head][idx] = value;
      return;
    }
    const restAfter = rest.slice(1);
    const firstInner = restAfter[0];
    if (target[head][idx] == null) {
      target[head][idx] = /^\d+$/.test(firstInner) ? [] : {};
    }
    assignDeepPath(target[head][idx], restAfter, value);
    return;
  }
  if (target[head] == null || typeof target[head] !== "object") {
    target[head] = {};
  }
  assignDeepPath(target[head], rest, value);
}

function rowFlatToNested(rowFlat: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(rowFlat)) {
    assignDeepPath(result, k.split("."), v);
  }
  return result;
}

/**
 * Rebuilds one array from flat keys like `root.0.field` → `[{ field: ... }, ...]`.
 *
 * @param flat - Flat form map (dot keys).
 * @param arrayRootPath - Prefix before the index, e.g. `"widgets"` for keys `widgets.0.name`.
 * @returns Dense array for that root, or `undefined` if nothing to build.
 *
 * @example
 * // Input `flat`:
 * // {
 * //   "widgets.0.id": "w1",
 * //   "widgets.0.label": "Alpha",
 * //   "widgets.1.id": "w2",
 * //   "widgets.1.label": "Beta",
 * // }
 * // `arrayRootPath`: "widgets"
 * //
 * // Output:
 * // [
 * //   { id: "w1", label: "Alpha" },
 * //   { id: "w2", label: "Beta" },
 * // ]
 */
export function buildArrayFromFlatFormData(
  flat: Record<string, any>,
  arrayRootPath: string,
): any[] | undefined {
  const prefix = `${arrayRootPath}.`;
  const keys = Object.keys(flat).filter(
    (k) => k === arrayRootPath || k.startsWith(prefix),
  );
  if (keys.length === 0) return undefined;

  if (keys.length === 1 && keys[0] === arrayRootPath) {
    const v = flat[arrayRootPath];
    return Array.isArray(v) ? [...v] : undefined;
  }

  const indices = new Set<number>();
  for (const k of keys) {
    if (k === arrayRootPath) continue;
    const rest = k.slice(prefix.length);
    const first = rest.split(".")[0];
    if (/^\d+$/.test(first)) indices.add(parseInt(first, 10));
  }
  if (indices.size === 0) return undefined;

  const maxIdx = Math.max(...indices);
  const arr: any[] = [];
  for (let i = 0; i <= maxIdx; i++) {
    const rowPrefix = `${arrayRootPath}.${i}`;
    const rowFlat: Record<string, any> = {};
    for (const [k, v] of Object.entries(flat)) {
      if (k.startsWith(`${rowPrefix}.`)) {
        rowFlat[k.slice(rowPrefix.length + 1)] = v;
      }
    }
    if (Object.keys(rowFlat).length > 0) {
      arr[i] = rowFlatToNested(rowFlat);
    } else if (Object.prototype.hasOwnProperty.call(flat, rowPrefix)) {
      arr[i] = flat[rowPrefix];
    } else {
      arr[i] = undefined;
    }
  }
  return arr;
}

/**
 * Diff of two flat form maps → nested PATCH-style object. Scalar paths emit only
 * changed leaves; if any key under `root.N.*` changes, the whole `root` array is sent.
 *
 * @param formData - Current flat values (dot keys).
 * @param originalData - Baseline flat values (same keys).
 * @returns Nested object with only changes (full arrays when any index under that root changed).
 *
 * @example Scalar path only
 * // formData:    { "invoice.name": "Acme", "invoice.id": "1" }
 * // originalData:{ "invoice.name": "Acme LLC", "invoice.id": "1" }
 * // Output:
 * // { invoice: { name: "Acme" } }
 *
 * @example Array path — one cell changed → full array from current formData
 * // formData:    { "rows.0.code": "A", "rows.1.code": "Z" }
 * // originalData:{ "rows.0.code": "A", "rows.1.code": "B" }
 * // Output:
 * // { rows: [ { code: "A" }, { code: "Z" } ] }
 */
export const buildChangedPayload = (
  formData: Record<string, any>,
  originalData: Record<string, any>,
): Record<string, any> => {
  const changedKeys = Object.keys(formData).filter(
    (fieldKey) => formData[fieldKey] !== originalData[fieldKey],
  );

  const arrayRoots = new Set<string>();
  for (const fieldKey of changedKeys) {
    const parts = fieldKey.split(".");
    const idx = parts.findIndex((p) => /^\d+$/.test(p));
    if (idx >= 0) {
      arrayRoots.add(parts.slice(0, idx).join("."));
    }
  }

  const payload: Record<string, any> = {};

  // Scalar / object paths: no array index in the key
  for (const fieldKey of changedKeys) {
    const parts = fieldKey.split(".");
    if (parts.findIndex((p) => /^\d+$/.test(p)) >= 0) continue;

    const keys = fieldKey.split(".");
    let current = payload;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = formData[fieldKey];
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    });
  }

  // Any change under `arrayRoot.*` → send full array at `arrayRoot`
  let merged: Record<string, any> = payload;
  for (const root of arrayRoots) {
    const fullArray = buildArrayFromFlatFormData(formData, root);
    if (fullArray !== undefined) {
      merged = setNestedValue(merged, root, fullArray);
    }
  }

  return merged;
};

const ARRAY_ID_FIELD_MAP: Record<string, string> = {
  accountRelationships: "accountRelationshipName",
  groupRelationShips: "memberGroupName",
};

const BRACKET_KEY_REGEX = /^([^[]+)\[([^\]]+)\]\.(.+)$/;

export const buildRejectedReviewArrayPayload = (
  formData: Record<string, any>,
  originalData: Record<string, any>,
  liveEntityData?: Record<string, any>,
  pageKey?: string,
): Record<string, any> => {
  const changedKeys = Object.keys(formData).filter(
    (key) => formData[key] !== originalData[key],
  );

  if (changedKeys.length === 0) return {};

  const scalarFormData: Record<string, any> = {};
  const scalarOriginalData: Record<string, any> = {};
  const arrayChanges = new Map<string, Map<string, Record<string, any>>>();

  for (const key of changedKeys) {
    const match = key.match(BRACKET_KEY_REGEX);
    if (match) {
      const [, arrayRoot, comparisonId, fieldName] = match;
      if (!arrayChanges.has(arrayRoot)) arrayChanges.set(arrayRoot, new Map());
      const itemMap = arrayChanges.get(arrayRoot)!;
      if (!itemMap.has(comparisonId)) itemMap.set(comparisonId, {});
      itemMap.get(comparisonId)![fieldName] = formData[key];
    } else {
      scalarFormData[key] = formData[key];
      scalarOriginalData[key] = originalData[key];
    }
  }

  const payload =
    Object.keys(scalarFormData).length > 0
      ? buildChangedPayload(scalarFormData, scalarOriginalData)
      : {};

  const entityPage = pageKey ? liveEntityData?.[pageKey] : undefined;

  for (const [arrayRoot, itemMap] of arrayChanges) {
    const idField = ARRAY_ID_FIELD_MAP[arrayRoot] ?? "id";
    const fullArray = entityPage?.[arrayRoot];

    if (Array.isArray(fullArray)) {
      payload[arrayRoot] = fullArray.map((item: any) => {
        const corrections = itemMap.get(item[idField]);
        return corrections ? { ...item, ...corrections } : { ...item };
      });
    } else {
      const items: Record<string, any>[] = [];
      for (const [comparisonId, fields] of itemMap) {
        items.push({ [idField]: comparisonId, ...fields });
      }
      payload[arrayRoot] = items;
    }
  }

  return payload;
};

/**
 * Immutable deep-set on a plain object: `path` is dot-separated; returns a new root.
 * (Numeric path segments are object keys, not array indices.)
 *
 * @param obj - Starting object (shallow-cloned along the path).
 * @param path - Dot path, e.g. `"settings.theme"`.
 * @param value - Value to write at the leaf.
 * @returns New object with `value` at `path`; other branches copied shallowly.
 *
 * @example
 * // Input `obj`: { existing: 1 }
 * // `path`: "a.b", `value`: 2
 * //
 * // Output:
 * // { existing: 1, a: { b: 2 } }
 */
export const setNestedValue = (
  obj: Record<string, any>,
  path: string,
  value: any,
): Record<string, any> => {
  const keys = parsePath(path);
  const result: any = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: any = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const child = current[k];
    current[k] = Array.isArray(child) ? [...child] : { ...child };
    current = current[k];
  }

  current[keys[keys.length - 1]] = value;
  return result;
};

const parsePath = (path: string): (string | number)[] => {
  const keys: (string | number)[] = [];
  for (const segment of path.split(".")) {
    const bracketMatch = segment.match(/^([^[]+)\[(\d+)\]$/);
    if (bracketMatch) {
      keys.push(bracketMatch[1]);
      keys.push(Number(bracketMatch[2]));
    } else {
      keys.push(segment);
    }
  }
  return keys;
};

export const buildFilterQuery = (filters: Record<string, string | string[]>): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => { if (v) params.append(key, v); });
    } else if (value) {
      params.append(key, value);
    }
  });
  return params.toString();
};

export const STATE_OPTIONS = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "District of Columbia", value: "DC" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Guam", value: "GU" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Puerto Rico", value: "PR" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" },
];
export const CONFIG_READ_PERMISSIONS = [
    "config:co-po:read",
    "config:group:read",
    "config:opportunity:read",
    "config:org:read",
    "config:product:read",
]
