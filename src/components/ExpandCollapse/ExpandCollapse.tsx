import React, { useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import "./ExpandCollapse.scss";
import { CustomTable, TableColumn } from "@ucc/common-ui";

interface ExpandCollapseProps<T> {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  data: T[];
  columns: TableColumn<T>[];
  tableProps?: {
    rowsPerPage?: number;
    showPagination?: boolean;
    customClassName?: string;
    showEllipsisColumn?: boolean;
  };
  headerClassName?: string;
  contentClassName?: string;
  onToggle?: (isExpanded: boolean) => void;
}

const ExpandCollapse = React.forwardRef<
  HTMLDivElement,
  ExpandCollapseProps<any>
>(
  (
    {
      title,
      subtitle,
      defaultExpanded = false,
      data,
      columns,
      headerClassName = "",
      contentClassName = "",
      onToggle,
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const handleToggle = () => {
      const newState = !isExpanded;
      setIsExpanded(newState);
      onToggle?.(newState);
    };

    return (
      <div className="expand-collapse-wrapper" ref={ref}>
        <div
          className={`expand-collapse-header ${headerClassName} ${
            isExpanded ? "expanded" : ""
          }`}
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
          aria-expanded={isExpanded}
          aria-label={`${title} expand collapse button`}
        >
          <div className="header-content">
            <div className="header-icon">
              {isExpanded ? (
                <BsChevronDown size={18} />
              ) : (
                <BsChevronRight size={18} />
              )}
            </div>
            <div className="header-text">
              <h3 className="header-title">{title}</h3>
              {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={`expand-collapse-content ${contentClassName}`}>
            <CustomTable
              data={data}
              columns={columns}
              showPagination={false}
            />
          </div>
        )}
      </div>
    );
  }
);

ExpandCollapse.displayName = "ExpandCollapse";

export default ExpandCollapse;
