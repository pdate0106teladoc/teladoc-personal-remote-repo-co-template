import { Tab, Tabs } from "react-bootstrap";
import { LABELS } from "@/constants";
import RenderSection from "@/components/RenderAllSection/RenderAllSection";
import { renderaReportSetting } from "@/data/organization/reporting";
import { NEW_REPORTING_PLACEHOLDER } from "@/data/newReportingTemplate";
import { Reporting, ReportRecipient } from "@/types/OrgView";
import { Button, CustomCards, EmailRecipients, FailSafePage } from "@ucc/common-ui";
import { DarkPlusIcon, DustbinIcon } from "@/assets";
import EditableGroupRecipients from "@/components/ReportingPage/EditableGroupRecipients";
import EditableReportRecipients from "@/components/ReportingPage/EditableReportRecipients";
import "./ReportingDetails.scss";

interface ReportingDetailsProps {
  data: Reporting;
  isGroup?: boolean;
  mode?: "view" | "edit";
  metadata?: any;
  formData?: Record<string, any>;
  errors?: Record<string, string>;
  onFieldChange?: (fieldKey: string, value: any) => void;
  /** True while the blank "add report" template is the only card on screen. */
  isAddingReport?: boolean;
  /** Index the drafted report occupies in the reporting array. */
  newReportIndex?: number;
  onAddReport?: () => void;
  onRemoveNewReport?: () => void;
}

const ReportingDetails = ({
  data,
  isGroup,
  mode = "view",
  metadata,
  formData = {},
  errors = {},
  onFieldChange,
  isAddingReport = false,
  newReportIndex = 0,
  onAddReport,
  onRemoveNewReport,
}: ReportingDetailsProps) => {
  const existingReports = data?.reporting ?? [];
  // The template is the only card on screen while adding, but it keeps the index
  // it was appended at so its field keys and metadata line up with the page's.
  const reportingCards = isAddingReport
    ? [{ item: NEW_REPORTING_PLACEHOLDER, index: newReportIndex }]
    : existingReports.map((item, index) => ({ item, index }));
  const reportingLabels = LABELS.reporting;
  const isEditMode = mode === "edit";

  const processReportMetaData = (
    recipient: ReportRecipient[],
    type: "to" | "bcc" | "group",
  ) => {
    switch (type) {
      case "to": {
        const to = recipient
          .filter((r) => r?.emailRecipient?.toLowerCase() === "to")
          .map((recipient) => recipient?.emailAddress)
          .filter(Boolean);
        return to;
      }
      case "bcc": {
        const bcc = recipient
          .filter((r) => r?.emailRecipient?.toLowerCase() === "bcc")
          .map((recipient) => recipient?.emailAddress)
          .filter(Boolean);
        return bcc;
      }
      case "group": {
        const group = recipient
          .map((recipient) => recipient?.emailAddress)
          .filter(Boolean);
        return group;
      }
      default:
        break;
    }
  };

  // Edit mode keeps rendering so "Add report" stays reachable on an entity that
  // has no reports yet.
  if (reportingCards.length === 0 && !isEditMode)
    return <FailSafePage cardType="noData" />;

  return (
    <div>
      <Tabs defaultActiveKey="standard" id="uncontrolled-tab-example" className={mode === "edit" ? "edit-mode" : ""}>
        <Tab eventKey="standard" title={reportingLabels.REPORT_SETTINGS}>
          {isEditMode && !isAddingReport && (
            <div className="add-report-action">
              <Button variant="add" onClick={onAddReport}>
                <DarkPlusIcon className="add-icon" aria-hidden />
                {reportingLabels.ADD_REPORT}
              </Button>
            </div>
          )}
          {reportingCards.length === 0 ? (
            <FailSafePage cardType="noData" />
          ) : (
            reportingCards.map(({ item, index }) => {
              const reportMetadata = metadata?.reporting?.[index] ?? {};
              return (
                <div
                  key={index}
                  className={`reporting-card${isEditMode ? " has-remove-footer" : ""}`}
                >
                  <CustomCards className="email-recipient-card">
                    {isGroup && mode === "edit" ? (
                      <EditableGroupRecipients
                        fieldKey={`reporting.${index}.reportRecipient`}
                        value={item?.reportRecipient ?? []}
                        metadata={reportMetadata?.reportRecipient?.[0]?.emailAddress}
                        onChange={onFieldChange}
                        error={errors[`reporting.${index}.reportRecipient`]}
                      />
                    ) : !isGroup && mode === "edit" ? (
                      <EditableReportRecipients
                        fieldKey={`reporting.${index}.reportRecipient`}
                        value={item?.reportRecipient ?? []}
                        metadata={reportMetadata?.reportRecipient?.[0]?.emailAddress}
                        onChange={onFieldChange}
                        error={errors[`reporting.${index}.reportRecipient`]}
                        isNewReport={isAddingReport}
                      />
                    ) : isGroup ? (
                      <EmailRecipients
                        Emails={processReportMetaData(
                          item?.reportRecipient,
                          "group",
                        )}
                      />
                    ) : (
                      <EmailRecipients
                        to={processReportMetaData(item?.reportRecipient, "to")}
                        bcc={processReportMetaData(item?.reportRecipient, "bcc")}
                      />
                    )}
                  </CustomCards>
                  <RenderSection
                    data={renderaReportSetting(item?.reportSettings, mode === "edit" ? reportMetadata?.reportSettings : undefined, index)}
                    className="report-settings"
                    mode={mode}
                    onFieldChange={onFieldChange}
                    formData={formData}
                    errors={errors}
                  />
                  {isEditMode && (
                    // Its own strip so the button sits inside the card's grey
                    // background, which the settings card ends above.
                    <div className="remove-report-footer">
                      {/* Removing a saved report is not supported by the backend
                          yet; only the template's button is wired, to discard. */}
                      <button
                        type="button"
                        className="remove-report-button"
                        onClick={isAddingReport ? onRemoveNewReport : undefined}
                      >
                        <DustbinIcon aria-hidden />
                        {reportingLabels.REMOVE_REPORT}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default ReportingDetails;
