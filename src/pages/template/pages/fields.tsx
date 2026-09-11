import * as React from "react";
import { BsChevronDown } from "react-icons/bs";
import { CustomDropdown, CustomInput, CustomRadioGroup, CustomTextarea } from "@ucc/common-ui";
import { getInitials } from "@/utils";
import "@/pages/template/style/fields.scss";

interface FieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  required,
  className,
  children,
}) => (
  <label className={`edit-field${className ? ` ${className}` : ""}`}>
    <span className="edit-field-label">
      {label}
      {required && <span className="mandatory-asterisk">*</span>}
    </span>
    <span className="edit-field-control">{children}</span>
  </label>
);

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  format?: "person";
}

/** Values the template owns rather than the editor, shown as plain text. */
export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  format,
}) => (
  <div className="edit-field">
    <span className="edit-field-label">{label}</span>
    <span className="edit-field-control read-only-value">
      {format === "person" && value ? (
        <span className="person-readonly">
          <span className="person-initial" aria-hidden>
            {getInitials(value)}
          </span>
          <span className="person-name">{value}</span>
        </span>
      ) : (
        value
      )}
    </span>
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
}) => (
  <Field label={label}>
    <CustomDropdown
      placeholder="Select"
      value={value}
      customClass="edit-dropdown"
      options={options.map((option) => ({ label: option, value: option }))}
      onChange={onChange}
    />
  </Field>
);

/** Person dropdown in edit mode; view mode adds the initials badge separately. */
export const PersonSelectField: React.FC<SelectFieldProps> = SelectField;

interface RadioFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export const RadioField: React.FC<RadioFieldProps> = ({
  label,
  value,
  onChange,
}) => (
  <div className="edit-field radio-field">
    <span className="edit-field-label">{label}</span>
    <span className="edit-field-control">
      {/* The group types its value as boolean, but leaves both options
          unchecked for anything else, which is how `null` reads here. */}
      <CustomRadioGroup value={value as boolean} onChange={onChange} />
    </span>
  </div>
);

interface TextFieldProps {
  label: string;
  /** Also the input's name and the suffix of its id. */
  field: string;
  value: string;
  type?: "text" | "tel" | "date";
  onChange: (value: string) => void;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  field,
  value,
  type = "text",
  onChange,
}) => (
  <Field label={label}>
    <CustomInput
      id={`edit-${field}`}
      name={field}
      type={type}
      className="input-style"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete="off"
    />
  </Field>
);

interface TextAreaFieldProps {
  label: string;
  field: string;
  value: string;
  onChange: (value: string) => void;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  field,
  value,
  onChange,
}) => (
  <Field label={label} className="textarea-field">
    <CustomTextarea
      id={`edit-${field}`}
      name={field}
      className="input-style"
      value={value}
      rows={3}
      onChange={(event) => onChange(event.target.value)}
    />
  </Field>
);

/** A text field with the currency symbol pinned inside the control. */
export const CurrencyField: React.FC<Omit<TextFieldProps, "type">> = ({
  label,
  field,
  value,
  onChange,
}) => (
  <Field label={label}>
    <span className="currency-control">
      <span className="currency-symbol" aria-hidden>
        $
      </span>
      <CustomInput
        id={`edit-${field}`}
        name={field}
        className="input-style"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </span>
  </Field>
);

interface EditSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}

export const EditSection: React.FC<EditSectionProps> = ({
  title,
  children,
  collapsible = true,
}) => {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <section className="edit-section">
      {collapsible ? (
        <button
          type="button"
          className="edit-section-toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <BsChevronDown
            className={`section-chevron${expanded ? "" : " collapsed"}`}
            aria-hidden
          />
          {title}
        </button>
      ) : (
        <h4 className="edit-section-toggle">{title}</h4>
      )}
      {(!collapsible || expanded) && (
        <div className="edit-section-content">{children}</div>
      )}
    </section>
  );
};
