/**
 * Maps base URL keys to their corresponding environment variable values
 * Used for constructing API URLs from metadata allowedValues
 */
export const getBaseUrlFromKey = (key: string): string => {
  const urlMap: Record<string, string> = {
    search: import.meta.env.VITE_SEARCH_BASE_URL || "",
    api: import.meta.env.VITE_API_URL || "",
    rbac: import.meta.env.VITE_RBAC_API_URL || "",
    rules: import.meta.env.VITE_RULES_URL || "",
    edit: import.meta.env.VITE_EDIT_URL || "",
    task: import.meta.env.VITE_TASK_URL || "",
    worklog: import.meta.env.VITE_WORKLOG_URL || "",
    bff: import.meta.env.VITE_BFF_URL || "",
  };

  return urlMap[key.toLowerCase()] || "";
};

/**
 * Constructs the full API URL from metadata allowedValues
 * @param allowedValues Array with [baseUrlKey, pathWithParams]
 * @param searchTerm The search term to replace in the URL template
 * @returns Full constructed URL
 */
export const constructLookupUrl = (
  allowedValues: string[] | null | undefined,
  searchTerm: string,
  prodOrgId: string,
  prodGroupId: string
): string => {
  if (!allowedValues || allowedValues.length < 2) {
    return "";
  }

  const [baseUrlKey, pathTemplate] = allowedValues;
  const baseUrl = getBaseUrlFromKey(baseUrlKey);

  if (!baseUrl) {
    console.warn(`Base URL not found for key: ${baseUrlKey}`);
    return "";
  }

  const path = pathTemplate
    .replace("{searchTerm}", encodeURIComponent(searchTerm))
    .replace("{prodOrgId}", encodeURIComponent(prodOrgId))
    .replace("{prodGroupId}", encodeURIComponent(prodGroupId));
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${cleanBaseUrl}${path}`;
};
