import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TemplatePage from "./TemplatePage";

vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
  SearchBar: ({ placeholder, value, onChange }: any) => (
    <input aria-label={placeholder} placeholder={placeholder} value={value} onChange={onChange} />
  ),
  FailSafePage: ({ cardType }: any) => <div data-testid="failsafe-page">{cardType}</div>,
  CalendarIcon: () => <span />,
  GroupIcon: () => <span />,
  PencilIcon: () => <span />,
  Modal: ({ show, title, children, onHide }: any) =>
    show ? (
      <div role="dialog" aria-label={typeof title === "string" ? title : "dialog"}>
        <button type="button" onClick={onHide}>
          Close
        </button>
        {children}
      </div>
    ) : null,
  CustomTable: () => <div data-testid="applied-table" />,
  PaginationView: () => <div data-testid="pagination-view" />,
  RoundedLabel: ({ text }: any) => <span>{text}</span>,
  DisplayRow: ({ label, value, format, personMeta }: any) => (
    <div>
      <span>{label}</span>
      <span>{format === "person" ? personMeta?.name : String(value)}</span>
    </div>
  ),
}));

vi.mock("@/assets", () => ({
  DarkPlusIcon: () => <span />,
  OpenIcon: () => <span />,
  RightArrow: () => <span />,
  ArrowLeft: () => <span />,
}));

describe("TemplatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the tabs, search, and create action for the default tab", () => {
    render(<TemplatePage />);

    expect(screen.getByRole("heading", { name: "Templates" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Client Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Organization" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Group" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Find template")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Client Overview template" }),
    ).toBeInTheDocument();
  });

  it("renders each template with its counts and formatted dates", () => {
    render(<TemplatePage />);

    expect(screen.getByRole("button", { name: "Allied Template" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ECM Template" })).toBeInTheDocument();
    expect(screen.getAllByText("Total Client Overviews")).toHaveLength(2);
    expect(screen.getAllByText("Active Client Overviews")).toHaveLength(2);
    expect(screen.getAllByText("Mar 5, 2025")).toHaveLength(2);
    expect(screen.getAllByText("Dec 1, 2025")).toHaveLength(2);
  });

  it("filters the list by the search term", () => {
    render(<TemplatePage />);

    fireEvent.change(screen.getByPlaceholderText("Find template"), {
      target: { value: "ecm" },
    });

    expect(screen.queryByRole("button", { name: "Allied Template" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ECM Template" })).toBeInTheDocument();
  });

  it("shows the empty state when no template matches", () => {
    render(<TemplatePage />);

    fireEvent.change(screen.getByPlaceholderText("Find template"), {
      target: { value: "no such template" },
    });

    expect(screen.getByTestId("failsafe-page")).toHaveTextContent("emptyState");
  });

  it("reports the selected edit action for a template", async () => {
    const onEditAction = vi.fn();
    render(<TemplatePage onEditAction={onEditAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Allied Template" }));
    fireEvent.click(await screen.findByRole("button", { name: "Duplicate template" }));

    expect(onEditAction).toHaveBeenCalledWith(
      "Duplicate template",
      expect.objectContaining({ name: "Allied Template" }),
      "client-overview",
    );
  });

  it("inserts a reset copy after the original when Duplicate is chosen", async () => {
    render(<TemplatePage />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Allied Template" }));
    fireEvent.click(await screen.findByRole("button", { name: "Duplicate template" }));

    const duplicate = screen
      .getByRole("button", { name: "Allied Template (1)" })
      .closest(".template-row") as HTMLElement;
    expect(within(duplicate).getByText("Total Client Overviews")).toBeInTheDocument();
    expect(within(duplicate).getAllByText("0")).toHaveLength(2);
    expect(within(duplicate).getByText("-")).toBeInTheDocument();
    expect(within(duplicate).queryByText("Mar 5, 2025")).not.toBeInTheDocument();

    const names = screen.getAllByRole("button").map((button) => button.textContent);
    expect(names.indexOf("Allied Template")).toBeLessThan(
      names.indexOf("Allied Template (1)"),
    );
  });

  it("duplicates Organization and Group templates with a numbered name", async () => {
    render(<TemplatePage />);

    fireEvent.click(screen.getByRole("tab", { name: "Organization" }));
    const orgPanel = screen.getByRole("tabpanel", { name: "Organization" });
    fireEvent.click(within(orgPanel).getByRole("button", { name: "Edit BCBS NC Template" }));
    fireEvent.click(await screen.findByRole("button", { name: "Duplicate template" }));
    expect(
      within(orgPanel).getByRole("button", { name: "BCBS NC Template (1)" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Group" }));
    const groupPanel = screen.getByRole("tabpanel", { name: "Group" });
    fireEvent.click(within(groupPanel).getByRole("button", { name: "Edit BCBS NC Template" }));
    fireEvent.click(await screen.findByRole("button", { name: "Duplicate template" }));
    expect(
      within(groupPanel).getByRole("button", { name: "BCBS NC Template (1)" }),
    ).toBeInTheDocument();
  });

  it("reports the template opened from its name", () => {
    const onSelectTemplate = vi.fn();
    render(<TemplatePage onSelectTemplate={onSelectTemplate} />);

    fireEvent.click(screen.getByRole("button", { name: "ECM Template" }));

    expect(onSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "ECM Template" }),
      "client-overview",
    );
  });

  it("opens the detail modal from a template heading", () => {
    render(<TemplatePage />);

    fireEvent.click(screen.getByRole("button", { name: "Allied Template" }));

    const dialog = screen.getByRole("dialog", { name: "Allied Template" });
    expect(within(dialog).getByRole("tab", { name: "General settings" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Billing" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Marketing" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Eligibility" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Program Overviews" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Applied Client Overviews" })).toBeInTheDocument();
    expect(within(dialog).getByText("Overview")).toBeInTheDocument();
    expect(within(dialog).getByText("Allied Benefit Systems")).toBeInTheDocument();
    expect(within(dialog).getByText("Has broker")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("tab", { name: "Billing" }));
    expect(
      within(dialog).getByRole("tabpanel", { name: "Billing" }),
    ).toHaveTextContent("comingSoon");
  });

  it("drills into a program overview and back out again", () => {
    render(<TemplatePage />);

    fireEvent.click(screen.getByRole("button", { name: "Allied Template" }));

    const dialog = screen.getByRole("dialog", { name: "Allied Template" });
    fireEvent.click(within(dialog).getByRole("tab", { name: "Program Overviews" }));
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Allied - Diabetes Care" }),
    );

    expect(
      within(dialog).getByRole("heading", { name: "Allied - Diabetes Care" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("tab", { name: "Engagement criteria" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Program Platform Version")).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("tab", { name: "Applied Client Overviews" }),
    ).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Back" }));

    expect(
      within(dialog).getByRole("tab", { name: "Program Overviews" }),
    ).toBeInTheDocument();
  });

  it("closes the detail modal", () => {
    render(<TemplatePage />);

    fireEvent.click(screen.getByRole("button", { name: "Allied Template" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("switches the create action when another tab is selected", () => {
    const onCreateTemplate = vi.fn();
    render(<TemplatePage onCreateTemplate={onCreateTemplate} />);

    fireEvent.click(screen.getByRole("tab", { name: "Organization" }));

    const orgPanel = screen.getByRole("tabpanel", { name: "Organization" });
    expect(within(orgPanel).getByRole("button", { name: "BCBS NC Template" })).toBeInTheDocument();
    expect(
      within(orgPanel).getByRole("button", { name: "BCBS ASO Master Template" }),
    ).toBeInTheDocument();
    expect(within(orgPanel).queryByText("Total Organizations")).not.toBeInTheDocument();
    expect(within(orgPanel).getAllByText("Created on")).toHaveLength(2);
    expect(within(orgPanel).getAllByText("Last used on")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "Create Organization template" }),
    );

    expect(onCreateTemplate).toHaveBeenCalledWith("organization");
  });

  it("renders Group templates with the same date-only metadata as Organization", () => {
    render(<TemplatePage />);

    fireEvent.click(screen.getByRole("tab", { name: "Group" }));

    const groupPanel = screen.getByRole("tabpanel", { name: "Group" });
    expect(
      within(groupPanel).getByRole("button", { name: "Create Group template" }),
    ).toBeInTheDocument();
    expect(within(groupPanel).getByRole("button", { name: "BCBS NC Template" })).toBeInTheDocument();
    expect(within(groupPanel).queryByText("Total Groups")).not.toBeInTheDocument();
  });

  it("shows the empty state, without the toolbar, when a tab has no templates", () => {
    const onCreateTemplate = vi.fn();
    render(
      <TemplatePage
        onCreateTemplate={onCreateTemplate}
        templates={{ "client-overview": [], organization: [], group: [] }}
      />,
    );

    expect(screen.getByText("No Client Overview template")).toBeInTheDocument();
    expect(
      screen.getByText("Once a template is created, it will appear here."),
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Find template")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Create Client Overview template" }),
    );
    expect(onCreateTemplate).toHaveBeenCalledWith("client-overview");
  });

  it("labels the empty state per tab", () => {
    render(<TemplatePage templates={{ "client-overview": [], organization: [], group: [] }} />);

    fireEvent.click(screen.getByRole("tab", { name: "Group" }));

    const groupPanel = screen.getByRole("tabpanel", { name: "Group" });
    expect(within(groupPanel).getByText("No Group template")).toBeInTheDocument();
  });

  it("renders templates supplied by the caller", () => {
    render(
      <TemplatePage
        templates={{
          "client-overview": [],
          organization: [],
          group: [
            {
              id: "grp-1",
              name: "Group Template",
              createdOn: "2026-01-15",
              lastUsedOn: "2026-02-20",
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Group" }));

    const groupPanel = screen.getByRole("tabpanel", { name: "Group" });
    const row = within(groupPanel)
      .getByRole("button", { name: "Group Template" })
      .closest(".template-row");
    expect(within(row as HTMLElement).queryByText("Total Groups")).not.toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("Jan 15, 2026")).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("Feb 20, 2026")).toBeInTheDocument();
  });
});
