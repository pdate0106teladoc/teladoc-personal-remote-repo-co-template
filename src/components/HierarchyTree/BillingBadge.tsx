import { SuccessIcon } from "@ucc/common-ui";

export const BillingBadge = ({
    billingOrg,
    isGroup = false,
}: {
    billingOrg?: boolean;
    isGroup?: boolean;
}) => {
    if (isGroup) return <span className="badge-status na">Not applicable</span>;
    return (
        <span className="billOrg">
            {billingOrg ? <SuccessIcon /> : <SuccessIcon className="svg-grey" />}
            <span>{billingOrg ? "Yes" : "No"}</span>
        </span>
    );
};
