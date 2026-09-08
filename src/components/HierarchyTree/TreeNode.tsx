import React from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { GRP_DETAIL_PATH, ORG_DETAIL_PATH } from "@/router/routes";
import useConfigStore from "@/store/configStore";
import { TreeSkeleton } from "./TreeSkeleton";
import { DynamicMap, Group, OrgUnit } from "@/types/Hierarchy";
import { BillingBadge } from "./BillingBadge";
import { OrganizationIcon } from "@ucc/common-ui";
import { ActiveGroup, NonActiveGroupIcon, NonActiveOrganizationIcon } from "@/assets";

interface TreeNodeProps {
    id?: string;
    label: string;
    billingOrg?: boolean;
    isGroup?: boolean;
    showBilling?: boolean;
    count?: number;
    children?: React.ReactNode;
    childrenData?: OrgUnit[];
    groupsData?: Group[];
    isCurrentOrg?: boolean;
    isCurrentGroup?: boolean;
    level?: number;
    href?: string;
    loading?: boolean;
    isOpen?: boolean;
    onToggle?: (id: string) => void;
    expandedIds?: Record<string, boolean>;
    onRequestChildren?: (id?: string) => void;
    loadingMap?: Record<string, boolean>;
    dynamicChildMap?: DynamicMap;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
    id,
    label,
    billingOrg,
    isGroup = false,
    showBilling = true,
    count = 0,
    children,
    childrenData,
    groupsData,
    isCurrentOrg = false,
    isCurrentGroup = false,
    level = 0,
    href = "",
    loading = false,
    isOpen,
    onToggle,
    onRequestChildren,
    loadingMap,
    dynamicChildMap,
    expandedIds,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const setSearchParams = useConfigStore((state) => state.setSearchParams);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id) return;

        onToggle?.(id);

        const willBeOpen = !isOpen;
        const hasData =
            (childrenData?.length ?? 0) > 0 || (groupsData?.length ?? 0) > 0;

        // Persistance Check: Only fetch if we don't have data yet
        if (willBeOpen && level !== 0 && !hasData && onRequestChildren) {
            onRequestChildren(id);
        }
    };

    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get("searchTerm") || "";
    const entity = queryParams.get("entity") || "";

    return (
        <div className="tree-node-wrapper">
            <div className="tree-node">
                <div className="tree-node-content">
                    <div
                        className="tree-node-indent"
                        style={{ paddingLeft: `${level * 1.5}rem` }}
                    >
                        {count > 0 ? (
                            <button
                                className="hierarchyExpandButton me-3"
                                onClick={handleToggle}
                                type="button"
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm" />
                                ) : isOpen ? (
                                    <BsChevronDown />
                                ) : (
                                    <BsChevronRight />
                                )}
                            </button>
                        ) : (
                            <span className="pe-5" />
                        )}
                        <div>
                            {isGroup ? (
                                isCurrentGroup ? (
                                    <ActiveGroup className="icon" />
                                ) : (
                                    <NonActiveGroupIcon className="icon" />
                                )
                            ) : isCurrentOrg ? (
                                <OrganizationIcon className="icon" />
                            ) : (
                                <NonActiveOrganizationIcon className="icon" />
                            )}
                        </div>
                        {isCurrentOrg || isCurrentGroup ? (
                            <span className="label current-org">
                                {label}{" "}
                                <span className="current-org-count">
                                    {count > 0 ? `(${count})` : ""}
                                </span>
                            </span>
                        ) : (
                            <>
                                <a
                                    href={href}
                                    className="label"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSearchParams(
                                            !searchTerm && !entity
                                                ? ""
                                                : `?searchTerm=${searchTerm}&entity=${entity}`,
                                        );
                                        navigate(href);
                                    }}
                                >
                                    {label}
                                </a>
                                <span className="current-org-count">
                                    {count > 0 ? `(${count})` : ""}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="billing-status">
                    {showBilling && (
                        <BillingBadge billingOrg={billingOrg} isGroup={isGroup} />
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="node-children">
                    {childrenData?.map((child) => (
                        <TreeNode
                            key={child.id}
                            id={child.id}
                            label={child.name}
                            level={level + 1}
                            href={`${ORG_DETAIL_PATH}/${child.id}`}
                            count={child.countOfChildren ?? 0}
                            isOpen={!!expandedIds?.[child.id]}
                            onToggle={onToggle}
                            expandedIds={expandedIds}
                            loading={!!loadingMap?.[child.id]}
                            childrenData={dynamicChildMap?.[child.id]?.children}
                            groupsData={dynamicChildMap?.[child.id]?.groups}
                            loadingMap={loadingMap}
                            dynamicChildMap={dynamicChildMap}
                            onRequestChildren={onRequestChildren}
                            showBilling={showBilling}
                        />
                    ))}
                    {groupsData?.map((g) => (
                        <TreeNode
                            key={g.id}
                            id={g.id}
                            label={g.name}
                            isGroup
                            level={level + 1}
                            href={`${GRP_DETAIL_PATH}/${g.id}`}
                            showBilling={showBilling}
                        />
                    ))}
                    {loading && !childrenData && !groupsData && (
                        <TreeSkeleton level={level + 1} />
                    )}
                    {!childrenData && !groupsData && !loading && children}
                </div>
            )}
        </div>
    );
};
