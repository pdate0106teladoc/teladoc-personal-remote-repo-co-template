import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import ContactBasicForm from "./ContactBasicForm";
import { INITIAL_BASIC_FORM, BasicFormValues } from "./types/contactBasicFormTypes";

vi.mock("@ucc/common-ui", () => ({
    __esModule: true,
    CustomInput: ({
        label,
        value,
        onChange,
        error,
        maxLength,
        type,
    }: any) => (
        <div>
            <label>
                {label}
                <input
                    aria-label={label}
                    value={value ?? ""}
                    onChange={onChange}
                    maxLength={maxLength}
                    type={type ?? "text"}
                />
            </label>
            {error ? <span data-testid={`err-${label}`}>{error}</span> : null}
        </div>
    ),
    CustomDropdown: ({ label, options, value, onChange, error }: any) => (
        <div>
            <label>{label}</label>
            <select
                aria-label={label}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">--</option>
                {options.map((o: any) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            {error ? <span data-testid={`err-${label}`}>{error}</span> : null}
        </div>
    ),
    MultiSelectDropdown: ({ label, options, onChange }: any) => {
        // options is Record<string, boolean>
        const keys = Object.keys(options ?? {});
        return (
            <div data-testid="multi-select">
                <span>{label}</span>
                {keys.map((k) => (
                    <button key={k} onClick={() => onChange([k])}>
                        toggle-{k}
                    </button>
                ))}
                <button onClick={() => onChange([])}>clear-roles</button>
                <button onClick={() => onChange(keys.slice(0, 2))}>select-two</button>
            </div>
        );
    },
}));

const makeValues = (overrides: Partial<BasicFormValues> = {}): BasicFormValues => ({
    ...INITIAL_BASIC_FORM,
    ...overrides,
});

describe("ContactBasicForm", () => {
    let onChange: ReturnType<typeof vi.fn>;
    beforeEach(() => {
        onChange = vi.fn();
    });

    it("renders all fields with their initial values", () => {
        render(
            <ContactBasicForm
                values={makeValues({
                    name: "Jane",
                    title: "VP",
                    phone: "1234567890",
                    email: "jane@x.com",
                    street: "1 Way",
                    city: "NYC",
                    county: "Kings",
                    state: "NY",
                    zip: "12345",
                })}
                errors={{}}
                onChange={onChange}
            />,
        );

        expect(screen.getByLabelText("Name")).toHaveValue("Jane");
        expect(screen.getByLabelText("Title")).toHaveValue("VP");
        expect(screen.getByLabelText("Phone")).toHaveValue("1234567890");
        expect(screen.getByLabelText("Email")).toHaveValue("jane@x.com");
        expect(screen.getByLabelText("Street address")).toHaveValue("1 Way");
        expect(screen.getByLabelText("City")).toHaveValue("NYC");
        expect(screen.getByLabelText("County")).toHaveValue("Kings");
        expect(screen.getByLabelText("State/Territory")).toHaveValue("NY");
        expect(screen.getByLabelText("ZIP/Postal code")).toHaveValue("12345");
    });

    it("fires onChange for plain string fields", () => {
        render(
            <ContactBasicForm
                values={makeValues()}
                errors={{}}
                onChange={onChange}
            />,
        );

        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Doe" },
        });
        expect(onChange).toHaveBeenCalledWith("name", "Doe");

        fireEvent.change(screen.getByLabelText("Title"), {
            target: { value: "Mgr" },
        });
        expect(onChange).toHaveBeenCalledWith("title", "Mgr");

        fireEvent.change(screen.getByLabelText("Phone"), {
            target: { value: "5551234567" },
        });
        expect(onChange).toHaveBeenCalledWith("phone", "5551234567");
    });

    it("strips non-digits and clamps ZIP to 5 chars", () => {
        render(
            <ContactBasicForm
                values={makeValues({ zip: "" })}
                errors={{}}
                onChange={onChange}
            />,
        );

        fireEvent.change(screen.getByLabelText("ZIP/Postal code"), {
            target: { value: "12a3b456789" },
        });
        expect(onChange).toHaveBeenCalledWith("zip", "12345");
    });

    it("fires onChange for State/Territory dropdown", () => {
        render(
            <ContactBasicForm
                values={makeValues()}
                errors={{}}
                onChange={onChange}
            />,
        );

        fireEvent.change(screen.getByLabelText("State/Territory"), {
            target: { value: "CA" },
        });
        expect(onChange).toHaveBeenCalledWith("state", "CA");
    });

    it("renders inline errors", () => {
        render(
            <ContactBasicForm
                values={makeValues()}
                errors={{
                    name: "Name is required.",
                    email: "Bad email.",
                    phone: "Bad phone.",
                    zip: "Bad zip.",
                    city: "Bad city.",
                    street: "Bad street.",
                    state: "Pick a state.",
                }}
                onChange={onChange}
            />,
        );
        expect(screen.getByTestId("err-Name")).toHaveTextContent("Name is required.");
        expect(screen.getByTestId("err-Email")).toHaveTextContent("Bad email.");
        expect(screen.getByTestId("err-Phone")).toHaveTextContent("Bad phone.");
        expect(screen.getByTestId("err-ZIP/Postal code")).toHaveTextContent("Bad zip.");
        expect(screen.getByTestId("err-Street address")).toHaveTextContent("Bad street.");
        expect(screen.getByTestId("err-City")).toHaveTextContent("Bad city.");
        expect(screen.getByTestId("err-State/Territory")).toHaveTextContent("Pick a state.");
    });

    it("toggles a role on via MultiSelectDropdown", () => {
        render(
            <ContactBasicForm
                values={makeValues()}
                errors={{}}
                onChange={onChange}
            />,
        );

        fireEvent.click(screen.getByText("toggle-Broker"));

        expect(onChange).toHaveBeenCalledTimes(1);
        const [field, payload] = onChange.mock.calls[0];
        expect(field).toBe("roles");
        // All keys preserved, only 'Broker' set to true
        expect(payload.Broker).toBe(true);
        const trueRoles = Object.entries(payload).filter(([, v]) => v);
        expect(trueRoles.map(([k]) => k)).toEqual(["Broker"]);
    });

    it("clears all roles when MultiSelectDropdown returns []", () => {
        render(
            <ContactBasicForm
                values={makeValues({
                    roles: { ...INITIAL_BASIC_FORM.roles, Broker: true, IT: true },
                })}
                errors={{}}
                onChange={onChange}
            />,
        );

        fireEvent.click(screen.getByText("clear-roles"));

        expect(onChange).toHaveBeenCalledTimes(1);
        const payload = onChange.mock.calls[0][1];
        expect(Object.values(payload).every((v) => v === false)).toBe(true);
    });

    it("selects multiple roles", () => {
        render(
            <ContactBasicForm
                values={makeValues()}
                errors={{}}
                onChange={onChange}
            />,
        );

        fireEvent.click(screen.getByText("select-two"));

        expect(onChange).toHaveBeenCalledTimes(1);
        const payload = onChange.mock.calls[0][1];
        const trueRoles = Object.entries(payload)
            .filter(([, v]) => v)
            .map(([k]) => k);
        expect(trueRoles).toHaveLength(2);
    });
});
