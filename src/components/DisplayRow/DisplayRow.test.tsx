import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import DisplayRow from "./DisplayRow";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@ucc/common-ui", () => ({
  DisplayRow: ({ onNavigate, ...props }: any) => (
    <div data-testid="common-display-row" {...props}>
      <button data-testid="nav-trigger" onClick={() => onNavigate?.(props.value)} />
    </div>
  ),
}));

vi.mock("@/router/routes", () => ({
  GRP_DETAIL_PATH: "/CCC/groups",
  ORG_DETAIL_PATH: "/CCC/org-detail",
}));

describe("DisplayRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders CommonDisplayRow with passed props", () => {
    const { getByTestId } = render(
      <DisplayRow label="Org Name" value="Test Corp" />,
    );
    expect(getByTestId("common-display-row")).toBeInTheDocument();
  });

  it("navigates to org-detail path for non-group value", () => {
    const { getByTestId } = render(
      <DisplayRow label="Org" value={{ id: "org-1", isGrp: false }} />,
    );

    getByTestId("nav-trigger").click();
    expect(mockNavigate).toHaveBeenCalledWith("/CCC/org-detail/org-1");
  });

  it("navigates to groups path for group value", () => {
    const { getByTestId } = render(
      <DisplayRow label="Group" value={{ id: "grp-1", isGrp: true }} />,
    );

    getByTestId("nav-trigger").click();
    expect(mockNavigate).toHaveBeenCalledWith("/CCC/groups/grp-1");
  });

  it("does not navigate when value has no id", () => {
    const { getByTestId } = render(
      <DisplayRow label="Empty" value={{ name: "test" }} />,
    );

    getByTestId("nav-trigger").click();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
