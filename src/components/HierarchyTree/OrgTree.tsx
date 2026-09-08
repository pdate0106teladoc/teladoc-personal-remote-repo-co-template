import * as React from "react";
import { useState, useCallback } from "react";
import api from "@/api/apiService";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import { ORG_DETAIL_PATH, GRP_DETAIL_PATH } from "@/router/routes";
import { TreeNode } from "./TreeNode";
import "./OrgTree.scss";
import { OrgData, DynamicMap } from "@/types/Hierarchy";
import { showCustomToast } from "@ucc/common-ui";

interface OrgTreeProps {
  data: OrgData;
  showBillingColumn?: boolean;
  currentGroupId?: string;
  currentOrgId?: string;
}

export const OrgTree: React.FC<OrgTreeProps> = ({
  data,
  showBillingColumn = true,
  currentGroupId,
  currentOrgId,
}) => {
  const { parents = [], org, children = [], groups = [] } = data;
  const [dynamicChildMap, setDynamicChildMap] = useState<DynamicMap>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // Initial Expansion Logic
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      if (org?.id) initial[org.id] = true;
      parents.forEach((p) => {
        initial[p.id] = true;
      });
      return initial;
    },
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const fetchChildrenForOrg = useCallback(
    async (orgId?: string) => {
      if (!orgId) return;

      // Check cache before fetching
      if (dynamicChildMap[orgId]) return;

      setLoadingMap((s) => ({ ...s, [orgId]: true }));
      try {
        const res = await api.get<any>(
          `${API_ENDPOINTS.organization}/${orgId}${API_ENDPOINTS.children}`,
        );
        const responseData = res?.data || res;
        const payload = responseData?.[0] ?? null;
        setDynamicChildMap((prev) => ({
          ...prev,
          [orgId]: {
            children: payload?.children ?? [],
            groups: payload?.groups ?? [],
          },
        }));
      } catch (err) {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      } finally {
        setLoadingMap((s) => ({ ...s, [orgId]: false }));
      }
    },
    [dynamicChildMap],
  );

  const renderTree = (index: number, level = 0): React.ReactNode => {
    if (index < parents.length) {
      const p = parents[index];
      return (
        <TreeNode
          key={p.id}
          id={p.id}
          label={p.name}
          billingOrg={p.isBillingOrg}
          level={level}
          href={`${ORG_DETAIL_PATH}/${p.id}`}
          count={p.countOfChildren}
          isOpen={expandedIds[p.id]}
          onToggle={toggleExpand}
          expandedIds={expandedIds}
          childrenData={dynamicChildMap[p.id]?.children}
          groupsData={dynamicChildMap[p.id]?.groups}
          onRequestChildren={fetchChildrenForOrg}
          loading={!!loadingMap[p.id]}
          loadingMap={loadingMap}
          dynamicChildMap={dynamicChildMap}
          showBilling={showBillingColumn}
        >
          {renderTree(index + 1, level + 1)}
        </TreeNode>
      );
    }

    const displayChildren = org ? (dynamicChildMap[org.id]?.children ?? children) : children;
    const displayGroups = org ? (dynamicChildMap[org.id]?.groups ?? groups) : groups;

    if (!org || Object.keys(org).length === 0) {
      return (
        <>
          {displayChildren.map((c) => (
            <TreeNode
              key={c.id}
              id={c.id}
              label={c.name}
              billingOrg={c.isBillingOrg}
              level={level}
              href={`${ORG_DETAIL_PATH}/${c.id}`}
              count={c.countOfChildren ?? 0}
              isOpen={expandedIds[c.id]}
              onToggle={toggleExpand}
              expandedIds={expandedIds}
              onRequestChildren={fetchChildrenForOrg}
              loading={!!loadingMap[c.id]}
              loadingMap={loadingMap}
              dynamicChildMap={dynamicChildMap}
              childrenData={dynamicChildMap[c.id]?.children}
              groupsData={dynamicChildMap[c.id]?.groups}
              showBilling={showBillingColumn}
            />
          ))}
          {displayGroups.map((g) => (
            <TreeNode
              key={g.id}
              id={g.id}
              label={g.name}
              isGroup
              level={level}
              href={`${GRP_DETAIL_PATH}/${g.id}`}
              isCurrentGroup={g.id === currentGroupId}
              showBilling={showBillingColumn}
            />
          ))}
        </>
      );
    }

    return (
      <TreeNode
        key={org.id}
        id={org.id}
        level={level}
        label={org.name}
        billingOrg={org.isBillingOrg}
        isCurrentOrg={currentOrgId === org.id}
        href={`${ORG_DETAIL_PATH}/${org.id}`}
        count={org.countOfChildren}
        isOpen={expandedIds[org.id]}
        onToggle={toggleExpand}
        expandedIds={expandedIds}
        onRequestChildren={fetchChildrenForOrg}
        loading={!!loadingMap[org.id]}
        loadingMap={loadingMap}
        dynamicChildMap={dynamicChildMap}
        showBilling={showBillingColumn}
      >
        {displayChildren.map((c) => (
          <TreeNode
            key={c.id}
            id={c.id}
            label={c.name}
            billingOrg={c.isBillingOrg}
            level={level + 1}
            href={`${ORG_DETAIL_PATH}/${c.id}`}
            count={c.countOfChildren ?? 0}
            isOpen={expandedIds[c.id]}
            onToggle={toggleExpand}
            expandedIds={expandedIds}
            onRequestChildren={fetchChildrenForOrg}
            loading={!!loadingMap[c.id]}
            loadingMap={loadingMap}
            dynamicChildMap={dynamicChildMap}
            childrenData={dynamicChildMap[c.id]?.children}
            groupsData={dynamicChildMap[c.id]?.groups}
            showBilling={showBillingColumn}
          />
        ))}
        {displayGroups.map((g) => (
          <TreeNode
            key={g.id}
            id={g.id}
            label={g.name}
            isGroup
            level={level + 1}
            href={`${GRP_DETAIL_PATH}/${g.id}`}
            isCurrentGroup={g.id === currentGroupId}
            showBilling={showBillingColumn}
          />
        ))}
      </TreeNode>
    );
  };

  return (
    <div className={`org-tree-container ${!showBillingColumn ? `no-billing-column` : ``}`}>
      <div className="org-tree-header">
        <div>Organization/Group name</div>
        {showBillingColumn && <div>Billing organization?</div>}
      </div>
      {renderTree(0)}
    </div>
  );
};
