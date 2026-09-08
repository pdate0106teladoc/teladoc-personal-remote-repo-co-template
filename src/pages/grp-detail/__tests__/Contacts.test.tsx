import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Contacts from "../pages/Contacts";

const apiGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    get: (...args: any[]) => apiGet(...args),
  },
}));

const toastSpy = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  showCustomToast: (args: any) => toastSpy(args),
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
}));

vi.mock("@/pages/contacts/ViewContacts", () => ({
  default: ({
    totalRecords,
    page,
    data,
    onPageChange,
    onClearFilter,
  }: any) => (
    <div data-testid="view-contacts">
      <div data-testid="total">{totalRecords}</div>
      <div data-testid="page">{page}</div>
      <div data-testid="data">{JSON.stringify(data)}</div>

      <button onClick={() => onPageChange(2)}>change-page</button>
      <button onClick={onClearFilter}>clear-filter</button>
    </div>
  ),
}));

const getAppliedSpy = vi.fn();
vi.mock("@/store/useContactFilterStore", () => ({
  useContactFilterStore: (selector: any) =>
    selector({
      getApplied: getAppliedSpy,
    }),
}));

function renderWithRouter(
  ui: React.ReactElement,
  {
    route = "/orgs/123",
    path = "/orgs/:id",
    search = "",
  }: { route?: string; path?: string; search?: string } = {},
) {
  return render(
    <MemoryRouter initialEntries={[`${route}${search}`]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Contacts", () => {
  beforeEach(() => {
    apiGet.mockReset();
    toastSpy.mockReset();
    getAppliedSpy.mockReturnValue({ filterApplied: 0 });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does nothing when id is missing", async () => {
    apiGet.mockResolvedValueOnce({ data: { contacts: [], page: { totalResults: 0 } } });
    renderWithRouter(<Contacts />, { route: "/", path: "/" });

    await waitFor(() => {
      expect(screen.getByTestId("view-contacts")).toBeInTheDocument();
    });
  });

  it("fetches contacts successfully (organization context) and renders ViewContacts", async () => {
    apiGet.mockResolvedValue({
      data: {
        contacts: [{ id: "c1", name: "Alice" }],
        page: { totalResults: 10 },
      },
    });

    renderWithRouter(<Contacts />, {
      route: "/organizations/123",
      path: "/organizations/:id",
    });
    await waitFor(() => {
      expect(screen.getByTestId("view-contacts")).toBeInTheDocument();
    });

    expect(apiGet).toHaveBeenCalledWith(
      expect.stringContaining("searchTerm=123"),
      {},
      expect.any(Object)
    );

    expect(apiGet.mock.calls[0][0]).toContain("searchType=organization");
    expect(apiGet.mock.calls[0][0]).toContain("page=0");

    expect(screen.getByTestId("total").textContent).toBe("10");
    expect(screen.getByTestId("data").textContent).toContain("Alice");
  });

  it("uses the page from the URL on initial load (no stale page=0 fetch)", async () => {
    apiGet.mockResolvedValue({
      data: { contacts: [], page: { totalResults: 50 } },
    });

    renderWithRouter(<Contacts />, {
      route: "/organizations/123",
      path: "/organizations/:id",
      search: "?page=3",
    });

    await waitFor(() => expect(apiGet).toHaveBeenCalled());

    // The very first fetch must already use page=3, not a stale page=0
    expect(apiGet.mock.calls[0][0]).toContain("page=3");
  });

  it("uses propId instead of params id and detects group context", async () => {
    apiGet.mockResolvedValue({
      data: { contacts: [], page: { totalResults: 0 } },
    });

    renderWithRouter(<Contacts id="grp-1" />, {
      route: "/groups/xyz",
      path: "/groups/:id",
    });

    await waitFor(() => expect(apiGet).toHaveBeenCalled());

    const lastCallUrl = apiGet.mock.calls[0][0];
    expect(lastCallUrl).toContain("searchType=group");
    expect(lastCallUrl).toContain("searchTerm=grp-1");
  });

  it("skips fetch when filtering is active", async () => {
    getAppliedSpy.mockReturnValue({ filterApplied: 2 });

    renderWithRouter(<Contacts />, {
      route: "/organizations/123",
      path: "/organizations/:id",
    });

    expect(apiGet).not.toHaveBeenCalled();
  });

  it("shows toast and clears contacts on API error", async () => {
    apiGet.mockRejectedValueOnce(new Error("boom"));

    renderWithRouter(<Contacts />, {
      route: "/organizations/123",
      path: "/organizations/:id",
    });

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });

    expect(toastSpy.mock.calls[0][0]).toMatchObject({
      title: "Failed",
    });

    expect(screen.getByTestId("data").textContent).toBe("[]");
  });

  it("handlePageChange updates page and search params", async () => {
    apiGet.mockResolvedValue({
      data: { contacts: [], page: { totalResults: 0 } },
    });

    renderWithRouter(<Contacts />, {
      route: "/organizations/123",
      path: "/organizations/:id",
      search: "?page=0",
    });

    await screen.findByTestId("view-contacts");

    fireEvent.click(screen.getByText("change-page"));

    await waitFor(() => {
      expect(apiGet).toHaveBeenLastCalledWith(
        expect.stringContaining("page=2"),
        {},
        expect.any(Object)
      );
    });
  });

  it("onClearFilter resets page to 0 and refetches", async () => {
    apiGet.mockResolvedValue({
      data: { contacts: [], page: { totalResults: 5 } },
    });

    renderWithRouter(<Contacts />, {
      route: "/organizations/123",
      path: "/organizations/:id",
      search: "?page=3",
    });

    await screen.findByTestId("view-contacts");

    fireEvent.click(screen.getByText("clear-filter"));

    await waitFor(() => {
      expect(apiGet).toHaveBeenLastCalledWith(
        expect.stringContaining("page=0"),
        {},
        expect.any(Object)
      );
    });
  });

  it("initializes totalResults from entityCounts", async () => {
    apiGet.mockResolvedValue({
      data: { contacts: [], page: { totalResults: 99 } },
    });

    renderWithRouter(<Contacts entityCounts={{ contacts: 99 }} />, {
      route: "/organizations/123",
      path: "/organizations/:id",
    });

    await waitFor(() => {
      expect(screen.getByTestId("total").textContent).toBe("99");
    });
  });
});