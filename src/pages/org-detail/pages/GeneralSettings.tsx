import {
  ClientTags,
  ContractOps,
  File,
  VendorPointSolution,
} from "@/types/OrgView";
import { Tab, Tabs } from "react-bootstrap";
import { useOutletContext, useParams } from "react-router-dom";
import { CustomCards } from "@/components/Cards/CustomCards";
import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import { CustomTable, FailSafePage, TableColumn, Loader, SideModal, hasPermission, getUserPermissions, } from "@ucc/common-ui";
import RenderAllSections from "@/components/RenderAllSection/RenderAllSection";
import {
  renderGeneralSettingOverview,
  renderAccountRelationShipData,
  renderPermissions,
} from "@/data/organization/general-settings";
import { useCallback, useEffect, useRef, useState } from "react";
import { LABELS } from "@/constants";
import {
  formatDateUTC,
  getInitials,
  getSafeString,
  phoneFormat,
  extractFormData,
  extractFormDataFromEntity,
  buildChangedPayload,
} from "@/utils";
import useConfigStore from "@/store/configStore";
import useOrgStore from "@/store/useOrgStore";
import useEditStore from "@/store/editStore";
import AccountRltnCard from "@/components/Cards/AccountRltnCard";
import BrokerCard from "@/components/Cards/BrokerCard";
import ChangeLcrmTelemedicineSlider, { LcrmRelationshipType } from "@/components/ChangeLcrmTelemedicineSlider/ChangeLcrmTelemedicineSlider";
import { useEditMode } from "@/hooks/useEditMode";
import EditableField from "@/components/EditableRow/EditableField";
import ContactDetails from "@/components/sidebar/ContactDetailsSidebar";
import { ContactRef } from "@/types";

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  orgMetadata: Record<string, any> | null;
}

const GeneralSetting = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const { getGeneralSettings, getBillingData } = useOrgStore();
  const data = getGeneralSettings(id!);
  const billingData = id ? getBillingData(id!) : null;
  const setOrg = useConfigStore((state) => state.setOrg);
  const [showLcrmSlider, setShowLcrmSlider] = useState(false);
  const [sliderTitle, setSliderTitle] = useState("Change LCRM Telemed Account");
  const [sliderSource, setSliderSource] = useState<"telemed" | "livongo">("telemed");

  const openSlider = (title: string, source: "telemed" | "livongo") => {
    setSliderTitle(title);
    setSliderSource(source);
    setShowLcrmSlider(true);
  };
  const [loading] = useState<boolean>(!data);

  const { handleSaveChanges, orgMetadata } = useOutletContext<OutletContext>();
  const mode = candidateId ? "edit" : "view";
  const isInitializing = useRef(true);
  const lastSavedAt = useEditStore((state) => state.lastSavedAt);
  const [contactDrawer, setContactDrawer] = useState<{
    name: string;
    mongoId: string;
    contactId: string;
  } | null>(null);
  const userPermission = getUserPermissions();
  const hasAccountMappingPermission = hasPermission(userPermission, "org-account-map:edit");
  const handleContactClick = useCallback(async (selected: ContactRef) => {
    if (!selected.contactId || !selected.id) return;
    setContactDrawer({ name: selected.displayName ?? "", mongoId: selected.id, contactId: selected.contactId });
  }, []);

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
    updateLiveEntityField(`organizationGeneralSettings.${fieldKey}`, value);
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
        handleSaveChanges("organizationGeneralSettings", changedPayload);
      }
    }
  }, [formData, originalData, mode, handleSaveChanges]);

  useEffect(() => {
    if (mode === "edit" && data && orgMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = orgMetadata.organizationGeneralSettings ?? null;
        setMetadata(metadataResponse);
        const initialFormData = metadataResponse
          ? extractFormData(metadataResponse)
          : {};
        const liveGS =
          useEditStore.getState().liveEntityData?.organizationGeneralSettings;
        const hydratedFormData =
          liveGS && metadataResponse
            ? {
                ...initialFormData,
                ...extractFormDataFromEntity(liveGS, metadataResponse),
              }
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
  }, [mode, data, orgMetadata, setMetadata, setFormData, setOriginalData]);

  useEffect(() => {
    setOrg({
      orgName: data?.overview?.accountOverview?.organizationName || "",
      orgId: data?.overview?.accountOverview?.organizationId || "",
      updatedAt: data?.updatedAt || "",
    });
  }, [data, id]);

  if (loading) return <Loader text="Loading..." />;
  if (!data) return <FailSafePage cardType="noData" />;

  // In edit mode, use liveEntityData so we show the user's in-progress changes (e.g. after switching tabs)
  const sourceData =
    mode === "edit" &&
      liveEntityData?.organizationGeneralSettings &&
      Object.keys(liveEntityData.organizationGeneralSettings).length > 0
      ? liveEntityData.organizationGeneralSettings
      : data;

  const overviewData = renderGeneralSettingOverview(
    sourceData,
    mode !== "edit" && hasAccountMappingPermission ? () => openSlider("Change LCRM Telemed Account", "telemed") : undefined,
    mode !== "edit" && hasAccountMappingPermission ? () => openSlider("Change CCM Livongo Account", "livongo") : undefined,
    mode !== "edit" && hasAccountMappingPermission ? () => openSlider("Verify LCRM Telemed Account", "telemed") : undefined,
    mode !== "edit" && hasAccountMappingPermission ? () => openSlider("Verify CCM Livongo Account", "livongo") : undefined,
    mode === "edit" ? metadata : undefined,
    handleContactClick,
  );
  const permissionData = renderPermissions(
    sourceData,
    mode === "edit" ? metadata : undefined,
  );

  const filesColumn: TableColumn<File>[] = [
    {
      field: "title",
      label: "Title",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.title)}</div>
      ),
      width: "25%",
    },
    {
      label: "Owner",
      field: "owner",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div>
          {
            extractDisplayValue(row?.owner, "person", {
              name: row?.owner,
              initials: getInitials(row.owner),
            }).jsx
          }
        </div>
      ),
      width: "25%",
    },
    {
      label: "Last Modified",
      field: "lastModified",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {formatDateUTC(row.lastModified) ?? "-"}
        </div>
      ),
      width: "25%",
    },
    {
      label: "Size",
      field: "size",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row?.size)}</div>
      ),
    },
  ];

  const historicalColumn: TableColumn<ClientTags>[] = [
    {
      label: "Client Tag",
      field: "clientTag",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.clientTag)}</div>
      ),
      width: "50%",
    },
    {
      label: "Client Tag Assignment ID",
      field: "clientTagAssignmentId",
      hasToggleMenu: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.clientTagAssignmentId)}
        </div>
      ),
      width: "50%",
    },
  ];
  const vendorPointSolutionsCol: TableColumn<VendorPointSolution>[] = [
    {
      label: LABELS.generalSetting.VENDOR_POINT,
      field: "vendorPoint",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row.vendorPoint)}
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.CATEGORY,
      field: "category",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{getSafeString(row.category)}</div>
      ),
    },
    {
      label: LABELS.generalSetting.EFFECTIVE_START_DATE,
      field: "effectiveStartDate",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.effectiveStartDate, "date").jsx}
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.PHONE_NUMBER,
      field: "phoneNumber",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">{phoneFormat(row.phoneNumber)}</div>
      ),
    },
    {
      label: LABELS.generalSetting.WEBSITE,
      field: "website",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.website, "link").jsx}
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.DESCRIPTION,
      field: "description",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style no-wrap">
          {getSafeString(row.description)}
        </div>
      ),
    },
  ];
  const contractopsCol: TableColumn<ContractOps>[] = [
    {
      label: LABELS.generalSetting.CONTRACT,
      field: "contract",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style font-color">
          {getSafeString(row.contract)}
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.ORIGINAL_CONTRACT,
      field: "originalContract",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style font-color">
          {getSafeString(row.originalContract)}
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.CURRENT_CONTRACT_ID,
      field: "currentContractID",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style font-color">
          {getSafeString(row.currentContractID)}
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.CONTRACT_OPS_OWNER,
      field: "contractOpsOwner",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {
            extractDisplayValue(row.contractOpsOwner, "person", {
              name: row.contractOpsOwner,
              initials: getInitials(row.contractOpsOwner),
            }).jsx
          }
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.COPO_CONFIGURATION_TEAM_STATUS,
      field: "coPoConfigurationTeamStatus",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style font-color">
          {getSafeString(row.coPoConfigurationTeamStatus)}
        </div>
      ),
    },
    {
      label: LABELS.generalSetting.CONTRACT_OPS_STAGE,
      field: "contractOpsStage",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style font-color">
          {getSafeString(row.contractOpsStage)}
        </div>
      ),
    },
  ];
  const accountOverview = data?.overview?.accountOverview;
  const accountMapping = accountOverview?.accountMapping;
  const currentAccountGuid = sliderSource === "telemed"
    ? accountMapping?.telemed?.accountGuid
    : accountMapping?.livongo?.accountGuid;
  const currentAccountName = sliderSource === "telemed"
    ? accountOverview?.nameLcrmTeladoc
    : accountOverview?.nameLcrmLivongo;
  const currentVerificationStatus = sliderSource === "telemed"
    ? accountMapping?.telemed?.verificationStatus
    : accountMapping?.livongo?.verificationStatus;
  const currentLinkageType = (sliderSource === "telemed"
    ? accountMapping?.telemed?.linkageType
    : accountMapping?.livongo?.linkageType) as LcrmRelationshipType | undefined;
  // TODO: derive from billing data once billing store is wired – used by LCRM slider
  const isBillingOrg = billingData?.overview?.billingOverView?.billingEnabledAtThisOrgLevel === true;
  const vendorTableData = Array.isArray(sourceData?.overview?.vendorPointSolutions)
    ? sourceData.overview.vendorPointSolutions
    : [];
  const effectiveMetadata = mode === "edit" ? metadata : undefined;
  const vendorPointMetadata = Array.isArray(effectiveMetadata?.overview?.vendorPointSolutions)
    ? effectiveMetadata.overview.vendorPointSolutions
    : undefined;
  const historicalDetailsTableData = Array.isArray(
    sourceData?.historicalDetails?.clientTags,
  )
    ? sourceData.historicalDetails.clientTags
    : [];
  const filesTableData = Array.isArray(data?.files) ? data.files : [];
  const accountRelationData = renderAccountRelationShipData(
    sourceData,
    mode === "edit" ? metadata : undefined,
  );
  const dataForActiveBroker = data?.accountRelationships?.filter(d =>
    (d?.partnerRelationshipsToTeladoc?.toLowerCase() === "broker" || d?.partnerRelationshipsToTeladoc?.toLowerCase() === "benefit consultant") && (d.isBrokerActive)
  );
  const dataForInactiveBroker = data?.accountRelationships?.filter(d =>
    (d?.partnerRelationshipsToTeladoc?.toLowerCase() === "broker" || d?.partnerRelationshipsToTeladoc?.toLowerCase() === "benefit consultant") && (!d.isBrokerActive)
  );
  return (
    <div className="sticky-tabs">
      <Tabs id="uncontrolled-tab-example" className={mode === "edit" ? "edit-mode" : ""} defaultActiveKey="overview">
        <Tab eventKey="overview" title="Overview">
          <RenderAllSections
            data={overviewData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
          <CustomCards title="Vendor point solutions">
            <CustomTable
              data={vendorTableData}
              columns={vendorPointSolutionsCol}
              showPagination={false}
              mode={mode}
              rowMetadata={vendorPointMetadata}
              formData={formData}
              errors={errors}
              onFieldChange={prefixedUpdateField}
              fieldKeyPrefix="overview.vendorPointSolutions"
              editableCellComponent={EditableField}
            />
          </CustomCards>

          {/* Change / Verify LCRM Account slider */}
          <SideModal
            show={showLcrmSlider}
            title={sliderTitle}
            onHide={() => setShowLcrmSlider(false)}
          >
            <ChangeLcrmTelemedicineSlider
              isBillingOrg={isBillingOrg}
              currentAccountName={currentAccountName}
              currentAccountGuid={currentAccountGuid}
              currentVerificationStatus={currentVerificationStatus}
              currentRelationshipType={currentLinkageType}
              organizationName={accountOverview?.organizationName}
              organizationUUID={id}
              organizationId={accountOverview?.organizationId}
              source={sliderSource}
              onClose={() => setShowLcrmSlider(false)}
              onSave={() => setShowLcrmSlider(false)}
            />
          </SideModal>
        </Tab>
        <Tab eventKey="permissions" title="Permissions">
          <RenderAllSections
            data={permissionData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
        <Tab eventKey="accountRelationships" title="Account relationships">
          <AccountRltnCard
            data={accountRelationData}
            mode={mode}
            formData={formData}
            errors={errors}
            onFieldChange={prefixedUpdateField}
          />
        </Tab>
        <Tab eventKey="brokerscommisions" title="Brokers commissions">
          <Tabs className="padding-8" id="uncontrolled-tab-example" >
            <Tab eventKey="active" title={`Active (${dataForActiveBroker?.length ?? 0})`}>
              {
                dataForActiveBroker?.length ?
                  <BrokerCard dataForBroker={dataForActiveBroker} />
                  :
                  <FailSafePage cardType="noActiveBroker" />
              }
            </Tab>
            <Tab eventKey="inactive" title={`Inactive (${dataForInactiveBroker?.length ?? 0})`}>
              {
                dataForInactiveBroker?.length ?
                  <BrokerCard dataForBroker={dataForInactiveBroker} />
                  :
                  <FailSafePage cardType="noInactiveBroker" />
              }
            </Tab>
          </Tabs>
        </Tab>
        <Tab eventKey="historicalDetails" title="Historical details">
          <CustomCards title="Contract ops">
            <CustomTable
              data={sourceData.historicalDetails?.contractOps || []}
              columns={contractopsCol}
              showPagination={false}
            />
          </CustomCards>
          <CustomCards title="Client tags">
            <CustomTable
              data={historicalDetailsTableData}
              columns={historicalColumn}
              showPagination={false}
            />
          </CustomCards>
        </Tab>
        <Tab eventKey="files" title="Files">
          <CustomCards title={`Files (${filesTableData.length})`}>
            <CustomTable
              data={filesTableData}
              columns={filesColumn}
              showPagination={false}
            />
          </CustomCards>
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

export default GeneralSetting;
