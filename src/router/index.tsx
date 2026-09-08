import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  CONTACT_PATH,
  DASHBOARD_PATH,
  GRP_DETAIL_PATH,
  ORG_DETAIL_PATH,
  RESULT_PATH,
  TASKS_DASHBOARD_PATH,
} from "./routes";
import ProtectedRoutes from "./ProtectedRoutes";
import { getUserRoles, getHighestPriorityRole } from "@/utils";
const GrpConfigLayout = lazy(
  () => import("@/pages/grp-detail/layout/GrpConfigLayout"),
);
const ReportingPageGrp = lazy(
  () => import("@/pages/grp-detail/pages/Reporting"),
);
const BillingPageGrp = lazy(() => import("@/pages/grp-detail/pages/Billing"));
const EligibilityClaimsPage = lazy(
  () => import("@/pages/grp-detail/pages/EligibilityClaims"),
);
const MarketingGrp = lazy(() => import("@/pages/grp-detail/pages/Marketing"));
const GeneralSettingGrp = lazy(
  () => import("@/pages/grp-detail/pages/GeneralSetting"),
);
const DashboardPage = lazy(() => import("@/pages/dashboard/Dashboard"));
const ResultPage = lazy(() => import("@/pages/search-results/SearchResults"));
import { FailSafePage, Loader } from "@ucc/common-ui";
import Contacts from "@/pages/grp-detail/pages/Contacts";
import GroupHierarchyPage from "@/pages/grp-detail/pages/Hierarchy";
import Products from "@/pages/grp-detail/pages/Products";
import HistoryLogs from "@/pages/org-detail/pages/HistoryLogs";
const GeneralSetting = lazy(
  () => import("@/pages/org-detail/pages/GeneralSettings"),
);
const BillingPage = lazy(() => import("@/pages/org-detail/pages/Billing"));
const HierarchyPage = lazy(() => import("@/pages/org-detail/pages/Hierarchy"));
const MarketingPage = lazy(() => import("@/pages/org-detail/pages/Marketing"));
const EligibilityPage = lazy(
  () => import("@/pages/org-detail/pages/Eligibility"),
);
const OpportunitiesPage = lazy(
  () => import("@/pages/org-detail/pages/Opportunities"),
);
const EditOppurtunities = lazy(
  () => import("@/pages/org-detail/pages/EditOppurtunities"),
);
const EditFiles = lazy(() => import("@/pages/org-detail/pages/EditFiles"));
const ReportingPage = lazy(() => import("@/pages/org-detail/pages/Reporting"));
const OrgConfigLayout = lazy(
  () => import("@/pages/org-detail/layout/OrgConfigLayout"),
);
const ViewContact = lazy(() => import("@/pages/contacts/ViewContacts"));
const roles = getUserRoles();
const role = getHighestPriorityRole(roles);

export default function Router() {
  return (
    <Suspense fallback={<Loader text="Loading" />}>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route
            path={DASHBOARD_PATH}
            element={
              <DashboardPage role={role} />
            }
          />
          <Route
            path={TASKS_DASHBOARD_PATH}
            element={
              <DashboardPage role={role} />
            }
          />
          <Route path={RESULT_PATH} element={<ResultPage />} />
          <Route path={`${ORG_DETAIL_PATH}/:id`} element={<OrgConfigLayout />}>
            <Route index element={<Navigate to="general-settings" replace />} />
            <Route path="general-settings" element={<GeneralSetting />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="hierarchy" element={<HierarchyPage />} />
            <Route path="eligibility" element={<EligibilityPage />} />
            <Route
              path="comments"
              element={<FailSafePage cardType="comingSoon" />}
            />
            <Route path="history-logs" element={<HistoryLogs />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="opportunities">
              <Route index element={<OpportunitiesPage />} />
              <Route path=":opportunityId" element={<OpportunitiesPage />} />
            </Route>
            <Route path="reporting" element={<ReportingPage />} />
            {/* Edit mode routes - before catch-all so edit/... paths match */}
            <Route
              path="edit/:candidateId/general-settings"
              element={<GeneralSetting />}
            />
            <Route path="edit/:candidateId/billing" element={<BillingPage />} />
            <Route path="edit/:candidateId/contacts" element={<Contacts />} />
            <Route
              path="edit/:candidateId/hierarchy"
              element={<HierarchyPage />}
            />
            <Route
              path="edit/:candidateId/eligibility"
              element={<EligibilityPage />}
            />
            <Route
              path="edit/:candidateId/marketing"
              element={<MarketingPage />}
            />
            <Route path="edit/:candidateId/opportunities">
              <Route index element={<OpportunitiesPage />} />
              <Route path=":opportunityId" element={<OpportunitiesPage />} />
            </Route>
            <Route
              path="edit/:candidateId/reporting"
              element={<ReportingPage />}
            />
            <Route path="edit/:candidateId/opportunities-edit">
              <Route index element={<EditOppurtunities />} />
              <Route path=":opportunityId" element={<EditOppurtunities />} />
            </Route>
            <Route
              path="edit/:candidateId/change-requests"
              element={<FailSafePage cardType="comingSoon" />}
            />
            <Route
              path="edit/:candidateId/comments"
              element={<FailSafePage cardType="comingSoon" />}
            />
            <Route path="edit/:candidateId/files" element={<EditFiles />} />
            <Route
              path="edit/:candidateId/history-logs"
              element={<HistoryLogs />}
            />
            <Route
              path="review/:candidateId/general-settings"
              element={null}
            />
            <Route
              path="*"
              element={<Navigate to="general-settings" replace />}
            />
          </Route>
          <Route path={`${GRP_DETAIL_PATH}/:id`} element={<GrpConfigLayout />}>
            <Route index element={<Navigate to="general-settings" replace />} />
            <Route path="general-settings" element={<GeneralSettingGrp />} />
            <Route path="billing" element={<BillingPageGrp />} />
            <Route path="hierarchy" element={<GroupHierarchyPage />} />
            <Route
              path="comments"
              element={<FailSafePage cardType="comingSoon" />}
            />
            <Route path="history-logs" element={<HistoryLogs />} />
            <Route path="marketing" element={<MarketingGrp />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="products" element={<Products />} />
            <Route
              path="eligibilty-claims"
              element={<EligibilityClaimsPage />}
            />
            <Route path="reporting" element={<ReportingPageGrp />} />
            {/* Edit mode routes */}
            <Route
              path="edit/:candidateId/general-settings"
              element={<GeneralSettingGrp />}
            />
            <Route
              path="edit/:candidateId/billing"
              element={<BillingPageGrp />}
            />
            <Route
              path="edit/:candidateId/hierarchy"
              element={<GroupHierarchyPage />}
            />
            <Route
              path="edit/:candidateId/marketing"
              element={<MarketingGrp />}
            />
            <Route path="edit/:candidateId/contacts" element={<Contacts />} />
            <Route path="edit/:candidateId/products" element={<Products />} />
            <Route
              path="edit/:candidateId/eligibilty-claims"
              element={<EligibilityClaimsPage />}
            />
            <Route
              path="edit/:candidateId/reporting"
              element={<ReportingPageGrp />}
            />
            <Route path="edit/:candidateId/opportunities-edit">
              <Route index element={<EditOppurtunities />} />
              <Route path=":opportunityId" element={<EditOppurtunities />} />
            </Route>
            <Route
              path="edit/:candidateId/change-requests"
              element={<FailSafePage cardType="comingSoon" />}
            />
            <Route
              path="edit/:candidateId/comments"
              element={<FailSafePage cardType="comingSoon" />}
            />
            <Route path="edit/:candidateId/files" element={<EditFiles />} />
            <Route
              path="edit/:candidateId/history-logs"
              element={<HistoryLogs />}
            />
            <Route
              path="review/:candidateId/general-settings"
              element={null}
            />
            <Route
              path="*"
              element={<Navigate to="general-settings" replace />}
            />
          </Route>
          <Route
            path={CONTACT_PATH}
            element={<ViewContact clearOnUnmount={true} />}
          ></Route>
          <Route
            path={`${CONTACT_PATH}/:id`}
            element={<ViewContact clearOnUnmount={true} />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
