import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CountdownToast } from "./CountdownToast";

describe("CountdownToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders name and countdown text", () => {
    const closeToast = vi.fn();
    render(
      <CountdownToast name="Session expired" url="/login" closeToast={closeToast} />,
    );

    expect(screen.getByText("Session expired")).toBeInTheDocument();
    expect(screen.getByText("Redirecting in 3 …")).toBeInTheDocument();
  });

  it("counts down from 3 to 2 after 1 second", () => {
    const closeToast = vi.fn();
    render(
      <CountdownToast name="Test" url="/redirect" closeToast={closeToast} />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Redirecting in 2 …")).toBeInTheDocument();
  });

  it("counts down to 1 after 2 seconds", () => {
    const closeToast = vi.fn();
    render(
      <CountdownToast name="Test" url="/redirect" closeToast={closeToast} />,
    );

    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(screen.getByText("Redirecting in 1 …")).toBeInTheDocument();
  });

  it("calls closeToast and sets window.location.href at 0", () => {
    const closeToast = vi.fn();
    render(
      <CountdownToast name="Test" url="/login" closeToast={closeToast} />,
    );

    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(closeToast).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");
  });

  it("clears timer on unmount", () => {
    const closeToast = vi.fn();
    const { unmount } = render(
      <CountdownToast name="Test" url="/redirect" closeToast={closeToast} />,
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(closeToast).not.toHaveBeenCalled();
  });
});
