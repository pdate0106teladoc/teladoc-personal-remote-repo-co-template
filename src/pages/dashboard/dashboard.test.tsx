import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

import Dashboard from "./Dashboard";

vi.mock("@/views/ConfiguratorDashboard/ConfiguratorDashboard", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="configurator-dashboard">
      Configurator: {props.userName}
    </div>
  ),
}));

const setSessionName = (name: string | null) => {
  const getItem = vi.fn((key: string) => {
    if (key === "name") return name;
    return null;
  });

  Object.defineProperty(window, "sessionStorage", {
    value: { getItem },
    writable: true,
    configurable: true,
  });

  return getItem;
};

const setPermissions = (permissions: string[]) => {
  localStorage.setItem(
    "auth-storage",
    JSON.stringify({ state: { permissions } }),
  );
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders ConfiguratorDashboard when user has a task permission", () => {
    setSessionName("Bob");
    setPermissions(["task:edit"]);

    render(<Dashboard role="CONFIGURATOR" />);

    const configurator = screen.getByTestId("configurator-dashboard");
    expect(configurator).toHaveTextContent("Configurator: Bob");
  });

  it("renders ConfiguratorDashboard when user has any one of the task permissions", () => {
    setSessionName("Carol");
    setPermissions(["task:cancel"]);

    render(<Dashboard role="QUALITY_REVIEWER" />);

    const configurator = screen.getByTestId("configurator-dashboard");
    expect(configurator).toHaveTextContent("Configurator: Carol");
  });

  it("renders the unauthorized page when user has no task permission", () => {
    setSessionName("Dave");
    setPermissions(["org-account-map:edit"]);

    render(<Dashboard role="CONFIGURATOR" />);

    expect(screen.queryByTestId("configurator-dashboard")).toBeNull();
    expect(
      screen.getByText(/not authorized to view this page/i),
    ).toBeInTheDocument();
  });

  it("renders the unauthorized page when user has no permissions at all", () => {
    setSessionName("Eve");
    setPermissions([]);

    render(<Dashboard role="VIEWER" />);

    expect(screen.queryByTestId("configurator-dashboard")).toBeNull();
    expect(
      screen.getByText(/not authorized to view this page/i),
    ).toBeInTheDocument();
  });
});
