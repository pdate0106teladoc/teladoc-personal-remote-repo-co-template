import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

import ViewContacts from "./ViewContacts";

let mockPathname = "/contacts";
const mockUseParams = vi.fn();

vi.mock("react-router-dom", () => ({
    __esModule: true,
    useParams: () => mockUseParams(),
    useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock("./ContactCards", () => ({
    __esModule: true,
    default: ({ data }: any) => (
        <div data-testid="contact-card">{data.contactId}</div>
    ),
}));

vi.mock("./AddContactModal", () => ({
    __esModule: true,
    default: ({ show, onHide }: any) =>
        show ? (
            <div data-testid="add-contact-modal">
                <button onClick={onHide}>add-contact-close</button>
            </div>
        ) : null,
}));

vi.mock("@/assets", () => ({
    __esModule: true,
    DarkPlusIcon: (props: any) => <svg data-testid="dark-plus-icon" {...props} />,
}));

vi.mock("@/components/sidebar/ContactFilterSidebar", () => ({
    __esModule: true,
    default: ({ onFiltersApplied }: any) => (
        <button onClick={onFiltersApplied}>Apply Filters</button>
    ),
}));

const mockToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
    showCustomToast: (args: any) => mockToast(args),
    ContactIcon: () => <svg data-testid="contact-icon" />,
    Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
    FailSafePage: ({ cardType }: any) => (
        <div data-testid="failsafe">{cardType}</div>
    ),
    FilterButton: ({ count, onClick }: any) => (
        <button onClick={onClick}>Filter ({count})</button>
    ),
    SideModal: ({ show, children }: any) =>
        show ? <div data-testid="right-modal">{children}</div> : null,
    FilteredByBar: ({ filters }: any) => (
        <div data-testid="filtered-bar">{filters.join(",")}</div>
    ),
    Button: ({ children, onClick }: any) => (
        <button onClick={onClick}>{children}</button>
    ),
    PaginationView: ({ currentPage, onPageChange }: any) => (
        <div>
            <button aria-label="Next Page" onClick={() => onPageChange(currentPage + 1)}>Next</button>
            <button aria-label="Prev Page" onClick={() => onPageChange(currentPage - 1)}>Prev</button>
        </div>
    ),
}));

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();

vi.mock("@/api/apiService", () => ({
    __esModule: true,
    default: {
        get: (...args: any[]) => mockApiGet(...args),
        post: (...args: any[]) => mockApiPost(...args),
    },
}));

vi.mock("@/constants", () => ({
    __esModule: true,
    API_ENDPOINTS: {
        loadSourceUrl: "",
        contact: "/contact",
        searchBaseUrl: "",
        contactFilter: "/contact-filter",
    },
    ERROR_MESSAGES: {
        SOMETHINGS_WRONG: "Something went wrong",
    },
    ToastType: { Error: "error" },
    LABELS: {
        products: { CLEAR_ALL: "Clear All" },
    },
}));

let appliedCount = 0;
let activeKeys: string[] = [];

const clearFilters = vi.fn();
const getFilters = vi.fn(() => ({
    nameFilter: {},
    orgFilter: {},
    grpFilter: {},
    contactTypeIntFilter: [],
    contactTypeExtFilter: [],
}));

vi.mock("@/store/useContactFilterStore", () => ({
    __esModule: true,
    useContactFilterStore: (selector: any) =>
        selector({
            selectedFilters: {
                applied: {
                    filterApplied: appliedCount,
                    filteredAppliedKeys: activeKeys,
                },
            },
            clear: clearFilters,
            getFilters,
        }),
}));

describe("ViewContacts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        appliedCount = 0;
        activeKeys = [];
        mockPathname = "/contacts";
        mockUseParams.mockReturnValue({});
    });

    it("renders FailSafePage when no contacts", () => {
        render(<ViewContacts data={[]} totalRecords={0} />);
        expect(screen.getByTestId("failsafe")).toHaveTextContent("noContact");
    });

    it("renders contacts list when data exists", () => {
        render(
            <ViewContacts
                data={[{ contactId: "c1" } as any]}
                totalRecords={1}
            />,
        );

        expect(screen.getByTestId("contact-card")).toHaveTextContent("c1");
    });

    it("renders loader during single contact fetch", async () => {
        mockUseParams.mockReturnValue({ id: "c1" });
        mockApiGet.mockResolvedValueOnce({ data: { contactId: "c1" } });

        render(<ViewContacts />);

        expect(screen.getByTestId("loader")).toBeInTheDocument();

        await waitFor(() =>
            expect(mockApiGet).toHaveBeenCalledWith("/contact/c1"),
        );
    });

    it("opens filter modal and applies filters", async () => {
        appliedCount = 1;
        activeKeys = ["Org"];

        mockApiPost.mockResolvedValueOnce({
            data: { contacts: [{ contactId: "c2" }], page: { totalResults: 1 } },
        });

        render(
            <ViewContacts
                data={[{ contactId: "c1" } as any]}
                totalRecords={1}
                onPageChange={vi.fn()}
                searchTerm="term"
                searchType="type"
            />,
        );

        await waitFor(() =>
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument(),
        );

        fireEvent.click(screen.getByRole("button", { name: /filter/i }));
        expect(screen.getByTestId("right-modal")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Apply Filters"));

        await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
    });

    it("shows pagination and triggers page change", () => {
        const onPageChange = vi.fn();

        render(
            <ViewContacts
                data={[{ contactId: "c1" } as any]}
                totalRecords={10}
                pageSize={5}
                page={0}
                onPageChange={onPageChange}
            />,
        );

        fireEvent.click(screen.getByLabelText("Next Page"));
        expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("handles API error when filtering", async () => {
        appliedCount = 1;
        mockApiPost.mockRejectedValueOnce(new Error("fail"));

        render(<ViewContacts />);

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Failed",
                    message: "Something went wrong",
                }),
            ),
        );
    });

    it("clears filters when contextKey changes (searchTerm/searchType change)", async () => {
        mockUseParams.mockReturnValue({});
        mockPathname = "/contacts";
        appliedCount = 0;

        const { rerender } = render(
            <ViewContacts
                data={[{ contactId: "c1" } as any]}
                totalRecords={1}
                searchTerm="alpha"
                searchType="name"
            />,
        );

        expect(clearFilters).not.toHaveBeenCalled();

        rerender(
            <ViewContacts
                data={[{ contactId: "c1" } as any]}
                totalRecords={1}
                searchTerm="beta"
                searchType="name"
            />,
        );

        await waitFor(() => expect(clearFilters).toHaveBeenCalledTimes(1));
    });

    it("clears filters on unmount when clearOnUnmount is true", () => {
        mockUseParams.mockReturnValue({});
        mockPathname = "/contacts";
        appliedCount = 0;

        const { unmount } = render(
            <ViewContacts
                data={[{ contactId: "c1" } as any]}
                totalRecords={1}
                clearOnUnmount={true}
                searchTerm="alpha"
                searchType="name"
            />,
        );

        expect(clearFilters).not.toHaveBeenCalled();

        unmount();

        expect(clearFilters).toHaveBeenCalledTimes(1);
    });

    it("renders the Add contact button and opens AddContactModal when clicked", async () => {
        mockUseParams.mockReturnValue({});
        mockPathname = "/contacts";

        render(
            <ViewContacts
                data={[{ contactId: "c1" } as any]}
                totalRecords={1}
            />,
        );

        const addBtn = screen.getByRole("button", { name: /Add contact/i });
        fireEvent.click(addBtn);
        expect(screen.getByTestId("add-contact-modal")).toBeInTheDocument();

        fireEvent.click(screen.getByText("add-contact-close"));
        expect(screen.queryByTestId("add-contact-modal")).toBeNull();
    });

    it("does NOT render Add contact button when in single-view mode", () => {
        mockUseParams.mockReturnValue({ id: "c1" });
        mockPathname = "/contacts";
        mockApiGet.mockResolvedValue({ contactId: "c1" });

        render(<ViewContacts />);

        expect(
            screen.queryByRole("button", { name: /Add contact/i }),
        ).toBeNull();
    });

    it("shows toast on single-contact fetch error and stops loading (catch + finally)", async () => {
        mockUseParams.mockReturnValue({ id: "c1" });
        mockPathname = "/contacts";
        appliedCount = 0;

        mockApiGet.mockRejectedValueOnce(new Error("fail"));

        render(<ViewContacts />);

        expect(screen.getByTestId("loader")).toBeInTheDocument();

        await waitFor(() =>
            expect(mockApiGet).toHaveBeenCalledWith("/contact/c1"),
        );

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Failed",
                    message: "Something went wrong",
                }),
            ),
        );

        await waitFor(() =>
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument(),
        );
    });
});
