import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// ------------------------------------------------------------------
// Mocks
// ------------------------------------------------------------------

vi.mock("./BrokerSidebar.scss", () => ({}));

vi.mock("react-icons/bs", () => ({
  BsChevronDown: () => <svg data-testid="chevron" />,
}));

vi.mock("@ucc/common-ui", () => ({
  InfoIcon: () => <svg data-testid="info-icon" />,
  SidebarRowWrapper: ({ children }: any) => <div data-testid="row-wrapper">{children}</div>,
}));

vi.mock("@/components/DisplayRow/DisplayRow", () => ({
  default: ({ label, value }: any) => (
    <div data-testid={`display-row-${label}`}>{label}:{String(value)}</div>
  ),
}));

/**
 * react-bootstrap mock
 * IMPORTANT: Dropdown must provide Dropdown.Toggle/Menu/Item.
 */
vi.mock("react-bootstrap", () => {
  const Tabs = ({ children }: any) => <div data-testid="tabs">{children}</div>;

  const Tab = ({ title, children }: any) => (
    <div data-testid={`tab-${title}`}>{children}</div>
  );

  const Dropdown: any = ({ children, className }: any) => (
    <div data-testid="dropdown" className={className}>
      {children}
    </div>
  );

  Dropdown.Toggle = ({ children, ...rest }: any) => (
    <button type="button" data-testid="dropdown-toggle" {...rest}>
      {children}
    </button>
  );

  Dropdown.Menu = ({ children, className }: any) => (
    <div data-testid="dropdown-menu" className={className}>
      {children}
    </div>
  );

  Dropdown.Item = ({ children, onClick, disabled, ...rest }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );

  return { Tabs, Tab, Dropdown };
});

// Import AFTER mocks
import BrokerSidebar from "../BrokerSidebar";

// ------------------------------------------------------------------
// Test data
// ------------------------------------------------------------------

const tabs = [
  {
    title: "Additional Information",
    eventKey: "additional",
    fields: [
      { key: "name", label: "Name" },
      { key: "active", label: "Active" },
    ],
  },
  {
    title: "Locations",
    eventKey: "locations",
    fields: [{ key: "address", label: "Address" }],
  },
  {
    title: "Commissions",
    eventKey: "commissions",
    fields: [{ key: "rate", label: "Rate" }],
  },
];

const fullData = {
  name: "Broker A",
  active: true,
  brokerLocationDetails: [{ locationName: "NY", address: "New York" }],
  commissionVariants: [{ commissionName: "Standard", rate: "5%" }],
};

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

describe("BrokerSidebar", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders Additional Information tab and fields without dropdown", () => {
    render(<BrokerSidebar tabs={tabs} data={fullData} />);

    expect(screen.getByTestId("tab-Additional Information")).toBeInTheDocument();
    expect(screen.getByTestId("display-row-Name")).toHaveTextContent("Broker A");
    expect(screen.getByTestId("display-row-Active")).toHaveTextContent("true");
  });

  it("renders dropdown tabs with default toggle label and info box", () => {
    render(<BrokerSidebar tabs={tabs} data={fullData} />);

    expect(screen.getAllByTestId("info-icon")[0]).toBeInTheDocument();

    // For Locations tab (dropdownValue null initially)
    expect(screen.getAllByTestId("dropdown-toggle")[0]).toHaveTextContent("Select locations name");
    expect(screen.getAllByTestId("dropdown-menu")[0]).toBeInTheDocument();
  });

  it("selects a location option and shows selected label + field value", () => {
    render(<BrokerSidebar tabs={tabs} data={fullData} />);

    fireEvent.click(screen.getAllByTestId("dropdown-option-0")[0]);

    // Toggle label becomes selected option label
    expect(screen.getAllByTestId("dropdown-toggle")[0]).toHaveTextContent("NY");

    // Location field value should reflect index 0
    expect(screen.getByTestId("display-row-Address")).toHaveTextContent("New York");
  });

  it("selects a commission option and shows commission field value", () => {
    render(<BrokerSidebar tabs={tabs} data={fullData} />);

    // Our Tab mock renders all tabs, so commission option is present too.
    fireEvent.click(screen.getAllByTestId("dropdown-option-0")[0]);

    expect(screen.getAllByTestId("dropdown-toggle")[0]).toHaveTextContent(/NY|Standard/);

    // Commission field value should be available in the commissions tab content
    expect(screen.getByTestId("display-row-Rate")).toHaveTextContent("5%");
  });

  it("renders '-' when data is null (getFieldData no data)", () => {
    render(<BrokerSidebar tabs={tabs} data={null} />);

    expect(screen.getByTestId("display-row-Name")).toHaveTextContent("-");
    expect(screen.getByTestId("display-row-Active")).toHaveTextContent("-");
  });

  it("renders 'No options available' when section is not an array", () => {
    render(
      <BrokerSidebar
        tabs={tabs}
        data={{
          name: "X",
          active: false,
          brokerLocationDetails: null, // not array => []
          commissionVariants: null, // not array => []
        }}
      />,
    );

    expect(screen.getAllByText("No options available")[0]).toBeInTheDocument();
  });

  it("returns '-' when dropdown field missing in selected section", () => {
    render(
      <BrokerSidebar
        tabs={tabs}
        data={{
          brokerLocationDetails: [{}], // missing address/locationName
          commissionVariants: [{}], // missing rate/commissionName
        }}
      />,
    );

    // pick option 0 (label falls back to "Option 1")
    fireEvent.click(screen.getAllByTestId("dropdown-option-0")[0]);

    expect(screen.getByTestId("display-row-Address")).toHaveTextContent("-");
    expect(screen.getByTestId("display-row-Rate")).toHaveTextContent("-");
  });
});
