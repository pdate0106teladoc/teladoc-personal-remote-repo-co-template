import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

// --------------------
// Mocks (must be before import of OrgTree)
// --------------------

vi.mock("./OrgTree.scss", () => ({}));

const apiGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    get: (...args: any[]) => apiGet(...args),
  },
}));

const toastSpy = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  showCustomToast: (args: any) => toastSpy(args),
}));

vi.mock("@/router/routes", () => ({
  ORG_DETAIL_PATH: "/org",
  GRP_DETAIL_PATH: "/group",
}));

// Partial mock constants: preserve other exports if needed, but define what OrgTree uses.
vi.mock("@/constants", async () => {
  const actual = await vi.importActual<any>("@/constants").catch(() => ({}));
  return {
    ...actual,
    API_ENDPOINTS: {
      ...(actual?.API_ENDPOINTS ?? {}),
      organization: "/organization",
      children: "/children",
    },
    ERROR_MESSAGES: {
      ...(actual?.ERROR_MESSAGES ?? {}),
      SOMETHINGS_WRONG: "Something went wrong",
    },
    ToastType: {
      ...(actual?.ToastType ?? {}),
      Error: "Error",
    },
  };
});

/**
 * TreeNode mock:
 * - Renders a container we can query by id
 * - Exposes key props via data-* attrs
 * - Provides buttons to invoke onToggle and onRequestChildren
 */
vi.mock("./TreeNode", () => {
  return {
    TreeNode: (props: any) => {
      const {
        id,
        label,
        href,
        level,
        isOpen,
        isGroup,
        isCurrentOrg,
        isCurrentGroup,
        showBilling,
        billingOrg,
        count,
        loading,
        childrenData,
        groupsData,
        onToggle,
        onRequestChildren,
        children,
      } = props;

      return (
        <div
          data-testid={`treenode-${id}`}
          data-label={label}
          data-href={href}
          data-level={String(level ?? 0)}
          data-open={String(!!isOpen)}
          data-group={String(!!isGroup)}
          data-current-org={String(!!isCurrentOrg)}
          data-current-group={String(!!isCurrentGroup)}
          data-show-billing={String(!!showBilling)}
          data-billing-org={String(!!billingOrg)}
          data-count={String(count ?? "")}
          data-loading={String(!!loading)}
          data-children-len={String(Array.isArray(childrenData) ? childrenData.length : -1)}
          data-groups-len={String(Array.isArray(groupsData) ? groupsData.length : -1)}
        >
          <button
            type="button"
            aria-label={`toggle-${id}`}
            onClick={() => onToggle?.(id)}
          >
            toggle
          </button>

          <button
            type="button"
            aria-label={`request-children-${id}`}
            onClick={() => onRequestChildren?.(id)}
          >
            request
          </button>

          {/* Button to test "no orgId" early return branch */}
          <button
            type="button"
            aria-label={`request-children-undefined-${id}`}
            onClick={() => onRequestChildren?.(undefined)}
          >
            request-undefined
          </button>

          <div data-testid={`treenode-children-slot-${id}`}>{children}</div>
        </div>
      );
    },
  };
});

// Import AFTER mocks
import { OrgTree } from "./OrgTree";

type AnyOrg = any;

function makeData(overrides?: Partial<AnyOrg>) {
  return {
    parents: [],
    org: { id: "org-root", name: "Root Org", isBillingOrg: true, countOfChildren: 2 },
    children: [
      { id: "org-child-1", name: "Child 1", isBillingOrg: false, countOfChildren: 0 },
    ],
    groups: [{ id: "grp-1", name: "Group 1" }],
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("OrgTree", () => {
  beforeEach(() => {
    apiGet.mockReset();
    toastSpy.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders header but no tree when org is missing/empty (renderTree early return)", () => {
    render(
      <OrgTree
        data={makeData({
          org: {}, // triggers: if (!org || Object.keys(org).length === 0) return null
        })}
      />,
    );

    expect(screen.getByText("Organization/Group name")).toBeInTheDocument();
    expect(screen.getByText("Billing organization?")).toBeInTheDocument();
  });

  it("renders parents chain + root org + children + groups; toggles expansion; billing column can be hidden", () => {
    const data = makeData({
      parents: [
        { id: "p1", name: "Parent 1", isBillingOrg: false, countOfChildren: 9 },
        { id: "p2", name: "Parent 2", isBillingOrg: true, countOfChildren: 3 },
      ],
    });

    const { container } = render(
      <OrgTree
        data={data}
        showBillingColumn={false}
        currentOrgId="org-root"
        currentGroupId="grp-1"
      />,
    );

    // container class branch: no-billing-column present
    expect(container.querySelector(".org-tree-container")?.className).toContain("no-billing-column");

    // header second column hidden when showBillingColumn=false
    expect(screen.getByText("Organization/Group name")).toBeInTheDocument();
    expect(screen.queryByText("Billing organization?")).not.toBeInTheDocument();

    // Initial expansion logic: org + all parents expanded
    expect(screen.getByTestId("treenode-p1").getAttribute("data-open")).toBe("true");
    expect(screen.getByTestId("treenode-p2").getAttribute("data-open")).toBe("true");
    expect(screen.getByTestId("treenode-org-root").getAttribute("data-open")).toBe("true");

    // Current markers
    expect(screen.getByTestId("treenode-org-root").getAttribute("data-current-org")).toBe("true");
    expect(screen.getByTestId("treenode-grp-1").getAttribute("data-current-group")).toBe("true");

    // Children + group exist (from initial props)
    expect(screen.getByTestId("treenode-org-child-1")).toBeInTheDocument();
    expect(screen.getByTestId("treenode-grp-1")).toBeInTheDocument();

    // Toggle a parent to cover toggleExpand branch
    fireEvent.click(screen.getByRole("button", { name: "toggle-p1" }));
    expect(screen.getByTestId("treenode-p1").getAttribute("data-open")).toBe("false");
  });

  it("fetchChildrenForOrg: no orgId (early return) and cache hit (early return)", async () => {
    const data = makeData();

    render(<OrgTree data={data} />);

    // no orgId early return (calls onRequestChildren with undefined)
    fireEvent.click(
      screen.getByRole("button", { name: "request-children-undefined-org-root" }),
    );
    expect(apiGet).not.toHaveBeenCalled();

    // success fetch once, then cache hit prevents second fetch
    apiGet.mockResolvedValueOnce({
      data: [
        {
          children: [{ id: "org-new-1", name: "New Child", isBillingOrg: false, countOfChildren: 0 }],
          groups: [{ id: "grp-new-1", name: "New Group" }],
        },
      ],
    });

    fireEvent.click(screen.getByRole("button", { name: "request-children-org-root" }));
    await waitFor(() => {
      expect(apiGet).toHaveBeenCalledTimes(1);
    });

    // New nodes rendered from dynamicChildMap
    expect(screen.getByTestId("treenode-org-new-1")).toBeInTheDocument();
    expect(screen.getByTestId("treenode-grp-new-1")).toBeInTheDocument();

    // Cache hit: request again should not call api.get again
    fireEvent.click(screen.getByRole("button", { name: "request-children-org-root" }));
    expect(apiGet).toHaveBeenCalledTimes(1);
  });

  it("fetchChildrenForOrg: sets loading true during request, populates children/groups on success", async () => {
    const data = makeData();
    const d = deferred<any>();

    apiGet.mockReturnValueOnce(d.promise);

    render(<OrgTree data={data} />);

    // Start request
    fireEvent.click(screen.getByRole("button", { name: "request-children-org-root" }));

    // loading should flip true quickly
    await waitFor(() => {
      expect(screen.getByTestId("treenode-org-root").getAttribute("data-loading")).toBe("true");
    });

    // Resolve request
    d.resolve({
      data: [
        {
          children: [{ id: "org-fetched-1", name: "Fetched Child", isBillingOrg: true, countOfChildren: 0 }],
          groups: [{ id: "grp-fetched-1", name: "Fetched Group" }],
        },
      ],
    });

    // loading should flip back false and nodes appear
    await waitFor(() => {
      expect(screen.getByTestId("treenode-org-root").getAttribute("data-loading")).toBe("false");
      expect(screen.getByTestId("treenode-org-fetched-1")).toBeInTheDocument();
      expect(screen.getByTestId("treenode-grp-fetched-1")).toBeInTheDocument();
    });
  });

  it("fetchChildrenForOrg: error path shows toast and clears loading", async () => {
    const data = makeData();
    apiGet.mockRejectedValueOnce(new Error("boom"));

    render(<OrgTree data={data} />);

    fireEvent.click(screen.getByRole("button", { name: "request-children-org-root" }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });

    const toastArg = toastSpy.mock.calls[0][0];
    expect(toastArg).toMatchObject({
      type: "Error",
      title: "Failed",
      message: "Something went wrong",
    });

    await waitFor(() => {
      expect(screen.getByTestId("treenode-org-root").getAttribute("data-loading")).toBe("false");
    });
  });
});
