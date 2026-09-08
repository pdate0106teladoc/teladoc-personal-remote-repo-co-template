import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, beforeEach } from "vitest";
import { SliderChild } from "../SliderContentGeneralSettings";
import { ORG_DETAIL_PATH } from "@/router/routes";
import { MemoryRouter } from "react-router-dom";
import { SliderChildProps } from "../SliderContentGeneralSettings";

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNavigate = vi.fn();

describe("SliderChild", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders normal fields correctly", () => {
    const fieldsOrder: SliderChildProps["fieldsOrder"] = [
      { key: "name", label: "Name", format: "text" },
      { key: "status", label: "Status", format: "boolean" },
      { key: "lastModifiedBy", label: "Modified By" },
      { key: "relatedGroups", label: "Groups" },
      { key: "relatedOrgs", label: "Orgs" },
    ];


    const data = {
      name: "Test Name",
      status: true,
      lastModifiedBy: "Jane Doe",
      lastModifiedDate: "2024-01-01T12:00:00Z",
      relatedGroups: [],
      relatedOrgs: [],
    };

    render(<SliderChild data={data} fieldsOrder={fieldsOrder} />, { wrapper: MemoryRouter });

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Test Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("displays lastModifiedBy and formatted date", () => {
    const fieldsOrder = [
      { key: "dummy1", label: "Dummy" },
      { key: "dummy2", label: "Dummy" },
      { key: "lastModifiedBy", label: "Modified By" },
      { key: "relatedGroups", label: "Groups" },
      { key: "relatedOrgs", label: "Orgs" },
    ];

    const data = {
      lastModifiedBy: "Admin",
      lastModifiedDate: "2024-05-15T08:30:00Z",
      relatedGroups: [],
      relatedOrgs: [],
    };

    render(<SliderChild data={data} fieldsOrder={fieldsOrder} />, { wrapper: MemoryRouter });

    expect(screen.getByText("Modified By")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText(/May .* at .*/)).toBeInTheDocument();
  });

  it("renders related group and org links and handles click", () => {
    const fieldsOrder = [
      { key: "dummy", label: "Dummy" },
      { key: "lastModifiedBy", label: "Modified By" },
      { key: "relatedGroups", label: "Groups" },
      { key: "relatedOrgs", label: "Organizations" },
    ];

    const data = {
      lastModifiedBy: "Editor",
      lastModifiedDate: "2025-01-01T10:00:00Z",
      relatedGroups: [
        { id: "grp1", name: "Group 1", type: "group" },
        { id: "grp2", name: "Group 2", type: "group" },
      ],
      relatedOrgs: [
        { id: "org1", name: "Org 1", type: "org" },
      ],
    };

    render(<SliderChild data={data} fieldsOrder={fieldsOrder} />, { wrapper: MemoryRouter });

    const groupLink = screen.getByText("Group 1");
    const orgLink = screen.getByText("Org 1");

    fireEvent.click(groupLink);
    expect(mockNavigate).toHaveBeenCalledWith(`${ORG_DETAIL_PATH}/grp1`);

    fireEvent.click(orgLink);
    expect(mockNavigate).toHaveBeenCalledWith(`${ORG_DETAIL_PATH}/org1`);
  });

  it("does not crash with missing data", () => {
    const fieldsOrder: SliderChildProps["fieldsOrder"] = [
      { key: "lastModifiedBy", label: "Modified By" },
    ];

    render(<SliderChild data={null} fieldsOrder={fieldsOrder} />, { wrapper: MemoryRouter });

    expect(screen.getByText("Modified By")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

});
