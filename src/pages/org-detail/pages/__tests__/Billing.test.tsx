import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

import BillingPage from "../Billing";

const { mockUseParams, mockGetBillingData, mockSetBillingData, mockSetOrg, mockFailSafePage, mockHandleSaveChanges } = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockGetBillingData: vi.fn(),
  mockSetBillingData: vi.fn(),
  mockSetOrg: vi.fn(),
  mockFailSafePage: vi.fn(),
  mockHandleSaveChanges: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => mockUseParams(),
  useOutletContext: () => ({ handleSaveChanges: mockHandleSaveChanges, orgMetadata: null }),
  useLocation: () => ({ pathname: "/org/org-1" }),
}));

vi.mock("@/store/useOrgStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      getBillingData: mockGetBillingData,
      setBillingData: mockSetBillingData,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/configStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      setOrg: mockSetOrg,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/editStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = { lastSavedAt: null };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/hooks/useEditMode", () => ({
  useEditMode: () => ({
    metadata: undefined,
    formData: {},
    originalData: {},
    errors: {},
    updateField: vi.fn(),
    updateLiveEntityField: vi.fn(),
    setMetadata: vi.fn(),
    setFormData: vi.fn(),
    setOriginalData: vi.fn(),
    liveEntityData: {},
  }),
}));

const mockRenderBillingOverview = vi.fn();
const mockRenderInvoiceDetails = vi.fn();

vi.mock("@/data/organization/billing", () => ({
  __esModule: true,
  renderBillingOverview: (data: any, metadata: any) => mockRenderBillingOverview(data, metadata),
  renderInvoiceDetails: (data: any, metadata: any) => mockRenderInvoiceDetails(data, metadata),
}));

const mockRenderAllSections = vi.fn();

vi.mock("@/components/RenderAllSection/RenderAllSection", () => ({
  __esModule: true,
  default: (props: any) => {
    mockRenderAllSections(props);
    return <div data-testid="render-all-sections" />;
  },
}));

vi.mock("react-bootstrap/Tabs", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs">{children}</div>
  ),
}));

vi.mock("react-bootstrap/Tab", () => ({
  __esModule: true,
  default: ({
    children,
    eventKey,
    title,
  }: {
    children: React.ReactNode;
    eventKey: string;
    title: string;
  }) => (
    <div data-testid={`tab-${eventKey}`}>
      <div>{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    Loader: ({ text }: { text: string }) => <div data-testid="loader">{text}</div>,
    FailSafePage: ({ cardType }: { cardType: string }) => {
      mockFailSafePage(cardType);
      return <div data-testid="failsafe">{cardType}</div>;
    },
  };
});

describe("BillingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Loader when no billing data is found", () => {
    mockUseParams.mockReturnValue({ id: "org-1" });
    mockGetBillingData.mockReturnValueOnce(null);

    render(<BillingPage />);

    expect(mockGetBillingData).toHaveBeenCalledWith("org-1");
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(mockSetOrg).toHaveBeenCalledWith({ updatedAt: "" });
    expect(screen.queryByTestId("failsafe")).not.toBeInTheDocument();
    expect(mockFailSafePage).not.toHaveBeenCalled();
  });

  it("renders tabs and sections when billing data exists", () => {
    mockUseParams.mockReturnValue({ id: "org-1" });

    const billingData = {
      id: "org-1",
      updatedAt: "2024-05-01T12:00:00Z",
      someField: "value",
    };

    mockGetBillingData.mockReturnValueOnce(billingData);

    const overviewTransformed = { overview: true };
    const invoiceTransformed = { invoice: true };

    mockRenderBillingOverview.mockReturnValueOnce(overviewTransformed);
    mockRenderInvoiceDetails.mockReturnValueOnce(invoiceTransformed);

    render(<BillingPage />);

    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    expect(screen.queryByTestId("failsafe")).not.toBeInTheDocument();
    expect(mockFailSafePage).not.toHaveBeenCalled();
    expect(mockSetOrg).toHaveBeenCalledWith({
      updatedAt: "2024-05-01T12:00:00Z",
    });

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tab-Overview")).toBeInTheDocument();
    expect(screen.getByTestId("tab-invoice-detail")).toBeInTheDocument();
    expect(mockRenderBillingOverview).toHaveBeenCalledWith(billingData, undefined);
    expect(mockRenderInvoiceDetails).toHaveBeenCalledWith(billingData, undefined);
    expect(mockRenderAllSections).toHaveBeenCalledWith(
      expect.objectContaining({ data: overviewTransformed })
    );
    expect(mockRenderAllSections).toHaveBeenCalledWith(
      expect.objectContaining({ data: invoiceTransformed })
    );
    expect(screen.getAllByTestId("render-all-sections").length).toBeGreaterThanOrEqual(2);
  });

  it("falls back to empty updatedAt when data has no updatedAt", () => {
    mockUseParams.mockReturnValue({ id: "org-1" });

    const billingData = {
      id: "org-1",
      someField: "value",
    };

    mockGetBillingData.mockReturnValueOnce(billingData);

    mockRenderBillingOverview.mockReturnValueOnce({});
    mockRenderInvoiceDetails.mockReturnValueOnce({});

    render(<BillingPage />);

    expect(mockSetOrg).toHaveBeenCalledWith({ updatedAt: "" });
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
  });
});
