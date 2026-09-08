import { useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MultiSelectSearch, StatusRibbon } from "@ucc/common-ui";
import api from "@/api/apiService";
import { constructLookupUrl } from "@/utils/urlMapper";
import { GRP_DETAIL_PATH } from "@/router/routes";
import { FieldMetadata } from "@/types/edit";
import { ReportRecipient } from "@/types/OrgView";
import useOrgStore from "@/store/useOrgStore";
import { LABELS, RIBBON_MSSG, VALIDATION_REGEX } from "@/constants";
import "./EditableGroupRecipients.scss";
import AddContactModal from "@/pages/contacts/AddContactModal";
import CreateReportContactModal from "./CreateReportContactModal";

type RecipientField = "to" | "bcc";
type FooterAction = "email-only" | "create";

interface EditableReportRecipientsProps {
  fieldKey: string;
  value: ReportRecipient[];
  metadata?: FieldMetadata;
  onChange?: (fieldKey: string, value: ReportRecipient[]) => void;
  error?: string;
  /**
   * True for the report being drafted, which creates contacts through its own
   * lightweight modal instead of the saved reports' AddContactModal flow.
   */
  isNewReport?: boolean;
}

const filterByType = (
  recipients: ReportRecipient[],
  type: "to" | "bcc",
): Record<string, string> =>
  Object.fromEntries(
    (recipients ?? [])
      .filter((r) => r?.emailRecipient?.toLowerCase() === type)
      .map((r) => r?.emailAddress?.trim().toLowerCase())
      .filter((e): e is string => Boolean(e))
      .map((email) => [email, email]),
  );

const toEmailLabels = (
  selected: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(Object.keys(selected).map((email) => [email, email]));

const mergeRecipients = (
  toSelected: Record<string, string>,
  bccSelected: Record<string, string>,
): ReportRecipient[] => [
  ...Object.keys(toSelected).map((emailAddress) => ({
    emailAddress,
    emailRecipient: "To",
  })),
  ...Object.keys(bccSelected).map((emailAddress) => ({
    emailAddress,
    emailRecipient: "Bcc",
  })),
];

const getSignature = (recipients: ReportRecipient[]): string =>
  (recipients ?? [])
    .map(
      (r) =>
        `${r?.emailRecipient?.toLowerCase()}:${r?.emailAddress?.trim().toLowerCase()}`,
    )
    .filter((s) => s !== ":")
    .sort()
    .join("|");

const EditableReportRecipients: React.FC<EditableReportRecipientsProps> = ({
  fieldKey,
  value,
  metadata,
  onChange,
  error,
  isNewReport = false,
}) => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const isGroup = location.pathname.startsWith(GRP_DETAIL_PATH);
  const prodOrgId = isGroup ? "" : id;
  const prodGroupId = isGroup ? id : "";
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  // Which field opened the create-contact modal, so the contact lands there.
  const [createContactFor, setCreateContactFor] = useState<RecipientField | null>(null);
  const [emailOnlyError, setEmailOnlyError] = useState<
    Partial<Record<RecipientField, string>>
  >({});
  // The drafted-report footer holds two actions inside one clickable row, so the
  // pressed one is recorded on mousedown and read when the row's click lands.
  const footerActionRef = useRef<FooterAction>("create");
  // Bumped to remount a lookup after we add a recipient behind its back: the
  // library owns its input text and would otherwise leave the typed address
  // sitting next to the chip it just became.
  const [lookupResetKey, setLookupResetKey] = useState<Record<RecipientField, number>>(
    { to: 0, bcc: 0 },
  );
  const [toSearchTerm, setToSearchTerm] = useState("");
  const [bccSearchTerm, setBccSearchTerm] = useState("");
  const accountOverview = useOrgStore((state) =>
    isGroup
      ? undefined
      : state.generalSettingCache[id]?.overview?.accountOverview,
  );
  const isTdAccountVerified =
    accountOverview?.accountMapping?.telemed?.verificationStatus === "VERIFIED";
  const showTdAccountError = !isGroup && !isTdAccountVerified;
  const accountName = accountOverview?.organizationName || "This organization";

  const emailKeyedApi = useMemo(
    () => ({
      get: async (url: string) => {
        const res: any = await api.get(url);
        const payload = res?.data ?? res;
        const remapContact = (c: any) => {
          const email = (c?.email ?? c?.emailAddress ?? c?.id)
            ?.trim()
            .toLowerCase();
          const name = c?.name?.trim();
          return {
            ...c,
            id: email,
            displayLabel: (
              <span className="recipient-option">
                <span className="recipient-option-name">{name || email}</span>
                {name && email && (
                  <span className="recipient-option-email">{email}</span>
                )}
              </span>
            ),
          };
        };
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

  const [toSelected, setToSelected] = useState<Record<string, string>>(() =>
    filterByType(value, "to"),
  );
  const [bccSelected, setBccSelected] = useState<Record<string, string>>(() =>
    filterByType(value, "bcc"),
  );

  const userHasInteracted = useRef(false);
  const valueSignature = getSignature(value);
  const prevSignature = useRef(valueSignature);

  if (prevSignature.current !== valueSignature && !userHasInteracted.current) {
    prevSignature.current = valueSignature;
    setToSelected(filterByType(value, "to"));
    setBccSelected(filterByType(value, "bcc"));
  }

  const buildSearchParams = (searchTerm: string) =>
    constructLookupUrl(
      metadata?.allowedValues,
      searchTerm,
      prodOrgId,
      prodGroupId,
    );

const buildToSearchParams = (searchTerm: string) => {
  const trimmed = searchTerm.trim();
  setToSearchTerm(trimmed);
  setEmailOnlyError((prev) => ({ ...prev, to: undefined }));
  return buildSearchParams(trimmed);
};

  const buildBccSearchParams = (searchTerm: string) => {
    setBccSearchTerm(searchTerm.trim());
    setEmailOnlyError((prev) => ({ ...prev, bcc: undefined }));
    return buildSearchParams(searchTerm);
  };

  const handleToChange = (newSelected: Record<string, string>) => {
    userHasInteracted.current = true;
    const emailLabels = toEmailLabels(newSelected);
    setToSelected(emailLabels);
    onChange?.(fieldKey, mergeRecipients(emailLabels, bccSelected));
  };

  const handleBccChange = (newSelected: Record<string, string>) => {
    userHasInteracted.current = true;
    const emailLabels = toEmailLabels(newSelected);
    setBccSelected(emailLabels);
    onChange?.(fieldKey, mergeRecipients(toSelected, emailLabels));
  };

  const addRecipient = (field: RecipientField, email: string) => {
    userHasInteracted.current = true;
    setLookupResetKey((prev) => ({ ...prev, [field]: prev[field] + 1 }));
    if (field === "bcc") setBccSearchTerm("");
    else setToSearchTerm("");

    if (field === "bcc") {
      const nextBcc = { ...bccSelected, [email]: email };
      setBccSelected(nextBcc);
      onChange?.(fieldKey, mergeRecipients(toSelected, nextBcc));
      return;
    }

    const nextTo = { ...toSelected, [email]: email };
    setToSelected(nextTo);
    onChange?.(fieldKey, mergeRecipients(nextTo, bccSelected));
  };

  /** Takes the typed address as the recipient, without creating a contact for it. */
  const addTypedEmailOnly = (field: RecipientField) => {
    const typed = (field === "bcc" ? bccSearchTerm : toSearchTerm)
      .trim()
      .toLowerCase();

    if (!VALIDATION_REGEX.EMAIL.test(typed)) {
      setEmailOnlyError((prev) => ({
        ...prev,
        [field]: LABELS.reporting.CONTACT_EMAIL_INVALID,
      }));
      return;
    }

    setEmailOnlyError((prev) => ({ ...prev, [field]: undefined }));
    addRecipient(field, typed);
  };

  const handleFooterClick = (field: RecipientField) => {
    if (!isNewReport) {
      setShowAddContactModal(true);
      return;
    }
    if (footerActionRef.current === "email-only") {
      addTypedEmailOnly(field);
      return;
    }
    setCreateContactFor(field);
  };

  const handleContactCreated = ({ email }: { email: string }) => {
    addRecipient(createContactFor ?? "to", email.trim().toLowerCase());
    setCreateContactFor(null);
  };

  /**
   * Both drafted-report actions live in the footer node. The installed
   * MultiSelectSearch types `footerLabel` as a string but renders it as children,
   * hence the cast; clicks are left to bubble so the library still closes the
   * dropdown for us.
   */
  const renderFooterLabel = (field: RecipientField): string => {
    if (!isNewReport) {
      const term = field === "bcc" ? bccSearchTerm : toSearchTerm;
      return `${LABELS.reporting.NO_MATCH_CREATE_NEW_CONTACT} "${term}"`;
    }

    return (
      <span className="recipients-footer-actions">
        <span
          className="recipients-footer-action"
          data-testid={`use-email-only-${field}`}
          onMouseDown={() => {
            footerActionRef.current = "email-only";
          }}
        >
          {LABELS.reporting.USE_EMAIL_ONLY}
        </span>
        <span
          className="recipients-footer-action"
          data-testid={`create-new-contact-${field}`}
          onMouseDown={() => {
            footerActionRef.current = "create";
          }}
        >
          {LABELS.reporting.CREATE_NEW_CONTACT}
        </span>
      </span>
    ) as unknown as string;
  };

  return (
    <div className="editable-report-recipients">
      <div className="editable-group-recipients">
        <div className="recipients-label">To:</div>
        <div className="recipients-value">
          <MultiSelectSearch
            key={`to-${lookupResetKey.to}`}
            label=""
            customClass="recipients-multi-select recipients-multi-select-to"
            preSelected={toSelected}
            onChange={handleToChange}
            api={emailKeyedApi}
            apiUrl=""
            buildSearchParams={buildToSearchParams}
            maxResults={metadata?.max || 5}
            multiSelect={true}
            responseDataPath="contacts"
            responseNameField="displayLabel"
            {...{
              footerLabel: renderFooterLabel("to"),
              onFooterClick: () => handleFooterClick("to"),
            }}
          />
          {emailOnlyError.to && (
            <div className="error-message">{emailOnlyError.to}</div>
          )}
          {showTdAccountError && (
            <div className="recipients-error-ribbon">
              <StatusRibbon
                type="error"
                title={RIBBON_MSSG.CANT_SAVE_REPORTING_RECIPIENTS}
                message={`${RIBBON_MSSG.REPORTING_RECIPIENTS_CANNOT_BE_SAVED} ${accountName} ${RIBBON_MSSG.NEEDS_VERIFIED_TD_ACCOUNT}`}
              />
            </div>
          )}
        </div>
      </div>
      <div className="editable-group-recipients">
        <div className="recipients-label">BCC:</div>
        <div className="recipients-value">
          <MultiSelectSearch
            key={`bcc-${lookupResetKey.bcc}`}
            label=""
            customClass="recipients-multi-select recipients-multi-select-bcc"
            preSelected={bccSelected}
            onChange={handleBccChange}
            api={emailKeyedApi}
            apiUrl=""
            buildSearchParams={buildBccSearchParams}
            maxResults={metadata?.max || 5}
            multiSelect={true}
            responseDataPath="contacts"
            responseNameField="displayLabel"
            {...{
              footerLabel: renderFooterLabel("bcc"),
              onFooterClick: () => handleFooterClick("bcc"),
            }}
          />
          {emailOnlyError.bcc && (
            <div className="error-message">{emailOnlyError.bcc}</div>
          )}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {showAddContactModal && (
        <AddContactModal
          show={showAddContactModal}
          onHide={() => setShowAddContactModal(false)}
        />
      )}
      {createContactFor && (
        <CreateReportContactModal
          show
          initialEmail={createContactFor === "bcc" ? bccSearchTerm : toSearchTerm}
          recipientLabel={createContactFor === "bcc" ? "Bcc" : "To"}
          onHide={() => setCreateContactFor(null)}
          onBackToSearch={() => setCreateContactFor(null)}
          onCreated={handleContactCreated}
        />
      )}
    </div>
  );
};

export default EditableReportRecipients;
