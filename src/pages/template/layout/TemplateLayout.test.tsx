import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TemplateLayout from "./TemplateLayout";

vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
  SearchBar: ({ placeholder, value, onChange }: any) => (
    <input aria-label={placeholder} placeholder={placeholder} value={value} onChange={onChange} />
  ),
  FailSafePage: ({ cardType }: any) => <div data-testid="failsafe-page">{cardType}</div>,
  CalendarIcon: () => <span />,
  GroupIcon: () => <span />,
  PencilIcon: () => <span />,
  SideModal: ({ show, title, children, onHide }: any) =>
    show ? (
      <div role="dialog" aria-label={typeof title === "string" ? title : "drawer"}>
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
  CustomInput: ({ label, value, onChange, id, name, type, readOnly }: any) => (
    <>
      {label ? <span>{label}</span> : null}
      <input
        id={id}
        name={name}
        type={type}
        aria-label={label}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
      />
    </>
  ),
  CustomTextarea: ({ value, onChange, id, name, rows }: any) => (
    <textarea
      id={id}
      name={name}
      value={value}
      rows={rows}
      onChange={onChange}
    />
  ),
  CustomRadioGroup: ({ value, onChange }: any) => (
    <div>
      <button type="button" aria-pressed={value === true} onClick={() => onChange(true)}>
        Yes
      </button>
      <button type="button" aria-pressed={value === false} onClick={() => onChange(false)}>
        No
      </button>
    </div>
  ),
  CustomDropdown: ({ value, onChange, options, placeholder }: any) => (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options?.map((option: { label: string; value: string }) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/assets", () => ({
  DarkPlusIcon: () => <span />,
  OpenIcon: () => <span />,
  RightArrow: () => <span />,
  ArrowLeft: () => <span />,
  DustbinIcon: () => <span />,
}));

describe("TemplateLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the tabs, search, and create action for the default tab", () => {
    render(<TemplateLayout />);

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
    render(<TemplateLayout />);

    expect(screen.getByRole("button", { name: "Allied Template" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ECM Template" })).toBeInTheDocument();
    expect(screen.getAllByText("Total Client Overviews")).toHaveLength(2);
    expect(screen.getAllByText("Active Client Overviews")).toHaveLength(2);
    expect(screen.getAllByText("Mar 5, 2025")).toHaveLength(2);
    expect(screen.getAllByText("Dec 1, 2025")).toHaveLength(2);
  });

  it("filters the list by the search term", () => {
    render(<TemplateLayout />);

    fireEvent.change(screen.getByPlaceholderText("Find template"), {
      target: { value: "ecm" },
    });

    expect(screen.queryByRole("button", { name: "Allied Template" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ECM Template" })).toBeInTheDocument();
  });

  it("shows the empty state when no template matches", () => {
    render(<TemplateLayout />);

    fireEvent.change(screen.getByPlaceholderText("Find template"), {
      target: { value: "no such template" },
    });

    expect(screen.getByTestId("failsafe-page")).toHaveTextContent("emptyState");
  });

  it("reports the selected edit action for a template", async () => {
    const onEditAction = vi.fn();
    render(<TemplateLayout onEditAction={onEditAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Allied Template" }));
    fireEvent.click(await screen.findByRole("button", { name: "Duplicate template" }));

    expect(onEditAction).toHaveBeenCalledWith(
      "Duplicate template",
      expect.objectContaining({ name: "Allied Template" }),
      "client-overview",
    );
  });

  it("inserts a reset copy after the original when Duplicate is chosen", async () => {
    render(<TemplateLayout />);

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
    render(<TemplateLayout />);

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
    render(<TemplateLayout onSelectTemplate={onSelectTemplate} />);

    fireEvent.click(screen.getByRole("button", { name: "ECM Template" }));

    expect(onSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "ECM Template" }),
      "client-overview",
    );
  });

  it("opens and saves the client overview edit form", async () => {
    render(<TemplateLayout />);

    fireEvent.click(
      screen.getByRole("button", { name: "Edit Allied Template" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit template" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Edit Client Overview template",
    });
    expect(
      within(dialog).getByRole("heading", { name: "Allied Template" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("tab", { name: "General settings" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("tab", { name: "Program Overviews" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText("Account name (LCRM Livongo)"),
    ).toHaveValue("Allied Benefit Systems");
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText("Template name"), {
      target: { value: "Updated Allied Template" },
    });
    fireEvent.change(within(dialog).getByLabelText("Contract path"), {
      target: { value: "Allied" },
    });
    fireEvent.change(within(dialog).getByLabelText("Client Success Manager"), {
      target: { value: "Connor Hudson" },
    });
    fireEvent.change(
      within(dialog).getByLabelText("Client Implementation Manager"),
      { target: { value: "Jane Williams" } },
    );
    fireEvent.change(
      within(dialog).getByLabelText("Registration customizations"),
      { target: { value: "Standard" } },
    );
    fireEvent.change(within(dialog).getByLabelText("Cardio start date"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(within(dialog).getByLabelText("Member support phone"), {
      target: { value: "555-0100" },
    });

    expect(within(dialog).getByRole("button", { name: "Save" })).toBeEnabled();

    fireEvent.click(within(dialog).getByRole("tab", { name: "Billing" }));
    expect(within(dialog).getByText("CCM billing details")).toBeInTheDocument();
    expect(within(dialog).getByText("Contract Details")).toBeInTheDocument();
    expect(within(dialog).getByText("Lapsed User Details")).toBeInTheDocument();
    expect(within(dialog).getByText("Account has SLA?")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Is there a lapsed user clause"),
    ).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Billing partner")).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText("Contract Type"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText("Billing address - CCM"),
    ).toHaveValue("");
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeEnabled();

    fireEvent.click(within(dialog).getByRole("tab", { name: "Marketing" }));
    expect(
      within(dialog).getByText("Marketing Preferences"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Group Overview")).toBeInTheDocument();
    expect(within(dialog).getByText("CCM Logos")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Allowed Communication Methods"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Additional marketing details"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Client allows targeted marketing?"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText("Enrollment marketing customizations"),
    ).toHaveValue("");

    fireEvent.click(within(dialog).getByRole("tab", { name: "Eligibility" }));
    expect(within(dialog).getByText("Eligibility Details")).toBeInTheDocument();
    expect(within(dialog).getByText("CCM Integrations")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Member Support Details" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText("Link to Box folder - PHI Release"),
    ).toHaveValue("");
    expect(within(dialog).getByText("Program Eligibility Flag")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(
      screen.queryByRole("dialog", {
        name: "Edit Client Overview template",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Updated Allied Template" }),
    ).toBeInTheDocument();
  });

  it("edits a program overview from the editor and comes back to the list", async () => {
    render(<TemplateLayout />);

    fireEvent.click(
      screen.getByRole("button", { name: "Edit Allied Template" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit template" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Edit Client Overview template",
    });
    fireEvent.click(
      within(dialog).getByRole("tab", { name: "Program Overviews" }),
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Allied - Diabetes Care" }),
    );

    expect(
      within(dialog).getByRole("heading", {
        name: "Program Overview: Allied - Diabetes Care",
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("tab", { name: "Engagement criteria" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Template name")).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Enrollment Cap"), {
      target: { value: "500" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Back" }));

    expect(
      within(dialog).getByRole("button", { name: "Allied - Diabetes Care" }),
    ).toBeInTheDocument();

    // Re-entering keeps the edit made before going back.
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Allied - Diabetes Care" }),
    );
    expect(within(dialog).getByLabelText("Enrollment Cap")).toHaveValue("500");
  });

  it("does not open the client overview editor for organization templates", async () => {
    render(<TemplateLayout />);

    fireEvent.click(screen.getByRole("tab", { name: "Organization" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Edit BCBS NC Template" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit template" }),
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Edit Client Overview template",
      }),
    ).not.toBeInTheDocument();
  });

  it("opens the detail modal from a template heading", () => {
    render(<TemplateLayout />);

    fireEvent.click(screen.getByRole("button", { name: "Allied Template" }));

    const dialog = screen.getByRole("dialog", { name: "Allied Template" });
    expect(within(dialog).getByRole("tab", { name: "General settings" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Billing" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Marketing" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Eligibility" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Program Overviews" })).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Applied Client Overviews" })).toBeInTheDocument();
    expect(within(dialog).getByText("Overview")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Allied Benefit Systems").length).toBeGreaterThan(0);
    expect(within(dialog).getByText("Has broker")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Group permissions" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Clinical and member support" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Account name (LCRM Livongo)"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Organization")).toBeInTheDocument();
    expect(
      within(dialog).getByText("CCM multifactor authentication"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Clinical model")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("tab", { name: "Billing" }));
    const billingPanel = within(dialog).getByRole("tabpanel", {
      name: "Billing",
    });
    expect(within(billingPanel).getByText("CCM billing details")).toBeInTheDocument();
    expect(within(billingPanel).getByText("Contract Details")).toBeInTheDocument();
    expect(within(billingPanel).getByText("Lapsed User Details")).toBeInTheDocument();
    expect(within(billingPanel).getByText("Billing partner")).toBeInTheDocument();
    expect(within(billingPanel).getByText("Account has SLA?")).toBeInTheDocument();
    expect(
      within(billingPanel).getByText("Is there a lapsed user clause"),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("tab", { name: "Marketing" }));
    const marketingPanel = within(dialog).getByRole("tabpanel", {
      name: "Marketing",
    });
    expect(within(marketingPanel).getByText("Group Overview")).toBeInTheDocument();
    expect(within(marketingPanel).getByText("CCM Logos")).toBeInTheDocument();
    expect(
      within(marketingPanel).getByText("Allowed Communication Methods"),
    ).toBeInTheDocument();
    expect(
      within(marketingPanel).getByText("Marketing Preferences"),
    ).toBeInTheDocument();
    expect(
      within(marketingPanel).getByText("Additional marketing details"),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("tab", { name: "Eligibility" }));
    const eligibilityPanel = within(dialog).getByRole("tabpanel", {
      name: "Eligibility",
    });
    expect(
      within(eligibilityPanel).getByText("Eligibility Details"),
    ).toBeInTheDocument();
    expect(within(eligibilityPanel).getByText("CCM Integrations")).toBeInTheDocument();
    expect(
      within(eligibilityPanel).getByRole("button", {
        name: "Member Support Details",
      }),
    ).toBeInTheDocument();
    expect(
      within(eligibilityPanel).getByText("Program Eligibility Flag"),
    ).toBeInTheDocument();
  });

  it("drills into a program overview and back out again", () => {
    render(<TemplateLayout />);

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
    render(<TemplateLayout />);

    fireEvent.click(screen.getByRole("button", { name: "Allied Template" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("switches the create action when another tab is selected", () => {
    const onCreateTemplate = vi.fn();
    render(<TemplateLayout onCreateTemplate={onCreateTemplate} />);

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
    render(<TemplateLayout />);

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
      <TemplateLayout
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

  it("creates a client overview template from the empty state", () => {
    render(
      <TemplateLayout
        templates={{ "client-overview": [], organization: [], group: [] }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Create Client Overview template" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Create Client Overview template",
    });
    expect(within(dialog).getByLabelText("Template type")).toHaveValue(
      "Client Overview",
    );
    expect(
      within(dialog).getByRole("tab", { name: "General settings" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("tab", { name: "Program Overviews" }),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("Contract path")).toHaveValue("");
    within(dialog)
      .getAllByRole("button", { name: /^(Yes|No)$/ })
      .forEach((option) => expect(option).toHaveAttribute("aria-pressed", "false"));
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText("Template name"), {
      target: { value: "Allied Template" },
    });

    expect(within(dialog).getByRole("button", { name: "Save" })).toBeEnabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(
      screen.queryByRole("dialog", {
        name: "Create Client Overview template",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Allied Template" }),
    ).toBeInTheDocument();
  });

  it("labels the empty state per tab", () => {
    render(<TemplateLayout templates={{ "client-overview": [], organization: [], group: [] }} />);

    fireEvent.click(screen.getByRole("tab", { name: "Group" }));

    const groupPanel = screen.getByRole("tabpanel", { name: "Group" });
    expect(within(groupPanel).getByText("No Group template")).toBeInTheDocument();
  });

  it("renders templates supplied by the caller", () => {
    render(
      <TemplateLayout
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
