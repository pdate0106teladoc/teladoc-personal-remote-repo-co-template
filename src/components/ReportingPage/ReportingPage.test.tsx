import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportingDetails from "./ReportingDetails";
import { LABELS } from "@/constants";

// 1) Mock renderaReportSetting
vi.mock("@/data/organization/reporting", () => ({
  __esModule: true,
  renderaReportSetting: vi.fn((settings) => [`rendered-${settings}`]),
}));

// 2) Mock @ucc/common-ui
vi.mock("@ucc/common-ui", () => ({
  __esModule: true,
  EmailRecipients: ({ Emails, to, bcc }: { Emails?: string[]; to?: string[]; bcc?: string[] }) => (
    <div data-testid="email-recipients">
      Emails:{Emails?.join(",")} to:{to?.join(",")} bcc:{bcc?.join(",")}
    </div>
  ),
  CustomCards: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FailSafePage: ({ cardType }: { cardType: string }) => <div data-testid="fail-safe">{cardType}</div>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// 2b) Recipient editors hit the network / router; the add-report tests only care
// that the template card renders in their place.
vi.mock("@/components/ReportingPage/EditableReportRecipients", () => ({
  __esModule: true,
  default: ({ fieldKey }: { fieldKey: string }) => (
    <div data-testid="editable-recipients">{fieldKey}</div>
  ),
}));
vi.mock("@/components/ReportingPage/EditableGroupRecipients", () => ({
  __esModule: true,
  default: ({ fieldKey }: { fieldKey: string }) => (
    <div data-testid="editable-group-recipients">{fieldKey}</div>
  ),
}));

// 3) Mock RenderSection
vi.mock(
  "@/components/RenderAllSection/RenderAllSection",
  () => ({
    __esModule: true,
    default: ({ data }: { data: any }) => (
      <div data-testid="render-section">{JSON.stringify(data)}</div>
    ),
  })
);

describe("ReportingDetails Component", () => {
  const baseData = {
    reporting: [
      {
        reportRecipient: [
          { emailAddress: "a@x.com", emailRecipient: "to" },
          { emailAddress: "b@y.com", emailRecipient: "bcc" },
        ],
        reportSettings: "fooSettings",
      },
    ],
  } as any;
  const emptyData = {
    reporting: [
      {
        reportRecipient: [
          { emailAddress: "", emailRecipient: "to" },
          { emailAddress: "", emailRecipient: "bcc" },
        ],
        reportSettings: "",
      },
    ],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the tab title correctly", () => {
    render(<ReportingDetails data={baseData} />);
    expect(
      screen.getByText(LABELS.reporting.REPORT_SETTINGS)
    ).toBeInTheDocument();
  });

  it("passes both `to` and `bcc` when isGroup is false or undefined", () => {
    render(<ReportingDetails data={baseData} />);
    const el = screen.getByTestId("email-recipients");
    expect(el).toHaveTextContent("Emails: to:a@x.com bcc:b@y.com");
  });

  it("passes only `Emails` when isGroup is true", () => {
    render(<ReportingDetails data={baseData} isGroup={true} />);
    const el = screen.getByTestId("email-recipients");
    expect(el).toHaveTextContent("Emails:a@x.com,b@y.com to: bcc:");
  });

  it("renders empty recipients when no reporting array provided", () => {
    render(<ReportingDetails data={emptyData} isGroup/>);
    const el = screen.getByTestId("email-recipients");
    expect(el).toHaveTextContent("Emails: to: bcc:");
  });

  it("calls renderaReportSetting and renders its output via RenderSection", () => {
    render(<ReportingDetails data={baseData} />);
    const section = screen.getByTestId("render-section");
    expect(section).toHaveTextContent(
      JSON.stringify(["rendered-fooSettings"])
    );
  });

  describe("add / remove report", () => {
    const twoReports = {
      reporting: [
        { reportRecipient: [], reportSettings: "first" },
        { reportRecipient: [], reportSettings: "second" },
      ],
    } as any;

    it("shows neither Add nor Remove in view mode", () => {
      render(<ReportingDetails data={baseData} />);
      expect(screen.queryByText(LABELS.reporting.ADD_REPORT)).not.toBeInTheDocument();
      expect(screen.queryByText(LABELS.reporting.REMOVE_REPORT)).not.toBeInTheDocument();
    });

    it("shows Add report and a Remove report per card in edit mode", () => {
      render(<ReportingDetails data={twoReports} mode="edit" />);
      expect(screen.getByText(LABELS.reporting.ADD_REPORT)).toBeInTheDocument();
      expect(screen.getAllByText(LABELS.reporting.REMOVE_REPORT)).toHaveLength(2);
    });

    it("calls onAddReport when Add report is clicked", () => {
      const onAddReport = vi.fn();
      render(<ReportingDetails data={twoReports} mode="edit" onAddReport={onAddReport} />);
      fireEvent.click(screen.getByText(LABELS.reporting.ADD_REPORT));
      expect(onAddReport).toHaveBeenCalledTimes(1);
    });

    it("renders only the blank template and hides Add report while adding", () => {
      render(
        <ReportingDetails
          data={twoReports}
          mode="edit"
          isAddingReport
          newReportIndex={2}
          metadata={{ reporting: [{}, {}, { reportSettings: {} }] }}
        />,
      );

      expect(screen.queryByText(LABELS.reporting.ADD_REPORT)).not.toBeInTheDocument();
      expect(screen.getAllByTestId("render-section")).toHaveLength(1);
      // The template keeps the index it was appended at, so its keys address the
      // new tail of the reporting array rather than the first saved report.
      expect(screen.getByTestId("editable-recipients")).toHaveTextContent(
        "reporting.2.reportRecipient",
      );
      expect(screen.getAllByText(LABELS.reporting.REMOVE_REPORT)).toHaveLength(1);
    });

    it("discards the template when its Remove report is clicked", () => {
      const onRemoveNewReport = vi.fn();
      render(
        <ReportingDetails
          data={twoReports}
          mode="edit"
          isAddingReport
          newReportIndex={2}
          onRemoveNewReport={onRemoveNewReport}
        />,
      );
      fireEvent.click(screen.getByText(LABELS.reporting.REMOVE_REPORT));
      expect(onRemoveNewReport).toHaveBeenCalledTimes(1);
    });

    it("does nothing when Remove report is clicked on a saved report", () => {
      const onRemoveNewReport = vi.fn();
      render(
        <ReportingDetails
          data={twoReports}
          mode="edit"
          onRemoveNewReport={onRemoveNewReport}
        />,
      );
      fireEvent.click(screen.getAllByText(LABELS.reporting.REMOVE_REPORT)[0]);
      expect(onRemoveNewReport).not.toHaveBeenCalled();
    });

    it("keeps Add report reachable when the entity has no reports yet", () => {
      render(<ReportingDetails data={{ reporting: [] } as any} mode="edit" />);
      expect(screen.getByText(LABELS.reporting.ADD_REPORT)).toBeInTheDocument();
      expect(screen.getByTestId("fail-safe")).toBeInTheDocument();
    });

    it("still shows the no-data page in view mode with no reports", () => {
      render(<ReportingDetails data={{ reporting: [] } as any} />);
      expect(screen.getByTestId("fail-safe")).toBeInTheDocument();
      expect(screen.queryByText(LABELS.reporting.ADD_REPORT)).not.toBeInTheDocument();
    });
  });
});
