import { Tab, Tabs } from "react-bootstrap";
import { useOutletContext, useParams } from "react-router-dom";
import RenderSection from "@/components/RenderAllSection/RenderAllSection";
import PrimaryMarketingContactSection from "@/components/Marketing/PrimaryMarketingContactSection";
import type { ExpandableContactListItem } from "@/components/Marketing/ExpandableContactList";
import ContactDetails from "@/components/sidebar/ContactDetailsSidebar";
import {
  renderMarketingDetails,
  renderTelemedcineDetails,
} from "@/data/organization/marketing";
import { useCallback, useEffect, useState, useRef } from "react";
import useOrgStore from "@/store/useOrgStore";
import useConfigStore from "@/store/configStore";
import { FailSafePage, Loader, SideModal } from "@ucc/common-ui";
import { useEditMode } from "@/hooks/useEditMode";
import { buildChangedPayload, extractFormData, extractFormDataFromEntity, getNestedValue, getOrgConfigFromGeneralSettings } from "@/utils";
import useEditStore from "@/store/editStore";
import {
  applyMarketingSiteUserContactChanges,
  getMarketingContactsBase,
  isMarketingSiteUserSaveContactArray,
  MARKETING_SITE_USER_TELEMED_FIELD_KEY,
} from "@/utils/marketingSiteUsers";
import { LABELS } from "@/constants";

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  orgMetadata: Record<string, any> | null;
}

const MarketingPage = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const { getMarketingData, getGeneralSettings } = useOrgStore();
  const data = getMarketingData(id!);
  const generalSettings = id ? getGeneralSettings(id) : null;
  const setOrg = useConfigStore((state) => state.setOrg);
  const [loading] = useState<boolean>(!data);
  const [contactDrawer, setContactDrawer] = useState<{
    name: string;
    id: string;
    contactId: string;
  } | null>(null);

  const handleContactClick = useCallback((selected: ExpandableContactListItem) => {
    if (!selected.contactId || !selected.id) return;
    setContactDrawer({
      name: selected.displayName,
      id: selected.id,
      contactId: selected.contactId,
    });
  }, []);

  const { handleSaveChanges, orgMetadata } = useOutletContext<OutletContext>();
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

    if (fieldKey === MARKETING_SITE_USER_TELEMED_FIELD_KEY) {
      const liveContacts = getNestedValue(
        liveEntityData?.organizationMarketing,
        MARKETING_SITE_USER_TELEMED_FIELD_KEY,
      );
      const entityBase = getMarketingContactsBase(
        liveContacts,
        data?.details?.contacts?.marketingSiteUserTelemed,
      ).filter((contact) => contact.marketingSiteUserEnabled !== false);

      if (
        !Array.isArray(value) ||
        value.length === 0 ||
        typeof value[0] === "string"
      ) {
        updateLiveEntityField(
          `organizationMarketing.${fieldKey}`,
          entityBase,
        );
        return;
      }

      updateLiveEntityField(
        `organizationMarketing.${fieldKey}`,
        applyMarketingSiteUserContactChanges(entityBase, value),
      );
      return;
    }

    updateLiveEntityField(`organizationMarketing.${fieldKey}`, value);
  };

  // After a successful save, reset baselines so the next diff only captures new changes
  useEffect(() => {
    if (!lastSavedAt || isInitializing.current) return;
    setOriginalData(useEditStore.getState().editFormData);
  }, [lastSavedAt, setOriginalData]);

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
        handleSaveChanges("organizationMarketing", changedPayload);
      }
    }
  }, [formData, originalData, mode, handleSaveChanges]);

  useEffect(() => {
    if (mode === "edit" && data && orgMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = orgMetadata.organizationMarketing ?? null;
        setMetadata(metadataResponse);
        const initialFormData = metadataResponse
          ? extractFormData(metadataResponse)
          : {};
        const liveMarketing =
          useEditStore.getState().liveEntityData?.organizationMarketing;
        const existingFormData = useEditStore.getState().editFormData;

        const hydratedFormData =
          liveMarketing && metadataResponse
            ? {
                ...initialFormData,
                ...extractFormDataFromEntity(liveMarketing, metadataResponse),
              }
            : initialFormData;

        const marketingFieldValue = initialFormData[MARKETING_SITE_USER_TELEMED_FIELD_KEY];
        const preservedMarketingValue =
          existingFormData[MARKETING_SITE_USER_TELEMED_FIELD_KEY];
        const shouldPreserveInSessionEdits =
          liveMarketing &&
          preservedMarketingValue !== undefined &&
          isMarketingSiteUserSaveContactArray(preservedMarketingValue);

        hydratedFormData[MARKETING_SITE_USER_TELEMED_FIELD_KEY] =
          shouldPreserveInSessionEdits
            ? preservedMarketingValue
            : marketingFieldValue;

        setFormData(hydratedFormData);
        setOriginalData({
          ...initialFormData,
          [MARKETING_SITE_USER_TELEMED_FIELD_KEY]:
            marketingFieldValue ?? [],
        });

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
    setOrg(getOrgConfigFromGeneralSettings(generalSettings, data?.updatedAt));
  }, [data, generalSettings, setOrg]);

  if (loading) return <Loader text="Loading..." />;
  if (!data) return <FailSafePage cardType="noData" />;

  // In edit mode, use liveEntityData so we show the user's in-progress changes (e.g. after switching tabs)
  const sourceData =
    mode === "edit" &&
    liveEntityData?.organizationMarketing &&
    Object.keys(liveEntityData.organizationMarketing).length > 0
      ? liveEntityData.organizationMarketing
      : data;

  const printSettings = renderMarketingDetails(
    sourceData,
    mode === "edit" ? metadata : undefined,
    handleContactClick,
  );
  const telemedicine = renderTelemedcineDetails(
    sourceData,
    mode === "edit" ? metadata : undefined,
  );
  const marketingSiteUserContacts = getMarketingContactsBase(
    sourceData?.details?.contacts?.marketingSiteUserTelemed,
    data?.details?.contacts?.marketingSiteUserTelemed,
  );

  return (
    <div className="sticky-tabs">
      <Tabs defaultActiveKey="marketing-overview" id="uncontrolled-tab-example" className={mode === "edit" ? "edit-mode" : ""}>
        <Tab eventKey="marketing-overview" title="Overview">
          <RenderSection
            data={printSettings}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
          <PrimaryMarketingContactSection
            mode={mode}
            contacts={marketingSiteUserContacts}
            editValue={formData["details.contacts.marketingSiteUserTelemed"]}
            metadata={metadata?.details?.contacts?.marketingSiteUserTelemed}
            onFieldChange={prefixedUpdateField}
            lastSavedAt={lastSavedAt}
            error={errors["details.contacts.marketingSiteUserTelemed"]}
            onContactClick={handleContactClick}
            tooltipContent={LABELS.marketing.LABEL_MARKETING_SITE_USER_TOOLTIP}
          />
        </Tab>
        <Tab eventKey="telemedicine" title="Telemedicine">
          <RenderSection
            data={telemedicine}
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
          <ContactDetails
            tabKey="contactInfo"
            mongoId={contactDrawer.id}
            contactId={contactDrawer.contactId}
          />
        )}
      </SideModal>
    </div>
  );
};

export default MarketingPage;
