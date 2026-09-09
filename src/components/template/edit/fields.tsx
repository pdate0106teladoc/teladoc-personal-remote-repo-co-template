import * as React from "react";
import { BsChevronDown } from "react-icons/bs";
import { CustomDropdown, CustomInput, CustomRadioGroup } from "@ucc/common-ui";
import "./fields.scss";

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, children }) => (
  <label className="edit-field">
    <span className="edit-field-label">{label}</span>
    <span className="edit-field-control">{children}</span>
  </label>
);

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

/** Values the template owns rather than the editor, shown as plain text. */
export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
}) => (
  <div className="edit-field">
    <span className="edit-field-label">{label}</span>
    <span className="edit-field-control read-only-value">{value}</span>
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

/** A select that also shows the initial badge the design puts on people. */
export const PersonSelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
}) => (
  <Field label={label}>
    <span className="person-control">
      {value && (
        <span className="person-initial" aria-hidden>
          {value.charAt(0).toUpperCase()}
        </span>
      )}
      <CustomDropdown
        placeholder="Select"
        value={value}
        customClass="edit-dropdown"
        options={options.map((option) => ({ label: option, value: option }))}
        onChange={onChange}
      />
    </span>
  </Field>
);

interface RadioFieldProps {
  label: string;
  value: boolean;
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
      <CustomRadioGroup value={value} onChange={onChange} />
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
}

export const EditSection: React.FC<EditSectionProps> = ({
  title,
  children,
}) => {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <section className="edit-section">
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
      {expanded && <div className="edit-section-content">{children}</div>}
    </section>
  );
};
