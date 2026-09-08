import * as React from "react";
import "./SearchResults.scss";
import "@/pages/org-detail/styles/OrgConfigLayout.scss";

import { ArrowLeft } from "@/assets";
import {
  NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
  SHOW_RECORDS_PER_PAGE_CONTACTS,
  SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH,
  SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH_CONTACTS,
} from "@/constants";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import OrganizationsTable from "./OrganizationsTable";
import GroupsTable from "./GroupsTable";
import OpportunitiesTable from "./OpportunitiesTable";
import { Loader, Footer, OrganizationIcon, GroupIcon, ContactIcon, OppIcon, CustomTable, FailSafePage, getUserPermissions, hasAllPermission } from "@ucc/common-ui";
import Parcel from "single-spa-react/parcel";
import { mountRootParcel } from "single-spa";
import { CustomCards } from "@/components/Cards/CustomCards";
import { createAgrColumn, createEgrColumn } from "../org-detail/pages/eligibilityColumns";
import ContactCards, { contact } from "../contacts/ContactCards";
import ViewContacts from "../contacts/ViewContacts";

import { useSearchResults } from "./hooks/useSearchResults";
import { SearchSection } from "./components/SearchSection";

// Helper to bypass Vite's build-time analysis of dynamic imports
const importMfe = (name: string) => import(/* @vite-ignore */ name);

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const {
    searchType,
    page,
    searchTerm,
    data,
    loading,
    memoizedOrgs,
    memoizedGroups,
    memoizedOpps,
    memoizedContacts,
    type,
    handleBack,
    handlePageChange,
    handleSortChange,
    handleViewMore,
    fetchSearchResultData,
    setSortType,
  } = useSearchResults();
  const userPermission = getUserPermissions();

  const agrColumn = createAgrColumn(navigate);
  const egrColumn = createEgrColumn(navigate, true);

  const renderSingleTable = () => {
    const entityCounts = data?.data?.page?.entityCounts;
    const egrTableData = data?.data?.egr || [];
    const agrTableData = data?.data?.agr || [];

    switch (searchType) {
      case "organization":
        return (
          <SearchSection title="Organizations" count={entityCounts?.organizations || 0} icon={<OrganizationIcon />}>
            <OrganizationsTable
              organizations={memoizedOrgs}
              totalRecords={entityCounts?.organizations}
              pageSize={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
              showPagination={true}
              page={page}
              onPageChange={handlePageChange}
              onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "organization")}
            />
          </SearchSection>
        );
      case "opportunity":
        return (
          <SearchSection title="Opportunities" count={entityCounts?.opportunities || 0} icon={<OppIcon />}>
            <OpportunitiesTable
              opportunities={memoizedOpps}
              totalRecords={entityCounts?.opportunities}
              pageSize={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
              showPagination={true}
              page={page}
              onPageChange={handlePageChange}
              onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "opportunity")}
            />
          </SearchSection>
        );
      case "group":
        return (
          <SearchSection title="Groups" count={entityCounts?.groups || 0} icon={<GroupIcon />}>
            <GroupsTable
              groups={memoizedGroups}
              totalRecords={entityCounts?.groups}
              pageSize={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
              showPagination={true}
              page={page}
              onPageChange={handlePageChange}
              onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "group")}
            />
          </SearchSection>
        );
      case "egragr":
        return (
          <>
            <section className="table-section agr-egr-card">
              <CustomCards title={`External Group Relations mapping (EGRs): ${entityCounts?.egr || 0} results`}>
                <CustomTable
                  data={egrTableData.slice(0, 5)}
                  columns={egrColumn}
                  showPagination={false}
                  onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "egragr")}
                />
                {egrTableData.length > 5 && (
                  <button onClick={() => handleViewMore("egr")} className="view-more-link d-flex align-start" aria-label="View more egr">
                    View more
                  </button>
                )}
              </CustomCards>
            </section>
            <section className="table-section agr-egr-card">
              <CustomCards title={`Allowed Group Relations mapping (AGRs): ${entityCounts?.agr || 0} results`}>
                <CustomTable
                  data={agrTableData.slice(0, 5)}
                  columns={agrColumn}
                  showPagination={false}
                  onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "egragr")}
                />
                {agrTableData.length > 5 && (
                  <button onClick={() => handleViewMore("agr")} className="view-more-link d-flex align-start" aria-label="View more agr">
                    View more
                  </button>
                )}
              </CustomCards>
            </section>
          </>
        )
      case "egr":
        return (
          <section className="table-section agr-egr-card">
            <CustomCards title={`External Group Relations mapping (EGRs): ${entityCounts?.egr || 0} results`}>
              <CustomTable
                data={egrTableData}
                columns={egrColumn}
                showPagination
                page={page}
                totalRecords={entityCounts?.egr}
                rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
                onPageChange={handlePageChange}
                onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, `${type === "egragr" ? "egragr" : "egr"}`)}
              />
            </CustomCards>
          </section>
        );
      case "agr":
        return (
          <section className="table-section">
            <CustomCards title={`Allowed Group Relations mapping (AGRs): ${entityCounts?.agr || 0} results`}>
              <CustomTable
                data={agrTableData}
                columns={agrColumn}
                showPagination
                page={page}
                totalRecords={entityCounts?.agr}
                rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
                onPageChange={handlePageChange}
                onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, `${type === "egragr" ? "egragr" : "agr"}`)}
              />
            </CustomCards>
          </section>
        );
      case "contacts":
        return (
          <section className="table-section">
            <ViewContacts
              totalRecords={data?.data?.page?.totalResults}
              pageSize={SHOW_RECORDS_PER_PAGE_CONTACTS}
              showPagination={true}
              page={page}
              data={memoizedContacts}
              onPageChange={handlePageChange}
              onClearFilter={fetchSearchResultData}
              onRefetch={fetchSearchResultData}
              searchTerm={searchTerm}
              searchType="name"
              clearOnUnmount={true}
            />
          </section>
        );
      default:
        return null;
    }
  };

  const renderAllTable = () => {
    const entityCounts = data?.data?.page?.entityCounts || {};
    const orgs = data?.data?.organizations || [];
    const groups = data?.data?.groups || [];
    const opps = data?.data?.opportunities || [];
    const contacts: Array<contact> = data?.data?.contacts || [];
    const messages = data?.data?.messages;
    return (
      <>
        <SearchSection
          title="Organizations"
          count={entityCounts.organizations || 0}
          icon={<OrganizationIcon />}
          showViewMore={!!entityCounts.organizations && entityCounts.organizations > SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}
          onViewMore={() => {
            handleViewMore("organization");
            setSortType("organization");
          }}
          viewMoreAriaLabel="View more organizations"
          message={messages?.organization}
        >
          <OrganizationsTable
            organizations={orgs}
            pageSize={SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}
            showPagination={false}
            onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "organization")}
          />
        </SearchSection>

        <SearchSection
          title="Groups"
          count={entityCounts.groups || 0}
          icon={<GroupIcon />}
          showViewMore={!!entityCounts.groups && entityCounts.groups > SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}
          onViewMore={() => {
            handleViewMore("group");
            setSortType("group");
          }}
          viewMoreAriaLabel="View more groups"
          message={messages?.group}
        >
          <GroupsTable
            groups={groups}
            pageSize={SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}
            showPagination={false}
            onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "group")}
          />
        </SearchSection>

        <SearchSection
          title="Opportunities"
          count={entityCounts.opportunities || 0}
          icon={<OppIcon />}
          className="table-section pb-5"
          showViewMore={!!entityCounts.opportunities && entityCounts.opportunities > SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}
          onViewMore={() => {
            handleViewMore("opportunity");
            setSortType("opportunity");
          }}
          viewMoreAriaLabel="View more opportunities"
          message={messages?.opportunity}
        >
          <OpportunitiesTable
            opportunities={opps}
            pageSize={SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}
            showPagination={false}
            onChangeSortParams={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder, "opportunity")}
          />
        </SearchSection>

        <SearchSection
          title="Contacts"
          count={entityCounts.contacts || 0}
          icon={<ContactIcon width={20} height={20} />}
          className="table-section pb-5"
          showViewMore={!!entityCounts.contacts && entityCounts.contacts > SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH_CONTACTS}
          onViewMore={() => handleViewMore("contacts")}
          viewMoreAriaLabel="View more contacts"
        >
          <div className="mt-4">
            {contacts.slice(0, 3).map((contact, idx) => (
              <ContactCards key={idx} data={contact} />
            ))}
          </div>
        </SearchSection>
      </>
    );
  };

   const hasReadPermissions = hasAllPermission(userPermission, [
        "config:co-po:read",
        "config:group:read",
        "config:opportunity:read",
        "config:org:read",
        "config:product:read",
    ]);

  if (loading) {
    return (
      <>
        <Loader text="Loading..." />
        <Footer />
      </>
    );
  }

  return (
    <div className="layout-search">
      <div className="d-flex flex-row align-items-center justify-content-between mb-4 btb-back">
        <button className="back-button" onClick={() => handleBack()} aria-label="Go back to previous page">
          <ArrowLeft className="svg" />
          Back
        </button>
        <Parcel config={() => importMfe("@shell-app/loadall-app")} wrapWith="div" mountParcel={mountRootParcel} />
      </div>

      {hasReadPermissions ? <Container fluid>
        {data && searchType === "all" ? renderAllTable() : renderSingleTable()}
      </Container> : <FailSafePage cardType="unauthorized" />}
    </div>
  );
};

export default SearchResults;
