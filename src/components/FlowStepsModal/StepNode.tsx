import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GiCube } from "react-icons/gi";
import { FaCubes, FaCodeBranch } from "react-icons/fa";
import styled from "styled-components";

const StepNodeWrapper = styled.div<{ $isCurrentStep?: boolean; $isFirstStep?: boolean }>`
  background: #f8fafc;
  border: 2px solid ${({ $isCurrentStep }) => ($isCurrentStep ? "#ef4444" : "#cbd5e1")};
  border-radius: 4px;
  padding: 10px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  .workflow-handle {
    background: transparent;
    border: none;
    width: 0;
    height: 0;
  }
`;

const StepIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
`;

const StepLabel = styled.div`
  font-size: 14px;
  color: #1e293b;
`;

export type WorkflowNodeData = {
  label: string;
  isCurrentStep?: boolean;
  isFirstStep?: boolean;
  isSubWorkflow?: boolean;
  isRework?: boolean;
};

const StepNode = ({ data }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;

  return (
    <StepNodeWrapper
      className="workflow-node"
      $isCurrentStep={nodeData.isCurrentStep}
      $isFirstStep={nodeData.isFirstStep}
    >
      <Handle type="target" position={Position.Top} id="top-target" className="workflow-handle" />
      <Handle type="source" position={Position.Top} id="top-source" className="workflow-handle" />
      <Handle type="target" position={Position.Left} id="left-target" className="workflow-handle" />
      <Handle type="source" position={Position.Left} id="left-source" className="workflow-handle" />

      <StepIcon>
        {nodeData?.isRework ? (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCodeBranch style={{ color: "#fff", transform: 'rotate(90deg)' }} size={14} />
          </div>
        ) : nodeData?.isSubWorkflow ? (
          <FaCubes style={{ color: "#1976d2" }} size={20} />
        ) : (
          <GiCube style={{ color: "#1976d2" }} size={20} />
        )}
      </StepIcon>

      <StepLabel>{nodeData.label}</StepLabel>
      <Handle type="target" position={Position.Right} id="right-target" className="workflow-handle" />
      <Handle type="source" position={Position.Right} id="right-source" className="workflow-handle" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="workflow-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="workflow-handle" />
    </StepNodeWrapper>
  );
};

export default StepNode;
