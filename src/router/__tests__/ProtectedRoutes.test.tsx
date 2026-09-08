import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// vi.mock is hoisted above const declarations, so use vi.hoisted to avoid
// "Cannot access before initialization" (temporal dead zone) errors
const mockVerifySessionTokens = vi.hoisted(() => vi.fn());
vi.mock("@/utils/sessionGuard", () => ({
  verifySessionTokens: mockVerifySessionTokens,
}));

vi.mock("@ucc/common-ui", () => ({
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
}));

import ProtectedRoutes from "../ProtectedRoutes";

const renderProtected = (childContent = <div>Protected Content</div>) =>
  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/protected" element={<ProtectedRoutes />}>
          <Route index element={childContent} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loader while verifying session", () => {
    // Never resolves — keeps component in checkingSession state
    mockVerifySessionTokens.mockReturnValue(new Promise(() => {}));

    renderProtected();

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Verifying session...")).toBeInTheDocument();
  });

  it("renders Outlet when session is valid", async () => {
    mockVerifySessionTokens.mockResolvedValue(true);

    renderProtected();

    await screen.findByText("Protected Content");
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("renders child routes through Outlet", async () => {
    mockVerifySessionTokens.mockResolvedValue(true);

    renderProtected(<div data-testid="child-content">Child Component</div>);

    await screen.findByTestId("child-content");
    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });

  it("redirects to /login when session is invalid", async () => {
    mockVerifySessionTokens.mockResolvedValue(false);

    renderProtected();

    await screen.findByTestId("login-page");
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to /login when session verification throws", async () => {
    mockVerifySessionTokens.mockRejectedValue(new Error("Network error"));

    renderProtected();

    await screen.findByTestId("login-page");
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("hides loader after session check completes (valid)", async () => {
    mockVerifySessionTokens.mockResolvedValue(true);

    renderProtected();

    await screen.findByText("Protected Content");
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("hides loader after session check completes (invalid)", async () => {
    mockVerifySessionTokens.mockResolvedValue(false);

    renderProtected();

    await screen.findByTestId("login-page");
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("calls verifySessionTokens once on mount", async () => {
    mockVerifySessionTokens.mockResolvedValue(true);

    renderProtected();

    await screen.findByText("Protected Content");
    expect(mockVerifySessionTokens).toHaveBeenCalledTimes(1);
  });
});
