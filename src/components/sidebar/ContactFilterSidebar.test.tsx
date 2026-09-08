import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ContactFilters from "./ContactFilterSidebar";
import { useContactFilterStore } from "@/store/useContactFilterStore";

// Mock dependencies
vi.mock("@/store/useContactFilterStore");
vi.mock("@/api/apiService", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock("@ucc/common-ui", () => ({
  MultiSelectSearch: ({ label, preSelected, onChange }: any) => (
    <div data-testid={`multi-search-${label.toLowerCase()}`}>
      <label>{label}</label>
      <input
        type="text"
        value={Object.keys(preSelected || {}).length}
        onChange={(e) => onChange({ test: e.target.value })}
        data-testid={`${label.toLowerCase()}-input`}
      />
    </div>
  ),
  CheckboxGroup: ({ title, options, selectedValues, onChange }: any) => (
    <div data-testid={`checkbox-group-${title}`}>
      <div>{title}</div>
      {options.map((option: any) => (
        <label key={option.value}>
          <input
            type="checkbox"
            checked={selectedValues.includes(option.value)}
            onChange={(e) => {
              const newValues = e.target.checked
                ? [...selectedValues, option.value]
                : selectedValues.filter((v: string) => v !== option.value);
              onChange(newValues);
            }}
            data-testid={`checkbox-${option.value}`}
          />
          {option.label}
        </label>
      ))}
    </div>
  ),
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("@/utils", () => ({
  hasAny: (arr: any[]) => arr && arr.length > 0,
}));

vi.mock("@/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/constants")>();
  return {
    ...actual,
    LABELS: {
      products: {
        CLEAR_ALL: "Clear all",
        SHOW_RESULTS: "Show results",
      },
    },
  };
});

const mockUseContactFilterStore = vi.mocked(useContactFilterStore);

describe("ContactFilters Component", () => {
  const mockSetOpenModal = vi.fn();
  const mockOnExposeClear = vi.fn();
  const mockOnFiltersApplied = vi.fn();
  const mockGetFilters = vi.fn();
  const mockSetFilters = vi.fn();
  const mockSetApplied = vi.fn();
  const mockClearStore = vi.fn();

  const defaultProps = {
    setOpenModal: mockSetOpenModal,
  };

  const defaultFilters = {
    contactTypeIntFilter: [],
    contactTypeExtFilter: [],
    nameFilter: {},
    orgFilter: {},
    grpFilter: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFilters.mockReturnValue(defaultFilters);
    mockUseContactFilterStore.mockImplementation((selector: any) => {
      const store = {
        getFilters: mockGetFilters,
        setFilters: mockSetFilters,
        setApplied: mockSetApplied,
        clear: mockClearStore,
      };
      return selector(store);
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <ContactFilters {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  describe("Initial Rendering", () => {
    it("should render the component successfully", () => {
      renderComponent();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    it("should render all MultiSearch components", () => {
      renderComponent();
      expect(screen.getByTestId("multi-search-name")).toBeInTheDocument();
      expect(screen.getByTestId("multi-search-organization")).toBeInTheDocument();
      expect(screen.getByTestId("multi-search-group")).toBeInTheDocument();
    });

    it("should render all CheckboxGroup components", () => {
      renderComponent();
      expect(screen.getByTestId("checkbox-group-Contact type (external contact)")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-group-Contact type (internal user)")).toBeInTheDocument();
    });

    it("should render Clear all button", () => {
      renderComponent();
      expect(screen.getByText("Clear all")).toBeInTheDocument();
    });

    it("should render Show results button", () => {
      renderComponent();
      expect(screen.getByText("Show results")).toBeInTheDocument();
    });

    it("should initialize with default filters from store", () => {
      const initialFilters = {
        contactTypeIntFilter: ["Client Manager"],
        contactTypeExtFilter: ["Primary daily"],
        nameFilter: { "1": "John Doe" },
        orgFilter: { "2": "Acme Corp" },
        grpFilter: { "3": "Group A" },
      };
      mockGetFilters.mockReturnValue(initialFilters);

      renderComponent();
      expect(mockGetFilters).toHaveBeenCalled();
    });

    it("should render external contact types", () => {
      renderComponent();
      expect(screen.getByText("Primary daily")).toBeInTheDocument();
      expect(screen.getByText("Primary billing")).toBeInTheDocument();
      expect(screen.getByText("Secondary billing")).toBeInTheDocument();
      expect(screen.getByText("Eligibility")).toBeInTheDocument();
      expect(screen.getByText("Marketing - Telemed")).toBeInTheDocument();
      expect(screen.getByText("Marketing - CCM")).toBeInTheDocument();
      expect(screen.getByText("Reporting")).toBeInTheDocument();
    });

    it("should render internal contact types", () => {
      renderComponent();
      expect(screen.getByText("Client Manager")).toBeInTheDocument();
      expect(screen.getByText("Client Implementation Manager")).toBeInTheDocument();
      expect(screen.getByText("Client Operations Manager")).toBeInTheDocument();
      expect(screen.getByText("Sales Agent")).toBeInTheDocument();
    });

    it("should render with proper styling classes", () => {
      const { container } = renderComponent();
      expect(container.querySelector(".contact-filter-container")).toBeInTheDocument();
      expect(container.querySelector(".content")).toBeInTheDocument();
      expect(container.querySelector(".footer")).toBeInTheDocument();
    });
  });

  describe("Store Integration", () => {
    it("should call getFilters on mount", () => {
      renderComponent();
      expect(mockGetFilters).toHaveBeenCalled();
    });

    it("should use filters from store as initial state", () => {
      const storeFilters = {
        contactTypeIntFilter: ["Client Manager"],
        contactTypeExtFilter: ["Primary daily"],
        nameFilter: { "1": "Test Name" },
        orgFilter: { "2": "Test Org" },
        grpFilter: { "3": "Test Group" },
      };
      mockGetFilters.mockReturnValue(storeFilters);

      renderComponent();
      
      const clientManagerCheckbox = screen.getByTestId("checkbox-Client Manager");
      expect(clientManagerCheckbox).toBeChecked();
      
      const primaryDailyCheckbox = screen.getByTestId("checkbox-Primary daily");
      expect(primaryDailyCheckbox).toBeChecked();
    });

    it("should handle empty filters from store", () => {
      mockGetFilters.mockReturnValue({
        contactTypeIntFilter: [],
        contactTypeExtFilter: [],
        nameFilter: {},
        orgFilter: {},
        grpFilter: {},
      });

      renderComponent();
      expect(mockGetFilters).toHaveBeenCalled();
    });

    it("should handle empty filters from store gracefully", () => {
      mockGetFilters.mockReturnValue({
        contactTypeIntFilter: [],
        contactTypeExtFilter: [],
        nameFilter: {},
        orgFilter: {},
        grpFilter: {},
      });
      expect(() => renderComponent()).not.toThrow();
    });
  });

  describe("Name Filter", () => {
    it("should render Name MultiSearch component", () => {
      renderComponent();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    it("should update name filter on change", () => {
      renderComponent();
      const input = screen.getByTestId("name-input");
      fireEvent.change(input, { target: { value: "John" } });
      // Mock component shows count of selected items
      expect(input).toHaveValue("1");
    });

    it("should pass preSelected values to Name MultiSearch", () => {
      const initialFilters = {
        ...defaultFilters,
        nameFilter: { "1": "John Doe", "2": "Jane Smith" },
      };
      mockGetFilters.mockReturnValue(initialFilters);

      renderComponent();
      expect(screen.getByTestId("multi-search-name")).toBeInTheDocument();
    });
  });

  describe("Organization Filter", () => {
    it("should render Organization MultiSearch component", () => {
      renderComponent();
      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("should update organization filter on change", () => {
      renderComponent();
      const input = screen.getByTestId("organization-input");
      fireEvent.change(input, { target: { value: "Acme" } });
      // Mock component shows count of selected items
      expect(input).toHaveValue("1");
    });

    it("should pass preSelected values to Organization MultiSearch", () => {
      const initialFilters = {
        ...defaultFilters,
        orgFilter: { "1": "Org 1", "2": "Org 2" },
      };
      mockGetFilters.mockReturnValue(initialFilters);

      renderComponent();
      expect(screen.getByTestId("multi-search-organization")).toBeInTheDocument();
    });
  });

  describe("Group Filter", () => {
    it("should render Group MultiSearch component", () => {
      renderComponent();
      expect(screen.getByText("Group")).toBeInTheDocument();
    });

    it("should update group filter on change", () => {
      renderComponent();
      const input = screen.getByTestId("group-input");
      fireEvent.change(input, { target: { value: "Group A" } });
      // Mock component shows count of selected items
      expect(input).toHaveValue("1");
    });

    it("should pass preSelected values to Group MultiSearch", () => {
      const initialFilters = {
        ...defaultFilters,
        grpFilter: { "1": "Group 1", "2": "Group 2" },
      };
      mockGetFilters.mockReturnValue(initialFilters);

      renderComponent();
      expect(screen.getByTestId("multi-search-group")).toBeInTheDocument();
    });
  });

  describe("External Contact Type Filter", () => {
    it("should render all external contact type options", () => {
      renderComponent();
      expect(screen.getByTestId("checkbox-Primary daily")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-Primary billing")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-Secondary billing")).toBeInTheDocument();
    });

    it("should toggle external contact type checkbox", () => {
      renderComponent();
      const checkbox = screen.getByTestId("checkbox-Primary daily");
      
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("should handle multiple external contact type selections", () => {
      renderComponent();
      const checkbox1 = screen.getByTestId("checkbox-Primary daily");
      const checkbox2 = screen.getByTestId("checkbox-Primary billing");
      
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);
      
      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
    });

    it("should uncheck external contact type when clicked again", () => {
      renderComponent();
      const checkbox = screen.getByTestId("checkbox-Primary daily");
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should initialize with preselected external contact types", () => {
      const initialFilters = {
        ...defaultFilters,
        contactTypeExtFilter: ["Primary daily", "Reporting"],
      };
      mockGetFilters.mockReturnValue(initialFilters);

      renderComponent();
      
      expect(screen.getByTestId("checkbox-Primary daily")).toBeChecked();
      expect(screen.getByTestId("checkbox-Reporting")).toBeChecked();
    });
  });

  describe("Internal Contact Type Filter", () => {
    it("should render all internal contact type options", () => {
      renderComponent();
      expect(screen.getByTestId("checkbox-Client Manager")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-Client Implementation Manager")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-Client Operations Manager")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-Sales Agent")).toBeInTheDocument();
    });

    it("should toggle internal contact type checkbox", () => {
      renderComponent();
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("should handle multiple internal contact type selections", () => {
      renderComponent();
      const checkbox1 = screen.getByTestId("checkbox-Client Manager");
      const checkbox2 = screen.getByTestId("checkbox-Sales Agent");
      
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);
      
      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
    });

    it("should uncheck internal contact type when clicked again", () => {
      renderComponent();
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should initialize with preselected internal contact types", () => {
      const initialFilters = {
        ...defaultFilters,
        contactTypeIntFilter: ["Client Manager", "Sales Agent"],
      };
      mockGetFilters.mockReturnValue(initialFilters);

      renderComponent();
      
      expect(screen.getByTestId("checkbox-Client Manager")).toBeChecked();
      expect(screen.getByTestId("checkbox-Sales Agent")).toBeChecked();
    });
  });

  describe("Apply Filters", () => {
    it("should call setFilters when Show results is clicked", () => {
      renderComponent();
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      expect(mockSetFilters).toHaveBeenCalled();
    });

    it("should call setApplied when Show results is clicked", () => {
      renderComponent();
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      expect(mockSetApplied).toHaveBeenCalled();
    });

    it("should close modal when Show results is clicked", () => {
      renderComponent();
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      expect(mockSetOpenModal).toHaveBeenCalledWith(false);
    });

    it("should call onFiltersApplied callback when provided", () => {
      renderComponent({ onFiltersApplied: mockOnFiltersApplied });
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      expect(mockOnFiltersApplied).toHaveBeenCalled();
    });

    it("should not crash if onFiltersApplied is not provided", () => {
      renderComponent();
      const applyButton = screen.getByText("Show results");
      expect(() => fireEvent.click(applyButton)).not.toThrow();
    });

    it("should compute correct applied filter count with no filters", () => {
      renderComponent();
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith({
        filteredAppliedKeys: [],
        filterApplied: 0,
      });
    });

    it("should compute correct applied filter count with name filter", () => {
      renderComponent();
      
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filterApplied: 1,
        })
      );
    });

    it("should compute correct applied filter count with multiple filters", () => {
      renderComponent();
      
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const orgInput = screen.getByTestId("organization-input");
      fireEvent.change(orgInput, { target: { value: "Acme" } });
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filterApplied: 3,
        })
      );
    });

    it("should include Name in applied keys when name filter is set", () => {
      renderComponent();
      
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredAppliedKeys: expect.arrayContaining(["Name"]),
        })
      );
    });

    it("should include Organization in applied keys when org filter is set", () => {
      renderComponent();
      
      const orgInput = screen.getByTestId("organization-input");
      fireEvent.change(orgInput, { target: { value: "Acme" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredAppliedKeys: expect.arrayContaining(["Organization"]),
        })
      );
    });

    it("should include Group in applied keys when group filter is set", () => {
      renderComponent();
      
      const grpInput = screen.getByTestId("group-input");
      fireEvent.change(grpInput, { target: { value: "Group A" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredAppliedKeys: expect.arrayContaining(["Group"]),
        })
      );
    });

    it("should include internal contact type in applied keys", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredAppliedKeys: expect.arrayContaining(["Contact type (internal user)"]),
        })
      );
    });

    it("should include external contact type in applied keys", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Primary daily");
      fireEvent.click(checkbox);
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredAppliedKeys: expect.arrayContaining(["Contact type (external contact)"]),
        })
      );
    });

    it("should pass all filter values to setFilters", () => {
      renderComponent();
      
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          nameFilter: expect.any(Object),
          orgFilter: expect.any(Object),
          grpFilter: expect.any(Object),
          contactTypeIntFilter: expect.any(Array),
          contactTypeExtFilter: expect.any(Array),
        })
      );
    });
  });

  describe("Clear Filters", () => {
    it("should render Clear all button", () => {
      renderComponent();
      expect(screen.getByText("Clear all")).toBeInTheDocument();
    });

    it("should clear all filters when Clear all is clicked", () => {
      const initialFilters = {
        contactTypeIntFilter: ["Client Manager"],
        contactTypeExtFilter: ["Primary daily"],
        nameFilter: { "1": "John" },
        orgFilter: { "2": "Acme" },
        grpFilter: { "3": "Group A" },
      };
      mockGetFilters.mockReturnValue(initialFilters);

      renderComponent();
      
      const clearButton = screen.getByText("Clear all");
      fireEvent.click(clearButton);
      
      expect(mockClearStore).toHaveBeenCalled();
    });

    it("should clear internal contact type selections", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      const clearButton = screen.getByText("Clear all");
      fireEvent.click(clearButton);
      
      expect(checkbox).not.toBeChecked();
    });

    it("should clear external contact type selections", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Primary daily");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      const clearButton = screen.getByText("Clear all");
      fireEvent.click(clearButton);
      
      expect(checkbox).not.toBeChecked();
    });

    it("should call clearStore when clearing filters", () => {
      renderComponent();
      const clearButton = screen.getByText("Clear all");
      fireEvent.click(clearButton);
      expect(mockClearStore).toHaveBeenCalled();
    });

    it("should expose clear function via onExposeClear callback", () => {
      renderComponent({ onExposeClear: mockOnExposeClear });
      expect(mockOnExposeClear).toHaveBeenCalled();
      expect(mockOnExposeClear).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should not crash if onExposeClear is not provided", () => {
      expect(() => renderComponent()).not.toThrow();
    });

    it("should allow external trigger of clear via exposed function", async () => {
      const { act } = await import("@testing-library/react");
      let exposedClearFn: (() => void) | null = null;
      const captureExposedFn = (fn: () => void) => {
        exposedClearFn = fn;
      };

      renderComponent({ onExposeClear: captureExposedFn });
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      if (exposedClearFn) {
        await act(async () => {
          exposedClearFn!();
        });
      }
      
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("Button Variants", () => {
    it("should render Clear all button with secondary variant", () => {
      renderComponent();
      const clearButton = screen.getByText("Clear all");
      expect(clearButton).toHaveAttribute("data-variant", "secondary");
    });

    it("should render Show results button with primary variant", () => {
      renderComponent();
      const applyButton = screen.getByText("Show results");
      expect(applyButton).toHaveAttribute("data-variant", "primary");
    });
  });

  describe("Filter Computation", () => {
    it("should count name filter when set", () => {
      renderComponent();
      
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({ filterApplied: 1 })
      );
    });

    it("should count organization filter when set", () => {
      renderComponent();
      
      const orgInput = screen.getByTestId("organization-input");
      fireEvent.change(orgInput, { target: { value: "Acme" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({ filterApplied: 1 })
      );
    });

    it("should count group filter when set", () => {
      renderComponent();
      
      const grpInput = screen.getByTestId("group-input");
      fireEvent.change(grpInput, { target: { value: "Group A" } });
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({ filterApplied: 1 })
      );
    });

    it("should count internal contact type filter when set", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({ filterApplied: 1 })
      );
    });

    it("should count external contact type filter when set", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Primary daily");
      fireEvent.click(checkbox);
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({ filterApplied: 1 })
      );
    });

    it("should count all filters correctly when multiple are set", () => {
      renderComponent();
      
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const orgInput = screen.getByTestId("organization-input");
      fireEvent.change(orgInput, { target: { value: "Acme" } });
      
      const grpInput = screen.getByTestId("group-input");
      fireEvent.change(grpInput, { target: { value: "Group A" } });
      
      const intCheckbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(intCheckbox);
      
      const extCheckbox = screen.getByTestId("checkbox-Primary daily");
      fireEvent.click(extCheckbox);
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({ filterApplied: 5 })
      );
    });

    it("should return empty array for applied keys when no filters are set", () => {
      renderComponent();
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({ filteredAppliedKeys: [] })
      );
    });

    it("should include all filter names in applied keys when all are set", () => {
      renderComponent();
      
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const orgInput = screen.getByTestId("organization-input");
      fireEvent.change(orgInput, { target: { value: "Acme" } });
      
      const grpInput = screen.getByTestId("group-input");
      fireEvent.change(grpInput, { target: { value: "Group A" } });
      
      const intCheckbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(intCheckbox);
      
      const extCheckbox = screen.getByTestId("checkbox-Primary daily");
      fireEvent.click(extCheckbox);
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetApplied).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredAppliedKeys: expect.arrayContaining([
            "Name",
            "Organization",
            "Group",
            "Contact type (internal user)",
            "Contact type (external contact)",
          ]),
        })
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid filter changes", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    it("should handle applying filters multiple times", () => {
      renderComponent();
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      fireEvent.click(applyButton);
      fireEvent.click(applyButton);
      
      expect(mockSetFilters).toHaveBeenCalledTimes(3);
    });

    it("should handle clearing filters multiple times", () => {
      renderComponent();
      
      const clearButton = screen.getByText("Clear all");
      fireEvent.click(clearButton);
      fireEvent.click(clearButton);
      
      expect(mockClearStore).toHaveBeenCalledTimes(2);
    });

    it("should handle empty object for name filter", () => {
      mockGetFilters.mockReturnValue({
        ...defaultFilters,
        nameFilter: {},
      });

      renderComponent();
      expect(screen.getByTestId("multi-search-name")).toBeInTheDocument();
    });

    it("should handle empty arrays and objects", () => {
      mockGetFilters.mockReturnValue({
        contactTypeIntFilter: [],
        contactTypeExtFilter: [],
        nameFilter: {},
        orgFilter: {},
        grpFilter: {},
      });

      renderComponent();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    it("should maintain filter state across multiple interactions", () => {
      renderComponent();
      
      const intCheckbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(intCheckbox);
      
      const extCheckbox = screen.getByTestId("checkbox-Primary daily");
      fireEvent.click(extCheckbox);
      
      expect(intCheckbox).toBeChecked();
      expect(extCheckbox).toBeChecked();
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          contactTypeIntFilter: ["Client Manager"],
          contactTypeExtFilter: ["Primary daily"],
        })
      );
    });

    it("should clear and reapply filters correctly", () => {
      renderComponent();
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      const clearButton = screen.getByText("Clear all");
      fireEvent.click(clearButton);
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          contactTypeIntFilter: ["Client Manager"],
        })
      );
    });

    it("should handle complete filter workflow", () => {
      renderComponent({ onFiltersApplied: mockOnFiltersApplied });
      
      // Set multiple filters
      const nameInput = screen.getByTestId("name-input");
      fireEvent.change(nameInput, { target: { value: "John" } });
      
      const checkbox = screen.getByTestId("checkbox-Client Manager");
      fireEvent.click(checkbox);
      
      // Apply filters
      const applyButton = screen.getByText("Show results");
      fireEvent.click(applyButton);
      
      // Verify all callbacks were called
      expect(mockSetFilters).toHaveBeenCalled();
      expect(mockSetApplied).toHaveBeenCalled();
      expect(mockSetOpenModal).toHaveBeenCalledWith(false);
      expect(mockOnFiltersApplied).toHaveBeenCalled();
    });
  });
});
