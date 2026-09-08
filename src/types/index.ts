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
  | "tel";

export type metaDataType = "STRING" | "NUMBER" | "BOOLEAN" | "DATE";

export type Mode = "view" | "edit";

export interface ContactRef {
  id: string;
  contactId: string;
  displayName: string;
}

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
  