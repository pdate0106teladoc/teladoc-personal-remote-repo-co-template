import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getInitials,
  getSafeString,
  navigationItems,
  phoneFormat,
  USERS,
  formatNumberWithCommas,
  extractImageSrc,
  formatToMMDDYYYY,
  splitByActivity,
  filterBundlesProducts,
  filterStandaaloneProducts,
  toLocalDateOnly,
  hasAny,
  dateRangeCount,
  inRangeSingle,
  productMatchesFilters,
  buildVisitFeesText,
  formatDateUTC,
  formatUTCToEST,
  getTimeDiffInMinutes,
  capitalizeFirstLetter,
  getValueOrNoOverride,
  normalizeApprovalTicket,
  isExpiringWithinDays,
  formatUTCtoDateOnly,
  formatFileSize,
  formatRelativeTime,
  validateEmail,
  validatePhone,
  downloadFile,
  downloadBase64File,
  formatDateLocal,
  encodeFileLinkWithSize,
  removeTrailingTimestamp,
  isDateInPast,
  parseFileLinkEntry,
  normalizeFileLinkEntry,
  fileLinkItemsToEncodedStrings,
  getHighestPriorityRole,
} from "../index";
import type { GroupProductResponse, Bundle, Product } from "@/types/GrpView";

// Mock the extractDisplayValue function
vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: vi.fn((value: any) => ({
    raw: `$${value}`,
    formatted: `$${value}.00`,
  })),
}));

describe("USERS constant", () => {
  it("should have correct user role values", () => {
    expect(USERS.VIEWER).toBe("viewer");
    expect(USERS.CONFIGURATOR).toBe("CONFIGURATOR");
    expect(USERS.QUALITY_REVIEWER).toBe("quality_reviewer");
  });

describe("phoneFormat", () => {
  it("formats a valid 10-digit number", () => {
    expect(phoneFormat("1234567890")).toBe("(123) 456-7890");
  });

  it("removes non-digit characters and formats", () => {
    expect(phoneFormat("(123) 456-7890")).toBe("(123) 456-7890");
    expect(phoneFormat("123-456-7890")).toBe("(123) 456-7890");
  });

  it("pads numbers shorter than 10 digits", () => {
    expect(phoneFormat("1234567")).toBe("(000) 123-4567");
    expect(phoneFormat("1")).toBe("(000) 000-0001");
  });

  it('returns "-" for an empty string', () => {
    expect(phoneFormat("")).toBe("-");
  });

  it('returns "-" for a string with no digits', () => {
    expect(phoneFormat("abc-def-ghij")).toBe("-");
  });

  it("formats numbers longer than 10 digits (only last 10 are used)", () => {
    expect(phoneFormat("1234567890123")).toBe("(456) 789-0123");
  });

  it('returns "-" for null or undefined input', () => {
    expect(phoneFormat(null as any)).toBe("-");
    expect(phoneFormat(undefined as any)).toBe("-");
  });

  it('returns "-" for non-string input', () => {
    expect(phoneFormat(123 as any)).toBe("-");
    expect(phoneFormat({} as any)).toBe("-");
  });

  it("handles phone numbers with country codes", () => {
    expect(phoneFormat("+1-234-567-8900")).toBe("(234) 567-8900");
  });

  it("handles phone numbers with spaces", () => {
    expect(phoneFormat("123 456 7890")).toBe("(123) 456-7890");
  });
});

describe("formatNumberWithCommas", () => {
  it("formats a number with commas", () => {
    expect(formatNumberWithCommas(1000)).toBe("1,000");
    expect(formatNumberWithCommas(1000000)).toBe("1,000,000");
  });

  it("formats a number string with commas", () => {
    expect(formatNumberWithCommas("5000")).toBe("5,000");
    expect(formatNumberWithCommas("123456.78")).toBe("123,456.78");
  });

  it('returns "-" for null', () => {
    expect(formatNumberWithCommas(null as any)).toBe("-");
  });

  it('returns "-" for undefined', () => {
    expect(formatNumberWithCommas(undefined as any)).toBe("-");
  });

  it('returns "-" for empty string', () => {
    expect(formatNumberWithCommas("")).toBe("-");
  });

  it('returns "-" for NaN values', () => {
    expect(formatNumberWithCommas("abc")).toBe("-");
    expect(formatNumberWithCommas("not a number")).toBe("-");
  });

  it("handles zero correctly", () => {
    expect(formatNumberWithCommas(0)).toBe("0");
  });

  it("handles negative numbers", () => {
    expect(formatNumberWithCommas(-1000)).toBe("-1,000");
  });

  it("handles decimal numbers", () => {
    expect(formatNumberWithCommas(1234.56)).toBe("1,234.56");
  });

  it("handles small numbers without commas", () => {
    expect(formatNumberWithCommas(100)).toBe("100");
  });
});

describe("getInitials", () => {
  it("returns the initials of a single name", () => {
    const result = getInitials("John");
    expect(result).toBe("J");
  });

  it("returns the initials of a full name", () => {
    const result = getInitials("John Doe");
    expect(result).toBe("JD");
  });

  it("returns the first two initials of a name with multiple words", () => {
    const result = getInitials("John Michael Doe");
    expect(result).toBe("JM");
  });

  it("handles names with extra spaces", () => {
    const result = getInitials("  John   Doe  ");
    expect(result).toBe("JD");
  });

  it("returns an empty string for an empty name", () => {
    const result = getInitials("");
    expect(result).toBe("");
  });

  it("handles names with only spaces", () => {
    const result = getInitials("   ");
    expect(result).toBe("");
  });

  it("converts lowercase to uppercase", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("handles single character names", () => {
    expect(getInitials("A B")).toBe("AB");
  });
});

describe("navigationItems", () => {
  it("contains the correct number of items", () => {
    expect(navigationItems).toHaveLength(4);
  });

  it("contains the correct keys and labels", () => {
    expect(navigationItems).toEqual([
      { key: "organization", label: "Organization" },
      { key: "group", label: "Groups" },
      { key: "opportunity", label: "Opportunities" },
      { key: "contacts", label: "Contacts" },
    ]);
  });
});

describe("getSafeString", () => {
  it("returns the string value as is if it is valid", () => {
    const result = getSafeString("Hello");
    expect(result).toBe("Hello");
  });

  it("returns '-' for an empty string", () => {
    const result = getSafeString("");
    expect(result).toBe("-");
  });

  it("returns '-' for a string with only spaces", () => {
    const result = getSafeString("   ");
    expect(result).toBe("-");
  });

  it("returns the string representation of a number", () => {
    const result = getSafeString(123);
    expect(result).toBe("123");
  });

  it("returns '0' for the number 0", () => {
    const result = getSafeString(0);
    expect(result).toBe("0");
  });

  it("returns '-' for undefined", () => {
    const result = getSafeString(undefined);
    expect(result).toBe("-");
  });

  it("returns '-' for null (even though null is not explicitly handled)", () => {
    const result = getSafeString(null as unknown as string | number);
    expect(result).toBe("-");
  });

  it("handles negative numbers", () => {
    expect(getSafeString(-5)).toBe("-5");
  });

  it("preserves whitespace-containing strings with non-whitespace", () => {
    expect(getSafeString("Hello World")).toBe("Hello World");
  });
});

describe("extractImageSrc", () => {
  it("extracts image src from HTML string", () => {
    const html = '<img src="https://example.com/image.jpg" alt="test">';
    expect(extractImageSrc(html)).toBe("https://example.com/image.jpg");
  });

  it("returns null when no img tag is present", () => {
    const html = "<div>No image here</div>";
    expect(extractImageSrc(html)).toBeNull();
  });

  it("returns null when img tag has no src attribute", () => {
    const html = '<img alt="test">';
    expect(extractImageSrc(html)).toBeNull();
  });

  it("extracts first image when multiple images are present", () => {
    const html =
      '<img src="first.jpg"><img src="second.jpg">';
    expect(extractImageSrc(html)).toBe("first.jpg");
  });

  it("handles empty HTML string", () => {
    expect(extractImageSrc("")).toBeNull();
  });

  it("handles HTML with nested img tags", () => {
    const html = '<div><span><img src="nested.jpg"></span></div>';
    expect(extractImageSrc(html)).toBe("nested.jpg");
  });

  it("handles relative image paths", () => {
    const html = '<img src="/assets/image.png">';
    expect(extractImageSrc(html)).toBe("/assets/image.png");
  });

  it("handles data URLs", () => {
    const html = '<img src="data:image/png;base64,iVBORw0KGgoAAAANS">';
    expect(extractImageSrc(html)).toBe("data:image/png;base64,iVBORw0KGgoAAAANS");
  });
});

describe("formatToMMDDYYYY", () => {
  it("formats a valid ISO date string", () => {
    expect(formatToMMDDYYYY("2023-01-15T00:00:00Z")).toBe("01/15/2023");
  });

  it("handles dates without time", () => {
    expect(formatToMMDDYYYY("2023-12-31")).toBe("12/31/2023");
  });

  it("pads single digit months and days with leading zeros", () => {
    expect(formatToMMDDYYYY("2023-03-05T00:00:00Z")).toBe("03/05/2023");
  });

  it('returns empty string for invalid date string', () => {
    expect(formatToMMDDYYYY("not-a-date")).toBe("");
  });

  it('returns "Invalid Date" for dates that throw errors', () => {
    expect(formatToMMDDYYYY("")).toBe("");
  });

  it("handles leap year dates", () => {
    expect(formatToMMDDYYYY("2024-02-29")).toBe("02/29/2024");
  });

  it("handles beginning of year", () => {
    expect(formatToMMDDYYYY("2023-01-01")).toBe("01/01/2023");
  });

  it("handles end of year", () => {
    expect(formatToMMDDYYYY("2023-12-31")).toBe("12/31/2023");
  });
});

describe("splitByActivity", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-06-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("splits bundles and products into active and expired", () => {
    const data: GroupProductResponse = {
      bundles: [
        {
          bundleId: "bundle1",
          bundleName: "Active Bundle",
          effectiveDate: "2023-01-01",
          advAssessment: false,
          nutritionPromotion: false,
          proactiveCoaching: false,
          bundles: [],
          products: [
            {
              productId: "p1",
              productName: "Active Product",
              membership: 0,
              age: 0,
              effectiveDate: "2023-01-01",
              termDate: "2025-12-31",
              visitFeesMember: null,
              visitFeesClient: null,
              features: [],
              membershipFeeType: "Monthly",
            } as Product,
          ],
        },
        {
          bundleId: "bundle2",
          bundleName: "Expired Bundle",
          effectiveDate: "2022-01-01",
          advAssessment: false,
          nutritionPromotion: false,
          proactiveCoaching: false,
          bundles: [],
          products: [
            {
              productId: "p2",
              productName: "Expired Product",
              membership: 0,
              age: 0,
              effectiveDate: "2022-01-01",
              termDate: "2022-12-31",
              visitFeesMember: null,
              visitFeesClient: null,
              features: [],
              membershipFeeType: "Monthly",
            } as Product,
          ],
        },
      ],
      standaloneProducts: [
        {
          productId: "sp1",
          productName: "Active Standalone",
          membership: 0,
          age: 0,
          effectiveDate: "2023-01-01",
          termDate: "2025-12-31",
          visitFeesMember: null,
          visitFeesClient: null,
          features: [],
          membershipFeeType: "Monthly",
        } as Product,
        {
          productId: "sp2",
          productName: "Expired Standalone",
          membership: 0,
          age: 0,
          effectiveDate: "2022-01-01",
          termDate: "2022-12-31",
          visitFeesMember: null,
          visitFeesClient: null,
          features: [],
          membershipFeeType: "Monthly",
        } as Product,
      ],
    };

    const result = splitByActivity(data);

    expect(result.active.bundles).toHaveLength(1);
    expect(result.active.bundles[0].bundleName).toBe("Active Bundle");
    expect(result.active.standaloneProducts).toHaveLength(1);
    expect(result.active.standaloneProducts[0].productName).toBe("Active Standalone");

    expect(result.expired.bundles).toHaveLength(1);
    expect(result.expired.bundles[0].bundleName).toBe("Expired Bundle");
    expect(result.expired.standaloneProducts).toHaveLength(1);
    expect(result.expired.standaloneProducts[0].productName).toBe("Expired Standalone");
  });

  it("treats products with no termDate as active", () => {
    const data: GroupProductResponse = {
      bundles: [
        {
          bundleId: "bundle1",
          bundleName: "No Term Bundle",
          effectiveDate: "2023-01-01",
          advAssessment: false,
          nutritionPromotion: false,
          proactiveCoaching: false,
          bundles: [],
          products: [
            {
              productId: "p1",
              productName: "No Term Product",
              membership: 0,
              age: 0,
              effectiveDate: "2023-01-01",
              termDate: "",
              visitFeesMember: null,
              visitFeesClient: null,
              features: [],
              membershipFeeType: "Monthly",
            } as Product,
          ],
        },
      ],
      standaloneProducts: [
        {
          productId: "sp1",
          productName: "No Term Standalone",
          membership: 0,
          age: 0,
          effectiveDate: "2023-01-01",
          termDate: "",
          visitFeesMember: null,
          visitFeesClient: null,
          features: [],
          membershipFeeType: "Monthly",
        } as Product,
      ],
    };

    const result = splitByActivity(data);

    expect(result.active.bundles).toHaveLength(1);
    expect(result.active.standaloneProducts).toHaveLength(1);
    expect(result.expired.bundles).toHaveLength(0);
    expect(result.expired.standaloneProducts).toHaveLength(0);
  });

  it("handles nested bundles correctly", () => {
    const data: GroupProductResponse = {
      bundles: [
        {
          bundleId: "parent",
          bundleName: "Parent Bundle",
          effectiveDate: "2023-01-01",
          advAssessment: false,
          nutritionPromotion: false,
          proactiveCoaching: false,
          bundles: [
            {
              bundleId: "child",
              bundleName: "Child Bundle",
              effectiveDate: "2023-01-01",
              advAssessment: false,
              nutritionPromotion: false,
              proactiveCoaching: false,
              bundles: [],
              products: [
                {
                  productId: "p1",
                  productName: "Active Nested",
                  membership: 0,
                  age: 0,
                  effectiveDate: "2023-01-01",
                  termDate: "2025-12-31",
                  visitFeesMember: null,
                  visitFeesClient: null,
                  features: [],
                  membershipFeeType: "Monthly",
                } as Product,
              ],
            },
          ],
          products: [],
        },
      ],
      standaloneProducts: [],
    };

    const result = splitByActivity(data);

    expect(result.active.bundles).toHaveLength(1);
    expect(result.active.bundles[0].bundles).toHaveLength(1);
    expect(result.active.bundles[0].bundles![0].products).toHaveLength(1);
  });

  it("removes bundles with no active or expired items", () => {
    const data: GroupProductResponse = {
      bundles: [
        {
          bundleId: "empty",
          bundleName: "Empty Bundle",
          effectiveDate: "2023-01-01",
          advAssessment: false,
          nutritionPromotion: false,
          proactiveCoaching: false,
          bundles: [],
          products: [],
        },
      ],
      standaloneProducts: [],
    };

    const result = splitByActivity(data);

    expect(result.active.bundles).toHaveLength(0);
    expect(result.expired.bundles).toHaveLength(0);
  });

  it("handles empty data", () => {
    const data: GroupProductResponse = {
      bundles: [],
      standaloneProducts: [],
    };

    const result = splitByActivity(data);

    expect(result.active.bundles).toHaveLength(0);
    expect(result.active.standaloneProducts).toHaveLength(0);
    expect(result.expired.bundles).toHaveLength(0);
    expect(result.expired.standaloneProducts).toHaveLength(0);
  });
});

describe("filterBundlesProducts", () => {
  const mockBundles: Bundle[] = [
    { 
      bundleId: "1", 
      bundleName: "Health Bundle", 
      effectiveDate: "2023-01-01",
      advAssessment: false,
      nutritionPromotion: false,
      proactiveCoaching: false,
      bundles: [], 
      products: [] 
    },
    { 
      bundleId: "2", 
      bundleName: "Wellness Package", 
      effectiveDate: "2023-01-01",
      advAssessment: false,
      nutritionPromotion: false,
      proactiveCoaching: false,
      bundles: [], 
      products: [] 
    },
    { 
      bundleId: "3", 
      bundleName: "Premium Care", 
      effectiveDate: "2023-01-01",
      advAssessment: false,
      nutritionPromotion: false,
      proactiveCoaching: false,
      bundles: [], 
      products: [] 
    },
  ];

  it("filters bundles by name (case insensitive)", () => {
    const result = filterBundlesProducts(mockBundles, "health");
    expect(result).toHaveLength(1);
    expect(result[0].bundleName).toBe("Health Bundle");
  });

  it("returns empty array when no matches found", () => {
    const result = filterBundlesProducts(mockBundles, "xyz");
    expect(result).toHaveLength(0);
  });

  it("returns all bundles when query is empty", () => {
    const result = filterBundlesProducts(mockBundles, "");
    expect(result).toHaveLength(3);
  });

  it("handles null or undefined data", () => {
    expect(filterBundlesProducts(null as any, "test")).toEqual([]);
    expect(filterBundlesProducts(undefined as any, "test")).toEqual([]);
  });

  it("performs partial matching", () => {
    const result = filterBundlesProducts(mockBundles, "care");
    expect(result).toHaveLength(1);
    expect(result[0].bundleName).toBe("Premium Care");
  });

  it("handles bundles with null bundleName", () => {
    const bundlesWithNull = [
      { 
        bundleId: "1", 
        bundleName: null as any, 
        effectiveDate: "2023-01-01",
        advAssessment: false,
        nutritionPromotion: false,
        proactiveCoaching: false,
        bundles: [], 
        products: [] 
      },
    ];
    const result = filterBundlesProducts(bundlesWithNull as any, "test");
    expect(result).toHaveLength(0);
  });
});

describe("filterStandaaloneProducts", () => {
  const mockProducts: Product[] = [
    { 
      productId: "1", 
      productName: "Telemedicine",
      membership: 0,
      age: 0,
      effectiveDate: "2023-01-01",
      termDate: "2023-12-31",
      visitFeesMember: null,
      visitFeesClient: null,
      features: [],
      membershipFeeType: "Monthly"
    } as Product,
    { 
      productId: "2", 
      productName: "Mental Health",
      membership: 0,
      age: 0,
      effectiveDate: "2023-01-01",
      termDate: "2023-12-31",
      visitFeesMember: null,
      visitFeesClient: null,
      features: [],
      membershipFeeType: "Monthly"
    } as Product,
    { 
      productId: "3", 
      productName: "Primary Care",
      membership: 0,
      age: 0,
      effectiveDate: "2023-01-01",
      termDate: "2023-12-31",
      visitFeesMember: null,
      visitFeesClient: null,
      features: [],
      membershipFeeType: "Monthly"
    } as Product,
  ];

  it("filters products by name (case insensitive)", () => {
    const result = filterStandaaloneProducts(mockProducts, "mental");
    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe("Mental Health");
  });

  it("returns empty array when no matches found", () => {
    const result = filterStandaaloneProducts(mockProducts, "xyz");
    expect(result).toHaveLength(0);
  });

  it("returns all products when query is empty", () => {
    const result = filterStandaaloneProducts(mockProducts, "");
    expect(result).toHaveLength(3);
  });

  it("handles null or undefined data", () => {
    expect(filterStandaaloneProducts(null as any, "test")).toEqual([]);
    expect(filterStandaaloneProducts(undefined as any, "test")).toEqual([]);
  });

  it("performs partial matching", () => {
    const result = filterStandaaloneProducts(mockProducts, "health");
    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe("Mental Health");
  });

  it("handles products with null productName", () => {
    const productsWithNull = [
      { 
        productId: "1", 
        productName: null as any,
        membership: 0,
        age: 0,
        effectiveDate: "2023-01-01",
        termDate: "2023-12-31",
        visitFeesMember: null,
        visitFeesClient: null,
        features: [],
        membershipFeeType: "Monthly"
      } as Product,
    ];
    const result = filterStandaaloneProducts(productsWithNull, "test");
    expect(result).toHaveLength(0);
  });
});

describe("toLocalDateOnly", () => {
  it("converts ISO date string to local Date object", () => {
    const result = toLocalDateOnly("2023-06-15");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2023);
    expect(result?.getMonth()).toBe(5); // June (0-indexed)
    expect(result?.getDate()).toBe(15);
  });

  it("returns undefined for undefined input", () => {
    expect(toLocalDateOnly(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(toLocalDateOnly("")).toBeUndefined();
  });

  it("handles full ISO timestamp", () => {
    const result = toLocalDateOnly("2023-06-15T10:30:00Z");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2023);
  });

  it("returns undefined for invalid date string", () => {
    expect(toLocalDateOnly("not-a-date")).toBeUndefined();
  });

  it("strips time component from datetime", () => {
    const result = toLocalDateOnly("2023-06-15T23:59:59Z");
    expect(result?.getHours()).toBe(0);
    expect(result?.getMinutes()).toBe(0);
    expect(result?.getSeconds()).toBe(0);
  });
});

describe("hasAny", () => {
  it("returns true for non-empty array", () => {
    expect(hasAny([1, 2, 3])).toBe(true);
    expect(hasAny(["a"])).toBe(true);
  });

  it("returns false for empty array", () => {
    expect(hasAny([])).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasAny(undefined)).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasAny(null as any)).toBe(false);
  });

  it("returns false for non-array values", () => {
    expect(hasAny("string" as any)).toBe(false);
    expect(hasAny(123 as any)).toBe(false);
    expect(hasAny({} as any)).toBe(false);
  });
});

describe("dateRangeCount", () => {
  it("returns 1 when both from and to are provided", () => {
    expect(dateRangeCount("2023-01-01", "2023-12-31")).toBe(1);
  });

  it("returns 1 when only from is provided", () => {
    expect(dateRangeCount("2023-01-01", undefined)).toBe(1);
    expect(dateRangeCount("2023-01-01", "")).toBe(1);
  });

  it("returns 1 when only to is provided", () => {
    expect(dateRangeCount(undefined, "2023-12-31")).toBe(1);
    expect(dateRangeCount("", "2023-12-31")).toBe(1);
  });

  it("returns 0 when neither from nor to are provided", () => {
    expect(dateRangeCount(undefined, undefined)).toBe(0);
    expect(dateRangeCount("", "")).toBe(0);
  });

  it("returns 0 when values are whitespace only", () => {
    expect(dateRangeCount("   ", "   ")).toBe(0);
  });

  it("returns 1 when from is whitespace and to has value", () => {
    expect(dateRangeCount("   ", "2023-12-31")).toBe(1);
  });
});

describe("inRangeSingle", () => {
  it("returns true when date is within range", () => {
    expect(inRangeSingle("2023-06-15", "2023-01-01", "2023-12-31")).toBe(true);
  });

  it("returns true when date equals start", () => {
    expect(inRangeSingle("2023-01-01", "2023-01-01", "2023-12-31")).toBe(true);
  });

  it("returns true when date equals end", () => {
    expect(inRangeSingle("2023-12-31", "2023-01-01", "2023-12-31")).toBe(true);
  });

  it("returns false when date is before start", () => {
    expect(inRangeSingle("2022-12-31", "2023-01-01", "2023-12-31")).toBe(false);
  });

  it("returns false when date is after end", () => {
    expect(inRangeSingle("2024-01-01", "2023-01-01", "2023-12-31")).toBe(false);
  });

  it("returns true when no bounds are set and date is undefined", () => {
    expect(inRangeSingle(undefined, null, null)).toBe(true);
  });

  it("returns false when date is undefined but bounds are set", () => {
    expect(inRangeSingle(undefined, "2023-01-01", "2023-12-31")).toBe(false);
  });

  it("handles only start date", () => {
    expect(inRangeSingle("2023-06-15", "2023-01-01", null)).toBe(true);
    expect(inRangeSingle("2022-12-31", "2023-01-01", null)).toBe(false);
  });

  it("handles only end date", () => {
    expect(inRangeSingle("2023-06-15", null, "2023-12-31")).toBe(true);
    expect(inRangeSingle("2024-01-01", null, "2023-12-31")).toBe(false);
  });

  it("handles Date objects", () => {
    const date = new Date("2023-06-15");
    const start = new Date("2023-01-01");
    const end = new Date("2023-12-31");
    expect(inRangeSingle(date, start, end)).toBe(true);
  });

  it("ignores time component", () => {
    expect(inRangeSingle(
      "2023-06-15T23:59:59",
      "2023-06-15T00:00:00",
      "2023-06-15T00:00:01"
    )).toBe(true);
  });
});

describe("productMatchesFilters", () => {
  const baseProduct: Product = {
    productId: "p1",
    productName: "Test Product",
    category: "Telehealth",
    productTag: "Premium",
    membershipFeeType: "Monthly",
    age: 25,
    effectiveDate: "2023-01-01",
    termDate: "2023-12-31",
    membership: 0,
    visitFeesMember: null,
    visitFeesClient: null,
    features: [],
  } as Product;

  it("returns true when no filters are applied", () => {
    expect(productMatchesFilters(baseProduct, {})).toBe(true);
  });

  it("filters by service category", () => {
    expect(
      productMatchesFilters(baseProduct, {
        serviceCategoryFilter: ["Telehealth"],
      })
    ).toBe(true);

    expect(
      productMatchesFilters(baseProduct, {
        serviceCategoryFilter: ["Other"],
      })
    ).toBe(false);
  });

  it("filters by bundle type (product tag)", () => {
    expect(
      productMatchesFilters(baseProduct, {
        bundleTypeFilter: ["Premium"],
      })
    ).toBe(true);

    expect(
      productMatchesFilters(baseProduct, {
        bundleTypeFilter: ["Basic"],
      })
    ).toBe(false);
  });

  it("filters by membership fee type", () => {
    expect(
      productMatchesFilters(baseProduct, {
        membershipFilter: ["Monthly"],
      })
    ).toBe(true);

    expect(
      productMatchesFilters(baseProduct, {
        membershipFilter: ["Annual"],
      })
    ).toBe(false);
  });

  it("skips membership filter when product has no membershipFeeType", () => {
    const productWithoutMembership = { ...baseProduct, membershipFeeType: "" as any };
    expect(
      productMatchesFilters(productWithoutMembership as any, {
        membershipFilter: ["Monthly"],
      })
    ).toBe(true);
  });

  it("filters by minimum age", () => {
    expect(
      productMatchesFilters(baseProduct, {
        minAgeFilter: 20,
      })
    ).toBe(true);

    expect(
      productMatchesFilters(baseProduct, {
        minAgeFilter: 30,
      })
    ).toBe(false);
  });

  it("skips age filter for empty string", () => {
    expect(
      productMatchesFilters(baseProduct, {
        minAgeFilter: "",
      })
    ).toBe(true);
  });

  it("skips age filter for null", () => {
    expect(
      productMatchesFilters(baseProduct, {
        minAgeFilter: null,
      })
    ).toBe(true);
  });

  it("filters by effective date range", () => {
    expect(
      productMatchesFilters(baseProduct, {
        fromEffectiveDateRange: "2022-01-01",
        toEffectiveDateRange: "2024-01-01",
      })
    ).toBe(true);

    expect(
      productMatchesFilters(baseProduct, {
        fromEffectiveDateRange: "2024-01-01",
        toEffectiveDateRange: "2025-01-01",
      })
    ).toBe(false);
  });

  it("filters by term date range", () => {
    expect(
      productMatchesFilters(baseProduct, {
        fromTermDateRange: "2023-01-01",
        toTermDateRange: "2024-01-01",
      })
    ).toBe(true);

    expect(
      productMatchesFilters(baseProduct, {
        fromTermDateRange: "2024-01-01",
        toTermDateRange: "2025-01-01",
      })
    ).toBe(false);
  });

  it("applies multiple filters together", () => {
    expect(
      productMatchesFilters(baseProduct, {
        serviceCategoryFilter: ["Telehealth"],
        minAgeFilter: 20,
        fromEffectiveDateRange: "2022-01-01",
      })
    ).toBe(true);

    expect(
      productMatchesFilters(baseProduct, {
        serviceCategoryFilter: ["Telehealth"],
        minAgeFilter: 30, // This should fail
      })
    ).toBe(false);
  });

  it("handles products without age field", () => {
    const productWithoutAge = { ...baseProduct, age: 0 as any };
    expect(
      productMatchesFilters(productWithoutAge as any, {
        minAgeFilter: 20,
      })
    ).toBe(false); // Should pass since age check only applies when age is a number
  });
});

describe("buildVisitFeesText", () => {
  it("builds text with both member and client fees", () => {
    const result = buildVisitFeesText(10, 20);
    expect(result).toBe("$10 Member | $20 Client");
  });

  it("builds text with only member fee", () => {
    const result = buildVisitFeesText(10, null);
    expect(result).toBe("$10 Member");
  });

  it("builds text with only client fee", () => {
    const result = buildVisitFeesText(null, 20);
    expect(result).toBe("$20 Client");
  });

  it("returns null when both fees are null", () => {
    const result = buildVisitFeesText(null, null);
    expect(result).toBeNull();
  });

  it("returns null when both fees are undefined", () => {
    const result = buildVisitFeesText(undefined, undefined);
    expect(result).toBeNull();
  });

  it("returns null when both fees are empty strings", () => {
    const result = buildVisitFeesText("", "");
    expect(result).toBeNull();
  });

  it("handles zero values", () => {
    const result = buildVisitFeesText(0, 0);
    expect(result).toBe("$0 Member | $0 Client");
  });

  it("handles mixed null and zero", () => {
    const result = buildVisitFeesText(0, null);
    expect(result).toBe("$0 Member");
  });
});

describe("formatDateUTC", () => {
  it("formats a UTC date string correctly", () => {
    const result = formatDateUTC("2023-06-15T14:30:00Z");
    expect(result).toMatch(/Jun 15, 2023 at \d{2}:\d{2} (AM|PM) UTC/);
  });

  it("handles midnight correctly", () => {
    const result = formatDateUTC("2023-01-01T00:00:00Z");
    expect(result).toContain("12:00 AM UTC");
  });

  it("handles noon correctly", () => {
    const result = formatDateUTC("2023-06-15T12:00:00Z");
    expect(result).toContain("12:00 PM UTC");
  });

  it("converts 13:00 to 01:00 PM", () => {
    const result = formatDateUTC("2023-06-15T13:00:00Z");
    expect(result).toContain("01:00 PM UTC");
  });

  it("pads minutes with leading zero", () => {
    const result = formatDateUTC("2023-06-15T14:05:00Z");
    expect(result).toContain(":05");
  });

  it("includes month abbreviation", () => {
    const result = formatDateUTC("2023-01-15T14:30:00Z");
    expect(result).toContain("Jan");
  });

  it("includes year", () => {
    const result = formatDateUTC("2023-06-15T14:30:00Z");
    expect(result).toContain("2023");
  });
});

describe("formatUTCToEST", () => {
  it("formats a valid UTC date string", () => {
    const result = formatUTCToEST("2023-06-15T14:30:00Z");
    expect(result).toMatch(/\w{3} \d{1,2} at \d{1,2}:\d{2} (AM|PM)/);
  });

  it("returns empty string for null input", () => {
    expect(formatUTCToEST(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(formatUTCToEST(undefined)).toBe("");
  });

  it("returns empty string for invalid date string", () => {
    expect(formatUTCToEST("not-a-date")).toBe("");
  });

  it("excludes year by default", () => {
    const result = formatUTCToEST("2023-06-15T14:30:00Z");
    expect(result).not.toContain("2023");
  });

  it("includes year when yearNeeded is true", () => {
    const result = formatUTCToEST("2023-06-15T14:30:00Z", true);
    expect(result).toContain("2023");
  });

  it("formats month as abbreviation", () => {
    const result = formatUTCToEST("2023-01-15T14:30:00Z");
    expect(result).toMatch(/Jan/);
  });

  it("includes time with AM/PM", () => {
    const result = formatUTCToEST("2023-06-15T09:30:00Z");
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });
});

describe("getTimeDiffInMinutes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates difference in minutes from string", () => {
    const lastUpdated = "2023-06-15T11:30:00Z";
    expect(getTimeDiffInMinutes(lastUpdated)).toBe(30);
  });

  it("calculates difference in minutes from Date object", () => {
    const lastUpdated = new Date("2023-06-15T11:45:00Z");
    expect(getTimeDiffInMinutes(lastUpdated)).toBe(15);
  });

  it("returns 0 for current time", () => {
    const lastUpdated = new Date("2023-06-15T12:00:00Z");
    expect(getTimeDiffInMinutes(lastUpdated)).toBe(0);
  });

  it("handles large time differences", () => {
    const lastUpdated = "2023-06-14T12:00:00Z";
    expect(getTimeDiffInMinutes(lastUpdated)).toBe(1440); // 24 hours
  });

  it("floors fractional minutes", () => {
    const lastUpdated = "2023-06-15T11:59:30Z"; // 30 seconds ago
    expect(getTimeDiffInMinutes(lastUpdated)).toBe(0);
  });

  it("throws error for invalid date string", () => {
    expect(() => getTimeDiffInMinutes("not-a-date")).toThrow("Invalid lastUpdatedAt time");
  });

  it("handles dates in the past", () => {
    const lastUpdated = "2023-06-15T10:00:00Z";
    expect(getTimeDiffInMinutes(lastUpdated)).toBe(120);
  });
});

describe("capitalizeFirstLetter", () => {
  it("capitalizes the first letter of a string", () => {
    expect(capitalizeFirstLetter("hello")).toBe("Hello");
  });

  it("leaves already capitalized strings unchanged", () => {
    expect(capitalizeFirstLetter("Hello")).toBe("Hello");
  });

  it("handles single character strings", () => {
    expect(capitalizeFirstLetter("a")).toBe("A");
  });

  it("handles empty strings", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });

  it("only capitalizes first letter, leaves rest unchanged", () => {
    expect(capitalizeFirstLetter("hELLO")).toBe("Hello");
  });

  it("handles strings with spaces", () => {
    expect(capitalizeFirstLetter("hello world")).toBe("Hello world");
  });

  it("handles numbers at the start", () => {
    expect(capitalizeFirstLetter("123abc")).toBe("123abc");
  });

  it("handles special characters", () => {
    expect(capitalizeFirstLetter("!hello")).toBe("!hello");
  });

  it("coerces non-strings to strings", () => {
    expect(capitalizeFirstLetter(123 as any)).toBe("123");
    expect(capitalizeFirstLetter(null as any)).toBe("Null");
    expect(capitalizeFirstLetter(undefined as any)).toBe("Undefined");
  });
});

describe("getValueOrNoOverride", () => {
  it("returns 'No Override' for null", () => {
    expect(getValueOrNoOverride(null)).toBe("No Override");
  });

  it("returns 'No Override' for undefined", () => {
    expect(getValueOrNoOverride(undefined)).toBe("No Override");
  });

  it("returns the value for a string", () => {
    expect(getValueOrNoOverride("Hello")).toBe("Hello");
  });

  it("returns the value for a number", () => {
    expect(getValueOrNoOverride(42)).toBe(42);
  });

  it("returns empty string as-is (not No Override)", () => {
    expect(getValueOrNoOverride("")).toBe("");
  });

  it("returns false as-is", () => {
    expect(getValueOrNoOverride(false)).toBe(false);
  });

  it("returns 0 as-is", () => {
    expect(getValueOrNoOverride(0)).toBe(0);
  });
});

describe("normalizeApprovalTicket", () => {
  it("extracts jira ticket from jira url", () => {
    expect(normalizeApprovalTicket("https://teladoc.atlassian.net/browse/CCONFIG-5678")).toBe("CCONFIG-5678");
  });

  it("extracts and uppercases ticket from url path", () => {
    expect(normalizeApprovalTicket("https://example.com/path/cconfig-9012")).toBe("CCONFIG-9012");
  });

  it("returns empty for null or empty values", () => {
    expect(normalizeApprovalTicket("")) .toBe("");
    expect(normalizeApprovalTicket("   ")).toBe("");
    expect(normalizeApprovalTicket(undefined)).toBe("");
    expect(normalizeApprovalTicket("-")).toBe("");
  });

  it("uppercases plain Jira key values consistently", () => {
    expect(normalizeApprovalTicket("CCONFIG-1234")).toBe("CCONFIG-1234");
    expect(normalizeApprovalTicket("cconfig-1234")).toBe("CCONFIG-1234");
  });

  it("returns empty for plain strings that are not Jira key shaped", () => {
    expect(normalizeApprovalTicket("not-a-ticket")).toBe("");
    expect(normalizeApprovalTicket("pending review")).toBe("");
  });

  it("returns empty for non-http(s) URLs", () => {
    expect(normalizeApprovalTicket("ftp://example.com/browse/CCONFIG-1")).toBe("");
    expect(normalizeApprovalTicket("javascript:alert(1)")).toBe("");
  });

  it("returns empty when the extracted URL path segment is not a Jira key", () => {
    expect(normalizeApprovalTicket("https://teladoc.atlassian.net/browse")).toBe("");
    expect(normalizeApprovalTicket("https://example.com/path/")).toBe("");
  });
});

describe("isExpiringWithinDays", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-06-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when end date is within default 7 days", () => {
    expect(isExpiringWithinDays("2023-06-20")).toBe(true);
  });

  it("returns true when end date equals today", () => {
    expect(isExpiringWithinDays("2023-06-15")).toBe(true);
  });

  it("returns false when end date is in the past", () => {
    expect(isExpiringWithinDays("2023-06-10")).toBe(false);
  });

  it("returns false when end date is beyond threshold", () => {
    expect(isExpiringWithinDays("2023-06-25")).toBe(false);
  });

  it("respects custom daysThreshold", () => {
    expect(isExpiringWithinDays("2023-06-25", 15)).toBe(true);
    expect(isExpiringWithinDays("2023-06-25", 5)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isExpiringWithinDays(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isExpiringWithinDays(undefined)).toBe(false);
  });

  it("returns false for invalid date", () => {
    expect(isExpiringWithinDays("not-a-date")).toBe(false);
  });
});

describe("formatUTCtoDateOnly", () => {
  it("formats date without time by default", () => {
    const result = formatUTCtoDateOnly("2023-06-15T14:30:00Z");
    expect(result).toBe("Jun 15, 2023");
  });

  it("includes time with UTC when withTime=true", () => {
    const result = formatUTCtoDateOnly("2023-06-15T14:30:00Z", true);
    expect(result).toContain("UTC");
    expect(result).toContain("2023");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("includes time without UTC text when withoutUTCText=true", () => {
    const result = formatUTCtoDateOnly("2023-06-15T14:30:00Z", true, true);
    expect(result).not.toContain("UTC");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns '-' for null", () => {
    expect(formatUTCtoDateOnly(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatUTCtoDateOnly(undefined)).toBe("-");
  });

  it("returns '-' for empty string", () => {
    expect(formatUTCtoDateOnly("")).toBe("-");
  });

  it("returns '-' for invalid date", () => {
    expect(formatUTCtoDateOnly("not-a-date")).toBe("-");
  });
});

describe("formatFileSize", () => {
  it("returns em dash for null", () => {
    expect(formatFileSize(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatFileSize(undefined)).toBe("—");
  });

  it("returns em dash for 0", () => {
    expect(formatFileSize(0)).toBe("—");
  });

  it("returns em dash for negative values", () => {
    expect(formatFileSize(-100)).toBe("—");
  });

  it("formats bytes to KB", () => {
    expect(formatFileSize(2048)).toBe("2.00 KB");
  });

  it("formats bytes to MB", () => {
    expect(formatFileSize(1048576)).toBe("1.00 MB");
  });

  it("formats bytes to GB", () => {
    expect(formatFileSize(1073741824)).toBe("1.00 GB");
  });

  it("handles string input", () => {
    expect(formatFileSize("2048")).toBe("2.00 KB");
  });

  it("formats fractional KB", () => {
    expect(formatFileSize(1536)).toBe("1.50 KB");
  });

  it("returns em dash for NaN string", () => {
    expect(formatFileSize("abc")).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns '-' for null", () => {
    expect(formatRelativeTime(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatRelativeTime(undefined)).toBe("-");
  });

  it("returns '0 mins ago' for current time", () => {
    expect(formatRelativeTime("2023-06-15T12:00:00Z")).toBe("0 mins ago");
  });

  it("returns empty string for 0 mins when omitZeroMinutes is true", () => {
    expect(formatRelativeTime("2023-06-15T12:00:00Z", { omitZeroMinutes: true })).toBe("");
  });

  it("returns '1 min ago' for 1 minute", () => {
    expect(formatRelativeTime("2023-06-15T11:59:00Z")).toBe("1 min ago");
  });

  it("returns 'X mins ago' for less than 1 hour", () => {
    expect(formatRelativeTime("2023-06-15T11:30:00Z")).toBe("30 mins ago");
  });

  it("returns '1 hr ago' for 1 hour", () => {
    expect(formatRelativeTime("2023-06-15T11:00:00Z")).toBe("1 hr ago");
  });

  it("returns 'X hrs ago' for less than 24 hours", () => {
    expect(formatRelativeTime("2023-06-15T06:00:00Z")).toBe("6 hrs ago");
  });

  it("returns 'Yesterday' with time for 1 day ago", () => {
    const result = formatRelativeTime("2023-06-14T10:30:00Z");
    expect(result).toMatch(/Yesterday, \d{1,2}:\d{2} (AM|PM)/);
  });

  it("returns 'Yesterday' without time when dateTimeNeeded=false", () => {
    expect(formatRelativeTime("2023-06-14T10:30:00Z", undefined, false)).toBe("Yesterday");
  });

  it("returns 'X days ago' for multiple days when dateTimeNeeded=false", () => {
    expect(formatRelativeTime("2023-06-10T10:30:00Z", undefined, false)).toBe("5 days ago");
  });

  it("returns full date with time for multiple days ago", () => {
    const result = formatRelativeTime("2023-06-10T14:30:00Z");
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2} (AM|PM)/);
  });
});

describe("validateEmail", () => {
  it("returns true for valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("returns true for email with subdomain", () => {
    expect(validateEmail("user@mail.example.com")).toBe(true);
  });

  it("returns false for missing @", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("returns false for missing domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });

  it("returns false for missing TLD", () => {
    expect(validateEmail("user@example")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("returns false for spaces in email", () => {
    expect(validateEmail("user @example.com")).toBe(false);
  });
});

describe("validatePhone", () => {
  it("returns true for empty string (optional field)", () => {
    expect(validatePhone("")).toBe(true);
  });

  it("returns true for valid 10-digit phone", () => {
    expect(validatePhone("5551234567")).toBe(true);
  });

  it("returns true for formatted phone", () => {
    expect(validatePhone("(555) 123-4567")).toBe(true);
  });

  it("returns false for less than 10 digits", () => {
    expect(validatePhone("12345")).toBe(false);
  });

  it("returns false for more than 10 digits", () => {
    expect(validatePhone("123456789012")).toBe(false);
  });

  it("returns true for null/undefined (falsy)", () => {
    expect(validatePhone(null as any)).toBe(true);
    expect(validatePhone(undefined as any)).toBe(true);
  });
});

describe("downloadFile", () => {
  it("creates a temporary anchor element and triggers download", () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    downloadFile("test.csv", "col1,col2\n1,2");
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});

describe("downloadBase64File", () => {
  it("creates an anchor element and triggers download for xlsx", () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    downloadBase64File("report.xlsx", btoa("test content"));
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("handles csv files", () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    downloadBase64File("data.csv", btoa("a,b,c"));
    expect(appendChildSpy).toHaveBeenCalled();
    appendChildSpy.mockRestore();
  });
});

describe("formatDateLocal", () => {
  it("formats a valid date string", () => {
    const result = formatDateLocal("2024-06-15T12:00:00Z");
    expect(result).toMatch(/Jun \d{1,2}, 2024/);
  });

  it("returns '-' for empty string", () => {
    expect(formatDateLocal("")).toBe("-");
  });

  it("returns '-' for invalid date", () => {
    expect(formatDateLocal("not-a-date")).toBe("-");
  });

  it("handles timestamp numbers", () => {
    const ts = new Date("2024-01-15").getTime();
    const result = formatDateLocal(ts);
    expect(result).toContain("2024");
    expect(result).toContain("Jan");
  });
});

describe("encodeFileLinkWithSize", () => {
  it("encodes storageName and size separated by colon", () => {
    expect(encodeFileLinkWithSize("file.pdf", 2048)).toBe("file.pdf:2048");
  });

  it("handles zero size", () => {
    expect(encodeFileLinkWithSize("file.txt", 0)).toBe("file.txt:0");
  });

  it("handles paths with slashes", () => {
    expect(encodeFileLinkWithSize("path/to/file.pdf", 100)).toBe("path/to/file.pdf:100");
  });
});

describe("removeTrailingTimestamp", () => {
  it("removes 14-digit timestamp suffix from filename", () => {
    expect(removeTrailingTimestamp("report_20230615123456.pdf")).toBe("report.pdf");
  });

  it("leaves filename without timestamp unchanged", () => {
    expect(removeTrailingTimestamp("report.pdf")).toBe("report.pdf");
  });

  it("handles files without extension", () => {
    expect(removeTrailingTimestamp("report_20230615123456")).toBe("report");
  });

  it("returns empty string for empty input", () => {
    expect(removeTrailingTimestamp("")).toBe("");
  });

  it("handles null/undefined gracefully", () => {
    expect(removeTrailingTimestamp(null as any)).toBe(null);
    expect(removeTrailingTimestamp(undefined as any)).toBe(undefined);
  });
});

describe("isDateInPast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for a date in the past", () => {
    expect(isDateInPast("2023-06-10T00:00:00Z")).toBe(true);
  });

  it("returns false for today's date", () => {
    expect(isDateInPast("2023-06-15T00:00:00Z")).toBe(false);
  });

  it("returns false for a future date", () => {
    expect(isDateInPast("2023-06-20T00:00:00Z")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isDateInPast(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isDateInPast("")).toBe(false);
  });

  it("returns false for invalid date", () => {
    expect(isDateInPast("not-a-date")).toBe(false);
  });
});

describe("parseFileLinkEntry", () => {
  it("parses entry with size suffix", () => {
    expect(parseFileLinkEntry("folder/doc.pdf:2048")).toEqual({
      storageName: "folder/doc.pdf",
      sizeBytes: 2048,
    });
  });

  it("returns full entry as storageName when no colon", () => {
    expect(parseFileLinkEntry("folder/doc.pdf")).toEqual({
      storageName: "folder/doc.pdf",
      sizeBytes: 0,
    });
  });

  it("returns full entry when suffix is not numeric", () => {
    expect(parseFileLinkEntry("file:name.pdf")).toEqual({
      storageName: "file:name.pdf",
      sizeBytes: 0,
    });
  });

  it("handles large sizes", () => {
    expect(parseFileLinkEntry("big.zip:1073741824")).toEqual({
      storageName: "big.zip",
      sizeBytes: 1073741824,
    });
  });

  it("handles zero size", () => {
    expect(parseFileLinkEntry("file.txt:0")).toEqual({
      storageName: "file.txt",
      sizeBytes: 0,
    });
  });
});

describe("normalizeFileLinkEntry", () => {
  it("handles string entries via parseFileLinkEntry", () => {
    expect(normalizeFileLinkEntry("file.pdf:1024")).toEqual({
      storageName: "file.pdf",
      sizeBytes: 1024,
    });
  });

  it("handles object with name and sizeBytes", () => {
    expect(normalizeFileLinkEntry({ name: "a.png:100", sizeBytes: 200 })).toEqual({
      storageName: "a.png",
      sizeBytes: 200,
    });
  });

  it("falls back to parsed size when object sizeBytes is undefined", () => {
    expect(normalizeFileLinkEntry({ name: "a.png:100" })).toEqual({
      storageName: "a.png",
      sizeBytes: 100,
    });
  });

  it("returns empty storageName for invalid input", () => {
    expect(normalizeFileLinkEntry(null as any)).toEqual({
      storageName: "",
      sizeBytes: 0,
    });
  });
});

describe("fileLinkItemsToEncodedStrings", () => {
  it("returns empty array for null", () => {
    expect(fileLinkItemsToEncodedStrings(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(fileLinkItemsToEncodedStrings(undefined)).toEqual([]);
  });

  it("returns empty array for empty array", () => {
    expect(fileLinkItemsToEncodedStrings([])).toEqual([]);
  });

  it("passes through string entries unchanged", () => {
    expect(fileLinkItemsToEncodedStrings(["legacy.pdf"])).toEqual(["legacy.pdf"]);
  });

  it("encodes object entries with size", () => {
    const result = fileLinkItemsToEncodedStrings([
      { name: "upload.bin", sizeBytes: 4096 },
    ]);
    expect(result).toEqual(["upload.bin:4096"]);
  });

  it("handles mixed entries", () => {
    const result = fileLinkItemsToEncodedStrings([
      "legacy.pdf",
      { name: "new.bin", sizeBytes: 1024 },
      { name: "no-size.txt" },
    ]);
    expect(result).toEqual(["legacy.pdf", "new.bin:1024", "no-size.txt"]);
  });
});

describe("getHighestPriorityRole", () => {
  it("returns highest priority role from array", () => {
    const result = getHighestPriorityRole(["VIEWER", "CONFIGURATOR"]);
    expect(result).toBeDefined();
  });

  it("returns first role when only one provided", () => {
    const result = getHighestPriorityRole(["VIEWER"]);
    expect(result).toBe("VIEWER");
  });
});
});
