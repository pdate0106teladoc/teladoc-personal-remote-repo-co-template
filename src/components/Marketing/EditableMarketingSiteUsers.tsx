import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MultiSelectSearch } from "@ucc/common-ui";
import api from "@/api/apiService";
import { constructLookupUrl } from "@/utils/urlMapper";
import { GRP_DETAIL_PATH } from "@/router/routes";
import { FieldMetadata } from "@/types/edit";
import type {
  MarketingSiteUserContact,
  MarketingSiteUserSaveContact,
} from "@/types/OrgView";
import {
  MARKETING_SITE_USER_TELEMED_FIELD_KEY,
  buildMarketingSiteUserSavePayload,
  getPreSelectedSignature,
  isMarketingSiteUserSaveContactArray,
  mergeContactSaveDeltas,
  resetMarketingSiteUserEditState,
  resolveActivePreSelected,
  selectionToBaselineContacts,
} from "@/utils/marketingSiteUsers";
import "./EditableMarketingSiteUsers.scss";

export { MARKETING_SITE_USER_TELEMED_FIELD_KEY } from "@/utils/marketingSiteUsers";

interface EditableMarketingSiteUsersProps {
  label: string;
  fieldKey?: string;
  value?: string[] | MarketingSiteUserSaveContact[] | null;
  existingContacts?: MarketingSiteUserContact[] | null;
  metadata?: FieldMetadata;
  onChange?: (
    fieldKey: string,
    value: MarketingSiteUserSaveContact[] | string[],
  ) => void;
  lastSavedAt?: string | null;
  error?: string;
  tooltipContent?: string;
  customClass?: string;
}

const EditableMarketingSiteUsers: React.FC<EditableMarketingSiteUsersProps> = ({
  label,
  fieldKey = MARKETING_SITE_USER_TELEMED_FIELD_KEY,
  value,
  existingContacts,
  metadata,
  onChange,
  lastSavedAt,
  error,
  customClass,
}) => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const isGroup = location.pathname.startsWith(GRP_DETAIL_PATH);
  const prodOrgId = isGroup ? "" : id;
  const prodGroupId = isGroup ? id : "";
  const contactCacheRef = useRef<Record<string, Record<string, unknown>>>({});
  const cumulativeDeltaRef = useRef<MarketingSiteUserSaveContact[]>(
    isMarketingSiteUserSaveContactArray(value) ? value : [],
  );

  const initialEnabledContactsRef = useRef<MarketingSiteUserContact[]>(
    (existingContacts ?? []).filter(
      (contact) => contact.marketingSiteUserEnabled !== false,
    ),
  );

  const dataPath = "contacts";
  const nameField = "name";

  const lookupApi = useMemo(
    () => ({
      get: async (url: string) => {
        const res: any = await api.get(url);
        const payload = res?.data ?? res;
        const remapItem = (item: any) => {
          const contactKey = item?.referenceId;
          const displayName = item?.[nameField];
          if (contactKey) {
            contactCacheRef.current[String(contactKey)] = item;
          }
          return {
            ...item,
            id: contactKey,
            [nameField]: displayName,
          };
        };

        if (Array.isArray(payload)) {
          return { data: { [dataPath]: payload.map(remapItem) } };
        }
        const items = payload?.[dataPath];
        if (Array.isArray(items)) {
          payload[dataPath] = items.map(remapItem);
        }
        return { data: payload };
      },
    }),
    [dataPath, nameField],
  );

  const initialPreSelected = resolveActivePreSelected(
    value,
    existingContacts,
    metadata?.value,
  );
  const [selected, setSelected] =
    useState<Record<string, string>>(initialPreSelected);

  const userHasInteracted = useRef(false);
  const valueSignature = getPreSelectedSignature(
    resolveActivePreSelected(value, existingContacts, metadata?.value),
  );
  const prevSignature = useRef(valueSignature);

  useEffect(() => {
    if (userHasInteracted.current) {
      return;
    }

    const nextSelected = resolveActivePreSelected(
      value,
      existingContacts,
      metadata?.value,
    );
    const nextSignature = getPreSelectedSignature(nextSelected);
    if (nextSignature === prevSignature.current) {
      return;
    }

    prevSignature.current = nextSignature;
    cumulativeDeltaRef.current = isMarketingSiteUserSaveContactArray(value)
      ? value
      : [];
    initialEnabledContactsRef.current = (existingContacts ?? []).filter(
      (contact) => contact.marketingSiteUserEnabled !== false,
    );
    setSelected(nextSelected);
  }, [value, existingContacts, metadata?.value]);

  const lastSavedAtRef = useRef<string | null>(null);
  useEffect(() => {
    if (!lastSavedAt || lastSavedAt === lastSavedAtRef.current) {
      return;
    }

    lastSavedAtRef.current = lastSavedAt;
    const resetState = resetMarketingSiteUserEditState(
      existingContacts,
      metadata?.value,
    );
    cumulativeDeltaRef.current = resetState.cumulativeDelta;
    initialEnabledContactsRef.current = resetState.initialEnabledContacts;
    userHasInteracted.current = false;
    prevSignature.current = getPreSelectedSignature(resetState.selected);
    setSelected(resetState.selected);
  }, [lastSavedAt, existingContacts, metadata?.value]);

  const allowedValues = metadata?.allowedValues;
  if (!allowedValues || allowedValues.length < 2) {
    return (
      <span className="error-message">Invalid lookup configuration</span>
    );
  }

  const buildSearchParams = (searchTerm: string) =>
    constructLookupUrl(allowedValues, searchTerm, prodOrgId, prodGroupId);

  const handleChange = (newSelected: Record<string, string>) => {
    userHasInteracted.current = true;
    const previousBaseline = selectionToBaselineContacts(
      selected,
      initialEnabledContactsRef.current,
      contactCacheRef.current,
    );
    const increment = buildMarketingSiteUserSavePayload(
      newSelected,
      previousBaseline,
      contactCacheRef.current,
    );
    const cumulative = mergeContactSaveDeltas(
      cumulativeDeltaRef.current,
      increment,
    );
    cumulativeDeltaRef.current = cumulative;

    setSelected(newSelected);
    onChange?.(
      fieldKey,
      cumulative.length > 0 ? cumulative : (metadata?.value ?? []),
    );
  };

  return (
    <div
      className="expandable-contact-list editable-marketing-site-users"
      data-testid="editable-marketing-site-users"
    >
      <div className={`display-row d-flex m-2 align-items-start${customClass ? ` ${customClass}` : ""}`}>
        <div className="display-label d-flex align-items-center">{label}</div>
        <div className="display-value-col">
          <MultiSelectSearch
            label=""
            customClass="marketing-site-users-multi-select"
            preSelected={selected}
            onChange={handleChange}
            api={lookupApi}
            apiUrl=""
            buildSearchParams={buildSearchParams}
            maxResults={metadata?.max || 5}
            multiSelect={true}
            responseDataPath={dataPath}
            responseNameField={nameField}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default EditableMarketingSiteUsers;
