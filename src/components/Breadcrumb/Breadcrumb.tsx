import { ORG_DETAIL_PATH, RESULT_PATH } from "@/router/routes";
import { Breadcrumb } from "@ucc/common-ui";

import useConfigStore from "@/store/configStore";
import { useNavigate } from "react-router-dom";

interface BreadcrumbExampleProps {
  isOrgLayout?: boolean;
}

function BreadcrumbExample({ isOrgLayout = false }: BreadcrumbExampleProps) {
  const searchParams = useConfigStore((state) => state.searchParams);
  const org = useConfigStore((state) => state.org);
  const breadCrumbVisible = useConfigStore((state) => state.breadCrumbVisible);
  const navigate = useNavigate();

  const searchResultClickHandler = () => {
    navigate(`${RESULT_PATH}${searchParams}`);
  };

  const orgClickHandler = () => {
    navigate(`${ORG_DETAIL_PATH}/${org.orgUUID}`);
  };

  const getBreadcrumbItems = () => {
    const items = [];
    if (breadCrumbVisible && searchParams) {
      items.push({
        label: "Search Results",
        onClick: searchResultClickHandler
      })
    }

    if (!isOrgLayout && org.orgUUID && org.orgName) {
      items.push({
        label: org.orgName,
        onClick: orgClickHandler
      })
    }
    return items;
  }

  const items = getBreadcrumbItems();

  if (items.length === 0) return null;

  return (
    <Breadcrumb items={items} />
  );
}

export default BreadcrumbExample;
