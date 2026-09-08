import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewSummaryRibbon from "./ReviewSummaryRibbon";
import useReviewStore from "@/store/useReviewStore";

vi.mock("./ReviewSummaryRibbon.scss", () => ({}));
vi.mock("./ReviewSummaryModal.scss", () => ({}));

vi.mock("react-icons/fa6", () => ({
  FaCircleXmark: () => <span data-testid="reject-icon" />,
  FaTriangleExclamation: () => <span data-testid="warning-icon" />,
}));

vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockSummary = {
  message: "Your update was rejected by peer reviewer. Please review the summary below.",
  errorCategories: ["Member access permission", "Billing address"],
  errorTypes: ["Billing error", "Permission error"],
  comments: "Client config reviewed. Rejected due to wrong authorized consenters and billing zip code.",
};

describe("ReviewSummaryRibbon", () => {
  beforeEach(() => {
    useReviewStore.getState().resetReviewState();
  });

  it("renders nothing when no review summary is available", () => {
    const { container } = render(<ReviewSummaryRibbon />);
    expect(container.firstChild).toBeNull();
  });

  it("renders rejected update count and view link", () => {
    useReviewStore.getState().setLatestReviewSummary(mockSummary, 2);

    render(<ReviewSummaryRibbon />);

    expect(screen.getByText("2 updates rejected by reviewer.")).toBeInTheDocument();
    expect(screen.getByText("View review summary")).toBeInTheDocument();
    expect(screen.getByTestId("reject-icon")).toBeInTheDocument();
  });

  it("opens modal on View review summary click", () => {
    useReviewStore.getState().setLatestReviewSummary(mockSummary, 2);

    render(<ReviewSummaryRibbon />);

    expect(screen.queryByTestId("review-summary-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("View review summary"));

    expect(screen.getByTestId("review-summary-modal")).toBeInTheDocument();
    expect(screen.getByText("Review summary")).toBeInTheDocument();
    expect(
      screen.getByText("Your update was rejected by peer reviewer."),
    ).toBeInTheDocument();
    expect(screen.getByText("Please review the summary below.")).toBeInTheDocument();
    expect(
      screen.getByText("Member access permission; Billing address"),
    ).toBeInTheDocument();
    expect(screen.getByText("Billing error; Permission error")).toBeInTheDocument();
  });

  it("closes modal on Continue click", async () => {
    useReviewStore.getState().setLatestReviewSummary(mockSummary, 2);

    render(<ReviewSummaryRibbon />);

    fireEvent.click(screen.getByText("View review summary"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Continue"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
