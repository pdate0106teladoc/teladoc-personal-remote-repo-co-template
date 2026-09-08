import { render, screen } from "@testing-library/react";
import CommentsPage from "../Comments";

describe("<CommentsPage />", () => {
  it("renders the heading", () => {
    render(<CommentsPage />);
    expect(screen.getByText("Comments")).toBeInTheDocument();
  });

  it("renders the description paragraph", () => {
    render(<CommentsPage />);
    expect(screen.getByText("This is the comments page.")).toBeInTheDocument();
  });

  it("renders the container div", () => {
    render(<CommentsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("This is the comments page.")).toBeInTheDocument();
  });
});