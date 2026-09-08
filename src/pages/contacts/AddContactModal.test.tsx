import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AddContactModal from "./AddContactModal";

let mockPathname = "/org-detail/123";
const mockUseParams = vi.fn();

vi.mock("react-router-dom", () => ({
    __esModule: true,
    useParams: () => mockUseParams(),
    useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock("@/assets", () => ({
    __esModule: true,
    ErrorIcon: (props: any) => <svg data-testid="error-icon" {...props} />,
}));

vi.mock("./ContactOpsDrawer", () => ({
    __esModule: true,
    default: ({ onHide, prefillValues, editMode, contactId, entityType, entityId, editName }: any) => (
        <div data-testid="create-contact-drawer">
            <div data-testid="ccd-editMode">{String(!!editMode)}</div>
            <div data-testid="ccd-contactId">{contactId ?? ""}</div>
            <div data-testid="ccd-entityType">{entityType ?? ""}</div>
            <div data-testid="ccd-entityId">{entityId ?? ""}</div>
            <div data-testid="ccd-editName">{editName ?? ""}</div>
            <div data-testid="ccd-prefill">{JSON.stringify(prefillValues ?? {})}</div>
            <button onClick={onHide}>ccd-hide</button>
        </div>
    ),
}));

const mockApiPost = vi.fn();
const mockApiPatch = vi.fn();
vi.mock("@/api/apiService", () => ({
    __esModule: true,
    default: {
        post: (...args: any[]) => mockApiPost(...args),
        patch: (...args: any[]) => mockApiPatch(...args),
    },
}));

const mockToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
    __esModule: true,
    Button: ({ children, onClick, disabled, variant }: any) => (
        <button
            data-testid={`btn-${variant ?? "default"}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    ),
    CustomInput: ({ id, label, value, onChange, error, type }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                aria-label={label}
                value={value ?? ""}
                onChange={onChange}
                type={type ?? "text"}
            />
            {error ? <span data-testid={`error-${id}`}>{error}</span> : null}
        </div>
    ),
    CustomRadioToggle: ({ value, onChange, options, name }: any) => (
        <div data-testid={`radio-${name}`}>
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    data-active={value === opt.value}
                    data-testid={`radio-opt-${opt.value}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    ),
    Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
    Modal: ({ show, onHide, title, footer, children }: any) =>
        show ? (
            <div data-testid="modal" role="dialog" aria-label={title}>
                <header data-testid="modal-title">{title}</header>
                <div data-testid="modal-body">{children}</div>
                <footer>{footer}</footer>
                <button onClick={onHide}>modal-close</button>
            </div>
        ) : null,
    SearchBar: ({ value, onChange, onSuggestionClick, placeholder }: any) => (
        <div>
            <input
                aria-label="search"
                placeholder={placeholder}
                value={value ?? ""}
                onChange={onChange}
            />
            <button
                onClick={() =>
                    onSuggestionClick({
                        id: "ent-1",
                        organizationName: "Org A",
                    })
                }
            >
                pick-suggestion
            </button>
        </div>
    ),
    showCustomToast: (...args: any[]) => mockToast(...args),
    SideModal: ({ show, onHide, title, children }: any) =>
        show ? (
            <div data-testid="side-modal">
                <header data-testid="side-modal-title">{title}</header>
                {children}
                <button onClick={onHide}>side-hide</button>
            </div>
        ) : null,
    ToastType: { Error: "error" },
}));

vi.mock("@/constants", () => ({
    __esModule: true,
    API_ENDPOINTS: {
        suggestedSearch: "client-configurations/suggest",
    },
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}));

describe("AddContactModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPathname = "/org-detail/123";
        mockUseParams.mockReturnValue({ id: "org-1" });
    });

    it("renders nothing when `show` is false", () => {
        const { container } = render(
            <AddContactModal show={false} onHide={vi.fn()} />,
        );
        expect(container.querySelector("[data-testid='modal']")).toBeNull();
    });

    it("renders the Add modal with empty fields and disabled Continue", () => {
        render(<AddContactModal show onHide={vi.fn()} />);

        expect(screen.getByTestId("modal-title")).toHaveTextContent("Add contact");
        expect(screen.getByLabelText("Name")).toHaveValue("");
        expect(screen.getByLabelText("Email")).toHaveValue("");
        const continueBtn = screen.getByText("Continue").closest("button");
        expect(continueBtn).toBeDisabled();
    });

    it("validates name + email and shows inline errors", async () => {
        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "not-an-email" },
        });

        fireEvent.click(screen.getByText("Continue"));

        await screen.findByTestId("error-add-contact-email");
        expect(screen.getByTestId("error-add-contact-email")).toHaveTextContent(
            "Enter a valid email address.",
        );
    });

    it("clears name/email errors as the user types valid input", async () => {
        render(<AddContactModal show onHide={vi.fn()} />);

        // Trigger errors first: empty -> click Continue won't fire (disabled).
        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "A" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "bad" },
        });
        fireEvent.click(screen.getByText("Continue"));
        await screen.findByTestId("error-add-contact-email");

        // Fix email
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "good@x.com" },
        });
        expect(screen.queryByTestId("error-add-contact-email")).toBeNull();
    });

    it("runs duplicate check on Continue and switches to existing-same-org banner", async () => {
        mockApiPost.mockResolvedValueOnce({
            data: { status: "DUPLICATE_IN_CURRENT_ORG", contactId: "c-1" },
        });

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        await waitFor(() =>
            expect(mockApiPost).toHaveBeenCalledWith(
                expect.stringContaining("client-configurations/ORGANIZATION/org-1/contacts/duplicate-check"),
                { name: "Jane", email: "jane@x.com" },
            ),
        );

        await waitFor(() =>
            expect(
                screen.getByText(/Duplicate with an existing contact/i),
            ).toBeInTheDocument(),
        );
        // Continue stays disabled in the same-org duplicate state
        expect(screen.getByText("Continue").closest("button")).toBeDisabled();
    });

    it("switches to existing-other-org view and offers Add and edit contact", async () => {
        mockApiPost.mockResolvedValueOnce({
            data: { status: "DUPLICATE_IN_OTHER_ORG", contactId: "c-2" },
        });

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        await waitFor(() =>
            expect(screen.getByTestId("modal-title")).toHaveTextContent(
                /exists in another organization/i,
            ),
        );

        // Clicking Add and edit contact PATCHes contact-relations, then shows CreateContactDrawer
        mockApiPatch.mockResolvedValueOnce({ data: {} });
        fireEvent.click(screen.getByText("Add and edit contact"));

        await waitFor(() =>
            expect(mockApiPatch).toHaveBeenCalledWith(
                expect.stringContaining("client-configurations/ORGANIZATION/org-1/contact-relations"),
                {
                    add: [{ contactId: "c-2", contactTypes: [] }],
                },
            ),
        );

        await screen.findByTestId("create-contact-drawer");
        expect(screen.getByTestId("ccd-editMode").textContent).toBe("true");
        expect(screen.getByTestId("ccd-contactId").textContent).toBe("c-2");
        expect(screen.getByTestId("ccd-editName").textContent).toBe("Jane");
    });

    it("shows error toast when Add-and-edit PATCH fails", async () => {
        mockApiPost.mockResolvedValueOnce({
            data: { status: "DUPLICATE_IN_OTHER_ORG", contactId: "c-3" },
        });
        mockApiPatch.mockRejectedValueOnce(new Error("nope"));

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        await waitFor(() =>
            expect(screen.getByTestId("modal-title")).toHaveTextContent(
                /exists in another organization/i,
            ),
        );
        fireEvent.click(screen.getByText("Add and edit contact"));

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({ type: "error", title: "Failed" }),
            ),
        );
    });

    it("switches to no-match view and opens the create drawer", async () => {
        mockApiPost.mockResolvedValueOnce({
            data: { status: "UNIQUE" },
        });

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        await waitFor(() =>
            expect(screen.getByTestId("modal-title")).toHaveTextContent(
                /No matching contact found/i,
            ),
        );

        fireEvent.click(screen.getByText("Create new contact"));

        const drawer = await screen.findByTestId("create-contact-drawer");
        expect(drawer).toBeInTheDocument();
        const prefill = JSON.parse(
            screen.getByTestId("ccd-prefill").textContent || "{}",
        );
        expect(prefill).toEqual({ name: "Jane", email: "jane@x.com" });
    });

    it("Back from existing-other-org returns to Add view", async () => {
        mockApiPost.mockResolvedValueOnce({
            data: { status: "DUPLICATE_IN_OTHER_ORG", contactId: "c-2" },
        });

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        await waitFor(() =>
            expect(screen.getByTestId("modal-title")).toHaveTextContent(
                /exists in another organization/i,
            ),
        );
        fireEvent.click(screen.getByText("Back"));

        expect(screen.getByTestId("modal-title")).toHaveTextContent("Add contact");
    });

    it("resets state and calls onHide when the modal is closed", () => {
        const onHide = vi.fn();
        render(<AddContactModal show onHide={onHide} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.click(screen.getByText("modal-close"));
        expect(onHide).toHaveBeenCalledTimes(1);
    });

    it("shows error toast when duplicate-check API rejects", async () => {
        mockApiPost.mockRejectedValueOnce(new Error("server down"));

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({ type: "error", title: "Failed" }),
            ),
        );
    });

    it("shows error toast when no entity id is present (no /:id in route)", async () => {
        mockUseParams.mockReturnValue({});

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({ type: "error", title: "Failed" }),
            ),
        );
        expect(mockApiPost).not.toHaveBeenCalled();
    });

    it("enters Associate view when invoked from search-results page", async () => {
        mockPathname = "/search-results";
        mockUseParams.mockReturnValue({});

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        expect(screen.getByTestId("modal-title")).toHaveTextContent(
            /Associate contact to org\/group/i,
        );

        // Picking a suggestion enables the Associate button which triggers duplicate-check
        mockApiPost.mockResolvedValueOnce({
            data: { status: "UNIQUE" },
        });
        fireEvent.click(screen.getByText("pick-suggestion"));
        fireEvent.click(screen.getByText("Associate"));

        await waitFor(() =>
            expect(mockApiPost).toHaveBeenCalledWith(
                expect.stringContaining("client-configurations/ORGANIZATION/ent-1/contacts/duplicate-check"),
                expect.any(Object),
            ),
        );
    });

    it("Group selection in Associate view switches entity type and resets selection", () => {
        mockPathname = "/search-results";
        mockUseParams.mockReturnValue({});

        render(<AddContactModal show onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "jane@x.com" },
        });
        fireEvent.click(screen.getByText("Continue"));

        // Switch to GROUP
        fireEvent.click(screen.getByTestId("radio-opt-GROUP"));
        expect(screen.getByTestId("radio-opt-GROUP")).toHaveAttribute(
            "data-active",
            "true",
        );

        const continueBtn = screen.getByText("Associate").closest("button");
        expect(continueBtn).toBeDisabled();
    });
});
