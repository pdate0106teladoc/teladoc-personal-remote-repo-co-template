import { LABELS } from "@/constants";
import { ReportRecipient, ReportSettings, SectionData } from "@/types/OrgView";

const reportLabels = LABELS.reporting;

export const renderaReportSetting = (data: ReportSettings, metadata?: any, index: number = 0): SectionData => {
  const reportSettings = data ?? {};
  const reportSettingsMeta = metadata ?? {};

  return {
    "": {
      col1: [
        {
          label: reportLabels.REPORT_TYPE,
          value: reportSettings?.reportType,
          fieldKey: `reporting.${index}.reportSettings.reportType`,
          metadata: reportSettingsMeta?.reportType,
        },
        {
          label: reportLabels.REPORT_SORTING,
          value: reportSettings?.reportSorting,
          fieldKey: `reporting.${index}.reportSettings.reportSorting`,
          metadata: reportSettingsMeta?.reportSorting,
        },
        {
          label: reportLabels.EMAIL_CONTENT_VERSION,
          value: reportSettings?.emailContentVersion,
          fieldKey: `reporting.${index}.reportSettings.emailContentVersion`,
          metadata: reportSettingsMeta?.emailContentVersion,
        },
        {
          label: reportLabels.DELIVERY_FREQUENCY,
          value: reportSettings?.deliveryFrequency,
          fieldKey: `reporting.${index}.reportSettings.deliveryFrequency`,
          metadata: reportSettingsMeta?.deliveryFrequency,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: reportLabels.REPORT_VERSION,
          value: reportSettings?.reportVersion,
          fieldKey: `reporting.${index}.reportSettings.reportVersion`,
          metadata: reportSettingsMeta?.reportVersion,
        },
        {
          label: reportLabels.REPORT_EFFECTIVE_START_DATE,
          value: reportSettings?.reportEffectiveStartDate,
          format: "date",
          fieldKey: `reporting.${index}.reportSettings.reportEffectiveStartDate`,
          metadata: reportSettingsMeta?.reportEffectiveStartDate,
        },
        {
          label: reportLabels.REPORT_EFFECTIVE_END_DATE,
          value: reportSettings?.reportEffectiveEndDate,
          format: "date",
          fieldKey: `reporting.${index}.reportSettings.reportEffectiveEndDate`,
          metadata: reportSettingsMeta?.reportEffectiveEndDate,
        },
        {
          label: reportLabels.REPORT_TEMPLATE,
          value: reportSettings?.reportTemplate,
          fieldKey: `reporting.${index}.reportSettings.reportTemplate`,
          metadata: reportSettingsMeta?.reportTemplate,
          lastChild: true,
        },
      ],
    },
  };
};
export const renderReportRecipient = (data: ReportRecipient[]): SectionData => {
  const recipient: string[] = data?.map((item) => {
    return item.emailAddress
  })

  return {
    "Report recipient": {
      col1: [
        {
          label: reportLabels.EMAIL_ADDRESS,
          value: recipient,
          lastChild: true
        },
      ],
      col2: []
    },
  };
};
