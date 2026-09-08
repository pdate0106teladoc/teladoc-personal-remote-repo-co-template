import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BrokerCard from "./BrokerCard";
import BrokerSidebar from "../sidebar/BrokerSidebar";

// Mock react-bootstrap components
vi.mock("react-bootstrap", () => {
  const Card: any = ({ children, className }: any) => <div className={`custom-card ${className || ''}`}>{children}</div>;
  Card.Header = ({ children, className }: any) => <div className={className}>{children}</div>;
  Card.Body = ({ children, className }: any) => <div className={className}>{children}</div>;

  return {
    Card,
    Tab: ({ children }: any) => <div>{children}</div>,
    Tabs: ({ children }: any) => <div>{children}</div>,
  };
});

vi.mock("@ucc/common-ui", () => ({
  DisplayRow: ({ label, value }: any) => (
    <div data-testid="display-row">
      {label}: {value}
    </div>
  ),
  SideModal: ({ show, onHide, title, children }: any) =>
    show ? (
      <div data-testid="right-modal">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onHide} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../sidebar/BrokerSidebar", () => ({
  default: ({ tabs }: any) => (
    <div data-testid="broker-sidebar">
      {tabs?.map((tab: any) => <div key={tab.eventKey}>{tab.title}</div>)}
    </div>
  ),
}));

vi.mock("@/data/organization/general-settings", () => ({
  renderBrokerCommisionData: vi.fn((data) => {
    if (!data || data.length === 0) return [];
    // Return transformed data structure as the component expects
    return data.map((item: any) => ({
      [item.partnerAccount || "Broker Name 1"]: {
        brokerType: item.partnerRelationshipsType || "Primary",
        rows: {
          column1: [
            { label: "Broker ID", value: item.salesforceId || "12345", format: "text" as const },
            { label: "Status", value: item.isBrokerActive ? "Active" : "Inactive", format: "text" as const },
          ],
          column2: [
            { label: "Contact", value: item.brokerContact || "broker@example.com", format: "contact" as const },
          ],
        },
      },
    }));
  }),
}));

describe("BrokerSidebar", () => {
  const mockTabs = [
    { eventKey: "commission", title: "Commission", fields: [] },
    { eventKey: "location", title: "Location", fields: [] },
  ];

  it("renders tabs with commission and location", () => {
    render(<BrokerSidebar tabs={mockTabs} />);

    expect(screen.getByText("Commission")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
  });

  it("renders tabs correctly", () => {
    render(<BrokerSidebar tabs={mockTabs} />);

    const sidebar = screen.getByTestId("broker-sidebar");
    expect(sidebar).toBeInTheDocument();
  });

  it("renders empty when no tabs provided", () => {
    render(<BrokerSidebar tabs={[]} />);

    const sidebar = screen.getByTestId("broker-sidebar");
    expect(sidebar).toBeInTheDocument();
  });
});

describe("BrokerCard", () => {
  const mockData = [
    {
      isBrokerActive: true,
      salesforceId: "12345",
      accountRelationshipName: "Test Relationship",
      partnerAccount: "Broker Name 1",
      partnerRelationshipsToTeladoc: "Teladoc",
      partnerRelationshipsType: "Primary",
      servicingContractType: "Standard",
      clientAccount: "Client 1",
      clientAccountId: "C123",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      effectiveStartDate: "2024-01-01",
      effectiveEndDate: "2024-12-31",
      contractOverview: "Test contract",
      hasBroker: true,
      brokerFee: "5%",
      brokerContact: "broker@example.com",
      brokerFlatRate: "100",
      brokerPercentage: "5",
      compositeKey: "KEY123",
      brokerLocationId: "LOC123",
      brokerLocationName: "Location 1",
      chronicCareBrokerFlatRate: "50",
      chronicCareBrokerPercentage: "3",
      note: "Test note",
      commissionVariants: [],
      brokerLocationDetails: [],
    },
  ];

  describe("Rendering", () => {
    it("renders broker card with data", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      expect(screen.getByText("Broker Name 1")).toBeInTheDocument();
      expect(screen.getByText("Primary")).toBeInTheDocument();
    });

    it("renders multiple columns based on data structure", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      const displayRows = screen.getAllByTestId("display-row");
      expect(displayRows.length).toBeGreaterThan(0);
    });

    it("renders with custom className", () => {
      const { container } = render(<BrokerCard dataForBroker={mockData} className="custom-class" />);

      const card = container.querySelector(".custom-card.custom-class");
      expect(card).toBeInTheDocument();
    });

    it("renders empty state when data is empty array", () => {
      const { container } = render(<BrokerCard dataForBroker={[]} />);

      const cards = container.querySelectorAll(".custom-card");
      expect(cards).toHaveLength(0);
    });

    it("renders all items from data structure", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      expect(screen.getByText(/Broker ID/)).toBeInTheDocument();
      expect(screen.getByText(/Status/)).toBeInTheDocument();
      expect(screen.getByText(/Contact/)).toBeInTheDocument();
    });
  });

  describe("Modal Interaction", () => {
    it("opens modal when title is clicked", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      const titleElement = screen.getByText("Broker Name 1");
      fireEvent.click(titleElement);

      expect(screen.getByTestId("right-modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent("Broker Name 1");
    });

    it("closes modal when close is triggered", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      const titleElement = screen.getByText("Broker Name 1");
      fireEvent.click(titleElement);

      expect(screen.getByTestId("right-modal")).toBeInTheDocument();

      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("right-modal")).not.toBeInTheDocument();
    });

    it("modal contains BrokerSidebar", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      const titleElement = screen.getByText("Broker Name 1");
      fireEvent.click(titleElement);

      expect(screen.getByText("Commission")).toBeInTheDocument();
      expect(screen.getByText("Locations")).toBeInTheDocument();
    });
  });

  describe("Multiple Brokers", () => {
    it("renders multiple broker cards", () => {
      const multipleData = [
        {
          ...mockData[0],
          partnerAccount: "Broker 1",
          partnerRelationshipsType: "Primary",
        },
        {
          ...mockData[0],
          partnerAccount: "Broker 2",
          partnerRelationshipsType: "Secondary",
          salesforceId: "67890",
        },
      ];

      render(<BrokerCard dataForBroker={multipleData} />);

      expect(screen.getByText("Broker 1")).toBeInTheDocument();
      expect(screen.getByText("Broker 2")).toBeInTheDocument();
      expect(screen.getByText("Primary")).toBeInTheDocument();
      expect(screen.getByText("Secondary")).toBeInTheDocument();
    });

    it("renders all broker data correctly", () => {
      const multipleData = [
        {
          ...mockData[0],
          partnerAccount: "Broker 1",
        },
        {
          ...mockData[0],
          partnerAccount: "Broker 2",
          salesforceId: "54321",
        },
      ];

      render(<BrokerCard dataForBroker={multipleData} />);

      expect(screen.getByText("Broker 1")).toBeInTheDocument();
      expect(screen.getByText("Broker 2")).toBeInTheDocument();
    });
  });

  describe("Column Layout", () => {
    it("renders columns correctly from data", () => {
      const { container } = render(<BrokerCard dataForBroker={mockData} />);

      const columns = container.querySelectorAll('[class*="col-"]');
      expect(columns.length).toBeGreaterThan(0);
    });

    it("renders multiple display rows", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      const displayRows = screen.getAllByTestId("display-row");
      expect(displayRows.length).toBeGreaterThan(0);
    });
  });

  describe("DisplayRow Props", () => {
    it("renders display rows with data", () => {
      render(<BrokerCard dataForBroker={mockData} />);

      const displayRows = screen.getAllByTestId("display-row");
      expect(displayRows.length).toBeGreaterThan(0);
    });
  });

  describe("Card Header", () => {
    it("renders card header with title and broker type", () => {
      const { container } = render(<BrokerCard dataForBroker={mockData} />);

      const header = container.querySelector(".custom-card-header");
      expect(header).toBeInTheDocument();
    });

    it("renders broker type pill", () => {
      const { container } = render(<BrokerCard dataForBroker={mockData} />);

      const pill = container.querySelector(".title-pill, .pill, .badge, .pill-text-gray");
      expect(pill).toBeInTheDocument();
    });

    it("renders clickable title text", () => {
      const { container } = render(<BrokerCard dataForBroker={mockData} />);

      const clickableText = container.querySelector(".clickable-text");
      expect(clickableText).toBeInTheDocument();
      expect(clickableText).toHaveTextContent("Broker Name 1");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty data array", () => {
      const { container } = render(<BrokerCard dataForBroker={[]} />);

      const cards = container.querySelectorAll(".custom-card");
      expect(cards.length).toBe(0);
    });

    it("generates unique keys for cards", () => {
      const { container } = render(<BrokerCard dataForBroker={mockData} />);

      const cards = container.querySelectorAll(".custom-card");
      expect(cards.length).toBe(1);
    });

    it("handles inactive broker status", () => {
      const inactiveData = [
        {
          ...mockData[0],
          isBrokerActive: false,
        },
      ];

      render(<BrokerCard dataForBroker={inactiveData} />);

      expect(screen.getByText(/Inactive/)).toBeInTheDocument();
    });
  });
});
