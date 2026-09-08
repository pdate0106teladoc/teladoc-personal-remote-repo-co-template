import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeLcrmTelemedicineSlider from "../ChangeLcrmTelemedicineSlider";

const mockApiGet = vi.fn();
const mockApiPatch = vi.fn();
const mockToast = vi.fn();

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockApiGet(...args),
    patch: (...args: any[]) => mockApiPatch(...args),
  },
}));

vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    showCustomToast: (args: any) => mockToast(args),
    Button: ({ children, disabled, onClick, variant, className, ...rest }: any) => (
      <button
        disabled={disabled}
        onClick={onClick}
        data-variant={variant}
        className={className}
        {...rest}
      >
        {children}
      </button>
    ),
    RoundedLabel: ({ text }: any) => <span>{text}</span>,
    WarningIcon: ({ className }: any) => (
      <span className={className}>⚠</span>
    ),
  };
});

vi.mock("@/assets", () => ({
  SuccessIcon: ({ className }: any) => (
    <span className={className} data-testid="success-icon">
      ✓
    </span>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockApiGet.mockResolvedValue({ results: [] });
  mockApiPatch.mockResolvedValue({});
});

const defaultProps = {
  currentAccountName: "Test Account",
  currentAccountGuid: "GUID-123",
  currentVerificationStatus: "VERIFIED",
  organizationName: "Test Org",
  organizationUUID: "org-uuid-1",
  organizationId: "org-id-1",
  source: "telemed" as const,
  onClose: vi.fn(),
  onSave: vi.fn(),
};

const searchResult = {
  account_uuid: "uuid-1",
  account_name: "New Account",
  account_guid: "GUID-NEW",
  account_creation_date: "2023-01-15",
  opportunity_name: "Opp 1",
  opportunity_id: "opp-1",
  opportunity_url: "https://example.com/opp/1",
  revenue_effective_date: "2023-06-01",
};

async function searchAndSelectAccount() {
  const input = screen.getByPlaceholderText("Search account...");
  fireEvent.change(input, { target: { value: "New Acc" } });

  const dropdownItem = await screen.findByText("New Account", {
    selector: ".lcrm-result-name",
  });
  fireEvent.click(dropdownItem);
}

describe("ChangeLcrmTelemedicineSlider", () => {
  describe("Save button disabled state on initial load", () => {
    it("disables the Save button when the drawer opens with an already-verified account", async () => {
      mockApiGet.mockResolvedValue({
        results: [
          {
            account_name: "Test Account",
            account_guid: "GUID-123",
            account_creation_date: "2023-01-01",
            opportunity_name: "Opp",
            opportunity_id: "opp-1",
            revenue_effective_date: "2023-05-01",
          },
        ],
      });

      render(<ChangeLcrmTelemedicineSlider {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("selected-account")).toBeInTheDocument();
      });

      expect(screen.getByText("Save")).toBeDisabled();
    });

    it("disables the Save button when the drawer opens with an unverified account", async () => {
      mockApiGet.mockResolvedValue({
        results: [
          {
            account_name: "Test Account",
            account_guid: "GUID-123",
            account_creation_date: "2023-01-01",
          },
        ],
      });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentVerificationStatus="UNVERIFIED"
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId("selected-account")).toBeInTheDocument();
      });

      expect(screen.getByText("Save")).toBeDisabled();
    });
  });

  describe("Save button enabled after user changes account", () => {
    it("enables Save when user selects a new account and clicks Verify", async () => {
      mockApiGet.mockResolvedValue({ results: [searchResult] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      await searchAndSelectAccount();

      expect(screen.getByText("Save")).toBeDisabled();

      fireEvent.click(screen.getByText("Verify account"));

      expect(screen.getByText("Save")).not.toBeDisabled();
    });

    it("keeps Save disabled when user selects a non-verified account without verifying", async () => {
      mockApiGet.mockResolvedValue({ results: [searchResult] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      await searchAndSelectAccount();

      expect(screen.getByText("Save")).toBeDisabled();
    });

    it("enables Save when user selects a verified account (same as current GUID)", async () => {
      const verifiedResult = {
        ...searchResult,
        account_guid: "GUID-123",
        account_name: "Matched Account",
      };
      // First call is the mount pre-load, second is the user search
      mockApiGet.mockResolvedValue({ results: [verifiedResult] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid="GUID-123"
          currentVerificationStatus="VERIFIED"
        />,
      );

      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByTestId("selected-account")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("Search account...");
      fireEvent.change(input, { target: { value: "Match" } });

      const dropdownItem = await screen.findByText("Matched Account", {
        selector: ".lcrm-result-name",
      });
      fireEvent.click(dropdownItem);

      expect(screen.getByText("Save")).not.toBeDisabled();
    });
  });

  describe("Save button behavior with relationship type change", () => {
    it("disables Save when relationship type changes but no account is selected", () => {
      mockApiGet.mockResolvedValue({ results: [] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      fireEvent.click(screen.getByText("Parent organization's account"));

      expect(screen.getByText("Save")).toBeDisabled();
    });
  });

  describe("Save action", () => {
    it("calls API and shows success toast on save", async () => {
      mockApiGet.mockResolvedValue({ results: [searchResult] });
      mockApiPatch.mockResolvedValue({});

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      await searchAndSelectAccount();

      fireEvent.click(screen.getByText("Verify account"));
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(mockApiPatch).toHaveBeenCalledWith(
          expect.stringContaining("org-uuid-1"),
          expect.objectContaining({
            accountGuid: "GUID-NEW",
            accountName: "New Account",
            status: "VERIFIED",
          }),
        );
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "success" }),
        );
      });
    });

    it("shows error toast when save API fails", async () => {
      mockApiGet.mockResolvedValue({ results: [searchResult] });
      mockApiPatch.mockRejectedValue(new Error("fail"));

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      await searchAndSelectAccount();

      fireEvent.click(screen.getByText("Verify account"));
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        );
      });
    });
  });

  describe("Cancel button", () => {
    it("calls onClose when Cancel is clicked", () => {
      mockApiGet.mockResolvedValue({ results: [] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      fireEvent.click(screen.getByText("Cancel"));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe("Billing org constraints", () => {
    it("disables parent_derived radio when isBillingOrg is true", () => {
      mockApiGet.mockResolvedValue({ results: [] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          isBillingOrg={true}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      const parentRadio = screen.getByDisplayValue("parent");
      expect(parentRadio).toBeDisabled();
    });

    it("shows warning banner for billing org", () => {
      mockApiGet.mockResolvedValue({ results: [] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          isBillingOrg={true}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      expect(
        screen.getByText("This organization is a billing org."),
      ).toBeInTheDocument();
    });
  });

  describe("Client Manager field", () => {
    it("renders the client_manager value for a selected account", async () => {
      mockApiGet.mockResolvedValue({
        results: [{ ...searchResult, client_manager: "Jane Doe" }],
      });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      await searchAndSelectAccount();

      const keyCell = screen.getByText("Client Manager");
      expect(keyCell.nextElementSibling).toHaveTextContent("Jane Doe");
    });

    it("renders the client_manager value from the initial pre-load", async () => {
      mockApiGet.mockResolvedValue({
        results: [
          {
            account_name: "Test Account",
            account_guid: "GUID-123",
            client_manager: "John Smith",
          },
        ],
      });

      render(<ChangeLcrmTelemedicineSlider {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("selected-account")).toBeInTheDocument();
      });

      const keyCell = screen.getByText("Client Manager");
      expect(keyCell.nextElementSibling).toHaveTextContent("John Smith");
    });

    it('falls back to "-" when client_manager is missing', async () => {
      mockApiGet.mockResolvedValue({ results: [searchResult] });

      render(
        <ChangeLcrmTelemedicineSlider
          {...defaultProps}
          currentAccountGuid=""
          currentVerificationStatus=""
        />,
      );

      await searchAndSelectAccount();

      const keyCell = screen.getByText("Client Manager");
      expect(keyCell.nextElementSibling).toHaveTextContent("-");
    });
  });

  describe("Search and clear", () => {
    it("clears search input and selected account when clear button is clicked", async () => {
      mockApiGet.mockResolvedValue({
        results: [
          {
            account_name: "Test Account",
            account_guid: "GUID-123",
          },
        ],
      });

      render(<ChangeLcrmTelemedicineSlider {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Account")).toBeInTheDocument();
      });

      const clearBtn = screen.getByLabelText("Clear search");
      fireEvent.click(clearBtn);

      expect(screen.getByPlaceholderText("Search account...")).toHaveValue("");
    });
  });
});
