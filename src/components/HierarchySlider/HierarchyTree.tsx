import React, { useState, useMemo } from "react";
import { BsChevronRight, BsChevronDown } from "react-icons/bs";
import styles from "./HierarchyTree.module.scss";
import { HierarchyNode } from "@/types/search";
import { GRP_DETAIL_PATH, ORG_DETAIL_PATH } from "@/router/routes";
import { useNavigate } from "react-router-dom";
import { GroupIcon, OrganizationIcon, SuccessIcon } from "@ucc/common-ui";

interface HierarchyTreeProps {
    data: HierarchyNode[];
    rootId?: number | null;
    displayBillingOrg?: boolean;
    renderLabel?: (node: HierarchyNode) => React.ReactNode;
}

interface TreeNode extends HierarchyNode {
    children?: TreeNode[];
    level?: number;
}

function buildTree(
    data: HierarchyNode[],
    parentId: number | null,
    level = 0,
): TreeNode[] {
    return data
        .filter((node) => node.parentId === parentId)
        .map((node) => ({
            ...node,
            level,
            children: buildTree(data, node.id, level + 1),
        }));
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
    data,
    rootId = null,
    displayBillingOrg = false,
    renderLabel,
}) => {
    const tree = useMemo(() => buildTree(data, rootId), [data, rootId]);
    return (
        <div className={styles.hierarchyTree}>
            <div className={styles.header}>
                <h3>Organization/Group Name</h3>
                {displayBillingOrg && <h3>Billing Organization?</h3>}
            </div>
            {tree.length ? tree.map(node => (
                <HierarchyTreeNode
                    key={node.id}
                    node={node}
                    renderLabel={renderLabel}
                    displayBillingOrg={displayBillingOrg}
                    billingOrg={node.billingOrganization}
                />
            )) : <div className="m-4">No hierarchy data found.</div>}
        </div>
    );
};

const HierarchyTreeNode: React.FC<{
    node: TreeNode;
    renderLabel?: (node: HierarchyNode) => React.ReactNode;
    displayBillingOrg?: boolean;
    billingOrg?: boolean;
}> = ({ node, renderLabel, displayBillingOrg, billingOrg }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isRoot = node.type === "root";
    const isOrganization = node.type === "organization";
    const navigate = useNavigate();

    return (
        <div className={styles.hierarchyNode}>
            <div className={styles.hierarchyTable}>
                <div
                    className={`${styles.hierarchyNodeContent} ${isRoot ? styles.rootNode :
                        isOrganization ? styles.organizationNode :
                            styles.defaultNode
                        }`}
                    style={{ paddingLeft: `${(node.level || 0) * 24}px` }}
                >
                    {hasChildren && (
                        <button
                            className={expanded ? styles.hierarchyExpandButton : styles.hierarchyCollapseButton}
                            onClick={() => setExpanded(e => !e)}
                            aria-label={expanded ? "Collapse" : "Expand"}
                        >
                            {expanded ? <BsChevronDown /> : <BsChevronRight />}
                        </button>
                    )}
                    <div className={`${styles.hierarchyNodeLabel} ${!hasChildren ? styles.ml5 : ""} `}>
                        {node.type === "group" ? <GroupIcon /> : <OrganizationIcon />}
                        <a
                            href=""
                            onClick={(e) => { e.preventDefault(); navigate(`${node.type === "group" ? GRP_DETAIL_PATH : ORG_DETAIL_PATH}/${node.id}`) }}
                            className="text-primary"
                        >
                            {renderLabel ? renderLabel(node) : node.name}
                        </a>
                    </div>
                </div>
                {displayBillingOrg && (
                    <div className={styles.billing}>
                        {billingOrg ? (
                            <SuccessIcon />
                        ) : (
                            <SuccessIcon className="svg-grey" />
                        )}
                    </div>
                )}
            </div>
            {hasChildren && expanded && (
                <div className={styles.hierarchyChildren}>
                    {node.children!.map(child => (
                        <HierarchyTreeNode
                            key={child.id}
                            node={child}
                            renderLabel={renderLabel}
                            displayBillingOrg={displayBillingOrg}
                            billingOrg={child.billingOrganization}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
