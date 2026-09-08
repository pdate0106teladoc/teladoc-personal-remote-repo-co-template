import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import ContactCards from "./ContactCards";
import api from "@/api/apiService";

let mockPathname = "/org-detail/123";
const mockUseParams = vi.fn();

vi.mock("react-router-dom", () => ({
    __esModule: true,
    MemoryRouter: ({ children }: any) => <>{children}</>,
    useParams: () => mockUseParams(),
    useLocation: () => ({ pathname: mockPathname }),
    useNavigate: () => vi.fn(),
}));

vi.mock("@/assets", () => ({
  __esModule: true,
  DustbinIcon: () => <span data-testid="dustbin-icon" />,
  EditIndicatorIcon: () => <span data-testid="edit-icon" />,
  MailIcon: () => <span data-testid="mail-icon" />,
  PhoneIcon: () => <span data-testid="phone-icon" />,
}));

vi.mock("@/utils", () => ({
  __esModule: true,
  getSafeString: (v: any) => (v == null ? "" : String(v)),
  phoneFormat: (v: string) => `(${v})`,
}));

// Only rendered inside the (closed) edit drawer; stub so its module graph isn't loaded.
vi.mock("./ContactOpsDrawer", () => ({
  __esModule: true,
  default: () => <div data-testid="create-contact-drawer" />,
}));

// The sidebar now receives mongoId + contactId (not a single `data` object).
vi.mock("@/components/sidebar/ContactDetailsSidebar", () => ({
  __esModule: true,
  default: ({ tabKey, mongoId, contactId }: any) => (
    <div data-testid="contact-details">
      {tabKey}:{mongoId ?? "none"}:{contactId ?? "none"}
    </div>
  ),
}));

const mockToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  __esModule: true,
  showCustomToast: (args: any) => mockToast(args),
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Modal: ({ show, children, title, footer }: any) =>
    show ? (
      <div data-testid="modal">
        <div>{title}</div>
        {children}
        {footer}
      </div>
    ) : null,
  SideModal: ({ show, children, title, onHide }: any) =>
    show ? (
      <div data-testid="side-modal">
        <div data-testid="side-modal-title">{title}</div>
        <button onClick={onHide}>Close</button>
        {children}
      </div>
    ) : null,
  WarningIcon: () => <span data-testid="warning-icon" />,
}));

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/constants", () => ({
  __esModule: true,
  API_ENDPOINTS: { contact: "/contact" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong" },
  ToastType: { Error: "error", Success: "success" },
}));

const mkContact = (overrides: any = {}) => {
  const base = {
    id: "m1",
    contactId: "c1",
    fullName: "John Doe",
    title: "Manager",
    primaryEmail: "john@test.com",
    primaryPhone: "123456",
    contactTypes: ["Internal"],
    organization: { organizationCount: 1, organizationList: ["Org A"] },
    group: { groupCount: 1, groupList: ["Group A"] },
    organizations: [],
    groups: [],
  };

  return {
    ...base,
    ...overrides,
    organization: { ...base.organization, ...(overrides.organization ?? {}) },
    group: { ...base.group, ...(overrides.group ?? {}) },
    contactTypes: Array.isArray(overrides.contactTypes)
      ? overrides.contactTypes
      : base.contactTypes,
    organizations: Array.isArray(overrides.organizations)
      ? overrides.organizations
      : base.organizations,
    groups: Array.isArray(overrides.groups) ? overrides.groups : base.groups,
  };
};

const renderCard = (props: any = {}) =>
  render(
    <MemoryRouter>
      <ContactCards data={mkContact(props.data) as any} idOpen={props.idOpen} />
    </MemoryRouter>,
  );

describe("ContactCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/org-detail/123";
    mockUseParams.mockReturnValue({ id: "123" });
  });

  it("renders contact basic info", () => {
    renderCard();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Manager")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
    expect(screen.getByText("(123456)")).toBeInTheDocument();

    expect(screen.getByText("Org A")).toBeInTheDocument();
    expect(screen.getByText("Group A")).toBeInTheDocument();
    expect(screen.getByText("Internal")).toBeInTheDocument();
  });

  it("opens the details sidebar on name click and passes mongoId + contactId", () => {
    renderCard();

    fireEvent.click(screen.getByText("John Doe"));

    expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    expect(screen.getByTestId("contact-details")).toHaveTextContent(
      "contactInfo:m1:c1",
    );
  });

  it("auto-opens the details sidebar when idOpen is true", () => {
    renderCard({ idOpen: true });

    expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    expect(screen.getByTestId("contact-details")).toHaveTextContent(
      "contactInfo:m1:c1",
    );
  });

  it("opens the organizations and groups tabs via the + more links", () => {
    renderCard({
      data: {
        organization: { organizationCount: 2, organizationList: ["Org A", "Org B"] },
        group: { groupCount: 3, groupList: ["Group A", "Group B", "Group C"] },
      },
    });

    fireEvent.click(screen.getByText("+ 1 more"));
    expect(screen.getByTestId("contact-details")).toHaveTextContent(
      "organizations:m1:c1",
    );

    fireEvent.click(screen.getByText("+ 2 more"));
    expect(screen.getByTestId("contact-details")).toHaveTextContent("groups:m1:c1");
  });

  it("closes the details sidebar via onHide", () => {
    renderCard();

    fireEvent.click(screen.getByText("John Doe"));
    expect(screen.getByTestId("side-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("side-modal")).not.toBeInTheDocument();
  });

  it("deletes a contact using the Mongo _id (data.id), not contactId", async () => {
    (api.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <ContactCards data={mkContact() as any} isEdit />
      </MemoryRouter>,
    );

    // Open the remove/delete modal, then confirm the hard delete.
    fireEvent.click(screen.getByLabelText("Remove contact"));
    fireEvent.click(screen.getByText("Delete contact"));

    expect(api.delete).toHaveBeenCalledTimes(1);
    expect(api.delete).toHaveBeenCalledWith("/contact/m1");
    // Guard against regressing to the old contactId identifier.
    expect(api.delete).not.toHaveBeenCalledWith("/contact/c1");
  });
});
