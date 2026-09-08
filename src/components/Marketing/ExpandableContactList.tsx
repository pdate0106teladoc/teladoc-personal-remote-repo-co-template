import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { InfoIcon } from "@ucc/common-ui";
import "./ExpandableContactList.scss";

export interface ExpandableContactListItem {
  id: string;
  displayName: string;
  contactId?: string;
  mongoId?: string;
}

interface ExpandableContactListProps {
  label: string;
  contacts: ExpandableContactListItem[];
  tooltipContent?: string;
  initialVisibleCount?: number;
  onContactClick?: (contact: ExpandableContactListItem) => void;
  lastChild?: boolean;
}

const DEFAULT_VISIBLE_COUNT = 9;

const ExpandableContactList: React.FC<ExpandableContactListProps> = ({
  label,
  contacts,
  tooltipContent,
  initialVisibleCount = DEFAULT_VISIBLE_COUNT,
  onContactClick,
  lastChild = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = contacts.length > initialVisibleCount;
  const visibleContacts =
    expanded || !hasOverflow
      ? contacts
      : contacts.slice(0, initialVisibleCount);
  const hiddenCount = contacts.length - initialVisibleCount;

  const renderTooltip = (content: string) => (
    <Tooltip id={`tooltip-${label}`} className="tooltip">
      <span>{content}</span>
    </Tooltip>
  );

  return (
    <div className="expandable-contact-list" data-testid="expandable-contact-list">
      <div className="display-row d-flex m-2 align-items-start">
        <div className="display-label d-flex align-items-center">
          {label}
          {tooltipContent && (
            <OverlayTrigger
              placement="bottom-start"
              overlay={renderTooltip(tooltipContent)}
            >
              <span className="info-icon ms-1 text-center">
                <InfoIcon aria-label="Info" height={16} width={16} />
              </span>
            </OverlayTrigger>
          )}
        </div>
        <div className="display-value-col">
          <div className="display-value expandable-contact-list-value">
            {visibleContacts.length === 0 ? (
              <span>-</span>
            ) : (
              <>
                {visibleContacts.map((contact, index) => (
                  <React.Fragment key={`${contact.displayName}-${index}`}>
                    {onContactClick && (contact.contactId || contact.mongoId) ? (
                      <button
                        type="button"
                        className="expandable-contact-name"
                        onClick={() => onContactClick(contact)}
                      >
                        {contact.displayName}
                      </button>
                    ) : (
                      <span className="expandable-contact-name-text">
                        {contact.displayName}
                      </span>
                    )}
                    <span className="expandable-contact-separator">; </span>
                  </React.Fragment>
                ))}
                {hasOverflow && (
                  <button
                    type="button"
                    className="expandable-contact-toggle"
                    onClick={() => setExpanded((prev) => !prev)}
                    aria-expanded={expanded}
                  >
                    {expanded ? (
                      <>
                        Show less
                        <BsChevronUp size={14} aria-hidden />
                      </>
                    ) : (
                      <>
                        + {hiddenCount} more
                        <BsChevronDown size={14} aria-hidden />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {!lastChild && <hr className="display-divider" />}
    </div>
  );
};

export default ExpandableContactList;
