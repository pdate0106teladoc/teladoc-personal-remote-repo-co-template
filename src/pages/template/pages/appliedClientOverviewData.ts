export type AppliedOverviewStatus = "Active" | "Terminated";

export interface AppliedClientOverviewRow {
  id: string;
  name: string;
  contractNumber: string;
  status: AppliedOverviewStatus;
  groups: number;
  lastUpdatedIn: string;
  lastUpdatedOn: string;
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

const ORGANISATIONS = [
  "541 - Blue Cross Blue Shield of NC",
  "846 - BCBS City of Raleigh",
  "847 - BCBS City of Charlotte",
  "848 - BCBS City of Newton",
  "849 - BCBS City of Greensboro",
  "850 - BCBS City of Durham",
  "850 - BCBS City of Danobe",
  "851 - BCBS City of Brookline",
  "852 - BCBS City of Asheville",
  "853 - BCBS City of Fayetteville",
  "854 - BCBS City of Cary",
  "855 - BCBS Town of Faith",
  "849 - BCBS City of Yorkshire",
];

const CONTRACT_NUMBER = "202503-0012654";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const cohortDate = (index: number) => {
  const date = new Date(Date.UTC(2025, 11, 1));
  date.setUTCMonth(date.getUTCMonth() - index);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${String(date.getUTCFullYear()).slice(-2)}`;
};

const lastUpdatedOn = (index: number) => {
  const date = new Date(Date.UTC(2025, 0, 1));
  date.setUTCDate(date.getUTCDate() + index * 28);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

const clientOverviewName = (index: number) =>
  `Allied ${cohortDate(index)} WP DM+HTN+DPP Cohort`;

const buildRows = (
  count: number,
  status: AppliedOverviewStatus,
  nameForIndex: (index: number) => string,
): AppliedClientOverviewRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${status.toLowerCase()}-${index}`,
    name: nameForIndex(index),
    contractNumber: CONTRACT_NUMBER,
    status,
    groups: 25,
    lastUpdatedIn: LAST_UPDATED[index % LAST_UPDATED.length],
    lastUpdatedOn: lastUpdatedOn(index),
  }));

export const ACTIVE_CLIENT_OVERVIEWS = buildRows(115, "Active", clientOverviewName);
export const TERMINATED_CLIENT_OVERVIEWS = buildRows(
  10,
  "Terminated",
  clientOverviewName,
);

export const ACTIVE_ORGANISATIONS = buildRows(
  115,
  "Active",
  (index) => ORGANISATIONS[index % ORGANISATIONS.length],
);
export const TERMINATED_ORGANISATIONS = buildRows(
  10,
  "Terminated",
  (index) => ORGANISATIONS[index % ORGANISATIONS.length],
);
