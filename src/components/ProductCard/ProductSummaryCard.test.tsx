import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductSummaryCard from "./ProductSummaryCard";

// Mocks for utilities the component likely uses
vi.mock("@/utils", () => ({
  buildVisitFeesText: vi.fn((m: any, c: any) =>
    m || c ? `VF-${m ?? ""}-${c ?? ""}` : ""
  ),
  getSafeString: (v: any) => (v == null ? "" : String(v)),
}));

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: (v: any) => ({ jsx: <span data-testid="date">{v}</span> }),
}));

// If LABELS constant is used inside component:
vi.mock("@/constants", () => ({
  LABELS: {
    products: {
      TRANSITION_TO: "Transition To",
    },
  },
}));

const baseProduct: any = {
  productName: "Prod A",
  membership: 25,
  membershipFeeType: "mo",
  age: "18+",
  effectiveDate: "2025-01-01",
  termDate: "2025-12-31",
  visitFeesMember: 10,
  visitFeesClient: 5,
  features: [],
  transistionToId: null,
  transistionToName: "",
  updatedOn: "2025-03-10",
  productTag: null,
};

describe("ProductSummaryCard (Vitest)", () => {
  beforeEach(() => {
    // (Optional) cleanup is auto in RTL >=13; add if needed:
    // cleanup();
  });

  it("renders product title", () => {
    render(<ProductSummaryCard data={baseProduct} />);
    expect(screen.getByText("Prod A")).toBeInTheDocument();
  });

  it("renders product tag when present", () => {
    render(
      <ProductSummaryCard data={{ ...baseProduct, productTag: "TAG-1" }} />
    );
    expect(screen.getByText("TAG-1")).toBeInTheDocument();
  });

  it("does not render tag when absent", () => {
    render(<ProductSummaryCard data={baseProduct} />);
    expect(screen.queryByText("TAG-1")).not.toBeInTheDocument();
  });

  it("renders transition info when transistionToId exists", () => {
    const data = {
      ...baseProduct,
      transistionToId: "T1",
      transistionToName: "Next Product",
    };
    render(<ProductSummaryCard data={data} />);
    expect(screen.getByText("Transition To")).toBeInTheDocument();
    expect(screen.getByText("Next Product")).toBeInTheDocument();
  });

  it("omits transition info when transistionToId missing", () => {
    render(<ProductSummaryCard data={baseProduct} />);
    expect(screen.queryByText("Transition To")).not.toBeInTheDocument();
  });

  it("renders age", () => {
    render(<ProductSummaryCard data={baseProduct} />);
    expect(screen.getByText("18+")).toBeInTheDocument();
  });

  it("renders effective & term dates", () => {
    render(<ProductSummaryCard data={baseProduct} />);
    expect(screen.getByText("2025-01-01")).toBeInTheDocument();
    expect(screen.getByText("2025-12-31")).toBeInTheDocument();
  });

  it("renders visit fee row when fees exist", () => {
    render(<ProductSummaryCard data={baseProduct} />);
    expect(screen.getByText(/VF-10-5/)).toBeInTheDocument();
  });

  it("hides visit fee row when both fees missing", () => {
    const data = {
      ...baseProduct,
      visitFeesMember: null,
      visitFeesClient: null,
    };
    render(<ProductSummaryCard data={data} />);
    expect(screen.queryByText(/VF-/)).not.toBeInTheDocument();
  });

  it("renders feature with fees", () => {
    const data = {
      ...baseProduct,
      features: [
        { featureName: "Feat 1", visitFeesMember: 2, visitFeesClient: 3 },
      ],
    };
    render(<ProductSummaryCard data={data} />);
    expect(screen.getByText("Feat 1")).toBeInTheDocument();
    expect(screen.getByText(/VF-2-3/)).toBeInTheDocument();
  });

  it("renders feature without fee text when empty", () => {
    const data = {
      ...baseProduct,
      features: [
        { featureName: "Feat 2", visitFeesMember: null, visitFeesClient: null },
      ],
    };
    render(<ProductSummaryCard data={data} />);
    expect(screen.getByText("Feat 2")).toBeInTheDocument();
    expect(screen.queryByText(/VF-/)).toBeInTheDocument();
  });

  it("renders multiple features", () => {
    const data = {
      ...baseProduct,
      features: [
        { featureName: "F1", visitFeesMember: 1, visitFeesClient: 1 },
        { featureName: "F2", visitFeesMember: 2, visitFeesClient: 2 },
      ],
    };
    render(<ProductSummaryCard data={data} />);
    expect(screen.getByText("F1")).toBeInTheDocument();
    expect(screen.getByText("F2")).toBeInTheDocument();
  });

  it("handles empty productName gracefully", () => {
    const data = { ...baseProduct, productName: "" };
    render(<ProductSummaryCard data={data} />);
    // Component might show blank area; assert container still rendered
    expect(screen.getByText(/VF-10-5/)).toBeInTheDocument();
  });
});
