import { useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MultiSelectSearch } from "@ucc/common-ui";
import api from "@/api/apiService";
import { constructLookupUrl } from "@/utils/urlMapper";
import { GRP_DETAIL_PATH } from "@/router/routes";
import { FieldMetadata } from "@/types/edit";
import { ReportRecipient } from "@/types/OrgView";
import "./EditableGroupRecipients.scss";

interface EditableGroupRecipientsProps {
  fieldKey: string;
  value: ReportRecipient[];
  metadata?: FieldMetadata;
  onChange?: (fieldKey: string, value: ReportRecipient[]) => void;
  error?: string;
}

const toPreSelected = (
  recipients: ReportRecipient[],
): Record<string, string> =>
  Object.fromEntries(
    (recipients ?? [])
      .map((r) => r?.emailAddress?.trim().toLowerCase())
      .filter((e): e is string => Boolean(e))
      .map((email) => [email, email]),
  );

const toRecipients = (selected: Record<string, string>): ReportRecipient[] =>
  Object.keys(selected).map((emailAddress) => ({
    emailAddress,
    emailRecipient: "Work",
  }));

const EditableGroupRecipients: React.FC<EditableGroupRecipientsProps> = ({
  fieldKey,
  value,
  metadata,
  onChange,
  error,
}) => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const isGroup = location.pathname.startsWith(GRP_DETAIL_PATH);
  const prodOrgId = isGroup ? "" : id;
  const prodGroupId = isGroup ? id : "";

  const emailKeyedApi = useMemo(
    () => ({
      get: async (url: string) => {
        const res: any = await api.get(url);
        const payload = res?.data ?? res;
        const remapContact = (c: any) => ({
          ...c,
          id: (c?.email ?? c?.emailAddress ?? c?.id)
            ?.trim()
            .toLowerCase(),
        });
        if (Array.isArray(payload)) {
          return { data: { contacts: payload.map(remapContact) } };
        }
        const contacts = payload?.contacts;
        if (Array.isArray(contacts)) {
          payload.contacts = contacts.map(remapContact);
        }
        return res;
      },
    }),
    [],
  );

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    toPreSelected(value),
  );

  const userHasInteracted = useRef(false);
  const valueSignature = (value ?? [])
    .map((r) => r?.emailAddress?.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join("|");
  const prevSignature = useRef(valueSignature);

  if (prevSignature.current !== valueSignature && !userHasInteracted.current) {
    prevSignature.current = valueSignature;
    setSelected(toPreSelected(value));
  }

  const buildSearchParams = (searchTerm: string) =>
    constructLookupUrl(metadata?.allowedValues, searchTerm, prodOrgId, prodGroupId);

  const handleChange = (newSelected: Record<string, string>) => {
    userHasInteracted.current = true;
    setSelected(newSelected);
    onChange?.(fieldKey, toRecipients(newSelected));
  };

  return (
    <div className="editable-group-recipients">
      <div className="recipients-label">Email:</div>
      <div className="recipients-value">
        <MultiSelectSearch
          label=""
          customClass="recipients-multi-select"
          preSelected={selected}
          onChange={handleChange}
          api={emailKeyedApi}
          apiUrl=""
          buildSearchParams={buildSearchParams}
          maxResults={metadata?.max || 5}
          multiSelect={true}
          responseDataPath="contacts"
          responseNameField="email"
        />
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default EditableGroupRecipients;
