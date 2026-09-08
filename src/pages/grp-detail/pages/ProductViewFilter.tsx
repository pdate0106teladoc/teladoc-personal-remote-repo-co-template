import * as React from "react";
import { useCallback, useState } from "react";
import { CheckboxGroup } from "@ucc/common-ui";
import "../styles/ProductViewFilter.css";
import { Button } from "@ucc/common-ui"
import { DatePicker } from '@ucc/common-ui';
import { Scope, useFilterStore } from "@/store/filterStore";
import { dateRangeCount, hasAny, toLocalDateOnly } from "@/utils";
import { LABELS } from "@/constants";

const membership = [
  { label: "Per member per month (PMPM)", value: "PMPM" },
  { label: "Per employee per month (PEPM)", value: "PEPM" },
  { label: "Per participant per month (PPPM)", value: "PPPM" },
];

const bundleType = [
  { label: "WP Anchor", value: "WP Anchor" },
  { label: "WP Non Anchor", value: "WP Non-Anchor" },
  { label: "Standalone", value: "Standalone" },
];

const serviceCategory = [
  { label: "Telehealth Services", value: "Telehealth Services" },
  { label: "Chronic care services", value: "Chronic Care Services" },
  { label: "Mental health services", value: "Mental Health Services" },
  { label: "Expert medical services", value: "Expert Medical Services" },
  { label: "Platform and program services", value: "Platform and Program Services" },
  { label: "Partner services", value: "Partner Services" },
];
interface ProductViewFilterProps {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  onExposeClear?: (fn: () => void) => void;
  scope: Scope;
}

const ProductViewFilter: React.FC<ProductViewFilterProps> = ({
  setOpenModal,
  onExposeClear,
  scope,
}) => {
  const getFilters = useFilterStore((s) => s.getFilters);
  const setFilters = useFilterStore((s) => s.setFilters);
  const setApplied = useFilterStore((s) => s.setApplied);
  const clearStore = useFilterStore((s) => s.clear);

  const initial = getFilters(scope);
  const [membershipValue, setMembershipValue] = useState<string[]>(
    initial.membershipFilter,
  );
  const [bundleTypeValue, setBundleType] = useState<string[]>(
    initial.bundleTypeFilter,
  );
  const [serviceCategoryValue, setServiceCategoryValue] = useState<string[]>(
    initial.serviceCategoryFilter,
  );
  const [minAgeValue, setMinAgeValue] = useState<number>(initial.minAgeFilter);
  const [fromEffectiveDateValue, setFromEffectiveDate] = useState<string>(
    initial.fromEffectiveDateRange,
  );
  const [toEffectiveDateValue, setToEffectiveDate] = useState<string>(
    initial.toEffectiveDateRange,
  );
  const [fromTermDateValue, setFromTermDate] = useState<string>(
    initial.fromTermDateRange,
  );
  const [toTermDateValue, setToTermDate] = useState<string>(
    initial.toTermDateRange,
  );

  const handleApplyFilters = () => {
    const appliedKeys = computeApplied();
    const appliedCount = computeAppliedFiltersCount();
    setFilters(scope, {
      membershipFilter: membershipValue,
      bundleTypeFilter: bundleTypeValue,
      serviceCategoryFilter: serviceCategoryValue,
      minAgeFilter: minAgeValue,
      fromEffectiveDateRange: fromEffectiveDateValue,
      toEffectiveDateRange: toEffectiveDateValue,
      fromTermDateRange: fromTermDateValue,
      toTermDateRange: toTermDateValue,
    });
    setApplied(scope, {
      filterApplied: appliedCount,
      filteredAppliedKeys: appliedKeys,
    });

    setOpenModal(false);
  };

  const handleClearFilters = useCallback(() => {
    setMembershipValue([]);
    setBundleType([]);
    setServiceCategoryValue([]);
    setMinAgeValue(0);
    setFromEffectiveDate("");
    setToEffectiveDate("");
    setFromTermDate("");
    setToTermDate("");
    clearStore(scope);
  }, [clearStore, scope]);

  onExposeClear?.(handleClearFilters);

  const computeAppliedFiltersCount = () => {
    let count = 0;
    count += hasAny(membershipValue) ? 1 : 0;
    count += hasAny(bundleTypeValue) ? 1 : 0;
    count += hasAny(serviceCategoryValue) ? 1 : 0;
    count += minAgeValue > 0 ? 1 : 0;
    count += dateRangeCount(fromEffectiveDateValue, toEffectiveDateValue);
    count += dateRangeCount(fromTermDateValue, toTermDateValue);
    return count;
  };

  const computeApplied = (): string[] => {
    const applied: string[] = [];
    if (membershipValue.length) applied.push("Membership Type");
    if (bundleTypeValue.length) applied.push("Bundle Type");
    if (serviceCategoryValue.length) applied.push("Service Category");
    if (minAgeValue > 0) applied.push("Minimum Age");
    if (fromEffectiveDateValue || toEffectiveDateValue)
      applied.push("Effective Date Range");
    if (fromTermDateValue || toTermDateValue) applied.push("Term Date Range");
    return applied;
  };

  return (
    <div className="container">
      <div className="content">
        <CheckboxGroup
          title="Membership fee type"
          options={membership}
          selectedValues={membershipValue}
          onChange={(values: string[]) => {
            setMembershipValue(values);
          }}
        />
        <CheckboxGroup
          title={LABELS.products.BUNDLE_TYPE}
          options={bundleType}
          selectedValues={bundleTypeValue}
          onChange={(values: string[]) => {
            setBundleType(values);
          }}
        />
        <div className="subContent">
          <label className="label">{LABELS.products.MINIMUM_AGE}</label>
          <input
            value={minAgeValue}
            type="number"
            placeholder="Age"
            className="form-control input"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setMinAgeValue(Number(e.target.value));
            }}
          />
        </div>
        <CheckboxGroup
          title={LABELS.products.SERVICE_CATEGORY}
          options={serviceCategory}
          selectedValues={serviceCategoryValue}
          onChange={(values: string[]) => {
            setServiceCategoryValue(values);
          }}
        />
        <div className="subContent date-range">
          <label className="label">{LABELS.products.EFFECTIVE_DATE_RANGE}</label>
          <div className="date-range-inputs">
            <DatePicker
              value={toLocalDateOnly(fromEffectiveDateValue)!}
              onChange={(e: Date | null) => {
                setFromEffectiveDate(e ? e.toISOString() : "");
              }}
              disablePastDates={false}
            />
            <span>-</span>
            <DatePicker
              value={toLocalDateOnly(toEffectiveDateValue)!}
              onChange={(e: Date | null) => {
                setToEffectiveDate(e ? e.toISOString() : "");
              }}
              disablePastDates={false}
            />
          </div>
        </div>
        <div className="subContent date-range">
          <label className="label">{LABELS.products.TERM_DATE_RANGE}</label>
          <div className="date-range-inputs">
            <DatePicker
              value={toLocalDateOnly(fromTermDateValue)!}
              onChange={(e: Date | null) => {
                setFromTermDate(e ? e.toISOString() : "");
              }}
              disablePastDates={false}
            />
            <span>-</span>
            <DatePicker
              value={toLocalDateOnly(toTermDateValue)!}
              onChange={(e: Date | null) => {
                setToTermDate(e ? e.toISOString() : "");
              }}
              disablePastDates={false}
            />
          </div>
        </div>
      </div>
      <div className="footer">
        <Button variant="secondary" onClick={handleClearFilters}>
          {LABELS.products.CLEAR_ALL}
        </Button>
        <Button variant="primary" onClick={handleApplyFilters}>
          {LABELS.products.SHOW_RESULTS}
        </Button>
      </div>
    </div>
  );
};

export default ProductViewFilter;
