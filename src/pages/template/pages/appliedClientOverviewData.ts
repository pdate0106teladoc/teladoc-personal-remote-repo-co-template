export type AppliedOverviewStatus = "Active" | "Terminated";

export interface AppliedClientOverviewRow {
  id: string;
  name: string;
  contractNumber: string;
  status: AppliedOverviewStatus;
  groups: number;
  lastUpdatedIn: string;
}

const LAST_UPDATED = [
  "Joe's Pizza",
  "Mark's BBQ",
  "Kevin's Seafood",
  "Ella's Sushi",
  "Alex's Sandwiches",
  "Linda's Burgers",
  "Rachel's Smoothies",
  "Nina's Desserts",
  "Tony's Pasta",
];

const CONTRACT_NUMBER = "202503-0012654";

const cohortDate = (index: number) => {
  const date = new Date(Date.UTC(2025, 11, 1));
  date.setUTCMonth(date.getUTCMonth() - index);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${String(date.getUTCFullYear()).slice(-2)}`;
};

const buildRows = (count: number, status: AppliedOverviewStatus): AppliedClientOverviewRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${status.toLowerCase()}-${index}`,
    name: `Allied ${cohortDate(index)} WP DM+HTN+DPP Cohort`,
    contractNumber: CONTRACT_NUMBER,
    status,
    groups: 25,
    lastUpdatedIn: LAST_UPDATED[index % LAST_UPDATED.length],
  }));

export const ACTIVE_CLIENT_OVERVIEWS = buildRows(115, "Active");
export const TERMINATED_CLIENT_OVERVIEWS = buildRows(10, "Terminated");
