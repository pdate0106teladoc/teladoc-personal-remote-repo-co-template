import React from "react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";

const MOCK_ID = "grp-123";

let mockGeneralSettings: any | undefined;
let mockGroupUpdatedAt: string | undefined;

const mockSetGroupName = vi.fn();
const mockSetGroupId = vi.fn();
const mockSetGroupShortId = vi.fn();
const mockSetUpdatedAt = vi.fn();
const mockSetOrg = vi.fn();

vi.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => ({ id: MOCK_ID }),
  useOutletContext: vi.fn(() => ({ handleSaveChanges: vi.fn(), groupMetadata: { groupGeneralSettings: null } })),
  useLocation: vi.fn(() => ({ pathname: "/" })),
}));

vi.mock("react-bootstrap", () => ({
  __esModule: true,
  Tabs: ({
    children,
    defaultActiveKey,
  }: {
    children: React.ReactNode;
    defaultActiveKey?: string;
  }) => (
    <div data-testid="tabs" data-active={defaultActiveKey}>
      {children}
    </div>
  ),
  Tab: ({
    eventKey,
    title,
    children,
  }: {
    eventKey: string;
    title: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div data-testid={`tab-${eventKey}`}>
      <div data-testid={`tab-title-${eventKey}`}>{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/store/useGroupStore", () => ({
  __esModule: true,
  default: (selector: any) =>
    selector({
      generalSettingsCache: mockGeneralSettings
        ? { [MOCK_ID]: mockGeneralSettings }
        : {},
    }),
}));

vi.mock("@/store/configStore", () => ({
  __esModule: true,
  default: (selector: any) =>
    selector({
      setGroupName: mockSetGroupName,
      setGroupId: mockSetGroupId,
      setGroupShortId: mockSetGroupShortId,
      setGroupUpdatedAt: mockSetUpdatedAt,
      setOrg: mockSetOrg,
      groupUpdatedAt: mockGroupUpdatedAt,
    }),
}));

vi.mock("@/components/RenderAllSection/RenderAllSection", () => ({
  __esModule: true,
  default: ({ data }: { data: any }) => (
    <div data-testid="render-all-sections">
      {Array.isArray(data) ? `sections:${data.length}` : "sections"}
    </div>
  ),
}));

vi.mock("@/components/Failsafe/FailSafePage", () => ({
  __esModule: true,
  default: ({ cardType }: { cardType: string }) => (
    <div data-testid="failsafe-page">FailSafe: {cardType}</div>
  ),
}));

vi.mock("@/components/Cards/CustomCards", () => ({
  __esModule: true,
  CustomCards: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section data-testid="custom-card">
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

const mockCustomTable = vi.fn(
  ({
    data,
    columns,
  }: {
    data: any[];
    columns: Array<{
      field?: string;
      render?: (val: any, row: any) => React.ReactNode;
    }>;
  }) => (
    <table data-testid="custom-table">
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} data-testid="custom-row">
            {columns?.length
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
              : null}
          </tr>
        ))}
      </tbody>
    </table>
  ),
);

vi.mock("@/components/CustomTable/DataTable", () => ({
  __esModule: true,
  default: (props: any) => mockCustomTable(props),
}));

vi.mock("@/constants", () => ({
  __esModule: true,
  LABELS: {
    grpGeneralSetting: {
      CMC_RECORD_TYPE: "CMC Record Type",
      CODE: "Code",
      CMC_USED_FOR_REGISTRATION_LABEL: "Used For Registration",
      ACTIVE: "Active",
      EFFECTIVE_DATE_LABEL: "Effective Date",
      DEACTIVATED_DATE_LABEL: "Deactivated Date",
      ACCOUNT: "Account",
      LAST_MODIFIED_BY_LABEL: "Last Modified By",
      ORGANIZATIONS_LABEL: "Organizations",
      GROUPS_LABEL: "Groups",
      CM_CODE_ASSIGNMENT_ID: "CM Code Assignment Id",
      CMC_CODE: "CMC Code",
      RECORD_TYPE: "Record Type",
      CMC_ASSOCIATION_ID: "CMC Association Id",
      PROGRAM_NUMBER: "Program Number",
      PROGRAM_OVERVIEW_NAME: "Program Overview Name",
      SERVICE: "Service",
      ROUTING_RULE: "Routing Rule",
      ID: "Id",
      DATE_TIME: "Date Time",
      CHANGED_BY: "Changed By",
      PROMOTION: "Promotion",
      FAMILY: "Family",
      SERVICE_SPECIALITIES: "Service Specialties",
      INTERVAL: "Interval",
      PER_INTERVAL: "Per Interval",
      DISCOUNT_TYPE: "Discount Type",
      DATE_ADDED: "Date Added",
      CURRENT_START_DATE: "Current Start Date",
      CURRENT_END_DATE: "Current End Date",
    },
  },
}));

const mockExtractDisplayValue = vi.fn(
  (value: any, type: string) => ({
    jsx: (
      <span data-testid={`extract-${type}`}>{String(value)}</span>
    ),
    raw: `raw-${String(value)}`,
  }),
);

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  __esModule: true,
  extractDisplayValue: (val: any, type: string) =>
    mockExtractDisplayValue(val, type),
}));

vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    FailSafePage: ({ cardType }: { cardType: string }) => (
      <div data-testid="failsafe-page">FailSafe: {cardType}</div>
    ),
    CustomTable: (props: any) => mockCustomTable(props),
    SideModal: ({
      show,
      title,
      children,
      onHide,
    }: {
      show: boolean;
      title: string;
      children: React.ReactNode;
      onHide: () => void;
    }) =>
      show ? (
        <div data-testid="right-modal">
          <div data-testid="right-modal-title">{title}</div>
          <button
            type="button"
            data-testid="right-modal-close"
            onClick={onHide}
          >
            Close
          </button>
          {children}
        </div>
      ) : null,
  };
});

vi.mock("@/components/sidebar/SliderContentGeneralSettings", () => ({
  __esModule: true,
  SliderChild: ({
    data,
  }: {
    data: any;
    fieldsOrder: any;
  }) => (
    <div data-testid="slider-child">
      SliderChild {String(data?.cmCodeAssignmentId)}
    </div>
  ),
}));

vi.mock("@/components/sidebar/CmcAssociationDetails", () => ({
  __esModule: true,
  CmcAssociationDetails: ({
    data,
  }: {
    data: any;
    fieldsOrder: any;
  }) => (
    <div data-testid="cmc-details">
      CmcDetails {String(data?.cmcAssociationId)}
    </div>
  ),
}));

const mockGetSafeString = vi.fn(
  (v: any) => (v == null ? "" : String(v)),
);

vi.mock("@/utils", () => ({
  __esModule: true,
  getSafeString: (v: any) => mockGetSafeString(v),
  formatDateUTC: (v: any) => v || "-",
}));

vi.mock("@/data/group/general-setting", () => ({
  __esModule: true,
  renderGeneralSettingOverviewSec1: (_gs: any) => [{ id: "ov1" }],
  renderGeneralSettingOverviewSec2: (_gs: any) => [{ id: "ov2" }],
  renderGroupPermissions: (_gs: any) => [{ id: "perm" }],
  renderGroupRelationships: (_gs: any) => [{ id: "rel" }],
  renderClinicalAndMemberSupport: (_gs: any) => [{ id: "clin" }],
}));

import GeneralSettingGrp from "../pages/GeneralSetting";

const buildGeneralSettings = (overrides: Partial<any> = {}) => ({
  updatedAt: "2024-01-01T00:00:00.000Z",
  overview: {
    groupOverview: {
      groupName: "Group Name",
      legacyGroupId: "LEG-1",
      groupId: "G-1",
      organizationName: "Org Name",
      organizationId: "ORG-1",
    },
    clientMemberCodes: {
      cmCodeAssignmentId: "CMC-ASSIGN-1",
      code: "CODE-1",
      cmcRecordType: "RecordType1",
      usedForRegistration: true,
      isActive: false,
      effectiveDate: "2024-01-01",
      deactivatedDate: "2025-01-01",
      account: "Account A",
    },
    cmcAssociations: [
      {
        cmcAssociationId: "ASSOC-1",
        recordType: "AssocType",
        cmcCode: "CMC-1",
        programNumber: "PN-1",
        programOverviewName: "Program One",
        account: "Account B",
      },
    ],
    routingRules: [
      {
        service: "Service1",
        routingRule: "Rule1",
        id: "RR-1",
        dateTime: "2024-02-01",
        changedBy: "User1",
      },
    ],
    groupOffers: [
      {
        promotion: "Amount Off Consultation",
        family: true,
        serviceSpecialties: ["Spec1", "Spec2"],
        interval: "Month",
        perInterval: "Once",
        discountAmount: 10,
        discountPercent: null,
        dateAdded: "2024-03-01",
        currentStartDate: "2024-03-10",
        currentEndDate: "2024-06-10",
      },
      {
        promotion: "Percent Off",
        family: false,
        serviceSpecialties: null,
        interval: "Year",
        perInterval: "Twice",
        discountAmount: null,
        discountPercent: 15,
        dateAdded: "2024-04-01",
        currentStartDate: "2024-04-10",
        currentEndDate: "2024-07-10",
      },
    ],
  },
  ...overrides,
});

describe("GeneralSettingGrp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneralSettings = undefined;
    mockGroupUpdatedAt = undefined;
  });

  it("renders FailSafePage when generalSettings not found", () => {
    mockGeneralSettings = undefined;

    render(<GeneralSettingGrp />);

    expect(screen.getByTestId("failsafe-page")).toHaveTextContent(
      "FailSafe: noData",
    );
  });

  it("sets config store values and updatedAt when no previous groupUpdatedAt", () => {
    mockGeneralSettings = buildGeneralSettings();
    mockGroupUpdatedAt = undefined;

    render(<GeneralSettingGrp />);

    expect(mockSetGroupName).toHaveBeenCalledWith("Group Name");
    expect(mockSetGroupId).toHaveBeenCalledWith("LEG-1");
    expect(mockSetGroupShortId).toHaveBeenCalledWith("G-1");
    expect(mockSetUpdatedAt).toHaveBeenCalledWith(
      "2024-01-01T00:00:00.000Z",
    );
    expect(mockSetOrg).toHaveBeenCalledWith({
      orgName: "Org Name",
      orgUUID: "ORG-1",
    });
  });

  it("updates updatedAt when stored date is invalid and api date is valid", () => {
    mockGeneralSettings = buildGeneralSettings({
      updatedAt: "2024-05-01T00:00:00.000Z",
    });
    mockGroupUpdatedAt = "not-a-date";

    render(<GeneralSettingGrp />);

    expect(mockSetUpdatedAt).toHaveBeenCalledWith(
      "2024-05-01T00:00:00.000Z",
    );
  });

  it("updates updatedAt when api date is newer than stored date", () => {
    mockGeneralSettings = buildGeneralSettings({
      updatedAt: "2024-06-01T00:00:00.000Z",
    });
    mockGroupUpdatedAt = "2024-01-01T00:00:00.000Z";

    render(<GeneralSettingGrp />);

    expect(mockSetUpdatedAt).toHaveBeenCalledWith(
      "2024-06-01T00:00:00.000Z",
    );
  });

  it("does not update updatedAt when api date is older than stored date", () => {
    mockGeneralSettings = buildGeneralSettings({
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    mockGroupUpdatedAt = "2025-01-01T00:00:00.000Z";

    render(<GeneralSettingGrp />);

    expect(mockSetUpdatedAt).not.toHaveBeenCalled();
  });

  it("renders overview tab, tables, and uses extractDisplayValue & getSafeString", () => {
    mockGeneralSettings = buildGeneralSettings();

    render(<GeneralSettingGrp />);

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(
      screen.getByTestId("tab-title-overview"),
    ).toHaveTextContent("Overview");
    expect(
      screen.getByTestId("tab-title-group-permissions"),
    ).toHaveTextContent("Group permissions");
    expect(
      screen.getByTestId("tab-title-group-relationships"),
    ).toHaveTextContent("Group relationships");
    expect(
      screen.getByTestId(
        "tab-title-clinical-and-member-support",
      ),
    ).toHaveTextContent("Clinical and member support");

    const sections = screen.getAllByTestId("render-all-sections");
    expect(sections.length).toBeGreaterThanOrEqual(5);

    expect(screen.getByText("Client Member Code")).toBeInTheDocument();
    expect(screen.getByText("CMC Associations")).toBeInTheDocument();
    expect(screen.getByText("Routing rules")).toBeInTheDocument();
    expect(screen.getByText("Group offers")).toBeInTheDocument();

    expect(screen.getAllByTestId("custom-table").length).toBeGreaterThanOrEqual(
      4,
    );
    expect(mockCustomTable).toHaveBeenCalled();

    expect(mockGetSafeString).toHaveBeenCalled();

    expect(
      mockExtractDisplayValue,
    ).toHaveBeenCalledWith(true, "boolean");
    expect(
      mockExtractDisplayValue,
    ).toHaveBeenCalledWith(false, "boolean");
  });

  it("opens and closes RightModal for Client Member Code row", () => {
    mockGeneralSettings = buildGeneralSettings();

    render(<GeneralSettingGrp />);

    const link = screen.getByText("CMC-ASSIGN-1");
    fireEvent.click(link);

    expect(screen.getByTestId("right-modal")).toBeInTheDocument();
    expect(
      screen.getByTestId("right-modal-title"),
    ).toHaveTextContent("CMC-ASSIGN-1");
    expect(screen.getByTestId("slider-child")).toHaveTextContent(
      "CMC-ASSIGN-1",
    );

    fireEvent.click(screen.getByTestId("right-modal-close"));
    expect(
      screen.queryByTestId("right-modal"),
    ).not.toBeInTheDocument();
  });

  it("opens CMC Association modal and renders discount text for group offers", () => {
    mockGeneralSettings = buildGeneralSettings();

    render(<GeneralSettingGrp />);

    const assocLink = screen.getByText("ASSOC-1");
    fireEvent.click(assocLink);

    expect(screen.getByTestId("right-modal")).toBeInTheDocument();
    expect(
      screen.getByTestId("right-modal-title"),
    ).toHaveTextContent("ASSOC-1");
    expect(screen.getByTestId("cmc-details")).toHaveTextContent(
      "ASSOC-1",
    );

    expect(screen.getByText("$10 Off")).toBeInTheDocument();

    expect(screen.getByText("15% Off")).toBeInTheDocument();

    expect(
      screen.getByText("Spec1, Spec2"),
    ).toBeInTheDocument();
  });
});
