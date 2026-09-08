import React from "react";
import { CustomInput, CustomDropdown, MultiSelectDropdown } from "@ucc/common-ui";
import type { BasicFormValues, BasicFormErrors } from "./types/contactBasicFormTypes";
import { STATE_OPTIONS } from "@/utils";

interface ContactBasicFormProps {
    values: BasicFormValues;
    errors: BasicFormErrors;
    onChange: (field: keyof BasicFormValues, value: string | Record<string, boolean>) => void;
}

const ContactBasicForm: React.FC<ContactBasicFormProps> = ({ values, errors, onChange }) => {
    const handleRolesChange = (selected: string[]) => {
        const updated = { ...values.roles };
        Object.keys(updated).forEach((k) => { updated[k] = selected.includes(k); });
        onChange("roles", updated);
    };

    return (
        <div className="d-flex flex-column gap-4 contact-basic-form">
            <CustomInput
                label="Name"
                value={values.name}
                onChange={(e) => onChange("name", e.target.value)}
                required
                error={errors.name}
                autoComplete="off"
            />
            <CustomInput
                label="Title"
                value={values.title}
                onChange={(e) => onChange("title", e.target.value)}
                autoComplete="off"
            />
            <MultiSelectDropdown
                label="Contact role"
                options={values.roles}
                onChange={handleRolesChange}
                customClass="multi-drop"
            />
            <CustomInput
                label="Phone"
                value={values.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                type="tel"
                autoComplete="off"
                className="w-25"
                error={errors.phone}
            />
            <CustomInput
                label="Email"
                value={values.email}
                onChange={(e) => onChange("email", e.target.value)}
                type="email"
                required
                error={errors.email}
                autoComplete="off"
            />
            <CustomInput
                label="Street address"
                value={values.street}
                onChange={(e) => onChange("street", e.target.value)}
                error={errors.street}
                autoComplete="off"
            />
            <CustomInput
                label="City"
                value={values.city}
                onChange={(e) => onChange("city", e.target.value)}
                error={errors.city}
                autoComplete="off"
                className="w-25"
            />
            <CustomInput
                label="County"
                value={values.county}
                onChange={(e) => onChange("county", e.target.value)}
                autoComplete="off"
                className="w-25"
            />
            <CustomDropdown
                label="State/Territory"
                options={STATE_OPTIONS}
                value={values.state}
                onChange={(val) => onChange("state", val)}
                error={errors.state}
                customClass="w-25"
            />
            <CustomInput
                label="ZIP/Postal code"
                value={values.zip}
                onChange={(e) => onChange("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                error={errors.zip}
                autoComplete="off"
                className="w-25"
                maxLength={5}
            />
        </div>
    );
};

export default ContactBasicForm;
