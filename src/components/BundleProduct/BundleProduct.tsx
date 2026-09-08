import { useState } from "react";
import ProductSummaryCard from "@/components/ProductCard/ProductSummaryCard";
import "./BundleTree.scss";
import { Bundle, Product } from "@/types/GrpView";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { CalendarIcon, CustomCheckbox, extractDisplayValue } from "@ucc/common-ui"
import { LABELS } from "@/constants";

interface BundleTreeProps {
  bundle: Bundle;
  productClick: (product: Product) => void;
  onBundleTitleClick?: (bundle: Bundle) => void; // new optional callback
}
const BundleTree = ({
  bundle,
  productClick,
  onBundleTitleClick,
}: BundleTreeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const renderMetaInfo = () => {
    const metaItems = [
      {
        condition: bundle.advAssessment,
        label: LABELS.products.ADVANCE_ASSESSMENT,
      },
      {
        condition: bundle.nutritionPromotion,
        label: LABELS.products.NUTRITION_PROMOTION,
      },
      {
        condition: bundle.proactiveCoaching,
        label: LABELS.products.PROACTIVE_COACHING,
      },
    ];

    return metaItems
      .map((item, index) => (
        <div key={index} className="d-flex">
          <CustomCheckbox checked={item.condition} viewOnly={true} />
          <span className="flag">{item.label}</span>
        </div>
      ));
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBundleTitleClick) onBundleTitleClick(bundle);
  };

  return (
    <div className="bundle-tree">
      <div className="bundle-header" onClick={toggleOpen}>
        <button
          className="toggle-button"
          type="button"
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? <BsChevronDown /> : <BsChevronRight />}
        </button>
        <h3
          className="bundle-title"
          onClick={handleTitleClick}
          style={{ cursor: onBundleTitleClick ? "pointer" : "default" }}
        >
          {bundle.bundleName}
        </h3>
      </div>

      {isOpen && (
        <>
          <div className="bundle-meta">
            {bundle.effectiveDate && (
              <div className="d-flex align-items-center">
                <CalendarIcon />
                <span className="flag">
                  {LABELS.products.EFFECTIVE_DATE}:
                  {extractDisplayValue(bundle.effectiveDate, "date").jsx}
                </span>
              </div>
            )}
            {renderMetaInfo()}
          </div>

          <div className="bundle-content">
            {bundle.products?.map((product) => (
              <div
                key={product.productId}
                className="product-wrapper"
                onClick={() => productClick(product)}
                style={{ cursor: "pointer" }}
              >
                <ProductSummaryCard data={product} />
              </div>
            ))}

            {bundle.bundles?.map((child) => (
              <div key={child.bundleId} className="child-bundle">
                <BundleTree
                  bundle={child}
                  productClick={(product) => productClick(product)}
                  onBundleTitleClick={onBundleTitleClick}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BundleTree;
