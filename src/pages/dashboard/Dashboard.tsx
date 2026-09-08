import * as React from "react";
import ConfiguratorDashboard from "@/views/ConfiguratorDashboard/ConfiguratorDashboard";
import "./Dashboard.scss";
import { UserKey } from "@/types/user";
import { FailSafePage, getUserPermissions, hasAnyPermission } from "@ucc/common-ui";

interface DashboardProps {
  role: UserKey;
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const userName = sessionStorage.getItem("name") ?? "";
  const userPermission = getUserPermissions();
  const canViewTasksDashboard = hasAnyPermission(userPermission,
    ["task:assign", "task:cancel", "task:edit"]);

  return (
    <>
      <div className="layout-dashboard">
        {
          canViewTasksDashboard ?
            <ConfiguratorDashboard userName={userName} role={role} /> :
            <FailSafePage cardType="unauthorized" />
        }
      </div>
    </>
  );
};

export default Dashboard;
