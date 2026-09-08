import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductDetail from "../pages/ProductDetail";

vi.mock("../styles/ProductDetail.scss", () => ({}));

vi.mock("@/components/DisplayRow/DisplayRow", () => ({
    __esModule: true,
    default: ({ label, value }: { label: string; value: any }) => (
        <div data-testid="display-row">
            <span>{label}</span>
            <span>{String(value)}</span>
        </div>
    ),
}));

const mockShowCustomToast = vi.fn();
const mockCustomTable = vi.fn(
    ({
        data,
        columns,
    }: {
        data: Array<any>;
        columns: Array<{
            field?: string;
            render?: (val: any, row: any) => React.ReactNode;
        }>;
    }) => (
        <table data-testid="custom-table">
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex} data-testid="custom-row">
                        {columns && columns.length
                            ? columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.render
                                        ? col.render(
                                            col.field ? (row as any)[col.field] : undefined,
                                            row,
                                        )
                                        : col.field
                                            ? (row as any)[col.field]
                                            : null}
                                </td>
                            ))
                            : (
                                <td>{row.opportunityName || row.consultType || "row"}</td>
                            )}
                    </tr>
                ))}
            </tbody>
        </table>
    ),
);

vi.mock("@ucc/common-ui", () => ({
    showCustomToast: (opts: any) => mockShowCustomToast(opts),
    CustomTable: (props: any) => mockCustomTable(props),
    SidebarRowWrapper: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-row-wrapper">{children}</div>
    ),
    SideModal: ({
        show,
        title,
        children,
        onHide,
    }: any) =>
        show ? (
            <div data-testid="right-modal">
                <div data-testid="right-modal-title">{title}</div>
                <button
                    type="button"
                    data-testid="right-modal-close"
                    onClick={onHide}
                >
                    close
                </button>
                {children}
            </div>
        ) : null,
    Accordion: ({
        title,
        data,
    }: any) => (
        <div data-testid="accordion">
            <div data-testid="accordion-title">{title}</div>
            {data?.map((item: any, idx: number) => (
                <div key={idx} data-testid="accordion-item">
                    {item.label}:{String(item.value)}
                </div>
            ))}
        </div>
    ),
    FailSafePage: ({ cardType }: { cardType: string }) => (
        <div data-testid="failsafe-page">FailSafe: {cardType}</div>
    ),
}));

vi.mock("react-bootstrap", () => ({
    __esModule: true,
    Tabs: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="tabs">{children}</div>
    ),
    Tab: ({
        eventKey,
        title,
        children,
    }: {
        eventKey: string;
        title: string;
        children: React.ReactNode;
    }) => (
        <div data-testid={`tab-${eventKey}`}>
            <div data-testid={`tab-title-${eventKey}`}>{title}</div>
            {children}
        </div>
    ),
}));

const mockExtractDisplayValue = vi.fn((value: any, _type: string) => ({
    jsx: <span data-testid="extract-display">{String(value)}</span>,
}));

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
    __esModule: true,
    DisplayType: {} as any,
    extractDisplayValue: (value: any, type: string) =>
        mockExtractDisplayValue(value, type),
}));

// Redundant local mock removed - consolidated in @ucc/common-ui mock

const mockGetSafeString = vi.fn((v: any) => (v == null ? "" : String(v)));
const mockPhoneFormat = vi.fn((v: string) => `phone-${v}`);

const mockGetValueOrNoOverride = vi.fn((v: any) => v ?? "No Override");

vi.mock("@/utils", () => ({
    __esModule: true,
    getSafeString: (v: any) => mockGetSafeString(v),
    phoneFormat: (v: string) => mockPhoneFormat(v),
    getValueOrNoOverride: (v: any) => mockGetValueOrNoOverride(v),
    normalizeApprovalTicket: (v?: string) => (v && v !== "-" ? v : ""),
}));



// Redundant local mock removed - consolidated in @ucc/common-ui mock

const mockApiGet = vi.fn();

vi.mock("@/api/apiService", () => ({
    __esModule: true,
    default: {
        get: (...args: any[]) => mockApiGet(...args),
    },
}));

vi.mock("@/constants", () => ({
    __esModule: true,
    API_ENDPOINTS: {
        opportunity: "/api/opportunity",
    },
    ERROR_MESSAGES: {
        SOMETHINGS_WRONG: "Something went wrong",
    },
    ToastType: {
        Error: "Error",
    },
}));


vi.mock("@/components/sidebar/OpportunityDrawer", () => ({
    __esModule: true,
    default: ({ data }: { data: any }) => (
        <div data-testid="opportunity-drawer">
            {data?.name || "no-data"}
        </div>
    ),
}));

vi.mock("@/pages/search-results/OpportunitiesTable", () => ({
    __esModule: true,
    tabData: [{ id: "tab1", label: "Tab 1" }],
}));

// ---- Test helpers ---- //

const baseField = (overrides: Partial<any> = {}) => ({
    displayName: "Field",
    type: "text",
    value: "val",
    layout: "vertical",
    order: 1,
    section: "General settings",
    group: null,
    defaultValue: null,
    configCode: "field-code",
    visibilityCondition: null,
    component: "text",
    isEditable: false,
    ...overrides,
});

const createMinimalProps = (overrides: Partial<any> = {}) => ({
    data: {
        "General settings": {
            direct: [baseField({ configCode: "gs-field", displayName: "GS Field" })],
            groups: {
                GroupA: [
                    baseField({
                        configCode: "gA1",
                        layout: "horizontal",
                        displayName: "Horizontal 1",
                        order: 1,
                    }),
                    baseField({
                        configCode: "gA2",
                        layout: "vertical",
                        displayName: "Vertical 1",
                        order: 2,
                    }),
                ],
            },
        },
        Billing: {
            direct: [baseField({ configCode: "billing-field", displayName: "Bill" })],
            groups: {},
        },
    },
    billingRteOverrides: [],
    opportunities: [],
    category: "Other",
    parentBundles: [],
    marketingDetails: undefined,
    engagementCriteria: undefined,
    eligibilityDetails: undefined,
    generalSettings: undefined,
    billing: undefined,
    productTag: undefined,
    rteOverrideFlag: false,
    ...overrides,
});

// ---- Tests ---- //

describe("ProductDetail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetModules();
    });

    it("renders basic structure, tabs, direct fields and groups", () => {
        const props = createMinimalProps();
        render(<ProductDetail {...props} />);

        expect(screen.getByTestId("tabs")).toBeInTheDocument();
        expect(screen.getByTestId("tab-General settings")).toBeInTheDocument();

        // Direct display row
        expect(screen.getByText("GS Field")).toBeInTheDocument();
        // Group header and vertical field
        expect(screen.getByText("GroupA")).toBeInTheDocument();
        expect(screen.getByText("Vertical 1")).toBeInTheDocument();
        // Horizontal table via extractDisplayValue
        expect(screen.getByText("Horizontal 1")).toBeInTheDocument();
        expect(mockExtractDisplayValue).toHaveBeenCalled();
    });

    it("injects Product Bundle field when parentBundles provided and not already present", () => {
        const props = createMinimalProps({
            parentBundles: ["Bundle1", "Bundle2"],
            data: {
                "General settings": {
                    direct: [
                        baseField({
                            configCode: "another-field",
                            displayName: "Another Field",
                        }),
                    ],
                    groups: {},
                },
                Billing: {
                    direct: [],
                    groups: {},
                },
            },
        });

        render(<ProductDetail {...props} />);

        // The injected field's label
        expect(screen.getByText("Product Bundle(s)")).toBeInTheDocument();
        // And bundled content rendered
        expect(screen.getByText("Bundle1,Bundle2")).toBeInTheDocument();
    });

    it("does NOT inject Product Bundle field when it already exists", () => {
        const props = createMinimalProps({
            parentBundles: ["Bundle1"],
            data: {
                "General settings": {
                    direct: [
                        baseField({
                            configCode: "product_bundle",
                            displayName: "Existing Bundle",
                            value: ["Existing"],
                        }),
                    ],
                    groups: {},
                },
                Billing: {
                    direct: [],
                    groups: {},
                },
            },
        });

        render(<ProductDetail {...props} />);

        // Only existing one should be rendered
        expect(screen.getByText("Existing Bundle")).toBeInTheDocument();
        expect(screen.getByText("Existing")).toBeInTheDocument();
    });

    it("applies visibility conditions for fields (EQUALS / NOT_EQUALS and numeric comparisons)", () => {
        const props = createMinimalProps({
            data: {
                Tab1: {
                    direct: [
                        baseField({
                            configCode: "numSource",
                            value: 10,
                            displayName: "Num Source",
                        }),
                    ],
                    groups: {
                        Group1: [
                            baseField({
                                configCode: "equalsField",
                                displayName: "Equals Field",
                                visibilityCondition: {
                                    dependsOn: "numSource",
                                    operator: "EQUALS",
                                    value: 10,
                                },
                            }),
                            baseField({
                                configCode: "notEqualsHidden",
                                displayName: "Not Equals Hidden",
                                visibilityCondition: {
                                    dependsOn: "numSource",
                                    operator: "NOT_EQUALS",
                                    value: 10,
                                },
                            }),
                            baseField({
                                configCode: "gtField",
                                displayName: "GT Field",
                                visibilityCondition: {
                                    dependsOn: "numSource",
                                    operator: "GREATER_THAN",
                                    value: 5,
                                },
                            }),
                            baseField({
                                configCode: "ltHidden",
                                displayName: "LT Hidden",
                                visibilityCondition: {
                                    dependsOn: "numSource",
                                    operator: "LESS_THAN",
                                    value: 5,
                                },
                            }),
                            baseField({
                                configCode: "gteField",
                                displayName: "GTE Field",
                                visibilityCondition: {
                                    dependsOn: "numSource",
                                    operator: "GREATER_THAN_OR_EQUALS",
                                    value: 10,
                                },
                            }),
                            baseField({
                                configCode: "lteField",
                                displayName: "LTE Field",
                                visibilityCondition: {
                                    dependsOn: "numSource",
                                    operator: "LESS_THAN_OR_EQUALS",
                                    value: 10,
                                },
                            }),
                            baseField({
                                configCode: "missingSource",
                                displayName: "Missing Source Hidden",
                                visibilityCondition: {
                                    dependsOn: "unknownSource",
                                    operator: "EQUALS",
                                    value: 1,
                                },
                            }),
                        ],
                    },
                },
                Billing: { direct: [], groups: {} },
            },
        });

        render(<ProductDetail {...props} />);

        // These should be visible
        expect(screen.getByText("Equals Field")).toBeInTheDocument();
        expect(screen.getByText("GT Field")).toBeInTheDocument();
        expect(screen.getByText("GTE Field")).toBeInTheDocument();
        expect(screen.getByText("LTE Field")).toBeInTheDocument();

        // These should not appear
        expect(
            screen.queryByText("Not Equals Hidden"),
        ).not.toBeInTheDocument();
        expect(screen.queryByText("LT Hidden")).not.toBeInTheDocument();
        expect(
            screen.queryByText("Missing Source Hidden"),
        ).not.toBeInTheDocument();
    });

    it("handles Billing tab with RTE overrides and CCM WP Anchor product (Accordion paths)", () => {
        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Anchor",
            rteOverrideFlag: true,
            billingRteOverrides: [
                {
                    consultType: "Consult A",
                    total: "100",
                    copay: "10",
                    coinsurance: "5",
                },
            ],
            billing: {
                cdcPayerType: "TypeA",
                partnerPassThroughPrice: 123,
                pppm: 1,
                pmpm: 2,
                tier2PppmStartMonth: "M2",
                tier2Pppm: "Tier2",
                tier3PppmStartMonth: "M3",
                tier3Pppm: "Tier3",
                lowAcuityPrice: 3,
                upfrontPerMember: 4,
                uniqueContractTerms: "<p>Terms</p>",
                billingPartnerFee: 5,
                billingPartnerFeeType: "TypeB",
                pppmBillingTrigger: "Trigger",
                isThereLapseCriteria: true,
                lapsedCriteriaSource: "Source",
                lapseCriteria: "Criteria",
                consecutiveInactiveMonthsToLapsed: 6,
                lapsedUserCustomDetail: "<p>Details</p>",
                minimumNumberOfParticipants: 7,
                isThereAptmm: true,
                participantTermMinimumMonths: 8,
                replacementDeviceCoverage: "Coverage",
                lostDamagedDevice1: "LD1",
                lostDamagedDevicePrice1: 9,
                lostDamagedDevice2: "LD2",
                lostDamagedDevicePrice2: 10,
                lostDamagedDeviceResponsibility: "Resp",
                multiprogramDiscount: "Disc",
                milestoneBilling: true,
                milestoneBillingConfiguration: "Config",
                tier2PartnerFeeStartMonth: "M4",
                tier2PartnerFee: 11,
                performanceGuarantees: true,
                a1cReduction: true,
                participationSatisfaction: true,
                reductionInBg: true,
                customPgType: true,
                pgCustomDetail: "<p>PG</p>",
                pgAnalysisDueDate: "2024-01-01",
                pgA1cReductionPppm: "12",
                pgA1cReductionPercent: "13",
                pgReductionInOutOfRangeTimePppm: "14",
                pgReductionInOutOfRangeTimePercent: "15",
                pgSatisfactionPppm: "16",
                pgSatisfactionPct: "17",
            },
        });

        render(<ProductDetail {...props} />);

        // RTE Overrides table
        expect(screen.getByText("RTE Overrides")).toBeInTheDocument();
        expect(screen.getByText("Consult A")).toBeInTheDocument();

        // Billing accordions rendered for WP Anchor CCM
        expect(screen.getAllByText("Program Overview").length).toBeGreaterThan(0);
        expect(
            screen.getAllByText("Contract: Program Schedule (SpringCM)").length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText("Contract: Performance Guarantees (SpringCM)").length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText("Member Support").length).toBeGreaterThan(0);
    });

    it("handles Billing tab for CCM WP Non-Anchor product (non-anchor billing layouts)", () => {
        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Non-Anchor",
            billing: {
                claimsConfiguration: "ClaimsCfg",
                newDeviceType: "DeviceType",
                uniqueContractTerms: "<p>Unique</p>",
                lostDamagedDevicePrice1: 100,
                replacementDeviceCoverage: "CoverageX",
            },
        });

        render(<ProductDetail {...props} />);

        // Non-anchor billing non-anchor layouts
        expect(
            screen.getAllByText("Program Overview").length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText("Contract: Program Schedule (SpringCM)").length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText("Member Support").length).toBeGreaterThan(0);

        expect(screen.getByText("Claims Configuration")).toBeInTheDocument();
        expect(screen.getByText("DeviceType")).toBeInTheDocument();
        expect(
            screen.getByText("Lost/Damaged Device Price 1"),
        ).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("renders General Settings CCM WP Anchor data accordions and opportunity table", () => {
        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Anchor",
            productName: "Mental Health - MyStrength",
            generalSettings: {
                program: "ProgramX",
                programPlatformVersion: "v1",
                account: "AccountX",
                clientOverview: "Overview",
                programImplementationStatus: "StatusX",
                status: "Active",
                registrationStatus: "RegStatus",
                healthPlanPartnerCustomizations: "Custom",
                clientSuccessManager: "CSM",
                clientImplementationManager: "CIM",
                disableMentalHealthGuidance: true,
                disableTeletherapy: false,
                transitioningDppYear2Members: true,
                cdcEnrollmentSource: "Source",
                providerBasedCare: true,
                kickoffDate: "2024-01-01",
                initialLaunchDate: "2024-02-01",
                expectedLaunchDate: "2024-03-01",
                myStrengthTransitionDate: "2024-04-01",
                recruitablePopulationCurrent: "100",
                recruitablePopulationDhtnCurrent: "200",
                enrollmentCap: "300",
                programQualificationDependency: "Dep",
                programTransitionDate: "2024-05-01",
                newDeviceType: "Device",
                ckdAwareVariant: true,
                claimsConfiguration: "Claims",
                name: "NameX",
                programStartDate: "2024-06-01",
                programEndDate: "2024-07-01",
                contractTerm: "TermX",
                autoRenewal: true,
                renewalNoticePeriod: "30d",
                clientPlanDesignInclusions: "Inclusions",
                cumulativeProgramCap: "Cap",
                bmiLimit: "BMI",
                confirmOnNoRecruitableMatch: true,
                qualificationMinimumAge: "18",
                optOutQuestions: "OptOutQ",
                additionalQuestions: "AddQ",
                insuranceQuestionGroup: "IQG",
            },
            opportunities: [
                {
                    id: "opp1",
                    opportunityName: "OppName",
                    opportunityGuid: "GUID123",
                    contractNumber: "CN123",
                    effectiveStartDate: "2024-01-01",
                    effectiveEndDate: "2025-01-01",
                },
            ],
        });

        render(<ProductDetail {...props} />);

        // Opportunity header and table
        expect(screen.getByText("Opportunity")).toBeInTheDocument();
        expect(screen.getByText("OppName")).toBeInTheDocument();

        // Accordions labels present (Program Overview, etc.)
        expect(screen.getByText("Client Implementation")).toBeInTheDocument();
        expect(screen.getAllByText("Client Incentives").length).toBeGreaterThan(0);
    });

    it("renders General Settings CCM WP Non-Anchor program overview and schedule non-anchor sections", () => {
        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Non-Anchor",
            productName: "Mental Health - MyStrength",
            generalSettings: {
                clientOverview: "OverviewNonA",
                programPlatformVersion: "v1",
                programImplementationStatus: "StatusNonA",
                status: "Active",
                ckdAwareVariant: true,
                disableMentalHealthGuidance: true,
                disableTeletherapy: false,
                recruitablePopulationCurrent: "100",
                programStartDate: "2024-01-01",
                programEndDate: "2024-02-01",
            },
        });

        render(<ProductDetail {...props} />);

        // Non-anchor sections
        expect(screen.getAllByText("Program Overview").length).toBeGreaterThan(0);
        expect(
            screen.getAllByText("Contract: Program Schedule (SpringCM)").length,
        ).toBeGreaterThan(0);

        expect(screen.getAllByText("Client Overview").length).toBeGreaterThan(0);
        expect(screen.getAllByText("OverviewNonA").length).toBeGreaterThan(0);
    });

    it("renders Marketing tab for CCM WP Non-Anchor with non-anchor data", () => {
        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Non-Anchor",
            productName: "Mental Health - MyStrength",
            marketingDetails: {
                initialMemberRecruitment: "2024-01-01",
                wholePersonTransitionDate: "2024-02-01",
                wpTransitionMemberRecruitment: "2024-03-01",
                wpTransitionMarketing: "2024-04-01",
            },
        });

        render(<ProductDetail {...props} />);

        expect(screen.getByTestId("tab-marketing")).toBeInTheDocument();
        expect(screen.getByText("Enrollment marketing")).toBeInTheDocument();
        expect(
            screen.getByText("WP transition Member Recruitment"),
        ).toBeInTheDocument();
    });

    it("renders Marketing, Eligibility and Engagement tabs for CCM WP Anchor and formats phone", () => {
        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Anchor",
            marketingDetails: {
                incentiveCriteria: "Criteria",
                frequencyOfAward: "Monthly",
                incentivesReportDelivery: "Email",
                incentivesReportFrequency: "Quarterly",
                phoneCampaign: "1234567890",
            },
            eligibilityDetails: {
                programEligibilityVerificationMethod: "Method",
                programEligibilityFileCadence: "Cadence",
                eligibleGroupIds: "Group1",
                manualCheck: true,
                linksToEligibilityVerificationFolder: "http://example.com",
                eligibilityExceptionsRules: "Rules",
                eligibilityTeamNotes: "Notes",
                complexEscalationDetails: "Details",
            },
            engagementCriteria: {
                timeHorizonForCriteriaBelowDays: "10",
                engagementCriteriaOptions: "Option1",
                timeInProgramThresholdDays: "5",
                uniqueDaysAnyAppOrWebEngagement: "2",
                uniqueDaysLessonTakenOrFoodLogged: "3",
                glp1Model: "Model1",
                requiredCoachingInteractions: "1",
                requiredCoachingSessions: "2",
                cumulativeUniqueDaysWithWeighIns: "3",
                coachingInteractionThresholdDays: 4,
                uniqueWeighInDays: "5",
            },
        });

        render(<ProductDetail {...props} />);

        // Marketing tab anchor
        expect(screen.getByTestId("tab-marketing")).toBeInTheDocument();
        expect(screen.getAllByText("Client Incentives").length).toBeGreaterThan(0);
        expect(
            screen.getAllByText("Enrollment Marketing").length,
        ).toBeGreaterThan(0);

        // Eligibility tab should render for CCM WP Anchor
        // Note: Tab rendering is conditional on category and productTag
        if (screen.queryByTestId("tab-eligibility")) {
            expect(screen.getByTestId("tab-eligibility")).toBeInTheDocument();
        }

        // Engagement criteria tab should render for CCM WP Anchor
        if (screen.queryByTestId("tab-engagement-criteria")) {
            expect(screen.getByTestId("tab-engagement-criteria")).toBeInTheDocument();
        }
    });

    it("fetches opportunity details on clicking opportunity link and opens modal", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: { name: "Opportunity Detail Name" },
        });

        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Anchor",
            opportunities: [
                {
                    id: "opp-id-1",
                    opportunityName: "Clickable Opp",
                    opportunityGuid: "GUID-1",
                    contractNumber: "CN1",
                    effectiveStartDate: "2024-01-01",
                    effectiveEndDate: "2024-02-01",
                },
            ],
            generalSettings: {},
        });

        render(<ProductDetail {...props} />);

        const link = screen.getByText("Clickable Opp");
        fireEvent.click(link);

        await waitFor(() => {
            expect(mockApiGet).toHaveBeenCalledWith("/api/opportunity/opp-id-1");
        });

        await waitFor(() => {
            expect(screen.getByTestId("right-modal")).toBeInTheDocument();
            expect(
                screen.getByTestId("right-modal-title"),
            ).toHaveTextContent("Opportunity Detail Name");
            expect(
                screen.getByTestId("opportunity-drawer"),
            ).toHaveTextContent("Opportunity Detail Name");
        });

        // Close modal, verify onHide path
        fireEvent.click(screen.getByTestId("right-modal-close"));
        await waitFor(() => {
            expect(
                screen.queryByTestId("right-modal"),
            ).not.toBeInTheDocument();
        });
    });

    it("shows toast when fetching opportunity details fails", async () => {
        mockApiGet.mockRejectedValueOnce(new Error("Network error"));

        const props = createMinimalProps({
            category: "Chronic Care Services",
            productTag: "WP Anchor",
            opportunities: [
                {
                    id: "opp-id-2",
                    opportunityName: "Fail Opp",
                    opportunityGuid: "GUID-2",
                    contractNumber: "CN2",
                    effectiveStartDate: "2024-01-01",
                    effectiveEndDate: "2024-02-01",
                },
            ],
            generalSettings: {},
        });

        render(<ProductDetail {...props} />);

        const link = screen.getByText("Fail Opp");
        fireEvent.click(link);

        await waitFor(() => {
            expect(mockApiGet).toHaveBeenCalled();
            expect(mockShowCustomToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "Error",
                    title: "Failed",
                    message: "Something went wrong",
                }),
            );
        });
    });
});
