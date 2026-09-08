import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useOutletContext, useParams } from "react-router-dom";
import RenderAllSections from "@/components/RenderAllSection/RenderAllSection";
import {
  renderBillingOverview,
  renderInvoiceDetails,
} from "@/data/organization/billing";
import { useCallback, useEffect, useState, useRef } from "react";

import useOrgStore from "@/store/useOrgStore";
import useConfigStore from "@/store/configStore";
import { FailSafePage, Loader, SideModal } from "@ucc/common-ui";
import ContactDetails from "@/components/sidebar/ContactDetailsSidebar";
import type { ContactRef } from "@/types";
import { useEditMode } from "@/hooks/useEditMode";
import { buildChangedPayload, extractFormData } from "@/utils";
import useEditStore from "@/store/editStore";

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  orgMetadata: Record<string, any> | null;
}

const BillingPage = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const { getBillingData, setBillingData } = useOrgStore();
  const data = id ? getBillingData(id!) : null;
  const [loading] = useState<boolean>(!data);
  const setOrg = useConfigStore((state) => state.setOrg);
  const [contactDrawer, setContactDrawer] = useState<{
    name: string;
    mongoId: string;
    contactId: string;
  } | null>(null);
  const handleContactClick = useCallback(async (selected: ContactRef) => {
    if (!selected.contactId || !selected.id) return;
    setContactDrawer({ name: selected.displayName ?? "", mongoId: selected.id, contactId: selected.contactId });
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
    updateLiveEntityField(`organizationBilling.${fieldKey}`, value);
  };

  // After a successful save, reset originalData to current formData
  // so the next diff only captures truly new changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        handleSaveChanges("organizationBilling", changedPayload);
      }
    }
  }, [formData, originalData, mode, handleSaveChanges]);

  useEffect(() => {
    if (mode === "edit" && data && orgMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = orgMetadata.organizationBilling ?? null;
        setMetadata(metadataResponse);
        const initialFormData = metadataResponse
          ? extractFormData(metadataResponse)
          : {};
        setFormData(initialFormData);
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
      updatedAt: data?.updatedAt || "",
    });
  }, [setBillingData, data, id, setOrg]);

  if (loading) return <Loader text="Loading..." />;
  if (!data) return <FailSafePage cardType="noData" />;

  // In edit mode, use liveEntityData so we show the user's in-progress changes (e.g. after switching tabs)
  const sourceData =
    mode === "edit" &&
      liveEntityData?.organizationBilling &&
      Object.keys(liveEntityData.organizationBilling).length > 0
      ? liveEntityData.organizationBilling
      : data;

  const billingOverviewData = renderBillingOverview(
    sourceData,
    mode === "edit" ? metadata : undefined,
  );
  const billingInvoiceData = renderInvoiceDetails(
    sourceData,
    mode === "edit" ? metadata : undefined,
    handleContactClick
  );

  return (
    <div>
      <Tabs defaultActiveKey="Overview" id="uncontrolled-tab-example" className={mode === "edit" ? "edit-mode" : ""}>
        <Tab eventKey="Overview" title="Overview">
          <RenderAllSections
            data={billingOverviewData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
        <Tab eventKey="invoice-detail" title="Invoice detail">
          <RenderAllSections
            data={billingInvoiceData}
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

export default BillingPage;
