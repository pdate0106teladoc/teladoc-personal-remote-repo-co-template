import React from "react";
import { DisplayRow as CommonDisplayRow, DisplayRowProps } from "@ucc/common-ui";
import { GRP_DETAIL_PATH, ORG_DETAIL_PATH } from "@/router/routes";
import { useNavigate } from "react-router-dom";

const DisplayRow: React.FC<DisplayRowProps> = (props) => {
  const navigate = useNavigate();

  const handleNavigate = (value: any) => {
    const path = value?.["id"] != null ? `${value["isGrp"] ? GRP_DETAIL_PATH : ORG_DETAIL_PATH}/${value?.["id"]}` : "";
    if (path) navigate(path);
  };

  return <CommonDisplayRow {...props} onNavigate={handleNavigate} />;
};

export default DisplayRow;
