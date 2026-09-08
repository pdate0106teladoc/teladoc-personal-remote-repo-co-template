import { describe, it, expect } from "vitest";
import {
  transformChangesToPages,
  transformFailedChangesToPages,
  countFailedReviewChanges,
  splitReviewFieldPath,
  collectFormFieldKeysForPage,
  collectRejectedReviewFieldPathMap,
  collectPreviouslyMarkedFailedUiKeys,
  buildCorrectedFieldsPayload,
  mapReviewMetadataToFieldMetadata,
  normalizeModifiedItemChanges,
  type ReviewChangeResponse,
} from "../reviewFieldRegistry";

const SAMPLE_REVIEW_DIFF: ReviewChangeResponse = {
  changes: [
    {
      fieldPath: "organizationGeneralSettings.overview.accountDetails.coveredLives",
      change: {
        oldValue: "25",
        newValue: "30",
        status: "PENDING",
        correctedBy: null,
        correctedAt: null,
        rejectCount: null,
      },
      metadata: {
        dataType: "NUMBER",
        allowedValues: null,
        mandatory: false,
        regex: "^[0-9]+$",
        defaultValue: null,
        uiComponentType: "number",
      },
    },
    {
      fieldPath:
        "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
      change: {
        oldValue: true,
        newValue: false,
        status: "FAILED",
        correctedBy: null,
        correctedAt: null,
        rejectCount: 1,
      },
      metadata: {
        dataType: "BOOLEAN",
        allowedValues: null,
        mandatory: false,
        regex: "",
        defaultValue: true,
        uiComponentType: "checkbox",
      },
    },
    {
      fieldPath:
        "organizationGeneralSettings.permissions.groupPermissions.sendFraudWasteAndAbuseTermLetter",
      change: {
        oldValue: true,
        newValue: false,
        status: "FAILED",
        correctedBy: null,
        correctedAt: null,
        rejectCount: 1,
      },
      metadata: {
        dataType: "BOOLEAN",
        allowedValues: null,
        mandatory: false,
        regex: "",
        defaultValue: true,
        uiComponentType: "checkbox",
      },
    },
    {
      fieldPath:
        "organizationGeneralSettings.permissions.memberAccessPermissions.cancelDependents",
      change: {
        oldValue: false,
        newValue: true,
        status: "FAILED",
        correctedBy: null,
        correctedAt: null,
        rejectCount: 1,
      },
      metadata: {
        dataType: "BOOLEAN",
        allowedValues: ["true", "false"],
        mandatory: false,
        regex: "",
        defaultValue: false,
        uiComponentType: "checkbox",
      },
    },
    {
      fieldPath: "organizationGeneralSettings.overview.accountDetails.unionPopulation",
      change: {
        oldValue: true,
        newValue: false,
        status: "FAILED",
        correctedBy: null,
        correctedAt: null,
        rejectCount: 1,
      },
      metadata: {
        dataType: "BOOLEAN",
        allowedValues: ["true", "false"],
        mandatory: false,
        regex: "",
        defaultValue: null,
        uiComponentType: "checkbox",
      },
    },
    {
      fieldPath: "organizationGeneralSettings.overview.address.state",
      change: {
        oldValue: "IL",
        newValue: "Colorado",
        status: "FAILED",
        correctedBy: null,
        correctedAt: null,
        rejectCount: 1,
      },
      metadata: {
        dataType: "STRING",
        allowedValues: ["Alabama", "Colorado", "Illinois"],
        mandatory: false,
        regex: "",
        defaultValue: null,
        uiComponentType: "dropdown",
      },
    },
    {
      fieldPath:
        "organizationGeneralSettings.permissions.groupPermissions.sendUtilizationLetter",
      change: {
        oldValue: true,
        newValue: false,
        status: "PENDING",
        correctedBy: null,
        correctedAt: null,
        rejectCount: null,
      },
      metadata: {
        dataType: "BOOLEAN",
        allowedValues: null,
        mandatory: false,
        regex: "",
        defaultValue: true,
        uiComponentType: "checkbox",
      },
    },
  ],
};

describe("splitReviewFieldPath", () => {
  it("splits page prefix from form field key", () => {
    expect(
      splitReviewFieldPath(
        "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
      ),
    ).toEqual({
      pageKey: "organizationGeneralSettings",
      formFieldKey: "permissions.groupPermissions.sendProblemMemberLetter",
    });
  });
});

describe("mapReviewMetadataToFieldMetadata", () => {
  it("maps review metadata to editable FieldMetadata", () => {
    const result = mapReviewMetadataToFieldMetadata(
      {
        dataType: "BOOLEAN",
        allowedValues: null,
        mandatory: true,
        regex: "",
        defaultValue: true,
        uiComponentType: "checkbox",
      },
      false,
    );
    expect(result.editable).toBe(true);
    expect(result.uiComponentType).toBe("checkbox");
    expect(result.value).toBe(false);
    expect(result.required).toBe(true);
  });
});

describe("transformChangesToPages", () => {
  it("includes all scalar changes regardless of status", () => {
    const { pages } = transformChangesToPages(SAMPLE_REVIEW_DIFF);
    const allRows = pages.flatMap((p) =>
      p.tabs.flatMap((t) => t.sections.flatMap((s) => s.rows)),
    );
    expect(allRows.length).toBeGreaterThanOrEqual(7);
  });
});

describe("countFailedReviewChanges", () => {
  it("counts only FAILED scalar changes", () => {
    expect(countFailedReviewChanges(SAMPLE_REVIEW_DIFF)).toBe(5);
  });
});

describe("transformFailedChangesToPages", () => {
  it("includes only FAILED scalar changes", () => {
    const { pages } = transformFailedChangesToPages(SAMPLE_REVIEW_DIFF);
    const allRows = pages.flatMap((p) =>
      p.tabs.flatMap((t) => t.sections.flatMap((s) => s.rows)),
    );
    expect(allRows).toHaveLength(5);
    expect(allRows.every((r) => r.formFieldKey)).toBe(true);
    expect(allRows.every((r) => r.fieldMetadata?.editable)).toBe(true);
  });

  it("excludes PENDING fields from failed pages", () => {
    const { pages } = transformFailedChangesToPages(SAMPLE_REVIEW_DIFF);
    const labels = pages.flatMap((p) =>
      p.tabs.flatMap((t) => t.sections.flatMap((s) => s.rows.map((r) => r.field))),
    );
    expect(labels).not.toContain(expect.stringMatching(/covered lives/i));
    expect(labels.some((l) => /send problem member letter/i.test(l))).toBe(true);
  });

  it("groups failed fields under General settings page", () => {
    const { pages } = transformFailedChangesToPages(SAMPLE_REVIEW_DIFF);
    expect(pages).toHaveLength(1);
    expect(pages[0].pageKey).toBe("organizationGeneralSettings");
    expect(pages[0].pageLabel).toBe("General settings");
  });

  it("enriches rows with raw values for form initialization", () => {
    const { pages } = transformFailedChangesToPages(SAMPLE_REVIEW_DIFF);
    const cancelDependents = pages[0].tabs
      .flatMap((t) => t.sections.flatMap((s) => s.rows))
      .find((r) => r.formFieldKey?.includes("cancelDependents"));
    expect(cancelDependents?.rawNewValue).toBe(true);
    expect(cancelDependents?.rawOldValue).toBe(false);
  });
});

describe("collectFormFieldKeysForPage", () => {
  it("returns form field keys for a given page", () => {
    const { pages } = transformFailedChangesToPages(SAMPLE_REVIEW_DIFF);
    const keys = collectFormFieldKeysForPage(pages, "organizationGeneralSettings");
    expect(keys).toHaveLength(5);
    expect(keys[0]).toContain("permissions.");
  });
});

describe("collectRejectedReviewFieldPathMap", () => {
  it("maps form field keys to full review field paths", () => {
    const { pages } = transformFailedChangesToPages(SAMPLE_REVIEW_DIFF);
    const map = collectRejectedReviewFieldPathMap(pages);

    expect(map).toEqual(
      expect.objectContaining({
        "permissions.groupPermissions.sendProblemMemberLetter":
          "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
      }),
    );
    expect(Object.keys(map)).toHaveLength(5);
  });
});

describe("buildCorrectedFieldsPayload", () => {
  it("builds correctedFields payload from form data and path map", () => {
    const payload = buildCorrectedFieldsPayload(
      {
        "permissions.groupPermissions.sendProblemMemberLetter":
          "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
      },
      {
        "permissions.groupPermissions.sendProblemMemberLetter": true,
      },
    );

    expect(payload).toEqual([
      {
        fieldPath:
          "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
        correctedValue: "true",
      },
    ]);
  });

  it("formats null and undefined values as empty strings", () => {
    const payload = buildCorrectedFieldsPayload(
      { "overview.name": "organizationGeneralSettings.overview.name" },
      { "overview.name": null },
    );

    expect(payload[0].correctedValue).toBe("");
  });
});

describe("collectPreviouslyMarkedFailedUiKeys", () => {
  it("returns checkbox UI keys for IN_PROGRESS scalar changes", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath:
            "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
          change: {
            oldValue: true,
            newValue: false,
            status: "IN_PROGRESS",
            correctedBy: null,
            correctedAt: null,
            rejectCount: null,
          },
        },
        {
          fieldPath: "organizationGeneralSettings.overview.accountDetails.coveredLives",
          change: {
            oldValue: "25",
            newValue: "30",
            status: "PENDING",
            correctedBy: null,
            correctedAt: null,
            rejectCount: null,
          },
        },
      ],
    };

    const { fieldPathMap } = transformChangesToPages(diff);
    const keys = collectPreviouslyMarkedFailedUiKeys(fieldPathMap, diff);

    expect(keys.size).toBe(1);
    expect([...keys][0]).toContain("organizationGeneralSettings");
    expect([...keys][0]).toMatch(/::\d+$/);
  });

  it("stores changeStatus on transformed rows", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath:
            "organizationGeneralSettings.overview.accountOverview.isThisOrganizationTheEmployer",
          change: {
            oldValue: false,
            newValue: true,
            status: "IN_PROGRESS",
            correctedBy: null,
            correctedAt: null,
            rejectCount: null,
          },
        },
      ],
    };

    const { pages } = transformChangesToPages(diff);
    const row = pages
      .flatMap((p) => p.tabs)
      .flatMap((t) => t.sections)
      .flatMap((s) => s.rows)
      .find((r) => r.changeStatus === "IN_PROGRESS");

    expect(row).toBeDefined();
    expect(row?.updatedValue).toBeTruthy();
  });
});

const ACCOUNT_RELATIONSHIPS_REVIEW_API_DIFF: ReviewChangeResponse = {
  changes: [
    {
      fieldPath: "organizationGeneralSettings.accountRelationships",
      change: {
        added: [],
        removed: [],
        modified: [
          {
            id: ["REL-00233077"],
            changes: [
              {
                fieldPath: "partnerRelationshipsType",
                change: {
                  oldValue: null,
                  newValue: "Asthma",
                  status: "PENDING",
                  correctedBy: null,
                  correctedAt: null,
                  rejectCount: null,
                },
                metadata: {
                  dataType: "STRING",
                  allowedValues: ["Asthma", "Benefits Consultant"],
                  mandatory: false,
                  regex: "",
                  defaultValue: null,
                  uiComponentType: "dropdown",
                },
              },
            ],
          },
          {
            id: ["REL-00233075"],
            changes: [
              {
                fieldPath: "partnerRelationshipsType",
                change: {
                  oldValue: "Benefits Consultant",
                  newValue: "Biometrics Screening/Health  Risk Assessment",
                  status: "PENDING",
                  correctedBy: null,
                  correctedAt: null,
                  rejectCount: null,
                },
                metadata: {
                  dataType: "STRING",
                  allowedValues: ["Benefits Consultant", "Biometrics Screening/Health  Risk Assessment"],
                  mandatory: false,
                  regex: "",
                  defaultValue: null,
                  uiComponentType: "dropdown",
                },
              },
            ],
          },
          {
            id: ["REL-00231918"],
            changes: [
              {
                fieldPath: "partnerRelationshipsToTeladoc",
                change: {
                  oldValue: "Contractee",
                  newValue: "Broker",
                  status: "IN_PROGRESS",
                  correctedBy: null,
                  correctedAt: null,
                  rejectCount: null,
                },
                metadata: {
                  dataType: "STRING",
                  allowedValues: ["Broker", "Contractee"],
                  mandatory: false,
                  regex: "",
                  defaultValue: null,
                  uiComponentType: "dropdown",
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

describe("normalizeModifiedItemChanges", () => {
  it("parses review API array-shaped modified changes", () => {
    const modified = ACCOUNT_RELATIONSHIPS_REVIEW_API_DIFF.changes[0].change as {
      modified: Array<{ changes: unknown }>;
    };

    const normalized = normalizeModifiedItemChanges(modified.modified[0].changes);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].fieldName).toBe("partnerRelationshipsType");
    expect(normalized[0].scalarChange.newValue).toBe("Asthma");
    expect(normalized[0].metadata?.uiComponentType).toBe("dropdown");
  });

  it("parses diff-library map-shaped modified changes", () => {
    const normalized = normalizeModifiedItemChanges({
      partnerRelationshipsType: {
        oldValue: "Asthma",
        newValue: "Benefits Consultant",
        status: "FAILED",
        correctedBy: null,
        correctedAt: null,
        rejectCount: 2,
      },
    });

    expect(normalized).toHaveLength(1);
    expect(normalized[0].fieldName).toBe("partnerRelationshipsType");
    expect(normalized[0].scalarChange.status).toBe("FAILED");
  });
});

describe("transformChangesToPages — account relationships (review API shape)", () => {
  it("renders modified account relationship items on Account relationships tab", () => {
    const { pages } = transformChangesToPages(
      ACCOUNT_RELATIONSHIPS_REVIEW_API_DIFF,
    );

    expect(pages).toHaveLength(1);
    expect(pages[0].pageKey).toBe("organizationGeneralSettings");

    const accountTab = pages[0].tabs.find((t) => t.tabName === "Account relationships");
    expect(accountTab).toBeDefined();
    expect(accountTab!.arrayChangeSections).toHaveLength(1);
    expect(accountTab!.arrayChangeSections[0].tabLabel).toBe("Account relationship");
    expect(accountTab!.arrayChangeSections[0].items).toHaveLength(3);
  });

  it("maps field labels and values from nested review API changes", () => {
    const { pages } = transformChangesToPages(ACCOUNT_RELATIONSHIPS_REVIEW_API_DIFF);
    const items = pages[0].tabs
      .flatMap((t) => t.arrayChangeSections)
      .flatMap((s) => s.items);

    const rel233077 = items.find((item) => item.id === "REL-00233077");
    expect(rel233077?.rows[0]).toMatchObject({
      field: "Partner relationships type",
      previousValue: "—",
      updatedValue: "Asthma",
      changeStatus: "PENDING",
    });

    const rel233075 = items.find((item) => item.id === "REL-00233075");
    expect(rel233075?.rows[0]).toMatchObject({
      field: "Partner relationships type",
      previousValue: "Benefits Consultant",
      updatedValue: "Biometrics Screening/Health  Risk Assessment",
    });

    const rel231918 = items.find((item) => item.id === "REL-00231918");
    expect(rel231918?.rows[0]).toMatchObject({
      field: "Partner relationships to Teladoc",
      previousValue: "Contractee",
      updatedValue: "Broker",
      changeStatus: "IN_PROGRESS",
    });
  });

  it("builds granular field paths for fail-checkbox API mapping", () => {
    const { fieldPathMap } = transformChangesToPages(
      ACCOUNT_RELATIONSHIPS_REVIEW_API_DIFF,
    );

    const paths = Object.values(fieldPathMap);
    expect(paths).toContain(
      "organizationGeneralSettings.accountRelationships[REL-00233077].partnerRelationshipsType",
    );
    expect(paths).toContain(
      "organizationGeneralSettings.accountRelationships[REL-00231918].partnerRelationshipsToTeladoc",
    );
  });

  it("pre-checks fail boxes for IN_PROGRESS array field changes", () => {
    const { fieldPathMap } = transformChangesToPages(ACCOUNT_RELATIONSHIPS_REVIEW_API_DIFF);
    const keys = collectPreviouslyMarkedFailedUiKeys(
      fieldPathMap,
      ACCOUNT_RELATIONSHIPS_REVIEW_API_DIFF,
    );

    expect(keys.size).toBe(1);
    expect([...keys][0]).toBe(
      "organizationGeneralSettings::Account relationships::Account relationship::REL-00231918::0",
    );
  });
});

describe("transformFailedChangesToPages — account relationships", () => {
  it("includes FAILED fields from review API array modified items", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath: "organizationGeneralSettings.accountRelationships",
          change: {
            modified: [
              {
                id: ["REL-00204631"],
                changes: [
                  {
                    fieldPath: "partnerRelationshipsType",
                    change: {
                      oldValue: "Asthma",
                      newValue: "Benefits Consultant",
                      status: "FAILED",
                      correctedBy: null,
                      correctedAt: null,
                      rejectCount: 2,
                    },
                    metadata: {
                      dataType: "STRING",
                      allowedValues: ["Asthma", "Benefits Consultant"],
                      mandatory: false,
                      regex: "",
                      defaultValue: null,
                      uiComponentType: "dropdown",
                    },
                  },
                  {
                    fieldPath: "endDate",
                    change: {
                      oldValue: "2026-07-30T12:00:00.000Z",
                      newValue: "2026-07-31T12:00:00.000Z",
                      status: "PASSED",
                      correctedBy: null,
                      correctedAt: null,
                      rejectCount: null,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const { pages } = transformFailedChangesToPages(diff);
    const rows = pages.flatMap((p) =>
      p.tabs.flatMap((t) => t.arrayChangeSections.flatMap((s) => s.items.flatMap((i) => i.rows))),
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].field).toBe("Partner relationships type");
    expect(rows[0].formFieldKey).toBe(
      "accountRelationships[REL-00204631].partnerRelationshipsType",
    );
    expect(rows[0].fieldPath).toBe(
      "organizationGeneralSettings.accountRelationships[REL-00204631].partnerRelationshipsType",
    );
    expect(rows[0].fieldMetadata?.uiComponentType).toBe("dropdown");
  });
});

const MARKETING_SITE_USER_TELEMED_DIFF: ReviewChangeResponse = {
  changes: [
    {
      fieldPath: "organizationMarketing.details.contacts.marketingSiteUserTelemed",
      change: {
        added: ["mahesh yadav"],
        removed: [
          "Emaly Rodriguez",
          "Heather Greenwell",
          "Heather Hayhoe",
          "suresh raina",
        ],
        modified: [],
      },
    },
  ],
};

describe("transformChangesToPages — marketingSiteUserTelemed scalar list", () => {
  it("renders added as updated value and removed as previous value", () => {
    const { pages, fieldPathMap } = transformChangesToPages(
      MARKETING_SITE_USER_TELEMED_DIFF,
    );

    expect(pages).toHaveLength(1);
    expect(pages[0].pageKey).toBe("organizationMarketing");

    const overviewTab = pages[0].tabs.find((t) => t.tabName === "Overview");
    expect(overviewTab).toBeDefined();

    const row = overviewTab!.sections
      .flatMap((section) => section.rows)
      .find((r) => r.field === "Marketing site user - Telemed");

    expect(row).toMatchObject({
      previousValue: "Emaly Rodriguez\nHeather Greenwell\nHeather Hayhoe\nsuresh raina",
      updatedValue: "mahesh yadav",
      fieldPath: "organizationMarketing.details.contacts.marketingSiteUserTelemed",
    });

    expect(fieldPathMap).toEqual(
      expect.objectContaining({
        "organizationMarketing::Overview::Contact::0":
          "organizationMarketing.details.contacts.marketingSiteUserTelemed",
      }),
    );
  });

  it("renders the whole-list oldValue/newValue shape", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath:
            "organizationMarketing.details.contacts.marketingSiteUserTelemed",
          change: {
            oldValue: ["Bharat kumar", "Carol Jenny"],
            newValue: ["Carol Jenny", "Aptos Narrow (Body)"],
          } as unknown as ReviewChangeResponse["changes"][0]["change"],
        },
      ],
    };

    const { pages, unmappedKeys } = transformChangesToPages(diff);

    expect(unmappedKeys).toEqual([]);
    const row = pages[0].tabs
      .find((t) => t.tabName === "Overview")!
      .sections.flatMap((section) => section.rows)
      .find((r) => r.field === "Marketing site user - Telemed");

    expect(row).toMatchObject({
      previousValue: "Bharat kumar\nCarol Jenny",
      updatedValue: "Carol Jenny\nAptos Narrow (Body)",
      fieldPath: "organizationMarketing.details.contacts.marketingSiteUserTelemed",
    });
  });

  it("seeds rejected-fix edit values from the whole-list shape", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath:
            "organizationMarketing.details.contacts.marketingSiteUserTelemed",
          change: {
            oldValue: ["Bharat kumar"],
            newValue: ["Carol Jenny", "John Wick"],
            status: "FAILED",
          } as unknown as ReviewChangeResponse["changes"][0]["change"],
          metadata: {
            dataType: "STRING",
            allowedValues: null,
            mandatory: false,
            regex: "",
            defaultValue: null,
            uiComponentType: "lookup",
          },
        },
      ],
    };

    const row = transformFailedChangesToPages(diff)
      .pages[0].tabs.flatMap((tab) => tab.sections)
      .flatMap((section) => section.rows)
      .find((r) => r.field === "Marketing site user - Telemed");

    expect(row).toMatchObject({
      formFieldKey: "details.contacts.marketingSiteUserTelemed",
      pageKey: "organizationMarketing",
      rawOldValue: ["Bharat kumar"],
      rawNewValue: ["Carol Jenny", "John Wick"],
    });
    expect(row?.fieldMetadata?.value).toEqual(["Carol Jenny", "John Wick"]);
  });

  it("pre-checks fail boxes when scalar list change has IN_PROGRESS status", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath:
            "organizationMarketing.details.contacts.marketingSiteUserTelemed",
          change: {
            added: ["mahesh yadav"],
            removed: ["Emaly Rodriguez"],
            modified: [],
            status: "IN_PROGRESS",
          } as ReviewChangeResponse["changes"][0]["change"],
        },
      ],
    };

    const { fieldPathMap } = transformChangesToPages(diff);
    const keys = collectPreviouslyMarkedFailedUiKeys(fieldPathMap, diff);

    expect(keys.size).toBe(1);
    expect([...keys][0]).toBe(
      "organizationMarketing::Overview::Contact::0",
    );
  });
});

const ORG_REPORTING_REVIEW_DIFF: ReviewChangeResponse = {
  changes: [
    {
      fieldPath: "organizationReporting.reporting",
      change: {
        added: [],
        removed: [],
        modified: [
          {
            id: [357137],
            changes: [
              {
                fieldPath: "reportSettings.reportType",
                change: {
                  oldValue: "Client Utilization Integrated Telehealth Report",
                  newValue: "Client Utilization Integrated Telehealth Report-1",
                  status: "PENDING",
                  correctedBy: null,
                  correctedAt: null,
                  rejectCount: null,
                },
              },
              {
                fieldPath: "reportRecipient",
                change: {
                  added: [
                    {
                      emailRecipient: "To",
                      emailAddress: "riley.self@teladochealth.com",
                    },
                  ],
                  removed: [
                    {
                      emailRecipient: "To",
                      emailAddress: "riley.self@teladochealth.com",
                    },
                    {
                      emailRecipient: "To",
                      emailAddress: "kent.g.hilstrom@centene.com",
                    },
                  ],
                  modified: [],
                  status: "PENDING",
                },
              },
              {
                fieldPath: "reportSettings.emailContentVersion",
                change: {
                  oldValue: "Standard",
                  newValue: "Standard-1",
                  status: "PENDING",
                  correctedBy: null,
                  correctedAt: null,
                  rejectCount: null,
                },
              },
            ],
          },
          {
            id: [484161],
            changes: [
              {
                fieldPath: "reportSettings.reportVersion",
                change: {
                  oldValue: "PORT_PERF_SUMMARY_NONSTND",
                  newValue: "PORT_PERF_SUMMARY_NONSTND-1",
                  status: "IN_PROGRESS",
                  correctedBy: null,
                  correctedAt: null,
                  rejectCount: null,
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

describe("transformChangesToPages — organization reporting", () => {
  it("renders report settings and nested reportRecipient changes", () => {
    const { pages, fieldPathMap } = transformChangesToPages(ORG_REPORTING_REVIEW_DIFF);

    expect(pages).toHaveLength(1);
    expect(pages[0].pageKey).toBe("organizationReporting");

    const items = pages[0].tabs
      .flatMap((tab) => tab.arrayChangeSections)
      .flatMap((section) => section.items);

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual(["357137", "484161"]);

    const report357137 = items.find((item) => item.id === "357137");
    expect(report357137?.rows.some((row) => row.field === "Report type")).toBe(true);
    expect(
      report357137?.rows.find((row) => row.field === "Report recipients (To)"),
    ).toMatchObject({
      previousValue: "riley.self@teladochealth.com\nkent.g.hilstrom@centene.com",
      updatedValue: "riley.self@teladochealth.com",
      fieldPath: "organizationReporting.reporting[357137].reportRecipient",
      changeStatus: "PENDING",
    });

    expect(
      Object.values(fieldPathMap),
    ).toContain("organizationReporting.reporting[357137].reportSettings.emailContentVersion");
  });

  it("does not pre-check PENDING reportRecipient rows", () => {
    const { fieldPathMap } = transformChangesToPages(ORG_REPORTING_REVIEW_DIFF);
    const keys = collectPreviouslyMarkedFailedUiKeys(fieldPathMap, ORG_REPORTING_REVIEW_DIFF);

    expect([...keys].some((key) => key.includes("357137"))).toBe(false);
  });

  it("pre-checks IN_PROGRESS reportRecipient rows", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath: "organizationReporting.reporting",
          change: {
            modified: [
              {
                id: [484161],
                changes: [
                  {
                    fieldPath: "reportRecipient",
                    change: {
                      added: [{ emailRecipient: "To", emailAddress: "a@b.com" }],
                      removed: [{ emailRecipient: "To", emailAddress: "c@d.com" }],
                      modified: [],
                      status: "IN_PROGRESS",
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const { fieldPathMap } = transformChangesToPages(diff);
    const keys = collectPreviouslyMarkedFailedUiKeys(fieldPathMap, diff);

    expect([...keys][0]).toBe(
      "organizationReporting::Overview::Standard Report::484161::0",
    );
  });

  it("reads nested reportRecipient status from entry wrapper", () => {
    const diff: ReviewChangeResponse = {
      changes: [
        {
          fieldPath: "organizationReporting.reporting",
          change: {
            modified: [
              {
                id: [357137],
                changes: [
                  {
                    fieldPath: "reportRecipient",
                    status: "IN_PROGRESS",
                    change: {
                      added: [{ emailRecipient: "To", emailAddress: "a@b.com" }],
                      removed: [{ emailRecipient: "To", emailAddress: "c@d.com" }],
                      modified: [],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const { pages, fieldPathMap } = transformChangesToPages(diff);
    const recipientRow = pages[0].tabs
      .flatMap((tab) => tab.arrayChangeSections)
      .flatMap((section) => section.items)
      .flatMap((item) => item.rows)
      .find((row) => row.field === "Report recipients (To)");

    expect(recipientRow?.changeStatus).toBe("IN_PROGRESS");

    const keys = collectPreviouslyMarkedFailedUiKeys(fieldPathMap, diff);
    expect([...keys]).toHaveLength(1);
  });
});
