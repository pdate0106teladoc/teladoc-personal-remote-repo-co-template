import React from "react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import MultiSelectSearch from "./MultiSelectSearch";

// ----------------- Mocks: icons/assets -----------------
vi.mock("@/assets", () => ({
  CheckmarkIcon: () => <span data-testid="checkmark-icon" />,
}));

// ----------------- Mocks: api service -----------------
const mockApiGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    get: (...args: any[]) => mockApiGet(...args),
  },
}));

// ----------------- Mocks: constants -----------------
vi.mock("@/constants", () => ({
  API_ENDPOINTS: {
    searchBaseUrl: "https://example.com",
    contactFilterSearch: "/contact/filter-search",
  },
  ToastType: { Error: "Error" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong" },
}));

// ----------------- Mocks: toast -----------------
const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  SearchIcon: () => <span data-testid="search-icon" />,
  showCustomToast: (...args: any[]) => mockShowCustomToast(...args),
}));

// ----------------- Mocks: react-router-dom -----------------
let mockPathname = "/anything";
let mockSearch = "";
let mockParams: { id?: string } = { id: "123" };

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: mockPathname, search: mockSearch }),
  useParams: () => mockParams,
}));

// ----------------- Mock react-bootstrap Dropdown -----------------
// Keeps DOM simple + lets us test `show` and `onToggle` without Bootstrap internals.
vi.mock("react-bootstrap", async () => {

  function Dropdown({ children, show, onToggle }: any) {
    return (
      <div data-testid="dropdown" data-show={show ? "true" : "false"}>
        {/* test hook to trigger onToggle */}
        <button
          data-testid="toggle-show"
          onClick={() => onToggle?.(!show)}
          type="button"
        >
          toggle-show
        </button>
        {children}
      </div>
    );
  }

  Dropdown.Toggle = function Toggle({ children, onClick }: any) {
    return (
      <div data-testid="dropdown-toggle" onClick={onClick}>
        {children}
      </div>
    );
  };

  Dropdown.Menu = function Menu({ children }: any) {
    return <div data-testid="dropdown-menu">{children}</div>;
  };

  return { Dropdown };
});

// ----------------- Helpers -----------------
function renderCmp(overrides?: Partial<React.ComponentProps<typeof MultiSelectSearch>>) {
  const props: React.ComponentProps<typeof MultiSelectSearch> = {
    label: "Role",
    placeholder: "Search...",
    isRequired: false,
    onChange: vi.fn(),
    ...overrides,
  };
  render(<MultiSelectSearch {...props} />);
  return props;
}

function getInput() {
  return screen.getByPlaceholderText("Search...") as HTMLInputElement;
}

async function typeWithDebounce(value: string) {
  fireEvent.change(getInput(), { target: { value } });

  // Advance debounce
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
}

function parseUrl(url: string) {
  const u = new URL(url);
  return {
    pathname: u.pathname,
    params: Object.fromEntries(u.searchParams.entries()),
    href: u.href,
  };
}

describe("MultiSelectSearch (Vitest)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("VITE_SEARCH_BASE_URL", "https://example.com");
    mockApiGet.mockReset();
    mockShowCustomToast.mockReset();
    mockPathname = "/anything";
    mockSearch = "";
    mockParams = { id: "123" };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("renders label + required asterisk when isRequired=true", () => {
    renderCmp({ label: "Department", isRequired: true });

    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders SearchIcon and input placeholder", () => {
    renderCmp({ placeholder: "Search..." });

    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(getInput()).toHaveAttribute("placeholder", "Search...");
    expect(getInput()).toHaveAttribute("autocomplete", "off");
  });

  it("dropdown is closed by default", () => {
    renderCmp();
    expect(screen.getByTestId("dropdown")).toHaveAttribute("data-show", "false");
  });

  it("does NOT call API for <2 chars; closes dropdown and clears options", async () => {
    renderCmp();
    mockApiGet.mockResolvedValueOnce({ data: [{ id: "1", name: "Alice" }] });

    fireEvent.change(getInput(), { target: { value: "a" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockApiGet).not.toHaveBeenCalled();
    expect(screen.getByTestId("dropdown")).toHaveAttribute("data-show", "false");
  });

  it("calls API after 300ms debounce for 2+ chars and opens dropdown", async () => {
    renderCmp();
    mockApiGet.mockResolvedValueOnce({ data: [{ id: "1", name: "Alice" }] });

    await typeWithDebounce("al");

    expect(mockApiGet).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("dropdown")).toHaveAttribute("data-show", "true");
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("debounce: rapid typing triggers API only once (latest value)", async () => {
    renderCmp();
    mockApiGet.mockResolvedValue({ data: [] });

    fireEvent.change(getInput(), { target: { value: "al" } });
    fireEvent.change(getInput(), { target: { value: "ali" } });
    fireEvent.change(getInput(), { target: { value: "alic" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockApiGet).toHaveBeenCalledTimes(1);
    const url = mockApiGet.mock.calls[0][0] as string;
    expect(parseUrl(url).params.searchTerm).toBe("alic");
  });

  it("default route branch: uses globalSearchType=name and globalSearchTerm from location.search", async () => {
    mockPathname = "/contacts";
    mockSearch = "?searchTerm=John";
    renderCmp({ label: "Role" });

    mockApiGet.mockResolvedValueOnce({ data: [] });

    await typeWithDebounce("al");

    const url = mockApiGet.mock.calls[0][0] as string;
    const { params } = parseUrl(url);

    expect(params.globalSearchType).toBe("name");
    expect(params.globalSearchTerm).toBe("John");
    expect(params.searchType).toBe("role"); // label.toLowerCase()
    expect(params.searchTerm).toBe("al");
  });

  it("org-detail route branch: globalSearchType=organization and globalSearchTerm=id", async () => {
    mockPathname = "/org-detail/123";
    mockParams = { id: "999" };
    renderCmp({ label: "Role" });

    mockApiGet.mockResolvedValueOnce({ data: [] });

    await typeWithDebounce("al");

    const url = mockApiGet.mock.calls[0][0] as string;
    const { params } = parseUrl(url);

    expect(params.globalSearchType).toBe("organization");
    expect(params.globalSearchTerm).toBe("999");
  });

  it("groups route branch: globalSearchType=group and globalSearchTerm=id", async () => {
    mockPathname = "/groups/abc";
    mockParams = { id: "777" };
    renderCmp({ label: "Role" });

    mockApiGet.mockResolvedValueOnce({ data: [] });

    await typeWithDebounce("al");

    const url = mockApiGet.mock.calls[0][0] as string;
    const { params } = parseUrl(url);

    expect(params.globalSearchType).toBe("group");
    expect(params.globalSearchTerm).toBe("777");
  });

  it('shows "No results found" when API returns empty list', async () => {
    renderCmp();
    mockApiGet.mockResolvedValueOnce({ data: [] });

    await typeWithDebounce("al");

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("maps API data into options and renders each option", async () => {
    renderCmp();
    mockApiGet.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ],
    });

    await typeWithDebounce("al");

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("selecting an option adds pill + checkmark and calls onChange with selected", async () => {
    const props = renderCmp();
    mockApiGet.mockResolvedValueOnce({
      data: [{ id: "1", name: "Alice" }],
    });

    await typeWithDebounce("al");

    // Click option in dropdown (not the pill)
    const dropdownMenu = screen.getByTestId("dropdown-menu");
    const option = within(dropdownMenu).getByText("Alice");
    fireEvent.click(option);

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith({ "1": "Alice" });

    // Pill shows selected label text
    expect(screen.getAllByText("Alice")).toHaveLength(2); // pill + dropdown option

    // Checkmark appears
    expect(screen.getByTestId("checkmark-icon")).toBeInTheDocument();
  });

  it("clicking the same option again removes selection and calls onChange with empty object", async () => {
    const props = renderCmp();
    mockApiGet.mockResolvedValueOnce({
      data: [{ id: "1", name: "Alice" }],
    });

    await typeWithDebounce("al");

    // First click to select - use dropdown option
    const dropdownMenu = screen.getByTestId("dropdown-menu");
    const option = within(dropdownMenu).getByText("Alice");
    fireEvent.click(option); // select
    
    // Second click to deselect - can use any Alice
    fireEvent.click(option); // deselect

    // Called twice: once add, once remove
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenLastCalledWith({});
  });

  it("preSelected renders pills initially", () => {
    renderCmp({
      preSelected: { "10": "Pre A", "20": "Pre B" },
    });

    expect(screen.getByText("Pre A")).toBeInTheDocument();
    expect(screen.getByText("Pre B")).toBeInTheDocument();
  });

  it("API error triggers toast", async () => {
    renderCmp();
    mockApiGet.mockRejectedValueOnce(new Error("boom"));

    await typeWithDebounce("al");

    expect(mockShowCustomToast).toHaveBeenCalledTimes(1);
    const arg = mockShowCustomToast.mock.calls[0][0];

    expect(arg).toMatchObject({
      type: "Error",
      title: "Failed",
      message: "Something went wrong",
    });
  });

  it("deleting input back to <2 closes dropdown", async () => {
    renderCmp();
    mockApiGet.mockResolvedValueOnce({ data: [{ id: "1", name: "Alice" }] });

    await typeWithDebounce("al");
    expect(screen.getByTestId("dropdown")).toHaveAttribute("data-show", "true");

    fireEvent.change(getInput(), { target: { value: "a" } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("dropdown")).toHaveAttribute("data-show", "false");
  });
});
