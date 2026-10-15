import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { POST } from '../../Helpers/apiClient';
import { GET_SEQUENCE_FLOW_PATH, LOAD_FLOW_CHILDS } from '../../api';
import Loader from '../../Library/Loader';
import { IoClose, IoArrowBack } from 'react-icons/io5';
import { AiOutlinePartition } from 'react-icons/ai';
import {
  ReactFlow,
  type Node,
  type Edge,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StepNode from './StepNode';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  Step: StepNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const defaultEdge = {
  style: {
    stroke: "#008000",
    strokeWidth: 2,
  }
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(90deg, var(--mes-primary) 0%, var(--mes-primary-600) 35%, var(--mes-secondary) 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  padding: 4px;
  &:hover {
    color: white;
  }
`;

const Content = styled.div`
  flex: 1;
  position: relative;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  padding: 16px 20px;
  background: #fef2f2;
  margin: 20px;
  border-radius: 6px;
`;

interface FlowStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialData: any;
}

const FlowStepsModal: React.FC<FlowStepsModalProps> = ({ isOpen, onClose, materialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);
  const [currentFlow, setCurrentFlow] = useState<any>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  useEffect(() => {
    if (isOpen && materialData) {
      let flowObj = materialData.Flow;
      if (typeof flowObj === 'string') {
        flowObj = { Name: flowObj };
      }
      setWorkflowHistory([]);
      setCurrentFlow(flowObj);
      fetchFlowSteps(flowObj);
    }
  }, [isOpen, materialData]);

  const fetchFlowSteps = async (flowObj: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const cleanFlowObj = {
        $type: "Cmf.Navigo.BusinessObjects.Flow, Cmf.Navigo.BusinessObjects",
        Id: flowObj.Id,
        Name: flowObj.Name,
        IgnoreLastServiceId: true,
        DefinitionId: flowObj.DefinitionId,
        Revision: flowObj.Revision,
        Version: flowObj.Version,
        UniversalState: flowObj.UniversalState
      };

      const payload = {
        $type: "Cmf.Navigo.BusinessOrchestration.FacilityManagement.FlowManagement.InputObjects.LoadFlowChildsInput, Cmf.Navigo.BusinessOrchestration",
        Flow: cleanFlowObj,
        LoadReworkPaths: true,
        ReworkPathsLevelsToLoad: 2,
        IsToIncludeTerminated: false,
        PageNumber: 1,
        PageSize: 100,
        LevelsToLoad: 1
      };

      const result = await POST<any>(LOAD_FLOW_CHILDS, payload);
      
      let parsedSteps: any[] = [];
      const relationCollection = result?.Flow?.RelationCollection?.CMFMapData;
      if (Array.isArray(relationCollection)) {
          const flowStepEntry = relationCollection.find((entry: any) => entry[0] === 'FlowStep');
          const subFlowEntry = relationCollection.find((entry: any) => entry[0] === 'SubFlow');

          if (flowStepEntry && Array.isArray(flowStepEntry[1])) {
              parsedSteps = [...parsedSteps, ...flowStepEntry[1].map((s: any) => ({ ...s, isSubFlow: false }))];
          }
          if (subFlowEntry && Array.isArray(subFlowEntry[1])) {
              parsedSteps = [...parsedSteps, ...subFlowEntry[1].map((s: any) => ({ ...s, isSubFlow: true }))];
          }
      }
      
      // Sort by position
      parsedSteps.sort((a, b) => (a.Position || 0) - (b.Position || 0));
      
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      parsedSteps.forEach((step, index) => {
        const stepName = step?.TargetEntity?.Name || step?.Name || 'Unknown Step';
        
        let isCurrent = false;
        const currentStepName = materialData?.Step?.Name || materialData?.StepName || materialData?.Step || materialData?.Operation;
        
        if (currentStepName && (stepName.includes(currentStepName) || typeof currentStepName === 'string' && currentStepName.includes(stepName))) {
          isCurrent = true;
        }

        if (!isCurrent && materialData?.FlowPath && typeof materialData.FlowPath === "string") {
          const pathNames = materialData.FlowPath.split("/").map((p: string) => p.split(":")[0]);
          isCurrent = pathNames.some((p: string) => p.includes(stepName) || stepName.includes(p));
        }

        const isAlternate = step?.TargetEntity?.IsAlternate === true || step?.IsAlternate === true;

        // Stagger nodes more compactly so they appear larger when fitView scales them
        const xPos = index * 220;
        const yPos = index % 2 === 0 ? 150 : 50;

        newNodes.push({
          id: `node-${index}`,
          type: "Step",
          position: {
            x: xPos,
            y: yPos,
          },
          data: {
            label: stepName,
            isCurrentStep: !!isCurrent,
            isFirstStep: index === 0,
            isSubWorkflow: step.isSubFlow,
            isRework: isAlternate,
            subflowTarget: step.TargetEntity,
          },
        });

        if (index > 0) {
          newEdges.push({
            id: `edge-${index - 1}-${index}`,
            source: `node-${index - 1}`,
            target: `node-${index}`,
            sourceHandle: "right-source",
            targetHandle: "left-target",
            ...defaultEdge,
            type: "custom", // mid-arrow curve
          });
        }
      });

      // Parse Rework Paths
      const reworkPaths = result?.ReworkPaths || result?.Flow?.ReworkPaths || [];
      reworkPaths.forEach((rework: any, rIndex: number) => {
        const sourceStepName = rework?.SourceStep?.Name;
        const gotoStepName = rework?.GotoStep?.Name;
        const returnStepName = rework?.ReturnStep?.Name || gotoStepName;
        const gotoFlow = rework?.GotoFlow;
        const gotoFlowName = gotoFlow?.Name || 'Rework Flow';

        const sourceNodeIndex = parsedSteps.findIndex(s => (s?.TargetEntity?.Name || s?.Name) === sourceStepName);
        const returnNodeIndex = parsedSteps.findIndex(s => (s?.TargetEntity?.Name || s?.Name) === returnStepName);
        let gotoNodeIndex = parsedSteps.findIndex(s => (s?.TargetEntity?.Name || s?.Name) === gotoStepName);

        const isSameFlow = !gotoFlow || gotoFlow?.Id === flowObj?.Id || gotoFlow?.Name === flowObj?.Name;

        console.log(`Rework Debug [${rIndex}]:`, {
           sourceStepName, gotoStepName, gotoFlowName, 
           flowObjName: flowObj?.Name, 
           gotoNodeIndex, isSameFlow 
        });

        if (isSameFlow && gotoNodeIndex === -1) {
           // If it routes to the same flow but we can't find the step (or it's not specified),
           // route it to the Start (first step)
           gotoNodeIndex = 0;
        }

        if (sourceNodeIndex !== -1) {
          if (isSameFlow && gotoNodeIndex !== -1) {
            // In-flow rework: Draw bezier curved arrow back to the GotoStep using side handles
            newEdges.push({
              id: `edge-rw-inflow-${rIndex}`,
              source: `node-${sourceNodeIndex}`,
              target: `node-${gotoNodeIndex}`,
              sourceHandle: "top-source",
              targetHandle: "top-target",
              ...defaultEdge,
              type: "custom",
              animated: true,
              style: { stroke: '#ef4444', strokeWidth: 2 },
            });
          } else {
            // Out-of-flow rework: Create Rework Box
            const reworkNodeId = `rework-${rIndex}`;
            
            newNodes.push({
              id: reworkNodeId,
              type: "Step",
              position: { x: sourceNodeIndex * 220, y: 250 },
              data: {
                label: `${gotoFlowName} (Rework)`,
                isCurrentStep: false,
                isFirstStep: false,
                isSubWorkflow: true,
                isRework: true,
                subflowTarget: gotoFlow,
              },
            });

            newEdges.push({
              id: `edge-rw-src-${rIndex}`,
              source: `node-${sourceNodeIndex}`,
              target: reworkNodeId,
              sourceHandle: "right-source",
              targetHandle: "left-target",
              ...defaultEdge,
              type: "custom",
              animated: true,
              style: { stroke: '#ef4444', strokeWidth: 2 },
            });

            // Removed return edge based on user feedback
          }
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
      setIsLoading(false);

    } catch (err: any) {
      console.error("Failed to fetch flow steps:", err);
      // Suppress inline 401 errors since the global session interceptor handles it
      if (err?.response?.status === 401 || String(err?.message || '').includes('401')) {
        // Keep loading state active so the UI doesn't look empty behind the popup
        return;
      }
      setError(err.message || "Failed to load workflow chart.");
      setIsLoading(false);
    }
  };

  const onNodeClick = useCallback((_event: any, node: Node) => {
    const data = node.data as any;
    if (data.isSubWorkflow && data.subflowTarget) {
      setWorkflowHistory(hist => [...hist, currentFlow]);
      setCurrentFlow(data.subflowTarget);
      fetchFlowSteps(data.subflowTarget);
    }
  }, [currentFlow]);

  const handleBack = () => {
    setWorkflowHistory(hist => {
      if (hist.length === 0) return hist;
      const prevFlow = hist[hist.length - 1];
      setCurrentFlow(prevFlow);
      fetchFlowSteps(prevFlow);
      return hist.slice(0, -1);
    });
  };

  const flowName = currentFlow?.Name || (typeof currentFlow === 'string' ? currentFlow : 'Flow');
  const flowRevision = currentFlow?.Revision;
  const displayTitle = flowRevision ? `${flowName} [${flowRevision}]` : flowName;

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            {workflowHistory.length > 0 && (
              <CloseButton onClick={handleBack} style={{ marginRight: '8px' }}>
                <IoArrowBack />
              </CloseButton>
            )}
            <AiOutlinePartition style={{ color: "white" }} />
            {displayTitle}
          </Title>
          <CloseButton onClick={onClose}><IoClose /></CloseButton>
        </Header>
        <Content>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader />
            </div>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              panOnDrag
              zoomOnScroll
              zoomOnPinch
              minZoom={0.3}
              maxZoom={2}
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>No steps found.</div>
          )}
        </Content>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default FlowStepsModal;
