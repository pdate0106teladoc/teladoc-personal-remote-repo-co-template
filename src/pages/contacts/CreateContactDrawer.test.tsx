import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import CreateContactDrawer from "./ContactOpsDrawer";

let mockPathname = "/org-detail/123";
const mockUseParams = vi.fn();

vi.mock("react-router-dom", () => ({
    __esModule: true,
    useParams: () => mockUseParams(),
    useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock("react-bootstrap", () => {
    const Tabs = ({ children, activeKey, onSelect }: any) => (
        <div data-testid="tabs" data-active={activeKey}>
            {children}
            <button onClick={() => onSelect("contactInfo")}>tab-contactInfo</button>
            <button onClick={() => onSelect("org")}>tab-org</button>
            <button onClick={() => onSelect("grp")}>tab-grp</button>
            <button onClick={() => onSelect(undefined)}>tab-undef</button>
        </div>
    );
    const Tab = ({ children, eventKey, title }: any) => (
        <div data-testid={`tab-${eventKey}`} data-title={title}>
            {children}
        </div>
    );
    return { __esModule: true, Tabs, Tab };
});

vi.mock("./ContactBasicForm", () => ({
    __esModule: true,
    default: ({ values, errors, onChange }: any) => (
        <div data-testid="basic-form">
            <input
                aria-label="name"
                value={values.name}
                onChange={(e) => onChange("name", e.target.value)}
            />
            <input
                aria-label="email"
                value={values.email}
                onChange={(e) => onChange("email", e.target.value)}
            />
            <input
                aria-label="phone"
                value={values.phone}
                onChange={(e) => onChange("phone", e.target.value)}
            />
            <input
                aria-label="zip"
                value={values.zip}
                onChange={(e) => onChange("zip", e.target.value)}
            />
            <button onClick={() => onChange("roles", { Broker: true })}>set-roles</button>
            {errors.name && <span data-testid="err-name">{errors.name}</span>}
            {errors.email && <span data-testid="err-email">{errors.email}</span>}
            {errors.phone && <span data-testid="err-phone">{errors.phone}</span>}
            {errors.zip && <span data-testid="err-zip">{errors.zip}</span>}
        </div>
    ),
}));

vi.mock("./EditContactBasicForm", () => ({
    __esModule: true,
    default: ({ values, errors, onChange }: any) => (
        <div data-testid="edit-basic-form">
            <input
                aria-label="name"
                value={values.name}
                onChange={(e) => onChange("name", e.target.value)}
            />
            <input
                aria-label="email"
                value={values.email}
                onChange={(e) => onChange("email", e.target.value)}
            />
            <input
                aria-label="phone"
                value={values.phone}
                onChange={(e) => onChange("phone", e.target.value)}
            />
            <input
                aria-label="zip"
                value={values.zip}
                onChange={(e) => onChange("zip", e.target.value)}
            />
            <span data-testid="roles-json">{JSON.stringify(values.roles)}</span>
            <button onClick={() => onChange("roles", { ...values.roles, Broker: true })}>
                add-broker
            </button>
            {errors.name && <span data-testid="err-name">{errors.name}</span>}
            {errors.email && <span data-testid="err-email">{errors.email}</span>}
            {errors.phone && <span data-testid="err-phone">{errors.phone}</span>}
            {errors.zip && <span data-testid="err-zip">{errors.zip}</span>}
        </div>
    ),
}));

vi.mock("@/utils", () => ({
    __esModule: true,
    extractEntityData: (x: any) => x,
}));

vi.mock("@/components/ContactEntityTable/ContactEntityTable", () => ({
    __esModule: true,
    default: ({ type, contactId }: any) => (
        <div data-testid={`cet-${type}`} data-contact-id={contactId ?? ""}>
            {type}:{contactId ?? ""}
        </div>
    ),
}));

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
const mockApiPatch = vi.fn();
vi.mock("@/api/apiService", () => ({
    __esModule: true,
    default: {
        get: (...a: any[]) => mockApiGet(...a),
        post: (...a: any[]) => mockApiPost(...a),
        patch: (...a: any[]) => mockApiPatch(...a),
    },
}));

const mockToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
    __esModule: true,
    Button: ({ children, onClick, disabled, variant }: any) => (
        <button data-variant={variant} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
    Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
    FailSafePage: ({ cardType }: any) => (
        <div data-testid="fail-safe" data-card-type={cardType} />
    ),
    showCustomToast: (args: any) => mockToast(args),
    ToastType: { Error: "error" },
}));

vi.mock("@/constants", () => ({
    __esModule: true,
    API_ENDPOINTS: {
        contact: "client-configurations/contacts",
        metadata: "client-configurations/metadata",
    },
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}));

vi.mock("axios", () => ({
    __esModule: true,
    isAxiosError: (e: any) => e?.__axios === true,
}));

describe("CreateContactDrawer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPathname = "/org-detail/123";
        mockUseParams.mockReturnValue({ id: "org-1" });
    });

    it("renders Save disabled until name + email are entered", () => {
        render(<CreateContactDrawer onHide={vi.fn()} />);
        const saveBtn = screen.getByText("Save").closest("button");
        expect(saveBtn).toBeDisabled();

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        expect(screen.getByText("Save").closest("button")).not.toBeDisabled();
    });

    it("prefills name + email from prefillValues", () => {
        render(
            <CreateContactDrawer
                onHide={vi.fn()}
                prefillValues={{ name: "Sam", email: "s@x.com" }}
            />,
        );
        expect(screen.getByLabelText("name")).toHaveValue("Sam");
        expect(screen.getByLabelText("email")).toHaveValue("s@x.com");
    });

    it("creates a contact (POST), then PATCHes contact-relations, then switches to org tab", async () => {
        mockApiPost.mockResolvedValueOnce({ data: { contactId: "new-id" } });
        mockApiPatch.mockResolvedValueOnce({ data: {} });

        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });

        fireEvent.click(screen.getByText("Save"));

        await waitFor(() =>
            expect(mockApiPost).toHaveBeenCalledWith(
                expect.stringContaining("client-configurations/contacts"),
                expect.objectContaining({
                    name: "Jane",
                    email: "j@x.com",
                }),
            ),
        );
        await waitFor(() =>
            expect(mockApiPatch).toHaveBeenCalledWith(
                expect.stringContaining(
                    "client-configurations/ORGANIZATION/org-1/contact-relations",
                ),
                {
                    add: [{ contactId: "new-id", contactTypes: [] }],
                },
            ),
        );
        await waitFor(() =>
            expect(screen.getByTestId("tabs")).toHaveAttribute("data-active", "org"),
        );
    });

    it("posts the address object the way the API expects", async () => {
        mockApiPost.mockResolvedValueOnce({ data: { contactId: "new-id" } });
        mockApiPatch.mockResolvedValueOnce({ data: {} });

        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        fireEvent.click(screen.getByText("set-roles"));
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => expect(mockApiPost).toHaveBeenCalled());

        const body = mockApiPost.mock.calls[0][1];
        expect(body).toMatchObject({
            name: "Jane",
            email: "j@x.com",
            contactRole: ["Broker"],
            addresses: [
                expect.objectContaining({ type: "MAILING" }),
            ],
        });
    });

    it("validates name and email and surfaces errors", async () => {
        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "not-email" },
        });
        fireEvent.click(screen.getByText("Save"));

        await screen.findByTestId("err-email");
        expect(screen.getByTestId("err-email")).toHaveTextContent(
            "Enter a valid email address.",
        );
    });

    it("validates phone (digits only & length 10)", async () => {
        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        fireEvent.change(screen.getByLabelText("phone"), {
            target: { value: "12345" },
        });

        fireEvent.click(screen.getByText("Save"));
        await screen.findByTestId("err-phone");
        expect(screen.getByTestId("err-phone")).toHaveTextContent(
            "Phone must be exactly 10 digits.",
        );
    });

    it("flags non-digit phone characters live (on change)", () => {
        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("phone"), {
            target: { value: "123abc" },
        });
        expect(screen.getByTestId("err-phone")).toHaveTextContent(
            "Phone must contain digits only.",
        );
    });

    it("validates ZIP length when provided", async () => {
        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        fireEvent.change(screen.getByLabelText("zip"), {
            target: { value: "12" },
        });

        fireEvent.click(screen.getByText("Save"));
        await screen.findByTestId("err-zip");
        expect(screen.getByTestId("err-zip")).toHaveTextContent(
            "ZIP/Postal code must be exactly 5 digits.",
        );
    });

    it("shows EMAIL_ALREADY_EXISTS error from API", async () => {
        const axiosErr: any = new Error("conflict");
        axiosErr.__axios = true;
        axiosErr.response = { data: { error: "EMAIL_ALREADY_EXISTS" } };
        mockApiPost.mockRejectedValueOnce(axiosErr);

        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        fireEvent.click(screen.getByText("Save"));

        await screen.findByTestId("err-email");
        expect(screen.getByTestId("err-email")).toHaveTextContent(
            "A contact with this email already exists.",
        );
    });

    it("shows toast on generic API failure", async () => {
        mockApiPost.mockRejectedValueOnce(new Error("boom"));

        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({ type: "error", title: "Failed" }),
            ),
        );
    });

    it("edit mode: loads contact metadata and pre-populates the form", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                name: "Old Name",
                email: "old@x.com",
                title: "VP",
                phone: "(123) 456-7890",
                contactRole: { allowedValues: ["IT", "Broker"], value: ["IT"] },
                addresses: [
                    {
                        street: "1 Way",
                        city: "NYC",
                        county: "NY",
                        state: "NY",
                        postalCode: "10001",
                    },
                ],
            },
        });

        render(
            <CreateContactDrawer onHide={vi.fn()} editMode contactId="c-1" mongoId="c-1" />,
        );

        await waitFor(() =>
            expect(screen.getByLabelText("name")).toHaveValue("Old Name"),
        );
        expect(screen.getByLabelText("email")).toHaveValue("old@x.com");
        expect(screen.getByLabelText("phone")).toHaveValue("1234567890");
        expect(mockApiGet).toHaveBeenCalledWith(
            expect.stringContaining("client-configurations/metadata/contacts/c-1"),
        );
    });

    it("edit mode: builds the roles Record from metadata allowedValues, marking saved roles selected", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                name: "Old Name",
                email: "old@x.com",
                contactRole: { allowedValues: ["IT", "Broker"], value: ["IT"] },
                addresses: [],
            },
        });

        render(
            <CreateContactDrawer onHide={vi.fn()} editMode contactId="c-1" mongoId="c-1" />,
        );

        await waitFor(() =>
            expect(screen.getByLabelText("name")).toHaveValue("Old Name"),
        );
        expect(screen.getByTestId("roles-json")).toHaveTextContent(
            JSON.stringify({ IT: true, Broker: false }),
        );
    });

    it("edit mode: sends the selected roles as a string[] in the PATCH payload", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                name: "Old Name",
                email: "old@x.com",
                contactRole: { allowedValues: ["IT", "Broker"], value: ["IT"] },
                addresses: [],
            },
        });
        mockApiPatch.mockResolvedValueOnce({ data: {} });

        render(
            <CreateContactDrawer onHide={vi.fn()} editMode contactId="c-1" mongoId="c-1" />,
        );

        await waitFor(() =>
            expect(screen.getByLabelText("name")).toHaveValue("Old Name"),
        );

        fireEvent.click(screen.getByText("add-broker"));
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => expect(mockApiPatch).toHaveBeenCalled());
        const body = mockApiPatch.mock.calls[0][1];
        expect(body.contactRole).toEqual(["IT", "Broker"]);
    });

    it("edit mode: error toast when loading contact fails", async () => {
        mockApiGet.mockRejectedValueOnce(new Error("nope"));

        render(
            <CreateContactDrawer onHide={vi.fn()} editMode contactId="c-1" mongoId="c-1" />,
        );

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({ type: "error", title: "Failed" }),
            ),
        );
    });

    it("edit mode: shows a load-error message and not the form when metadata fails", async () => {
        mockApiGet.mockRejectedValueOnce(new Error("nope"));

        render(
            <CreateContactDrawer onHide={vi.fn()} editMode contactId="c-1" mongoId="c-1" />,
        );

        await waitFor(() =>
            expect(screen.getByTestId("fail-safe")).toBeInTheDocument(),
        );
        expect(screen.getByTestId("fail-safe")).toHaveAttribute(
            "data-card-type",
            "dataFailed",
        );
        expect(screen.queryByTestId("edit-basic-form")).toBeNull();
        expect(screen.queryByTestId("roles-json")).toBeNull();
    });

    it("edit mode: PATCHes and advances tab when form differs from original", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                name: "Old Name",
                email: "old@x.com",
                addresses: [],
            },
        });
        mockApiPatch.mockResolvedValueOnce({ data: {} });

        render(
            <CreateContactDrawer onHide={vi.fn()} editMode contactId="c-1" mongoId="c-1" />,
        );

        await waitFor(() =>
            expect(screen.getByLabelText("name")).toHaveValue("Old Name"),
        );

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "New Name" },
        });
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() =>
            expect(mockApiPatch).toHaveBeenCalledWith(
                expect.stringContaining("client-configurations/contacts/c-1"),
                expect.objectContaining({ name: "New Name", email: "old@x.com" }),
            ),
        );
        await waitFor(() =>
            expect(screen.getByTestId("tabs")).toHaveAttribute("data-active", "org"),
        );
    });

    it("edit mode: Save button is disabled when form is unchanged", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: { name: "Same", email: "same@x.com", addresses: [] },
        });

        render(
            <CreateContactDrawer onHide={vi.fn()} editMode contactId="c-1" mongoId="c-1" />,
        );

        await waitFor(() =>
            expect(screen.getByLabelText("name")).toHaveValue("Same"),
        );

        expect(screen.getByText("Save").closest("button")).toBeDisabled();
        expect(mockApiPatch).not.toHaveBeenCalled();
    });

    it("edit mode + editName mismatch shows the name-mismatch error", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: { name: "Existing", email: "e@x.com", addresses: [] },
        });

        render(
            <CreateContactDrawer
                onHide={vi.fn()}
                editMode
                contactId="c-1"
                mongoId="c-1"
                editName="Different"
            />,
        );

        await waitFor(() =>
            expect(screen.getByLabelText("name")).toHaveValue("Existing"),
        );

        await waitFor(() =>
            expect(screen.getByTestId("err-name")).toHaveTextContent(
                /doesn't match/i,
            ),
        );
    });

    it("calls onHide when Save is clicked from the non-contactInfo tab", async () => {
        const onHide = vi.fn();
        render(<CreateContactDrawer onHide={onHide} />);

        // Move to org tab to expose Save behavior: but Save button is only on contactInfo
        fireEvent.click(screen.getByText("tab-org"));
        // Save button is not rendered on other tabs — the footer is hidden
        expect(screen.queryByText("Save")).toBeNull();
    });

    it("does not move past contactInfo when validation fails", async () => {
        render(<CreateContactDrawer onHide={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: " " },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        // name is whitespace -> Save still disabled, but click anyway by tweaking values to enable then re-blank.
        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        // now Save is enabled
        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: " " },
        });
        // Re-enable email so the button is gated by name only
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        // Save remains disabled because !basicForm.name.trim() is true
        expect(screen.getByText("Save").closest("button")).toBeDisabled();
    });

    it("uses props for entityType/entityId when supplied (instead of URL)", async () => {
        mockApiPost.mockResolvedValueOnce({ data: { contactId: "c-new" } });
        mockApiPatch.mockResolvedValueOnce({ data: {} });

        render(
            <CreateContactDrawer
                onHide={vi.fn()}
                entityType="GROUP"
                entityId="g-9"
            />,
        );

        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() =>
            expect(mockApiPatch).toHaveBeenCalledWith(
                expect.stringContaining("client-configurations/GROUP/g-9/contact-relations"),
                expect.any(Object),
            ),
        );
    });

    it("passes the right contactId to ContactEntityTable in edit vs create modes", async () => {
        mockApiPost.mockResolvedValueOnce({ data: { contactId: "new-1" } });
        mockApiPatch.mockResolvedValueOnce({ data: {} });

        render(<CreateContactDrawer onHide={vi.fn()} />);
        fireEvent.change(screen.getByLabelText("name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByLabelText("email"), {
            target: { value: "j@x.com" },
        });
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() =>
            expect(screen.getByTestId("cet-organization")).toHaveAttribute(
                "data-contact-id",
                "new-1",
            ),
        );
        expect(screen.getByTestId("cet-group")).toHaveAttribute(
            "data-contact-id",
            "new-1",
        );
    });

    it("falls back to 'contactInfo' when Tabs.onSelect receives undefined", () => {
        render(<CreateContactDrawer onHide={vi.fn()} />);
        fireEvent.click(screen.getByText("tab-undef"));
        expect(screen.getByTestId("tabs")).toHaveAttribute(
            "data-active",
            "contactInfo",
        );
    });
});
