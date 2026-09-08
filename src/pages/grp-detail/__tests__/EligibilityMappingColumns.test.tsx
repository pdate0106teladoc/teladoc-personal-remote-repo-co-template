import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

function asElement(node: React.ReactNode): React.ReactElement<any, any> {
    expect(React.isValidElement(node)).toBe(true);
    return node as React.ReactElement<any, any>;
}

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
    extractDisplayValue: vi.fn((val: unknown, type: string) => ({
        raw: `display(${type}):${String(val)}`,
    })),
}));

vi.mock("@/constants", () => ({
    LABELS: {
        eligibilityClaims: {
            VENDOR_GROUP_ID: "VENDOR_GROUP_ID",
            EXTERNAL_GROUP_TYPE: "EXTERNAL_GROUP_TYPE",
            STATE_RESTRICTION: "STATE_RESTRICTION",
            EFFECTIVE_START_DATE: "EFFECTIVE_START_DATE",
            EFFECTIVE_END: "EFFECTIVE_END",
            PAYER_ID: "PAYER_ID",
        },
    },
    TOOLTIP_MESSAGES: {
        CLIENT_EXT_GRP_ID: "Client's external group ID",
    },
}));

vi.mock("@/router/routes", () => ({
    GRP_DETAIL_PATH: "/group-detail",
}));

vi.mock("@/utils", () => ({
    getSafeString: vi.fn((v: unknown) =>
        v === undefined || v === null ? "safe()" : `safe(${String(v)})`,
    ),
    formatUTCtoDateOnly: vi.fn((v: string) => `dateOnly(${v})`),
}));

vi.mock("@/components/CustomTable/DataTable", () => ({}));

import {
    agrSideBarColumn,
    egrColumn,
    agrColumn,
} from "../pages/EligibilityMappingColumns";

// import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import { getSafeString, formatUTCtoDateOnly } from "@/utils";
import { GRP_DETAIL_PATH } from "@/router/routes";

describe("EligibilityMappingColumns", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("agrSideBarColumn: renders link href + covers all onClick branches", () => {
        expect(agrSideBarColumn.length).toBeGreaterThan(0);

        const row = {
            id: "123",
            groupObjectId: "123",
            groupName: "Acme Group",
            legacyGroupId: "L-1",
            groupId: "G-1",
            sourceId: "S-1",
            agsMapName: "MapName",
            agsMapId: "MapId",
            iteration: "Iter1",
            effectiveStartDate: "2026-01-01T00:00:00Z",
            effectiveEndDate: "2026-02-01T00:00:00Z",
            reason: "Because",
            trigger: "TriggerX",
            changed_by: "UserA",
            date_time: "2026-01-02 10:00",
        };

        const linkEl = asElement(agrSideBarColumn[0].render?.(undefined as any, row as any));
        expect(linkEl.type).toBe("a");
        expect(linkEl.props.href).toBe(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
        expect(linkEl.props.children).toBe("safe(Acme Group)");

        const onClick = linkEl.props.onClick as (e: any) => void;
        expect(typeof onClick).toBe("function");

        {
            const e = { ctrlKey: true, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
            onClick(e);
            expect(e.preventDefault).not.toHaveBeenCalled();
        }
        {
            const e = { ctrlKey: false, metaKey: true, shiftKey: false, button: 0, preventDefault: vi.fn() };
            onClick(e);
            expect(e.preventDefault).not.toHaveBeenCalled();
        }
        {
            const e = { ctrlKey: false, metaKey: false, shiftKey: true, button: 0, preventDefault: vi.fn() };
            onClick(e);
            expect(e.preventDefault).not.toHaveBeenCalled();
        }
        {
            const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 1, preventDefault: vi.fn() };
            onClick(e);
            expect(e.preventDefault).not.toHaveBeenCalled();
        }
        {
            const e = { ctrlKey: false, metaKey: false, shiftKey: false, button: 0, preventDefault: vi.fn() };
            onClick(e);
            expect(e.preventDefault).toHaveBeenCalledTimes(1);
        }

        for (const col of agrSideBarColumn.slice(1)) {
            const el = asElement(col.render?.(undefined as any, row as any));
            expect(el.type).toBe("div");
            expect(el.props.className).toBe("render-cell-style");
        }

        expect(formatUTCtoDateOnly).toHaveBeenCalledWith(row.effectiveStartDate);
        expect(formatUTCtoDateOnly).toHaveBeenCalledWith(row.effectiveEndDate);
    });

    it("egrColumn: covers tooltipContent column + safe rendering + date formatting", () => {
        expect(egrColumn).toHaveLength(8);

        const sourceIdCol = egrColumn.find((c) => c.field === "sourceId");
        expect(sourceIdCol?.tooltipContent).toBe("Client's external group ID");

        const row = {
            legacyGroupId: "L2",
            groupId: "G2",
            sourceId: "S2",
            externalGroupType: "T2",
            stateRestrictions: "NY",
            effectiveStartDate: "2026-03-01T00:00:00Z",
            effectiveEndDate: "2026-04-01T00:00:00Z",
            payer: "P2",
        };

        for (const col of egrColumn) {
            const el = asElement(col.render?.(undefined as any, row as any));
            expect(el.type).toBe("div");
            expect(el.props.className).toBe("render-cell-style");
            expect(col.hasToggleMenu).toBe(true);
            expect(col.headerClassName).toBe("custom-header");
        }

        expect(formatUTCtoDateOnly).toHaveBeenCalledWith(row.effectiveStartDate);
        expect(formatUTCtoDateOnly).toHaveBeenCalledWith(row.effectiveEndDate);
        expect(getSafeString).toHaveBeenCalledWith(row.payer);
    });

    it("agrColumn: covers direct row.groupId access and optional chaining fallbacks", () => {
        expect(agrColumn).toHaveLength(7);

        const row = {
            legacyGroupId: undefined,
            groupId: "G-Direct",
            sourceId: null,
            effectiveStartDate: "",
            effectiveEndDate: "",
            agsMapName: undefined,
            agsMapId: "AM-1",
        } as any;

        for (const col of agrColumn) {
            const el = asElement(col.render?.(undefined as any, row));
            expect(el.type).toBe("div");
            expect(el.props.className).toBe("render-cell-style");
            expect(col.hasToggleMenu).toBe(true);
            expect(col.headerClassName).toBe("custom-header");
        }

        const groupIdCol = agrColumn.find((c) => c.field === "groupId");
        const groupIdEl = asElement(groupIdCol?.render?.(undefined as any, row));
        expect(groupIdEl.props.children).toBe("safe(G-Direct)");
        expect(getSafeString).toHaveBeenCalledWith("G-Direct");

        expect(formatUTCtoDateOnly).toHaveBeenCalledWith("");
    });
});
