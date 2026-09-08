import DisplayRow from "@/components/DisplayRow/DisplayRow";
import { SideModal, SidebarRowWrapper, showCustomToast } from "@ucc/common-ui";
import {
  DetailEligibility,
  DetailEngagementCriteria,
  DetailGeneralSettings,
  DetailMarketing,
  Field,
  ProductBilling,
  ProductOpportunity,
  ProductRTEOverride,
  ProductSubscriptions,
} from "@/types/GrpView";
import { Tab, Tabs } from "react-bootstrap";
import "../styles/ProductDetail.scss";
import {
  DisplayType,
  extractDisplayValue,
} from "@/components/ExtractValue/ExtractDisplayValue";
import { CustomTable, TableColumn } from "@ucc/common-ui";
import { getSafeString, getValueOrNoOverride, normalizeApprovalTicket } from "@/utils";
import { Accordion } from "@ucc/common-ui";
import { useState } from "react";
import { OpportunityDetail, OpportunityDetails } from "@/types/search";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import api from "@/api/apiService";
import OpportunityDrawer from "@/components/sidebar/OpportunityDrawer";
import { tabData } from "@/pages/search-results/OpportunitiesTable";

interface ProductDetailProps {
  data: Record<
    string,
    { direct: Field[]; groups: { [groupName: string]: Field[] } }
  >;
  billingRteOverrides: ProductRTEOverride[];
  opportunities: ProductOpportunity[];
  category: string;
  parentBundles?: string[];
  marketingDetails?: DetailMarketing;
  engagementCriteria?: DetailEngagementCriteria;
  eligibilityDetails?: DetailEligibility;
  generalSettings?: DetailGeneralSettings;
  billing?: ProductBilling;
  productTag?: string;
  rteOverrideFlag: boolean;
  productName?: string;
  subscriptions?: ProductSubscriptions[];
}

type VisibilityOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_THAN_OR_EQUALS"
  | "LESS_THAN_OR_EQUALS";

interface VisibilityCondition {
  dependsOn: string;
  operator: VisibilityOperator;
  value: any;
}

interface ProductServiceColumns {
  product_services: string;
  is_covered: boolean;
}

const buildValueMap = (
  data: ProductDetailProps["data"],
): Record<string, any> => {
  const map: Record<string, any> = {};
  Object.values(data).forEach((cat) => {
    cat.direct.forEach((f) => (map[f.configCode] = f.value));
    Object.values(cat.groups).forEach((arr) =>
      arr.forEach((f) => (map[f.configCode] = f.value)),
    );
  });
  return map;
};

const coerce = (val: any) => {
  if (val === null || val === undefined) return val;
  if (typeof val === "number") return val;
  if (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val))) {
    return Number(val);
  }
  return val;
};

const evaluateCondition = (
  cond: VisibilityCondition,
  valueMap: Record<string, any>,
): boolean => {
  const leftRaw = valueMap[cond.dependsOn];
  if (leftRaw === undefined) return false;
  const left = coerce(leftRaw);
  const right = coerce(cond.value);
  switch (cond.operator) {
    case "EQUALS":
      return left === right;
    case "NOT_EQUALS":
      return left !== right;
    case "GREATER_THAN":
      return typeof left === "number" && typeof right === "number"
        ? left > right
        : false;
    case "LESS_THAN":
      return typeof left === "number" && typeof right === "number"
        ? left < right
        : false;
    case "GREATER_THAN_OR_EQUALS":
      return typeof left === "number" && typeof right === "number"
        ? left >= right
        : false;
    case "LESS_THAN_OR_EQUALS":
      return typeof left === "number" && typeof right === "number"
        ? left <= right
        : false;
    default:
      return true;
  }
};

const makeVisibilityFn = (valueMap: Record<string, any>) => (field: Field) => {
  const cond = field.visibilityCondition as VisibilityCondition | undefined;
  if (!cond) return true;
  return evaluateCondition(cond, valueMap);
};

const renderFieldGroupTable = (
  groupName: string,
  fields: Field[],
  isVisible: (f: Field) => boolean,
) => {
  if (!fields || fields.length === 0) return null;
  const visible = fields.filter(isVisible).filter(shouldRenderField);
  if (visible.length === 0) return null;
  const horizontal = visible.filter((f) => f.layout === "horizontal");
  const vertical = visible.filter((f) => f.layout === "vertical");
  return (
    <div className="product-table-container">
      <p className="product-container-header">{groupName}</p>
      {vertical.length > 0 &&
        vertical.map((item) => (
          <SidebarRowWrapper key={item.configCode}>
            <DisplayRow
              label={item.displayName}
              value={item.value}
              format={item.type as DisplayType}
              lastChild={true}
            />
          </SidebarRowWrapper>
        ))}
      {horizontal.length > 0 && (
        <table className="w-full product-table">
          <thead>
            <tr>
              {horizontal.map((f) => (
                <th key={f.configCode}>{f.displayName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {horizontal.map((f) => (
                <td key={f.configCode}>
                  {extractDisplayValue(f.value, f.type as DisplayType).jsx}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

const renderNonAnchorFields = (
  title: string,
  fields: Array<{
    label: string;
    value: any;
    format?: string;
    lastChild?: boolean;
  }>,
) => {
  return (
    <div className="product-detail-non-anchor-fields-container">
      <p className="product-detail-non-anchor-fields-title">{title}</p>
      {fields.map((field, index) => (
        <div className="product-detail-non-anchor-field" key={index}>
          <DisplayRow
            label={field.label}
            value={field.value}
            format={field.format as DisplayType}
            lastChild={field.lastChild ?? true}
          />
        </div>
      ))}
    </div>
  );
};

const isMentalHealthProduct = (
  productName: string | null | undefined,
): boolean => {
  if (!productName) return false;

  const mentalHealthProducts = [
    "Mental Health - Livongo for Behavioral Health by myStrength (myStrength 2.0)",
    "Mental Health - MyStrength",
    "Mental Health - MyStrength Complete",
    "Mental Health - MyStrength Global",
    "Mental Health - MyStrength Plus",
  ];

  return mentalHealthProducts.includes(productName);
};

// Config codes to exclude from dynamic rendering
const EXCLUDED_CONFIG_CODES = ["PRODUCTS_SERVICES_GEOGRAPHIC_REGION"];

// Filter function to check if a field should be dynamically rendered
const shouldRenderField = (field: Field): boolean => {
  return !EXCLUDED_CONFIG_CODES.includes(field.configCode);
};

const renderContent = (
  content: { direct: Field[]; groups: { [groupName: string]: Field[] } },
  isVisible: (f: Field) => boolean,
) => {
  const groupNames = Object.keys(content.groups).sort((a, b) => {
    const aOrders = content.groups[a]
      .filter(isVisible)
      .filter(shouldRenderField)
      .map((f) => f.order ?? Number.MAX_SAFE_INTEGER);
    const bOrders = content.groups[b]
      .filter(isVisible)
      .filter(shouldRenderField)
      .map((f) => f.order ?? Number.MAX_SAFE_INTEGER);
    const aMin = aOrders.length
      ? Math.min(...aOrders)
      : Number.MAX_SAFE_INTEGER;
    const bMin = bOrders.length
      ? Math.min(...bOrders)
      : Number.MAX_SAFE_INTEGER;
    return aMin - bMin;
  });
  return (
    <>
      {content.direct
        .filter(isVisible)
        .filter(shouldRenderField)
        .map((item, index) => (
          <div className="product-detail-sidebar-container" key={index}>
            <DisplayRow
              label={item.displayName}
              value={item.value}
              format={item.type as DisplayType}
              lastChild={true}
            />
          </div>
        ))}
      {groupNames.map((groupName) => (
        <div key={groupName} className="dynamic-table-container">
          {renderFieldGroupTable(
            groupName,
            content.groups[groupName],
            isVisible,
          )}
        </div>
      ))}
    </>
  );
};

const ProductDetail: React.FC<ProductDetailProps> = ({
  data,
  billingRteOverrides,
  opportunities,
  category,
  parentBundles,
  marketingDetails,
  engagementCriteria,
  eligibilityDetails,
  generalSettings,
  billing,
  productTag,
  rteOverrideFlag,
  productName,
  subscriptions,
}) => {
  if (
    data?.["General settings"]?.direct &&
    parentBundles &&
    parentBundles.length > 0
  ) {
    const existingIndex = data?.["General settings"]?.direct?.findIndex(
      (field) => field.configCode === "product_bundle",
    );

    if (existingIndex === -1) {
      const parentBundleField = {
        displayName: "Product Bundle(s)",
        type: "list",
        value: parentBundles,
        layout: "vertical" as const,
        order: 2,
        section: "General settings",
        group: null,
        defaultValue: null,
        configCode: "product_bundle",
        visibilityCondition: null,
        component: "list",
        isEditable: false,
      };
      data["General settings"].direct.splice(1, 0, parentBundleField);
    }
  } else if (data?.["Billing"]?.direct && productName) {
    const prePaidProducts = [
      "BetterHelp Business – Therapy",
      "Mental Health - MyStrength Complete",
    ];
    const subscriptionFields: ProductSubscriptions | undefined =
      subscriptions?.find((prod) => prod.productName === productName);

    const membershipFeeTypeIndex = data["Billing"].direct.findIndex(
      (field) => field.configCode === "MEMBERSHIP_FEE_TYPE",
    );

    if (
      membershipFeeTypeIndex !== -1 &&
      subscriptionFields &&
      prePaidProducts.includes(productName)
    ) {
      const extraBillingFields: Field[] = [
        {
          displayName: "Prepaid Visits",
          type: "number",
          value: subscriptionFields.prepaidVisits,
          layout: "vertical",
          order: 5,
          section: "Billing",
          group: null,
          defaultValue: subscriptionFields.prepaidVisits,
          configCode: "prepaid_visits",
          visibilityCondition: null,
          component: "number",
          isEditable: false,
        },
        {
          displayName: "Vendor product option",
          type: "string",
          value: subscriptionFields.vendorProductOption,
          layout: "vertical",
          order: 6,
          section: "Billing",
          group: null,
          defaultValue: subscriptionFields.vendorProductOption,
          configCode: "vendor_product_option",
          visibilityCondition: null,
          component: "string",
          isEditable: false,
        },
      ];

      extraBillingFields.forEach((field, i) => {
        const alreadyPresent = data["Billing"].direct.some(
          (f) => f.configCode === field.configCode,
        );
        if (!alreadyPresent) {
          data["Billing"].direct.splice(
            membershipFeeTypeIndex + 1 + i,
            0,
            field,
          );
        }
      });
    }
  }
  const valueMap = buildValueMap(data);
  const isVisible = makeVisibilityFn(valueMap);
  const [modalData, setModalData] = useState<OpportunityDetail | null>(null);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const rteOverrideColumn: TableColumn<ProductRTEOverride>[] = [
    {
      label: "Consult type",
      field: "consultType",
      hasToggleMenu: false,
      render: (_val, row) => <div>{getSafeString(row.consultType)}</div>,
    },
    {
      label: "Total",
      field: "total",
      hasToggleMenu: false,
      render: (_val, row) => <div>{getValueOrNoOverride(row.total)}</div>,
    },
    {
      label: "Copay",
      field: "copay",
      hasToggleMenu: false,
      render: (_val, row) => <div>{getValueOrNoOverride(row.copay)}</div>,
    },
    {
      label: "Coinsurance",
      field: "coinsurance",
      hasToggleMenu: false,
      render: (_val, row) => <div>{getValueOrNoOverride(row.coinsurance)}</div>,
    },
    {
      label: "Approval Ticket",
      field: "approvalTicket",
      hasToggleMenu: false,
      render: (_val, row) => {
        const ticketKey = normalizeApprovalTicket(row.approvalTicket);
        if (!ticketKey) return <div>-</div>;

        const trimmed = row.approvalTicket?.trim() ?? "";
        let href: string | null = null;
        try {
          const url = new URL(trimmed);
          if (url.protocol === "http:" || url.protocol === "https:") href = url.toString();
        } catch {}

        return href ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {ticketKey}
          </a>
        ) : (
          <span>{ticketKey}</span>
        );
      },
    },
  ];
  const opportunityColumn: TableColumn<ProductOpportunity>[] = [
    {
      label: "Name and GUID",
      field: "opportunityName",
      hasToggleMenu: false,
      render: (_val, row) => (
        <div>
          <div className="text-primary">
            <a
              href=""
              className="text-primary"
              onClick={(e) => {
                e.preventDefault();
                setOpportunityId(row.id);
                fetchOpportunityDetails(row.id);
              }}
            >
              {getSafeString(row.opportunityName)}
            </a>
          </div>
          <div>{getSafeString(row.opportunityGuid)}</div>
        </div>
      ),
    },
    {
      label: "Contract",
      field: "contractNumber",
      hasToggleMenu: false,
      subLabel: "Number",
      render: (_val, row) => <div>{getSafeString(row.contractNumber)}</div>,
    },
    {
      label: "Effective",
      field: "effectiveStartDate",
      hasToggleMenu: false,
      subLabel: "Start Date",
      render: (_val, row) => (
        <div>{extractDisplayValue(row.effectiveStartDate, "date").jsx}</div>
      ),
    },
    {
      label: "Effective",
      field: "effectiveEndDate",
      hasToggleMenu: false,
      subLabel: "End Date",
      render: (_val, row) => (
        <div>{extractDisplayValue(row.effectiveEndDate, "date").jsx}</div>
      ),
    },
  ];
  const productServiceColumns: TableColumn<ProductServiceColumns>[] = [
    {
      label: "Product Service",
      field: "product_services",
      hasToggleMenu: false,
      render: (_val, row) => <div>{getSafeString(row.product_services)}</div>,
    },
    {
      label: "Is 100% covered",
      field: "is_covered",
      hasToggleMenu: false,
      render: (_val, row) => (
        <div>{extractDisplayValue(row.is_covered, "boolean").jsx}</div>
      ),
    },
  ];

  const mentalHealthFields = [
    {
      label: "myStrength 1.0 Transitioning Client",
      value: generalSettings?.myStrengthTransitioningClient,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "myStength 1.0 Transition Date",
      value: generalSettings?.myStrengthTransitionDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "Provider Based Care",
      value: generalSettings?.providerBasedCare,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Disable BH",
      value: generalSettings?.disableBh,
      lastChild: true,
      format: "boolean",
    },
  ];

  //Non-Anchor Data

  const programOverview = [
    { label: "Program", value: generalSettings?.program, lastChild: true },
    {
      label: "Client Overview",
      value: generalSettings?.clientOverview,
      lastChild: true,
    },
    {
      label: "Program Platform Version",
      value: generalSettings?.programPlatformVersion,
      lastChild: true,
    },
    {
      label: "Program Implementation Status",
      value: generalSettings?.programImplementationStatus,
      lastChild: true,
    },
    { label: "Status", value: generalSettings?.status, lastChild: true },
    {
      label: "CKD Aware Variant",
      value: generalSettings?.ckdAwareVariant,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Disable Mental Health Guidance",
      value: generalSettings?.disableMentalHealthGuidance,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Disable Teletherapy",
      value: generalSettings?.disableTeletherapy,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Recruitable Population - Current",
      value: generalSettings?.recruitablePopulationCurrent,
      lastChild: true,
    },
  ];

  const programSchedule = [
    {
      label: "Program Start Date",
      value: generalSettings?.programStartDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "Program End Date",
      value: generalSettings?.programEndDate,
      lastChild: true,
      format: "date",
    },
  ];

  //Anchor Data
  const programOverviewLayout = [
    { label: "Program", value: generalSettings?.program, lastChild: true },
    {
      label: "Program Platform Version",
      value: generalSettings?.programPlatformVersion,
      lastChild: true,
    },
    { label: "Account", value: generalSettings?.account, lastChild: true },
    {
      label: "Client Overview",
      value: generalSettings?.clientOverview,
      lastChild: true,
    },
    {
      label: "Program Implementation Status",
      value: generalSettings?.programImplementationStatus,
      lastChild: true,
    },
    { label: "Status", value: generalSettings?.status, lastChild: true },
    {
      label: "Registration Status",
      value: generalSettings?.registrationStatus,
      lastChild: true,
    },
    {
      label: "Health Plan Partner Customization",
      value: generalSettings?.healthPlanPartnerCustomizations,
      lastChild: true,
    },
    {
      label: "Client Success Manager",
      value: generalSettings?.clientSuccessManager,
      lastChild: true,
    },
    {
      label: "Client Implementation Manager",
      value: generalSettings?.clientImplementationManager,
      lastChild: true,
    },
    {
      label: "Disable Mental Health Guidance",
      value: generalSettings?.disableMentalHealthGuidance,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Disable Teletherapy",
      value: generalSettings?.disableTeletherapy,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Transitioning DPP Year 2 members",
      value: generalSettings?.transitioningDppYear2Members,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "CDC Enrollment Source",
      value: generalSettings?.cdcEnrollmentSource,
      lastChild: true,
    },
    {
      label: "Kickoff Date",
      value: generalSettings?.kickoffDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "Initial Launch Date",
      value: generalSettings?.initialLaunchDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "Expected Launch Date",
      value: generalSettings?.expectedLaunchDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "MyStrength Transition Date",
      value: generalSettings?.myStrengthTransitionDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "Recruitable Population - Current",
      value: generalSettings?.recruitablePopulationCurrent,
      lastChild: true,
    },
    {
      label: "Recruitable Population (D+HTN)",
      value: generalSettings?.recruitablePopulationDhtnCurrent,
      lastChild: true,
    },
    {
      label: "Enrollment Cap",
      value: generalSettings?.enrollmentCap,
      lastChild: true,
    },
    {
      label: "Program Qualification Dependency",
      value: generalSettings?.programQualificationDependency,
      lastChild: true,
    },
    {
      label: "Program Transition",
      value: generalSettings?.programTransitionDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "New Device Type",
      value: generalSettings?.newDeviceType,
      lastChild: true,
    },
    {
      label: "CKD Aware Variant",
      value: generalSettings?.ckdAwareVariant,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Claims Configuration",
      value: generalSettings?.claimsConfiguration,
      lastChild: true,
    },
  ];

  const contractProgramScheduleLayout = [
    { label: "Name", value: generalSettings?.name, lastChild: true },
    {
      label: "Program Start Date",
      value: generalSettings?.programStartDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "Program End Date",
      value: generalSettings?.programEndDate,
      lastChild: true,
      format: "date",
    },
    {
      label: "Contract Term",
      value: generalSettings?.contractTerm,
      lastChild: true,
    },
    {
      label: "Auto Renewal",
      value: generalSettings?.autoRenewal,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Renewal Notice Period",
      value: generalSettings?.renewalNoticePeriod,
      lastChild: true,
    },
  ];

  const clientIncentivesLayout = [
    {
      label: "Client Plan Design Inclusions",
      value: generalSettings?.clientPlanDesignInclusions,
      lastChild: true,
    },
  ];

  const clientImplementationLayout = [
    {
      label: "Cumulative Program Cap",
      value: generalSettings?.cumulativeProgramCap,
      lastChild: true,
    },
    { label: "BMI Limit", value: generalSettings?.bmiLimit, lastChild: true },
    {
      label: "Confirm On No Recruitable Match",
      value: generalSettings?.confirmOnNoRecruitableMatch,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Qualification Minimum Age",
      value: generalSettings?.qualificationMinimumAge,
      lastChild: true,
    },
    {
      label: "Opt Out Questions",
      value: generalSettings?.optOutQuestions,
      lastChild: true,
    },
    {
      label: "Additional Questions",
      value: generalSettings?.additionalQuestions,
      lastChild: true,
    },
    {
      label: "Insurance Question Group",
      value: generalSettings?.insuranceQuestionGroup,
      lastChild: true,
    },
  ];

  //==================================================BILLING TAB DATA==================================================//

  // Non-Anchor Data
  const billingProgramOverviewNonAnchor = [
    {
      label: "Claims Configuration",
      value: billing?.claimsConfiguration,
      lastChild: true,
    },
    {
      label: "New Device Type",
      value: billing?.newDeviceType,
      lastChild: true,
    },
  ];

  const billingContractProgramScheduleNonAnchor = [
    {
      label: "Unique Contract Terms",
      value: billing?.uniqueContractTerms,
      lastChild: true,
      format: "html",
    },
    {
      label: "Lost/Damaged Device Price 1",
      value: billing?.lostDamagedDevicePrice1,
      lastChild: true,
      format: "currency",
    },
  ];

  const billingMemberSupportNonAnchor = [
    {
      label: "Replacement Device Coverage",
      value: billing?.replacementDeviceCoverage,
      lastChild: true,
    },
  ];

  // Anchor Data

  const billingProgramOverview = [
    { label: "CDC Payer Type", value: billing?.cdcPayerType, lastChild: true },
    {
      label: "Partner Pass Through Price",
      value: billing?.partnerPassThroughPrice,
      lastChild: true,
      format: "currency",
    },
  ];

  const billingProgramScheduleLayout = [
    {
      label: "PPPM",
      value: billing?.pppm,
      lastChild: true,
      format: "currency",
    },
    {
      label: "PMPM",
      value: billing?.pmpm,
      lastChild: true,
      format: "currency",
    },
    {
      label: "Tier 2 PPPM start month",
      value: billing?.tier2PppmStartMonth,
      lastChild: true,
    },
    {
      label: "Tier 2 PPPM",
      value: billing?.tier2Pppm,
      lastChild: true,
      format: "currency",
    },
    {
      label: "Tier 3 PPPM start month",
      value: billing?.tier3PppmStartMonth,
      lastChild: true,
    },
    { label: "Tier 3 PPPM", value: billing?.tier3Pppm, lastChild: true },
    {
      label: "Low acuity price",
      value: billing?.lowAcuityPrice,
      lastChild: true,
      format: "currency",
    },
    {
      label: "Upfront per member",
      value: billing?.upfrontPerMember,
      lastChild: true,
    },
    {
      label: "Unique contract terms",
      value: billing?.uniqueContractTerms,
      lastChild: true,
      format: "html",
    },
    {
      label: "Billing partner fee",
      value: billing?.billingPartnerFee,
      lastChild: true,
      format: "currency",
    },
    {
      label: "Billing partner fee type",
      value: billing?.billingPartnerFeeType,
      lastChild: true,
    },
    {
      label: "PPPM billing trigger",
      value: billing?.pppmBillingTrigger,
      lastChild: true,
    },
    {
      label: "Is there lapse criteria?",
      value: billing?.isThereLapseCriteria,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Lapsed criteria source",
      value: billing?.lapsedCriteriaSource,
      lastChild: true,
    },
    {
      label: "Lapsed criteria",
      value: billing?.lapseCriteria,
      lastChild: true,
    },
    {
      label: "Consecutive inactive months to lapsed",
      value: billing?.consecutiveInactiveMonthsToLapsed,
      lastChild: true,
    },
    {
      label: "Lapsed user custom detail",
      value: billing?.lapsedUserCustomDetail,
      lastChild: true,
      format: "html",
    },
    {
      label: "Minimum number of participants",
      value: billing?.minimumNumberOfParticipants,
      lastChild: true,
    },
    {
      label: "Is there a PTMM?",
      value: billing?.isThereAptmm,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Participant term minimum months",
      value: billing?.participantTermMinimumMonths,
      lastChild: true,
    },
    {
      label: "Lost/damaged device 1",
      value: billing?.lostDamagedDevice1,
      lastChild: true,
    },
    {
      label: "Lost/damaged device price 1",
      value: billing?.lostDamagedDevicePrice1,
      lastChild: true,
      format: "currency",
    },
    {
      label: "Lost/damaged device 2",
      value: billing?.lostDamagedDevice2,
      lastChild: true,
    },
    {
      label: "Lost/damaged device price 2",
      value: billing?.lostDamagedDevicePrice2,
      lastChild: true,
      format: "currency",
    },
    {
      label: "Lost/damaged device responsibility",
      value: billing?.lostDamagedDeviceResponsibility,
      lastChild: true,
    },
    {
      label: "Multiprogram discount",
      value: billing?.multiprogramDiscount,
      lastChild: true,
    },
    {
      label: "Milestone billing",
      value: billing?.milestoneBilling,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Milestone billing configuration",
      value: billing?.milestoneBillingConfiguration,
      lastChild: true,
    },
    {
      label: "Tier 2 partner fee start month",
      value: billing?.tier2PartnerFeeStartMonth,
      lastChild: true,
    },
    {
      label: "Tier 2 partner fee",
      value: billing?.tier2PartnerFee,
      lastChild: true,
      format: "currency",
    },
  ];

  const billingPerformanceGuaranteeLayout = [
    {
      label: "Performance Guarantees?",
      value: billing?.performanceGuarantees,
      format: "boolean",
      lastChild: true,
    },
    {
      label: "A1c Reduction",
      value: billing?.a1cReduction,
      format: "boolean",
      lastChild: true,
    },
    {
      label: "Participation Satisfaction",
      value: billing?.participationSatisfaction,
      format: "boolean",
      lastChild: true,
    },
    {
      label: "Reduction in BG",
      value: billing?.reductionInBg,
      format: "boolean",
      lastChild: true,
    },
    {
      label: "Custom PG Type",
      value: billing?.customPgType,
      format: "boolean",
      lastChild: true,
    },
    {
      label: "PG Custom Detail",
      value: billing?.pgCustomDetail,
      format: "html",
      lastChild: true,
    },
    {
      label: "PG Analysis Due Date",
      value: billing?.pgAnalysisDueDate,
      lastChild: true,
    },
    {
      label: "PG A1c reduction $PPPM",
      value: billing?.pgA1cReductionPppm,
      lastChild: true,
      format: "currency"
    },
    {
      label: "PG A1c reduction %",
      value: billing?.pgA1cReductionPercent,
      lastChild: true,
      format: "percentage"
    },
    {
      label: "PG Education in Out of Range Time $PPPM",
      value: billing?.pgReductionInOutOfRangeTimePppm,
      lastChild: true,
      format: "currency"
    },
    {
      label: "PG Reduction in out of Range Time %",
      value: billing?.pgReductionInOutOfRangeTimePercent,
      lastChild: true,
      format: "percentage"
    },
    {
      label: "PG Satisfaction $PPPM",
      value: billing?.pgSatisfactionPppm,
      lastChild: true,
      format: "currency"
    },
    {
      label: "PG Satisfaction %",
      value: billing?.pgSatisfactionPct,
      lastChild: true,
      format: "percentage"
    },
  ];

  const billingMemberSupportAnchor = [
    {
      label: "Replacement Device Coverage",
      value: billing?.replacementDeviceCoverage,
      lastChild: true,
    },
  ];

  //==================================================MARKETING TAB DATA==================================================//

  // Non-Anchor Data
  const marketingProgramOverviewNonAnchor = [
    {
      label: "Initial Member Recruitment",
      format: "date",
      value: marketingDetails?.initialMemberRecruitment,
      lastChild: true,
    },
    {
      label: "Whole Person Transition Date",
      format: "date",
      value: marketingDetails?.wholePersonTransitionDate,
      lastChild: true,
    },
    {
      label: "WP transition Member Recruitment",
      format: "date",
      value: marketingDetails?.wpTransitionMemberRecruitment,
      lastChild: true,
    },
  ];

  const marketingEnrollmentMarketing = [
    {
      label: "WP Transition Target Marketing",
      format: "date",
      value: marketingDetails?.wpTransitionMarketing,
      lastChild: true,
    },
  ];

  // Anchort Data
  const marketingClientIncentiveAnchor = [
    {
      label: "Incentive Criteria",
      value: marketingDetails?.incentiveCriteria,
      lastChild: true,
    },
    {
      label: "Frequency of Award",
      value: marketingDetails?.frequencyOfAward,
      lastChild: true,
    },
    {
      label: "Incentives Report Delivery",
      value: marketingDetails?.incentivesReportDelivery,
      lastChild: true,
    },
    {
      label: "Incentives Report Frequency",
      value: marketingDetails?.incentivesReportFrequency,
      lastChild: true,
    },
  ];

  const marketingEnrollmentMarketingAnchor = [
    {
      label: "Phone Campaign",
      value: marketingDetails?.phoneCampaign,
      lastChild: true,
    },
  ];

  // ==================================================Engagement Criteria TAB DATA==================================================//

  // Anchort Data

  const programEngagementCriteria = [
    {
      label: "Time horizon for criteria below (days)",
      value: engagementCriteria?.timeHorizonForCriteriaBelowDays,
      lastChild: true,
    },
    {
      label: "Engagement Criteria Option",
      value: engagementCriteria?.engagementCriteriaOption,
      lastChild: true,
    },
    {
      label: "Time in program threshold (days)",
      value: engagementCriteria?.timeInProgramThresholdDays,
      lastChild: true,
    },
    {
      label: "Unique days any app or web engagement",
      value: engagementCriteria?.uniqueDaysAnyAppOrWebEngagement,
      lastChild: true,
    },
    {
      label: "Unique days lesson taken, food logged",
      value: engagementCriteria?.uniqueDaysLessonTakenOrFoodLogged,
      lastChild: true,
    },
    {
      label: "GLP-1 Model",
      value: engagementCriteria?.glp1Model,
      lastChild: true,
    },
  ];

  const legacyFields = [
    {
      label: "Coaching sessions",
      value: engagementCriteria?.requiredCoachingSessions,
      lastChild: true,
    },
    {
      label: "Unique weigh-in days",
      value: engagementCriteria?.uniqueWeighInDays,
      lastChild: true,
    },
  ];

  // ==================================================ELIGIBILITY TAB DATA==================================================//

  // Anchor Data

  const programEligibility = [
    {
      label: "Program eligibility verification method",
      value: eligibilityDetails?.programEligibilityVerificationMethod,
      lastChild: true,
    },
    {
      label: "Program eligibility file cadence",
      value: eligibilityDetails?.programEligibilityFileCadence,
      lastChild: true,
    },
    {
      label: "Eligible group IDs",
      value: eligibilityDetails?.eligibleGroupIds,
      lastChild: true,
    },
    {
      label: "Manual check",
      value: eligibilityDetails?.manualCheck,
      lastChild: true,
      format: "boolean",
    },
    {
      label: "Links to eligibility verification folder",
      value: eligibilityDetails?.linksToEligibilityVerificationFolder,
      lastChild: true,
      format: "link",
    },
    {
      label: "Eligibility exceptions/rules",
      value: eligibilityDetails?.eligibilityExceptionsRules,
      lastChild: true,
    },
    {
      label: "Eligibility team notes",
      value: eligibilityDetails?.eligibilityTeamNotes,
      lastChild: true,
    },
    {
      label: "Complex escalation details",
      value: eligibilityDetails?.complexEscalationDetails,
      lastChild: true,
    },
  ];

  const fetchOpportunityDetails = async (guid: string) => {
    try {
      const response = await api.get<OpportunityDetails>(
        `${API_ENDPOINTS.opportunity}/${guid}`,
      );
      setModalData(response?.data || response);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  const isCCMProduct = category === "Chronic Care Services";
  const isWPAnchorProduct = productTag === "WP Anchor";
  const isWPNonAnchorProduct = productTag === "WP Non-Anchor";
  const isPrimaryCareProduct = productName === "Primary Care";

  const productServiceGeographicRegion = data?.["Billing"]?.direct?.find(
    (field) => field.configCode === EXCLUDED_CONFIG_CODES[0],
  );

  const productServiceData = Array.isArray(
    productServiceGeographicRegion?.value,
  )
    ? productServiceGeographicRegion?.value
    : [];

  return (
    <div className="product-detail-tab-container">
      <Tabs id="uncontrolled-tab-example-sidebar">
        {Object.keys(data).map((key) => {
          const isBilling = key === "Billing";
          const isGeneralSetting = key === "General settings";
          const OpportunityData = Array.isArray(opportunities)
            ? opportunities
            : [];
          const RTEOverride = Array.isArray(billingRteOverrides)
            ? billingRteOverrides
            : [];
          const isMentalHealthProductFlag = isMentalHealthProduct(productName);
          return (
            <Tab eventKey={key} title={key} key={key}>
              {renderContent(data[key], isVisible)}
              {isBilling && (
                <div className="product-table-container">
                  {isPrimaryCareProduct && productServiceData.length > 0 && (
                    <div className="mb-5">
                      <p className="product-container-header">
                        Product services (Geographic location)
                      </p>
                      <CustomTable
                        columns={productServiceColumns}
                        data={productServiceData}
                        showPagination={false}
                      />
                    </div>
                  )}
                  {rteOverrideFlag && (
                    <>
                      <p className="product-container-header">RTE Overrides</p>
                      <CustomTable
                        columns={rteOverrideColumn}
                        data={RTEOverride}
                        showPagination={false}
                      />
                    </>
                  )}
                  {isCCMProduct && (
                    <div className="mt-4">
                      {isWPNonAnchorProduct && (
                        <>
                          <div className="mb-5">
                            {renderNonAnchorFields(
                              "Program Overview",
                              billingProgramOverviewNonAnchor,
                            )}
                          </div>
                          <div className="mb-5">
                            {renderNonAnchorFields(
                              "Contract: Program Schedule (SpringCM)",
                              billingContractProgramScheduleNonAnchor,
                            )}
                          </div>
                          <div className="mb-5">
                            {renderNonAnchorFields(
                              "Member Support",
                              billingMemberSupportNonAnchor,
                            )}
                          </div>
                        </>
                      )}
                      {isWPAnchorProduct && (
                        <div className="accordian-container">
                          <div className="mt-4">
                            <Accordion
                              data={billingProgramOverview}
                              title="Program Overview"
                            />
                          </div>
                          <div className="mt-4">
                            <Accordion
                              data={billingProgramScheduleLayout}
                              title="Contract: Program Schedule (SpringCM)"
                            />
                          </div>
                          <div className="mt-4">
                            <Accordion
                              data={billingPerformanceGuaranteeLayout}
                              title="Contract: Performance Guarantees (SpringCM)"
                            />
                          </div>
                          <div className="mt-4">
                            <Accordion
                              data={billingMemberSupportAnchor}
                              title="Member Support"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {isGeneralSetting && (
                <div className="product-table-container">
                  <p className="product-container-header">Opportunity</p>
                  <CustomTable
                    columns={opportunityColumn}
                    data={OpportunityData}
                    showPagination={false}
                  />
                  <div className="mt-5">
                    {isMentalHealthProductFlag && <div className="mb-5">
                      <div className="product-detail-non-anchor-fields-container">
                        {mentalHealthFields.map((field, index) => (
                          <div
                            className="product-detail-non-anchor-field"
                            key={index}
                          >
                            <DisplayRow
                              label={field.label}
                              value={field.value}
                              format={field.format as DisplayType}
                              lastChild={field.lastChild ?? true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>}
                    {isWPNonAnchorProduct && (
                      <>
                        <div className="mb-5">
                          {renderNonAnchorFields(
                            "Program Overview",
                            programOverview,
                          )}
                        </div>
                        <div className="mb-5">
                          {renderNonAnchorFields(
                            "Contract: Program Schedule (SpringCM)",
                            programSchedule,
                          )}
                        </div>
                      </>
                    )}
                    {isWPAnchorProduct && (
                      <div className="accordian-container">
                        <div>
                          <Accordion
                            data={programOverviewLayout}
                            title="Program Overview"
                          />
                        </div>
                        <div className="mt-4">
                          <Accordion
                            data={contractProgramScheduleLayout}
                            title="Contract: Program Schedule (SpringCM)"
                          />
                        </div>
                        <div className="mt-4">
                          <Accordion
                            data={clientIncentivesLayout}
                            title="Client Incentives"
                          />
                        </div>
                        <div className="mt-4">
                          <Accordion
                            data={clientImplementationLayout}
                            title="Client Implementation"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Tab>
          );
        })}
        {isCCMProduct && (isWPAnchorProduct || isWPNonAnchorProduct) && (
          <Tab eventKey="marketing" title="Marketing" key="marketing">
            {isWPNonAnchorProduct && (
              <>
                <div className="mb-2">
                  {renderNonAnchorFields(
                    "Program Overview",
                    marketingProgramOverviewNonAnchor,
                  )}
                </div>
                <div className="mb-5">
                  {renderNonAnchorFields(
                    "Enrollment marketing",
                    marketingEnrollmentMarketing,
                  )}
                </div>
              </>
            )}
            {isWPAnchorProduct && (
              <>
                <div className="mb-5">
                  <Accordion
                    data={marketingClientIncentiveAnchor}
                    title="Client Incentives"
                  />
                </div>
                <div>
                  <Accordion
                    data={marketingEnrollmentMarketingAnchor}
                    title="Enrollment Marketing"
                  />
                </div>
              </>
            )}
          </Tab>
        )}
        {isCCMProduct && isWPAnchorProduct && (
          <Tab eventKey="eligibility" title="Eligibility" key="eligibility">
            <div className="mb-5">
              <Accordion
                data={programEligibility}
                title="Program Eligibility"
              />
            </div>
          </Tab>
        )}
        {isCCMProduct && isWPAnchorProduct && (
          <Tab
            eventKey="engagement-criteria"
            title="Engagement criteria"
            key="engagement-criteria"
          >
            <div className="mb-5">
              <Accordion
                data={programEngagementCriteria}
                title="Program Engagement Criteria"
              />
            </div>
            <div>
              <Accordion
                data={legacyFields}
                title="Legacy fields (to be deprecated)"
              />
            </div>
          </Tab>
        )}
      </Tabs>
      <SideModal
        show={!!modalData && opportunityId !== null}
        title={modalData?.name ?? ""}
        onHide={() => {
          setModalData(null);
          setOpportunityId(null);
        }}
      >
        <OpportunityDrawer tabs={tabData} data={modalData} />
      </SideModal>
    </div>
  );
};

export default ProductDetail;
