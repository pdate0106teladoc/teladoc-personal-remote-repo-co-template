import DisplayRow from "@/components/DisplayRow/DisplayRow";
import { SidebarRowWrapper } from "@ucc/common-ui";
import { formatDateUTC } from "@/utils";

interface CmcAssociationDetailsProps {
    data: Record<string, any> | null;
    fieldsOrder?: Array<{ key: string; label: string; lastChild?: boolean; }>;
}

export const CmcAssociationDetails: React.FC<CmcAssociationDetailsProps> = ({ data, fieldsOrder }) => {
    const normalFields = fieldsOrder?.slice(0, -1) || [];
    const lastmodifiedBy = fieldsOrder?.slice(-1) || [];
    const lastModifiedDate = data?.['lastModifiedDate'];
    return (
        <div className="details-sidebar-content">
            {
                normalFields?.map(item => (
                    <SidebarRowWrapper key={item.key}>
                        <DisplayRow
                            label={item.label}
                            value={data ? data[item.key] : undefined}
                            lastChild={item.lastChild}
                        />
                    </SidebarRowWrapper>

                ))
            }
            {
                <div className="general-setting-slider-content">
                    <span className="slider-label">
                        {lastmodifiedBy[0]?.label}
                    </span>
                    <div className="slider-lastmod-value">
                        <div>
                            {data?.['lastModifiedBy'] || "-"}
                        </div>
                        <div className="sublabel">
                            {formatDateUTC(lastModifiedDate) || "-"}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
