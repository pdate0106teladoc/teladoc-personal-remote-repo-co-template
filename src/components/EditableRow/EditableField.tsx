import { useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { GRP_DETAIL_PATH } from "@/router/routes";
import {
  CustomInput,
  CustomRadioGroup,
  CustomDropdown,
  CustomTextarea,
  DatePicker,
  MultiSelectSearch,
  MultiSelectDropdown,
} from "@ucc/common-ui";
import { DisplayFormat, FieldMetadata, typeInput } from "@/types/edit";
import api from "@/api/apiService";
import { constructLookupUrl } from "@/utils/urlMapper";
import DisplayRow from "@/components/DisplayRow/DisplayRow";
import AddContactModal from "@/pages/contacts/AddContactModal";
import useEditStore from "@/store/editStore";

interface EditableFieldProps {
  value: any;
  fieldKey: string;
  metadata: FieldMetadata;
  onChange: (fieldKey: string, value: any) => void;
  error?: string;
  format?: DisplayFormat;
  onNavigate?: (value: any) => void;
  personMeta?: { name: string; initials?: string };
}

/** Normalizes API/form values into selected option keys for MultiSelectDropdown. */
const parseMultiSelectValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null && item !== "");
  }
  if (typeof value === "string" && value) {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => item != null && item !== "");
        }
      } catch {
        // Fall through to semicolon-separated parsing.
      }
    }
    return trimmed.split(";").filter(Boolean);
  }
  if (value && typeof value === "object") {
    if ("value" in value && "dataType" in value) {
      return parseMultiSelectValue((value as { value: unknown }).value);
    }
    return Object.keys(value as Record<string, boolean>).filter(
      (key) => (value as Record<string, boolean>)[key],
    );
  }
  return [];
};

/** Serializes selected keys for auto-save as a semicolon-delimited string. */
const formatMultiSelectValue = (selectedKeys: string[]): string =>
  selectedKeys.join(";");

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  fieldKey,
  metadata,
  onChange,
  error,
  format,
  onNavigate,
  personMeta,
}) => {
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const storedDisplayName = useEditStore(
    (state) => state.lookupDisplayNames[fieldKey],
  );
  const setLookupDisplayName = useEditStore(
    (state) => state.setLookupDisplayName,
  );
  const [lookupSelected, setLookupSelected] = useState<Record<string, string>>(
    () => {
      if (!value) return {};
      if (typeof value === "string") {
        const name = storedDisplayName || personMeta?.name || value;
        return { [value]: name };
      }
      if (typeof value === "object" && !Array.isArray(value)) return value;
      return {};
    },
  );
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const isGroup = location.pathname.startsWith(GRP_DETAIL_PATH);
  const prodOrgId = isGroup ? "" : id;
  const prodGroupId = isGroup ? id : "";

  const dataPath = metadata.responseDataPath ?? "contacts";
  const idField = metadata.responseIdField ?? "referenceId";
  const lookupItemCacheRef = useRef<Record<string, Record<string, unknown>>>(
    {},
  );

  const lookupApi = {
    get: async (url: string) => {
      const res: any = await api.get(url);
      const payload = res?.data ?? res;
      const remapItem = (item: any) => {
        const id = item?.[idField] ?? item?.referenceId ?? item?.id;
        lookupItemCacheRef.current[String(id)] = item;
        return {
          ...item,
          id,
        };
      };
      if (Array.isArray(payload)) {
        return { data: { [dataPath]: payload.map(remapItem) } };
      }
      const items = payload?.[dataPath];
      if (Array.isArray(items)) {
        payload[dataPath] = items.map(remapItem);
        return { data: payload };
      }

      if (payload && typeof payload === "object" && payload[idField]) {
        return { data: { [dataPath]: [remapItem(payload)] } };
      }
      return { data: payload };
    },
  };

  const validateRegex = (val: string): string | undefined => {
    if (metadata.regex && val) {
      const regex = new RegExp(metadata.regex);
      if (!regex.test(val)) {
        return "Invalid format. Please check your input.";
      }
    }
    return undefined;
  };

  const handleChange = (newValue: any) => {
    onChange(fieldKey, newValue);
  };

  const regexError = metadata.regex && value ? validateRegex(value) : undefined;
  const displayError = error || regexError;

  if (!metadata.editable) {
    const displayValue = value ?? metadata.value;
    const effectivePersonMeta =
      format === "person" && personMeta?.name ? personMeta : undefined;

    return (
      <DisplayRow
        label=""
        value={displayValue}
        format={format}
        lastChild={true}
        onNavigate={onNavigate}
        personMeta={effectivePersonMeta}
      />
    );
  }

  const uiType = metadata.uiComponentType;
  const renderedInput = (() => {
    switch (uiType) {
      case "text":
      case "email":
      case "tel":
      case "number": {
        const inputType =
          metadata.regex && uiType === "number" ? "text" : (uiType ?? "text");
        return (
          <CustomInput
            type={inputType as typeInput}
            value={!value || value === "-" ? "" : value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={metadata.placeholder}
            maxLength={metadata.maxLength || undefined}
            min={metadata.min}
            max={metadata.max}
            error={displayError}
            className="input-style"
          />
        );
      }

      case "textarea":
        return (
          <CustomTextarea
            value={!value || value === "-" ? "" : value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={metadata.placeholder}
            rows={3}
            error={displayError}
          />
        );

      case "date":
      case "datePicker":
        return (
          <>
            <DatePicker
              value={value && new Date(value)}
              onChange={(date) => handleChange(date)}
              placeholder={metadata.placeholder || "Select date..."}
            />
            {displayError && (
              <div className="error-message">{displayError}</div>
            )}
          </>
        );

      case "dropdown": {
        const dropdownOptions =
          metadata.allowedValues?.map((v) => ({ label: v, value: v })) ?? [];
        return (
          <CustomDropdown
            value={value || ""}
            onChange={(selectedValue) => handleChange(selectedValue)}
            options={dropdownOptions}
            placeholder="Select..."
            error={displayError}
          />
        );
      }

      case "checkbox":
        return (
          <CustomRadioGroup
            value={Boolean(value)}
            onChange={(newValue: boolean) => handleChange(newValue)}
            error={displayError}
          />
        );

      case "lookup-fullmatch":
      case "lookup": {
        const allowedValues = metadata.allowedValues;
        const allowedFooter = format === "contact" || format === "person";

        if (!allowedValues || allowedValues.length < 2) {
          return (
            <span className="error-message">Invalid lookup configuration</span>
          );
        }

        const isFullMatchLookup = uiType === "lookup-fullmatch";

        const buildLookupSearchParams = (searchTerm: string) => {
          const url = constructLookupUrl(
            allowedValues,
            searchTerm,
            prodOrgId,
            prodGroupId,
          );
          if (!isFullMatchLookup || !url || !searchTerm) return url;
          const separator = url.includes("?") ? "&" : "?";
          return `${url}${separator}content-document-title=${encodeURIComponent(searchTerm)}`;
        };

        const handleLookupChange = (selected: Record<string, string>) => {
          const keys = Object.keys(selected);
          const selectedValue = keys.length > 0 ? keys[0] : "";
          const displayName = keys.length > 0 ? selected[keys[0]] : "";
          setLookupSelected(selected);
          if (displayName && displayName !== selectedValue) {
            setLookupDisplayName(fieldKey, displayName);
          }
          handleChange(selectedValue);

          const { linkedFieldKey, linkedFieldValueField } = metadata;
          if (linkedFieldKey && linkedFieldValueField) {
            if (!selectedValue) {
              onChange(linkedFieldKey, "");
              return;
            }
            const selectedItem = lookupItemCacheRef.current[selectedValue];
            if (selectedItem) {
              onChange(
                linkedFieldKey,
                selectedItem[linkedFieldValueField] ?? "",
              );
            }
          }
        };

        return (
          <MultiSelectSearch
            label=""
            preSelected={lookupSelected}
            onChange={handleLookupChange}
            api={lookupApi}
            apiUrl=""
            buildSearchParams={buildLookupSearchParams}
            maxResults={metadata.max || 5}
            multiSelect={false}
            responseDataPath={dataPath}
            responseNameField={metadata.responseNameField ?? "name"}
            {...(allowedFooter && {
              footerLabel: "Add new contact",
              onFooterClick: () => setShowAddContactModal(true),
            })}
            isLogoLookup={isFullMatchLookup}
          />
        );
      }

      case "multiSelect": {
        const selectedLabels = parseMultiSelectValue(value);
        const dropdownOptions: Record<string, boolean> =
          metadata.allowedValues?.reduce<Record<string, boolean>>((acc, v) => {
            acc[v] = selectedLabels.includes(v);
            return acc;
          }, {}) ?? {};
        return (
          <>
            <MultiSelectDropdown
              label=""
              options={dropdownOptions}
              onChange={(selectedKeys) =>
                handleChange(formatMultiSelectValue(selectedKeys))
              }
              placeholder="Select..."
            />
            {displayError && (
              <div className="error-message">{displayError}</div>
            )}
          </>
        );
      }

      default:
        return (
          <CustomInput
            value={!value || value === "-" ? "" : value}
            onChange={(e) => handleChange(e.target.value)}
            error={displayError}
            className="input-style"
          />
        );
    }
  })();

  return (
    <>
      {renderedInput}
      {showAddContactModal && (
        <AddContactModal
          show={showAddContactModal}
          onHide={() => setShowAddContactModal(false)}
        />
      )}
    </>
  );
};

export default EditableField;
