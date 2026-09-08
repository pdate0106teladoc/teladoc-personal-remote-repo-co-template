import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("react-bootstrap", () => {
  const Tabs = ({ children }: any) => (
    <div data-testid="tabs">{children}</div>
  );
  const Tab = ({ children, title, eventKey }: any) => (
    <div data-testid={`tab-${eventKey}`} data-title={title}>
      {children}
    </div>
  );
  return { __esModule: true, Tabs, Tab };
});

vi.mock("@/utils", () => ({
  __esModule: true,
  phoneFormat: (v: string) => `(${v})`,
}));

vi.mock("@/router/routes", () => ({
  __esModule: true,
  ORG_DETAIL_PATH: "/org",
  GRP_DETAIL_PATH: "/grp",
}));

vi.mock("@/constants", () => ({
  __esModule: true,
  API_ENDPOINTS: { contact: "client-configurations/contacts" },
  NO_OF_RECORDS_PER_PAGE_INDIVIDUAL: 25,
}));

const mockApiGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: (...args: any[]) => mockApiGet(...args) },
}));

const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  __esModule: true,
  Loader: () => <div data-testid="loader">Loading…</div>,
  showCustomToast: (...a: any[]) => mockShowCustomToast(...a),
  ToastType: { Error: "error", Success: "success" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong." },
}));

vi.mock("@/components/ContactEntityTable/ContactEntityTable", () => ({
  __esModule: true,
  default: ({ type, contactId }: any) => (
    <div data-testid={`contact-entity-table-${type}`} data-contact-id={contactId}>
      ContactEntityTable:{type}
    </div>
  ),
}));

import ContactDetails from "../ContactDetailsSidebar";

const baseContactInfo = {
  contactId: "c1",
  fullName: "John Doe",
  title: "Manager",
  primaryEmail: "john@test.com",
  primaryPhone: "1234567890",
  contactRoles: ["Admin", "User"],
  addresses: [
    {
      street: "123 Main",
      city: "NYC",
      county: "NY",
      state: "NY",
      postalCode: "10001",
    },
  ],
};

describe("ContactDetailsSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches contact info on mount using the contact id", async () => {
    mockApiGet.mockResolvedValue(baseContactInfo);
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() =>
      expect(mockApiGet).toHaveBeenCalledWith(
        "client-configurations/contacts/c1",
      ),
    );
  });

  it("renders contact information fields after API resolves", async () => {
    mockApiGet.mockResolvedValue(baseContactInfo);
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() =>
      expect(screen.getByText("Manager")).toBeInTheDocument(),
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Admin; User")).toBeInTheDocument();

    const email = screen.getByRole("link", { name: "john@test.com" });
    expect(email).toHaveAttribute("href", "mailto:john@test.com");

    expect(screen.getByText("(1234567890)")).toBeInTheDocument();
    expect(screen.getByText(/123 Main/)).toBeInTheDocument();
    expect(screen.getByText("NY")).toBeInTheDocument();
  });

  it("unwraps response.data wrapper when present", async () => {
    mockApiGet.mockResolvedValue({ data: baseContactInfo });
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() =>
      expect(screen.getByText("Manager")).toBeInTheDocument(),
    );
  });

  it("shows a loader while the API request is pending", async () => {
    let resolveApi!: (value: unknown) => void;
    mockApiGet.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveApi = resolve;
      }),
    );
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() =>
      expect(screen.getByTestId("loader")).toBeInTheDocument(),
    );
    resolveApi(baseContactInfo);
    await waitFor(() =>
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument(),
    );
  });

  it("shows an error toast when the API call fails", async () => {
    mockApiGet.mockRejectedValueOnce(new Error("boom"));
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() =>
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
  });

  it("renders '-' placeholders when contact info has missing fields", async () => {
    mockApiGet.mockResolvedValue({});
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() =>
      expect(screen.getAllByText("-").length).toBeGreaterThan(0),
    );
  });

  it("renders '-' for address/county when addresses array is empty", async () => {
    mockApiGet.mockResolvedValue({ ...baseContactInfo, addresses: [] });
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() => expect(screen.getByText("Address")).toBeInTheDocument());
    expect(screen.getByText("County")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders '-' for contact roles when none are present", async () => {
    mockApiGet.mockResolvedValue({ ...baseContactInfo, contactRoles: [] });
    render(<ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />);

    await waitFor(() =>
      expect(screen.getByText("Contact role")).toBeInTheDocument(),
    );
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders the organizations ContactEntityTable with the contact id", async () => {
    mockApiGet.mockResolvedValue(baseContactInfo);
    render(<ContactDetails tabKey="organizations" mongoId="c1" contactId="c1" />);

    const orgTable = await screen.findByTestId(
      "contact-entity-table-organization",
    );
    expect(orgTable).toHaveAttribute("data-contact-id", "c1");
  });

  it("renders the groups ContactEntityTable with the contact id", async () => {
    mockApiGet.mockResolvedValue(baseContactInfo);
    render(<ContactDetails tabKey="groups" mongoId="c1" contactId="c1" />);

    const grpTable = await screen.findByTestId("contact-entity-table-group");
    expect(grpTable).toHaveAttribute("data-contact-id", "c1");
  });

  it("does not refetch when re-rendered with the same id (cached)", async () => {
    mockApiGet.mockResolvedValue(baseContactInfo);
    const { rerender } = render(
      <ContactDetails tabKey="contactInfo" mongoId="c1" contactId="c1" />,
    );

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));

    rerender(<ContactDetails tabKey="organizations" mongoId="c1" contactId="c1" />);
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
  });
});
