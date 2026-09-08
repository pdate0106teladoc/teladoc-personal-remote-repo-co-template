import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/CCC/org-detail/123", search: "", hash: "", state: null, key: "default" }),
  useParams: () => ({ id: "test-123" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("../EditableRow.scss", () => ({}));

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

vi.mock("@/utils/urlMapper", () => ({
  constructLookupUrl: vi.fn(() => "https://api.example.com/search?q=test"),
}));

vi.mock("react-bootstrap", () => ({
  Form: {
    Control: ({ as, value, onChange, placeholder, maxLength, isInvalid, rows }: any) =>
      as === "textarea" ? (
        <textarea
          data-testid="textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={isInvalid}
          rows={rows}
        />
      ) : (
        <input data-testid="form-control" value={value} onChange={onChange} />
      ),
  },
}));

const mockOnChangeLookup = vi.fn();

vi.mock("@ucc/common-ui", () => ({
  CustomInput: ({ type, value, onChange, placeholder, maxLength, min, max, error, className }: any) => (
    <div data-testid={`custom-input-${type ?? "default"}`}>
      <input
        data-testid="custom-input-field"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        className={className}
      />
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  ),
  CustomRadioGroup: ({ value, onChange, error }: any) => (
    <div data-testid="custom-radio-group">
      <button
        data-testid="radio-true"
        onClick={() => onChange(true)}
        aria-pressed={value === true}
      >
        Yes
      </button>
      <button
        data-testid="radio-false"
        onClick={() => onChange(false)}
        aria-pressed={value === false}
      >
        No
      </button>
      {error && <span data-testid="radio-error">{error}</span>}
    </div>
  ),
  CustomDropdown: ({ value, onChange, options, placeholder, error }: any) => (
    <div data-testid="custom-dropdown">
      <select
        data-testid="dropdown-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span data-testid="dropdown-error">{error}</span>}
    </div>
  ),
  CustomTextarea: ({ value, onChange, placeholder, rows, error }: any) => (
    <div data-testid="textarea-wrapper">
      <textarea
        data-testid="textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={!!error}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  ),
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <div data-testid="date-picker">
      <input
        data-testid="date-picker-input"
        type="date"
        value={value instanceof Date ? value.toISOString().split("T")[0] : ""}
        onChange={(e) => onChange(new Date(e.target.value))}
        placeholder={placeholder}
      />
    </div>
  ),
  DisplayRow: ({ value }: any) => (
    <span data-testid="display-row">{value || "-"}</span>
  ),
  MultiSelectSearch: ({ label, preSelected, onChange, buildSearchParams, maxResults, multiSelect }: any) => (
    <div data-testid="multi-select-search">
      <span data-testid="multi-select-label">{label}</span>
      <span data-testid="multi-select-pre-selected">{JSON.stringify(preSelected)}</span>
      <input
        data-testid="multi-select-input"
        onChange={(e) => {
          buildSearchParams(e.target.value);
          mockOnChangeLookup(e.target.value);
        }}
      />
      <button
        data-testid="multi-select-trigger"
        onClick={() => onChange({ "key-1": "selected-value" })}
      >
        Select
      </button>
      <button
        data-testid="multi-select-clear"
        onClick={() => onChange({})}
      >
        Clear
      </button>
      <span data-testid="multi-select-max">{maxResults}</span>
      <span data-testid="multi-select-multi">{String(multiSelect)}</span>
    </div>
  ),
  MultiSelectDropdown: ({ label, options, onChange, placeholder }: any) => {
    const keys = Object.keys(options ?? {});
    return (
      <div data-testid="multi-select-dropdown" data-placeholder={placeholder}>
        <span data-testid="multi-select-dropdown-label">{label}</span>
        {keys.map((k) => (
          <button
            key={k}
            data-testid={`msd-toggle-${k}`}
            data-selected={String(options[k])}
            onClick={() => onChange([k])}
          >
            toggle-{k}
          </button>
        ))}
        <button data-testid="msd-clear" onClick={() => onChange([])}>
          clear-multi
        </button>
      </div>
    );
  },
}));

import EditableRow from "../EditableRow";
import { FieldMetadata } from "@/types/edit";
import { constructLookupUrl } from "@/utils/urlMapper";

const baseMeta = (overrides: Partial<FieldMetadata> = {}): FieldMetadata => ({
  value: "",
  editable: true,
  uiComponentType: "text" as any,
  dataType: "string" as any,
  ...overrides,
});

const renderRow = (props: Partial<Parameters<typeof EditableRow>[0]> = {}) => {
  const mockOnChange = vi.fn();
  const result = render(
    <EditableRow
      label="Test Label"
      value="test-value"
      fieldKey="testField"
      metadata={baseMeta()}
      onChange={mockOnChange}
      {...props}
    />
  );
  return { ...result, mockOnChange };
};

describe("EditableRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Layout & structure ──────────────────────────────────────────────────────

  it("renders the label", () => {
    renderRow({ label: "My Label" });
    expect(screen.getByText("My Label")).toBeInTheDocument();
  });

  it("shows required asterisk when metadata.required is true", () => {
    renderRow({ metadata: baseMeta({ required: true }) });
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show required asterisk when metadata.required is false", () => {
    renderRow({ metadata: baseMeta({ required: false }) });
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("adds last-child class when lastChild prop is true", () => {
    const { container } = renderRow({ lastChild: true });
    expect(container.firstChild).toHaveClass("last-child");
  });

  it("does not add last-child class by default", () => {
    const { container } = renderRow({ lastChild: false });
    expect(container.firstChild).not.toHaveClass("last-child");
  });

  // ── Non-editable ─────────────────────────────────────────────────────────────

  it("renders readonly span with value when not editable", () => {
    renderRow({ metadata: baseMeta({ editable: false }), value: "Read Only Value" });
    expect(screen.getByText("Read Only Value")).toBeInTheDocument();
  });

  it("renders '-' when not editable and value is empty", () => {
    renderRow({ metadata: baseMeta({ editable: false }), value: "" });
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders '-' when not editable and value is null", () => {
    renderRow({ metadata: baseMeta({ editable: false }), value: null });
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  // ── text / email / tel / number inputs ───────────────────────────────────────

  it.each(["text", "email", "tel", "number"] as const)(
    "renders CustomInput for uiComponentType '%s'",
    (uiType) => {
      renderRow({ metadata: baseMeta({ uiComponentType: uiType as any }) });
      expect(screen.getByTestId(`custom-input-${uiType}`)).toBeInTheDocument();
    }
  );

  it("calls onChange with new value when CustomInput changes", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({ uiComponentType: "text" as any }),
      value: "old",
    });
    fireEvent.change(screen.getByTestId("custom-input-field"), {
      target: { value: "new-value" },
    });
    expect(mockOnChange).toHaveBeenCalledWith("testField", "new-value");
  });

  it("passes maxLength and placeholder to CustomInput", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "text" as any,
        placeholder: "Enter text",
        maxLength: 50,
      }),
    });
    const input = screen.getByTestId("custom-input-field");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toHaveAttribute("maxLength", "50");
  });

  it("passes min and max to CustomInput for number type", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "number" as any, min: 1, max: 100 }),
    });
    const input = screen.getByTestId("custom-input-field");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "100");
  });

  it("shows prop error in CustomInput", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "text" as any }),
      error: "Required field",
    });
    expect(screen.getByTestId("input-error")).toHaveTextContent("Required field");
  });

  it("shows empty string in CustomInput when value is falsy", () => {
    renderRow({ metadata: baseMeta({ uiComponentType: "text" as any }), value: "" });
    expect(screen.getByTestId("custom-input-field")).toHaveValue("");
  });

  // ── default case ─────────────────────────────────────────────────────────────

  it("renders default CustomInput for unknown uiComponentType", () => {
    renderRow({ metadata: baseMeta({ uiComponentType: "unknown" as any }) });
    expect(screen.getByTestId("custom-input-default")).toBeInTheDocument();
  });

  it("calls onChange in default input case", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({ uiComponentType: "unknown" as any }),
      value: "",
    });
    fireEvent.change(screen.getByTestId("custom-input-field"), {
      target: { value: "typed" },
    });
    expect(mockOnChange).toHaveBeenCalledWith("testField", "typed");
  });

  // ── textarea ──────────────────────────────────────────────────────────────────

  it("renders textarea for uiComponentType 'textarea'", () => {
    renderRow({ metadata: baseMeta({ uiComponentType: "textarea" as any }) });
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  it("calls onChange when textarea value changes", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({ uiComponentType: "textarea" as any }),
      value: "",
    });
    fireEvent.change(screen.getByTestId("textarea"), {
      target: { value: "typed text" },
    });
    expect(mockOnChange).toHaveBeenCalledWith("testField", "typed text");
  });

  it("shows error message below textarea when error prop is set", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "textarea" as any }),
      error: "Too long",
    });
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("marks textarea as invalid when error is present", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "textarea" as any }),
      error: "Error",
    });
    expect(screen.getByTestId("textarea")).toHaveAttribute("aria-invalid", "true");
  });

  // ── date ──────────────────────────────────────────────────────────────────────

  it("renders DatePicker for uiComponentType 'date'", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "date" as any, placeholder: "Pick date" }),
      value: "2024-01-15",
    });
    expect(screen.getByTestId("date-picker")).toBeInTheDocument();
  });

  it("calls onChange with Date object when DatePicker changes", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({ uiComponentType: "date" as any }),
      value: "2024-01-15",
    });
    fireEvent.change(screen.getByTestId("date-picker-input"), {
      target: { value: "2024-06-01" },
    });
    expect(mockOnChange).toHaveBeenCalledWith(
      "testField",
      expect.any(Date)
    );
  });

  it("shows error message below DatePicker when error is set", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "date" as any }),
      value: "2024-01-15",
      error: "Invalid date",
    });
    expect(screen.getByText("Invalid date")).toBeInTheDocument();
  });

  // ── dropdown ──────────────────────────────────────────────────────────────────

  it("renders CustomDropdown for uiComponentType 'dropdown'", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "dropdown" as any,
        allowedValues: ["Option A", "Option B"],
      }),
    });
    expect(screen.getByTestId("custom-dropdown")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("calls onChange when dropdown selection changes", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({
        uiComponentType: "dropdown" as any,
        allowedValues: ["Option A", "Option B"],
      }),
      value: "",
    });
    fireEvent.change(screen.getByTestId("dropdown-select"), {
      target: { value: "Option A" },
    });
    expect(mockOnChange).toHaveBeenCalledWith("testField", "Option A");
  });

  it("renders empty dropdown options when allowedValues is null", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "dropdown" as any, allowedValues: null }),
    });
    expect(screen.getByTestId("custom-dropdown")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /option/i })).not.toBeInTheDocument();
  });

  it("shows error in CustomDropdown", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "dropdown" as any,
        allowedValues: ["A"],
      }),
      error: "Select required",
    });
    expect(screen.getByTestId("dropdown-error")).toHaveTextContent("Select required");
  });

  // ── checkbox (CustomRadioGroup) ───────────────────────────────────────────────

  it("renders CustomRadioGroup for uiComponentType 'checkbox'", () => {
    renderRow({ metadata: baseMeta({ uiComponentType: "checkbox" as any }), value: true });
    expect(screen.getByTestId("custom-radio-group")).toBeInTheDocument();
  });

  it("calls onChange with true when radio Yes is clicked", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({ uiComponentType: "checkbox" as any }),
      value: false,
    });
    fireEvent.click(screen.getByTestId("radio-true"));
    expect(mockOnChange).toHaveBeenCalledWith("testField", true);
  });

  it("calls onChange with false when radio No is clicked", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({ uiComponentType: "checkbox" as any }),
      value: true,
    });
    fireEvent.click(screen.getByTestId("radio-false"));
    expect(mockOnChange).toHaveBeenCalledWith("testField", false);
  });

  it("shows error in CustomRadioGroup", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "checkbox" as any }),
      error: "Selection required",
    });
    expect(screen.getByTestId("radio-error")).toHaveTextContent("Selection required");
  });

  // ── lookup ────────────────────────────────────────────────────────────────────

  it("shows 'Invalid lookup configuration' when allowedValues has fewer than 2 items", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "lookup" as any, allowedValues: ["only-one"] }),
    });
    expect(screen.getByText("Invalid lookup configuration")).toBeInTheDocument();
  });

  it("shows 'Invalid lookup configuration' when allowedValues is null", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "lookup" as any, allowedValues: null }),
    });
    expect(screen.getByText("Invalid lookup configuration")).toBeInTheDocument();
  });

  it("renders MultiSelectSearch for valid lookup configuration", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base-url-key", "/search?q={searchTerm}"],
      }),
      value: "",
    });
    expect(screen.getByTestId("multi-select-search")).toBeInTheDocument();
  });

  it("passes multiSelect=false to MultiSelectSearch", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base", "/path/{searchTerm}"],
      }),
      value: "",
    });
    expect(screen.getByTestId("multi-select-multi")).toHaveTextContent("false");
  });

  it("passes max as maxResults to MultiSelectSearch", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base", "/path/{searchTerm}"],
        max: 10,
      }),
      value: "",
    });
    expect(screen.getByTestId("multi-select-max")).toHaveTextContent("10");
  });

  it("normalizes string value to object for lookup preSelected", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base", "/path/{searchTerm}"],
      }),
      value: "existing-value",
    });
    const pre = screen.getByTestId("multi-select-pre-selected");
    expect(pre.textContent).toContain("existing-value");
  });

  it("passes object value directly as preSelected for lookup", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base", "/path/{searchTerm}"],
      }),
      value: { "id-1": "Name One" },
    });
    const pre = screen.getByTestId("multi-select-pre-selected");
    expect(pre.textContent).toContain("Name One");
  });

  it("calls onChange with first selected value when lookup selection is made", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base", "/path/{searchTerm}"],
      }),
      value: "",
    });
    fireEvent.click(screen.getByTestId("multi-select-trigger"));
    expect(mockOnChange).toHaveBeenCalledWith("testField", "key-1");
  });

  it("calls onChange with empty string when lookup selection is cleared", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base", "/path/{searchTerm}"],
      }),
      value: "existing",
    });
    fireEvent.click(screen.getByTestId("multi-select-clear"));
    expect(mockOnChange).toHaveBeenCalledWith("testField", "");
  });

  it("calls buildSearchParams when lookup input changes", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "lookup" as any,
        allowedValues: ["base-key", "/contacts?name={searchTerm}"],
      }),
      value: "",
    });
    fireEvent.change(screen.getByTestId("multi-select-input"), {
      target: { value: "john" },
    });
    expect(constructLookupUrl).toHaveBeenCalledWith(
      ["base-key", "/contacts?name={searchTerm}"],
      "john",
      "test-123",
      ""
    );
  });

  // ── multiSelect ───────────────────────────────────────────────────────────────

  it("renders MultiSelectDropdown for uiComponentType 'multiSelect' with options from allowedValues", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: {},
    });
    expect(screen.getByTestId("multi-select-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("msd-toggle-X")).toBeInTheDocument();
    expect(screen.getByTestId("msd-toggle-Y")).toBeInTheDocument();
  });

  it("reflects a semicolon-separated string value as selected options", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: "X",
    });
    expect(screen.getByTestId("msd-toggle-X")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("msd-toggle-Y")).toHaveAttribute("data-selected", "false");
  });

  it("reflects multiple semicolon-separated values as selected options", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y", "Z"],
      }),
      value: "X;Z",
    });
    expect(screen.getByTestId("msd-toggle-X")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("msd-toggle-Y")).toHaveAttribute("data-selected", "false");
    expect(screen.getByTestId("msd-toggle-Z")).toHaveAttribute("data-selected", "true");
  });

  it("reflects legacy Record values as selected options", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: { X: true, Y: false },
    });
    expect(screen.getByTestId("msd-toggle-X")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("msd-toggle-Y")).toHaveAttribute("data-selected", "false");
  });

  it("reflects legacy array values as selected options", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: ["Y"],
    });
    expect(screen.getByTestId("msd-toggle-X")).toHaveAttribute("data-selected", "false");
    expect(screen.getByTestId("msd-toggle-Y")).toHaveAttribute("data-selected", "true");
  });

  it("reflects legacy JSON array string values as selected options", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: '["X","Y"]',
    });
    expect(screen.getByTestId("msd-toggle-X")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("msd-toggle-Y")).toHaveAttribute("data-selected", "true");
  });

  it("reflects metadata leaf objects as selected options", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: {
        dataType: "ARRAY_STRING",
        value: "X;Y",
      },
    });
    expect(screen.getByTestId("msd-toggle-X")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("msd-toggle-Y")).toHaveAttribute("data-selected", "true");
  });

  it("builds options from allowedValues even when value is empty/undefined", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: undefined,
    });
    expect(screen.getByTestId("msd-toggle-X")).toHaveAttribute("data-selected", "false");
    expect(screen.getByTestId("msd-toggle-Y")).toHaveAttribute("data-selected", "false");
  });

  it("calls onChange with a semicolon-separated string when a role is toggled", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: "",
    });
    fireEvent.click(screen.getByTestId("msd-toggle-X"));
    expect(mockOnChange).toHaveBeenCalledWith("testField", "X");
  });

  it("emits an empty string when the multiSelect is cleared", () => {
    const { mockOnChange } = renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X", "Y"],
      }),
      value: "X",
    });
    fireEvent.click(screen.getByTestId("msd-clear"));
    expect(mockOnChange).toHaveBeenCalledWith("testField", "");
  });

  it("renders no options when multiSelect allowedValues is null", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "multiSelect" as any, allowedValues: null }),
      value: {},
    });
    expect(screen.getByTestId("multi-select-dropdown")).toBeInTheDocument();
    expect(screen.queryByTestId("msd-toggle-X")).not.toBeInTheDocument();
  });

  it("shows the error message below MultiSelectDropdown", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "multiSelect" as any,
        allowedValues: ["X"],
      }),
      value: {},
      error: "Pick at least one",
    });
    expect(screen.getByText("Pick at least one")).toBeInTheDocument();
  });

  // ── Regex validation ─────────────────────────────────────────────────────────

  it("shows regex error when value does not match regex", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "text" as any,
        regex: "^[0-9]+$",
      }),
      value: "not-a-number",
    });
    expect(screen.getByTestId("input-error")).toHaveTextContent(
      "Invalid format. Please check your input."
    );
  });

  it("does not show regex error when value matches regex", () => {
    renderRow({
      metadata: baseMeta({
        uiComponentType: "text" as any,
        regex: "^[0-9]+$",
      }),
      value: "12345",
    });
    expect(screen.queryByTestId("input-error")).not.toBeInTheDocument();
  });

  it("does not show regex error when value is empty", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "text" as any, regex: "^[0-9]+$" }),
      value: "",
    });
    expect(screen.queryByTestId("input-error")).not.toBeInTheDocument();
  });

  it("prop error takes precedence and is shown alongside regex result", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "text" as any, regex: "^[0-9]+$" }),
      value: "abc",
      error: "Server error",
    });
    expect(screen.getByTestId("input-error")).toHaveTextContent("Server error");
  });

  it("shows regex error in textarea when value is invalid", () => {
    renderRow({
      metadata: baseMeta({ uiComponentType: "textarea" as any, regex: "^[A-Z]" }),
      value: "lowercase",
    });
    expect(screen.getByText("Invalid format. Please check your input.")).toBeInTheDocument();
  });
});
