import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import type { ReviewArraySection, ReviewFieldRow, ReviewPageData } from "./reviewFieldRegistry";
import type { AllFieldsPageData } from "./allFieldsRegistry";
import { collectFormFieldKeysForPage, collectRejectedReviewFieldPathMap } from "./reviewFieldRegistry";
import { REVIEW_ADDITIONAL_RESOURCES, ShowAllFieldsToggle } from "./ReviewInProgressView";
import AllFieldsView from "./AllFieldsView";
import EditableRow from "@/components/EditableRow/EditableRow";
import EditableMarketingSiteUsers from "@/components/Marketing/EditableMarketingSiteUsers";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import useEditStore from "@/store/editStore";
import useReviewStore from "@/store/useReviewStore";
import { buildRejectedReviewArrayPayload } from "@/utils";
import {
  MARKETING_SITE_USER_TELEMED_FIELD_KEY,
  GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY,
  getMarketingContactsBase,
} from "@/utils/marketingSiteUsers";

interface ReviewRejectedViewProps {
  pages: ReviewPageData[];
  handleSaveChanges?: (
    pageName: string,
    changedPayload: Record<string, unknown>,
  ) => void;
  activeResource?: string | null;
  onResourceSelect?: (key: string) => void;
  onPageSelect?: () => void;
  resourceContent?: React.ReactNode;
  allFieldsPages?: AllFieldsPageData[];
  showAllFields?: boolean;
  onToggleShowAllFields?: (value: boolean) => void;
}

const MARKETING_SITE_USER_FIELD_KEYS = new Set([
  MARKETING_SITE_USER_TELEMED_FIELD_KEY,
  GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY,
]);

function isMarketingSiteUserField(formFieldKey: string | undefined): boolean {
  return !!formFieldKey && MARKETING_SITE_USER_FIELD_KEYS.has(formFieldKey);
}

interface RejectedSectionProps {
  title: string;
  rows: ReviewFieldRow[];
  formData: Record<string, unknown>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  lastSavedAt?: string | null;
}

const RejectedEditableSection: React.FC<RejectedSectionProps> = ({
  title,
  rows,
  formData,
  onFieldChange,
  lastSavedAt,
}) => {
  const editableRows = rows.filter((row) => row.formFieldKey && row.fieldMetadata);

  if (editableRows.length === 0) return null;

  return (
    <div className="review-section-card review-rebuttal-section">
      {title && <h4 className="review-section-card__title">{title}</h4>}
      <div className="review-rebuttal-section__fields">
        {editableRows.map((row, index) => {
          if (isMarketingSiteUserField(row.formFieldKey)) {
            const pageKey = row.pageKey ?? "";
            const liveEntity = useEditStore.getState().liveEntityData?.[pageKey];
            const fieldPathParts = row.formFieldKey!.split(".");
            let contactsSource = liveEntity;
            for (const part of fieldPathParts.slice(0, -1)) {
              contactsSource = contactsSource?.[part];
            }
            const entityContacts = contactsSource?.[fieldPathParts[fieldPathParts.length - 1]];
            const existingContacts = getMarketingContactsBase(entityContacts);

            return (
              <EditableMarketingSiteUsers
                key={row.formFieldKey}
                label={row.field}
                fieldKey={row.formFieldKey!}
                value={formData[row.formFieldKey!] as string[] ?? row.rawNewValue}
                existingContacts={existingContacts}
                metadata={row.fieldMetadata!}
                onChange={onFieldChange}
                lastSavedAt={lastSavedAt}
                customClass="review-marketing-site-user"
              />
            );
          }

          return (
            <EditableRow
              key={row.formFieldKey}
              label={row.field}
              value={formData[row.formFieldKey!] ?? row.rawNewValue}
              fieldKey={row.formFieldKey!}
              metadata={row.fieldMetadata!}
              onChange={onFieldChange}
              lastChild={index === editableRows.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
};

interface RejectedArraySectionProps {
  arraySections: ReviewArraySection[];
  formData: Record<string, unknown>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
}

const RejectedArrayEditableSection: React.FC<RejectedArraySectionProps> = ({
  arraySections,
  formData,
  onFieldChange,
}) => {
  if (arraySections.length === 0) return null;

  return (
    <>
      {arraySections.map(({ tabLabel, items }) => (
        <div key={tabLabel} className="config-review__array-section review-rebuttal-section">
          {items.map((item) => {
            const editableRows = item.rows.filter(
              (row) => row.formFieldKey && row.fieldMetadata,
            );
            if (editableRows.length === 0) return null;

            return (
              <div key={item.id} className="config-review__array-item">
                <div className="config-review__array-item-header">
                  <RoundedLabel text={tabLabel} variant="grey" />
                  <span className="config-review__array-item-id">{item.id}</span>
                </div>
                <div className="review-rebuttal-section__fields">
                  {editableRows.map((row, index) => (
                    <EditableRow
                      key={row.formFieldKey}
                      label={row.field}
                      value={formData[row.formFieldKey!] ?? row.rawNewValue}
                      fieldKey={row.formFieldKey!}
                      metadata={row.fieldMetadata!}
                      onChange={onFieldChange}
                      lastChild={index === editableRows.length - 1}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

const ARRAY_ID_FIELD_MAP: Record<string, string> = {
  accountRelationships: "accountRelationshipName",
  groupRelationShips: "memberGroupName",
};

const BRACKET_KEY_REGEX = /^([^[]+)\[([^\]]+)\]\.(.+)$/;

const ReviewRejectedView: React.FC<ReviewRejectedViewProps> = ({
  pages,
  handleSaveChanges,
  activeResource,
  onResourceSelect,
  onPageSelect,
  resourceContent,
  allFieldsPages,
  showAllFields = false,
  onToggleShowAllFields,
}) => {
  const [selectedPageKey, setSelectedPageKey] = useState<string>(
    pages[0]?.pageKey ?? "",
  );
  const isInitializing = useRef(true);

  // "Show all fields" browses every metadata page, not just pages with rejected fields.
  const navPages: { pageKey: string; pageLabel: string }[] = showAllFields
    ? allFieldsPages ?? []
    : pages;

  useEffect(() => {
    if (!navPages.some((p) => p.pageKey === selectedPageKey)) {
      setSelectedPageKey(navPages[0]?.pageKey ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllFields, pages, allFieldsPages]);

  const activeAllFieldsPage: AllFieldsPageData | undefined = useMemo(
    () => allFieldsPages?.find((p) => p.pageKey === selectedPageKey),
    [allFieldsPages, selectedPageKey],
  );

  const formData = useEditStore((state) => state.editFormData);
  const originalData = useEditStore((state) => state.editOriginalData);
  const setFormData = useEditStore((state) => state.setEditFormData);
  const setOriginalData = useEditStore((state) => state.setEditOriginalData);
  const updateField = useEditStore((state) => state.updateEditFormField);
  const updateLiveEntityField = useEditStore((state) => state.updateLiveEntityField);
  const lastSavedAt = useEditStore((state) => state.lastSavedAt);
  const clearEditState = useEditStore((state) => state.clearEditState);
  const setRejectedReviewFieldPathByFormKey = useReviewStore(
    (state) => state.setRejectedReviewFieldPathByFormKey,
  );

  const handleArrayFieldChange = useCallback(
    (fieldKey: string, value: unknown) => {
      updateField(fieldKey, value);
      const match = fieldKey.match(BRACKET_KEY_REGEX);
      if (match) {
        const [, arrayRoot, comparisonId, fieldName] = match;
        const idField = ARRAY_ID_FIELD_MAP[arrayRoot] ?? "id";
        const entityArray =
          useEditStore.getState().liveEntityData?.[selectedPageKey]?.[arrayRoot];
        if (Array.isArray(entityArray)) {
          const idx = entityArray.findIndex(
            (item: any) => item[idField] === comparisonId,
          );
          if (idx >= 0) {
            updateLiveEntityField(
              `${selectedPageKey}.${arrayRoot}.${idx}.${fieldName}`,
              value,
            );
          }
        }
      }
    },
    [selectedPageKey, updateField, updateLiveEntityField],
  );

  const activePage: ReviewPageData | undefined = useMemo(
    () => pages.find((p) => p.pageKey === selectedPageKey),
    [pages, selectedPageKey],
  );

  useEffect(() => {
    setRejectedReviewFieldPathByFormKey(collectRejectedReviewFieldPathMap(pages));
  }, [pages, setRejectedReviewFieldPathByFormKey]);

  useEffect(() => {
    const initial: Record<string, unknown> = {};
    pages.forEach((page) => {
      page.tabs.forEach((tab) => {
        tab.sections.forEach((section) => {
          section.rows.forEach((row) => {
            if (row.formFieldKey && row.rawNewValue !== undefined) {
              initial[row.formFieldKey] = row.rawNewValue;
            }
          });
        });
        tab.arrayChangeSections.forEach((arraySection) => {
          arraySection.items.forEach((item) => {
            item.rows.forEach((row) => {
              if (row.formFieldKey && row.rawNewValue !== undefined) {
                initial[row.formFieldKey] = row.rawNewValue;
              }
            });
          });
        });
      });
    });
    setFormData(initial);
    setOriginalData({ ...initial });
    isInitializing.current = true;
    const timer = setTimeout(() => {
      isInitializing.current = false;
    }, 100);
    return () => {
      clearTimeout(timer);
      clearEditState();
    };
  }, [pages, setFormData, setOriginalData, clearEditState]);

  useEffect(() => {
    if (
      isInitializing.current ||
      !handleSaveChanges ||
      !selectedPageKey ||
      Object.keys(formData).length === 0
    ) {
      return;
    }

    const pageFieldKeys = collectFormFieldKeysForPage(pages, selectedPageKey);
    if (pageFieldKeys.length === 0) return;

    const pageFormData: Record<string, unknown> = {};
    const pageOriginalData: Record<string, unknown> = {};
    pageFieldKeys.forEach((key) => {
      if (key in formData) pageFormData[key] = formData[key];
      if (key in originalData) pageOriginalData[key] = originalData[key];
    });

    const liveEntityData = useEditStore.getState().liveEntityData;
    const changedPayload = buildRejectedReviewArrayPayload(
      pageFormData,
      pageOriginalData,
      liveEntityData,
      selectedPageKey,
    );
    if (Object.keys(changedPayload).length > 0) {
      handleSaveChanges(selectedPageKey, changedPayload);
    }
  }, [formData, originalData, selectedPageKey, handleSaveChanges, pages]);

  if (pages.length === 0) {
    return (
      <div className="config-review__main">
        <div className="config-review__content config-review__content--empty">
          <p>No failed fields require correction.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-review__main">
      <nav className="config-review__sidebar">
        {navPages.map((page) => (
          <button
            key={page.pageKey}
            type="button"
            className={`config-review__sidebar-item ${
              !activeResource && page.pageKey === selectedPageKey
                ? "config-review__sidebar-item--active"
                : ""
            }`}
            onClick={() => {
              setSelectedPageKey(page.pageKey);
              onPageSelect?.();
            }}
          >
            {page.pageLabel}
          </button>
        ))}

        <div className="config-review__sidebar-divider" />
        <span className="config-review__sidebar-heading">Additional resources</span>
        {REVIEW_ADDITIONAL_RESOURCES.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`config-review__sidebar-item ${
              activeResource === item.key ? "config-review__sidebar-item--active" : ""
            }`}
            onClick={() => onResourceSelect?.(item.key)}
          >
            {item.name}
          </button>
        ))}

        {onToggleShowAllFields && (
          <ShowAllFieldsToggle
            checked={showAllFields}
            onChange={onToggleShowAllFields}
          />
        )}
      </nav>

      <div className="config-review__content">
        {activeResource ? (
          resourceContent
        ) : showAllFields ? (
          <AllFieldsView page={activeAllFieldsPage} />
        ) : activePage ? (
          <Tabs
            id="review-rebuttal-tabs"
            defaultActiveKey={activePage.tabs[0]?.tabName}
            key={activePage.pageKey}
          >
            {activePage.tabs.map((tab) => (
              <Tab key={tab.tabName} eventKey={tab.tabName} title={tab.tabName}>
                <div className="config-review__tab-content">
                  {tab.sections.map(({ title, rows }) => (
                    <RejectedEditableSection
                      key={title}
                      title={title}
                      rows={rows}
                      formData={formData}
                      onFieldChange={updateField}
                      lastSavedAt={lastSavedAt}
                    />
                  ))}

                  <RejectedArrayEditableSection
                    arraySections={tab.arrayChangeSections}
                    formData={formData}
                    onFieldChange={handleArrayFieldChange}
                  />
                </div>
              </Tab>
            ))}
          </Tabs>
        ) : null}
      </div>
    </div>
  );
};

export default ReviewRejectedView;
