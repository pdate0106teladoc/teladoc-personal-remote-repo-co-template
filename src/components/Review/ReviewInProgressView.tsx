import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { ToggleSwitch } from "@ucc/common-ui";
import type { ReviewPageData, ReviewFieldRow } from "./reviewFieldRegistry";
import type { AllFieldsPageData } from "./allFieldsRegistry";
import useReviewStore from "@/store/useReviewStore";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import AllFieldsView from "./AllFieldsView";
import RebuttalSummaryRibbon from "@/components/ReviewSummaryRibbon/RebuttalSummaryRibbon";

export const REVIEW_ADDITIONAL_RESOURCES = [
  { name: "Opportunity", key: "opportunities-edit" },
  { name: "Change request", key: "change-requests" },
  { name: "Files", key: "files" },
  { name: "History", key: "history-logs" },
];

export const ShowAllFieldsToggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ checked, onChange }) => (
  <div className="config-review__sidebar-footer">
    <ToggleSwitch
      id="review-show-all-fields"
      label="Show all fields"
      checked={checked}
      onChange={onChange}
      size="sm"
    />
  </div>
);

interface ReviewInProgressViewProps {
  pages: ReviewPageData[];
  activeResource?: string | null;
  onResourceSelect?: (key: string) => void;
  onPageSelect?: () => void;
  resourceContent?: React.ReactNode;
  allFieldsPages?: AllFieldsPageData[];
  showAllFields?: boolean;
  onToggleShowAllFields?: (value: boolean) => void;
}

interface SectionTableProps {
  sectionKey: string;
  title: string;
  rows: ReviewFieldRow[];
}

const SectionTable: React.FC<SectionTableProps> = ({ sectionKey, title, rows }) => {
  const failedFields = useReviewStore((s) => s.failedFields);
  const setFailedFields = useReviewStore((s) => s.setFailedFields);

  const rowKeys = rows.map((_, i) => `${sectionKey}::${i}`);
  const failedCount = rowKeys.filter((k) => failedFields.has(k)).length;
  const failAll = failedCount === rows.length && rows.length > 0;

  const handleFailAllChange = () => {
    const next = new Set(failedFields);
    if (failAll) {
      rowKeys.forEach((k) => next.delete(k));
    } else {
      rowKeys.forEach((k) => next.add(k));
    }
    setFailedFields(next);
  };

  const handleRowFailChange = (index: number) => {
    const key = rowKeys[index];
    const next = new Set(failedFields);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setFailedFields(next);
  };

  return (
    <div className="review-section-card">
      {title && <h4 className="review-section-card__title">{title}</h4>}
      <table className="review-section-card__table">
        <thead>
          <tr>
            <th className="review-section-card__th"></th>
            <th className="review-section-card__th">Previous value</th>
            <th className="review-section-card__th">Updated value</th>
            <th className="review-section-card__th review-section-card__th--fail">
              <label className="review-section-card__checkbox-label">
                <input
                  type="checkbox"
                  checked={failAll}
                  onChange={handleFailAllChange}
                />
                Fail all
              </label>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="review-section-card__row">
              <td className="review-section-card__td review-section-card__td--field">{row.field}</td>
              <td className="review-section-card__td">{row.previousValue}</td>
              <td className="review-section-card__td">{row.updatedValue}</td>
              <td className="review-section-card__td review-section-card__td--fail">
                <label className="review-section-card__checkbox-label">
                  <input
                    type="checkbox"
                    checked={failedFields.has(rowKeys[i])}
                    onChange={() => handleRowFailChange(i)}
                  />
                  Fail
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReviewInProgressView: React.FC<ReviewInProgressViewProps> = ({
  pages,
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

  // "Show all fields" browses every metadata page, not just pages with changes.
  const navPages: { pageKey: string; pageLabel: string }[] = showAllFields
    ? allFieldsPages ?? []
    : pages;

  useEffect(() => {
    if (!navPages.some((p) => p.pageKey === selectedPageKey)) {
      setSelectedPageKey(navPages[0]?.pageKey ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllFields, pages, allFieldsPages]);

  const activePage: ReviewPageData | undefined = useMemo(
    () => pages.find((p) => p.pageKey === selectedPageKey),
    [pages, selectedPageKey],
  );

  const activeAllFieldsPage: AllFieldsPageData | undefined = useMemo(
    () => allFieldsPages?.find((p) => p.pageKey === selectedPageKey),
    [allFieldsPages, selectedPageKey],
  );

  return (
    <div className="config-review__main">
      <nav className="config-review__sidebar">
        {navPages.map((page) => (
          <button
            key={page.pageKey}
            type="button"
            className={`config-review__sidebar-item ${
              !activeResource && page.pageKey === selectedPageKey ? "config-review__sidebar-item--active" : ""
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
        <RebuttalSummaryRibbon />

        {activeResource ? (
          resourceContent
        ) : showAllFields ? (
          <AllFieldsView page={activeAllFieldsPage} />
        ) : (
          activePage && (
            <Tabs
              id="review-page-tabs"
              defaultActiveKey={activePage.tabs[0]?.tabName}
              key={activePage.pageKey}
            >
              {activePage.tabs.map((tab) => (
                <Tab key={tab.tabName} eventKey={tab.tabName} title={tab.tabName}>
                  <div className="config-review__tab-content">
                    {tab.sections.map(({ title, rows }) => (
                      <SectionTable
                        key={title}
                        sectionKey={`${activePage.pageKey}::${tab.tabName}::${title}`}
                        title={title}
                        rows={rows}
                      />
                    ))}

                    {tab.arrayChangeSections.map(({ tabLabel, items }) => (
                      <div key={tabLabel} className="config-review__array-section">
                        {items.map((item) => (
                          <div key={item.id} className="config-review__array-item">
                            <div className="config-review__array-item-header">
                              <RoundedLabel text={tabLabel} variant="grey" />
                              <span className="config-review__array-item-id">{item.id}</span>
                            </div>
                            <SectionTable
                              sectionKey={`${activePage.pageKey}::${tab.tabName}::${tabLabel}::${item.id}`}
                              title=""
                              rows={item.rows}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </Tab>
              ))}
            </Tabs>
          )
        )}
      </div>
    </div>
  );
};

export default ReviewInProgressView;
