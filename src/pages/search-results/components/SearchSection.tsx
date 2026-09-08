import React, { ReactNode } from "react";
import { SearchErrMsg } from "@/types/search";
import { ExclamationIcon, SyncFailIcon } from "@ucc/common-ui";

interface SearchSectionHeaderProps {
    icon: ReactNode;
    title: string;
    count: number;
    message?: SearchErrMsg;
}

const getMessagePillProps = (message: string): { icon: React.ReactNode; modifier: string } => {
    switch (message) {
        case "Data not available":
        case "Data sync failed":
            return { icon: <ExclamationIcon width={12} height={12} />, modifier: "not-available" };
        case "Data syncing in progress":
            return { icon: <SyncFailIcon width={12} height={12} />, modifier: "sync-failed" };
        default:
            return { icon: null, modifier: "" };
    }
};

const MessagePill: React.FC<{ message: SearchErrMsg }> = ({ message }) => {
    const { icon, modifier } = getMessagePillProps(message);
    return (
        <div className={`message-container${modifier ? ` message-container--${modifier}` : ""}`}>
            {icon}
            {message}
        </div>
    );
};

export const SearchSectionHeader: React.FC<SearchSectionHeaderProps> = ({ icon, title, count = 0 }) => (
    <div className="section-header">
        <div className="d-flex align-items-center">
            <span className="section-icon">{icon}</span>
            <h6 className="mb-0 table-title" data-testid="org-header">
                {title}: {count} results
            </h6>
        </div>
    </div>
);

interface SearchSectionProps {
    title: string;
    count: number;
    icon: ReactNode;
    children: ReactNode;
    className?: string;
    showViewMore?: boolean;
    onViewMore?: () => void;
    viewMoreAriaLabel?: string;
    message?: SearchErrMsg;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
    title,
    count,
    icon,
    children,
    className = "table-section",
    showViewMore = false,
    onViewMore,
    viewMoreAriaLabel,
    message,
}) => {
    return (
        <section className={className}>
            <SearchSectionHeader icon={icon} title={title} count={count} />
            <>
                {message ?
                    (
                        <div className="search-result-message">
                            <MessagePill message={message} />
                        </div>
                    )
                    :
                    (
                        <>
                            {children}
                            {showViewMore && onViewMore && (
                                <button
                                    onClick={onViewMore}
                                    className="view-more-link"
                                    aria-label={viewMoreAriaLabel || `View more ${title.toLowerCase()}`}
                                >
                                    View more
                                </button>
                            )}
                        </>
                    )
                }
            </>
        </section>
    );
};
