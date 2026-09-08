import React from "react";
import "./ProductSummaryCard.scss";
import { SlControlEnd } from "react-icons/sl";
import RoundedLabel from "../RoundedLabel/RoundedLabel";
import { Product } from "@/types/GrpView";
import { PersonIcon, GuestIcon, Stethoscope } from "@/assets";
import { extractDisplayValue } from "../ExtractValue/ExtractDisplayValue";
import { buildVisitFeesText, getSafeString } from "@/utils";
import { LABELS } from "@/constants";
import { CalendarIcon } from "@ucc/common-ui";

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: any;
}> = ({ icon, label, value }) => (
  <div className="info-item">
    {icon}
    <span>
      <strong>{label}</strong> {value}
    </span>
  </div>
);

type ProductSummaryProps = {
  data: Product;
};

const ProductSummaryCard: React.FC<ProductSummaryProps> = ({ data }) => {
  const {
    productName,
    membership,
    age,
    effectiveDate,
    termDate,
    visitFeesMember,
    visitFeesClient,
    features,
    transistionToId,
    productTag,
    membershipFeeType,
    transistionToName,
    updatedOn,
  } = data;

  const productVisitFeesDisplay = buildVisitFeesText(
    visitFeesMember,
    visitFeesClient,
  );

  return (
    <div className="product-summary-card">
      <div className="header">
        <div className="title-section">
          <h6 className="product-title">{productName}</h6>
          {transistionToId && (
            <RoundedLabel text={getSafeString(updatedOn)} variant="success" />
          )}
        </div>
        {productTag && <RoundedLabel text={productTag} variant="info" />}
      </div>

      {transistionToId && (
        <div className="info-row">
          <InfoItem
            icon={<SlControlEnd className="icon" size={12} />}
            label={LABELS.products.TRANSITION_TO}
            value={transistionToName}
          />
        </div>
      )}

      <div className="info-row">
        <InfoItem
          icon={<GuestIcon className="icon" />}
          label={LABELS.products.MEMBERSHIP}
          value={`${extractDisplayValue(membership, "currency").raw}/${getSafeString(
            membershipFeeType,
          )}`}
        />
        <InfoItem
          icon={<PersonIcon className="icon" />}
          label={LABELS.products.AGE}
          value={getSafeString(age)}
        />
        <InfoItem
          icon={<CalendarIcon className="icon" />}
          label={LABELS.products.EFFECTIVE_DATE}
          value={extractDisplayValue(effectiveDate, "date").jsx}
        />
        <InfoItem
          icon={<CalendarIcon className="icon" />}
          label={LABELS.products.TERM_DATE}
          value={extractDisplayValue(termDate, "date").jsx}
        />
      </div>
      {productVisitFeesDisplay && (
        <div className="info-row">
          <InfoItem
            icon={<Stethoscope className="icon" />}
            label={LABELS.products.VISIT_FEE}
            value={getSafeString(productVisitFeesDisplay)}
          />
        </div>
      )}

      {features &&
        features.length > 0 &&
        features.map((feature, index) => {
          const featureVisitFees = buildVisitFeesText(
            feature.visitFeesMember,
            feature.visitFeesClient,
          );
          return (
            <div key={index} className="visit-type-card">
              <div className="visit-title">{feature.featureName}</div>
              {featureVisitFees && (
                <div className="visit-fee">
                  <strong>{LABELS.products.VISIT_FEE}:</strong>&nbsp;{" "}
                  {featureVisitFees}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default ProductSummaryCard;
