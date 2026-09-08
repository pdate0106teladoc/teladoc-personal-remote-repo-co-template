import React from "react";
import type { BasicFormValues, BasicFormErrors } from "./types/contactBasicFormTypes";
import EditableRow from "@/components/EditableRow/EditableRow";
import { FieldMetadata } from "@/types/edit";

interface EditContactBasicFormProps {
    values: BasicFormValues;
    errors: BasicFormErrors;
    metadata: Record<string, any>;
    onChange: (field: keyof BasicFormValues, value: string | Record<string, boolean>) => void;
}

interface FieldDef {
    key: keyof BasicFormValues;
    label: string;
    metaKey: string;
    address?: boolean;
    required?: boolean;
    narrow?: boolean;
}

const FIELDS: FieldDef[] = [
    { key: "name", label: "Name", metaKey: "name", required: true },
    { key: "title", label: "Title", metaKey: "title" },
    { key: "roles", label: "Contact role", metaKey: "contactRole" },
    { key: "phone", label: "Phone", metaKey: "phone", narrow: true },
    { key: "email", label: "Email", metaKey: "email", required: true },
    { key: "street", label: "Street address", metaKey: "street", address: true },
    { key: "city", label: "City", metaKey: "city", address: true, narrow: true },
    { key: "county", label: "County", metaKey: "county", address: true, narrow: true },
    { key: "state", label: "State/Territory", metaKey: "state", address: true, narrow: true },
    { key: "zip", label: "ZIP/Postal code", metaKey: "zip", address: true, narrow: true },
];

const READONLY_FALLBACK: FieldMetadata = {
    value: undefined,
    editable: false,
    uiComponentType: "text",
    dataType: "STRING",
};

const EditContactBasicForm: React.FC<EditContactBasicFormProps> =
({ values, errors, metadata, onChange }) => {
    const resolveMetadata = (field: FieldDef): FieldMetadata => {
        const raw = field.address
            ? metadata?.addresses?.[0]?.[field.metaKey]
            : metadata?.[field.metaKey];
        const base = raw ?? READONLY_FALLBACK;
        return { ...base, required: field.required ?? base.required };
    };
    const handleFieldChange = (
        field: FieldDef,
        val: string | Record<string, boolean>,
    ) => {
        if (field.key === "roles" && typeof val === "string") {
            const selected = val ? val.split(";").filter(Boolean) : [];
            const allowedValues = resolveMetadata(field).allowedValues ?? [];
            const updated = allowedValues.reduce<Record<string, boolean>>(
                (acc, role) => {
                    acc[role] = selected.includes(role);
                    return acc;
                },
                {},
            );
            onChange(field.key, updated);
            return;
        }
        onChange(field.key, val);
    };
    const renderFieldRow = (field: FieldDef) => {
        return (
            <EditableRow
                label={field.label}
                value={values[field.key]}
                fieldKey={field.key}
                metadata={resolveMetadata(field)}
                error={errors[field.key as keyof BasicFormErrors]}
                onChange={(_fieldKey, val) => handleFieldChange(field, val)}
                lastChild={field.key === "zip"}
            />
        );
    };

    const renderRow = (field: FieldDef) =>
        field.narrow ? (
            <div key={field.key} className="w-25">{renderFieldRow(field)}</div>
        ) : (
            <div key={field.key}>{renderFieldRow(field)}</div>
        );

    return (
        <div className="d-flex flex-column gap-4 contact-basic-form">
            {FIELDS.map(renderRow)}
        </div>
    );
};

export default EditContactBasicForm;
