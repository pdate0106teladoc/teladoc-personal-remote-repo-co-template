import { Tab, Tabs } from "react-bootstrap";
import { useOutletContext, useParams } from "react-router-dom";
import RenderAllSections from "@/components/RenderAllSection/RenderAllSection";
import type {
  ClientMemberCode,
  CmcAssociation,
  GroupOffers,
  RoutingRule,
} from "@/types/GrpView";
import {
  renderClinicalAndMemberSupport,
  renderGeneralSettingOverviewSec1,
  renderGeneralSettingOverviewSec2,
  renderGroupPermissions,
  renderGroupRelationships,
} from "@/data/group/general-setting";
import { CustomCards } from "@/components/Cards/CustomCards";
import { CustomTable, TableColumn, SideModal, FailSafePage } from "@ucc/common-ui";
import { LABELS } from "@/constants";
import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import { useCallback, useEffect, useState, useRef } from "react";
import { SliderChild } from "@/components/sidebar/SliderContentGeneralSettings";
import { CmcAssociationDetails } from "@/components/sidebar/CmcAssociationDetails";
import ContactDetails from "@/components/sidebar/ContactDetailsSidebar";
import EditableField from "@/components/EditableRow/EditableField";
import {
  getSafeString,
  extractFormData,
  extractFormDataFromEntity,
  buildChangedPayload,
  formatDateUTC,
} from "@/utils";
import useGroupStore from "@/store/useGroupStore";
import useConfigStore from "@/store/configStore";
import useEditStore from "@/store/editStore";
import { useEditMode } from "@/hooks/useEditMode";
import { ContactRef } from "@/types";

interface FieldOrder {
  key: string;
  label: string;
  lastChild?: boolean;
  format?: "text" | "date" | "boolean" | "person" | "img" | "link";
}

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  groupMetadata: Record<string, any> | null;
}

const GeneralSettingGrp = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const [showId, setShowId] = useState<string | null>(null);
  const [contactDrawer, setContactDrawer] = useState<{
    name: string;
    mongoId: string;
    contactId: string;
  } | null>(null);
  const handleContactClick = useCallback(async (selected: ContactRef) => {
    if (!selected.contactId || !selected.id) return;
    setContactDrawer({ name: selected.displayName ?? "", mongoId: selected.id, contactId: selected.contactId });
  }, []);
  const generalSettings = useGroupStore((state) =>
    id ? state.generalSettingsCache[id] : undefined,
  );
  const setGroupName = useConfigStore((state) => state.setGroupName);
  const setGroupId = useConfigStore((state) => state.setGroupId);
  const setGroupShortId = useConfigStore((state) => state.setGroupShortId);
  const setUpdatedAt = useConfigStore((state) => state.setGroupUpdatedAt);
  const setOrg = useConfigStore((state) => state.setOrg);
  const groupUpdatedAtStore = useConfigStore((state) => state.groupUpdatedAt);

  const { handleSaveChanges, groupMetadata } = useOutletContext<OutletContext>();
  const mode = candidateId ? "edit" : "view";
  const isInitializing = useRef(true);
  const lastSavedAt = useEditStore((state) => state.lastSavedAt);

  const {
    metadata,
    formData,
    originalData,
    errors,
    updateField,
    updateLiveEntityField,
    setMetadata,
    setFormData,
    setOriginalData,
    liveEntityData,
  } = useEditMode();

  const prefixedUpdateField = (fieldKey: string, value: any) => {
    updateField(fieldKey, value);
    updateLiveEntityField(`groupGeneralSettings.${fieldKey}`, value);
  };

  // After a successful save, reset originalData to current formData
  // so the next diff only captures truly new changes
  useEffect(() => {
    if (!lastSavedAt || isInitializing.current) return;
    setOriginalData(formData);
  }, [lastSavedAt]);

  useEffect(() => {
    if (isInitializing.current) {
      return;
    }

    if (
      mode === "edit" &&
      Object.keys(formData).length > 0 &&
      Object.keys(originalData).length > 0
    ) {
      const changedPayload = buildChangedPayload(formData, originalData);

      if (Object.keys(changedPayload).length > 0) {
        handleSaveChanges("groupGeneralSettings", changedPayload);
      }
    }
  }, [formData, originalData, mode, handleSaveChanges]);

  useEffect(() => {
    if (mode === "edit" && generalSettings && groupMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = groupMetadata.groupGeneralSettings ?? null;
        setMetadata(metadataResponse);
        const initialFormData = metadataResponse
          ? extractFormData(metadataResponse)
          : {};
        const liveGS = useEditStore.getState().liveEntityData?.groupGeneralSettings;
        const hydratedFormData =
          liveGS && metadataResponse
            ? { ...initialFormData, ...extractFormDataFromEntity(liveGS, metadataResponse) }
            : initialFormData;
        setFormData(hydratedFormData);
        setOriginalData(initialFormData);

        setTimeout(() => {
          isInitializing.current = false;
        }, 100);
      }, 500);
    }

    return () => {
      isInitializing.current = true;
    };
  }, [mode, generalSettings, groupMetadata, setMetadata, setFormData, setOriginalData]);

  useEffect(() => {
    const groupOverview = generalSettings?.overview?.groupOverview;
    setGroupName(groupOverview?.groupName || "");
    setGroupId(groupOverview?.legacyGroupId || "");
    setGroupShortId(groupOverview?.groupId || "");
    const apiUpdated = generalSettings?.updatedAt || "";
    if (!groupUpdatedAtStore) {
      setUpdatedAt(apiUpdated || "");
    } else if (apiUpdated) {
      const storeTs = Date.parse(groupUpdatedAtStore);
      const apiTs = Date.parse(apiUpdated);
      if (isNaN(storeTs) && !isNaN(apiTs)) {
        setUpdatedAt(apiUpdated);
      } else if (!isNaN(apiTs) && apiTs > storeTs) {
        setUpdatedAt(apiUpdated);
      }
    }
    setOrg({
      orgName: groupOverview?.organizationName || "",
      orgUUID: groupOverview?.organizationId || "",
    });
  }, [generalSettings, id, setGroupName, setGroupId, setGroupShortId, setUpdatedAt, setOrg, groupUpdatedAtStore]);

  if (!generalSettings) return <FailSafePage cardType="noData" />;

  // In edit mode, use liveEntityData so we show the user's in-progress changes (e.g. after switching tabs)
  const sourceData =
    mode === "edit" &&
      liveEntityData?.groupGeneralSettings &&
      Object.keys(liveEntityData.groupGeneralSettings).length > 0
      ? liveEntityData.groupGeneralSettings
      : generalSettings;

  const clientMemberCodeData = sourceData?.overview?.clientMemberCodes
    ? [sourceData?.overview?.clientMemberCodes]
    : [];

  const cmcAssociationData = Array.isArray(
    sourceData?.overview?.cmcAssociations,
  )
    ? sourceData.overview.cmcAssociations
    : [];
  const routingRulesData = Array.isArray(
    sourceData?.overview?.routingRules,
  )
    ? sourceData.overview.routingRules
    : [];
  const groupOffersData = Array.isArray(sourceData?.overview?.groupOffers)
    ? sourceData.overview.groupOffers
    : [];

  const grpGeneralSettingLabels = LABELS.grpGeneralSetting;

  const fieldsOrderClientMem: FieldOrder[] = [
    {
      key: "cmcRecordType",
      label: grpGeneralSettingLabels.CMC_RECORD_TYPE,
      lastChild: true,
    },
    { key: "code", label: grpGeneralSettingLabels.CODE, lastChild: true },
    {
      key: "usedForRegistration",
      label: grpGeneralSettingLabels.CMC_USED_FOR_REGISTRATION_LABEL,
      lastChild: true,
      format: "boolean",
    },
    {
      key: "isActive",
      label: grpGeneralSettingLabels.ACTIVE,
      lastChild: true,
      format: "boolean",
    },
    {
      key: "effectiveDate",
      label: grpGeneralSettingLabels.EFFECTIVE_DATE_LABEL,
      lastChild: true,
      format: "date",
    },
    {
      key: "deactivatedDate",
      label: grpGeneralSettingLabels.DEACTIVATED_DATE_LABEL,
      lastChild: true,
      format: "date",
    },
    { key: "account", label: grpGeneralSettingLabels.ACCOUNT, lastChild: true },
    {
      key: "lastModifiedDate",
      label: grpGeneralSettingLabels.LAST_MODIFIED_BY_LABEL,
      lastChild: false,
      format: "date",
    },
    {
      key: "organizations",
      label: grpGeneralSettingLabels.ORGANIZATIONS_LABEL,
      lastChild: false,
    },
    {
      key: "groups",
      label: grpGeneralSettingLabels.GROUPS_LABEL,
      lastChild: true,
    },
  ];

  const fieldsOrderCmcAssociation = [
    {
      key: "cmcCode",
      label: grpGeneralSettingLabels.CMC_CODE,
      lastChild: true,
    },
    { key: "account", label: grpGeneralSettingLabels.ACCOUNT, lastChild: true },
    {
      key: "recordType",
      label: grpGeneralSettingLabels.RECORD_TYPE,
      lastChild: true,
    },
    { key: "code", label: grpGeneralSettingLabels.CODE, lastChild: true },
    {
      key: "lastModifiedBy",
      label: grpGeneralSettingLabels.LAST_MODIFIED_BY_LABEL,
      lastChild: true,
    },
  ];

  const clientMemCodeCol: TableColumn<ClientMemberCode>[] = [
    {
      label: grpGeneralSettingLabels.CM_CODE_ASSIGNMENT_ID,
      field: "cmCodeAssignmentId",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      width: "15%",
      render: (_val, row) => (
        <>
          <a
            href=""
            className="render-cell-style text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setShowId(row.cmCodeAssignmentId);
            }}
          >
            {row.cmCodeAssignmentId}
          </a>
          <SideModal
            show={showId === row.cmCodeAssignmentId}
            title={row.cmCodeAssignmentId}
            onHide={() => setShowId(null)}
          >
            <SliderChild
              data={row}
              fieldsOrder={fieldsOrderClientMem}
              data-testid="extract-jsx"
            />
          </SideModal>
        </>
      ),
    },
    {
      label: grpGeneralSettingLabels.CODE,
      field: "code",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      width: "15%",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.code)}</div>
      ),
    },
    {
      label: grpGeneralSettingLabels.CMC_RECORD_TYPE,
      field: "cmcRecordType",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      width: "15%",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.cmcRecordType)}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.CMC_USED_FOR_REGISTRATION_LABEL,
      field: "usedForRegistration",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      width: "15%",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.usedForRegistration, "boolean").jsx}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.ACTIVE,
      field: "isActive",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.isActive, "boolean").jsx}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.ACCOUNT,
      field: "account",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.account)}</div>
      ),
    },
  ];

  const cmcAssociationCol: TableColumn<CmcAssociation>[] = [
    {
      label: grpGeneralSettingLabels.CMC_ASSOCIATION_ID,
      field: "cmcAssociationId",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) =>
        row?.cmcAssociationId ? (
          <>
            <a
              href=""
              className="render-cell-style text-decoration-none"
              onClick={(e) => {
                e.preventDefault();
                setShowId(row.cmcAssociationId);
              }}
            >
              {row.cmcAssociationId}
            </a>
            <SideModal
              show={showId === row.cmcAssociationId}
              title={row.cmcAssociationId}
              onHide={() => setShowId(null)}
            >
              <CmcAssociationDetails
                data={row}
                fieldsOrder={fieldsOrderCmcAssociation}
              />
            </SideModal>
          </>
        ) : (
          "-"
        ),
    },
    {
      label: grpGeneralSettingLabels.RECORD_TYPE,
      field: "recordType",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.recordType)}</div>
      ),
    },
    {
      label: grpGeneralSettingLabels.CMC_CODE,
      field: "cmcCode",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.cmcCode)}</div>
      ),
    },
    {
      label: grpGeneralSettingLabels.PROGRAM_NUMBER,
      field: "programNumber",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.programNumber)}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.PROGRAM_OVERVIEW_NAME,
      field: "programOverviewName",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.programOverviewName)}
        </div>
      ),
    },
  ];

  const routingRulesCol: TableColumn<RoutingRule>[] = [
    {
      label: grpGeneralSettingLabels.SERVICE,
      field: "service",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.service)}</div>
      ),
      width: "20%",
    },
    {
      label: grpGeneralSettingLabels.ROUTING_RULE,
      field: "routingRule",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.routingRule)}
        </div>
      ),
      width: "20%",
    },
    {
      label: grpGeneralSettingLabels.ID,
      field: "id",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.id)}</div>
      ),
      width: "20%",
    },
    {
      label: grpGeneralSettingLabels.DATE_TIME,
      field: "dateTime",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {formatDateUTC(row.dateTime)}
        </div>
      ),
      width: "20%",
    },
    {
      label: grpGeneralSettingLabels.CHANGED_BY,
      field: "changedBy",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="font-color">
          {extractDisplayValue(row?.changedBy, "text").jsx}
        </div>
      ),
    },
  ];

  const groupOffersCol: TableColumn<GroupOffers>[] = [
    {
      label: grpGeneralSettingLabels.PROMOTION,
      field: "promotion",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.promotion)}</div>
      ),
    },
    {
      label: grpGeneralSettingLabels.PROMOTION_TYPE,
      field: "promotionType",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.promotionType)}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.FAMILY,
      field: "family",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.family, "boolean").jsx}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.SERVICE_SPECIALITIES,
      field: "serviceSpecialties",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style text-wrap">
          {Array.isArray(row.serviceSpecialties)
            ? row.serviceSpecialties.join(", ")
            : "-"}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.INTERVAL,
      field: "interval",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.interval)}</div>
      ),
    },
    {
      label: grpGeneralSettingLabels.PER_INTERVAL,
      field: "perInterval",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.perInterval)}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.DISCOUNT_TYPE,
      field: "discountPercent",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => {
        const isAmountOffConsultation =
          row.promotion === "Amount Off Consultation";
        let discountValue: string;

        if (isAmountOffConsultation) {
          discountValue = row.discountAmount != null
            ? `$${row.discountAmount} Off`
            : "";
        } else {
          discountValue = row.discountPercent != null
            ? `${row.discountPercent}% Off`
            : "";
        }
        return (
          <div className="render-cell-style">
            {getSafeString(discountValue)}
          </div>
        );
      },
    },
    {
      label: grpGeneralSettingLabels.DATE_ADDED,
      field: "dateAdded",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.dateAdded, "date").raw}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.CURRENT_START_DATE,
      field: "currentStartDate",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.currentStartDate, "date").raw}
        </div>
      ),
    },
    {
      label: grpGeneralSettingLabels.CURRENT_END_DATE,
      field: "currentEndDate",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.currentEndDate, "date").raw}
        </div>
      ),
    },
  ];

  const effectiveMetadata = mode === "edit" ? metadata : undefined;

  const clientMemberCodeMetadata = effectiveMetadata?.overview?.clientMemberCodes
    ? [effectiveMetadata.overview.clientMemberCodes]
    : undefined;

  const overviewDataSec1 = renderGeneralSettingOverviewSec1(sourceData, effectiveMetadata, handleContactClick);
  const overviewDataSec2 = renderGeneralSettingOverviewSec2(sourceData, effectiveMetadata);
  const groupPermissionData = renderGroupPermissions(sourceData, effectiveMetadata);
  const groupRelationData = renderGroupRelationships(sourceData, effectiveMetadata);
  const clinicalMemSupData = renderClinicalAndMemberSupport(sourceData, effectiveMetadata);

  return (
    <div className="sticky-tabs">
      <Tabs id="uncontrolled-tab-example" className={mode === "edit" ? "edit-mode" : ""} defaultActiveKey="overview">
        <Tab eventKey="overview" title="Overview">
          <RenderAllSections
            data={overviewDataSec1}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
          <CustomCards title="Client Member Code">
            <CustomTable
              data={clientMemberCodeData}
              columns={clientMemCodeCol}
              showPagination={false}
              mode={mode}
              rowMetadata={clientMemberCodeMetadata}
              formData={formData}
              errors={errors}
              onFieldChange={prefixedUpdateField}
              fieldKeyPrefix="overview.clientMemberCodes"
              flatFieldKeys={true}
              editableCellComponent={EditableField}
            />
          </CustomCards>
          <RenderAllSections
            data={overviewDataSec2}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
          <CustomCards title="CMC Associations">
            <CustomTable
              data={cmcAssociationData}
              columns={cmcAssociationCol}
              showPagination={false}
            />
          </CustomCards>
          <CustomCards title="Routing rules">
            <CustomTable
              data={routingRulesData}
              columns={routingRulesCol}
              showPagination={false}
            />
          </CustomCards>
          <CustomCards title="Group offers">
            <CustomTable
              data={groupOffersData}
              columns={groupOffersCol}
              showPagination={false}
            />
          </CustomCards>
        </Tab>
        <Tab eventKey="group-permissions" title="Group permissions">
          <RenderAllSections
            data={groupPermissionData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
        <Tab eventKey="group-relationships" title="Group relationships">
          <RenderAllSections
            data={groupRelationData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
        <Tab
          eventKey="clinical-and-member-support"
          title="Clinical and member support"
        >
          <RenderAllSections
            data={clinicalMemSupData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
      </Tabs>
      <SideModal
        title={contactDrawer?.name ?? ""}
        show={contactDrawer !== null}
        onHide={() => setContactDrawer(null)}
      >
        {contactDrawer && (
          <ContactDetails tabKey="contactInfo" mongoId={contactDrawer.mongoId} contactId={contactDrawer.contactId} />
        )}
      </SideModal>
    </div>
  );
};

export default GeneralSettingGrp;
