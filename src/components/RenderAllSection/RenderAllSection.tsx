import React, { useMemo } from "react";
import {
    RenderAllSections as RenderAllSectionsBase,
    type EditableRowComponentProps,
} from "@ucc/common-ui";
import type { ComponentProps } from "react";
import EditableRow from "@/components/EditableRow/EditableRow";

type RenderAllSectionsProps = ComponentProps<typeof RenderAllSectionsBase>;
type SectionData = RenderAllSectionsProps["data"];

/** common-ui `FieldMetadata` and app types differ slightly; runtime shape matches. */
const EditableRowForSections =
    EditableRow as React.ComponentType<EditableRowComponentProps>;

/** In edit mode, common-ui passes `item.value` from entity data; overlay formData so metadata/saved values show. */
const applyFormDataToSections = (
    data: SectionData,
    formData: Record<string, any>,
): SectionData => {
    const result: SectionData = {};

    Object.entries(data).forEach(([sectionTitle, sectionColumns]) => {
        result[sectionTitle] = {};
        Object.entries(sectionColumns).forEach(([colKey, items]) => {
            result[sectionTitle][colKey] = items.map((item) => {
                if (!item.fieldKey || !(item.fieldKey in formData)) {
                    return item;
                }
                return { ...item, value: formData[item.fieldKey] };
            });
        });
    });

    return result;
};

const RenderAllSections: React.FC<RenderAllSectionsProps> = ({
    data,
    formData = {},
    mode,
    ...props
}) => {
    const resolvedData = useMemo(
        () =>
            mode === "edit" && Object.keys(formData).length > 0
                ? applyFormDataToSections(data, formData)
                : data,
        [data, formData, mode],
    );

    return (
        <RenderAllSectionsBase
            {...props}
            data={resolvedData}
            formData={formData}
            mode={mode}
            editableRowComponent={EditableRowForSections}
        />
    );
};

export default RenderAllSections;
