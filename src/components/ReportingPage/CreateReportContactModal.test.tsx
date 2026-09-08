import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateReportContactModal from "./CreateReportContactModal";

vi.mock("./CreateReportContactModal.scss", () => ({}));

let pathname = "/CCC/organizations/org-123/reporting";
vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "org-123" }),
  useLocation: () => ({ pathname }),
}));

vi.mock("@/router/routes", () => ({
  GRP_DETAIL_PATH: "/CCC/groups",
}));

const mockPost = vi.fn();
const mockPatch = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
    patch: (...args: any[]) => mockPatch(...args),
  },
}));

const mockToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  Modal: ({ show, title, children, footer }: any) =>
    show ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
        {footer}
      </div>
    ) : null,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  CustomInput: ({ id, label, value, onChange, error, required }: any) => (
    <div>
      <label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <input id={id} value={value} onChange={onChange} />
      {error && <span data-testid={`${id}-error`}>{error}</span>}
    </div>
  ),
  showCustomToast: (args: any) => mockToast(args),
  ToastType: { Error: "error" },
}));

vi.mock("@/assets", () => ({
  ErrorIcon: (props: any) => <svg data-testid="note-icon" {...props} />,
}));

const defaultProps = {
  show: true,
  initialEmail: "bill.smith@aetna.com",
  recipientLabel: "To",
  onHide: vi.fn(),
  onBackToSearch: vi.fn(),
  onCreated: vi.fn(),
};

const editUrl = import.meta.env.VITE_EDIT_URL ?? "";

describe("CreateReportContactModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathname = "/CCC/organizations/org-123/reporting";
    mockPost.mockResolvedValue({ data: { contactId: "contact-9" } });
    mockPatch.mockResolvedValue({});
  });

  it("seeds the email field with what was typed in the lookup", () => {
    render(<CreateReportContactModal {...defaultProps} />);
    expect(screen.getByLabelText("Email *")).toHaveValue("bill.smith@aetna.com");
    expect(screen.getByText(/contact will display using the email address/)).toBeInTheDocument();
  });

  it("names the primary action after the field that opened it", () => {
    render(<CreateReportContactModal {...defaultProps} recipientLabel="Bcc" />);
    expect(screen.getByText('Create and Add to “Bcc”')).toBeInTheDocument();
  });

  it("creates the contact, links it to the entity and hands back the email", async () => {
    render(<CreateReportContactModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Bill" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.click(screen.getByText('Create and Add to “To”'));

    await waitFor(() => expect(mockPost).toHaveBeenCalled());

    expect(mockPost).toHaveBeenCalledWith(
      `${editUrl}client-configurations/contacts`,
      { name: "Bill Smith", email: "bill.smith@aetna.com", contactRole: [] },
    );
    expect(mockPatch).toHaveBeenCalledWith(
      `${editUrl}client-configurations/ORGANIZATION/org-123/contact-relations`,
      { add: [{ contactId: "contact-9", contactTypes: [] }] },
    );
    expect(defaultProps.onCreated).toHaveBeenCalledWith({
      email: "bill.smith@aetna.com",
      name: "Bill Smith",
    });
  });

  it("falls back to the email as the contact name when no names are given", async () => {
    render(<CreateReportContactModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Create and Add to “To”'));

    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockPost.mock.calls[0][1]).toMatchObject({
      name: "bill.smith@aetna.com",
    });
  });

  it("links the contact to the group when opened from a group", async () => {
    pathname = "/CCC/groups/grp-7/reporting";
    render(<CreateReportContactModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Create and Add to “To”'));

    await waitFor(() => expect(mockPatch).toHaveBeenCalled());
    expect(mockPatch.mock.calls[0][0]).toContain("/GROUP/org-123/contact-relations");
  });

  it("rejects a malformed email without calling the API", () => {
    render(<CreateReportContactModal {...defaultProps} initialEmail="not-an-email" />);
    fireEvent.click(screen.getByText('Create and Add to “To”'));

    expect(screen.getByTestId("create-report-contact-email-error")).toHaveTextContent(
      "Enter a valid email address.",
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("surfaces a duplicate email inline rather than as a toast", async () => {
    mockPost.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: "EMAIL_ALREADY_EXISTS" } },
    });
    render(<CreateReportContactModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Create and Add to “To”'));

    await waitFor(() =>
      expect(screen.getByTestId("create-report-contact-email-error")).toHaveTextContent(
        "A contact with this email already exists.",
      ),
    );
    expect(mockToast).not.toHaveBeenCalled();
    expect(defaultProps.onCreated).not.toHaveBeenCalled();
  });

  it("toasts on any other failure and keeps the modal open", async () => {
    mockPost.mockRejectedValue(new Error("boom"));
    render(<CreateReportContactModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Create and Add to “To”'));

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(defaultProps.onCreated).not.toHaveBeenCalled();
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("goes back to the lookup without creating anything", () => {
    render(<CreateReportContactModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Back to search"));

    expect(defaultProps.onBackToSearch).toHaveBeenCalledTimes(1);
    expect(mockPost).not.toHaveBeenCalled();
  });
});
