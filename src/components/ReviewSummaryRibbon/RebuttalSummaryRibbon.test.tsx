import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RebuttalSummaryRibbon from "./RebuttalSummaryRibbon";
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

// Reasons arrive already resolved to labels by ConfigReview.
const mockRebuttal = {
  message: "The assigned administrator submitted a rebuttal to your review",
  rebuttalReason: ["Admin related", "Billing related"],
  comments: "Sending rebuttal",
};

describe("RebuttalSummaryRibbon", () => {
  beforeEach(() => {
    useReviewStore.getState().resetReviewState();
  });

  it("renders nothing when there is no rebuttal summary", () => {
    const { container } = render(<RebuttalSummaryRibbon />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the rebuttal message and view link", () => {
    useReviewStore.getState().setLatestRebuttalSummary(mockRebuttal);

    render(<RebuttalSummaryRibbon />);

    expect(screen.getByTestId("rebuttal-summary-ribbon")).toBeInTheDocument();
    expect(screen.getByText(mockRebuttal.message)).toBeInTheDocument();
    expect(screen.getByText("View rebuttal")).toBeInTheDocument();
    expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
  });

  it("opens the rebuttal modal with reason and comments", () => {
    useReviewStore.getState().setLatestRebuttalSummary(mockRebuttal);

    render(<RebuttalSummaryRibbon />);
    expect(screen.queryByTestId("review-summary-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("View rebuttal"));

    expect(screen.getByText("Review rebuttal")).toBeInTheDocument();
    expect(screen.getByText("Rebuttal reason")).toBeInTheDocument();
    expect(screen.getByText("Admin related; Billing related")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Sending rebuttal")).toBeInTheDocument();
    // Review-only fields must not leak into the rebuttal variant.
    expect(screen.queryByText("Error category")).not.toBeInTheDocument();
    expect(screen.queryByText("Error type")).not.toBeInTheDocument();
  });

  it("closes the modal on Continue", async () => {
    useReviewStore.getState().setLatestRebuttalSummary(mockRebuttal);

    render(<RebuttalSummaryRibbon />);
    fireEvent.click(screen.getByText("View rebuttal"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Continue"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("omits the reason row when no reasons were given", () => {
    useReviewStore
      .getState()
      .setLatestRebuttalSummary({ ...mockRebuttal, rebuttalReason: [] });

    render(<RebuttalSummaryRibbon />);
    fireEvent.click(screen.getByText("View rebuttal"));

    expect(screen.queryByText("Rebuttal reason")).not.toBeInTheDocument();
    expect(screen.getByText("Sending rebuttal")).toBeInTheDocument();
  });
});
