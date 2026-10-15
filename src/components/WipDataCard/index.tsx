import React, { useState } from "react";
import * as Styled from "./index.styled";
import { FaClipboardList, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface WipDataCardProps {
  materialData?: any;
  title?: string;
  onFlowClick?: () => void;
}

const WipDataCard: React.FC<WipDataCardProps> = ({
  materialData,
  title = "Material Details",
  onFlowClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatValue = (val: any): string => {
    if (val == null || val === "") return "--";
    if (typeof val === "object") {
      return val.Name || val.Id || val.Description || "--";
    }
    return String(val);
  };

  const getUniversalState = (state?: number) => {
    if (state === undefined || state === null) return "--";
    const map: Record<number, string> = {
      0: "Created",
      1: "Frozen",
      2: "Active",
      3: "Effective",
      4: "Terminated",
    };
    return map[state] || String(state);
  };

  const getSystemState = (state?: number) => {
    if (state === undefined || state === null) return "--";
    const map: Record<number, string> = {
      0: "Queued",
      1: "Dispatched",
      2: "InProcess",
      3: "Processed",
    };
    return map[state] || String(state);
  };

  const getFacility = () => {
    if (!materialData) return "--";
    if (typeof materialData.Facility === "object" && materialData.Facility?.Name) {
      return materialData.Facility.Name;
    }
    if (typeof materialData.Facility === "string") return materialData.Facility;
    return materialData.FacilityName || "--";
  };

  const getProduct = () => {
    if (!materialData) return "--";
    const p = materialData.Product;
    if (typeof p === "object" && p !== null) {
      const name = p.Name || "";
      const rev = p.Revision;
      if (name && rev) return `${name} [${rev}]`;
      if (name) return name;
    }
    return materialData.ProductName || (typeof p === "string" ? p : "--");
  };

  const getFlow = () => {
    if (!materialData) return "--";
    const f = materialData.Flow;
    if (typeof f === "object" && f !== null) {
      const name = f.Name || "";
      const rev = f.Revision;
      if (name && rev) return `${name} [${rev}]`;
      if (name) return name;
    }
    return materialData.WorkflowName || (typeof f === "string" ? f : "--");
  };

  const getStep = () => {
    if (!materialData) return "--";
    const s = materialData.Step;
    if (typeof s === "object" && s !== null) {
      return s.Name || "--";
    }
    return materialData.StepName || materialData.SpecName || (typeof s === "string" ? s : "--");
  };

  const getFlowPath = () => {
    if (!materialData) return "--";
    const flowStr = getFlow();
    const stepStr = getStep();
    if (flowStr !== "--" && stepStr !== "--") {
      return `${flowStr} > ${stepStr}`;
    }
    if (materialData.FlowPath && typeof materialData.FlowPath === "string") {
      const parts = materialData.FlowPath.split("/");
      return parts.map((part: string) => {
        const tokens = part.split(":");
        if (tokens.length >= 2 && isNaN(Number(tokens[1]))) {
          return `${tokens[0]} [${tokens[1]}]`;
        }
        return tokens[0];
      }).join(" > ");
    }
    return "--";
  };

  const getPrimaryQuantity = () => {
    if (!materialData || materialData.PrimaryQuantity == null) return "--";
    const qtyNum = Number(materialData.PrimaryQuantity);
    const units = materialData.PrimaryUnits || "";
    return `${isNaN(qtyNum) ? materialData.PrimaryQuantity : qtyNum} ${units}`.trim();
  };

  const getResource = () => {
    if (!materialData) return null;

    if (Array.isArray(materialData.MaterialResourceRelations)) {
       const rel = materialData.MaterialResourceRelations.find((r: any) => r && r.TargetEntity && r.TargetEntity.Name);
       if (rel) return rel.TargetEntity.Name;
    }

    const relCollection = materialData.RelationCollection?.CMFMapData;
    if (Array.isArray(relCollection)) {
       const matResEntry = relCollection.find((entry: any) => Array.isArray(entry) && entry[0] === "MaterialResource");
       if (matResEntry && Array.isArray(matResEntry[1])) {
          const rel = matResEntry[1].find((r: any) => r && r.TargetEntity && r.TargetEntity.Name);
          if (rel) return rel.TargetEntity.Name;
       }
    }
    
    return null;
  };

  const getHoldCount = () => {
    if (!materialData || materialData.HoldCount == null) return null;
    if (Number(materialData.HoldCount) > 0) {
      return String(materialData.HoldCount);
    }
    return null;
  };

  const isHold = materialData?.HoldCount != null && Number(materialData.HoldCount) > 0;

  const rows = [
    {
      label: "Type:",
      value: formatValue(materialData?.Type),
    },
    {
      label: "Universal State:",
      value: getUniversalState(materialData?.UniversalState),
    },
    {
      label: "System State:",
      value: getSystemState(materialData?.SystemState),
    },
    {
      label: "Product:",
      value: getProduct(),
    },
    {
      label: "Flow:",
      value: getFlow(),
      isLink: true,
      onClick: onFlowClick,
    },
    {
      label: "Step:",
      value: getStep(),
    },
    {
      label: "Resource:",
      value: getResource(), // returns null if not found
    },
    {
      label: "Priority:",
      value: materialData?.Priority != null ? String(materialData.Priority) : "--",
    },
    {
      label: "Primary Quantity:",
      value: getPrimaryQuantity(),
    },
    {
      label: "Hold Count:",
      value: getHoldCount(),
    },
  ].filter(row => row.value !== null);

  return (
    <Styled.MainCard $isHold={isHold}>
      <Styled.HeaderRow>
        <Styled.CardTitleWrapper>
          <FaClipboardList />
          {title}
        </Styled.CardTitleWrapper>
        <Styled.ExpandButton
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </Styled.ExpandButton>
      </Styled.HeaderRow>

      {isExpanded && (
        <Styled.Grid>
          {rows.map((row, index) => (
            <Styled.InfoWarpper key={index}>
              <Styled.InfoLeft $isHold={isHold}>{row.label}</Styled.InfoLeft>
              <Styled.Badge 
                $isHold={isHold}
                onClick={row.isLink && row.value !== "--" ? row.onClick : undefined}
                style={{ 
                  cursor: (row.isLink && row.value !== "--") ? "pointer" : "default",
                  color: (row.isLink && row.value !== "--") ? "var(--mes-primary)" : "inherit",
                  textDecoration: (row.isLink && row.value !== "--") ? "underline" : "none"
                }}
              >
                {formatValue(row.value)}
              </Styled.Badge>
            </Styled.InfoWarpper>
          ))}
        </Styled.Grid>
      )}
    </Styled.MainCard>
  );
};

export default WipDataCard;
