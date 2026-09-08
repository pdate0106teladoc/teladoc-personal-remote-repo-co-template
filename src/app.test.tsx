import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
vi.mock("@/styles/globals.scss", () => ({}));
vi.mock("./styles/globals.scss", () => ({}));

vi.mock("@ucc/common-ui", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("./router", () => ({
  __esModule: true,
  default: () => <div data-testid="router" />,
}));

import App from "../src/App";

describe("App component", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it("renders Toaster component", () => {
    render(<App />);
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  it("renders Router component", () => {
    render(<App />);
    expect(screen.getByTestId("router")).toBeInTheDocument();
  });

  it("renders Toaster before Router in the DOM", () => {
    render(<App />);
    const toaster = screen.getByTestId("toaster");
    const router = screen.getByTestId("router");

    // Check DOM order
    expect(toaster.compareDocumentPosition(router)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
