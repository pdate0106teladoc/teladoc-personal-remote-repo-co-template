import { OverlayTrigger } from "react-bootstrap";
import { InfoIcon, renderTooltip } from "@ucc/common-ui";
import "./EditableRow.scss";
import { EditableRowProps } from "@/types/edit";
import EditableField from "@/components/EditableRow/EditableField";

const EditableRow: React.FC<EditableRowProps> = ({
  label,
  value,
  fieldKey,
  metadata,
  onChange,
  error,
  lastChild = false,
  format,
  tooltipContent,
  onNavigate,
  personMeta,
}) => {
  return (
    <div className={`editable-row ${lastChild ? "last-child" : ""}`}>
      <div className="editable-label">
        {label}
        {metadata.required && <span className="required">*</span>}
        {tooltipContent && (
          <OverlayTrigger
            placement="bottom-start"
            overlay={renderTooltip(tooltipContent, fieldKey)}
          >
            <span className="info-icon ms-1 text-center">
              <InfoIcon aria-label="Info" height={16} width={16} />
            </span>
          </OverlayTrigger>
        )}
      </div>
      <div className="editable-value">
        <EditableField
          value={value}
          fieldKey={fieldKey}
          metadata={metadata}
          onChange={onChange}
          error={error}
          format={format}
          onNavigate={onNavigate}
          personMeta={personMeta}
        />
      </div>
    </div>
  );
};

export default EditableRow;
