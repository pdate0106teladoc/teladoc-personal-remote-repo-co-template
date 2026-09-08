import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import EditableReportRecipients from "./EditableReportRecipients";
import useOrgStore from "@/store/useOrgStore";

vi.mock("./EditableGroupRecipients.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "org-123" }),
  useLocation: () => ({ pathname: "/CCC/organizations/org-123/reporting" }),
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
  MultiSelectSearch: ({
    preSelected,
    onChange,
    maxResults,
    multiSelect,
    responseDataPath,
    responseNameField,
    footerLabel,
    onFooterClick,
    buildSearchParams,
    customClass,
  }: any) => {
    // Identified by customClass, not render order, so a remount keeps its testids.
    const testIdSuffix = String(customClass).includes("recipients-multi-select-bcc")
      ? "bcc"
      : "to";
    // Mirrors the library owning its own input text across renders.
    const [typed, setTyped] = useState("");
    return (
      <div data-testid={`multi-select-search-${testIdSuffix}`}>
        <span data-testid={`pre-selected-${testIdSuffix}`}>{JSON.stringify(preSelected)}</span>
        <span data-testid={`max-results-${testIdSuffix}`}>{maxResults}</span>
        <span data-testid={`multi-select-${testIdSuffix}`}>{String(multiSelect)}</span>
        <span data-testid={`response-path-${testIdSuffix}`}>{responseDataPath}</span>
        <span data-testid={`response-name-field-${testIdSuffix}`}>{responseNameField}</span>
        <span data-testid={`footer-label-${testIdSuffix}`}>{footerLabel}</span>
        <span data-testid={`typed-${testIdSuffix}`}>{typed}</span>
        <button
          data-testid={`search-btn-${testIdSuffix}`}
          onClick={() => {
            setTyped(`${testIdSuffix}-term`);
            buildSearchParams?.(`${testIdSuffix}-term`);
          }}
        >
          Search
        </button>
        <button
          data-testid={`search-email-btn-${testIdSuffix}`}
          onClick={() => {
            setTyped("typed@example.com");
            buildSearchParams?.("typed@example.com");
          }}
        >
          SearchEmail
        </button>
        <button
          data-testid={`select-btn-${testIdSuffix}`}
          onClick={() => onChange({ "new@test.com": "new@test.com" })}
        >
          Select
        </button>
        <button
          data-testid={`clear-btn-${testIdSuffix}`}
          onClick={() => onChange({})}
        >
          Clear
        </button>
        <button
          data-testid={`footer-btn-${testIdSuffix}`}
          onClick={() => onFooterClick?.()}
        >
          Footer
        </button>
      </div>
    );
  },
  StatusRibbon: ({ type, title, message }: any) => (
    <div data-testid="status-ribbon" data-type={type}>
      <span data-testid="ribbon-title">{title}</span>
      <span data-testid="ribbon-message">{message}</span>
    </div>
  ),
}));

vi.mock("@/pages/contacts/AddContactModal", () => ({
  __esModule: true,
  default: () => <div data-testid="add-contact-modal" />,
}));

const mockCreateModal = vi.fn();
vi.mock("./CreateReportContactModal", () => ({
  __esModule: true,
  default: (props: any) => {
    mockCreateModal(props);
    return (
      <div data-testid="create-report-contact-modal">
        <span data-testid="create-initial-email">{props.initialEmail}</span>
        <span data-testid="create-recipient-label">{props.recipientLabel}</span>
        <button
          data-testid="create-confirm"
          onClick={() => props.onCreated({ email: "Made.Up@Example.com ", name: "Made Up" })}
        >
          Create
        </button>
      </div>
    );
  },
}));

describe("EditableReportRecipients", () => {
  const defaultProps = {
    fieldKey: "reporting.0.reportRecipient",
    value: [
      { emailAddress: "to1@example.com", emailRecipient: "To" },
      { emailAddress: "to2@example.com", emailRecipient: "To" },
      { emailAddress: "bcc1@example.com", emailRecipient: "Bcc" },
    ],
    metadata: {
      allowedValues: ["lookup", "contacts", "search"],
      max: 10,
    } as any,
    onChange: vi.fn(),
  };

  const seedAccountMapping = (
    verificationStatus: string,
    organizationName = "Aetna Primary Aetna Dependent",
  ) =>
    useOrgStore.getState().setGeneralSettings("org-123", {
      overview: {
        accountOverview: {
          organizationName,
          accountMapping: { telemed: { verificationStatus } },
        },
      },
    } as any);

  beforeEach(() => {
    vi.clearAllMocks();
    useOrgStore.setState({ generalSettingCache: {} });
  });

  it("renders To: and BCC: labels", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.getByText("To:")).toBeInTheDocument();
    expect(screen.getByText("BCC:")).toBeInTheDocument();
  });

  it("renders two MultiSelectSearch components", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.getByTestId("multi-select-search-to")).toBeInTheDocument();
    expect(screen.getByTestId("multi-select-search-bcc")).toBeInTheDocument();
  });

  it("passes correct pre-selected for To field", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    const preSelected = JSON.parse(screen.getByTestId("pre-selected-to").textContent!);
    expect(preSelected).toEqual({
      "to1@example.com": "to1@example.com",
      "to2@example.com": "to2@example.com",
    });
  });

  it("passes correct pre-selected for BCC field", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    const preSelected = JSON.parse(screen.getByTestId("pre-selected-bcc").textContent!);
    expect(preSelected).toEqual({
      "bcc1@example.com": "bcc1@example.com",
    });
  });

  it("passes maxResults from metadata.max", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.getByTestId("max-results-to")).toHaveTextContent("10");
    expect(screen.getByTestId("max-results-bcc")).toHaveTextContent("10");
  });

  it("defaults maxResults to 5 when metadata.max is not set", () => {
    render(<EditableReportRecipients {...defaultProps} metadata={undefined} />);
    expect(screen.getByTestId("max-results-to")).toHaveTextContent("5");
    expect(screen.getByTestId("max-results-bcc")).toHaveTextContent("5");
  });

  it("passes multiSelect=true to both fields", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.getByTestId("multi-select-to")).toHaveTextContent("true");
    expect(screen.getByTestId("multi-select-bcc")).toHaveTextContent("true");
  });

  it("passes responseDataPath as contacts to both fields", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.getByTestId("response-path-to")).toHaveTextContent("contacts");
    expect(screen.getByTestId("response-path-bcc")).toHaveTextContent("contacts");
  });

  it("calls onChange with merged recipients when To selection changes", () => {
    const onChange = vi.fn();
    render(<EditableReportRecipients {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("select-btn-to"));

    expect(onChange).toHaveBeenCalledWith(
      "reporting.0.reportRecipient",
      expect.arrayContaining([
        { emailAddress: "new@test.com", emailRecipient: "To" },
        { emailAddress: "bcc1@example.com", emailRecipient: "Bcc" },
      ]),
    );
  });

  it("calls onChange with merged recipients when BCC selection changes", () => {
    const onChange = vi.fn();
    render(<EditableReportRecipients {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("select-btn-bcc"));

    expect(onChange).toHaveBeenCalledWith(
      "reporting.0.reportRecipient",
      expect.arrayContaining([
        { emailAddress: "to1@example.com", emailRecipient: "To" },
        { emailAddress: "to2@example.com", emailRecipient: "To" },
        { emailAddress: "new@test.com", emailRecipient: "Bcc" },
      ]),
    );
  });

  it("calls onChange with only bcc when To is cleared", () => {
    const onChange = vi.fn();
    render(<EditableReportRecipients {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("clear-btn-to"));

    expect(onChange).toHaveBeenCalledWith(
      "reporting.0.reportRecipient",
      [{ emailAddress: "bcc1@example.com", emailRecipient: "Bcc" }],
    );
  });

  it("calls onChange with only to when BCC is cleared", () => {
    const onChange = vi.fn();
    render(<EditableReportRecipients {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("clear-btn-bcc"));

    expect(onChange).toHaveBeenCalledWith(
      "reporting.0.reportRecipient",
      [
        { emailAddress: "to1@example.com", emailRecipient: "To" },
        { emailAddress: "to2@example.com", emailRecipient: "To" },
      ],
    );
  });

  it("renders error message when error prop is provided", () => {
    render(<EditableReportRecipients {...defaultProps} error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("does not render error message when error is undefined", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();
  });

  it("handles empty value array", () => {
    render(<EditableReportRecipients {...defaultProps} value={[]} />);
    const toPreSelected = JSON.parse(screen.getByTestId("pre-selected-to").textContent!);
    const bccPreSelected = JSON.parse(screen.getByTestId("pre-selected-bcc").textContent!);
    expect(toPreSelected).toEqual({});
    expect(bccPreSelected).toEqual({});
  });

  it("normalizes email addresses to lowercase", () => {
    const value = [
      { emailAddress: "User@EXAMPLE.COM", emailRecipient: "to" },
      { emailAddress: "BCC@Test.COM", emailRecipient: "bcc" },
    ];
    render(<EditableReportRecipients {...defaultProps} value={value} />);
    const toPreSelected = JSON.parse(screen.getByTestId("pre-selected-to").textContent!);
    const bccPreSelected = JSON.parse(screen.getByTestId("pre-selected-bcc").textContent!);
    expect(toPreSelected).toEqual({ "user@example.com": "user@example.com" });
    expect(bccPreSelected).toEqual({ "bcc@test.com": "bcc@test.com" });
  });

  it("does not throw when onChange is undefined", () => {
    render(<EditableReportRecipients {...defaultProps} onChange={undefined} />);
    fireEvent.click(screen.getByTestId("select-btn-to"));
    fireEvent.click(screen.getByTestId("select-btn-bcc"));
  });

  it("renders with editable-report-recipients wrapper class", () => {
    const { container } = render(<EditableReportRecipients {...defaultProps} />);
    expect(container.querySelector(".editable-report-recipients")).toBeInTheDocument();
  });

  it("labels lookup options with the name/email display field", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.getByTestId("response-name-field-to")).toHaveTextContent("displayLabel");
    expect(screen.getByTestId("response-name-field-bcc")).toHaveTextContent("displayLabel");
  });

  it("echoes each field's searched term in its own create-contact footer", () => {
    render(<EditableReportRecipients {...defaultProps} />);

    fireEvent.click(screen.getByTestId("search-btn-to"));

    expect(screen.getByTestId("footer-label-to")).toHaveTextContent(
      'No match? Create new contact for "to-term"',
    );
    expect(screen.getByTestId("footer-label-bcc")).not.toHaveTextContent("to-term");

    fireEvent.click(screen.getByTestId("search-btn-bcc"));

    expect(screen.getByTestId("footer-label-bcc")).toHaveTextContent(
      'No match? Create new contact for "bcc-term"',
    );
  });

  it("shows the TD account ribbon with the org name when the account is unverified", () => {
    seedAccountMapping("UNVERIFIED");
    render(<EditableReportRecipients {...defaultProps} />);

    expect(screen.getByTestId("status-ribbon")).toHaveAttribute("data-type", "error");
    expect(screen.getByTestId("ribbon-title")).toHaveTextContent(
      "Can't save reporting recipients.",
    );
    expect(screen.getByTestId("ribbon-message")).toHaveTextContent(
      "Reporting recipients cannot be saved. Aetna Primary Aetna Dependent needs a verified linked TD account first.",
    );
  });

  it("shows the TD account ribbon when no account mapping is cached", () => {
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.getByTestId("ribbon-message")).toHaveTextContent(
      "This organization needs a verified linked TD account first.",
    );
  });

  it("hides the TD account ribbon once the account is verified", () => {
    seedAccountMapping("VERIFIED");
    render(<EditableReportRecipients {...defaultProps} />);
    expect(screen.queryByTestId("status-ribbon")).not.toBeInTheDocument();
  });

  describe("create-contact modal per report state", () => {
    it("opens the AddContactModal flow for a saved report", () => {
      render(<EditableReportRecipients {...defaultProps} />);
      fireEvent.click(screen.getByTestId("footer-btn-to"));

      expect(screen.getByTestId("add-contact-modal")).toBeInTheDocument();
      expect(
        screen.queryByTestId("create-report-contact-modal"),
      ).not.toBeInTheDocument();
    });

    it("opens the drafted-report modal seeded with the To search term", () => {
      render(<EditableReportRecipients {...defaultProps} isNewReport />);
      fireEvent.click(screen.getByTestId("search-btn-to"));
      fireEvent.click(screen.getByTestId("footer-btn-to"));

      expect(screen.queryByTestId("add-contact-modal")).not.toBeInTheDocument();
      expect(screen.getByTestId("create-initial-email")).toHaveTextContent("to-term");
      expect(screen.getByTestId("create-recipient-label")).toHaveTextContent("To");
    });

    it("opens it seeded with the Bcc search term when Bcc asked for it", () => {
      render(<EditableReportRecipients {...defaultProps} isNewReport />);
      fireEvent.click(screen.getByTestId("search-btn-bcc"));
      fireEvent.click(screen.getByTestId("footer-btn-bcc"));

      expect(screen.getByTestId("create-initial-email")).toHaveTextContent("bcc-term");
      expect(screen.getByTestId("create-recipient-label")).toHaveTextContent("Bcc");
    });

    it("adds the created contact to To and reports the merged recipients", () => {
      const onChange = vi.fn();
      render(
        <EditableReportRecipients {...defaultProps} onChange={onChange} isNewReport />,
      );
      fireEvent.click(screen.getByTestId("footer-btn-to"));
      fireEvent.click(screen.getByTestId("create-confirm"));

      expect(onChange).toHaveBeenCalledWith("reporting.0.reportRecipient", [
        { emailAddress: "to1@example.com", emailRecipient: "To" },
        { emailAddress: "to2@example.com", emailRecipient: "To" },
        { emailAddress: "made.up@example.com", emailRecipient: "To" },
        { emailAddress: "bcc1@example.com", emailRecipient: "Bcc" },
      ]);
      // Closed, and the new chip is handed back to the lookup.
      expect(
        screen.queryByTestId("create-report-contact-modal"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("pre-selected-to")).toHaveTextContent(
        "made.up@example.com",
      );
    });

    it("adds the created contact to Bcc when Bcc opened the modal", () => {
      const onChange = vi.fn();
      render(
        <EditableReportRecipients {...defaultProps} onChange={onChange} isNewReport />,
      );
      fireEvent.click(screen.getByTestId("footer-btn-bcc"));
      fireEvent.click(screen.getByTestId("create-confirm"));

      expect(onChange).toHaveBeenCalledWith("reporting.0.reportRecipient", [
        { emailAddress: "to1@example.com", emailRecipient: "To" },
        { emailAddress: "to2@example.com", emailRecipient: "To" },
        { emailAddress: "bcc1@example.com", emailRecipient: "Bcc" },
        { emailAddress: "made.up@example.com", emailRecipient: "Bcc" },
      ]);
    });
  });

  describe("no-match footer actions on a drafted report", () => {
    // The library renders the footer as one clickable row: press an action, then
    // the row's click lands.
    const chooseFooterAction = (
      action: "use-email-only" | "create-new-contact",
      field: "to" | "bcc",
    ) => {
      fireEvent.mouseDown(screen.getByTestId(`${action}-${field}`));
      fireEvent.click(screen.getByTestId(`footer-btn-${field}`));
    };

    it("offers both actions, and only for the drafted report", () => {
      const { unmount } = render(<EditableReportRecipients {...defaultProps} />);
      expect(screen.queryByTestId("use-email-only-to")).not.toBeInTheDocument();
      expect(screen.getByTestId("footer-label-to")).toHaveTextContent(
        "No match? Create new contact for",
      );
      unmount();

      render(<EditableReportRecipients {...defaultProps} isNewReport />);
      expect(screen.getByTestId("use-email-only-to")).toHaveTextContent(
        "Use email only",
      );
      expect(screen.getByTestId("create-new-contact-to")).toHaveTextContent(
        "Create new contact",
      );
      expect(screen.getByTestId("footer-label-to")).not.toHaveTextContent(
        "No match?",
      );
    });

    it("takes the typed address as a To recipient without creating a contact", () => {
      const onChange = vi.fn();
      mockGet.mockResolvedValue({ contacts: [] });
      render(
        <EditableReportRecipients {...defaultProps} onChange={onChange} isNewReport />,
      );

      // buildSearchParams is what records the typed term.
      fireEvent.click(screen.getByTestId("search-email-btn-to"));
      chooseFooterAction("use-email-only", "to");

      expect(
        screen.queryByTestId("create-report-contact-modal"),
      ).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith("reporting.0.reportRecipient", [
        { emailAddress: "to1@example.com", emailRecipient: "To" },
        { emailAddress: "to2@example.com", emailRecipient: "To" },
        { emailAddress: "typed@example.com", emailRecipient: "To" },
        { emailAddress: "bcc1@example.com", emailRecipient: "Bcc" },
      ]);
    });

    it("takes the typed address as a Bcc recipient", () => {
      const onChange = vi.fn();
      render(
        <EditableReportRecipients {...defaultProps} onChange={onChange} isNewReport />,
      );
      fireEvent.click(screen.getByTestId("search-email-btn-bcc"));
      chooseFooterAction("use-email-only", "bcc");

      expect(onChange.mock.calls[0][1]).toEqual([
        { emailAddress: "to1@example.com", emailRecipient: "To" },
        { emailAddress: "to2@example.com", emailRecipient: "To" },
        { emailAddress: "bcc1@example.com", emailRecipient: "Bcc" },
        { emailAddress: "typed@example.com", emailRecipient: "Bcc" },
      ]);
    });

    it("rejects a typed value that is not an email address", () => {
      const onChange = vi.fn();
      render(
        <EditableReportRecipients {...defaultProps} onChange={onChange} isNewReport />,
      );
      // "to-term" is what this search button types — not an address.
      fireEvent.click(screen.getByTestId("search-btn-to"));
      chooseFooterAction("use-email-only", "to");

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    });

    it("still opens the create-contact modal from the other action", () => {
      render(<EditableReportRecipients {...defaultProps} isNewReport />);
      fireEvent.click(screen.getByTestId("search-btn-to"));
      chooseFooterAction("create-new-contact", "to");

      expect(screen.getByTestId("create-report-contact-modal")).toBeInTheDocument();
      expect(screen.getByTestId("create-recipient-label")).toHaveTextContent("To");
    });
  });

  describe("clearing the lookup after a recipient is added", () => {
    const chooseFooterAction = (
      action: "use-email-only" | "create-new-contact",
      field: "to" | "bcc",
    ) => {
      fireEvent.mouseDown(screen.getByTestId(`${action}-${field}`));
      fireEvent.click(screen.getByTestId(`footer-btn-${field}`));
    };

    it("drops the typed text so it does not sit beside the chip it became", () => {
      render(<EditableReportRecipients {...defaultProps} isNewReport />);
      fireEvent.click(screen.getByTestId("search-email-btn-to"));
      expect(screen.getByTestId("typed-to")).toHaveTextContent("typed@example.com");

      chooseFooterAction("use-email-only", "to");

      expect(screen.getByTestId("typed-to")).toBeEmptyDOMElement();
      // Added exactly once, as a chip.
      const preSelected = JSON.parse(
        screen.getByTestId("pre-selected-to").textContent ?? "{}",
      );
      expect(Object.keys(preSelected)).toEqual([
        "to1@example.com",
        "to2@example.com",
        "typed@example.com",
      ]);
    });

    it("leaves the other field's lookup alone", () => {
      render(<EditableReportRecipients {...defaultProps} isNewReport />);
      fireEvent.click(screen.getByTestId("search-btn-bcc"));
      fireEvent.click(screen.getByTestId("search-email-btn-to"));

      chooseFooterAction("use-email-only", "to");

      expect(screen.getByTestId("typed-bcc")).toHaveTextContent("bcc-term");
    });

    it("clears it after the create-contact modal adds a contact", () => {
      render(<EditableReportRecipients {...defaultProps} isNewReport />);
      fireEvent.click(screen.getByTestId("search-email-btn-to"));
      chooseFooterAction("create-new-contact", "to");
      fireEvent.click(screen.getByTestId("create-confirm"));

      expect(screen.getByTestId("typed-to")).toBeEmptyDOMElement();
    });
  });
});
