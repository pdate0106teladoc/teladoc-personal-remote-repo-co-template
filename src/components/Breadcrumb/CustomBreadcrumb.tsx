// import "./Breadcrumb.scss"
import { ArrowDivider } from "@ucc/common-ui";
 
const Breadcrumb = ({
  items,
  activeIndex,
}: {
  items: string[];
  activeIndex?: number;
}) => (
  <nav className="custom-breadcrumb">
    {items.map((item, idx) => (
      <span
        key={item}
        className={`breadcrumb-item${activeIndex === idx ? " active" : ""}`}
      >
        {item}
        {idx < items.length - 1 && (
          <ArrowDivider className="breadcrumb-divider"/>
        )}
      </span>
    ))}
  </nav>
);
 
export default Breadcrumb;
