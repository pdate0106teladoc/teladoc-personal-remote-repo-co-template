import type { FieldPair } from "./types";

export const FieldGrid = ({ fields }: { fields: FieldPair[] }) => (
  <dl className="detail-grid">
    {fields.map((field) => (
      <div className="detail-pair" key={field.label}>
        <dt>{field.label}</dt>
        <dd>{field.value}</dd>
      </div>
    ))}
  </dl>
);
