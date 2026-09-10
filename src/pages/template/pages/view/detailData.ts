import type { TemplateDetail } from "./types";

const EMPTY_VALUE = "-";

export const ALLIED_DETAIL: TemplateDetail = {
  overviewLeft: [
    { label: "Account", value: "Allied Benefit Systems" },
    { label: "Contract path", value: "Allied" },
    { label: "Revenue bucket", value: "USGH" },
    { label: "Client Success Manager", value: EMPTY_VALUE },
    { label: "Client Implementation Manager", value: EMPTY_VALUE },
    { label: "Registration customizations", value: EMPTY_VALUE },
  ],
  overviewRight: [
    { label: "Chronic care population type", value: "ASO Downmarket" },
    { label: "Chronic care population coverage", value: EMPTY_VALUE },
    { label: "CCM registration address type", value: EMPTY_VALUE },
    { label: "CCM registration flow scenarios", value: EMPTY_VALUE },
    { label: "Cardio feature enabled", value: EMPTY_VALUE },
    { label: "Cardio start date", value: EMPTY_VALUE },
    { label: "Welcome kits shipped by UPS, not Fedex", value: EMPTY_VALUE },
  ],
  groupRelationship: [{ label: "Has broker", value: "Yes" }],
};

export const dashDetail = (overrides?: Partial<TemplateDetail>): TemplateDetail => ({
  overviewLeft: ALLIED_DETAIL.overviewLeft.map((field) => ({
    ...field,
    value: EMPTY_VALUE,
  })),
  overviewRight: ALLIED_DETAIL.overviewRight.map((field) => ({
    ...field,
    value: EMPTY_VALUE,
  })),
  groupRelationship: [{ label: "Has broker", value: EMPTY_VALUE }],
  ...overrides,
});

export const DETAILS_BY_ID: Record<string, TemplateDetail> = {
  allied: ALLIED_DETAIL,
};
