import DisplayRow from "@/components/DisplayRow/DisplayRow";
import { SidebarRowWrapper } from "@ucc/common-ui";
import { useNavigate } from "react-router-dom";
import { ORG_DETAIL_PATH, GRP_DETAIL_PATH } from "@/router/routes";
import { formatDateUTC } from "@/utils";

export interface SliderChildProps {
    data: Record<string, any> | null;
    fieldsOrder?: Array<{ key: string; label: string; lastChild?: boolean; format?: "text" | "date" | "boolean" | "person" | "img" | "link"; }>;
}

export const SliderChild: React.FC<SliderChildProps> = ({ data, fieldsOrder }) => {
    const navigate = useNavigate();
    const normalFields = fieldsOrder?.slice(0, -3) || [];
    const lastmodifiedBy = fieldsOrder?.slice(-3) || [];
    const lastTwoFields = fieldsOrder?.slice(-2) || [];
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
                            format={item.format}
                        />
                    </SidebarRowWrapper>

                ))
            }
            {
                <div className="general-setting-slider-content">
                    <span className="slider-label">
                        {lastmodifiedBy[0]?.label || "Modified By"}
                    </span>
                    <div className="slider-lastmod-value">
                        <div>
                            {data?.['lastModifiedBy'] || "-"}
                        </div>
                        <div className="sublabel">
                            {lastModifiedDate ? formatDateUTC(lastModifiedDate) : "-"}
                        </div>
                    </div>
                </div>
            }
            {
                <>
                    <hr className="display-divider" />
                    {lastTwoFields.map((item, idx) => {
                        const node = data ? data[item.key] : undefined;
                        if (!Array.isArray(node)) return null;
                        return (
                            <div key={item.key}>
                                <div className="general-setting-slider-content">
                                    <div className="slider-label">{item.label}</div>
                                    <div className="col slider-values">
                                        {node.map((n: Record<string, any>) => (
                                            <div key={n.id || n.key}>
                                                <a
                                                    href={`${item.key === "groups" ? GRP_DETAIL_PATH : ORG_DETAIL_PATH}/${n.id}`}
                                                    onClick={(e) => {
                                                        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
                                                            return;
                                                        }
                                                        e.preventDefault();
                                                        navigate(`${item.key === "groups" ? GRP_DETAIL_PATH : ORG_DETAIL_PATH}/${n.id}`);
                                                    }}
                                                    className="slider-values d-flex flex-column gap-10"
                                                >
                                                    {n.name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {idx !== lastTwoFields.length - 1 && <hr className="display-divider" />}
                            </div>
                        );
                    })}
                </>
            }
        </div>
    );
}
