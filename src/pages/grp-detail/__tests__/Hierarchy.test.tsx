import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GroupHierarchyPage from "@/pages/grp-detail/pages/Hierarchy";
import api from "@/api/apiService";
import useOrgStore from "@/store/useOrgStore";
import { useParams } from "react-router-dom";
import { vi } from "vitest";

// Mock dependencies
vi.mock("@/api/apiService");
vi.mock("@/store/useOrgStore");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useParams: vi.fn(),
  };
});

describe("<GroupHierarchyPage />", () => {
  const mockGetHierarchyCache = vi.fn();
  const mockSetHierarchyCache = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ id: "test-id" });
    (useOrgStore as any).mockReturnValue({
      getHierarchyCache: mockGetHierarchyCache,
      setHierarchyCache: mockSetHierarchyCache,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <GroupHierarchyPage />
      </MemoryRouter>
    );

  it("renders without crashing", () => {
    mockGetHierarchyCache.mockReturnValue(null);
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows loader when data is loading", () => {
    mockGetHierarchyCache.mockReturnValue(null);
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error message when no data is available", async () => {
    mockGetHierarchyCache.mockReturnValue(null);
    (api.get as any).mockResolvedValue({ data: [] });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  it("calls getHierarchyCache on mount", () => {
    mockGetHierarchyCache.mockReturnValue(null);
    renderComponent();
    expect(mockGetHierarchyCache).toHaveBeenCalledWith("test-id");
  });

  it("calls setHierarchyCache on successful API response", async () => {
    const dummyResponse = { data: [{ id: "1", name: "Test Org" }] };
    mockGetHierarchyCache.mockReturnValue(null);
    (api.get as any).mockResolvedValue(dummyResponse);

    renderComponent();
    await waitFor(() => {
      expect(mockSetHierarchyCache).toHaveBeenCalledWith("test-id", dummyResponse.data[0]);
    });
  });

  it("does not fetch data if already cached", () => {
    const dummyData = { id: "1", name: "Test Org" };
    mockGetHierarchyCache.mockReturnValue(dummyData);

    renderComponent();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("shows error state when API call fails", async () => {
    mockGetHierarchyCache.mockReturnValue(null);
    (api.get as any).mockRejectedValue(new Error("API Error"));

    renderComponent();

    await waitFor(() => {
      // When API fails, it should show the FailSafePage with dataFailed type
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });
});