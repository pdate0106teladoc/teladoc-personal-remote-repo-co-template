import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useOutletContext, useParams } from "react-router-dom";
import RenderAllSections from "@/components/RenderAllSection/RenderAllSection";
import PrimaryMarketingContactSection from "@/components/Marketing/PrimaryMarketingContactSection";
import type { ExpandableContactListItem } from "@/components/Marketing/ExpandableContactList";
import ContactDetails from "@/components/sidebar/ContactDetailsSidebar";
import {
  renderMarketingCcm,
  renderMarketingOverview,
  renderMarketingTelemedicine,
} from "@/data/group/marketing";
import useGroupStore from "@/store/useGroupStore";
import { FailSafePage, SideModal } from "@ucc/common-ui";
import { useEditMode } from "@/hooks/useEditMode";
import {
  buildChangedPayload,
  extractFormData,
  extractFormDataFromEntity,
  getNestedValue,
} from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import useEditStore from "@/store/editStore";
import {
  applyMarketingSiteUserContactChanges,
  getMarketingContactsBase,
  GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY,
  isMarketingSiteUserSaveContactArray,
} from "@/utils/marketingSiteUsers";
import { LABELS } from "@/constants";

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  groupMetadata: Record<string, any> | null;
}

const MarketingGrp = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();

  const marketingData = useGroupStore((state) =>
    id ? state.marketingCache[id] : undefined,
  );

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

  const [contactDrawer, setContactDrawer] = useState<{
    name: string;
    id: string;
    contactId: string;
  } | null>(null);

  const handleContactClick = useCallback((selected: ExpandableContactListItem) => {
    if (!selected.contactId) return;
    setContactDrawer({
      name: selected.displayName,
      id: selected.id,
      contactId: selected.contactId,
    });
  }, []);

  const prefixedUpdateField = (fieldKey: string, value: any) => {
    updateField(fieldKey, value);

    if (fieldKey === GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY) {
      const liveContacts = getNestedValue(
        liveEntityData?.groupMarketing,
        GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY,
      );
      const entityBase = getMarketingContactsBase(
        liveContacts,
        marketingData?.overview?.contacts?.marketingSiteUserTelemed,
      ).filter((contact) => contact.marketingSiteUserEnabled !== false);

      if (
        !Array.isArray(value) ||
        value.length === 0 ||
        typeof value[0] === "string"
      ) {
        updateLiveEntityField(
          `groupMarketing.${fieldKey}`,
          entityBase,
        );
        return;
      }

      updateLiveEntityField(
        `groupMarketing.${fieldKey}`,
        applyMarketingSiteUserContactChanges(entityBase, value),
      );
      return;
    }

    updateLiveEntityField(`groupMarketing.${fieldKey}`, value);
  };

  useEffect(() => {
    if (!lastSavedAt || isInitializing.current) return;
    setOriginalData(useEditStore.getState().editFormData);
  }, [lastSavedAt, setOriginalData]);

  useEffect(() => {
    if (mode === "edit" && marketingData && groupMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = groupMetadata.groupMarketing ?? null;
        setMetadata(metadataResponse);
        const initialFormData = metadataResponse
          ? extractFormData(metadataResponse)
          : {};
        const liveMarketing =
          useEditStore.getState().liveEntityData?.groupMarketing;
        const existingFormData = useEditStore.getState().editFormData;

        const hydratedFormData =
          liveMarketing && metadataResponse
            ? {
                ...initialFormData,
                ...extractFormDataFromEntity(liveMarketing, metadataResponse),
              }
            : initialFormData;

        const marketingFieldValue =
          initialFormData[GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY];
        const preservedMarketingValue =
          existingFormData[GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY];
        const shouldPreserveInSessionEdits =
          liveMarketing &&
          preservedMarketingValue !== undefined &&
          isMarketingSiteUserSaveContactArray(preservedMarketingValue);

        hydratedFormData[GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY] =
          shouldPreserveInSessionEdits
            ? preservedMarketingValue
            : marketingFieldValue;

        setFormData(hydratedFormData);
        setOriginalData({
          ...initialFormData,
          [GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY]:
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
  }, [
    mode,
    marketingData,
    groupMetadata,
    setMetadata,
    setFormData,
    setOriginalData,
  ]);

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
        handleSaveChanges("groupMarketing", changedPayload);
      }
    }
  }, [formData, originalData, mode, handleSaveChanges]);

  if (!marketingData) {
    return <FailSafePage cardType="noData" />;
  }

  const sourceData =
    mode === "edit" &&
    liveEntityData?.groupMarketing &&
    Object.keys(liveEntityData.groupMarketing).length > 0
      ? liveEntityData.groupMarketing
      : marketingData;

  const effectiveMetadata = mode === "edit" ? metadata : undefined;

  const marketingOverview = renderMarketingOverview(sourceData, effectiveMetadata);
  const marketingTelemedicines = renderMarketingTelemedicine(
    sourceData,
    effectiveMetadata,
  );
  const marketingCcm = renderMarketingCcm(sourceData, effectiveMetadata);
  const marketingSiteUserContacts = getMarketingContactsBase(
    sourceData?.overview?.contacts?.marketingSiteUserTelemed,
    marketingData?.overview?.contacts?.marketingSiteUserTelemed,
  );

  return (
    <div>
      <Tabs
        defaultActiveKey="Overview"
        id="marketing-tab"
        className={mode === "edit" ? "edit-mode" : ""}
      >
        <Tab eventKey="Overview" title="Overview">
          <RenderAllSections
            data={marketingOverview}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
          <PrimaryMarketingContactSection
            mode={mode}
            fieldKey={GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY}
            contacts={marketingSiteUserContacts}
            editValue={
              formData[GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY]
            }
            metadata={
              metadata?.overview?.contacts?.marketingSiteUserTelemed
            }
            onFieldChange={prefixedUpdateField}
            lastSavedAt={lastSavedAt}
            error={errors[GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY]}
            onContactClick={handleContactClick}
            tooltipContent={LABELS.grpMarketing.LABEL_MARKETING_SITE_USER_TOOLTIP}
          />
        </Tab>
        <Tab eventKey="Telemedicine" title="Telemedicine">
          <RenderAllSections
            data={marketingTelemedicines}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
        <Tab eventKey="CCM" title="CCM">
          <RenderAllSections
            data={marketingCcm}
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

export default MarketingGrp;
