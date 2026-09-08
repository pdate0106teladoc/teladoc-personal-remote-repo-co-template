import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

function asElement(node: React.ReactNode): React.ReactElement<any, any> {
  expect(React.isValidElement(node)).toBe(true);
  return node as React.ReactElement<any, any>;
}

const getSafeStringMock = vi.fn((v: unknown) =>
  v === undefined || v === null ? "safe()" : `safe(${String(v)})`,
);
const formatUTCtoDateOnlyMock = vi.fn((v: unknown, withTime?: boolean) =>
  withTime ? `fmtT(${String(v)})` : `fmt(${String(v)})`,
);

vi.mock("@/utils", () => ({
  getSafeString: (v: unknown) => getSafeStringMock(v),
  formatUTCtoDateOnly: (v: unknown, withTime?: boolean) =>
    formatUTCtoDateOnlyMock(v, withTime),
}));

vi.mock("@/router/routes", () => ({
  GRP_DETAIL_PATH: "/group-detail",
}));

vi.mock("@/components/CustomTable/DataTable", () => ({}));

import {
  createEgrSideBarColumn,
  createEgrColumn,
  createAgrColumn,
  createAgrSideBarColumn,
} from "../eligibilityColumns";
import { GRP_DETAIL_PATH } from "@/router/routes";

describe("eligibilityColumns.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createEgrSideBarColumn: covers all renders + stateRestrictions branches + onClick branches", () => {
    const navigate = vi.fn();
    const cols = createEgrSideBarColumn(navigate);

    expect(cols.length).toBe(13);

    const row: any = {
      id: "ID1",
      groupObjectId: "ID1",
      groupName: "GN",
      legacyGroupId: "L",
      groupId: "G",
      sourceId: "S",
      payer: "P",
      externalGroupType: "T",
      stateRestrictions: ["CA", "NY"],
      effectiveStartDate: "2026-01-01T00:00:00Z",
      effectiveEndDate: "2026-12-31T00:00:00Z",
      reason: "R",
      trigger: "TR",
      updatedBy: "U",
      updatedAt: "2026-01-02T00:00:00Z",
    };

    const anchorEl = asElement(cols[0].render?.(undefined as any, row));
    expect(anchorEl.type).toBe("a");
    expect(anchorEl.props.href).toBe(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
    expect(anchorEl.props.className).toContain("anchor-style");
    expect(anchorEl.props.children).toBe("safe(GN)");

    const onClick = anchorEl.props.onClick as (e: any) => void;

    {
      const e = { ctrlKey: true, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    }
    {
      const e = { ctrlKey: false, metaKey: true, shiftKey: false, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    }
    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: true, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    }
    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 1, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    }
    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
    }

    const idxsSafe = [1, 2, 3, 4, 5, 9, 10, 11];
    for (const i of idxsSafe) {
      const el = asElement(cols[i].render?.(undefined as any, row));
      expect(el.type).toBe("div");
      expect(el.props.className).toBe("render-cell-style");
    }

    {
      const el = asElement(cols[6].render?.(undefined as any, row));
      expect(el.props.children).toBe("safe(CA,NY)");
    }
    {
      const row2 = { ...row, stateRestrictions: [] };
      const el = asElement(cols[6].render?.(undefined as any, row2));
      expect(el.props.children).toBe("safe()");
    }
    {
      const row3 = { ...row, stateRestrictions: "CA" };
      const el = asElement(cols[6].render?.(undefined as any, row3));
      expect(el.props.children).toBe("safe(CA)");
    }

    {
      const startEl = asElement(cols[7].render?.(undefined as any, row));
      const endEl = asElement(cols[8].render?.(undefined as any, row));
      const updatedAtEl = asElement(cols[12].render?.(undefined as any, row));

      expect(startEl.props.children).toBe("fmt(2026-01-01T00:00:00Z)");
      expect(endEl.props.children).toBe("fmt(2026-12-31T00:00:00Z)");
      expect(updatedAtEl.props.children).toBe("fmtT(2026-01-02T00:00:00Z)");

      expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith(row.effectiveStartDate, undefined);
      expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith(row.effectiveEndDate, undefined);
      expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith(row.updatedAt, true);
    }
  });

  it("createEgrColumn: covers dynamic label/subLabel/tooltip + onClick branches + date fallbacks", () => {
    const navigate = vi.fn();

    const colsDefault = createEgrColumn(navigate, false, false);
    const colsAdv = createEgrColumn(navigate, true, false);
    const colsGrp = createEgrColumn(navigate, false, true);

    expect(colsDefault.length).toBe(9);

    expect(colsDefault[1].label).toBe("Legacy ");
    expect(colsDefault[1].subLabel).toBe("group ID");
    expect(colsAdv[1].label).toBe("Legacy group ID");
    expect(colsAdv[1].subLabel).toBe("");
    expect(colsGrp[1].label).toBe("Legacy group ID");
    expect(colsGrp[1].subLabel).toBe("");

    expect(colsDefault[3].tooltipContent).toBe("Client's external group ID");
    expect(colsAdv[3].tooltipContent).toBe("Client's external group ID");

    expect(colsDefault[5].label).toBe("State ");
    expect(colsDefault[5].subLabel).toBe("restriction");
    expect(colsGrp[5].label).toBe("State restriction");
    expect(colsGrp[5].subLabel).toBe("");

    expect(colsDefault[6].label).toBe("Effective ");
    expect(colsDefault[6].subLabel).toBe("start date");
    expect(colsGrp[6].label).toBe("Effective start date");
    expect(colsGrp[6].subLabel).toBe("");

    expect(colsDefault[7].label).toBe("Effective ");
    expect(colsDefault[7].subLabel).toBe("end date");
    expect(colsGrp[7].label).toBe("Effective end date");
    expect(colsGrp[7].subLabel).toBe("");

    const row: any = {
      groupObjectId: "GO1",
      groupName: "GN",
      legacyGroupId: "L",
      groupId: "G",
      sourceId: "S",
      externalGroupType: "T",
      stateRestrictions: "CA",
      effectiveStartDate: undefined,
      effectiveEndDate: null,
      payer: "P",
    };

    const a = asElement(colsDefault[0].render?.(undefined as any, row));
    expect(a.props.href).toBe(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
    const onClick = a.props.onClick as (e: any) => void;

    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
    }
    {
      const e = { ctrlKey: true, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
    }

    const startEl = asElement(colsDefault[6].render?.(undefined as any, row));
    const endEl = asElement(colsDefault[7].render?.(undefined as any, row));

    expect(startEl.props.children).toBe("fmt()");
    expect(endEl.props.children).toBe("fmt()");

    expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith("", undefined);
    expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith("", undefined);

    for (let i = 1; i < colsDefault.length; i++) {
      const el = asElement(colsDefault[i].render?.(undefined as any, row));
      expect(el.type).toBe("div");
      expect(el.props.className).toBe("render-cell-style");
    }
  });

  it("createAgrColumn: covers onClick branches + direct row.groupId access + label/subLabel branch via isGrpDetail", () => {
    const navigate = vi.fn();
    const colsDefault = createAgrColumn(navigate, false);
    const colsGrp = createAgrColumn(navigate, true);

    expect(colsDefault.length).toBe(8);

    expect(colsDefault[4].label).toBe("Effective ");
    expect(colsDefault[4].subLabel).toBe("start date");
    expect(colsGrp[4].label).toBe("Effective start date");
    expect(colsGrp[4].subLabel).toBe("");

    expect(colsDefault[5].label).toBe("Effective ");
    expect(colsDefault[5].subLabel).toBe("end date");
    expect(colsGrp[5].label).toBe("Effective end date");
    expect(colsGrp[5].subLabel).toBe("");

    const row: any = {
      groupObjectId: "GO2",
      groupName: "AGN",
      legacyGroupId: "AL",
      groupId: "AG",
      sourceId: "AS",
      effectiveStartDate: "2026-02-01T00:00:00Z",
      effectiveEndDate: "2026-03-01T00:00:00Z",
      agsMapName: "MN",
      agsMapId: "MID",
    };

    const a = asElement(colsDefault[0].render?.(undefined as any, row));
    const onClick = a.props.onClick as (e: any) => void;

    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 2, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    }
    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
    }

    const groupIdEl = asElement(colsDefault[2].render?.(undefined as any, row));
    expect(groupIdEl.props.children).toBe("safe(AG)");
    expect(getSafeStringMock).toHaveBeenCalledWith("AG");

    const startEl = asElement(colsDefault[4].render?.(undefined as any, row));
    const endEl = asElement(colsDefault[5].render?.(undefined as any, row));
    expect(startEl.props.children).toBe("fmt(2026-02-01T00:00:00Z)");
    expect(endEl.props.children).toBe("fmt(2026-03-01T00:00:00Z)");
  });

  it("createAgrSideBarColumn: covers all renders + onClick branches + ?? '' date fallbacks", () => {
    const navigate = vi.fn();
    const cols = createAgrSideBarColumn(navigate);

    expect(cols.length).toBe(12);

    const row: any = {
      id: "AID1",
      groupObjectId: "AID1",
      groupName: "AGN",
      legacyGroupId: "AL",
      groupId: "AG",
      sourceId: "AS",
      agsMapName: "MN",
      agsMapId: "MID",
      effectiveStartDate: undefined,
      effectiveEndDate: null,
      reason: "R",
      trigger: "TR",
      updatedBy: "U",
      updatedAt: "2026-05-05T00:00:00Z",
    };

    const a = asElement(cols[0].render?.(undefined as any, row));
    const onClick = a.props.onClick as (e: any) => void;

    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: true, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    }
    {
      const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
      onClick(e);
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
    }

    const startEl = asElement(cols[6].render?.(undefined as any, row));
    const endEl = asElement(cols[7].render?.(undefined as any, row));
    expect(startEl.props.children).toBe("fmt()");
    expect(endEl.props.children).toBe("fmt()");

    const updatedAtEl = asElement(cols[11].render?.(undefined as any, row));
    expect(updatedAtEl.props.children).toBe("fmtT(2026-05-05T00:00:00Z)");

    expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith("", undefined);
    expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith("", undefined);
    expect(formatUTCtoDateOnlyMock).toHaveBeenCalledWith(row.updatedAt, true);

    for (let i = 1; i < cols.length; i++) {
      const el = asElement(cols[i].render?.(undefined as any, row));
      if (i === 0) continue;
      expect(el.type).toBe("div");
      expect(el.props.className).toBe("render-cell-style");
    }
  });
});
