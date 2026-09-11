import { getInitials } from "@/utils";

export interface ProgramOverviewSummary {
  id: string;
  name: string;
  program: string;
  initialLaunchDate: string;
}

export interface ProgramOverviewField {
  label: string;
  value: unknown;
  format?: "text" | "date" | "boolean" | "person" | "currency";
  personMeta?: { name: string; initials: string };
}

export const ALLIED_PROGRAM_OVERVIEWS: ProgramOverviewSummary[] = [
  {
    id: "allied-diabetes-care",
    name: "Allied - Diabetes Care",
    program: "Diabetes Care",
    initialLaunchDate: "2026-01-01T00:00:00Z",
  },
  {
    id: "allied-hypertension",
    name: "Allied - Hypertension",
    program: "Hypertension",
    initialLaunchDate: "2026-01-01T00:00:00Z",
  },
];

const EMPTY_VALUE = "-";
const PROGRAM_DATE = "2025-01-01T00:00:00Z";

const person = (name: string) => ({
  value: { displayName: name },
  format: "person" as const,
  personMeta: { name, initials: getInitials(name) },
});

export const buildProgramOverviewFields = (
  overview: ProgramOverviewSummary,
): ProgramOverviewField[] => [
  { label: "Program", value: overview.program },
  { label: "Program Platform Version", value: "Retrofit" },
  { label: "Account", value: "Aetna" },
  { label: "Client Overview", value: "Aetna – Livongo" },
  { label: "Program Implementation Status", value: "Launched +90" },
  { label: "Status", value: "Active" },
  { label: "Registration Status", value: "Open" },
  { label: "Health Plan Partner Customization", value: "Aetna Diabetes Management" },
  { label: "Client Success Manager", ...person("Connor Hudson") },
  { label: "Client Implementation Manager", ...person("Jane Williams") },
  { label: "Disable Mental Health Guidance", value: true, format: "boolean" },
  { label: "Disable Teletherapy", value: true, format: "boolean" },
  { label: "Transitioning DPP Year 2 members", value: true, format: "boolean" },
  { label: "CDC Payer Type", value: EMPTY_VALUE },
  { label: "CDC Enrollment Source", value: EMPTY_VALUE },
  { label: "Provider Based Care", value: true, format: "boolean" },
  { label: "Kickoff Date", value: PROGRAM_DATE, format: "date" },
  { label: "Initial Launch Date", value: overview.initialLaunchDate, format: "date" },
  { label: "Expected Launch Date", value: PROGRAM_DATE, format: "date" },
  { label: "MyStrength Transition Date", value: PROGRAM_DATE, format: "date" },
  { label: "Recruitable Population - Current", value: EMPTY_VALUE },
  { label: "Recruitable Population (D+HTN)", value: EMPTY_VALUE },
  { label: "Enrollment Cap", value: EMPTY_VALUE },
  { label: "Program Qualification Dependency", value: EMPTY_VALUE },
  { label: "Program Transition", value: PROGRAM_DATE, format: "date" },
  { label: "New Device Type", value: "HT900" },
  { label: "CKD Aware Variant", value: true, format: "boolean" },
  { label: "Claims Configuration", value: EMPTY_VALUE },
  { label: "Partner Pass Through Price", value: 0, format: "currency" },
];

export const buildProgramOverviewGeneralSettingsSections = (
  overview: ProgramOverviewSummary,
): ProgramOverviewFieldSection[] => {
  const overviewFields = buildProgramOverviewFields(overview);

  return [
    {
      title: "Program Overview",
      left: overviewFields.slice(0, 15),
      right: overviewFields.slice(15),
    },
    {
      title: "Program Schedule",
      left: [
        { label: "Name", value: "Teamcare - Compr" },
        {
          label: "Program start date",
          value: "2026-01-01T00:00:00Z",
          format: "date",
        },
        {
          label: "Program end date",
          value: "2026-02-22T00:00:00Z",
          format: "date",
        },
      ],
      right: [
        { label: "Contract term", value: "25" },
        { label: "Auto renewal", value: true, format: "boolean" },
        { label: "Renewal notice period", value: "47" },
      ],
    },
    {
      title: "Client Incentives",
      left: [{ label: "Client plan design inclusions", value: EMPTY_VALUE }],
      right: [{ label: "Provider based care", value: true, format: "boolean" }],
    },
    {
      title: "Client implementation",
      left: [
        { label: "Cumulative program cap", value: EMPTY_VALUE },
        { label: "BMI limit", value: EMPTY_VALUE },
        {
          label: "Confirm on no recruitable match",
          value: true,
          format: "boolean",
        },
        { label: "Qualification minimum age", value: EMPTY_VALUE },
      ],
      right: [
        { label: "Opt out questions", value: EMPTY_VALUE },
        { label: "Additional questions", value: EMPTY_VALUE },
        { label: "Insurance question group", value: EMPTY_VALUE },
      ],
    },
  ];
};

export interface ProgramOverviewFieldSection {
  title: string;
  left: ProgramOverviewField[];
  right: ProgramOverviewField[];
}

export const buildProgramOverviewBillingSections =
  (): ProgramOverviewFieldSection[] => [
    {
      title: "Contract: Program Schedule",
      left: [
        { label: "Unique Contract Terms", value: EMPTY_VALUE },
        { label: "Lost/Damaged Device Price 1", value: EMPTY_VALUE },
        { label: "PPPM", value: EMPTY_VALUE },
        { label: "PMPM", value: EMPTY_VALUE },
        { label: "Tier 2 PPPM Start Month", value: EMPTY_VALUE },
        { label: "Tier 2 PPPM", value: EMPTY_VALUE },
        { label: "Tier 3 PPPM Start Month", value: EMPTY_VALUE },
        { label: "Tier 3 PPPM", value: EMPTY_VALUE },
        { label: "Consecutive Inactive Months to Lapse", value: "2" },
        { label: "Minimum Number of Participants", value: EMPTY_VALUE },
        { label: "Is there a PTMM?", value: true, format: "boolean" },
        { label: "Participant Term Minimum Months", value: "10" },
        { label: "Multiprogram Discount", value: EMPTY_VALUE },
        { label: "Milestone Billing", value: true, format: "boolean" },
        {
          label: "Milestone Billing Configuration",
          value: "Livongo Standard 2.0",
        },
      ],
      right: [
        { label: "Low Acuity Price", value: EMPTY_VALUE },
        { label: "Upfront Per Member", value: EMPTY_VALUE },
        { label: "Unique Contract Terms", value: EMPTY_VALUE },
        { label: "Billing Partner Fee", value: EMPTY_VALUE },
        { label: "Billing Partner Fee Type", value: "Administrative" },
        { label: "PPPM Billing Trigger", value: "First Device Reading" },
        { label: "Is there Lapse Criteria?", value: true, format: "boolean" },
        { label: "Lapsed Criteria Source", value: "Program Agreement" },
        { label: "Lapse Criteria", value: "Any Activity V2" },
        { label: "Lapsed User Custom Detail", value: EMPTY_VALUE },
        { label: "Lost/Damaged Device 1", value: "Blood Glucose Meter" },
        { label: "Lost/Damaged Device Price 1", value: EMPTY_VALUE },
        { label: "Lost/Damaged Device 2", value: EMPTY_VALUE },
        { label: "Lost/Damaged Device Price 2", value: EMPTY_VALUE },
        { label: "Lost/Damaged Device Responsibility", value: "Livongo" },
      ],
    },
    {
      title: "Program overview",
      left: [
        { label: "Claims configuration", value: EMPTY_VALUE },
        { label: "New device type", value: EMPTY_VALUE },
      ],
      right: [
        { label: "CDC payer type", value: EMPTY_VALUE },
        { label: "Partner pass through price", value: EMPTY_VALUE },
      ],
    },
    {
      title: "Member support",
      left: [{ label: "Replacement device coverage", value: EMPTY_VALUE }],
      right: [],
    },
    {
      title: "Performance Guarantees",
      left: [
        { label: "Is performance guarantees applicable?", value: EMPTY_VALUE },
        { label: "A1C reduction", value: true, format: "boolean" },
        { label: "Participant satisfaction", value: EMPTY_VALUE },
        { label: "Reduction in BG", value: true, format: "boolean" },
        { label: "Custom BG type", value: true, format: "boolean" },
        { label: "PG custom detail", value: EMPTY_VALUE },
        { label: "PG analysis due date", value: EMPTY_VALUE },
      ],
      right: [
        { label: "PG A1C reduction PPPM", value: EMPTY_VALUE },
        { label: "PG A1C reduction percent", value: EMPTY_VALUE },
        {
          label: "PG reduction in out of range time PPPM",
          value: EMPTY_VALUE,
        },
        {
          label: "PG reduction in out of range time Percent",
          value: EMPTY_VALUE,
        },
        { label: "PG satisfaction PPPM", value: EMPTY_VALUE },
        { label: "PG satisfaction percent", value: EMPTY_VALUE },
      ],
    },
  ];

export const buildProgramOverviewMarketingSections =
  (): ProgramOverviewFieldSection[] => [
    {
      title: "Client Incentives",
      left: [
        { label: "Incentive Criteria", value: "Days Checking" },
        { label: "Frequency of Award", value: "Weekly" },
        { label: "Incentives Report Delivery", value: "Secure FTP" },
        { label: "Incentives Report Frequency", value: "Quarterly" },
        { label: "Client Incentives Disclaimer", value: EMPTY_VALUE },
      ],
      right: [
        { label: "Client Incentives Header", value: EMPTY_VALUE },
        { label: "Client Incentive Step 1", value: EMPTY_VALUE },
        { label: "Client Incentive Step 2", value: EMPTY_VALUE },
        { label: "Client Incentive Step 3", value: EMPTY_VALUE },
      ],
    },
    {
      title: "Program Overview",
      left: [
        { label: "Initial Member Recruitment", value: EMPTY_VALUE },
        { label: "WP Transition Member Recruitment", value: EMPTY_VALUE },
      ],
      right: [{ label: "Whole Person Transition Date", value: EMPTY_VALUE }],
    },
    {
      title: "Enrollment Marketing",
      left: [{ label: "WP Transition Target Marketing", value: EMPTY_VALUE }],
      right: [{ label: "Phone Campaign", value: "Phone + SMS" }],
    },
  ];

export const buildProgramOverviewEligibilitySections =
  (): ProgramOverviewFieldSection[] => [
    {
      title: "Program Eligibility",
      left: [
        {
          label: "Program Eligibility Verification Method",
          value: "RTE + (File OR Group ID)",
        },
        { label: "Program Eligibility File Cadence", value: "Weekly" },
        { label: "Eligible Group IDs", value: EMPTY_VALUE },
        { label: "Manual Check", value: true, format: "boolean" },
      ],
      right: [
        {
          label: "Links to Eligibility Verification Folder",
          value: EMPTY_VALUE,
        },
        { label: "Eligibility Exceptions/Rules", value: EMPTY_VALUE },
        { label: "Eligibility team notes", value: EMPTY_VALUE },
        { label: "Complex Escalation Details", value: EMPTY_VALUE },
      ],
    },
  ];

export const buildProgramOverviewEngagementSections =
  (): ProgramOverviewFieldSection[] => [
    {
      title: "Program Engagement Criteria",
      left: [
        { label: "Time horizon for criteria below (days)", value: EMPTY_VALUE },
        { label: "Engagement Criteria Option", value: "Default ESI" },
        { label: "Time in program threshold (days)", value: EMPTY_VALUE },
        { label: "Unique weight-in days", value: EMPTY_VALUE },
      ],
      right: [
        {
          label: "Unique days any app or web engagement",
          value: EMPTY_VALUE,
        },
        {
          label: "Unique days lesson taken or tool logged",
          value: EMPTY_VALUE,
        },
        { label: "GLP-1 Model", value: EMPTY_VALUE },
        { label: "Coaching Sessions", value: EMPTY_VALUE },
      ],
    },
    {
      title: "(Legacy Fields)",
      left: [
        { label: "Required coaching interactions", value: "None" },
        { label: "Required coaching sessions", value: "5" },
        { label: "Cumulative unique days with weigh-ins", value: "26" },
      ],
      right: [
        { label: "Coaching interaction threshold (days)", value: "10" },
        { label: "Unique weigh-in days (last 14)", value: "6" },
        { label: "GLP-1 Model", value: EMPTY_VALUE },
      ],
    },
  ];
