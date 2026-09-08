import type { ReviewApiResponse } from "./reviewFieldRegistry";

export const MOCK_REVIEW_RESPONSE: ReviewApiResponse = {
  id: "6a704a6a9a871508dea55983",
  taskId: "O-00504",
  draftId: "6a704960de996c4356ceb689",
  entityId: "176700",
  entityType: "ORGANIZATION",

  latestReviewSummary: {
    message: "Your update was rejected by peer reviewer. Please review the summary below.",
    errorCategories: [
      "Member Access Permission",
      "Billing Address",
    ],
    errorTypes: [
      "Account/Group Administrative Error",
      "Billing Error",
    ],
    comments: "Client configuration reviewed. Rejected due to incorrect authorized consenters and billing ZIP code.",
  },

  diff: {
    changes: [
      {
        fieldPath: "organizationGeneralSettings.overview.accountTeam.clientOperationsManager",
        change: {
          oldValue: "Kristen Limpus",
          newValue: "Daniel Ruiz",
          status: "PENDING",
          correctedBy: null,
          correctedAt: null,
          rejectCount: null,
        },
      },
      {
        fieldPath: "organizationGeneralSettings.overview.accountTeam.clientSuccessManager",
        change: {
          oldValue: "Priya Anand",
          newValue: "Priya Anand-Whitfield",
          status: "PASSED",
          correctedBy: null,
          correctedAt: null,
          rejectCount: null,
        },
      },
      {
        fieldPath: "organizationBilling.invoiceDetail.invoiceContact.primaryBillingContact",
        change: {
          oldValue: "Mr. Aaron Forbort",
          newValue: "George Isham",
          status: "CORRECTED",
          correctedBy: "6970e89546a3a532c5f11c41",
          correctedAt: "2026-08-03T09:00:00Z",
          rejectCount: null,
        },
      },
      {
        fieldPath: "organizationGeneralSettings.overview.clientTeam.secondaryBillingContact",
        change: {
          oldValue: "Bad Contact",
          newValue: "Emaly Rodriguez",
          status: "FAILED",
          correctedBy: null,
          correctedAt: null,
          rejectCount: 2,
        },
      },
      {
        fieldPath: "organizationGeneralSettings.accountRelationships",
        change: {
          added: [],
          removed: [],
          modified: [
            {
              id: ["REL-00204631"],
              changes: [
                {
                  fieldPath: "clientAccount",
                  change: {
                    oldValue: "HealthPartners, Inc.",
                    newValue: "Correct Client Account",
                    status: "CORRECTED",
                    correctedBy: "6970e89546a3a532c5f11c41",
                    correctedAt: "2026-08-03T09:00:00Z",
                    rejectCount: null,
                  },
                },
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
    errors: [
      "Field 'reporting': Element of type com.teladoc.microservices.ucc.task.model.dto.OrganizationReportingDto$Reporting has no @ComparisonId fields/components",
    ],
  },

  createdAt: "2026-08-03T07:59:38.105Z",
  createdBy: "6970e89546a3a532c5f11c41",
  updatedAt: "2026-08-03T09:00:00Z",
  updatedBy: "6970e89546a3a532c5f11c41",
};
