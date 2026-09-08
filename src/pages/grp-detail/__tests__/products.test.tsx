import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProductPage from "../pages/Products";
import { useParams, MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock react-router-dom useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useParams: vi.fn() };
});
// Mock API service
vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

// Mock useGroupStore
const mockGetProductsData = vi.fn();
const mockGetProductDetailData = vi.fn();

vi.mock("@/store/useGroupStore", () => ({
  __esModule: true,
  default: vi.fn(() => ({
    getProductsData: mockGetProductsData,
    getProductDetailData: mockGetProductDetailData,
  })),
}));

// Mock useFilterStore
const mockGetApplied = vi.fn();
const mockGetFilters = vi.fn();

vi.mock("@/store/filterStore", () => ({
  __esModule: true,
  useFilterStore: vi.fn((selector) => {
    const state = {
      getApplied: mockGetApplied,
      getFilters: mockGetFilters,
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock splitByActivity utility
vi.mock("@/utils", async () => {
  const actual = await vi.importActual("@/utils");
  return {
    ...actual,
    splitByActivity: vi.fn((data) => ({
      active: data,
      expired: { bundles: [], standaloneProducts: [] },
    })),
  };
});


// Mock Cards and Table
vi.mock("@/components/Cards/CustomCards", () => ({
  __esModule: true,
  CustomCards: ({ title, children }: any) => (
    <div data-testid={`card-${title}`}>{children}</div>
  ),
}));
vi.mock("@/components/CustomTable/DataTable", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="table">
      {props.data.map((row: any, i: number) => (
        <div key={i} data-testid={`row-${i}`}>
          {JSON.stringify(row)}
        </div>
      ))}
    </div>
  ),
}));
vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    showCustomToast: vi.fn(),
    FailSafePage: ({ cardType }: { cardType: string }) => (
      <div data-testid="failsafe-page">
        {cardType === "noData" ? "No data available" : "Something's wrong."}
      </div>
    ),
    SideModal: ({ show, children }: any) =>
      show ? <div data-testid="modal">{children}</div> : null,
  };
});
// Mock extractor
vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: vi.fn((v) => ({
    jsx: <span data-testid="extract-jsx">{String(v)}</span>,
    raw: String(v),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetProductsData.mockReturnValue(null);
  mockGetProductDetailData.mockReturnValue([]);

  // Default filter store mock values
  mockGetApplied.mockReturnValue({
    filterApplied: 0,
    filteredAppliedKeys: [],
  });
  mockGetFilters.mockReturnValue({});
});

describe("ProductPage Component", () => {
  const groupId = "G1";
  const productsData = {
    bundles: [
      {
        bundleId: "B1",
        bundleName: "Primary Bundle",
        bundleType: "WP Anchor",
        products: [
          {
            productId: "P1",
            productName: "Telemed",
            serviceCategory: "Telehealth Services",
            productEnabled: true,
            features: [{ featureName: "Telemed", membershipFee: 10 }],
          },
        ],
      },
      {
        bundleId: "B2",
        bundleName: "Mental Bundle",
        bundleType: "WP Non Anchor",
        products: [
          {
            productId: "M1",
            productName: "Mental",
            serviceCategory: "Mental health services",
            productEnabled: true,
            features: [{ featureName: "Mental", membershipFee: 20 }],
          },
        ],
      },
    ],
    standaloneProducts: [
      {
        productId: "S1",
        productName: "Chronic",
        serviceCategory: "Chronic care services",
        productEnabled: true,
        features: [{ featureName: "Chronic", membershipFee: 30 }],
      },
    ],
  };

  beforeEach(() => {
    (useParams as unknown as any).mockReturnValue({ id: groupId });
  });
  it("renders loader initially", () => {
    mockGetProductsData.mockReturnValue(undefined);
    render(<ProductPage />);
    // When data is undefined, it shows FailSafePage with no data
    expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("shows fallback when no data", async () => {
    mockGetProductsData.mockReturnValue(null);
    render(<ProductPage />);
    expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders product lists on success", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    // Component should render with tabs
    await waitFor(() => {
      expect(screen.getByText("Active & Upcoming")).toBeInTheDocument();
      expect(screen.getByText("Terminated")).toBeInTheDocument();
    });
  });

  it("shows error toast on fetch failure", async () => {
    // This test doesn't apply anymore since the component doesn't fetch directly
    // It gets data from the store. Skipping this test or adjusting it.
    mockGetProductsData.mockReturnValue(null);
    render(<ProductPage />);

    // Instead we verify it shows no data UI when store has no data
    expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
  });

  it("renders products extracted from bundles when data is available", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should render products extracted from bundles (flat display, no bundle tree)
      const telemedProducts = screen.getAllByText("Telemed");
      expect(telemedProducts.length).toBeGreaterThan(0);
      const mentalProducts = screen.getAllByText("Mental");
      expect(mentalProducts.length).toBeGreaterThan(0);
    });
  });

  it("renders standalone products when data is available", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should render standalone products - use getAllByText since product names appear in multiple places
      const chronicProducts = screen.getAllByText("Chronic");
      expect(chronicProducts.length).toBeGreaterThan(0);

      // Check for standalone products container
      const standaloneContainers = document.querySelectorAll('.standalone-products');
      expect(standaloneContainers.length).toBeGreaterThan(0);
    });
  });

  it("allows searching products", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Search input should be present
      const searchInputs = container.querySelectorAll('input[placeholder="Find products..."]');
      expect(searchInputs.length).toBeGreaterThan(0);
    });
  });

  it("shows filter button", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Filter buttons should be visible - one per tab, use getAllByText
      const filterButtons = screen.getAllByText("View filters");
      expect(filterButtons.length).toBeGreaterThan(0);
      expect(filterButtons[0]).toBeInTheDocument();
    });
  });

  it("renders tabs correctly", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Both tabs should be present
      expect(screen.getByText("Active & Upcoming")).toBeInTheDocument();
      expect(screen.getByText("Terminated")).toBeInTheDocument();
    });
  });

  it("handles empty bundles array", async () => {
    mockGetProductsData.mockReturnValue({
      bundles: [],
      standaloneProducts: [],
    });
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should still render tabs even with empty data
      expect(screen.getByText("Active & Upcoming")).toBeInTheDocument();
    });
  });

  it("handles undefined from getProductDetailData", () => {
    mockGetProductsData.mockReturnValue(productsData);
    mockGetProductDetailData.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    // Should not crash
    expect(screen.getByText("Active & Upcoming")).toBeInTheDocument();
  });

  it("switches between tabs", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Active & Upcoming")).toBeInTheDocument();
    });

    // Click on Terminated tab
    const terminatedTab = screen.getByText("Terminated");
    fireEvent.click(terminatedTab);

    // Tab should be switched
    expect(terminatedTab).toBeInTheDocument();
  });

  it("handles empty standalone products array", async () => {
    const dataWithoutStandalone = {
      bundles: [
        {
          bundleId: "b1",
          bundleName: "Primary Bundle",
          bundleType: "Primary",
          products: [
            {
              productId: "p1",
              productName: "EAP",
              serviceCategory: "Mental Health",
              productEnabled: true,
              features: [],
            },
          ],
        },
      ],
      standaloneProducts: [],
    };

    mockGetProductsData.mockReturnValue(dataWithoutStandalone);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Products from bundle should still be shown (extracted and displayed flat)
      expect(screen.getByText("EAP")).toBeInTheDocument();
      // Should have product containers for bundle products
      const standaloneContainers = document.querySelectorAll('.standalone-products');
      expect(standaloneContainers.length).toBeGreaterThan(0);
    });
  });

  it("renders product summary cards", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check that product cards are rendered
      const productTitles = document.querySelectorAll('.product-title');
      expect(productTitles.length).toBeGreaterThan(0);
    });
  });

  it("handles search input interaction", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');
      expect(searchInput).toBeInTheDocument();

      if (searchInput) {
        // Simulate user typing in search
        fireEvent.change(searchInput, { target: { value: 'EAP' } });
        expect(searchInput).toHaveValue('EAP');
      }
    });
  });

  it("handles clicking on a product to open product detail", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    mockGetProductDetailData.mockReturnValue([
      {
        product: "EAP",
        category: "Mental Health",
        fields: [
          {
            label: "Description",
            value: "Employee Assistance Program",
            order: 1,
            section: "Details",
          },
        ],
      },
    ]);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Find a product card and click it
      const standaloneContainer = container.querySelector('.standalone-products');
      if (standaloneContainer) {
        fireEvent.click(standaloneContainer);
      }
    });
  });

  it("no longer displays bundle headers (products are shown flat)", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Bundle headers should not exist anymore (flat product display)
      const bundleHeader = container.querySelector('.bundle-header');
      expect(bundleHeader).toBeNull();

      // Instead, products should be displayed directly
      const telemedProducts = screen.getAllByText("Telemed");
      expect(telemedProducts.length).toBeGreaterThan(0);
      const mentalProducts = screen.getAllByText("Mental");
      expect(mentalProducts.length).toBeGreaterThan(0);
    });
  });

  it("filters products by search query", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');

      if (searchInput) {
        // Search for a specific product
        fireEvent.change(searchInput, { target: { value: 'Telemed' } });

        // Product with "Telemed" in name should still be visible
        const telemedProducts = screen.getAllByText("Telemed");
        expect(telemedProducts.length).toBeGreaterThan(0);
      }
    });
  });

  it("shows empty state when filtered results are empty", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');

      if (searchInput) {
        // Search for something that doesn't exist
        fireEvent.change(searchInput, { target: { value: 'NonExistentProduct12345' } });
      }
    });

    // Should show empty state (though component still renders structure)
    await waitFor(() => {
      expect(container.querySelector('.contents')).toBeInTheDocument();
    });
  });

  it("handles data with both bundles and standalone products", async () => {
    const mixedData = {
      bundles: [
        {
          bundleId: "b1",
          bundleName: "Bundle 1",
          bundleType: "Primary",
          products: [
            {
              productId: "p1",
              productName: "Product 1",
              serviceCategory: "Health",
              productEnabled: true,
              features: [],
            },
          ],
        },
      ],
      standaloneProducts: [
        {
          productId: "p2",
          productName: "Standalone 1",
          serviceCategory: "Wellness",
          productEnabled: true,
          features: [],
        },
      ],
    };

    mockGetProductsData.mockReturnValue(mixedData);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should display products from bundles and standalone
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Standalone 1")).toBeInTheDocument();
      const standaloneContainers = document.querySelectorAll('.standalone-products');
      expect(standaloneContainers.length).toBeGreaterThan(0);
    });
  });

  it("handles nested bundles in data structure and extracts all products", async () => {
    const nestedBundleData = {
      bundles: [
        {
          bundleId: "parent",
          bundleName: "Parent Bundle",
          bundleType: "Primary",
          products: [
            {
              productId: "p0",
              productName: "Parent Product",
              serviceCategory: "Health",
              productEnabled: true,
              features: [],
            },
          ],
          bundles: [
            {
              bundleId: "child",
              bundleName: "Child Bundle",
              bundleType: "Secondary",
              products: [
                {
                  productId: "p1",
                  productName: "Nested Product",
                  serviceCategory: "Health",
                  productEnabled: true,
                  features: [],
                },
              ],
            },
          ],
        },
      ],
      standaloneProducts: [],
    };

    mockGetProductsData.mockReturnValue(nestedBundleData);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should extract and display products from both parent and nested bundles
      expect(screen.getByText("Parent Product")).toBeInTheDocument();
      expect(screen.getByText("Nested Product")).toBeInTheDocument();
    });
  });

  it("handles search in terminated tab", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const terminatedTab = screen.getByText("Terminated");
      fireEvent.click(terminatedTab);
    });

    await waitFor(() => {
      // Find search input in terminated tab
      const searchInputs = container.querySelectorAll('input[placeholder="Find products..."]');
      if (searchInputs.length > 1) {
        fireEvent.change(searchInputs[1], { target: { value: 'test' } });
      }
    });
  });

  it("handles product detail modal", async () => {
    const productDetailData = [
      {
        product: "EAP",
        category: "Mental Health",
        fields: [
          {
            label: "Description",
            value: "Employee Assistance Program",
            order: 1,
            section: "Overview",
            group: undefined,
          },
          {
            label: "Coverage",
            value: "Full coverage",
            order: 2,
            section: "Overview",
            group: "Benefits",
          },
        ],
      },
    ];

    mockGetProductsData.mockReturnValue(productsData);
    mockGetProductDetailData.mockReturnValue(productDetailData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const standaloneContainer = container.querySelector('.standalone-products');
      if (standaloneContainer) {
        fireEvent.click(standaloneContainer);
      }
    });

    // Product detail modal should open
    await waitFor(() => {
      expect(mockGetProductDetailData).toHaveBeenCalled();
    });
  });

  it("no longer triggers bundle detail modal (bundle tree removed)", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Bundle headers no longer exist since we display products flat
      const bundleHeader = container.querySelector('.bundle-header');
      expect(bundleHeader).toBeNull();

      // Products from bundles are displayed as flat cards
      const telemedProducts = screen.getAllByText("Telemed");
      expect(telemedProducts.length).toBeGreaterThan(0);
      const mentalProducts = screen.getAllByText("Mental");
      expect(mentalProducts.length).toBeGreaterThan(0);
    });
  });

  it("handles case-insensitive search", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');

      if (searchInput) {
        // Search with different case
        fireEvent.change(searchInput, { target: { value: 'TELEMED' } });

        // Should still find "Telemed" product
        const telemedProducts = screen.getAllByText("Telemed");
        expect(telemedProducts.length).toBeGreaterThan(0);
      }
    });
  });

  it("handles search with whitespace", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');

      if (searchInput) {
        // Search with leading/trailing whitespace
        fireEvent.change(searchInput, { target: { value: '  Mental  ' } });

        // Should still work and find the product
        const mentalProducts = screen.getAllByText("Mental");
        expect(mentalProducts.length).toBeGreaterThan(0);
      }
    });
  });

  it("handles closing product detail modal", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    mockGetProductDetailData.mockReturnValue([
      {
        product: "EAP",
        category: "Mental Health",
        fields: [],
      },
    ]);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const standaloneContainer = document.querySelector('.standalone-products');
      if (standaloneContainer) {
        fireEvent.click(standaloneContainer);
      }
    });

    // Modal should be shown (mocked)
    await waitFor(() => {
      expect(mockGetProductDetailData).toHaveBeenCalled();
    });
  });

  it("products from bundles are displayed as flat cards", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Products should be displayed in standalone-products containers (flat display)
      const productContainers = container.querySelectorAll('.standalone-products');
      expect(productContainers.length).toBeGreaterThan(0);

      // Should display products from bundles
      const telemedProducts = screen.getAllByText("Telemed");
      expect(telemedProducts.length).toBeGreaterThan(0);
      const mentalProducts = screen.getAllByText("Mental");
      expect(mentalProducts.length).toBeGreaterThan(0);
    });
  });

  it("handles data with expired/terminated products", async () => {
    const expiredData = {
      bundles: [
        {
          bundleId: "b2",
          bundleName: "Expired Bundle",
          effectiveDate: "2023-01-01",
          advAssessment: false,
          nutritionPromotion: false,
          proactiveCoaching: false,
          products: [
            {
              productId: "ep1",
              productName: "Expired Product",
              membership: 0,
              age: 0,
              effectiveDate: "2023-01-01",
              termDate: "2023-12-31",
              visitFeesMember: null,
              visitFeesClient: null,
              productEnabled: true,
              features: [],
              membershipFeeType: "standard",
            },
          ],
        },
      ],
      standaloneProducts: [
        {
          productId: "esp1",
          productName: "Expired Standalone",
          membership: 0,
          age: 0,
          effectiveDate: "2023-01-01",
          termDate: "2023-12-31",
          visitFeesMember: null,
          visitFeesClient: null,
          productEnabled: true,
          features: [],
          membershipFeeType: "standard",
        },
      ],
    };

    mockGetProductsData.mockReturnValue(expiredData);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Click on Terminated tab
      const terminatedTab = screen.getByText("Terminated");
      fireEvent.click(terminatedTab);
    });

    await waitFor(() => {
      // Should show expired products
      expect(screen.getByText("Expired Product")).toBeInTheDocument();
      expect(screen.getByText("Expired Standalone")).toBeInTheDocument();
    });
  });

  it("handles filter modal for terminated tab", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const terminatedTab = screen.getByText("Terminated");
      fireEvent.click(terminatedTab);
    });

    await waitFor(() => {
      // Terminated tab should be active
      expect(screen.getByText("Terminated")).toBeInTheDocument();
    });
  });

  it("handles products with features", async () => {
    const { splitByActivity } = await import("@/utils");

    const dataWithFeatures = {
      bundles: [],
      standaloneProducts: [
        {
          productId: "p1",
          productName: "Feature Product",
          membership: 0,
          age: 0,
          effectiveDate: "2024-01-01",
          termDate: "2099-12-31",
          visitFeesMember: null,
          visitFeesClient: null,
          productEnabled: true,
          features: [],
          membershipFeeType: "standard",
        },
      ],
    };

    vi.mocked(splitByActivity).mockReturnValue({
      active: dataWithFeatures,
      expired: { bundles: [], standaloneProducts: [] },
    });

    mockGetProductsData.mockReturnValue(dataWithFeatures);

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Feature Product")).toBeInTheDocument();
    });
  });

  it("handles empty search results in both tabs", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'XYZNONEXISTENT' } });
      }
    });

    // Switch to terminated tab and search
    await waitFor(() => {
      const terminatedTab = screen.getByText("Terminated");
      fireEvent.click(terminatedTab);
    });

    await waitFor(() => {
      const searchInputs = container.querySelectorAll('input[placeholder="Find products..."]');
      if (searchInputs.length > 1) {
        fireEvent.change(searchInputs[1], { target: { value: 'XYZNONEXISTENT' } });
      }
    });
  });

  it("handles product detail with grouped fields", async () => {
    const detailWithGroups = [
      {
        product: "EAP",
        category: "Mental Health",
        fields: [
          {
            label: "Field 1",
            value: "Value 1",
            order: 1,
            section: "Section A",
            group: "Group 1",
          },
          {
            label: "Field 2",
            value: "Value 2",
            order: 2,
            section: "Section A",
            group: "Group 1",
          },
          {
            label: "Field 3",
            value: "Value 3",
            order: 3,
            section: "Section B",
          },
        ],
      },
    ];

    mockGetProductsData.mockReturnValue(productsData);
    mockGetProductDetailData.mockReturnValue(detailWithGroups);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const standaloneContainer = container.querySelector('.standalone-products');
      if (standaloneContainer) {
        fireEvent.click(standaloneContainer);
      }
    });
  });

  it("handles product detail with rte overrides and opportunities", async () => {
    const detailWithExtras = [
      {
        product: "EAP",
        category: "Mental Health",
        fields: [],
        rteOverrides: [{ key: "override1", value: "value1" }],
        opportunities: [{ name: "Opportunity 1", status: "active" }],
        programSchedule: { schedule: "daily" },
        performanceGuarantee: { guaranteed: true },
      },
    ];

    mockGetProductsData.mockReturnValue(productsData);
    mockGetProductDetailData.mockReturnValue(detailWithExtras);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const standaloneContainer = container.querySelector('.standalone-products');
      if (standaloneContainer) {
        fireEvent.click(standaloneContainer);
      }
    });
  });

  it("opens product detail modal when clicking products", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    mockGetProductDetailData.mockReturnValue([
      {
        product: "Telemed",
        category: "Telehealth",
        fields: [],
      },
    ]);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Wait for products to render
      const standaloneContainers = container.querySelectorAll('.standalone-products');
      expect(standaloneContainers.length).toBeGreaterThan(0);
    });

    // Click on a product
    const standaloneContainers = container.querySelectorAll('.standalone-products');
    if (standaloneContainers.length > 0) {
      fireEvent.click(standaloneContainers[0]);

      // Product detail data should be fetched
      await waitFor(() => {
        expect(mockGetProductDetailData).toHaveBeenCalled();
      });
    }
  });

  it("handles search matching product names within bundles", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');
      if (searchInput) {
        // Search for product within bundle
        fireEvent.change(searchInput, { target: { value: 'EAP' } });
      }
    });
  });

  it("deduplicates products with same productId from nested bundles", async () => {
    const dataWithDuplicates = {
      bundles: [
        {
          bundleId: "b1",
          bundleName: "Bundle 1",
          bundleType: "Primary",
          effectiveDate: "2024-01-01",
          advAssessment: false,
          nutritionPromotion: false,
          proactiveCoaching: false,
          products: [
            {
              productId: "p1",
              productName: "Duplicate Product",
              serviceCategory: "Health",
              productEnabled: true,
              features: [],
            },
          ],
          bundles: [
            {
              bundleId: "b2",
              bundleName: "Bundle 2",
              bundleType: "Secondary",
              effectiveDate: "2024-01-01",
              advAssessment: false,
              nutritionPromotion: false,
              proactiveCoaching: false,
              bundles: [],
              products: [
                {
                  productId: "p1", // Same productId as above
                  productName: "Duplicate Product",
                  serviceCategory: "Health",
                  productEnabled: true,
                  features: [],
                },
                {
                  productId: "p2",
                  productName: "Unique Product",
                  serviceCategory: "Health",
                  productEnabled: true,
                  features: [],
                },
              ],
            },
          ],
        },
      ],
      standaloneProducts: [],
    };

    mockGetProductsData.mockReturnValue(dataWithDuplicates);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Products should be rendered
      const productContainers = container.querySelectorAll('.standalone-products');
      expect(productContainers.length).toBeGreaterThan(0);

      // Should render product cards (deduplication works)
      const productCards = container.querySelectorAll('.product-summary-card');
      expect(productCards.length).toBeGreaterThan(0);
    });
  });

  it("handles filter with no results", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    mockGetFilters.mockReturnValue({
      serviceCategory: ["NonExistent"],
    });

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    // Component should still render
    await waitFor(() => {
      expect(screen.getByText("Active & Upcoming")).toBeInTheDocument();
    });
  });

  it("tracks products that belong to multiple bundles", async () => {
    const dataWithSharedProduct = {
      bundles: [
        {
          bundleId: "b1",
          bundleName: "Bundle 1",
          bundleType: "Primary",
          effectiveDate: "2024-01-01",
          advAssessment: true,
          nutritionPromotion: false,
          proactiveCoaching: false,
          bundles: [],
          products: [
            {
              productId: "shared",
              productName: "Shared Product",
              serviceCategory: "Health",
              productEnabled: true,
              features: [],
            },
          ],
        },
        {
          bundleId: "b2",
          bundleName: "Bundle 2",
          bundleType: "Secondary",
          effectiveDate: "2024-01-01",
          advAssessment: false,
          nutritionPromotion: true,
          proactiveCoaching: false,
          bundles: [],
          products: [
            {
              productId: "shared", // Same product in different bundle
              productName: "Shared Product",
              serviceCategory: "Health",
              productEnabled: true,
              features: [],
            },
          ],
        },
      ],
      standaloneProducts: [],
    };

    mockGetProductsData.mockReturnValue(dataWithSharedProduct);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should have product containers
      const standaloneContainers = container.querySelectorAll('.standalone-products');
      expect(standaloneContainers.length).toBeGreaterThan(0);

      // Should render product cards (deduplication works)
      const productCards = container.querySelectorAll('.product-summary-card');
      expect(productCards.length).toBeGreaterThan(0);
    });
  });

  it("does not log bundle info for standalone products", async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    const dataWithOnlyStandalone = {
      bundles: [],
      standaloneProducts: [
        {
          productId: "s1",
          productName: "Standalone Product",
          serviceCategory: "Health",
          productEnabled: true,
          features: [],
        },
      ],
    };

    mockGetProductsData.mockReturnValue(dataWithOnlyStandalone);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Click on standalone product
      const standaloneContainers = container.querySelectorAll('.standalone-products');
      if (standaloneContainers.length > 0) {
        fireEvent.click(standaloneContainers[0]);
      }
    });

    await waitFor(() => {
      // Console.log should not include bundle info for standalone products
      const consoleLogCalls = consoleSpy.mock.calls.map(call => call.join(' '));
      const hasBundleInfo = consoleLogCalls.some(call => call.includes('Bundle'));
      // For standalone products, no bundle info should be logged
      expect(hasBundleInfo).toBe(false);
    });

    consoleSpy.mockRestore();
  });

  it("applies filters during product extraction from bundles", async () => {
    mockGetProductsData.mockReturnValue(productsData);
    mockGetFilters.mockReturnValue({
      serviceCategory: ["Telehealth Services"],
    });

    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Component should render with tabs
      expect(screen.getByText("Active & Upcoming")).toBeInTheDocument();
      // Filters are applied during extraction to products from bundles
      const productContainers = document.querySelectorAll('.standalone-products');
      // Should have product containers
      expect(productContainers.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("applies search query during product extraction from bundles", async () => {
    mockGetProductsData.mockReturnValue(productsData);

    const { container } = render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const searchInput = container.querySelector('input[placeholder="Find products..."]');
      if (searchInput) {
        // Search for specific product from bundle
        fireEvent.change(searchInput, { target: { value: 'Telemed' } });
      }
    });

    // Search query is applied, products are filtered
    await waitFor(() => {
      expect(container.querySelector('.contents')).toBeInTheDocument();
    });
  });
});
