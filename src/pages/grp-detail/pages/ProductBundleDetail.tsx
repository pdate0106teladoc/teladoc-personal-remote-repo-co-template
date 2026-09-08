import { CustomCheckbox } from "@ucc/common-ui";
import { CustomTable, TableColumn } from "@ucc/common-ui";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import {
  BundleOpportunity,
  ProductBundleResponse,
  ProductItem,
} from "@/types/GrpView";
import { capitalizeFirstLetter, getSafeString } from "@/utils";
import { Tab, Tabs } from "react-bootstrap";
import "../styles/ProductBundleDetail.scss";
import { OpportunityDetail, OpportunityDetails } from "@/types/search";
import api from "@/api/apiService";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import { showCustomToast } from "@ucc/common-ui";
import { useState } from "react";
import { SideModal } from "@ucc/common-ui";
import OpportunityDrawer from "@/components/sidebar/OpportunityDrawer";
import { tabData } from "@/pages/search-results/OpportunitiesTable";

interface ProductBundleDetailProps {
  data: ProductBundleResponse;
}

const ProductBundleDetail: React.FC<ProductBundleDetailProps> = ({ data }) => {
  const details = data?.details || {};
  const features = data?.features || [];
  const products = data?.products || [];
  const [modalData, setModalData] = useState<OpportunityDetail | null>(null);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);

  const BundleopportunityColumn: TableColumn<BundleOpportunity>[] = [
    {
      label: "Name and GUID",
      field: "name",
      hasToggleMenu: false,
      render: (_val, row) => (
        <div>
          <div className="text-primary">
            <a
              href=""
              className="text-primary"
              onClick={(e) => {
                e.preventDefault();
                setOpportunityId(row.id);
                fetchOpportunityDetails(row.id);
              }}
            >
              {getSafeString(row.name)}
            </a>
          </div>
          <div>{getSafeString(row.opportunityId)}</div>
        </div>
      ),
    },
    {
      label: "Contract",
      field: "contractNumber",
      hasToggleMenu: false,
      subLabel: "Number",
      render: (_val, row) => <div>{getSafeString(row.contractNumber)}</div>,
    },
    {
      label: "Effective",
      field: "effectiveStartDate",
      hasToggleMenu: false,
      subLabel: "Start Date",
      render: (_val, row) => <div>{getSafeString(row.effectiveStartDate)}</div>,
    },
    {
      label: "Effective",
      field: "effectiveEndDate",
      hasToggleMenu: false,
      subLabel: "End Date",
      render: (_val, row) => <div>{getSafeString(row.effectiveEndDate)}</div>,
    },
  ];

  const productBundleOpportunity = Array.isArray(details.opportunities)
    ? details.opportunities
    : [];

  const renderProductTab = (product: ProductItem[]) => {
    return (
      <div className="bundle-products">
        {product.map((prod, index) => (
          <div className="product-layout" key={index}>
            <div className="bundle-info">
              <CustomCheckbox checked={prod.selected} viewOnly={true} />
              <RoundedLabel
                text={capitalizeFirstLetter(prod.type)}
                variant="grey"
                className={
                  prod.type === "bundle" ? "bundle-tag" : "product-tag"
                }
              />
              <span className={prod.selected ? "product-name" : "text-muted"}>
                {capitalizeFirstLetter(prod.name)}
              </span>
            </div>
            <div className="nested-products">
              {prod.products &&
                prod.products.length > 0 &&
                renderProductTab(prod.products)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const fetchOpportunityDetails = async (guid: string) => {
    try {
      const response = await api.get<OpportunityDetails>(
        `${API_ENDPOINTS.opportunity}/${guid}`,
      );
      setModalData(response?.data || response);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  return (
    <div className="product-bundle-detail-tab-container">
      <Tabs id="uncontrolled-tab-example-sidebar">
        <Tab eventKey="details" title="Opportunity">
          <div className="detail-container">
            <CustomTable
              columns={BundleopportunityColumn}
              data={productBundleOpportunity}
              showPagination={false}
            />
          </div>
        </Tab>
        {features.length > 0 && (
          <Tab eventKey="features" title="Features">
            <div className="feature-container">
              {features.map((feature, index) => (
                <div key={index} className="features-list">
                  <CustomCheckbox
                    checked={feature.enabled}
                    viewOnly={true}
                    size="lg"
                  />
                  <span className={feature.enabled ? "" : "text-muted"}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </Tab>
        )}
        <Tab eventKey="products" title="Products">
          <div className="product-container">{renderProductTab(products)}</div>
        </Tab>
      </Tabs>
      <SideModal
        show={!!modalData && opportunityId !== null}
        title={modalData?.name ?? ""}
        onHide={() => {
          setModalData(null);
          setOpportunityId(null);
        }}
      >
        <OpportunityDrawer tabs={tabData} data={modalData} />
      </SideModal>
    </div>
  );
};

export default ProductBundleDetail;
