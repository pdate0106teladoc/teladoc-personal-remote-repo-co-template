import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BundleTree from "./BundleProduct";
import { Bundle, Product } from "@/types/GrpView";

// Mock dependencies
vi.mock("@/components/ProductCard/ProductSummaryCard", () => ({
  default: ({ data }: { data: Product }) => (
    <div data-testid={`product-card-${data.productId}`}>
      <div>{data.productName}</div>
    </div>
  ),
}));

vi.mock("@ucc/common-ui", () => ({
  CalendarIcon: () => <svg data-testid="calendar-icon">Calendar</svg>,
  CustomCheckbox: ({ checked, viewOnly }: { checked: boolean; viewOnly: boolean }) => (
    <div data-testid="custom-checkbox" data-checked={checked} data-viewonly={viewOnly}>
      {checked ? "✓" : ""}
    </div>
  ),
  extractDisplayValue: (value: string, _type: string) => ({
    jsx: <span data-testid="formatted-date">{value}</span>,
  }),
}));

vi.mock("react-icons/bs", () => ({
  BsChevronDown: () => <span data-testid="chevron-down">▼</span>,
  BsChevronRight: () => <span data-testid="chevron-right">►</span>,
}));

describe("BundleTree Component - Comprehensive Tests", () => {
  // Mock data
  const mockProduct: Product = {
    productId: "prod-1",
    productName: "Test Product",
    productTag: "tag1",
    membership: 100,
    age: 18,
    effectiveDate: "2023-01-01",
    termDate: "2024-12-31",
    visitFeesMember: 25.0,
    visitFeesClient: 50.0,
    features: [],
    membershipFeeType: "monthly",
  };

  const mockBundle: Bundle = {
    bundleId: "bundle-1",
    bundleName: "Test Bundle",
    effectiveDate: "2023-01-01",
    advAssessment: true,
    nutritionPromotion: false,
    proactiveCoaching: true,
    products: [mockProduct],
  };

  const mockProductClick = vi.fn();
  const mockBundleTitleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== Component Rendering Tests ====================
  describe("Component Rendering", () => {
    it("should render BundleTree component successfully", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      expect(screen.getByText("Test Bundle")).toBeInTheDocument();
    });

    it("should render with correct CSS classes", () => {
      const { container } = render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      expect(container.querySelector(".bundle-tree")).toBeInTheDocument();
      expect(container.querySelector(".bundle-header")).toBeInTheDocument();
      expect(container.querySelector(".bundle-title")).toBeInTheDocument();
    });

    it("should render toggle button with correct aria-label when collapsed", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /expand/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it("should render chevron right icon when collapsed", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    });

    it("should not render bundle content when collapsed", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      expect(screen.queryByTestId("product-card-prod-1")).not.toBeInTheDocument();
    });

    it("should render bundle title with correct cursor style when onBundleTitleClick is provided", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
          onBundleTitleClick={mockBundleTitleClick}
        />
      );

      const title = screen.getByText("Test Bundle");
      expect(title).toHaveStyle({ cursor: "pointer" });
    });

    it("should render bundle title with default cursor when onBundleTitleClick is not provided", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const title = screen.getByText("Test Bundle");
      expect(title).toHaveStyle({ cursor: "default" });
    });
  });

  // ==================== Toggle Functionality Tests ====================
  describe("Toggle Functionality", () => {
    it("should expand bundle when clicking header", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByTestId("product-card-prod-1")).toBeInTheDocument();
    });

    it("should show chevron down icon when expanded", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("should update aria-label to Collapse when expanded", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByRole("button", { name: /collapse/i })).toBeInTheDocument();
    });

    it("should collapse bundle when clicking header again", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      
      // Expand
      fireEvent.click(header!);
      expect(screen.getByTestId("product-card-prod-1")).toBeInTheDocument();

      // Collapse
      fireEvent.click(header!);
      expect(screen.queryByTestId("product-card-prod-1")).not.toBeInTheDocument();
    });

    it("should toggle multiple times correctly", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");

      // Toggle 3 times
      fireEvent.click(header!); // Expand
      fireEvent.click(header!); // Collapse
      fireEvent.click(header!); // Expand

      expect(screen.getByTestId("product-card-prod-1")).toBeInTheDocument();
    });
  });

  // ==================== Meta Information Rendering Tests ====================
  describe("Meta Information Rendering", () => {
    it("should render effective date when expanded", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
      expect(screen.getByTestId("formatted-date")).toBeInTheDocument();
    });

    it("should render advance assessment checkbox when true", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const checkboxes = screen.getAllByTestId("custom-checkbox");
      const advAssessmentCheckbox = checkboxes.find(cb => cb.getAttribute("data-checked") === "true");
      expect(advAssessmentCheckbox).toBeInTheDocument();
    });

    it("should render nutrition promotion checkbox when false", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const checkboxes = screen.getAllByTestId("custom-checkbox");
      expect(checkboxes.length).toBe(3); // All 3 meta items rendered
    });

    it("should render proactive coaching checkbox when true", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const checkboxes = screen.getAllByTestId("custom-checkbox");
      const checkedBoxes = checkboxes.filter(cb => cb.getAttribute("data-checked") === "true");
      expect(checkedBoxes.length).toBe(2); // advAssessment and proactiveCoaching
    });

    it("should render all checkboxes as viewOnly", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const checkboxes = screen.getAllByTestId("custom-checkbox");
      checkboxes.forEach(checkbox => {
        expect(checkbox.getAttribute("data-viewonly")).toBe("true");
      });
    });

    it("should not render effective date when not provided", () => {
      const bundleWithoutDate = { ...mockBundle, effectiveDate: "" };
      render(
        <BundleTree
          bundle={bundleWithoutDate}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.queryByTestId("calendar-icon")).not.toBeInTheDocument();
    });

    it("should render meta info in correct order", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const flags = screen.getAllByText(/advance assessment|nutrition promotion|proactive coaching/i);
      expect(flags.length).toBe(3);
    });
  });

  // ==================== Product Rendering Tests ====================
  describe("Product Rendering", () => {
    it("should render products when bundle is expanded", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByTestId("product-card-prod-1")).toBeInTheDocument();
    });

    it("should render multiple products", () => {
      const bundleWithMultipleProducts = {
        ...mockBundle,
        products: [
          mockProduct,
          { ...mockProduct, productId: "prod-2", productName: "Product 2" },
          { ...mockProduct, productId: "prod-3", productName: "Product 3" },
        ],
      };

      render(
        <BundleTree
          bundle={bundleWithMultipleProducts}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByTestId("product-card-prod-1")).toBeInTheDocument();
      expect(screen.getByTestId("product-card-prod-2")).toBeInTheDocument();
      expect(screen.getByTestId("product-card-prod-3")).toBeInTheDocument();
    });

    it("should render products with pointer cursor", () => {
      const { container } = render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const productWrapper = container.querySelector(".product-wrapper");
      expect(productWrapper).toHaveStyle({ cursor: "pointer" });
    });

    it("should handle bundle with no products", () => {
      const bundleWithoutProducts = { ...mockBundle, products: undefined };

      render(
        <BundleTree
          bundle={bundleWithoutProducts}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.queryByTestId(/product-card/)).not.toBeInTheDocument();
    });

    it("should handle bundle with empty products array", () => {
      const bundleWithEmptyProducts = { ...mockBundle, products: [] };

      render(
        <BundleTree
          bundle={bundleWithEmptyProducts}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.queryByTestId(/product-card/)).not.toBeInTheDocument();
    });
  });

  // ==================== Product Click Handler Tests ====================
  describe("Product Click Handler", () => {
    it("should call productClick when product is clicked", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const productCard = screen.getByTestId("product-card-prod-1");
      fireEvent.click(productCard.parentElement!);

      expect(mockProductClick).toHaveBeenCalledTimes(1);
      expect(mockProductClick).toHaveBeenCalledWith(mockProduct);
    });

    it("should call productClick with correct product data", () => {
      const bundleWithMultipleProducts = {
        ...mockBundle,
        products: [
          mockProduct,
          { ...mockProduct, productId: "prod-2", productName: "Product 2" },
        ],
      };

      render(
        <BundleTree
          bundle={bundleWithMultipleProducts}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const product2Card = screen.getByTestId("product-card-prod-2");
      fireEvent.click(product2Card.parentElement!);

      expect(mockProductClick).toHaveBeenCalledWith(
        expect.objectContaining({ productId: "prod-2" })
      );
    });

    it("should handle multiple product clicks", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const productCard = screen.getByTestId("product-card-prod-1");
      
      fireEvent.click(productCard.parentElement!);
      fireEvent.click(productCard.parentElement!);
      fireEvent.click(productCard.parentElement!);

      expect(mockProductClick).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== Bundle Title Click Handler Tests ====================
  describe("Bundle Title Click Handler", () => {
    it("should call onBundleTitleClick when title is clicked and callback is provided", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
          onBundleTitleClick={mockBundleTitleClick}
        />
      );

      const title = screen.getByText("Test Bundle");
      fireEvent.click(title);

      expect(mockBundleTitleClick).toHaveBeenCalledTimes(1);
      expect(mockBundleTitleClick).toHaveBeenCalledWith(mockBundle);
    });

    it("should not throw error when title is clicked without callback", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const title = screen.getByText("Test Bundle");
      
      expect(() => {
        fireEvent.click(title);
      }).not.toThrow();
    });

    it("should stop propagation when title is clicked", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
          onBundleTitleClick={mockBundleTitleClick}
        />
      );

      const title = screen.getByText("Test Bundle");
      
      // Verify bundle is initially collapsed
      expect(screen.queryByTestId("product-card-prod-1")).not.toBeInTheDocument();

      fireEvent.click(title);

      // Bundle should still be collapsed (click didn't propagate to header)
      expect(screen.queryByTestId("product-card-prod-1")).not.toBeInTheDocument();
      expect(mockBundleTitleClick).toHaveBeenCalled();
    });

    it("should handle multiple title clicks", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
          onBundleTitleClick={mockBundleTitleClick}
        />
      );

      const title = screen.getByText("Test Bundle");
      
      fireEvent.click(title);
      fireEvent.click(title);
      fireEvent.click(title);

      expect(mockBundleTitleClick).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== Nested Bundle Tests (Recursive) ====================
  describe("Nested Bundle Rendering", () => {
    it("should render child bundles", () => {
      const childBundle: Bundle = {
        bundleId: "child-bundle-1",
        bundleName: "Child Bundle",
        effectiveDate: "2023-06-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
        products: [],
      };

      const parentBundle = {
        ...mockBundle,
        bundles: [childBundle],
      };

      render(
        <BundleTree
          bundle={parentBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByText("Child Bundle")).toBeInTheDocument();
    });

    it("should render multiple child bundles", () => {
      const childBundle1: Bundle = {
        bundleId: "child-1",
        bundleName: "Child Bundle 1",
        effectiveDate: "2023-06-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
      };

      const childBundle2: Bundle = {
        bundleId: "child-2",
        bundleName: "Child Bundle 2",
        effectiveDate: "2023-07-01",
        advAssessment: true,
        nutritionPromotion: false,
        proactiveCoaching: true,
      };

      const parentBundle = {
        ...mockBundle,
        bundles: [childBundle1, childBundle2],
      };

      render(
        <BundleTree
          bundle={parentBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByText("Child Bundle 1")).toBeInTheDocument();
      expect(screen.getByText("Child Bundle 2")).toBeInTheDocument();
    });

    it("should pass productClick callback to child bundles", () => {
      const childProduct: Product = {
        ...mockProduct,
        productId: "child-prod-1",
        productName: "Child Product",
      };

      const childBundle: Bundle = {
        bundleId: "child-bundle-1",
        bundleName: "Child Bundle",
        effectiveDate: "2023-06-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
        products: [childProduct],
      };

      const parentBundle = {
        ...mockBundle,
        products: [],
        bundles: [childBundle],
      };

      render(
        <BundleTree
          bundle={parentBundle}
          productClick={mockProductClick}
        />
      );

      // Expand parent
      const parentHeader = screen.getByText("Test Bundle").closest(".bundle-header");
      fireEvent.click(parentHeader!);

      // Expand child
      const childHeader = screen.getByText("Child Bundle").closest(".bundle-header");
      fireEvent.click(childHeader!);

      // Click child product
      const childProductCard = screen.getByTestId("product-card-child-prod-1");
      fireEvent.click(childProductCard.parentElement!);

      expect(mockProductClick).toHaveBeenCalledWith(childProduct);
    });

    it("should pass onBundleTitleClick callback to child bundles", () => {
      const childBundle: Bundle = {
        bundleId: "child-bundle-1",
        bundleName: "Child Bundle",
        effectiveDate: "2023-06-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
      };

      const parentBundle = {
        ...mockBundle,
        bundles: [childBundle],
      };

      render(
        <BundleTree
          bundle={parentBundle}
          productClick={mockProductClick}
          onBundleTitleClick={mockBundleTitleClick}
        />
      );

      // Expand parent
      const parentHeader = screen.getByText("Test Bundle").closest(".bundle-header");
      fireEvent.click(parentHeader!);

      // Click child title
      const childTitle = screen.getByText("Child Bundle");
      fireEvent.click(childTitle);

      expect(mockBundleTitleClick).toHaveBeenCalledWith(childBundle);
    });

    it("should handle deeply nested bundles", () => {
      const grandChildBundle: Bundle = {
        bundleId: "grandchild-1",
        bundleName: "Grandchild Bundle",
        effectiveDate: "2023-08-01",
        advAssessment: true,
        nutritionPromotion: true,
        proactiveCoaching: true,
      };

      const childBundle: Bundle = {
        bundleId: "child-1",
        bundleName: "Child Bundle",
        effectiveDate: "2023-07-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
        bundles: [grandChildBundle],
      };

      const parentBundle = {
        ...mockBundle,
        bundles: [childBundle],
      };

      render(
        <BundleTree
          bundle={parentBundle}
          productClick={mockProductClick}
        />
      );

      // Expand parent
      const parentHeader = screen.getByText("Test Bundle").closest(".bundle-header");
      fireEvent.click(parentHeader!);

      // Expand child
      const childHeader = screen.getByText("Child Bundle").closest(".bundle-header");
      fireEvent.click(childHeader!);

      expect(screen.getByText("Grandchild Bundle")).toBeInTheDocument();
    });

    it("should render child bundles with child-bundle CSS class", () => {
      const childBundle: Bundle = {
        bundleId: "child-1",
        bundleName: "Child Bundle",
        effectiveDate: "2023-06-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
      };

      const parentBundle = {
        ...mockBundle,
        bundles: [childBundle],
      };

      const { container } = render(
        <BundleTree
          bundle={parentBundle}
          productClick={mockProductClick}
        />
      );

      const parentHeader = screen.getByText("Test Bundle").closest(".bundle-header");
      fireEvent.click(parentHeader!);

      expect(container.querySelector(".child-bundle")).toBeInTheDocument();
    });
  });

  // ==================== Edge Cases and Error Handling ====================
  describe("Edge Cases and Error Handling", () => {
    it("should handle bundle with all boolean flags as false", () => {
      const bundleWithFalseFlags = {
        ...mockBundle,
        advAssessment: false,
        nutritionPromotion: false,
        proactiveCoaching: false,
      };

      render(
        <BundleTree
          bundle={bundleWithFalseFlags}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const checkboxes = screen.getAllByTestId("custom-checkbox");
      const checkedBoxes = checkboxes.filter(cb => cb.getAttribute("data-checked") === "true");
      expect(checkedBoxes.length).toBe(0);
    });

    it("should handle bundle with all boolean flags as true", () => {
      const bundleWithTrueFlags = {
        ...mockBundle,
        advAssessment: true,
        nutritionPromotion: true,
        proactiveCoaching: true,
      };

      render(
        <BundleTree
          bundle={bundleWithTrueFlags}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      const checkboxes = screen.getAllByTestId("custom-checkbox");
      const checkedBoxes = checkboxes.filter(cb => cb.getAttribute("data-checked") === "true");
      expect(checkedBoxes.length).toBe(3);
    });

    it("should handle bundle with very long name", () => {
      const longNameBundle = {
        ...mockBundle,
        bundleName: "A".repeat(200),
      };

      render(
        <BundleTree
          bundle={longNameBundle}
          productClick={mockProductClick}
        />
      );

      expect(screen.getByText("A".repeat(200))).toBeInTheDocument();
    });

    it("should handle bundle with special characters in name", () => {
      const specialCharBundle = {
        ...mockBundle,
        bundleName: "Bundle & <Test> \"Name\" 'With' Special/Chars",
      };

      render(
        <BundleTree
          bundle={specialCharBundle}
          productClick={mockProductClick}
        />
      );

      expect(screen.getByText(/Bundle & <Test>/)).toBeInTheDocument();
    });

    it("should handle rapid toggle clicks", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");

      // Rapidly toggle 10 times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(header!);
      }

      // Should be collapsed (even number of clicks)
      expect(screen.queryByTestId("product-card-prod-1")).not.toBeInTheDocument();
    });

    it("should handle bundle with both products and child bundles", () => {
      const childBundle: Bundle = {
        bundleId: "child-1",
        bundleName: "Child Bundle",
        effectiveDate: "2023-06-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
      };

      const mixedBundle = {
        ...mockBundle,
        products: [mockProduct],
        bundles: [childBundle],
      };

      render(
        <BundleTree
          bundle={mixedBundle}
          productClick={mockProductClick}
        />
      );

      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      expect(screen.getByTestId("product-card-prod-1")).toBeInTheDocument();
      expect(screen.getByText("Child Bundle")).toBeInTheDocument();
    });

    it("should handle bundle with null/undefined optional fields", () => {
      const minimalBundle: Bundle = {
        bundleId: "minimal-1",
        bundleName: "Minimal Bundle",
        effectiveDate: "",
        advAssessment: false,
        nutritionPromotion: false,
        proactiveCoaching: false,
        addedOn: undefined,
        products: undefined,
        bundles: undefined,
      };

      render(
        <BundleTree
          bundle={minimalBundle}
          productClick={mockProductClick}
        />
      );

      expect(screen.getByText("Minimal Bundle")).toBeInTheDocument();
    });
  });

  // ==================== Accessibility Tests ====================
  describe("Accessibility", () => {
    it("should have accessible button with proper aria-label", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label");
    });

    it("should update aria-label based on state", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const button = screen.getByRole("button", { name: /expand/i });
      expect(button).toHaveAttribute("aria-label", "Expand");

      fireEvent.click(button.closest(".bundle-header")!);

      const updatedButton = screen.getByRole("button", { name: /collapse/i });
      expect(updatedButton).toHaveAttribute("aria-label", "Collapse");
    });

    it("should have button type attribute", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should have semantic heading for bundle title", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Test Bundle");
    });
  });

  // ==================== Integration Tests ====================
  describe("Integration Tests", () => {
    it("should complete full workflow: expand -> view products -> click product -> collapse", () => {
      render(
        <BundleTree
          bundle={mockBundle}
          productClick={mockProductClick}
        />
      );

      // Expand
      const header = screen.getByRole("button", { name: /expand/i }).closest(".bundle-header");
      fireEvent.click(header!);

      // View product
      expect(screen.getByTestId("product-card-prod-1")).toBeInTheDocument();

      // Click product
      const productCard = screen.getByTestId("product-card-prod-1");
      fireEvent.click(productCard.parentElement!);
      expect(mockProductClick).toHaveBeenCalled();

      // Collapse
      fireEvent.click(header!);
      expect(screen.queryByTestId("product-card-prod-1")).not.toBeInTheDocument();
    });

    it("should handle complete nested bundle interaction", () => {
      const childProduct: Product = {
        ...mockProduct,
        productId: "child-prod-1",
        productName: "Child Product",
      };

      const childBundle: Bundle = {
        bundleId: "child-1",
        bundleName: "Child Bundle",
        effectiveDate: "2023-06-01",
        advAssessment: false,
        nutritionPromotion: true,
        proactiveCoaching: false,
        products: [childProduct],
      };

      const parentBundle = {
        ...mockBundle,
        bundles: [childBundle],
      };

      render(
        <BundleTree
          bundle={parentBundle}
          productClick={mockProductClick}
          onBundleTitleClick={mockBundleTitleClick}
        />
      );

      // Expand parent
      const parentHeader = screen.getByText("Test Bundle").closest(".bundle-header");
      fireEvent.click(parentHeader!);

      // Click parent title
      const parentTitle = screen.getByText("Test Bundle");
      fireEvent.click(parentTitle);
      expect(mockBundleTitleClick).toHaveBeenCalledWith(parentBundle);

      // Expand child
      const childHeader = screen.getByText("Child Bundle").closest(".bundle-header");
      fireEvent.click(childHeader!);

      // Click child title
      const childTitle = screen.getByText("Child Bundle");
      fireEvent.click(childTitle);
      expect(mockBundleTitleClick).toHaveBeenCalledWith(childBundle);

      // Click child product
      const childProductCard = screen.getByTestId("product-card-child-prod-1");
      fireEvent.click(childProductCard.parentElement!);
      expect(mockProductClick).toHaveBeenCalledWith(childProduct);
    });
  });
});
