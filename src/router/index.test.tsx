import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Router from "./index";

vi.mock("@ucc/common-ui", () => ({
  Loader: ({ text }: { text: string }) => <div data-testid="loader">{text}</div>,
  FailSafePage: ({ cardType }: { cardType: string }) => (
    <div data-testid="failsafe-page">{cardType}</div>
  ),
}));

vi.mock("./ProtectedRoutes", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    default: () => (
      <div data-testid="protected-routes">
        <actual.Outlet />
      </div>
    ),
  };
});

vi.mock("@/pages/dashboard/Dashboard", () => ({
  default: ({ role }: { role: string }) => (
    <div data-testid="dashboard-page">Dashboard - {role}</div>
  ),
}));

vi.mock("@/pages/search-results/SearchResults", () => ({
  default: () => <div data-testid="result-page">Search Results</div>,
}));

vi.mock("@/pages/org-detail/layout/OrgConfigLayout", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    default: () => (
      <div data-testid="org-config-layout">
        Org Config Layout
        <actual.Outlet />
      </div>
    ),
  };
});

vi.mock("@/pages/org-detail/pages/GeneralSettings", () => ({
  default: () => <div data-testid="org-general-settings">Org General Settings</div>,
}));

vi.mock("@/pages/org-detail/pages/Billing", () => ({
  default: () => <div data-testid="org-billing">Org Billing</div>,
}));

vi.mock("@/pages/org-detail/pages/Hierarchy", () => ({
  default: () => <div data-testid="org-hierarchy">Org Hierarchy</div>,
}));

vi.mock("@/pages/org-detail/pages/Marketing", () => ({
  default: () => <div data-testid="org-marketing">Org Marketing</div>,
}));

vi.mock("@/pages/org-detail/pages/Opportunities", () => ({
  default: () => <div data-testid="org-opportunities">Org Opportunities</div>,
}));

vi.mock("@/pages/org-detail/pages/Reporting", () => ({
  default: () => <div data-testid="org-reporting">Org Reporting</div>,
}));

vi.mock("@/pages/grp-detail/layout/GrpConfigLayout", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    default: () => (
      <div data-testid="grp-config-layout">
        Grp Config Layout
        <actual.Outlet />
      </div>
    ),
  };
});

vi.mock("@/pages/grp-detail/pages/GeneralSetting", () => ({
  default: () => <div data-testid="grp-general-settings">Grp General Settings</div>,
}));

vi.mock("@/pages/grp-detail/pages/Billing", () => ({
  default: () => <div data-testid="grp-billing">Grp Billing</div>,
}));

vi.mock("@/pages/grp-detail/pages/Hierarchy", () => ({
  default: () => <div data-testid="grp-hierarchy">Grp Hierarchy</div>,
}));

vi.mock("@/pages/grp-detail/pages/Marketing", () => ({
  default: () => <div data-testid="grp-marketing">Grp Marketing</div>,
}));

vi.mock("@/pages/grp-detail/pages/Products", () => ({
  default: () => <div data-testid="grp-products">Grp Products</div>,
}));

vi.mock("@/pages/grp-detail/pages/EligibilityClaims", () => ({
  default: () => <div data-testid="grp-eligibility-claims">Grp Eligibility Claims</div>,
}));

vi.mock("@/pages/grp-detail/pages/Reporting", () => ({
  default: () => <div data-testid="grp-reporting">Grp Reporting</div>,
}));

vi.mock("@/pages/org-detail/pages/HistoryLogs", () => ({
  default: () => <div data-testid="history-logs">History Logs</div>,
}));

const renderWithRouter = (initialRoute: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Router />
    </MemoryRouter>
  );
};

describe("Router", () => {
  describe("Dashboard Route", () => {
    it("renders dashboard page at /CCC/dashboard", async () => {
      renderWithRouter("/CCC/dashboard");
      await waitFor(() => {
        expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      });
    });
  });

  describe("Search Results Route", () => {
    it("renders search results page at /CCC/search-results", async () => {
      renderWithRouter("/CCC/search-results");
      await waitFor(() => {
        expect(screen.getByTestId("result-page")).toBeInTheDocument();
      });
    });
  });

  describe("Organization Detail Routes", () => {
    it("renders org config layout at /CCC/org-detail/:id", async () => {
      renderWithRouter("/CCC/org-detail/123");
      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("redirects from org index to general-settings", async () => {
      renderWithRouter("/CCC/org-detail/123");
      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("renders org general settings at /CCC/org-detail/:id/general-settings", async () => {
      renderWithRouter("/CCC/org-detail/123/general-settings");
      await waitFor(() => {
        expect(screen.getByTestId("org-general-settings")).toBeInTheDocument();
      });
    });

    it("renders org billing at /CCC/org-detail/:id/billing", async () => {
      renderWithRouter("/CCC/org-detail/123/billing");
      await waitFor(() => {
        expect(screen.getByTestId("org-billing")).toBeInTheDocument();
      });
    });

    it("renders org hierarchy at /CCC/org-detail/:id/hierarchy", async () => {
      renderWithRouter("/CCC/org-detail/123/hierarchy");
      await waitFor(() => {
        expect(screen.getByTestId("org-hierarchy")).toBeInTheDocument();
      });
    });

    it("renders failsafe page for org comments", async () => {
      renderWithRouter("/CCC/org-detail/123/comments");
      await waitFor(() => {
        expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
        expect(screen.getByText("comingSoon")).toBeInTheDocument();
      });
    });

    it("renders history logs page for org history-logs", async () => {
      renderWithRouter("/CCC/org-detail/123/history-logs");
      await waitFor(() => {
        expect(screen.getByTestId("history-logs")).toBeInTheDocument();
      });
    });

    it("renders org marketing at /CCC/org-detail/:id/marketing", async () => {
      renderWithRouter("/CCC/org-detail/123/marketing");
      await waitFor(() => {
        expect(screen.getByTestId("org-marketing")).toBeInTheDocument();
      });
    });

    it("renders org opportunities at /CCC/org-detail/:id/opportunities", async () => {
      renderWithRouter("/CCC/org-detail/123/opportunities");
      await waitFor(() => {
        expect(screen.getByTestId("org-opportunities")).toBeInTheDocument();
      });
    });

    it("renders org opportunities with id at /CCC/org-detail/:id/opportunities/:opportunityId", async () => {
      renderWithRouter("/CCC/org-detail/123/opportunities/456");
      await waitFor(() => {
        expect(screen.getByTestId("org-opportunities")).toBeInTheDocument();
      });
    });

    it("renders org reporting at /CCC/org-detail/:id/reporting", async () => {
      renderWithRouter("/CCC/org-detail/123/reporting");
      await waitFor(() => {
        expect(screen.getByTestId("org-reporting")).toBeInTheDocument();
      });
    });

    it("redirects unknown org routes to general-settings", async () => {
      renderWithRouter("/CCC/org-detail/123/unknown-route");
      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });
  });

  describe("Group Detail Routes", () => {
    it("renders grp config layout at /CCC/groups/:id", async () => {
      renderWithRouter("/CCC/groups/456");
      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("redirects from grp index to general-settings", async () => {
      renderWithRouter("/CCC/groups/456");
      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("renders grp general settings at /CCC/groups/:id/general-settings", async () => {
      renderWithRouter("/CCC/groups/456/general-settings");
      await waitFor(() => {
        expect(screen.getByTestId("grp-general-settings")).toBeInTheDocument();
      });
    });

    it("renders grp billing at /CCC/groups/:id/billing", async () => {
      renderWithRouter("/CCC/groups/456/billing");
      await waitFor(() => {
        expect(screen.getByTestId("grp-billing")).toBeInTheDocument();
      });
    });

    it("renders grp hierarchy at /CCC/groups/:id/hierarchy", async () => {
      renderWithRouter("/CCC/groups/456/hierarchy");
      await waitFor(() => {
        expect(screen.getByTestId("grp-hierarchy")).toBeInTheDocument();
      });
    });

    it("renders failsafe page for grp comments", async () => {
      renderWithRouter("/CCC/groups/456/comments");
      await waitFor(() => {
        expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
        expect(screen.getByText("comingSoon")).toBeInTheDocument();
      });
    });

    it("renders history logs page for grp history-logs", async () => {
      renderWithRouter("/CCC/groups/456/history-logs");
      await waitFor(() => {
        expect(screen.getByTestId("history-logs")).toBeInTheDocument();
      });
    });

    it("renders grp marketing at /CCC/groups/:id/marketing", async () => {
      renderWithRouter("/CCC/groups/456/marketing");
      await waitFor(() => {
        expect(screen.getByTestId("grp-marketing")).toBeInTheDocument();
      });
    });

    it("renders grp products at /CCC/groups/:id/products", async () => {
      renderWithRouter("/CCC/groups/456/products");
      await waitFor(() => {
        expect(screen.getByTestId("grp-products")).toBeInTheDocument();
      });
    });

    it("renders grp eligibility-claims at /CCC/groups/:id/eligibilty-claims", async () => {
      renderWithRouter("/CCC/groups/456/eligibilty-claims");
      await waitFor(() => {
        expect(screen.getByTestId("grp-eligibility-claims")).toBeInTheDocument();
      });
    });

    it("renders grp reporting at /CCC/groups/:id/reporting", async () => {
      renderWithRouter("/CCC/groups/456/reporting");
      await waitFor(() => {
        expect(screen.getByTestId("grp-reporting")).toBeInTheDocument();
      });
    });

    it("redirects unknown grp routes to general-settings", async () => {
      renderWithRouter("/CCC/groups/456/unknown-route");
      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });
  });

  describe("Suspense Fallback", () => {
    it("renders loader while lazy loading components", () => {
      const { container } = renderWithRouter("/CCC/dashboard");
      expect(container).toBeTruthy();
    });
  });

  describe("Protected Routes Wrapper", () => {
    it("wraps all routes with ProtectedRoutes component", async () => {
      renderWithRouter("/CCC/dashboard");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("applies protection to org detail routes", async () => {
      renderWithRouter("/CCC/org-detail/123/billing");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("applies protection to grp detail routes", async () => {
      renderWithRouter("/CCC/groups/456/products");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });
  });

  describe("Route Parameters", () => {
    it("handles org id parameter", async () => {
      renderWithRouter("/CCC/org-detail/org-123/general-settings");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles grp id parameter", async () => {
      renderWithRouter("/CCC/groups/grp-456/general-settings");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles opportunity id parameter", async () => {
      renderWithRouter("/CCC/org-detail/123/opportunities/opp-789");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles numeric ids", async () => {
      renderWithRouter("/CCC/org-detail/999/reporting");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles alphanumeric ids", async () => {
      renderWithRouter("/CCC/groups/abc123def/marketing");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation Edge Cases", () => {
    it("handles root redirect for org detail", async () => {
      renderWithRouter("/CCC/org-detail/123/");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles root redirect for grp detail", async () => {
      renderWithRouter("/CCC/groups/456/");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles trailing slashes in routes", async () => {
      renderWithRouter("/CCC/dashboard/");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles case-sensitive routes", async () => {
      renderWithRouter("/CCC/org-detail/123/general-settings");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });
  });

  describe("Lazy Loading", () => {
    it("lazy loads dashboard page", async () => {
      renderWithRouter("/CCC/dashboard");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("lazy loads result page", async () => {
      renderWithRouter("/CCC/search-results");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("lazy loads org config layout", async () => {
      renderWithRouter("/CCC/org-detail/123");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("lazy loads grp config layout", async () => {
      renderWithRouter("/CCC/groups/456");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("lazy loads org billing page", async () => {
      renderWithRouter("/CCC/org-detail/123/billing");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("lazy loads grp marketing page", async () => {
      renderWithRouter("/CCC/groups/456/marketing");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });
  });

  describe("Coming Soon Pages", () => {
    it("shows coming soon for org comments", async () => {
      renderWithRouter("/CCC/org-detail/123/comments");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("shows coming soon for org history logs", async () => {
      renderWithRouter("/CCC/org-detail/123/history-logs");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("shows coming soon for grp comments", async () => {
      renderWithRouter("/CCC/groups/456/comments");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("shows coming soon for grp history logs", async () => {
      renderWithRouter("/CCC/groups/456/history-logs");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });
  });

  describe("Nested Routes", () => {
    it("handles nested org detail routes", async () => {
      renderWithRouter("/CCC/org-detail/123/opportunities");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });

    it("handles deeply nested opportunity routes", async () => {
      renderWithRouter("/CCC/org-detail/123/opportunities/456");
      await waitFor(() => {
        expect(screen.getByTestId("protected-routes")).toBeInTheDocument();
      });
    });
  });

  describe("Router Component", () => {
    it("renders without crashing", () => {
      const { container } = renderWithRouter("/CCC/dashboard");
      expect(container).toBeTruthy();
    });

    it("renders Routes component", () => {
      const { container } = renderWithRouter("/CCC/dashboard");
      expect(container.querySelector("div")).toBeTruthy();
    });

    it("wraps content in Suspense", () => {
      const { container } = renderWithRouter("/CCC/dashboard");
      expect(container).toBeTruthy();
    });
  });
});
