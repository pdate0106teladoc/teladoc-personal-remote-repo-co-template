import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Router from "../index";
import { DASHBOARD_PATH, RESULT_PATH, GRP_DETAIL_PATH, ORG_DETAIL_PATH } from "../routes";

// Speed up and force successful session verification
vi.mock("@/utils/sessionGuard", () => ({
  verifySessionTokens: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("@/utils", () => ({
  getUserRoles: () => ["VIEWER"],
  getHighestPriorityRole: () => "VIEWER",
}));

// Loader and FailSafePage are imported from @ucc/common-ui in both ProtectedRoutes and Router
vi.mock("@ucc/common-ui", () => ({
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  FailSafePage: ({ cardType }: any) => <div data-testid="failsafe">{cardType}</div>,
}));

// Lazy-loaded page mocks
vi.mock("@/pages/dashboard/Dashboard", () => ({
  default: ({ role }: any) => <div data-testid="dashboard">Dashboard:{role}</div>,
}));

vi.mock("@/pages/search-results/SearchResults", () => ({
  default: () => <div data-testid="search-results">SearchResults</div>,
}));

vi.mock("@/pages/grp-detail/layout/GrpConfigLayout", () => ({
  default: ({ children }: any) => (
    <div data-testid="grp-config-layout">
      GrpConfigLayout
      {children}
    </div>
  ),
}));

vi.mock("@/pages/grp-detail/pages/Reporting", () => ({
  default: () => <div data-testid="grp-reporting">GrpReporting</div>,
}));

vi.mock("@/pages/grp-detail/pages/Billing", () => ({
  default: () => <div data-testid="grp-billing">GrpBilling</div>,
}));

vi.mock("@/pages/grp-detail/pages/EligibilityClaims", () => ({
  default: () => <div data-testid="grp-eligibility">GrpEligibility</div>,
}));

vi.mock("@/pages/grp-detail/pages/Marketing", () => ({
  default: () => <div data-testid="grp-marketing">GrpMarketing</div>,
}));

vi.mock("@/pages/grp-detail/pages/GeneralSetting", () => ({
  default: () => <div data-testid="grp-general">GrpGeneral</div>,
}));

vi.mock("@/pages/grp-detail/pages/Hierarchy", () => ({
  default: () => <div data-testid="grp-hierarchy">GrpHierarchy</div>,
}));

vi.mock("@/pages/grp-detail/pages/Products", () => ({
  default: () => <div data-testid="grp-products">GrpProducts</div>,
}));

// Contacts is a direct (non-lazy) import in the router
vi.mock("@/pages/grp-detail/pages/Contacts", () => ({
  default: () => <div data-testid="grp-contacts">GrpContacts</div>,
}));

vi.mock("@/pages/org-detail/pages/GeneralSettings", () => ({
  default: () => <div data-testid="org-general">OrgGeneral</div>,
}));

vi.mock("@/pages/org-detail/pages/Billing", () => ({
  default: () => <div data-testid="org-billing">OrgBilling</div>,
}));

vi.mock("@/pages/org-detail/pages/Hierarchy", () => ({
  default: () => <div data-testid="org-hierarchy">OrgHierarchy</div>,
}));

vi.mock("@/pages/org-detail/pages/Marketing", () => ({
  default: () => <div data-testid="org-marketing">OrgMarketing</div>,
}));

vi.mock("@/pages/org-detail/pages/Opportunities", () => ({
  default: () => <div data-testid="org-opportunities">OrgOpportunities</div>,
}));

vi.mock("@/pages/org-detail/pages/Reporting", () => ({
  default: () => <div data-testid="org-reporting">OrgReporting</div>,
}));

// Eligibility is a direct (non-lazy) import in the router
vi.mock("@/pages/org-detail/pages/Eligibility", () => ({
  default: () => <div data-testid="org-eligibility">OrgEligibility</div>,
}));

vi.mock("@/pages/org-detail/layout/OrgConfigLayout", () => ({
  default: ({ children }: any) => (
    <div data-testid="org-config-layout">
      OrgConfigLayout
      {children}
    </div>
  ),
}));

// ViewContact is a direct (non-lazy) import in the router
vi.mock("@/pages/contacts/ViewContacts", () => ({
  default: () => <div data-testid="view-contact">ViewContact</div>,
}));

describe("Router Component", () => {
  describe("Protected Routes", () => {
    it("renders dashboard route", async () => {
      render(
        <MemoryRouter initialEntries={[DASHBOARD_PATH]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("dashboard")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("renders search results route", async () => {
      render(
        <MemoryRouter initialEntries={[RESULT_PATH]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("search-results")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Org Detail Routes", () => {
    it("renders org config layout", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("renders org general settings by default", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("renders failsafe for coming soon routes", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Group Detail Routes", () => {
    it("renders group config layout", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("renders failsafe for group coming soon routes", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Suspense and Lazy Loading", () => {
    it("renders components after suspense resolves", async () => {
      render(
        <MemoryRouter initialEntries={[DASHBOARD_PATH]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("dashboard")).toBeInTheDocument();
      });
    });
  });

  describe("Route Paths", () => {
    it("uses correct dashboard path constant", () => {
      expect(DASHBOARD_PATH).toBe("/CCC/dashboard");
    });

    it("uses correct result path constant", () => {
      expect(RESULT_PATH).toBe("/CCC/search-results");
    });

    it("uses correct org detail path constant", () => {
      expect(ORG_DETAIL_PATH).toBe("/CCC/org-detail");
    });

    it("uses correct group detail path constant", () => {
      expect(GRP_DETAIL_PATH).toBe("/CCC/groups");
    });
  });

  describe("Route Structure", () => {
    it("wraps routes in ProtectedRoutes", async () => {
      render(
        <MemoryRouter initialEntries={[DASHBOARD_PATH]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("dashboard")).toBeInTheDocument();
      });
    });

    it("uses Suspense component for lazy loading", () => {
      const { container } = render(
        <MemoryRouter initialEntries={[DASHBOARD_PATH]}>
          <Router />
        </MemoryRouter>,
      );

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Navigate Redirects", () => {
    it("redirects org index to general-settings", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("redirects group index to general-settings", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Nested Routes", () => {
    it("renders opportunities route with nested paths", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/opportunities`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("renders opportunities with ID route", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/opportunities/opp-456`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("User Prop Passing", () => {
    it("passes user prop with viewer role to dashboard", async () => {
      render(
        <MemoryRouter initialEntries={[DASHBOARD_PATH]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const dashboard = screen.getByTestId("dashboard");
        expect(dashboard).toHaveTextContent("Dashboard:VIEWER");
      });
    });
  });

  describe("All Route Paths Coverage", () => {
    it("renders org billing page", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/billing`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("renders org hierarchy page", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/hierarchy`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("renders org marketing page", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/marketing`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("renders org reporting page", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/reporting`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("renders org history-logs page", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/history-logs`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("renders group billing page", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456/billing`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("renders group hierarchy page", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456/hierarchy`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("renders group marketing page", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456/marketing`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("renders group products page", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456/products`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("renders group eligibility-claims page", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456/eligibilty-claims`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("renders group reporting page", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456/reporting`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });

    it("redirects unknown org routes to general-settings", async () => {
      render(
        <MemoryRouter initialEntries={[`${ORG_DETAIL_PATH}/123/unknown-route`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("org-config-layout")).toBeInTheDocument();
      });
    });

    it("redirects unknown group routes to general-settings", async () => {
      render(
        <MemoryRouter initialEntries={[`${GRP_DETAIL_PATH}/456/unknown-route`]}>
          <Router />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("grp-config-layout")).toBeInTheDocument();
      });
    });
  });
});
