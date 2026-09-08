import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TreeSkeleton } from "./TreeSkeleton";


describe("TreeSkeleton", () => {
  it("renders with correct class and style for level 0", () => {
    render(<TreeSkeleton level={0} />);
    const node = document.querySelector(".tree-node.skeleton");
    expect(node).toHaveClass("tree-node", "skeleton");
    expect(node).toHaveStyle({ paddingLeft: "0rem" });
  });

  it("renders with correct style for level 2", () => {
    render(<TreeSkeleton level={2} />);
    const node = document.querySelector(".tree-node.skeleton");
    expect(node).toHaveStyle({ paddingLeft: "3rem" });
  });

  it("renders spinner and skeleton text", () => {
    render(<TreeSkeleton level={1} />);
    expect(document.querySelector(".tree-node.skeleton")).toBeInTheDocument();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
    expect(document.querySelector(".skeleton-text")).toBeInTheDocument();
  });
});
