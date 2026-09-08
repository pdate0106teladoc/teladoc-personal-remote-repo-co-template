import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import ContactEntityTable from "./ContactEntityTable";

const mockApiGet = vi.fn();
vi.mock("@/api/apiService", () => ({
    __esModule: true,
    default: { get: (...args: any[]) => mockApiGet(...args) },
}));

const mockToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
    __esModule: true,
    Loader: () => <div data-testid="loader">Loading…</div>,
    showCustomToast: (...args: any[]) => mockToast(...args),
    ToastType: { Error: "error" },
    ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong." },
    CustomTable: ({
        data,
        columns,
        onPageChange,
        onChangeSortParams,
        onServerFilterChange,
        totalRecords,
        controlledServerFilters,
        page,
    }: any) => (
        <div data-testid="custom-table">
            <div data-testid="row-count">{data?.length ?? 0}</div>
            <div data-testid="total-records">{totalRecords ?? 0}</div>
            <div data-testid="current-page">{page ?? 0}</div>
            <div data-testid="active-filters">
                {JSON.stringify(controlledServerFilters ?? {})}
            </div>
            <ul>
                {data?.map((row: any, i: number) => (
                    <li key={i} data-testid={`row-${i}`}>
                        {columns?.map((col: any) => (
                            <span key={col.field} data-testid={`cell-${col.field}-${i}`}>
                                {col.render
                                    ? col.render(row?.[col.field], row)
                                    : String(row?.[col.field] ?? "")}
                            </span>
                        ))}
                    </li>
                ))}
            </ul>
            <button onClick={() => onPageChange?.(2)}>change-page</button>
            <button onClick={() => onChangeSortParams?.("groupName", true)}>sort-asc</button>
            <button onClick={() => onChangeSortParams?.("organizationName", false)}>
                sort-desc
            </button>
            <button onClick={() => onChangeSortParams?.(null, true)}>sort-clear</button>
            <button
                onClick={() =>
                    onServerFilterChange?.({
                        organizationName: ["Acme"],
                        groupName: "GroupA",
                        contactTypes: ["Marketing", "Reporting"],
                    })
                }
            >
                apply-filters
            </button>
        </div>
    ),
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

describe("ContactEntityTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders empty table (no API call) when contactId is missing", async () => {
        render(<ContactEntityTable type="organization" />);
        // No fetch is triggered when contactId is missing
        expect(mockApiGet).not.toHaveBeenCalled();
        // Table is rendered immediately (loading false)
        expect(screen.getByTestId("custom-table")).toBeInTheDocument();
        expect(screen.getByTestId("row-count").textContent).toBe("0");
        expect(screen.getByTestId("total-records").textContent).toBe("0");
    });

    it("fetches and renders organization rows", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                organizations: [
                    {
                        organizationUuid: "u1",
                        organizationName: "Org A",
                        contactTypes: ["Primary daily"],
                    },
                ],
                page: { totalResults: 7 },
            },
        });

        render(<ContactEntityTable type="organization" contactId="c1" />);

        await waitFor(() =>
            expect(screen.getByTestId("custom-table")).toBeInTheDocument(),
        );

        expect(mockApiGet).toHaveBeenCalledWith(
            expect.stringContaining("client-configurations/contacts/c1/organization"),
            expect.objectContaining({
                organizationName: "",
                groupName: "",
                contactTypes: "",
                page: 0,
                limit: 25,
                sortBy: "",
                sortOrder: "",
            }),
        );
        expect(screen.getByTestId("total-records").textContent).toBe("7");
        expect(screen.getByText("Org A")).toBeInTheDocument();
        expect(screen.getByText("Primary daily")).toBeInTheDocument();
        const link = screen.getByRole("link", { name: "Org A" });
        expect(link).toHaveAttribute("href", "/org/u1");
    });

    it("renders '-' when contactTypes is empty in an organization row", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                organizations: [
                    { organizationUuid: "u1", organizationName: "Org A", contactTypes: [] },
                ],
                page: { totalResults: 1 },
            },
        });

        render(<ContactEntityTable type="organization" contactId="c1" />);

        await screen.findByText("Org A");
        expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("fetches and renders group rows including parent organization", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                groups: [
                    {
                        groupUuid: "g1",
                        groupName: "Group X",
                        parentOrganization: "Org Parent",
                        contactTypes: ["Marketing", "Reporting"],
                    },
                    {
                        groupUuid: "g2",
                        groupName: "Group Y",
                        parentOrganization: "",
                        contactTypes: [],
                    },
                ],
                page: { totalResults: 2 },
            },
        });

        render(<ContactEntityTable type="group" contactId="c1" />);

        await screen.findByText("Group X");

        expect(mockApiGet).toHaveBeenCalledWith(
            expect.stringContaining("client-configurations/contacts/c1/group"),
            expect.any(Object),
        );

        const groupLink = screen.getByRole("link", { name: "Group X" });
        expect(groupLink).toHaveAttribute("href", "/grp/g1");
        expect(screen.getByText("Parent org: Org Parent")).toBeInTheDocument();
        expect(screen.getByText("Marketing, Reporting")).toBeInTheDocument();
        expect(screen.queryByText("Parent org:")).not.toBeInTheDocument();
    });

    it("falls back to payload root when response has no `data` wrapper", async () => {
        mockApiGet.mockResolvedValueOnce({
            organizations: [
                {
                    organizationUuid: "u1",
                    organizationName: "Org A",
                    contactTypes: [],
                },
            ],
            page: { totalResults: 1 },
        });

        render(<ContactEntityTable type="organization" contactId="c1" />);

        await screen.findByText("Org A");
        expect(screen.getByTestId("total-records").textContent).toBe("1");
    });

    it("defaults to empty data when payload key is missing", async () => {
        mockApiGet.mockResolvedValueOnce({});

        render(<ContactEntityTable type="organization" contactId="c1" />);

        await waitFor(() =>
            expect(screen.getByTestId("row-count").textContent).toBe("0"),
        );
        expect(screen.getByTestId("total-records").textContent).toBe("0");
    });

    it("shows toast on fetch error", async () => {
        mockApiGet.mockRejectedValueOnce(new Error("boom"));

        render(<ContactEntityTable type="organization" contactId="c1" />);

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "error",
                    title: "Failed",
                    message: "Something went wrong.",
                }),
            ),
        );
    });

    it("re-fetches on page change", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: { organizations: [], page: { totalResults: 0 } },
        });
        render(<ContactEntityTable type="organization" contactId="c1" />);
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));

        mockApiGet.mockResolvedValueOnce({
            data: { organizations: [], page: { totalResults: 0 } },
        });
        fireEvent.click(screen.getByText("change-page"));

        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
        expect(mockApiGet.mock.calls[1][1]).toMatchObject({ page: 2 });
    });

    it("re-fetches with sort params when sort changes (asc, desc, clear)", async () => {
        mockApiGet.mockResolvedValue({
            data: { groups: [], page: { totalResults: 0 } },
        });

        render(<ContactEntityTable type="group" contactId="c1" />);
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByText("sort-asc"));
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
        expect(mockApiGet.mock.calls[1][1]).toMatchObject({
            sortBy: "groupName",
            sortOrder: "asc",
            page: 0,
        });

        fireEvent.click(screen.getByText("sort-desc"));
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(3));
        expect(mockApiGet.mock.calls[2][1]).toMatchObject({
            sortBy: "organizationName",
            sortOrder: "desc",
            page: 0,
        });

        fireEvent.click(screen.getByText("sort-clear"));
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(4));
        expect(mockApiGet.mock.calls[3][1]).toMatchObject({
            sortBy: "",
            sortOrder: "",
        });
    });

    it("re-fetches with server-side filters and reflects them in controlled props", async () => {
        mockApiGet.mockResolvedValue({
            data: { organizations: [], page: { totalResults: 0 } },
        });

        render(<ContactEntityTable type="organization" contactId="c1" />);
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByText("apply-filters"));

        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
        expect(mockApiGet.mock.calls[1][1]).toMatchObject({
            organizationName: "Acme",
            groupName: "GroupA",
            contactTypes: "Marketing, Reporting",
            page: 0,
        });

        await waitFor(() => {
            const fired = JSON.parse(
                screen.getByTestId("active-filters").textContent || "{}",
            );
            expect(fired.contactTypes).toEqual(["Marketing", "Reporting"]);
        });
    });

    it("resets state and refetches when contactId changes", async () => {
        mockApiGet.mockResolvedValue({
            data: { organizations: [], page: { totalResults: 0 } },
        });

        const { rerender } = render(
            <ContactEntityTable type="organization" contactId="c1" />,
        );
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));

        rerender(<ContactEntityTable type="organization" contactId="c2" />);
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
        expect(mockApiGet.mock.calls[1][0]).toContain("/c2/organization");
    });

    it("clears local state when contactId becomes undefined", async () => {
        mockApiGet.mockResolvedValueOnce({
            data: {
                organizations: [
                    { organizationUuid: "u1", organizationName: "Org A", contactTypes: [] },
                ],
                page: { totalResults: 3 },
            },
        });

        const { rerender } = render(
            <ContactEntityTable type="organization" contactId="c1" />,
        );
        await screen.findByText("Org A");

        rerender(<ContactEntityTable type="organization" />);

        await waitFor(() =>
            expect(screen.getByTestId("row-count").textContent).toBe("0"),
        );
        expect(screen.getByTestId("total-records").textContent).toBe("0");
        expect(mockApiGet).toHaveBeenCalledTimes(1);
    });
});
