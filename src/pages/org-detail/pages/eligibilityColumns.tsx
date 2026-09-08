import { TableColumn } from "@ucc/common-ui";
import { AgrMapping, EgrMapping } from "@/types/OrgView";
import { getSafeString, formatUTCtoDateOnly } from "@/utils";
import { GRP_DETAIL_PATH } from "@/router/routes";
import { useNavigate } from "react-router-dom";
import { TOOLTIP_MESSAGES } from "@/constants";

export const createEgrSideBarColumn = (navigate: ReturnType<typeof useNavigate>): TableColumn<EgrMapping>[] => [
  {
    label: "Group name",
    field: "groupName",
    hasToggleMenu: true,
    headerClassName: "custom-header",
    render: (_val, row) => (
      <a
        href={`${GRP_DETAIL_PATH}/${row.groupObjectId}`}
        className="render-cell-style anchor-style"
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
            return;
          }
          e.preventDefault();
          navigate(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
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
    label: "Payer",
    field: "payer",
    hasToggleMenu: false,
    headerClassName: "custom-header",
    render: (_val, row) => (
      <div className="render-cell-style">{getSafeString(row?.payer)}</div>
    ),
  },
  {
    label: "External group type",
    field: "externalGroupType",
    hasToggleMenu: false,
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
    hasToggleMenu: false,
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
      <div className="render-cell-style">{getSafeString(row?.updatedBy)}</div>
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

export const createEgrColumn = (
  navigate: ReturnType<typeof useNavigate>,
  isAdvSearch: boolean = false,
  isGrpDetail: boolean = false,
): TableColumn<EgrMapping>[] => [
    {
      label: "Group name",
      field: "groupName",
      hasToggleMenu: true,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <a
          href={`${GRP_DETAIL_PATH}/${row.groupObjectId}`}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
              return;
            }
            e.preventDefault();
            navigate(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
          }}
          className="render-cell-style anchor-style"
        >
          {getSafeString(row?.groupName)}
        </a>
      ),
    },
    {
      label: `Legacy ${isAdvSearch || isGrpDetail ? "group ID" : ""}`,
      subLabel: `${isAdvSearch || isGrpDetail ? "" : "group ID"}`,
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
      showFiltering: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row?.externalGroupType)}
        </div>
      ),
    },
    {
      label: `State ${isGrpDetail ? "restriction" : ""}`,
      subLabel: `${isGrpDetail ? "" : "restriction"}`,
      field: "stateRestrictions",
      hasToggleMenu: true,
      showFiltering: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {getSafeString(row?.stateRestrictions)}
        </div>
      ),
    },
    {
      label: `Effective ${isGrpDetail ? "start date" : ""}`,
      subLabel: `${isGrpDetail ? "" : "start date"}`,
      field: "effectiveStartDate",
      hasToggleMenu: true,
      showFiltering: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {formatUTCtoDateOnly(row?.effectiveStartDate ?? "")?.toString()}
        </div>
      ),
    },
    {
      label: `Effective ${isGrpDetail ? "end date" : ""}`,
      subLabel: `${isGrpDetail ? "" : "end date"}`,
      field: "effectiveEndDate",
      hasToggleMenu: true,
      showFiltering: false,
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

export const createAgrColumn = (
  navigate: ReturnType<typeof useNavigate>,
  isGrpDetail: boolean = false,
): TableColumn<AgrMapping>[] => [
    {
      label: "Group name",
      field: "groupName",
      hasToggleMenu: true,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <a
          href={`${GRP_DETAIL_PATH}/${row.groupObjectId}`}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
              return;
            }
            e.preventDefault();
            navigate(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
          }}
          className="render-cell-style anchor-style"
        >
          {getSafeString(row?.groupName)}
        </a>
      ),
    },
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
      label: `Effective ${isGrpDetail ? "start date" : ""}`,
      subLabel: `${isGrpDetail ? "" : "start date"}`,
      field: "effectiveStartDate",
      hasToggleMenu: true,
      showFiltering: false,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {formatUTCtoDateOnly(row?.effectiveStartDate ?? "")?.toString()}
        </div>
      ),
    },
    {
      label: `Effective ${isGrpDetail ? "end date" : ""}`,
      subLabel: `${isGrpDetail ? "" : "end date"}`,
      field: "effectiveEndDate",
      hasToggleMenu: true,
      showFiltering: false,
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

export const createAgrSideBarColumn = (
  navigate: ReturnType<typeof useNavigate>,
): TableColumn<AgrMapping>[] => [
    {
      label: "Group name",
      field: "groupName",
      hasToggleMenu: true,
      headerClassName: "custom-header",
      render: (_val, row) => (
        <a
          href={`${GRP_DETAIL_PATH}/${row.groupObjectId}`}
          className="render-cell-style anchor-style"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
              return;
            }
            e.preventDefault();
            navigate(`${GRP_DETAIL_PATH}/${row.groupObjectId}`);
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
