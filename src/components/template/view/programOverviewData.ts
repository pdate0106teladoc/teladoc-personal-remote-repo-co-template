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

/** `DisplayRow` derives two-letter initials; the design shows a single letter. */
const person = (name: string) => ({
  value: { displayName: name },
  format: "person" as const,
  personMeta: { name, initials: name.charAt(0).toUpperCase() },
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
