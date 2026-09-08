import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { GRP_DETAIL_PATH } from "@/router/routes";
import { AccountRelationshipSectionData } from "@/types/OrgView";
import {
  DisplayRow,
  FailSafePage,
  MultiSelectSearch,
} from "@ucc/common-ui";
import { Card } from "react-bootstrap";
import EditableRow from "@/components/EditableRow/EditableRow";
import api from "@/api/apiService";
import { constructLookupUrl } from "@/utils/urlMapper";

interface CustomCardsProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  brokerType?: string;
  isEditMode?: boolean;
  titleEditable?: boolean;
  titleFieldKey?: string;
  titleMetadata?: any;
  titleError?: string;
  onTitleChange?: (fieldKey: string, value: any) => void;
}

const buildTitleLookupSelection = (title?: string): Record<string, string> =>
  title ? { [title]: title } : {};

const CustomCards = ({
  children,
  title,
  className,
  brokerType,
  isEditMode,
  titleEditable,
  titleFieldKey,
  titleMetadata,
  onTitleChange,
}: CustomCardsProps) => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const isGroup = location.pathname.startsWith(GRP_DETAIL_PATH);
  const prodOrgId = isGroup ? "" : id;
  const prodGroupId = isGroup ? id : "";

  const [lookupSelected, setLookupSelected] = useState<Record<string, string>>(
    () => buildTitleLookupSelection(title),
  );

  const userHasInteracted = useRef(false);

  useEffect(() => {
    if (!userHasInteracted.current) {
      setLookupSelected(buildTitleLookupSelection(title));
    }
  }, [title]);

  const lookupApi = {
    get: async (url: string) => {
      const res: any = await api.get(url);
      const payload = res?.data ?? res;
      const remapResult = (item: any) => ({
        ...item,
        id: item?.account_name ?? item?.account_guid ?? item?.account_uuid,
      });
      if (Array.isArray(payload)) {
        return { data: { results: payload.map(remapResult) } };
      }
      const results = payload?.results;
      if (Array.isArray(results)) {
        payload.results = results.map(remapResult);
      }
      return res;
    },
  };

  const allowedValues = titleMetadata?.allowedValues;

  const buildLookupSearchParams = (searchTerm: string) =>
    constructLookupUrl(allowedValues, searchTerm, prodOrgId, prodGroupId);

  const handleLookupChange = (selected: Record<string, string>) => {
    userHasInteracted.current = true;
    const keys = Object.keys(selected);
    const selectedValue = keys.length > 0 ? keys[0] : "";
    setLookupSelected(selected);
    if (titleFieldKey && onTitleChange) {
      onTitleChange(titleFieldKey, selectedValue);
    }
  };

  const type = brokerType
    ? brokerType?.startsWith("REL")
      ? "Telemed"
      : "Chronic care"
    : "-";
  return (
    <>
      <Card
        className={`custom-card ${className ?? ""} ${isEditMode ? "edit-mode" : ""}`}
      >
        {(
          <Card.Header className="custom-card-header">
            <div className="d-flex flex-column">
              <div className="d-flex flex-row align-items-center">
                <div className="title-pill-gray">
                  <span className="pill-text-gray">{type}</span>
                </div>
                <span className="serial-number">{brokerType ?? "-"}</span>
              </div>
              {titleEditable &&
              titleFieldKey &&
              titleMetadata &&
              onTitleChange ? (
                <div className="main-title-edit w-25">
                  <MultiSelectSearch
                    label=""
                    preSelected={lookupSelected}
                    onChange={handleLookupChange}
                    api={lookupApi}
                    apiUrl=""
                    buildSearchParams={buildLookupSearchParams}
                    maxResults={titleMetadata.max || 5}
                    multiSelect={false}
                    responseDataPath="results"
                    responseNameField="account_name"
                  />
                </div>
              ) : (
                <span className="main-title">{title ?? "-"}</span>
              )}
            </div>
          </Card.Header>
        )}
        <Card.Body className="custom-card-body">
          <div className="row">{children}</div>
        </Card.Body>
      </Card>
    </>
  );
};

interface AccountRltnCardProps {
  data: Array<AccountRelationshipSectionData>;
  className?: string;
  mode?: "view" | "edit";
  formData?: Record<string, any>;
  errors?: Record<string, string>;
  onFieldChange?: (fieldKey: string, value: any) => void;
}

const AccountRltnCard: React.FC<AccountRltnCardProps> = ({
  data,
  className,
  mode = "view",
  errors = {},
  onFieldChange,
}) => {
  if (!data || !data.length) return <FailSafePage cardType="noData" />;
  return (
    <>
      {data.map((sectionData, idx) =>
        Object.entries(sectionData).map(([sectionTitle, sectionColumns]) => {
          const columns = Object.entries(sectionColumns?.rows);
          const colWidth = Math.floor(12 / columns.length);
          const brokerType = sectionColumns?.brokerType;
          const titleFieldKey = sectionColumns?.titleFieldKey;
          const titleMetadata = sectionColumns?.titleMetadata;
          const titleValue = sectionTitle;
          const isTitleEditable =
            mode === "edit" &&
            !!titleMetadata?.editable &&
            !!titleFieldKey &&
            !!onFieldChange;

          return (
            <CustomCards
              key={titleFieldKey ?? `${sectionTitle}-${idx}`}
              title={titleValue}
              brokerType={brokerType}
              data-testid={"custom-card"}
              className={className}
              isEditMode={mode === "edit"}
              titleEditable={isTitleEditable}
              titleFieldKey={titleFieldKey}
              titleMetadata={titleMetadata}
              titleError={titleFieldKey ? errors[titleFieldKey] : undefined}
              onTitleChange={onFieldChange}
            >
              {columns.map(([colKey, items]) => (
                <div
                  key={`${sectionTitle}-${colKey}`}
                  className={`col-${colWidth}`}
                >
                  {items.map((item, itemIndex) => {
                    const fieldKey = item.fieldKey;
                    const currentValue = item.value;

                    if (
                      mode === "edit" &&
                      item.metadata &&
                      fieldKey &&
                      onFieldChange
                    ) {
                      const editValue =
                        typeof currentValue === "object" && currentValue !== null && "value" in currentValue
                          ? currentValue.value
                          : currentValue;
                      return (
                        <EditableRow
                          key={fieldKey}
                          label={item.label}
                          value={editValue}
                          fieldKey={fieldKey}
                          metadata={item.metadata}
                          onChange={onFieldChange}
                          error={errors[fieldKey]}
                          lastChild={item.lastChild}
                          format={item.format as any}
                          personMeta={item.personMeta}
                        />
                      );
                    }

                    return (
                      <DisplayRow
                        key={`${colKey}-${itemIndex}`}
                        label={item.label}
                        value={currentValue}
                        format={item.format}
                        lastChild={item.lastChild}
                        tooltipContent={item.tooltipContent}
                        personMeta={item.personMeta}
                      />
                    );
                  })}
                </div>
              ))}
            </CustomCards>
          );
        }),
      )}
    </>
  );
};

export default AccountRltnCard;
