import { render, screen } from "@testing-library/react";
import QualityReviewerDashboard from "../QualityReviewerDashboard/QualityReviewerDashboard";

describe("QualityReviewerDashboard", () => {
  it("renders the dashboard with the correct userName", () => {
    const userName = "Jane Doe";
    render(<QualityReviewerDashboard userName={userName} />);

    // Check if the welcome message contains the correct userName
    expect(
      screen.getByRole("heading", { name: `Welcome to Nirvana, ${userName}!` }),
    ).toBeInTheDocument();
  });

  it("renders the main container with the correct class", () => {
    render(<QualityReviewerDashboard userName="Jane Doe" />);

    // Check if the main container has the correct class
    const mainContainer = screen.getByRole("main");
    expect(mainContainer).toHaveClass("dashboard reviewer");
  });

  it("renders the layout with correct structure", () => {
    render(<QualityReviewerDashboard userName="Jane Doe" />);

    // Check if the layout structure is correct
    const header = screen.getByRole("heading", {
      name: "Welcome to Nirvana, Jane Doe!",
    });

    expect(header).toBeInTheDocument();
  });
});
