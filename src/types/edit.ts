export interface Task {
  taskId: string;
  priority: string;
  currentStatus: string;
  updatedBy: string;
  plannedLaunchDate: string;
  typeOfChange: string[];
}

export type ApiReturnedFile = {
  apiReturnedFileName: string;
  url?: string;
  size: number;
  status: "success" | "failure";
  reason?: string;
};
export interface EditConfigPayload {
  priority: string;
  typeOfEdit: string[];
  plannedLaunchDate: string;
  workfrontId: string;
  opportunity: string[];
  playbookLink: string;
  files: string[];
}

interface Entity {
  type: string;
  draftId: string;
}

import type { FileLinkItem } from "@/utils";

export interface TaskResponse {
  id: string;
  taskId: string;
  entities: Entity[];
  priority?: string;
  typeOfEdit: string[];
  plannedLaunchDate: string;
  workfrontId: string;
  opportunity: Opportunity[];
  playbookURL: string;
  fileLink?: FileLinkItem[];
  updatedBy: string;
  versionTimestamp: string;
  changeSource: string;
  status: string;
  assignee: string;
  createdBy?: string;
}

export interface ValidationResponse {
  failedCount: number;
  errorInfo: any[];
  warningInfo: any[];
  timestamp: string;
  status: number;
  ruleSetIds?: string[];
}

export type typeInput =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "date"
  | "time";

export type metaCompoenent =
  | "text"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "date"
  | "number"
  | "email"
  | "tel"
  | "lookup"
  | "multiSelect"
  | "datePicker"
  | "lookup-fullmatch";

export type metaDataType = "STRING" | "NUMBER" | "BOOLEAN" | "DATE";

export type Mode = "view" | "edit";

export type DisplayFormat =
  | "text"
  | "date"
  | "boolean"
  | "person"
  | "img"
  | "link"
  | "contact"
  | "html"
  | "navigate";

export interface FieldMetadata {
  value: any;
  editable: boolean;
  uiComponentType: metaCompoenent
  dataType: metaDataType
  maxLength?: number | null;
  required?: boolean;
  placeholder?: string;
  /** Dropdown options from API; when present used to build options (label and value = each string). Null when not dropdown. */
  allowedValues?: string[] | null;
  min?: number;
  max?: number;
  regex?: string;
  simpleEdits?: boolean;
  L1Required?: boolean;
  L2Required?: boolean;
  responseDataPath?: string;
  responseNameField?: string;
  responseIdField?: string;
  linkedFieldKey?: string;
  linkedFieldValueField?: string;
}

export interface EditableRowProps {
  label: string;
  value: any;
  fieldKey: string;
  metadata: FieldMetadata;
  onChange: (fieldKey: string, value: any) => void;
  error?: string;
  lastChild?: boolean;
  format?: DisplayFormat;
  tooltipContent?: string;
  onNavigate?: (value: any) => void;
  personMeta?: {
    name: string;
    initials?: string;
  };
}

export interface EditType {
  label: string;
  displayOrder: number;
  active: boolean;
  id: string;
}

export interface EditTypesResponse {
  editTypes: EditType[];
}

export interface ClientConfigHistoryItem {
  versionMongoId: string;
  versionId: string;
  versionTimestamp?: string;
  typeOfEdit: string[];
  workfrontId: string;
  /** API may return a single id or a list. */
  opportunity?: Opportunity[]
  workflowStartDate: string;
  changeRequestId: string;
  updatedBy: string;
  changeSource: string;
  changeRequest?: string;
  restoreVersionId?: string;
  draftId: string;
}

/** Normalized row for the history logs table (display strings). */
export interface OrgHistory {
  versionTimestamp: string;
  typeOfEdit: string[];
  workfrontId: string;
  opportunity: Opportunity[];
  workflowStartDate: string;
  changeRequest: string;
  updatedBy: string;
  changeSource?: string;
  versionMongoId: string;
  versionId: string;
  restoreVersionId: string;
  draftId: string;
}

export interface ClientConfigHistoryResponse {
  page: number;
  pageSize: number;
  total: number;
  data: ClientConfigHistoryItem[];
}

export interface Opportunity {
  id: string;
  opportunityName: string;
  opportunityGuid: string;
  revenueEffectiveDate: string;
  type: string;
  contractNumber: string;
  closeDate: string;
}
