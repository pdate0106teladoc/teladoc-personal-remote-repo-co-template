import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ProductBundleDetail from "../pages/ProductBundleDetail";
import * as apiService from "@/api/apiService";
import * as toast from "@ucc/common-ui";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import { ProductBundleResponse, BundleOpportunity, ProductItem } from "@/types/GrpView";
import { OpportunityDetail } from "@/types/search";

// Redundant local mocks removed - consolidated in @ucc/common-ui mock

vi.mock("@/components/RoundedLabel/RoundedLabel", () => ({
  default: ({ text, variant, className }: { text: string; variant: string; className?: string }) => (
    <span data-testid="rounded-label" className={className} data-variant={variant}>
      {text}
    </span>
  ),
}));

const { mockShowCustomToast } = vi.hoisted(() => ({
  mockShowCustomToast: vi.fn(),
}));

vi.mock("@ucc/common-ui", () => ({
  showCustomToast: mockShowCustomToast,
  CustomCheckbox: ({ checked, viewOnly, size }: any) => (
    <input
      type="checkbox"
      checked={checked}
      readOnly={viewOnly}
      data-testid={`checkbox-${size || "default"}`}
      onChange={() => { }}
    />
  ),
  CustomTable: ({ columns, data }: any) => (
    <div data-testid="custom-table">
      <div data-testid="table-data-length">{data?.length ?? 0}</div>
      {data?.map((row: any, idx: number) => (
        <div key={idx} data-testid={`table-row-${idx}`}>
          {columns.map((col: any, colIdx: number) => (
            <div key={colIdx} data-testid={`col-${col.field}`}>
              {col.render ? col.render(row[col.field], row) : row[col.field]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  SideModal: ({ children, show, title, onHide }: any) => (
    show ? (
      <div data-testid="right-modal">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onHide} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null
  ),
}));

vi.mock("@/components/sidebar/OpportunityDrawer", () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="opportunity-drawer">
      <div>{data?.name}</div>
    </div>
  ),
}));

vi.mock("@/utils", () => ({
  getSafeString: (value: any) => value ?? "",
  capitalizeFirstLetter: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

// Redundant local mock removed - already consolidated

vi.mock("@/api/apiService", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockApiGet = vi.mocked(apiService.default.get);
const mockShowToast = vi.mocked(toast.showCustomToast);

const createMockOpportunity = (overrides?: Partial<BundleOpportunity>): BundleOpportunity => ({
  opportunityId: "opp-guid-1",
  name: "Test Opportunity",
  guid: "guid-1",
  effectiveStartDate: "2024-01-01",
  effectiveEndDate: "2024-12-31",
  id: "opp-1",
  contractNumber: "CN-001",
  ...overrides,
});

const createMockProduct = (overrides?: Partial<ProductItem>): ProductItem => ({
  name: "test product",
  type: "product",
  selected: true,
  products: [],
  ...overrides,
});

const createMockBundleData = (overrides?: Partial<ProductBundleResponse>): ProductBundleResponse => ({
  bundleName: "Test Bundle",
  details: {
    opportunities: [createMockOpportunity()],
  },
  features: [
    { name: "Feature 1", enabled: true },
    { name: "Feature 2", enabled: false },
  ],
  products: [
    createMockProduct({ name: "product 1" }),
    createMockProduct({ name: "product 2", selected: false }),
  ],
  ...overrides,
});

describe("ProductBundleDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all tabs", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByText("Opportunity")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("renders opportunity table with data", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    expect(screen.getByTestId("table-data-length")).toHaveTextContent("1");
  });

  it("renders multiple opportunities in table", () => {
    const data = createMockBundleData({
      details: {
        opportunities: [
          createMockOpportunity({ id: "opp-1", name: "Opp 1" }),
          createMockOpportunity({ id: "opp-2", name: "Opp 2" }),
          createMockOpportunity({ id: "opp-3", name: "Opp 3" }),
        ],
      },
    });
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByTestId("table-data-length")).toHaveTextContent("3");
  });

  it("handles empty opportunities array", () => {
    const data = createMockBundleData({
      details: {
        opportunities: [],
      },
    });
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByTestId("table-data-length")).toHaveTextContent("0");
  });

  it("handles undefined details", () => {
    const data = { ...createMockBundleData(), details: undefined } as any;
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByTestId("table-data-length")).toHaveTextContent("0");
  });

  it("handles non-array opportunities", () => {
    const data = {
      ...createMockBundleData(),
      details: { opportunities: null } as any,
    };
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByTestId("table-data-length")).toHaveTextContent("0");
  });

  it("renders features tab when features exist", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Features"));

    expect(screen.getByText("Feature 1")).toBeInTheDocument();
    expect(screen.getByText("Feature 2")).toBeInTheDocument();
  });

  it("does not render features tab when features array is empty", () => {
    const data = createMockBundleData({ features: [] });
    render(<ProductBundleDetail data={data} />);

    expect(screen.queryByText("Features")).not.toBeInTheDocument();
  });

  it("renders enabled features with checkbox checked", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Features"));

    const checkboxes = screen.getAllByTestId("checkbox-lg");
    expect(checkboxes[0]).toBeChecked();
  });

  it("renders disabled features with checkbox unchecked", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Features"));

    const checkboxes = screen.getAllByTestId("checkbox-lg");
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("renders products tab", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  it("renders products with correct selection state", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    const checkboxes = screen.getAllByTestId("checkbox-default");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("capitalizes product names", () => {
    const data = createMockBundleData({
      products: [createMockProduct({ name: "lowercase product" })],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Lowercase product")).toBeInTheDocument();
  });

  it("renders product type labels", () => {
    const data = createMockBundleData({
      products: [
        createMockProduct({ name: "product a", type: "product" }),
        createMockProduct({ name: "bundle a", type: "bundle" }),
      ],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Bundle")).toBeInTheDocument();
  });

  it("applies correct CSS class for bundle type", () => {
    const data = createMockBundleData({
      products: [createMockProduct({ type: "bundle" })],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    const label = screen.getByTestId("rounded-label");
    expect(label).toHaveClass("bundle-tag");
  });

  it("applies correct CSS class for product type", () => {
    const data = createMockBundleData({
      products: [createMockProduct({ type: "product" })],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    const label = screen.getByTestId("rounded-label");
    expect(label).toHaveClass("product-tag");
  });

  it("renders nested products recursively", () => {
    const data = createMockBundleData({
      products: [
        createMockProduct({
          name: "parent product",
          products: [
            createMockProduct({ name: "child product 1" }),
            createMockProduct({ name: "child product 2" }),
          ],
        }),
      ],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Parent product")).toBeInTheDocument();
    expect(screen.getByText("Child product 1")).toBeInTheDocument();
    expect(screen.getByText("Child product 2")).toBeInTheDocument();
  });

  it("renders deeply nested products", () => {
    const data = createMockBundleData({
      products: [
        createMockProduct({
          name: "level 1",
          products: [
            createMockProduct({
              name: "level 2",
              products: [
                createMockProduct({ name: "level 3" }),
              ],
            }),
          ],
        }),
      ],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Level 1")).toBeInTheDocument();
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getByText("Level 3")).toBeInTheDocument();
  });

  it("handles empty nested products array", () => {
    const data = createMockBundleData({
      products: [
        createMockProduct({
          name: "product with empty children",
          products: [],
        }),
      ],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Product with empty children")).toBeInTheDocument();
  });

  it("handles undefined nested products", () => {
    const data = createMockBundleData({
      products: [
        { name: "product with undefined", type: "product", selected: true, products: undefined } as any,
      ],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Product with undefined")).toBeInTheDocument();
  });

  it("handles opportunity click and opens modal", async () => {
    const data = createMockBundleData();
    const mockOpportunityDetail: OpportunityDetail = {
      name: "Test Opportunity",
      id: "opp-1",
      opportunityGuid: "guid-1",
      accountGuid: "acc-1",
      accountName: "Account 1",
      businessRegion: "US",
      closeDate: "2024-12-31",
      earlyImplementation: "No",
      gcrmContractAccount: "CN-001",
      gcrmContractPath: "/path",
      lineOfBusiness: "Health",
      livesCount: "1000",
      opportunityUrl: "http://example.com",
      populationType: "General",
      productDto: "{}",
      requestCimFlag: "N",
      revenueEffectiveDate: "2024-01-01",
      stage: "Active",
      subType: "New",
      subTypeDetail: "Details",
      type: "Standard",
    };

    mockApiGet.mockResolvedValueOnce({ data: mockOpportunityDetail } as any);

    render(<ProductBundleDetail data={data} />);

    const links = screen.getAllByText("Test Opportunity");
    fireEvent.click(links[0]);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(`${API_ENDPOINTS.opportunity}/opp-1`);
      expect(screen.getByTestId("right-modal")).toBeInTheDocument();
    });
  });

  it("shows error toast when opportunity fetch fails", async () => {
    const data = createMockBundleData();

    mockApiGet.mockRejectedValueOnce(new Error("Network error"));

    render(<ProductBundleDetail data={data} />);

    const links = screen.getAllByText("Test Opportunity");
    fireEvent.click(links[0]);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    });
  });

  it("closes modal when onHide is called", async () => {
    const data = createMockBundleData();
    const mockOpportunityDetail: OpportunityDetail = {
      name: "Test Opportunity",
      id: "opp-1",
      opportunityGuid: "guid-1",
      accountGuid: "acc-1",
      accountName: "Account 1",
      businessRegion: "US",
      closeDate: "2024-12-31",
      earlyImplementation: "No",
      gcrmContractAccount: "CN-001",
      gcrmContractPath: "/path",
      lineOfBusiness: "Health",
      livesCount: "1000",
      opportunityUrl: "http://example.com",
      populationType: "General",
      productDto: "{}",
      requestCimFlag: "N",
      revenueEffectiveDate: "2024-01-01",
      stage: "Active",
      subType: "New",
      subTypeDetail: "Details",
      type: "Standard",
    };

    mockApiGet.mockResolvedValueOnce({ data: mockOpportunityDetail } as any);

    render(<ProductBundleDetail data={data} />);

    const links = screen.getAllByText("Test Opportunity");
    fireEvent.click(links[0]);

    await waitFor(() => {
      expect(screen.getByTestId("right-modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("modal-close"));

    await waitFor(() => {
      expect(screen.queryByTestId("right-modal")).not.toBeInTheDocument();
    });
  });

  it("prevents default on opportunity link click", () => {
    const data = createMockBundleData();
    render(<ProductBundleDetail data={data} />);

    const links = screen.getAllByText("Test Opportunity");
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    links[0].dispatchEvent(clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("renders opportunity GUID", () => {
    const data = createMockBundleData({
      details: {
        opportunities: [createMockOpportunity({ opportunityId: "OPP-GUID-123" })],
      },
    });
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByText("OPP-GUID-123")).toBeInTheDocument();
  });

  it("renders contract number", () => {
    const data = createMockBundleData({
      details: {
        opportunities: [createMockOpportunity({ contractNumber: "CONTRACT-456" })],
      },
    });
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByText("CONTRACT-456")).toBeInTheDocument();
  });

  it("renders effective dates", () => {
    const data = createMockBundleData({
      details: {
        opportunities: [
          createMockOpportunity({
            effectiveStartDate: "2024-06-01",
            effectiveEndDate: "2024-12-31",
          }),
        ],
      },
    });
    render(<ProductBundleDetail data={data} />);

    expect(screen.getByText("2024-06-01")).toBeInTheDocument();
    expect(screen.getByText("2024-12-31")).toBeInTheDocument();
  });

  it("handles empty products array", () => {
    const data = createMockBundleData({ products: [] });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.queryByTestId("checkbox-default")).not.toBeInTheDocument();
  });

  it("handles undefined products array", () => {
    const data = { ...createMockBundleData(), products: undefined } as any;
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.queryByTestId("checkbox-default")).not.toBeInTheDocument();
  });

  it("handles undefined features array", () => {
    const data = { ...createMockBundleData(), features: undefined } as any;
    render(<ProductBundleDetail data={data} />);

    expect(screen.queryByText("Features")).not.toBeInTheDocument();
  });

  it("renders multiple features", () => {
    const data = createMockBundleData({
      features: [
        { name: "Feature A", enabled: true },
        { name: "Feature B", enabled: false },
        { name: "Feature C", enabled: true },
        { name: "Feature D", enabled: false },
      ],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Features"));

    expect(screen.getByText("Feature A")).toBeInTheDocument();
    expect(screen.getByText("Feature B")).toBeInTheDocument();
    expect(screen.getByText("Feature C")).toBeInTheDocument();
    expect(screen.getByText("Feature D")).toBeInTheDocument();
  });

  it("applies text-muted class to unselected products", () => {
    const data = createMockBundleData({
      products: [createMockProduct({ name: "unselected product", selected: false })],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    const productName = screen.getByText("Unselected product");
    expect(productName).toHaveClass("text-muted");
  });

  it("does not apply text-muted class to selected products", () => {
    const data = createMockBundleData({
      products: [createMockProduct({ name: "selected product", selected: true })],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    const productName = screen.getByText("Selected product");
    expect(productName).toHaveClass("product-name");
    expect(productName).not.toHaveClass("text-muted");
  });

  it("applies text-muted class to disabled features", () => {
    const data = createMockBundleData({
      features: [{ name: "Disabled Feature", enabled: false }],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Features"));

    const featureName = screen.getByText("Disabled Feature");
    expect(featureName).toHaveClass("text-muted");
  });

  it("does not apply text-muted class to enabled features", () => {
    const data = createMockBundleData({
      features: [{ name: "Enabled Feature", enabled: true }],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Features"));

    const featureName = screen.getByText("Enabled Feature");
    expect(featureName).not.toHaveClass("text-muted");
  });

  it("renders complex nested product structure", () => {
    const data = createMockBundleData({
      products: [
        createMockProduct({
          name: "bundle 1",
          type: "bundle",
          products: [
            createMockProduct({ name: "product 1a", type: "product" }),
            createMockProduct({
              name: "bundle 1b",
              type: "bundle",
              products: [
                createMockProduct({ name: "product 1b1" }),
              ],
            }),
          ],
        }),
        createMockProduct({ name: "product 2", type: "product" }),
      ],
    });
    render(<ProductBundleDetail data={data} />);

    fireEvent.click(screen.getByText("Products"));

    expect(screen.getByText("Bundle 1")).toBeInTheDocument();
    expect(screen.getByText("Product 1a")).toBeInTheDocument();
    expect(screen.getByText("Bundle 1b")).toBeInTheDocument();
    expect(screen.getByText("Product 1b1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  it("renders opportunity drawer in modal", async () => {
    const data = createMockBundleData();
    const mockOpportunityDetail: OpportunityDetail = {
      name: "Test Opportunity",
      id: "opp-1",
      opportunityGuid: "guid-1",
      accountGuid: "acc-1",
      accountName: "Account 1",
      businessRegion: "US",
      closeDate: "2024-12-31",
      earlyImplementation: "No",
      gcrmContractAccount: "CN-001",
      gcrmContractPath: "/path",
      lineOfBusiness: "Health",
      livesCount: "1000",
      opportunityUrl: "http://example.com",
      populationType: "General",
      productDto: "{}",
      requestCimFlag: "N",
      revenueEffectiveDate: "2024-01-01",
      stage: "Active",
      subType: "New",
      subTypeDetail: "Details",
      type: "Standard",
    };

    mockApiGet.mockResolvedValueOnce({ data: mockOpportunityDetail } as any);

    render(<ProductBundleDetail data={data} />);

    const links = screen.getAllByText("Test Opportunity");
    fireEvent.click(links[0]);

    await waitFor(() => {
      expect(screen.getByTestId("opportunity-drawer")).toBeInTheDocument();
    });
  });
});
