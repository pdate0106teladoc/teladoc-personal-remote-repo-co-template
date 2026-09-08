import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EditableGroupRecipients from "./EditableGroupRecipients";

vi.mock("./EditableGroupRecipients.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "grp-123" }),
  useLocation: () => ({ pathname: "/CCC/groups/grp-123/reporting" }),
}));

vi.mock("@/router/routes", () => ({
  GRP_DETAIL_PATH: "/CCC/groups",
}));

const mockGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: { get: (...args: any[]) => mockGet(...args) },
}));

vi.mock("@/utils/urlMapper", () => ({
  constructLookupUrl: vi.fn(
    (searchTerm: string) => `lookup?search=${searchTerm}`,
  ),
}));


vi.mock("@ucc/common-ui", () => ({
  MultiSelectSearch: ({ preSelected, onChange, maxResults, multiSelect, responseDataPath }: any) => {
    return (
      <div data-testid="multi-select-search">
        <span data-testid="pre-selected">{JSON.stringify(preSelected)}</span>
        <span data-testid="max-results">{maxResults}</span>
        <span data-testid="multi-select">{String(multiSelect)}</span>
        <span data-testid="response-path">{responseDataPath}</span>
        <button
          data-testid="select-btn"
          onClick={() => onChange({ "new@test.com": "new@test.com" })}
        >
          Select
        </button>
        <button
          data-testid="add-btn"
          onClick={() =>
            onChange({ ...preSelected, "added@test.com": "added@test.com" })
          }
        >
          Add
        </button>
        <button
          data-testid="clear-btn"
          onClick={() => onChange({})}
        >
          Clear
        </button>
      </div>
    );
  },
}));

describe("EditableGroupRecipients", () => {
  const defaultProps = {
    fieldKey: "reportRecipients",
    value: [
      { emailAddress: "user1@example.com", emailRecipient: "group" },
      { emailAddress: "user2@example.com", emailRecipient: "group" },
    ],
    metadata: {
      allowedValues: ["lookup", "contacts", "search"],
      max: 10,
    } as any,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with label", () => {
    render(<EditableGroupRecipients {...defaultProps} />);
    expect(screen.getByText("Email:")).toBeInTheDocument();
  });

  it("renders MultiSelectSearch component", () => {
    render(<EditableGroupRecipients {...defaultProps} />);
    expect(screen.getByTestId("multi-select-search")).toBeInTheDocument();
  });

  it("passes pre-selected recipients as lowercase email keys", () => {
    render(<EditableGroupRecipients {...defaultProps} />);
    const preSelected = JSON.parse(screen.getByTestId("pre-selected").textContent!);
    expect(preSelected).toEqual({
      "user1@example.com": "user1@example.com",
      "user2@example.com": "user2@example.com",
    });
  });

  it("passes maxResults from metadata.max", () => {
    render(<EditableGroupRecipients {...defaultProps} />);
    expect(screen.getByTestId("max-results")).toHaveTextContent("10");
  });

  it("defaults maxResults to 5 when metadata.max is not set", () => {
    render(<EditableGroupRecipients {...defaultProps} metadata={undefined} />);
    expect(screen.getByTestId("max-results")).toHaveTextContent("5");
  });

  it("passes multiSelect=true", () => {
    render(<EditableGroupRecipients {...defaultProps} />);
    expect(screen.getByTestId("multi-select")).toHaveTextContent("true");
  });

  it("passes responseDataPath as contacts", () => {
    render(<EditableGroupRecipients {...defaultProps} />);
    expect(screen.getByTestId("response-path")).toHaveTextContent("contacts");
  });

  it("calls onChange with fieldKey and recipients when selection changes", () => {
    const onChange = vi.fn();
    render(<EditableGroupRecipients {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("select-btn"));

    expect(onChange).toHaveBeenCalledWith("reportRecipients", [
      { emailAddress: "new@test.com", emailRecipient: "Work" },
    ]);
  });

  it("adds new recipient to existing list", () => {
    const onChange = vi.fn();
    render(<EditableGroupRecipients {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("add-btn"));

    expect(onChange).toHaveBeenCalledWith(
      "reportRecipients",
      expect.arrayContaining([
        { emailAddress: "user1@example.com", emailRecipient: "Work" },
        { emailAddress: "user2@example.com", emailRecipient: "Work" },
        { emailAddress: "added@test.com", emailRecipient: "Work" },
      ]),
    );
  });

  it("calls onChange with empty array when cleared", () => {
    const onChange = vi.fn();
    render(<EditableGroupRecipients {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("clear-btn"));

    expect(onChange).toHaveBeenCalledWith("reportRecipients", []);
  });

  it("renders error message when error prop is provided", () => {
    render(<EditableGroupRecipients {...defaultProps} error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("does not render error message when error is undefined", () => {
    render(<EditableGroupRecipients {...defaultProps} />);
    expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();
  });

  it("handles empty value array", () => {
    render(<EditableGroupRecipients {...defaultProps} value={[]} />);
    const preSelected = JSON.parse(screen.getByTestId("pre-selected").textContent!);
    expect(preSelected).toEqual({});
  });

  it("handles recipients with null/empty email addresses", () => {
    const value = [
      { emailAddress: "valid@test.com", emailRecipient: "group" },
      { emailAddress: "", emailRecipient: "group" },
      { emailAddress: null as any, emailRecipient: "group" },
    ];
    render(<EditableGroupRecipients {...defaultProps} value={value} />);
    const preSelected = JSON.parse(screen.getByTestId("pre-selected").textContent!);
    expect(preSelected).toEqual({ "valid@test.com": "valid@test.com" });
  });

  it("normalizes email addresses to lowercase", () => {
    const value = [
      { emailAddress: "User@EXAMPLE.COM", emailRecipient: "group" },
    ];
    render(<EditableGroupRecipients {...defaultProps} value={value} />);
    const preSelected = JSON.parse(screen.getByTestId("pre-selected").textContent!);
    expect(preSelected).toEqual({ "user@example.com": "user@example.com" });
  });

  it("does not call onChange when onChange prop is not provided", () => {
    render(<EditableGroupRecipients {...defaultProps} onChange={undefined} />);
    fireEvent.click(screen.getByTestId("select-btn"));
    // Should not throw
  });

  it("renders with editable-group-recipients wrapper class", () => {
    const { container } = render(<EditableGroupRecipients {...defaultProps} />);
    expect(container.querySelector(".editable-group-recipients")).toBeInTheDocument();
  });
});
