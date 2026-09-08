import { TableColumn } from "@ucc/common-ui";
import { GRP_DETAIL_PATH } from "@/router/routes";
import { AgrMapping, EgrMapping } from "@/types/OrgView";
import { formatUTCtoDateOnly, getSafeString } from "@/utils";
import { TOOLTIP_MESSAGES } from "@/constants";

export const agrSideBarColumn: TableColumn<AgrMapping>[] = [
    {
        label: "Group name",
        field: "groupName",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <a
                href={`${GRP_DETAIL_PATH}/${row.groupObjectId}`}
                className="render-cell-style"
                onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
                        return;
                    }
                    e.preventDefault();
                }}
            >
                {getSafeString(row?.groupName)}
            </a>
        ),
    },
    {
        label: "Legacy group ID",
        field: "legacyGroupId",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.legacyGroupId)}
            </div>
        ),
    },
    {
        label: "Group ID",
        field: "groupId",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.groupId)}</div>
        ),
    },
    {
        label: "Source ID",
        field: "sourceId",
        tooltipContent: TOOLTIP_MESSAGES.CLIENT_EXT_GRP_ID,
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.sourceId)}</div>
        ),
    },
    {
        label: "AGS map name",
        field: "agsMapName",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.agsMapName)}
            </div>
        ),
    },
    {
        label: "AGS map ID",
        field: "agsMapId",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.agsMapId)}</div>
        ),
    },
    {
        label: "Effective start date",
        field: "effectiveStartDate",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {formatUTCtoDateOnly(row?.effectiveStartDate ?? "")?.toString()}
            </div>
        ),
    },
    {
        label: "Effective end date",
        field: "effectiveEndDate",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {formatUTCtoDateOnly(row?.effectiveEndDate ?? "")?.toString()}
            </div>
        ),
    },
    {
        label: "Reason",
        field: "reason",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.reason)}</div>
        ),
    },
    {
        label: "Trigger",
        field: "trigger",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.trigger)}</div>
        ),
    },
    {
        label: "Changed by",
        field: "updatedBy",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.updatedBy)}
            </div>
        ),
    },
    {
        label: "Date/Time",
        field: "updatedAt",
        hasToggleMenu: false,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{formatUTCtoDateOnly(row?.updatedAt, true)}</div>
        ),
    },
];

export const egrColumn: TableColumn<EgrMapping>[] = [
    {
        label: "Legacy group ID",
        field: "legacyGroupId",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.legacyGroupId)}
            </div>
        ),
    },
    {
        label: "Group ID",
        field: "groupId",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.groupId)}</div>
        ),
    },
    {
        label: "Source ID",
        field: "sourceId",
        tooltipContent: TOOLTIP_MESSAGES.CLIENT_EXT_GRP_ID,
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.sourceId)}</div>
        ),
    },
    {
        label: "External group type",
        field: "externalGroupType",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.externalGroupType)}
            </div>
        ),
    },
    {
        label: "State restriction",
        field: "stateRestrictions",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.stateRestrictions)}
            </div>
        ),
    },
    {
        label: "Effective start date",
        field: "effectiveStartDate",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {formatUTCtoDateOnly(row?.effectiveStartDate ?? "")?.toString()}
            </div>
        ),
    },
    {
        label: "Effective end date",
        field: "effectiveEndDate",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {formatUTCtoDateOnly(row?.effectiveEndDate ?? "")?.toString()}
            </div>
        ),
    },
    {
        label: "Payer",
        field: "payer",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.payer)}</div>
        ),
    },
];

export const agrColumn: TableColumn<AgrMapping>[] = [
    {
        label: "Legacy group ID",
        field: "legacyGroupId",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.legacyGroupId)}
            </div>
        ),
    },
    {
        label: "Group ID",
        field: "groupId",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row.groupId)}</div>
        ),
    },
    {
        label: "Source ID",
        field: "sourceId",
        tooltipContent: TOOLTIP_MESSAGES.CLIENT_EXT_GRP_ID,
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.sourceId)}</div>
        ),
    },
    {
        label: "Effective start date",
        field: "effectiveStartDate",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {formatUTCtoDateOnly(row?.effectiveStartDate ?? "")?.toString()}
            </div>
        ),
    },
    {
        label: "Effective end date",
        field: "effectiveEndDate",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {formatUTCtoDateOnly(row?.effectiveEndDate ?? "")?.toString()}
            </div>
        ),
    },
    {
        label: "AGS map name",
        field: "agsMapName",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">
                {getSafeString(row?.agsMapName)}
            </div>
        ),
    },
    {
        label: "AGS map ID",
        field: "agsMapId",
        hasToggleMenu: true,
        headerClassName: "custom-header",
        render: (_val, row) => (
            <div className="render-cell-style">{getSafeString(row?.agsMapId)}</div>
        ),
    },
];
