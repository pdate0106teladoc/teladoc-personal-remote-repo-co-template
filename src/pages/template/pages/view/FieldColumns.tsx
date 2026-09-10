import * as React from "react";
import { ReadOnlyField } from "@/pages/template/pages/edit/fields";
import type { FieldPair } from "./types";

interface FieldColumnsProps {
  left: FieldPair[];
  right: FieldPair[];
}

export const FieldColumns: React.FC<FieldColumnsProps> = ({ left, right }) => (
  <div className="edit-fields-grid">
    <div className="edit-fields-column">
      {left.map((field) => (
        <ReadOnlyField
          key={field.label}
          label={field.label}
          value={field.value}
        />
      ))}
    </div>
    <div className="edit-fields-column">
      {right.map((field) => (
        <ReadOnlyField
          key={field.label}
          label={field.label}
          value={field.value}
        />
      ))}
    </div>
  </div>
);
