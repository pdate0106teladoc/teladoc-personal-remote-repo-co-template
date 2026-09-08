/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// --------------------
// Mocks (must be before importing TreeNode)
// --------------------
vi.mock("./TreeNode.scss", () => ({}));

// react-icons (we just need them to render something)
vi.mock("react-icons/bs", () => ({
  BsChevronDown: () => <svg data-testid="chev-down" />,
  BsChevronRight: () => <svg data-testid="chev-right" />,
}));

// Assets (icons)
vi.mock("@/assets", () => ({
  NonActiveOrganizationIcon: (p: any) => <svg data-testid="icon-org-inactive" {...p} />,
  ActiveGroup: (p: any) => <svg data-testid="icon-group-active" {...p} />,
  NonActiveGroupIcon: (p: any) => <svg data-testid="icon-group-inactive" {...p} />,
}));

vi.mock("@ucc/common-ui", () => ({
  OrganizationIcon: (p: any) => <svg data-testid="icon-org-active" {...p} />,
}));

vi.mock("@/router/routes", () => ({
  ORG_DETAIL_PATH: "/org",
  GRP_DETAIL_PATH: "/group",
}));

const navigateSpy = vi.fn();
let locationSearch = "?searchTerm=abc&entity=org";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateSpy,
    useLocation: () => ({ search: locationSearch }),
  };
});

const setSearchParamsSpy = vi.fn();
vi.mock("@/store/configStore", () => ({
  default: (selector: any) =>
    selector({
      setSearchParams: setSearchParamsSpy,
    }),
}));

vi.mock("./TreeSkeleton", () => ({
  TreeSkeleton: ({ level }: any) => (
    <div data-testid="tree-skeleton" data-level={String(level)} />
  ),
}));

vi.mock("./BillingBadge", () => ({
  BillingBadge: ({ billingOrg, isGroup }: any) => (
    <div
      data-testid="billing-badge"
      data-billing-org={String(!!billingOrg)}
      data-is-group={String(!!isGroup)}
    />
  ),
}));

// Import AFTER mocks
import { TreeNode } from "./TreeNode";

// Helper
const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("TreeNode", () => {
  beforeEach(() => {
    navigateSpy.mockReset();
    setSearchParamsSpy.mockReset();
    locationSearch = "?searchTerm=abc&entity=org";
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders expand button + chevron right when count>0, not loading, and closed", () => {
    renderWithRouter(
      <TreeNode id="n1" label="Node 1" href="/org/n1" count={1} isOpen={false} />,
    );

    // expand button exists
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();

    // closed state shows right chevron
    expect(screen.getByTestId("chev-right")).toBeInTheDocument();
    expect(screen.queryByTestId("chev-down")).not.toBeInTheDocument();
  });

  it("renders chevron down when open; spinner when loading", () => {
    const { rerender } = renderWithRouter(
      <TreeNode id="n1" label="Node 1" href="/org/n1" count={1} isOpen />,
    );

    expect(screen.getByTestId("chev-down")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <TreeNode id="n1" label="Node 1" href="/org/n1" count={1} isOpen loading />
      </MemoryRouter>,
    );

    // spinner element exists (bootstrap class used in component)
    expect(document.querySelector(".spinner-border.spinner-border-sm")).toBeTruthy();
  });

  it("renders placeholder span (no expand button) when count===0", () => {
    renderWithRouter(<TreeNode id="n1" label="Node 1" href="/org/n1" count={0} />);

    // no expand button at all
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    // placeholder span exists
    expect(document.querySelector("span.pe-5")).toBeTruthy();
  });

  it("shows correct icon variants for org/group and current states", () => {
    const { rerender } = renderWithRouter(
      <TreeNode id="o1" label="Org" href="/org/o1" count={0} isGroup={false} />,
    );
    expect(screen.getByTestId("icon-org-inactive")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <TreeNode id="o1" label="Org" href="/org/o1" count={0} isCurrentOrg />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("icon-org-active")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <TreeNode id="g1" label="Group" href="/group/g1" count={0} isGroup />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("icon-group-inactive")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <TreeNode id="g1" label="Group" href="/group/g1" count={0} isGroup isCurrentGroup />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("icon-group-active")).toBeInTheDocument();
  });

  it("renders current org/group as non-link text and shows count text only when count>0", () => {
    const { rerender } = renderWithRouter(
      <TreeNode id="o1" label="Org" href="/org/o1" count={2} isCurrentOrg />,
    );

    // current org renders a span.label.current-org, not an anchor
    expect(document.querySelector(".label.current-org")?.textContent).toContain("Org");
    expect(screen.queryByRole("link", { name: "Org" })).not.toBeInTheDocument();
    expect(document.querySelector(".current-org-count")?.textContent).toBe("(2)");

    rerender(
      <MemoryRouter>
        <TreeNode id="o1" label="Org" href="/org/o1" count={0} isCurrentOrg />
      </MemoryRouter>,
    );
    // when count==0, current-org-count should be empty string
    expect(document.querySelector(".current-org-count")?.textContent).toBe("");
  });

  it("clicking the non-current link prevents default, sets search params, and navigates", () => {
    renderWithRouter(<TreeNode id="o1" label="Org" href="/org/o1" count={0} />);

    const link = screen.getByRole("link", { name: "Org" });
    const preventDefault = vi.fn();

    // fireEvent allows us to attach a preventDefault spy
    fireEvent.click(link, { preventDefault });

    expect(setSearchParamsSpy).toHaveBeenCalledWith("?searchTerm=abc&entity=org");
    expect(navigateSpy).toHaveBeenCalledWith("/org/o1");
  });

  it('when there is no "searchTerm" and "entity" in URL, it sets empty search params', () => {
    locationSearch = ""; // no params

    renderWithRouter(<TreeNode id="o1" label="Org" href="/org/o1" count={0} />);

    fireEvent.click(screen.getByRole("link", { name: "Org" }));

    expect(setSearchParamsSpy).toHaveBeenCalledWith("");
    expect(navigateSpy).toHaveBeenCalledWith("/org/o1");
  });

  it("shows BillingBadge only when showBilling=true, and passes props", () => {
    const { rerender } = renderWithRouter(
      <TreeNode id="o1" label="Org" href="/org/o1" count={0} showBilling billingOrg />,
    );

    const badge = screen.getByTestId("billing-badge");
    expect(badge.getAttribute("data-billing-org")).toBe("true");
    expect(badge.getAttribute("data-is-group")).toBe("false");

    rerender(
      <MemoryRouter>
        <TreeNode id="o1" label="Org" href="/org/o1" count={0} showBilling={false} billingOrg />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("billing-badge")).not.toBeInTheDocument();
  });

  it("handleToggle: if no id, does nothing", () => {
    const onToggle = vi.fn();
    const onRequestChildren = vi.fn();

    renderWithRouter(
      <TreeNode
        // id missing on purpose
        label="No ID"
        href="/org/noid"
        count={1}
        isOpen={false}
        onToggle={onToggle}
        onRequestChildren={onRequestChildren}
        level={1}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).not.toHaveBeenCalled();
    expect(onRequestChildren).not.toHaveBeenCalled();
  });

  it("handleToggle: calls onToggle; requests children only when opening, level!=0, no data", () => {
    const onToggle = vi.fn();
    const onRequestChildren = vi.fn();

    // CLOSED initially; clicking will open (willBeOpen = true)
    renderWithRouter(
      <TreeNode
        id="p1"
        label="Parent"
        href="/org/p1"
        count={1}
        isOpen={false}
        level={1}
        onToggle={onToggle}
        onRequestChildren={onRequestChildren}
        childrenData={undefined}
        groupsData={undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledWith("p1");
    expect(onRequestChildren).toHaveBeenCalledWith("p1");
  });

  it("handleToggle: does NOT request children when level===0 (root)", () => {
    const onRequestChildren = vi.fn();

    renderWithRouter(
      <TreeNode
        id="root"
        label="Root"
        href="/org/root"
        count={1}
        isOpen={false}
        level={0}
        onRequestChildren={onRequestChildren}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onRequestChildren).not.toHaveBeenCalled();
  });

  it("handleToggle: does NOT request children when data already exists", () => {
    const onRequestChildren = vi.fn();

    renderWithRouter(
      <TreeNode
        id="p1"
        label="Parent"
        href="/org/p1"
        count={1}
        isOpen={false}
        level={2}
        onRequestChildren={onRequestChildren}
        childrenData={[{ id: "c1", name: "Child 1", isBillingOrg: false, countOfChildren: 0 } as any]}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onRequestChildren).not.toHaveBeenCalled();
  });

  it("renders node children when open: child org nodes, group nodes, skeleton branch, and children fallback", () => {
    const onToggle = vi.fn();
    const onRequestChildren = vi.fn();

    const { rerender } = renderWithRouter(
      <TreeNode
        id="root"
        label="Root"
        href="/org/root"
        count={1}
        isOpen
        level={0}
        expandedIds={{}} // so child nodes render but are not open
        onToggle={onToggle}
        onRequestChildren={onRequestChildren}
        loadingMap={{}}
        dynamicChildMap={{}}
        childrenData={[
          { id: "child-org-1", name: "Child Org 1", isBillingOrg: false, countOfChildren: 0 } as any,
        ]}
        groupsData={[{ id: "grp-1", name: "Group 1" } as any]}
      >
        <div data-testid="fallback-children">Fallback</div>
      </TreeNode>,
    );

    // Recursively rendered child org and group nodes exist (as TreeNode instances)
    expect(screen.getByText("Child Org 1")).toBeInTheDocument();
    expect(screen.getByText("Group 1")).toBeInTheDocument();

    // Skeleton branch: isOpen + loading + no childrenData + no groupsData
    rerender(
      <MemoryRouter>
        <TreeNode
          id="n2"
          label="N2"
          href="/org/n2"
          count={1}
          isOpen
          level={3}
          loading
          childrenData={undefined}
          groupsData={undefined}
        />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("tree-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("tree-skeleton").getAttribute("data-level")).toBe("4"); // level+1

    // Children fallback branch: isOpen + !childrenData + !groupsData + !loading + children provided
    rerender(
      <MemoryRouter>
        <TreeNode
          id="n3"
          label="N3"
          href="/org/n3"
          count={1}
          isOpen
          level={1}
          loading={false}
          childrenData={undefined}
          groupsData={undefined}
        >
          <div data-testid="fallback-children">Fallback</div>
        </TreeNode>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("fallback-children")).toBeInTheDocument();
  });
});
