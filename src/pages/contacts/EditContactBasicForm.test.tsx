import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import EditContactBasicForm from "./EditContactBasicForm";
import { INITIAL_BASIC_FORM, BasicFormValues, BasicFormErrors } from "./types/contactBasicFormTypes";

vi.mock("@/components/EditableRow/EditableRow", () => ({
    __esModule: true,
    default: ({ label, value, fieldKey, metadata, error, onChange, lastChild }: any) => (
        <div data-testid={`row-${fieldKey}`} data-lastchild={String(lastChild)}>
            <span data-testid={`label-${fieldKey}`}>{label}</span>
            <span data-testid={`editable-${fieldKey}`}>{String(metadata?.editable)}</span>
            <span data-testid={`uitype-${fieldKey}`}>{metadata?.uiComponentType}</span>
            <span data-testid={`required-${fieldKey}`}>{String(metadata?.required)}</span>
            <span data-testid={`value-${fieldKey}`}>
                {value && typeof value === "object" ? JSON.stringify(value) : String(value ?? "")}
            </span>
            <span data-testid={`error-${fieldKey}`}>{error ?? ""}</span>
            <button
                data-testid={`change-${fieldKey}`}
                onClick={() =>
                    onChange(fieldKey, fieldKey === "roles" ? "IT;Broker" : "X")
                }
            >
                change
            </button>
        </div>
    ),
}));

const field = (overrides: Record<string, any> = {}) => ({
    editable: true,
    uiComponentType: "text",
    dataType: "STRING",
    allowedValues: null,
    ...overrides,
});

const makeValues = (overrides: Partial<BasicFormValues> = {}): BasicFormValues => ({
    ...INITIAL_BASIC_FORM,
    ...overrides,
});

const fullMetadata = () => ({
    name: field(),
    title: field(),
    contactRole: field({ uiComponentType: "multiSelect", allowedValues: ["IT", "Broker"] }),
    phone: field({ uiComponentType: "tel" }),
    email: field({ uiComponentType: "email" }),
    addresses: [
        {
            street: field(),
            city: field(),
            county: field(),
            state: field({ uiComponentType: "dropdown", allowedValues: ["NY", "CA"] }),
            zip: field(),
        },
    ],
});

const renderForm = (
    props: {
        values?: BasicFormValues;
        errors?: BasicFormErrors;
        metadata?: Record<string, any>;
    } = {},
) => {
    const onChange = vi.fn();
    render(
        <EditContactBasicForm
            values={props.values ?? makeValues()}
            errors={props.errors ?? {}}
            metadata={props.metadata ?? fullMetadata()}
            onChange={onChange}
        />,
    );
    return { onChange };
};

describe("EditContactBasicForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders a row for every configured field with its label", () => {
        renderForm();
        expect(screen.getByTestId("label-name")).toHaveTextContent("Name");
        expect(screen.getByTestId("label-title")).toHaveTextContent("Title");
        expect(screen.getByTestId("label-roles")).toHaveTextContent("Contact role");
        expect(screen.getByTestId("label-phone")).toHaveTextContent("Phone");
        expect(screen.getByTestId("label-email")).toHaveTextContent("Email");
        expect(screen.getByTestId("label-street")).toHaveTextContent("Street address");
        expect(screen.getByTestId("label-city")).toHaveTextContent("City");
        expect(screen.getByTestId("label-county")).toHaveTextContent("County");
        expect(screen.getByTestId("label-state")).toHaveTextContent("State/Territory");
        expect(screen.getByTestId("label-zip")).toHaveTextContent("ZIP/Postal code");
    });

    it("resolves top-level metadata for non-address fields", () => {
        renderForm();
        expect(screen.getByTestId("uitype-roles")).toHaveTextContent("multiSelect");
        expect(screen.getByTestId("uitype-phone")).toHaveTextContent("tel");
        expect(screen.getByTestId("editable-name")).toHaveTextContent("true");
    });

    it("resolves address metadata from addresses[0] for address fields", () => {
        renderForm();
        expect(screen.getByTestId("editable-street")).toHaveTextContent("true");
        expect(screen.getByTestId("uitype-state")).toHaveTextContent("dropdown");
    });

    it("falls back to a read-only text field when metadata is missing", () => {
        const metadata = fullMetadata();
        delete (metadata as any).title;
        renderForm({ metadata });
        expect(screen.getByTestId("editable-title")).toHaveTextContent("false");
        expect(screen.getByTestId("uitype-title")).toHaveTextContent("text");
    });

    it("falls back for address fields when addresses is absent", () => {
        renderForm({ metadata: { name: field() } });
        expect(screen.getByTestId("editable-street")).toHaveTextContent("false");
        expect(screen.getByTestId("editable-zip")).toHaveTextContent("false");
    });

    it("forces required for name and email even when metadata does not mark them required", () => {
        renderForm();
        expect(screen.getByTestId("required-name")).toHaveTextContent("true");
        expect(screen.getByTestId("required-email")).toHaveTextContent("true");
    });

    it("does not force required for optional fields", () => {
        renderForm();
        expect(screen.getByTestId("required-title")).not.toHaveTextContent("true");
        expect(screen.getByTestId("required-phone")).not.toHaveTextContent("true");
    });

    it("passes the roles Record through as the contactRole row value", () => {
        renderForm({
            values: makeValues({ roles: { IT: true, Broker: false } }),
        });
        expect(screen.getByTestId("value-roles")).toHaveTextContent(
            JSON.stringify({ IT: true, Broker: false }),
        );
    });

    it("passes plain string values to their rows", () => {
        renderForm({ values: makeValues({ name: "Jane", city: "NYC" }) });
        expect(screen.getByTestId("value-name")).toHaveTextContent("Jane");
        expect(screen.getByTestId("value-city")).toHaveTextContent("NYC");
    });

    it("maps EditableRow onChange to the field key", () => {
        const { onChange } = renderForm();
        fireEvent.click(screen.getByTestId("change-name"));
        expect(onChange).toHaveBeenCalledWith("name", "X");

        fireEvent.click(screen.getByTestId("change-roles"));
        expect(onChange).toHaveBeenCalledWith("roles", { IT: true, Broker: true });
    });

    it("marks only the ZIP row as the last child", () => {
        renderForm();
        expect(screen.getByTestId("row-zip")).toHaveAttribute("data-lastchild", "true");
        expect(screen.getByTestId("row-name")).toHaveAttribute("data-lastchild", "false");
        expect(screen.getByTestId("row-state")).toHaveAttribute("data-lastchild", "false");
    });

    it("passes field errors to the matching row", () => {
        renderForm({
            errors: { name: "Name is required.", email: "Bad email." },
        });
        expect(screen.getByTestId("error-name")).toHaveTextContent("Name is required.");
        expect(screen.getByTestId("error-email")).toHaveTextContent("Bad email.");
        expect(screen.getByTestId("error-phone")).toHaveTextContent("");
    });
});
