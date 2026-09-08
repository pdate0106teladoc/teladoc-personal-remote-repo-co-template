import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "./ProgressBar";

vi.mock("./ProgressBar.scss", () => ({}));

describe("ProgressBar", () => {
  it("renders the progress bar with correct width", () => {
    const { container } = render(<ProgressBar progress={50} />);
    const bar = container.querySelector(".progress-bar");
    expect(bar).toHaveStyle({ width: "50%" });
  });

  it("displays the upload percentage text", () => {
    render(<ProgressBar progress={75} />);
    expect(screen.getByText("Uploading... 75%")).toBeInTheDocument();
  });

  it("handles 0% progress", () => {
    const { container } = render(<ProgressBar progress={0} />);
    const bar = container.querySelector(".progress-bar");
    expect(bar).toHaveStyle({ width: "0%" });
    expect(screen.getByText("Uploading... 0%")).toBeInTheDocument();
  });

  it("handles 100% progress", () => {
    const { container } = render(<ProgressBar progress={100} />);
    const bar = container.querySelector(".progress-bar");
    expect(bar).toHaveStyle({ width: "100%" });
    expect(screen.getByText("Uploading... 100%")).toBeInTheDocument();
  });

  it("renders progress-container wrapper", () => {
    const { container } = render(<ProgressBar progress={25} />);
    expect(container.querySelector(".progress-container")).toBeInTheDocument();
  });
});
