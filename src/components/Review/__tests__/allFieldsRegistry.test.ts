import { describe, it, expect } from "vitest";
import { buildAllFieldsPages } from "../allFieldsRegistry";

const leaf = (value: unknown) => ({
  value,
  dataType: "STRING",
  editable: true,
  uiComponentType: "text",
});

describe("buildAllFieldsPages", () => {
  it("returns no pages without metadata", () => {
    expect(buildAllFieldsPages(null)).toEqual([]);
    expect(buildAllFieldsPages(undefined)).toEqual([]);
    expect(buildAllFieldsPages({})).toEqual([]);
  });

  it("builds every organization page and tab present in metadata", () => {
    const pages = buildAllFieldsPages({
      organizationGeneralSettings: {
        overview: { accountOverview: { organizationName: leaf("Acme") } },
        accountRelationships: [{ partnerAccount: leaf("Partner A") }],
      },
      organizationBilling: { overview: {} },
      organizationEligibility: { overview: {} },
      organizationMarketing: { overview: {} },
      organizationReporting: {
        reporting: [{ reportSettings: { reportType: leaf("Standard") } }],
      },
    });

    expect(pages.map((p) => p.pageLabel)).toEqual([
      "General settings",
      "Billing",
      "Eligibility",
      "Marketing",
      "Reporting",
    ]);

    const generalSettings = pages[0];
    expect(generalSettings.tabs.map((t) => t.tabName)).toEqual([
      "Overview",
      "Permissions",
      "Account relationships",
    ]);
    // Account relationships render as cards rather than plain sections.
    expect(generalSettings.tabs[2].accountRelationships).toHaveLength(1);

    // Reporting owns its own tab layout, so it is passed through whole.
    expect(pages[4].tabs).toEqual([]);
    expect(pages[4].reporting?.isGroup).toBe(false);
    expect(pages[4].reporting?.data.reporting).toHaveLength(1);
  });

  it("builds every group page and tab present in metadata", () => {
    const pages = buildAllFieldsPages({
      groupGeneralSettings: {
        overview: { groupOverview: { groupName: leaf("G1") } },
        groupRelationShips: [{ memberGroupName: leaf("MG1") }],
      },
      groupBilling: { overview: {} },
      eligibilityAndClaims: { overview: {} },
      groupMarketing: { overview: {} },
      groupReporting: { reporting: [{ reportSettings: {} }] },
    });

    expect(
      pages.map((p) => ({ label: p.pageLabel, tabs: p.tabs.map((t) => t.tabName) })),
    ).toEqual([
      {
        label: "General settings",
        tabs: ["Overview", "Group permissions", "Group relationships"],
      },
      { label: "Billing", tabs: ["Overview", "CCM"] },
      { label: "Eligibility and claims", tabs: ["Overview", "CCM eligibility"] },
      { label: "Marketing", tabs: ["Overview", "Telemedicine", "CCM"] },
      { label: "Reporting", tabs: [] },
    ]);
    expect(pages[4].reporting?.isGroup).toBe(true);
  });

  it("unwraps metadata leaves into displayable values", () => {
    const [page] = buildAllFieldsPages({
      organizationGeneralSettings: {
        overview: { accountOverview: { organizationName: leaf("Acme Corp") } },
      },
    });

    const accountOverview = page.tabs[0].sectionData?.["Account overview"];
    const rows = Object.values(accountOverview ?? {}).flat();
    expect(rows).toContainEqual(
      expect.objectContaining({ value: "Acme Corp" }),
    );
  });

  it("only emits tabs it can actually render", () => {
    const pages = buildAllFieldsPages({
      organizationGeneralSettings: {
        overview: { accountOverview: { organizationName: leaf("Acme") } },
        accountRelationships: [{ partnerAccount: leaf("Partner A") }],
        historicalDetails: { contractOps: [{ contract: leaf("C-1") }] },
      },
    });

    // Every emitted tab must carry renderable content, otherwise the view
    // falls through to RenderAllSections with no data.
    for (const page of pages) {
      for (const tab of page.tabs) {
        expect(Boolean(tab.sectionData ?? tab.accountRelationships)).toBe(true);
      }
    }
  });

  it("omits tabs and pages that have no metadata-backed fields", () => {
    const pages = buildAllFieldsPages({
      groupGeneralSettings: { overview: { groupOverview: {} } },
      groupReporting: { reporting: [] },
    });

    expect(pages.map((p) => p.pageLabel)).toEqual(["General settings"]);
    expect(pages[0].tabs.map((t) => t.tabName)).not.toContain(
      "Group relationships",
    );
  });
});
