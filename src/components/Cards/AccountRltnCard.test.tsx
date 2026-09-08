import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AccountRltnCard from "./AccountRltnCard";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/CCC/org-detail/123", search: "", hash: "", state: null, key: "default" }),
  useParams: () => ({ id: "test-123" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("@ucc/common-ui", () => ({
  DisplayRow: vi.fn(({ label, value }) => (
    <div data-testid="display-row">
      {label}: {value}
    </div>
  )),
  FailSafePage: vi.fn(({ cardType }) => (
    <div data-testid="failsafe-page">{cardType}</div>
  )),
}));

describe("AccountRltnCard", () => {
  const mockData = [
    {
      "Account Relationship 1": {
        brokerType: "REL123",
        rows: {
          column1: [
            { label: "Account ID", value: "A123", format: "text" as const },
            { label: "Status", value: "Active", format: "text" as const },
          ],
          column2: [
            { label: "Type", value: "Primary", format: "text" as const },
            { label: "Date", value: "2024-01-01", format: "date" as const },
          ],
        },
      },
    },
  ] as any;

  describe("Rendering", () => {
    it("renders account relationship card with data", () => {
      render(<AccountRltnCard data={mockData} />);

      expect(screen.getByText("Account Relationship 1")).toBeInTheDocument();
    });

    it("renders multiple columns based on data structure", () => {
      render(<AccountRltnCard data={mockData} />);

      const displayRows = screen.getAllByTestId("display-row");
      expect(displayRows.length).toBeGreaterThan(0);
    });

    it("renders with custom className", () => {
      const { container } = render(<AccountRltnCard data={mockData} className="custom-class" />);

      const card = container.querySelector(".custom-card.custom-class");
      expect(card).toBeInTheDocument();
    });

    it("renders all items from data structure", () => {
      render(<AccountRltnCard data={mockData} />);

      expect(screen.getByText(/Account ID/)).toBeInTheDocument();
      expect(screen.getByText(/Status/)).toBeInTheDocument();
      expect(screen.getByText(/Type/)).toBeInTheDocument();
      expect(screen.getByText(/Date/)).toBeInTheDocument();
    });
  });

  describe("Empty and Null Data", () => {
    it("renders failsafe page when data is null", () => {
      render(<AccountRltnCard data={null as any} />);

      expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
      expect(screen.getByText("noData")).toBeInTheDocument();
    });

    it("renders failsafe page when data is undefined", () => {
      render(<AccountRltnCard data={undefined as any} />);

      expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
      expect(screen.getByText("noData")).toBeInTheDocument();
    });

    it("renders failsafe page when data is empty array", () => {
      render(<AccountRltnCard data={[]} />);

      expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
      expect(screen.getByText("noData")).toBeInTheDocument();
    });
  });

  describe("Broker Type Logic", () => {
    it("displays 'Telemed' type when brokerType starts with REL", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const typePill = container.querySelector(".pill-text-gray");
      expect(typePill).toHaveTextContent("Telemed");
    });

    it("displays 'Chronic care' type when brokerType does not start with REL", () => {
      const dataWithNonREL = [
        {
          "Account": {
            brokerType: "ABC123",
            rows: {
              col1: [{ label: "Label", value: "Value", format: "text" as const }],
            },
          },
        },
      ] as any;

      const { container } = render(<AccountRltnCard data={dataWithNonREL} />);

      const typePill = container.querySelector(".pill-text-gray");
      expect(typePill).toHaveTextContent("Chronic care");
    });

    it("displays '-' when brokerType is missing", () => {
      const dataWithoutBrokerType = [
        {
          "Account": {
            rows: {
              col1: [{ label: "Label", value: "Value", format: "text" as const }],
            },
          },
        },
      ] as any;

      const { container } = render(<AccountRltnCard data={dataWithoutBrokerType} />);

      const serialNumber = container.querySelector(".serial-number");
      expect(serialNumber).toHaveTextContent("-");
    });

    it("displays brokerType in serial number", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const serialNumber = container.querySelector(".serial-number");
      expect(serialNumber).toHaveTextContent("REL123");
    });
  });

  describe("Multiple Accounts", () => {
    it("renders multiple account relationship cards", () => {
      const multipleData = [
        {
          "Account 1": {
            brokerType: "REL001",
            rows: {
              col1: [{ label: "ID", value: "1", format: "text" as const }],
            },
          },
        },
        {
          "Account 2": {
            brokerType: "REL002",
            rows: {
              col1: [{ label: "ID", value: "2", format: "text" as const }],
            },
          },
        },
      ] as any;

      render(<AccountRltnCard data={multipleData} />);

      expect(screen.getByText("Account 1")).toBeInTheDocument();
      expect(screen.getByText("Account 2")).toBeInTheDocument();
    });

    it("handles multiple sections in same data entry", () => {
      const multipleSections = [
        {
          "Section 1": {
            brokerType: "REL111",
            rows: {
              col1: [{ label: "Label1", value: "Value1", format: "text" as const }],
            },
          },
          "Section 2": {
            brokerType: "ABC222",
            rows: {
              col1: [{ label: "Label2", value: "Value2", format: "text" as const }],
            },
          },
        },
      ] as any;

      render(<AccountRltnCard data={multipleSections} />);

      expect(screen.getByText("Section 1")).toBeInTheDocument();
      expect(screen.getByText("Section 2")).toBeInTheDocument();
    });
  });

  describe("Column Layout", () => {
    it("calculates column width based on number of columns", () => {
      const threeColumnData = [
        {
          "Account": {
            brokerType: "REL123",
            rows: {
              col1: [{ label: "L1", value: "V1", format: "text" as const }],
              col2: [{ label: "L2", value: "V2", format: "text" as const }],
              col3: [{ label: "L3", value: "V3", format: "text" as const }],
            },
          },
        },
      ] as any;

      const { container } = render(<AccountRltnCard data={threeColumnData} />);

      const columns = container.querySelectorAll('[class*="col-"]');
      expect(columns.length).toBe(3);
    });

    it("handles single column layout", () => {
      const singleColumnData = [
        {
          "Account": {
            brokerType: "REL123",
            rows: {
              col1: [
                { label: "Label1", value: "Value1", format: "text" as const },
                { label: "Label2", value: "Value2", format: "text" as const },
              ],
            },
          },
        },
      ] as any;

      render(<AccountRltnCard data={singleColumnData} />);

      expect(screen.getByText(/Label1/)).toBeInTheDocument();
      expect(screen.getByText(/Label2/)).toBeInTheDocument();
    });

    it("handles multiple items per column", () => {
      const multipleItemsData = [
        {
          "Account": {
            brokerType: "REL123",
            rows: {
              col1: [
                { label: "Item1", value: "Val1", format: "text" as const },
                { label: "Item2", value: "Val2", format: "text" as const },
                { label: "Item3", value: "Val3", format: "text" as const },
              ],
            },
          },
        },
      ] as any;

      render(<AccountRltnCard data={multipleItemsData} />);

      expect(screen.getByText(/Item1/)).toBeInTheDocument();
      expect(screen.getByText(/Item2/)).toBeInTheDocument();
      expect(screen.getByText(/Item3/)).toBeInTheDocument();
    });
  });

  describe("DisplayRow Props", () => {
    it("passes all required props to DisplayRow", () => {
      const dataWithAllProps = [
        {
          "Account": {
            brokerType: "REL123",
            rows: {
              col1: [
                {
                  label: "Test Label",
                  value: "Test Value",
                  format: "contact" as const,
                  lastChild: true,
                  tooltipContent: "Tooltip text",
                  personMeta: { name: "John Doe", role: "Admin" },
                },
              ],
            },
          },
        },
      ] as any;

      render(<AccountRltnCard data={dataWithAllProps} />);

      expect(screen.getByText(/Test Label/)).toBeInTheDocument();
    });
  });

  describe("Card Header", () => {
    it("renders card header with title and type", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const header = container.querySelector(".custom-card-header");
      expect(header).toBeInTheDocument();
    });

    it("renders type pill", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const pill = container.querySelector(".title-pill-gray");
      expect(pill).toBeInTheDocument();
      expect(pill?.querySelector(".pill-text-gray")).toBeInTheDocument();
    });

    it("renders main title", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const mainTitle = container.querySelector(".main-title");
      expect(mainTitle).toBeInTheDocument();
      expect(mainTitle).toHaveTextContent("Account Relationship 1");
    });

    it("renders serial number", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const serialNumber = container.querySelector(".serial-number");
      expect(serialNumber).toBeInTheDocument();
      expect(serialNumber).toHaveTextContent("REL123");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty rows", () => {
      const dataWithEmptyRows = [
        {
          "Account": {
            brokerType: "REL123",
            rows: {},
          },
        },
      ] as any;

      render(<AccountRltnCard data={dataWithEmptyRows} />);

      expect(screen.getByText("Account")).toBeInTheDocument();
    });

    it("generates unique keys for multiple sections", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const cards = container.querySelectorAll(".custom-card");
      expect(cards.length).toBe(1);
    });

    it("handles data with empty title", () => {
      const dataWithEmptyTitle = [
        {
          "": {
            brokerType: "REL123",
            rows: {
              col1: [{ label: "Label", value: "Value", format: "text" as const }],
            },
          },
        },
      ] as any;

      const { container } = render(<AccountRltnCard data={dataWithEmptyTitle} />);

      expect(container.querySelector(".custom-card")).toBeInTheDocument();
    });

    it("handles brokerType with special characters", () => {
      const dataWithSpecialChars = [
        {
          "Account": {
            brokerType: "REL-123/ABC",
            rows: {
              col1: [{ label: "Label", value: "Value", format: "text" as const }],
            },
          },
        },
      ] as any;

      const { container } = render(<AccountRltnCard data={dataWithSpecialChars} />);

      const serialNumber = container.querySelector(".serial-number");
      expect(serialNumber).toHaveTextContent("REL-123/ABC");
      
      const typePill = container.querySelector(".pill-text-gray");
      expect(typePill).toHaveTextContent("Telemed");
    });

    it("handles case-sensitive brokerType check", () => {
      const dataWithLowerCase = [
        {
          "Account": {
            brokerType: "rel123",
            rows: {
              col1: [{ label: "Label", value: "Value", format: "text" as const }],
            },
          },
        },
      ] as any;

      const { container } = render(<AccountRltnCard data={dataWithLowerCase} />);

      const typePill = container.querySelector(".pill-text-gray");
      expect(typePill).toHaveTextContent("Chronic care");
    });

    it("handles brokerType exactly 'REL'", () => {
      const dataWithExactREL = [
        {
          "Account": {
            brokerType: "REL",
            rows: {
              col1: [{ label: "Label", value: "Value", format: "text" as const }],
            },
          },
        },
      ] as any;

      const { container } = render(<AccountRltnCard data={dataWithExactREL} />);

      const typePill = container.querySelector(".pill-text-gray");
      expect(typePill).toHaveTextContent("Telemed");
    });
  });

  describe("CSS Classes", () => {
    it("applies correct CSS classes for structure", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      expect(container.querySelector(".custom-card")).toBeInTheDocument();
      expect(container.querySelector(".custom-card-header")).toBeInTheDocument();
      expect(container.querySelector(".custom-card-body")).toBeInTheDocument();
    });

    it("applies flex classes to header", () => {
      const { container } = render(<AccountRltnCard data={mockData} />);

      const flexColumn = container.querySelector(".d-flex.flex-column");
      expect(flexColumn).toBeInTheDocument();

      const flexRow = container.querySelector(".d-flex.flex-row.align-items-center");
      expect(flexRow).toBeInTheDocument();
    });
  });
});
