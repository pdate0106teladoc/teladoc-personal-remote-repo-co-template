import { render, screen, fireEvent } from "@testing-library/react";
import { HierarchyTree } from "./HierarchyTree";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useNavigate } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@ucc/common-ui", () => ({
  GroupIcon: () => <div data-testid="group-icon">Group Icon</div>,
  OrganizationIcon: () => (
    <div data-testid="organization-icon">Organization Icon</div>
  ),
  SuccessIcon: ({ className }: { className?: string }) =>
    className === "svg-grey" ? (
      <img alt="Incorrect" src="incorrect-icon.svg" />
    ) : (
      <img alt="correct" src="correct-icon.svg" />
    ),
}));

describe("HierarchyTree Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  const mockData = [
    {
      id: 1,
      name: "Root Org",
      type: "organization",
      parentId: null,
      billingOrganization: true,
    },
    {
      id: 2,
      name: "Child Org 1",
      type: "organization",
      parentId: 1,
      billingOrganization: false,
    },
    {
      id: 3,
      name: "Child Org 2",
      type: "organization",
      parentId: 1,
      billingOrganization: true,
    },
    {
      id: 4,
      name: "Group 1",
      type: "group",
      parentId: 2,
    },
  ];

  it("renders the hierarchy tree container", () => {
    render(<HierarchyTree data={mockData} />);
    expect(screen.getByText("Organization/Group Name")).toBeInTheDocument();
  });

  it("renders the root node", () => {
    render(<HierarchyTree data={mockData} />);
    expect(screen.getByText("Root Org")).toBeInTheDocument();
  });

  it("renders child nodes", () => {
    render(<HierarchyTree data={mockData} />);
    expect(screen.getByText("Child Org 1")).toBeInTheDocument();
    expect(screen.getByText("Child Org 2")).toBeInTheDocument();
  });

  it("renders group nodes", () => {
    render(<HierarchyTree data={mockData} />);
    expect(screen.getByText("Group 1")).toBeInTheDocument();
    expect(screen.getByTestId("group-icon")).toBeInTheDocument();
  });

  it("renders the billing column when `displayBillingOrg` is true", () => {
    render(<HierarchyTree data={mockData} displayBillingOrg={true} />);
    expect(screen.getByText("Billing Organization?")).toBeInTheDocument();
    expect(screen.getAllByAltText("correct")).toHaveLength(2); // Root Org and Child Org 2
    expect(screen.getAllByAltText("Incorrect")).toHaveLength(2); // Child Org 1
  });

  it("does not render the billing column when `displayBillingOrg` is false", () => {
    render(<HierarchyTree data={mockData} displayBillingOrg={false} />);
    expect(screen.queryByText("Billing Organization?")).not.toBeInTheDocument();
  });

  it("navigates to the correct URL when an organization is clicked", () => {
    render(<HierarchyTree data={mockData} />);
    const orgLink = screen.getByText("Root Org");
    fireEvent.click(orgLink);
    expect(mockNavigate).toHaveBeenCalledWith("/CCC/org-detail/1");
  });

  it("navigates to the correct URL when a group is clicked", () => {
    render(<HierarchyTree data={mockData} />);
    const groupLink = screen.getByText("Group 1");
    fireEvent.click(groupLink);
    expect(mockNavigate).toHaveBeenCalledWith("/CCC/groups/4");
  });

  it("toggles the visibility of child nodes when the expand/collapse button is clicked", () => {
    render(<HierarchyTree data={mockData} />);
    const toggleButton = screen.getAllByRole("button", { name: "Collapse" })[0];
    expect(screen.getByText("Child Org 1")).toBeInTheDocument();
    fireEvent.click(toggleButton); // Collapse
    expect(screen.queryByText("Child Org 1")).not.toBeInTheDocument();
    fireEvent.click(toggleButton); // Expand
    expect(screen.getByText("Child Org 1")).toBeInTheDocument();
  });

  it("renders a message when no hierarchy data is found", () => {
    render(<HierarchyTree data={[]} />);
    expect(screen.getByText("No hierarchy data found.")).toBeInTheDocument();
  });
});
