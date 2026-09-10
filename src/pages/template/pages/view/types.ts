export interface TemplateSummary {
  id: string;
  name: string;
  createdOn: string;
  lastUsedOn: string;
  totalCount?: number;
  activeCount?: number;
}

export interface FieldPair {
  label: string;
  value: string;
}

export interface TemplateDetail {
  overviewLeft: FieldPair[];
  overviewRight: FieldPair[];
  groupRelationship: FieldPair[];
}
