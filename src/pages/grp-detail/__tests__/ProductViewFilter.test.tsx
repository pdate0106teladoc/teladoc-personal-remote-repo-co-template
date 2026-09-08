import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductViewFilter from "../pages/ProductViewFilter";
import { Scope } from "@/store/filterStore";

vi.mock("@ucc/common-ui", () => ({
    CheckboxGroup: ({ title, selectedValues, onChange }: any) => (
        <div>
            <label>{title}</label>
            <button onClick={() => onChange(["test-value"])}>Select {title}</button>
            <span data-testid={`selected-${title}`}>{selectedValues.join(",")}</span>
        </div>
    ),
    DatePicker: ({ value, onChange }: any) => (
        <div>
            <input
                role="textbox"
                data-testid={`datepicker-${value}`}
                value={value ? (value instanceof Date ? value.toISOString() : value) : ""}
                onChange={(e) => {
                    const dateStr = e.target.value;
                    if (dateStr) {
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                            onChange(date);
                        } else {
                            onChange(null);
                        }
                    } else {
                        onChange(null);
                    }
                }}
            />
        </div>
    ),
    Button: ({ children, onClick }: any) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

const mockGetFilters = vi.fn();
const mockSetFilters = vi.fn();
const mockSetApplied = vi.fn();
const mockClear = vi.fn();

vi.mock("@/store/filterStore", () => ({
    useFilterStore: (fn: any) =>
        fn({
            getFilters: mockGetFilters,
            setFilters: mockSetFilters,
            setApplied: mockSetApplied,
            clear: mockClear,
        }),
}));

vi.mock("@/utils", () => ({
    hasAny: (arr: any[]) => arr.length > 0,
    dateRangeCount: (from: string, to: string) =>
        from || to ? 1 : 0,
    toLocalDateOnly: (date: string) => (date ? new Date(date) : null),
}));

const setup = (props = {}) => {
    const defaultFilters = {
        membershipFilter: [],
        bundleTypeFilter: [],
        serviceCategoryFilter: [],
        minAgeFilter: 0,
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
        fromTermDateRange: "",
        toTermDateRange: "",
    };

    mockGetFilters.mockReturnValue(defaultFilters);
    const setOpenModal = vi.fn();

    const utils = render(
        <ProductViewFilter
            setOpenModal={setOpenModal}
            scope={"test-scope" as Scope}
            {...props}
        />
    );

    return {
        ...utils,
        setOpenModal,
    };
};

describe("ProductViewFilter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all form fields", () => {
        setup();
        expect(screen.getByText("Minimum age")).toBeInTheDocument();
        expect(screen.getByText("Membership fee type")).toBeInTheDocument();
        expect(screen.getByText("Bundle type")).toBeInTheDocument();
        expect(screen.getByText("Service category")).toBeInTheDocument();
        expect(screen.getByText("Effective date range")).toBeInTheDocument();
        expect(screen.getByText("Term date range")).toBeInTheDocument();
        expect(screen.getByText("Clear all")).toBeInTheDocument();
        expect(screen.getByText("Show results")).toBeInTheDocument();
    });

    it("updates fromTermDateValue on DatePicker change", () => {
        setup();
        const datePickers = screen.getAllByRole("textbox");
        const fromTermDateInput = datePickers[2]; // Third date picker is fromTermDate

        // Set a valid date
        fireEvent.change(fromTermDateInput, { target: { value: "2025-01-01" } });
        expect(fromTermDateInput).toHaveValue(new Date("2025-01-01").toISOString());

        // Clear the date
        fireEvent.change(fromTermDateInput, { target: { value: "" } });
        expect(fromTermDateInput).toHaveValue("");
    });


    it("updates state when fields change", () => {
        setup();

        fireEvent.click(screen.getByText("Select Membership fee type"));
        expect(screen.getByTestId("selected-Membership fee type").textContent).toContain("test-value");

        fireEvent.change(screen.getByPlaceholderText("Age"), {
            target: { value: "25" },
        });

        expect((screen.getByPlaceholderText("Age") as HTMLInputElement).value).toBe("25");

        const dateInputs = screen.getAllByRole("textbox");
        fireEvent.change(dateInputs[0], { target: { value: "2025-01-01" } });
        fireEvent.change(dateInputs[1], { target: { value: "2025-02-01" } });

        expect(dateInputs[0]).toHaveValue(new Date("2025-01-01").toISOString());
        expect(dateInputs[1]).toHaveValue(new Date("2025-02-01").toISOString());
    });

    it("calls setFilters and setApplied on apply", () => {
        const { setOpenModal } = setup();

        fireEvent.click(screen.getByText("Select Membership fee type"));
        fireEvent.change(screen.getByPlaceholderText("Age"), {
            target: { value: "10" },
        });

        fireEvent.click(screen.getByText("Show results"));

        expect(mockSetFilters).toHaveBeenCalledWith("test-scope", expect.any(Object));
        expect(mockSetApplied).toHaveBeenCalledWith("test-scope", {
            filterApplied: expect.any(Number),
            filteredAppliedKeys: expect.arrayContaining(["Membership Type", "Minimum Age"]),
        });

        expect(setOpenModal).toHaveBeenCalledWith(false);
    });

    it("clears all filters", () => {
        setup();

        fireEvent.click(screen.getByText("Clear all"));

        expect(mockClear).toHaveBeenCalledWith("test-scope");
    });

    it("exposes clear function via onExposeClear", () => {
        const onExposeClear = vi.fn();
        setup({ onExposeClear });

        expect(onExposeClear).toHaveBeenCalledWith(expect.any(Function));
    });

    it("handles edge case: no filters selected", () => {
        setup();

        fireEvent.click(screen.getByText("Show results"));

        expect(mockSetApplied).toHaveBeenCalledWith("test-scope", {
            filterApplied: 0,
            filteredAppliedKeys: [],
        });
    });

    it("updates bundle type filter", () => {
        setup();

        fireEvent.click(screen.getByText("Select Bundle type"));
        expect(screen.getByTestId("selected-Bundle type").textContent).toContain("test-value");
    });

    it("updates service category filter", () => {
        setup();

        fireEvent.click(screen.getByText("Select Service category"));
        expect(screen.getByTestId("selected-Service category").textContent).toContain("test-value");
    });

    it("handles minimum age of 0", () => {
        setup();

        const ageInput = screen.getByPlaceholderText("Age") as HTMLInputElement;
        fireEvent.change(ageInput, { target: { value: "0" } });

        expect(ageInput.value).toBe("0");
    });

    it("updates effective date range (from date only)", () => {
        const { setOpenModal } = setup();
        const dateInputs = screen.getAllByRole("textbox");

        fireEvent.change(dateInputs[0], { target: { value: "2025-01-01" } });
        fireEvent.click(screen.getByText("Show results"));

        expect(mockSetApplied).toHaveBeenCalledWith("test-scope", {
            filterApplied: 1,
            filteredAppliedKeys: ["Effective Date Range"],
        });
        expect(setOpenModal).toHaveBeenCalledWith(false);
    });

    it("updates effective date range (to date only)", () => {
        setup();
        const dateInputs = screen.getAllByRole("textbox");

        fireEvent.change(dateInputs[1], { target: { value: "2025-12-31" } });
        fireEvent.click(screen.getByText("Show results"));

        expect(mockSetApplied).toHaveBeenCalledWith("test-scope", {
            filterApplied: 1,
            filteredAppliedKeys: ["Effective Date Range"],
        });
    });

    it("updates term date range (both dates)", () => {
        setup();
        const dateInputs = screen.getAllByRole("textbox");

        // dateInputs[2] = fromTermDate, dateInputs[3] = toTermDate
        fireEvent.change(dateInputs[2], { target: { value: "2025-01-01" } });
        fireEvent.change(dateInputs[3], { target: { value: "2025-12-31" } });

        fireEvent.click(screen.getByText("Show results"));

        expect(mockSetApplied).toHaveBeenCalledWith("test-scope", {
            filterApplied: 1,
            filteredAppliedKeys: ["Term Date Range"],
        });
    });

    it("applies all filter types together", () => {
        setup();

        // Select all checkbox groups
        fireEvent.click(screen.getByText("Select Membership fee type"));
        fireEvent.click(screen.getByText("Select Bundle type"));
        fireEvent.click(screen.getByText("Select Service category"));

        // Set minimum age
        fireEvent.change(screen.getByPlaceholderText("Age"), {
            target: { value: "18" },
        });

        // Set date ranges
        const dateInputs = screen.getAllByRole("textbox");
        fireEvent.change(dateInputs[0], { target: { value: "2025-01-01" } });
        fireEvent.change(dateInputs[1], { target: { value: "2025-06-30" } });
        fireEvent.change(dateInputs[2], { target: { value: "2025-07-01" } });
        fireEvent.change(dateInputs[3], { target: { value: "2025-12-31" } });

        fireEvent.click(screen.getByText("Show results"));

        expect(mockSetApplied).toHaveBeenCalledWith("test-scope", {
            filterApplied: 6,
            filteredAppliedKeys: [
                "Membership Type",
                "Bundle Type",
                "Service Category",
                "Minimum Age",
                "Effective Date Range",
                "Term Date Range",
            ],
        });
    });

    it("clears filters when clear button is clicked after setting values", () => {
        setup();

        // Set some filters
        fireEvent.click(screen.getByText("Select Membership fee type"));
        fireEvent.change(screen.getByPlaceholderText("Age"), {
            target: { value: "30" },
        });

        // Clear filters
        fireEvent.click(screen.getByText("Clear all"));

        expect(mockClear).toHaveBeenCalledWith("test-scope");
    });

    it("handles invalid date input gracefully", () => {
        setup();
        const dateInputs = screen.getAllByRole("textbox");

        // Try to set an invalid date
        fireEvent.change(dateInputs[0], { target: { value: "invalid-date" } });

        // The input should remain empty or not crash
        expect(dateInputs[0]).toHaveValue("");
    });

    it("calls setFilters with correct filter values", () => {
        setup();

        fireEvent.click(screen.getByText("Select Membership fee type"));
        fireEvent.change(screen.getByPlaceholderText("Age"), {
            target: { value: "21" },
        });

        const dateInputs = screen.getAllByRole("textbox");
        fireEvent.change(dateInputs[0], { target: { value: "2025-03-01" } });

        fireEvent.click(screen.getByText("Show results"));

        expect(mockSetFilters).toHaveBeenCalledWith("test-scope", {
            membershipFilter: ["test-value"],
            bundleTypeFilter: [],
            serviceCategoryFilter: [],
            minAgeFilter: 21,
            fromEffectiveDateRange: new Date("2025-03-01").toISOString(),
            toEffectiveDateRange: "",
            fromTermDateRange: "",
            toTermDateRange: "",
        });
    });
});
