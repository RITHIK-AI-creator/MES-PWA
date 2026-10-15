import React, { useCallback, useRef, useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import { GET_MATERIAL_BASIC_INFO, LOAD_STEPS_RELATIONS, LOAD_FLOW_CHILDS, GET_DATA_REWORK_WIZARD, COMPLEX_REWORK_MATERIAL, TEMPORARY_OFF_FLOW_MATERIALS, EXECUTE_QUERY } from "../../api";
import { TextField } from "@mui/material";
import Button from "../../Library/Button";
import Loader from "../../Library/Loader";
import Toast from "../../components/Toast";
import WipDataCard from "../../components/WipDataCard";
import DropDown from "../../Library/DropDown";
import FlowStepsModal from "../../components/FlowStepsModal";
import { ReactFlow, type Node, type Edge, MarkerType, applyNodeChanges, applyEdgeChanges, type OnNodesChange, type OnEdgesChange } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StepNode from "../../components/FlowStepsModal/StepNode";
import { IoArrowBack } from "react-icons/io5";
const nodeTypes = { Step: StepNode };
const defaultEdge = { style: { stroke: "#008000", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#008000" } };
const findObjectByRef = (obj: any, ref: string): any => {
  if (!obj || !ref)
    return null;
  if (typeof obj !== "object") {
    return null;
  }
  if (obj.$id === ref) {
    return obj;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findObjectByRef(item, ref);
      if (result) {
        return result;
      }
    }
    return null;
  }
  for (const key of Object.keys(obj)) {
    const result = findObjectByRef(obj[key], ref);
    if (result) {
      return result;
    }
  }
  return null;
};
const TemporaryOffFlowPage = () => {
  const [tempoffflowReason, setTempoffflowReason] = useState<string>("");
  const [goToFlowPath, setGoToFlowPath] = useState<string[]>([]);
  const [returnFlowPath, setReturnFlowPath] = useState("");
  const [returnFlowDisplayPath, setReturnFlowDisplayPath] = useState("");
  const [goToFlowPathValue, setGoToFlowPathValue] = useState("");
  const flowPathBeforeSelectionRef = useRef("");
  const returnFlowDisplayPathBeforeSelectionRef = useRef("");
  const flowPathSelectionModeRef = useRef<"flow" | "return">("flow");
  const [selectedFlowPath, setSelectedFlowPath] = useState("");
  const [selectedFlowStep, setSelectedFlowStep] = useState("");
  const [tempoffflowStepName, setTempoffflowStepName] = useState("");
  const [isTempoffflowModalOpen, setIsTempoffflowModalOpen] = useState(false);
  const [goToStep, setGoToStep] = useState("");
  const [goToStepOptions, setGoToStepOptions] = useState<{
    label: string;
    value: string;
    sequence?: number;
  }[]>([]);
  const [isFlowPathModalOpen, setIsFlowPathModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [lotName, setLotName] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempoffflowData, setTempoffflowData] = useState<any>(null);
  const [tempoffflowReasonError, setTempoffflowReasonError] = useState(false);
  const [tempoffflowReasonOptions, setTempoffflowReasonOptions] = useState<{ label: string; value: string; }[]>([]);
  const [materialTempoffflowReasons, setMaterialTempoffflowReasons] = useState<any[]>([]);
  const [flowPathOptions, setFlowPathOptions] = useState<{ label: string; value: string; }[]>([]);
  const [flowQueryResults, setFlowQueryResults] = useState<any[]>([]);
  const [flowName, setFlowName] = useState("");
  const [flowSteps, setFlowSteps] = useState<any[]>([]);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [goToFlowPathError, setGoToFlowPathError] = useState(false);
  const [goToStepError, setGoToStepError] = useState(false);
  const [tempoffflowWizardPath, setTempoffflowWizardPath] = useState<any>(null);
  const [currentFlowPathFlow, setCurrentFlowPathFlow] = useState<any>(null);
  const [flowWorkflowHistory, setFlowWorkflowHistory] = useState<any[]>([]);
  const [lastFlowPathDisplay, setLastFlowPathDisplay] = useState("");
  const [toasts, setToasts] = useState<{ id: number; variant: "success" | "error"; message: string; }[]>([]);
  const [goToMainFlow, setGoToMainFlow] = useState<any>(null);
  const [isGoToStepLocked, setIsGoToStepLocked] = useState(false);
  const [goToFlowHasSubFlow, setGoToFlowHasSubFlow] = useState(false);
  const [selectedGoToFlowPath, setSelectedGoToFlowPath] = useState("");
  const [mainFlowSteps, setMainFlowSteps] = useState<any[]>([]);
  const [firstSubFlowStepCount, setFirstSubFlowStepCount] = useState(0);
  const showToast = (variant: "success" | "error", message: string) => {
    setToasts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        variant,
        message
      }
    ]);
  };
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  const onNodesChange: OnNodesChange = useCallback((changes) => setFlowNodes((nodes) => applyNodeChanges(changes, nodes)), []);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setFlowEdges((edges) => applyEdgeChanges(changes, edges)), []);
  const getFlowPathDisplay = (path: string) => {
    if (!path) {
      return "";
    }
    return String(path)
      .split("/")
      .filter(Boolean)
      .map((part: string) => part
        .replace(/^(.+):([A-Z]):\d+$/, "$1 [$2]")
        .replace(/^(.+):\d+$/, "$1"))
      .join(" > ");
  };
  const buildFlowPathNodes = (steps: any[], loadedTempoffflowPaths: any[] = []) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    steps.forEach((step: any, index: number) => {
      const stepName = step?.TargetEntity?.Name || step?.Name || "Unknown Step";
      const currentStepName = tempoffflowData?.Step?.Name || tempoffflowData?.StepName || tempoffflowData?.Step;
      const stepId = step?.TargetEntity?.Id || step?.Id || "";
      const isSelected = !!goToStep && !!stepId && String(stepId) === String(goToStep);
      const isCurrent = (currentStepName && stepName.includes(currentStepName)) || isSelected;
      const isAlternate = step?.TargetEntity?.IsAlternate === true || step?.IsAlternate === true;
      newNodes.push({
        id: `node-${index}`,
        type: "Step",
        position: {
          x: 100,
          y: index * 100
        },
        data: {
          label: stepName,
          isCurrentStep: !!isCurrent,
          isFirstStep: index === 0,
          isSubWorkflow: step?.isSubFlow === true,
          isRework: isAlternate,
          subflowTarget: step?.TargetEntity
        }
      });
      if (index > 0) {
        newEdges.push({
          id: `edge-${index - 1}-${index}`,
          source: `node-${index - 1}`,
          target: `node-${index}`,
          sourceHandle: "bottom",
          targetHandle: "top",
          ...defaultEdge
        });
      }
    });
    loadedTempoffflowPaths.forEach((tempoffflow: any, rIndex: number) => {
      const sourceStepName = tempoffflow?.SourceStep?.Name;
      const returnStepName = tempoffflow?.ReturnStep?.Name;
      const gotoFlow = tempoffflow?.GotoFlow;
      const gotoFlowName = gotoFlow?.Name || "Tempoffflow Flow";
      const sourceNodeIndex = steps.findIndex((step: any) => (step?.TargetEntity?.Name || step?.Name) === sourceStepName);
      const returnNodeIndex = steps.findIndex((step: any) => (step?.TargetEntity?.Name || step?.Name) === returnStepName);
      const resolvedSourceNodeIndex = sourceNodeIndex !== -1 ? sourceNodeIndex : steps.findIndex((step: any) => { const name = step?.TargetEntity?.Name || step?.Name || ""; return (String(name).toLowerCase() === String(sourceStepName || "").toLowerCase()); });
      const resolvedReturnNodeIndex = returnNodeIndex !== -1 ? returnNodeIndex : steps.findIndex((step: any) => { const name = step?.TargetEntity?.Name || step?.Name || ""; return (String(name).toLowerCase() === String(returnStepName || "").toLowerCase()); });
      if (resolvedSourceNodeIndex !==
        -1) {
        const tempoffflowNodeId = `tempoffflow-${rIndex}`;
        const sourceNodeY = resolvedSourceNodeIndex * 100;
        newNodes.push({
          id: tempoffflowNodeId,
          type: "Step",
          position: {
            x: 350,
            y: sourceNodeY + 50
          },
          data: {
            label: `${gotoFlowName} (Tempoffflow)`,
            isCurrentStep: false,
            isFirstStep: false,
            isSubWorkflow: true,
            isRework: true,
            subflowTarget: gotoFlow
          }
        });
        newEdges.push({
          id: `edge-rw-src-${rIndex}`,
          source: `node-${resolvedSourceNodeIndex}`,
          target: tempoffflowNodeId,
          sourceHandle: "bottom",
          targetHandle: "top",
          ...defaultEdge,
          animated: true,
          style: {
            stroke: "#ef4444",
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#ef4444"
          }
        });
        if (resolvedReturnNodeIndex !==
          -1) {
          newEdges.push({
            id: `edge-rw-ret-${rIndex}`,
            source: tempoffflowNodeId,
            target: `node-${resolvedReturnNodeIndex}`,
            sourceHandle: "bottom",
            targetHandle: "top",
            ...defaultEdge,
            animated: true,
            style: {
              stroke: "#ef4444",
              strokeWidth: 2
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#ef4444"
            }
          });
        }
      }
    });
    return {
      nodes: newNodes,
      edges: newEdges
    };
  };
  const fetchFlowPathSteps = async (flowObj: any) => {
    if (!flowObj?.Id) {
      throw new Error("Flow information is not available.");
    }
    const cleanFlowObj = { $type: "Cmf.Navigo.BusinessObjects.Flow, Cmf.Navigo.BusinessObjects", Id: flowObj.Id, Name: flowObj.Name, IgnoreLastServiceId: true, DefinitionId: flowObj.DefinitionId, Revision: flowObj.Revision, Version: flowObj.Version, UniversalState: flowObj.UniversalState };
    const payload = { $type: "Cmf.Navigo.BusinessOrchestration.FacilityManagement.FlowManagement.InputObjects.LoadFlowChildsInput, Cmf.Navigo.BusinessOrchestration", Flow: cleanFlowObj, LoadReworkPaths: true, ReworkPathsLevelsToLoad: 10, IsToIncludeTerminated: false, PageNumber: 1, PageSize: 100, LevelsToLoad: 10 };
    const result = await POST<any>(LOAD_FLOW_CHILDS, payload);
    let parsedSteps: any[] = [];
    const relationCollection = result?.Flow?.RelationCollection?.CMFMapData;
    if (Array.isArray(relationCollection)) {
      const flowStepEntry = relationCollection.find((entry: any) => entry[0] === "FlowStep");
      const subFlowEntry = relationCollection.find((entry: any) => entry[0] === "SubFlow");
      if (flowStepEntry &&
        Array.isArray(flowStepEntry[1])) {
        parsedSteps = [
          ...parsedSteps,
          ...flowStepEntry[1].map((step: any) => ({
            ...step,
            isSubFlow: false
          }))
        ];
      }
      if (subFlowEntry &&
        Array.isArray(subFlowEntry[1])) {
        parsedSteps = [
          ...parsedSteps,
          ...subFlowEntry[1].map((step: any) => ({
            ...step,
            isSubFlow: true
          }))
        ];
      }
    }
    parsedSteps.sort((a: any, b: any) => (a?.Position || 0) -
      (b?.Position || 0));
    const loadedTempoffflowPaths = result?.ReworkPaths || result?.Flow?.ReworkPaths || [];
    const safeTempoffflowPaths = Array.isArray(loadedTempoffflowPaths) ? loadedTempoffflowPaths : [];
    const { nodes, edges } = buildFlowPathNodes(parsedSteps, safeTempoffflowPaths);
    return {
      loadedFlow: result?.Flow ||
        flowObj,
      loadedFlowSteps: parsedSteps,
      loadedReworkPaths: safeTempoffflowPaths,
      nodes,
      edges
    };
  };
  const findGoToStepInFlowHierarchy = async (flowObj: any, goToStepId: string, visitedFlowIds = new Set<string>()): Promise<any | null> => {
    if (!flowObj?.Id ||
      !goToStepId) {
      return null;
    }
    const flowId = String(flowObj.Id);
    if (visitedFlowIds.has(flowId)) {
      return null;
    }
    visitedFlowIds.add(flowId);
    const flowDetails = await fetchFlowPathSteps(flowObj);
    const loadedFlowSteps = flowDetails.loadedFlowSteps || [];
    const matchingStep = loadedFlowSteps.find((step: any) => {
      const stepId = step?.TargetEntity?.Id || step?.Id;
      return (stepId &&
        String(stepId) ===
        String(goToStepId));
    });
    if (matchingStep) {
      return matchingStep;
    }
    for (const step of loadedFlowSteps) {
      if (step?.isSubFlow !== true) {
        continue;
      }
      const subFlow = step?.TargetEntity;
      if (!subFlow?.Id) {
        continue;
      }
      const result = await findGoToStepInFlowHierarchy(subFlow, goToStepId, visitedFlowIds);
      if (result) {
        return {
          ...result,
          isInsideSubFlow: true
        };
      }
    }
    return null;
  };
  const updateFlowPathTitle = (flowObj: any) => {
    const loadedFlowName = flowObj?.Name || "";
    const flowRevision = flowObj?.Revision;
    const displayTitle = flowRevision !== undefined && flowRevision !== null && String(flowRevision) !== "" ? `${loadedFlowName} [${flowRevision}]` : loadedFlowName;
    setFlowName(String(displayTitle));
  };

  const fetchGoToStepOptions = async (flowNameValue: string) => {
    if (!flowNameValue) {
      setGoToStepOptions([]);
      setGoToStep("");
      setGoToFlowHasSubFlow(false);
      setIsGoToStepLocked(false);
      return;
    }
    const selectedFlow = flowQueryResults.find((flow: any) => String(flow?.Name) === String(flowNameValue));
    if (!selectedFlow) {
      setGoToStepOptions([]);
      setGoToStep("");
      setGoToFlowHasSubFlow(false);
      setIsGoToStepLocked(false);
      return;
    }

    const selectedFlowId = selectedFlow?.Id || selectedFlow?.FlowId;
    if (!selectedFlowId) {
      setGoToStepOptions([]);
      setGoToStep("");
      setGoToFlowHasSubFlow(false);
      setIsGoToStepLocked(false);
      showToast("error", "Flow ID is not available for the selected Go To Flow Path.");
      return;
    }
    const cleanSelectedFlow = { $type: "Cmf.Navigo.BusinessObjects.Flow, Cmf.Navigo.BusinessObjects", Id: selectedFlowId, Name: selectedFlow.Name, IgnoreLastServiceId: true, DefinitionId: selectedFlow.DefinitionId, Revision: selectedFlow.Revision, Version: selectedFlow.Version, UniversalState: selectedFlow.UniversalState };
    const stepPayload = { $type: "Cmf.Navigo.BusinessOrchestration.FacilityManagement.FlowManagement.InputObjects.LoadFlowChildsInput, Cmf.Navigo.BusinessOrchestration", Flow: cleanSelectedFlow, LoadReworkPaths: false, ReworkPathsLevelsToLoad: 0, IsToIncludeTerminated: false, PageNumber: 1, PageSize: 100, LevelsToLoad: 10 };
    try {
      const stepResponse = await POST<any>(LOAD_FLOW_CHILDS, stepPayload);
      const actualSelectedFlow = stepResponse?.Flow;

      if (!actualSelectedFlow?.Id) {
        throw new Error(
          "Actual selected Flow ID was not returned from LOAD_FLOW_CHILDS."
        );
      }

      setGoToMainFlow(actualSelectedFlow);
      const relationCollection = stepResponse?.Flow?.RelationCollection?.CMFMapData;
      const flowStepEntry = Array.isArray(relationCollection) ? relationCollection.find((entry: any) => Array.isArray(entry) && entry[0] === "FlowStep") : null;
      const subFlowEntry = Array.isArray(relationCollection) ? relationCollection.find((entry: any) => Array.isArray(entry) && entry[0] === "SubFlow") : null;
      const directSteps = Array.isArray(flowStepEntry?.[1]) ? flowStepEntry[1] : [];
      const subFlows = Array.isArray(subFlowEntry?.[1]) ? subFlowEntry[1] : [];

      if (subFlows.length > 0) {
        setGoToFlowHasSubFlow(true);
        setGoToStepOptions([]);
        setGoToStep("");
        setIsGoToStepLocked(false);
        return;
      }

      setGoToFlowHasSubFlow(false);
      setIsGoToStepLocked(false);
      const stepOptions: {
        label: string;
        value: string;
        sequence?: number;
      }[] = [];
      directSteps.forEach((step: any) => {
        const target = step?.TargetEntity || step;

        if (!target?.Id || !target?.Name) {
          return;
        }
        const stepSequence =
          step?.Position ??
          target?.Position ??
          step?.Sequence ??
          target?.Sequence ??
          step?.StepSequence ??
          target?.StepSequence;

        stepOptions.push({
          label: String(target.Name),
          value: String(target.Id),
          sequence:
            stepSequence !== undefined &&
              stepSequence !== null
              ? Number(stepSequence)
              : undefined
        });
      });
      setGoToStepOptions(stepOptions);
    }
    catch (err: any) {
      console.error("Failed to load Go To Step options:", err);
      setGoToStepOptions([]);
      setGoToStep("");
      setGoToFlowHasSubFlow(false);
      setIsGoToStepLocked(false);
      const errorMessage = err?.response?.data?.Message || err?.response?.data?.message || err?.message || "Failed to load steps for the selected flow.";
      showToast("error", errorMessage);
    }
  };

  const fetchTempoffflowDetails = async (nameToFetch: string) => {
    if (!nameToFetch.trim()) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setToasts([]);
    setTempoffflowData(null);
    setTempoffflowReason("");
    setGoToFlowPath([]);
    setGoToFlowPathValue("");
    setGoToStep("");
    setSelectedGoToFlowPath("");
    setGoToStepOptions([]);
    setReturnFlowPath("");
    setReturnFlowDisplayPath("");
    setSelectedFlowPath("");
    setSelectedFlowStep("");
    setTempoffflowStepName("");
    setTempoffflowReasonError(false);
    setGoToFlowPathError(false);
    setGoToStepError(false);
    setTempoffflowReasonOptions([]);
    setMaterialTempoffflowReasons([]);
    setFlowPathOptions([]);
    setFlowQueryResults([]);
    setFlowName("");
    setFlowSteps([]);
    setFlowNodes([]);
    setFlowEdges([]);
    setTempoffflowWizardPath(null);
    setCurrentFlowPathFlow(null);
    setFlowWorkflowHistory([]);
    setLastFlowPathDisplay("");
    setGoToMainFlow(null);
    setGoToFlowHasSubFlow(false);
    setIsGoToStepLocked(false);
    setIsTempoffflowModalOpen(false);
    setIsFlowPathModalOpen(false);
    try {
      const queryPayload = { QueryObject: { $type: "Cmf.Foundation.BusinessObjects.QueryObject.QueryObject, Cmf.Foundation.BusinessObjects", EntityTypeName: "Material", Query: { Distinct: false, Filters: [{ Name: "Name", ObjectName: "Material", Operator: 0, Value: nameToFetch.trim(), LogicalOperator: 1 }], Fields: [{ Name: "Id", ObjectName: "Material", Alias: "Id" }] } }, PageNumber: 1, PageSize: 1 };
      const queryResponse = await POST<any>(EXECUTE_QUERY, queryPayload);
      let materialId: any = null;
      if (queryResponse
        ?.NgpDataSet
        ?.T_Result?.[0]
        ?.Id) {
        materialId =
          queryResponse
            .NgpDataSet
            .T_Result[0]
            .Id;
      }
      else if (Array.isArray(queryResponse) &&
        queryResponse[0]?.Id) {
        materialId =
          queryResponse[0].Id;
      }
      if (!materialId) {
        throw new Error("Material not found for the entered material number.");
      }
      const infoPayload = { $id: "1", $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialBasicInformationInput, Cmf.Navigo.BusinessOrchestration", Material: { $id: "2", $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects", Id: materialId }, IsLoadRelationsToContainer: true, IsLoadRelationsToResource: true, IsToLoadResourceDurables: true, IsLoadTopMost: true, LevelsToLoad: 2, RelationsToContainerLevelsToLoad: 1, RelationsToResourceLevelsToLoad: 2, RelationsToResourceDurableLevelsToLoad: 1, TopMostLevelsToLoad: 1, RecipeInstanceLevelsToLoad: 2 };
      const materialResponse = await POST<any>(GET_MATERIAL_BASIC_INFO, infoPayload);
      let data = materialResponse;
      if (materialResponse?.Material) {
        data =
          materialResponse.Material;
      }
      else if (materialResponse
        ?.Data
        ?.Material) {
        data =
          materialResponse.Data.Material;
      }
      else if (materialResponse
        ?.Entities?.[0]) {
        data =
          materialResponse
            .Entities[0];
      }
      setTempoffflowData(data);
      const materialName = data?.Name || nameToFetch.trim();


      let reasons: any[] = [];
      setMaterialTempoffflowReasons(reasons);
      const reasonOptions = reasons.map((reason: any) => { const targetEntity = reason?.TargetEntity; if (!targetEntity?.Id || !targetEntity?.Name) { return null; } return { label: String(targetEntity.Name), value: String(targetEntity.Id) }; }).filter(Boolean) as {
        label: string;
        value: string;
      }[];

      const stepId = data?.Step?.Id;
      let stepTempoffflowReasons: any[] = [];
      if (stepId) {
        const stepRelationsPayload = { $type: "Cmf.Navigo.BusinessOrchestration.FacilityManagement.FlowManagement.InputObjects.LoadStepRelationsInput, Cmf.Navigo.BusinessOrchestration", Step: { $type: "Cmf.Navigo.BusinessObjects.Step, Cmf.Navigo.BusinessObjects", Id: stepId }, LevelsToLoad: 2, IgnoreLastServiceId: true };
        const stepRelationsResponse = await POST<any>(LOAD_STEPS_RELATIONS, stepRelationsPayload);
        const stepRelationData = stepRelationsResponse?.Step?.RelationCollection?.CMFMapData;
        if (Array.isArray(stepRelationData)) {
          const stepReasonRelation = stepRelationData.find((item: any) => Array.isArray(item) && item[0] === "StepReason");
          if (Array.isArray(stepReasonRelation?.[1])) {
            stepTempoffflowReasons =
              stepReasonRelation[1].filter((reason: any) => reason?.ApplicableToTemporaryOffFlow ===
                true);
          }
        }
      }
      const stepTempoffflowReasonOptions = stepTempoffflowReasons.map((reason: any) => { const targetEntity = reason?.TargetEntity; if (!targetEntity?.Id || !targetEntity?.Name) { return null; } return { label: String(targetEntity.Name), value: String(targetEntity.Id) }; }).filter(Boolean) as {
        label: string;
        value: string;
      }[];
      const combinedReasonOptions = [...reasonOptions, ...stepTempoffflowReasonOptions].filter((option, index, array) => array.findIndex((item) => item.value === option.value) === index);
      setTempoffflowReasonOptions(combinedReasonOptions);

      const tempoffflowWizardPayload = { $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetDataForReworkWizardInput, Cmf.Navigo.BusinessOrchestration", Material: { Id: materialId, Name: materialName, Step: { Id: stepId } }, IgnoreLastServiceId: true };
      const tempoffflowWizardResponse = await POST<any>(GET_DATA_REWORK_WIZARD, tempoffflowWizardPayload);
      const tempoffflowPathCollection = Array.isArray(tempoffflowWizardResponse?.ReworkPathCollection) ? tempoffflowWizardResponse.ReworkPathCollection : tempoffflowWizardResponse?.ReworkPathCollection?.$values || [];
      const tempoffflowPath = tempoffflowPathCollection[0] || null;

      const flowQueryPayload = { $type: "Cmf.Foundation.BusinessOrchestration.QueryManagement.InputObjects.ExecuteQueryInput, Cmf.Foundation.BusinessOrchestration", QueryObject: { $type: "Cmf.Foundation.BusinessObjects.QueryObject.QueryObject, Cmf.Foundation.BusinessObjects", EntityTypeName: "Flow", Query: { $type: "Cmf.Foundation.BusinessObjects.QueryObject.Query, Cmf.Foundation.BusinessObjects", EntityFilter: [{ $type: "Cmf.Foundation.BusinessObjects.QueryObject.EntityFilter, Cmf.Foundation.BusinessObjects", Alias: "Flow_Alias", EntityType: "Flow", Filter: [{ $type: "Cmf.Foundation.BusinessObjects.QueryObject.Filter, Cmf.Foundation.BusinessObjects", Name: "UniversalState", Operator: 0, Value: 3, LogicalOperator: 1 }, { $type: "Cmf.Foundation.BusinessObjects.QueryObject.Filter, Cmf.Foundation.BusinessObjects", Name: "IsTemplate", Operator: 0, Value: 0, LogicalOperator: 1 }, { $type: "Cmf.Foundation.BusinessObjects.QueryObject.Filter, Cmf.Foundation.BusinessObjects", Name: "UniversalState", Operator: 1, Value: 4, LogicalOperator: 1 }, { $type: "Cmf.Foundation.BusinessObjects.QueryObject.Filter, Cmf.Foundation.BusinessObjects", Name: "Version", Operator: 0, Value: 0, LogicalOperator: 1 }, { $type: "Cmf.Foundation.BusinessObjects.QueryObject.Filter, Cmf.Foundation.BusinessObjects", Name: "IsDefaultRevision", Operator: 0, Value: true, LogicalOperator: 1 }] }] } } };
      const flowQueryResponse = await POST<any>(EXECUTE_QUERY, flowQueryPayload);

      const flowResults = flowQueryResponse?.NgpDataSet?.T_Result || [];
      setFlowQueryResults(flowResults);
      const flowOptions = flowResults.filter((flow: any) => flow?.Name).map((flow: any) => ({ label: String(flow.Name), value: String(flow.Name) })).sort((a: { label: string; value: string; }, b: { label: string; value: string; }) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
      setFlowPathOptions(flowOptions);
      setTempoffflowWizardPath(tempoffflowPath);
      let hasBlockingIssue = false;

      if (tempoffflowPath) {
        const gotoStepRef = tempoffflowPath?.GotoStep?.$ref;
        const gotoStep = gotoStepRef ? findObjectByRef(tempoffflowWizardResponse, gotoStepRef) : tempoffflowPath?.GotoStep;
        const gotoStepName = gotoStep?.Name || "";
        const gotoStepId = gotoStep?.Id || "";
        const gotoFlowPath = tempoffflowPath?.GotoFlowPath || "";
        if (gotoFlowPath) {
          setSelectedGoToFlowPath(String(gotoFlowPath));
        }
        let resolvedGotoStepName = String(gotoStepName);
        if (gotoStepId &&
          data?.Flow?.Id) {
          const matchingGotoStep = await findGoToStepInFlowHierarchy(data.Flow, gotoStepId);
          const gotoStepPosition = matchingGotoStep?.Position;
          const isInsideSubFlow = matchingGotoStep?.isInsideSubFlow === true;
          if (isInsideSubFlow &&
            gotoStepPosition !==
            undefined &&
            gotoStepPosition !==
            null) {
            resolvedGotoStepName =
              `${gotoStepName}:${gotoStepPosition}`;
          }
          else {
            resolvedGotoStepName =
              String(gotoStepName);
          }
        }
        setTempoffflowStepName(resolvedGotoStepName);
        const gotoFlowDisplay = getFlowPathDisplay(String(gotoFlowPath));
        setGoToFlowPathValue("");
        setGoToFlowPath([]);

        let initialMainFlow: any = null;
        if (gotoFlowPath) {
          const pathParts = String(gotoFlowPath).split("/").filter(Boolean);
          const firstPathPart = pathParts[0] || "";
          const cleanedFirstFlowName = firstPathPart.replace(/^(.+):([A-Z]):\d+$/, "$1").replace(/^(.+):\d+$/, "$1");
          initialMainFlow =
            flowResults.find((flow: any) => String(flow?.Name) ===
              String(cleanedFirstFlowName));
        }

        if (!initialMainFlow &&
          tempoffflowPath?.GotoFlow
            ?.Id) {
          initialMainFlow =
            tempoffflowPath.GotoFlow;
        }

        if (!initialMainFlow &&
          data?.Flow?.Id) {
          initialMainFlow =
            data.Flow;
        }
        if (initialMainFlow) {
          setGoToMainFlow(null);
          setGoToFlowPathValue("");
          setGoToFlowPath([]);

          const initialMainFlowName = String(initialMainFlow?.Name || "");

          const gotoDisplayParts = String(gotoFlowPath || "")
            .split("/")
            .filter(Boolean)
            .map((part: string) =>
              part
                .replace(/^(.+):([A-Z]):\d+$/, "$1")
                .replace(/^(.+):\d+$/, "$1")
            );

          if (resolvedGotoStepName) {
            const lastPart =
              gotoDisplayParts[gotoDisplayParts.length - 1] || "";

            if (
              lastPart !== resolvedGotoStepName &&
              !lastPart.endsWith(resolvedGotoStepName)
            ) {
              gotoDisplayParts.push(resolvedGotoStepName);
            }
          }

          const initialGotoDisplay =
            gotoDisplayParts.length
              ? gotoDisplayParts.join(" > ")
              : [initialMainFlowName, resolvedGotoStepName]
                .filter(Boolean)
                .join(" > ");


          setLastFlowPathDisplay(initialGotoDisplay);
        }

        setIsGoToStepLocked(false);

        const configuredReturnFlowPath = tempoffflowPath?.ReturnFlowPath || "";
        const returnFlowPathParts = String(configuredReturnFlowPath).split("/").filter(Boolean);
        const formattedReturnFlowParts = returnFlowPathParts.map((part: string) => part.replace(/^(.+):([A-Z]):\d+$/, "$1"));
        const returnStepId = tempoffflowPath?.ReturnStep?.Id || tempoffflowPath?.SourceStep?.Id || "";
        const returnStepName = tempoffflowPath?.ReturnStep?.Name || tempoffflowPath?.SourceStep?.Name || "";
        let returnStepDisplay = returnStepName || (formattedReturnFlowParts.length > 0 ? formattedReturnFlowParts[formattedReturnFlowParts.length - 1] : "");
        if (returnStepId &&
          data?.Flow?.Id) {
          const matchingReturnStep = await findGoToStepInFlowHierarchy(data.Flow, returnStepId);
          const returnStepPosition = matchingReturnStep?.Position;
          const isInsideSubFlow = matchingReturnStep?.isInsideSubFlow === true;
          if (isInsideSubFlow &&
            returnStepPosition !==
            undefined &&
            returnStepPosition !==
            null) {
            returnStepDisplay =
              `${returnStepName}:${returnStepPosition}`;
          }
          else {
            returnStepDisplay =
              returnStepName;
          }
        }
        const returnFlowDisplay = formattedReturnFlowParts[0] || data?.Flow?.Name || "";
        setSelectedFlowPath(returnFlowDisplay);
        setSelectedFlowStep(returnStepDisplay);
        const sourceFlowVersion = tempoffflowPath?.SourceFlowVersion;
        const sourceFlowName = sourceFlowVersion?.Name || data?.Flow?.Name || "";
        const sourceFlowRevision = sourceFlowVersion?.Revision !== undefined && sourceFlowVersion?.Revision !== null ? String(sourceFlowVersion.Revision) : "";
        const flowDisplayName = sourceFlowRevision ? `${sourceFlowName} [${sourceFlowRevision}]` : sourceFlowName;
        const logicalReturnParts = formattedReturnFlowParts.length > 0 ? [...formattedReturnFlowParts] : configuredReturnFlowPath ? getFlowPathDisplay(String(configuredReturnFlowPath)).split(" > ").filter(Boolean) : [sourceFlowName];
        if (logicalReturnParts.length >
          0 &&
          returnStepName) {
          logicalReturnParts[logicalReturnParts.length -
            1] =
            returnStepName;
        }
        const initialReturnFlowDisplayParts = returnFlowPathParts.map((part: string, index: number) => {
          const revisionMatch = part.match(/^(.+):([A-Z]):\d+$/);
          if (revisionMatch) {
            return `${revisionMatch[1]} [${revisionMatch[2]}]`;
          }
          const stepMatch = part.match(/^(.+):\d+$/);
          if (stepMatch) {
            return stepMatch[1];
          }
          const cleanPart = part.replace(/^(.+):([A-Z]):\d+$/, "$1");
          return index ===
            0 &&
            sourceFlowRevision &&
            cleanPart ===
            sourceFlowName
            ? flowDisplayName
            : cleanPart;
        });
        if (initialReturnFlowDisplayParts.length ===
          0) {
          initialReturnFlowDisplayParts.push(flowDisplayName);
        }
        else if (sourceFlowRevision &&
          initialReturnFlowDisplayParts[0] ===
          sourceFlowName) {
          initialReturnFlowDisplayParts[0] =
            flowDisplayName;
        }
        if (returnStepName &&
          initialReturnFlowDisplayParts.length >
          0) {
          initialReturnFlowDisplayParts[initialReturnFlowDisplayParts.length -
            1] =
            returnStepName;
        }
        setReturnFlowPath("");
        setReturnFlowDisplayPath(initialReturnFlowDisplayParts.join(" > "));
        setFlowName(String(flowDisplayName));
        setFlowSteps([]);
        setFlowNodes([]);
        setFlowEdges([]);
      }
      else {
        hasBlockingIssue =
          true;
        setGoToFlowPath([]);
        setGoToFlowPathValue("");
        setGoToStep("");
        setGoToStepOptions([]);
        setReturnFlowPath("");
        setReturnFlowDisplayPath("");
        setSelectedFlowPath("");
        setSelectedFlowStep("");
        setTempoffflowStepName("");
        setFlowName("");
        setFlowSteps([]);
        setFlowNodes([]);
        setFlowEdges([]);
        setGoToMainFlow(null);
        setGoToFlowHasSubFlow(false);
        setIsGoToStepLocked(false);
        if (combinedReasonOptions.length ===
          0) {
          const currentStepName = data?.Step?.Name || "Unknown";
          showToast("error", `There are no Temporary Off-Flow Reasons defined  for Step ${currentStepName}.`);
        }
        else {
          showToast("error", "There are no Temporary Off-Flow Reasons defined.");
        }
      }
      if (!hasBlockingIssue) {
        setIsTempoffflowModalOpen(true);
      }
      else {
        setIsTempoffflowModalOpen(false);
      }
    }
    catch (err: any) {
      console.error("Failed to load tempoffflow details:", err);
      setTempoffflowData(null);
      setTempoffflowReasonOptions([]);
      setMaterialTempoffflowReasons([]);
      setTempoffflowReason("");
      setGoToFlowPath([]);
      setGoToFlowPathValue("");
      setGoToStep("");
      setGoToStepOptions([]);
      setReturnFlowPath("");
      setReturnFlowDisplayPath("");
      setSelectedFlowPath("");
      setSelectedFlowStep("");
      setTempoffflowStepName("");
      setFlowPathOptions([]);
      setFlowQueryResults([]);
      setFlowName("");
      setFlowSteps([]);
      setFlowNodes([]);
      setFlowEdges([]);
      setTempoffflowWizardPath(null);
      setCurrentFlowPathFlow(null);
      setFlowWorkflowHistory([]);
      setLastFlowPathDisplay("");
      setGoToMainFlow(null);
      setGoToFlowHasSubFlow(false);
      setIsGoToStepLocked(false);
      setIsTempoffflowModalOpen(false);
      const errorMessage = err?.response?.data?.Message || err?.response?.data?.message || err?.message || "Failed to load material information.";
      setError(null);
      showToast("error", errorMessage);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleFlowPathClick = async (mode: "flow" | "return" = "flow") => {
    if (isLoading) return;
    if (!tempoffflowWizardPath) {
      showToast("error", "There are no Tempoffflow paths available.");
      return;
    }

    const fallbackFlow = tempoffflowData?.Flow;

    const selectedMainFlow =
      mode === "flow"
        ? (
          goToMainFlow ||
          flowQueryResults.find(
            (flow: any) =>
              String(flow?.Name) === String(goToFlowPathValue)
          ) ||
          fallbackFlow
        )
        : fallbackFlow;

    const normalizedSelectedMainFlow = selectedMainFlow;
    if (!normalizedSelectedMainFlow?.Id) {
      showToast(
        "error",
        "Selected Go To Flow Path information is not available."
      );
      return;
    }

    flowPathSelectionModeRef.current = mode;
    flowPathBeforeSelectionRef.current = returnFlowPath;
    returnFlowDisplayPathBeforeSelectionRef.current = returnFlowDisplayPath;

    setIsLoading(true);

    try {
      if (mode === "flow") {
        setCurrentFlowPathFlow(normalizedSelectedMainFlow);
        setFlowWorkflowHistory([]);
        setLastFlowPathDisplay("");
      }

      const {
        loadedFlow,
        loadedFlowSteps,
        nodes,
        edges
      } = await fetchFlowPathSteps(normalizedSelectedMainFlow);
      if (mode === "flow") {
        setMainFlowSteps(loadedFlowSteps);

        const subFlows = loadedFlowSteps.filter(
          (step: any) =>
            step?.isSubFlow === true &&
            step?.TargetEntity?.Id
        );

        if (subFlows.length > 0) {
          const firstSubFlow = subFlows[0]?.TargetEntity;

          if (firstSubFlow?.Id) {
            try {
              const firstSubFlowDetails =
                await fetchFlowPathSteps(firstSubFlow);

              const firstSubFlowDirectSteps =
                (firstSubFlowDetails.loadedFlowSteps || []).filter(
                  (step: any) => step?.isSubFlow !== true
                );

              setFirstSubFlowStepCount(
                firstSubFlowDirectSteps.length
              );
            } catch (error) {
              console.error(
                "Failed to load first SubFlow step count:",
                error
              );

              setFirstSubFlowStepCount(0);
            }
          }
        } else {
          setFirstSubFlowStepCount(0);
        }
      }
      //       if (mode === "flow") {
      //   setMainFlowStepCount(
      //     loadedFlowSteps.filter(
      //       (step: any) => step?.isSubFlow !== true
      //     ).length
      //   );
      // }
      setCurrentFlowPathFlow(loadedFlow);
      updateFlowPathTitle(loadedFlow);
      setFlowSteps(loadedFlowSteps);
      setFlowNodes(nodes);
      setFlowEdges(edges);

      if (mode === "flow") {
        const mainName = String(normalizedSelectedMainFlow?.Name || "");
        const currentStepOption = goToStepOptions.find(
          (option: any) =>
            String(option?.value) === String(goToStep)
        );
        const selectedStepName = currentStepOption?.label || "";
        const existingPath = returnFlowPath || mainName;

        if (
          selectedStepName &&
          !existingPath
            .split(" > ")
            .some((part: string) => part === selectedStepName)
        ) {
          setReturnFlowPath(
            `${mainName} > ${selectedStepName}`
          );
        }
      }

      setIsFlowPathModalOpen(true);
    } catch (err: any) {
      console.error("Failed to load flow path:", err);

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load flow path.";

      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowNodeClick = useCallback(async (_event: any, node: Node) => {
    const data = node.data as any;

    if (data?.isSubWorkflow &&
      data?.subflowTarget) {
      const nextFlow = data.subflowTarget;
      if (!nextFlow?.Id) {
        return;
      }
      const currentNodeIndex = String(node.id).startsWith("node-")
        ? Number(String(node.id).replace("node-", ""))
        : -1;

      const clickedFlowStep =
        currentNodeIndex >= 0
          ? flowSteps[currentNodeIndex]
          : null;

      const subFlowPosition =
        clickedFlowStep?.Position ??
        nextFlow?.Position ??
        nextFlow?.Sequence;

      const subFlowName = String(nextFlow?.Name || "");
      const subFlowRevision = String(nextFlow?.Revision ?? "");

      if (
        flowPathSelectionModeRef.current === "flow" &&
        subFlowName &&
        subFlowPosition !== undefined &&
        subFlowPosition !== null
      ) {
        if (
          flowPathSelectionModeRef.current === "flow" &&
          subFlowName &&
          subFlowPosition !== undefined &&
          subFlowPosition !== null
        ) {
          setSelectedGoToFlowPath((currentPath) => {
            const selectedMainFlow =
              goToMainFlow ||
              currentFlowPathFlow;

            if (!selectedMainFlow?.Name) {
              return `${subFlowName}:${subFlowRevision}:${Number(subFlowPosition)}`;
            }

            const mainFlowSegment =
              `${selectedMainFlow.Name}:${String(
                selectedMainFlow.Revision ?? ""
              )}:1`;

            const subFlowSegment =
              `${subFlowName}:${subFlowRevision}:${Number(
                subFlowPosition
              )}`;

            const pathParts = currentPath
              .split("/")
              .filter(Boolean);

            if (pathParts.includes(subFlowSegment)) {
              return currentPath;
            }

            if (pathParts.length === 0) {
              return `${mainFlowSegment}/${subFlowSegment}`;
            }

            return `${currentPath}/${subFlowSegment}`;
          });
        }
      }
      setIsLoading(true);
      try {
        const previousFlow = currentFlowPathFlow;
        if (previousFlow?.Id) {
          setFlowWorkflowHistory((history) => [
            ...history,
            previousFlow
          ]);
        }
        const { loadedFlow, loadedFlowSteps, nodes, edges } = await fetchFlowPathSteps(nextFlow);

        setGoToStepOptions([]);
        setGoToStep("");
        setGoToStepError(false);

        setIsGoToStepLocked(false);

        const rootFlow = goToMainFlow || flowQueryResults.find((flow: any) => String(flow?.Name) === String(goToFlowPathValue)) || tempoffflowData?.Flow;
        const pathFlows = [rootFlow, ...flowWorkflowHistory, previousFlow, loadedFlow].filter((flow: any) => flow?.Id);
        const uniquePathFlows = pathFlows.filter((flow: any, index: number, array: any[]) => array.findIndex((item: any) => String(item?.Id) === String(flow?.Id)) === index);
        const flowPathParts = uniquePathFlows.filter((flow: any) => flow?.Name).map((flow: any) => { const revision = flow?.Revision; return revision !== undefined && revision !== null && String(revision) !== "" ? `${flow.Name} [${revision}]` : flow.Name; });
        const logicalFlowPathParts = uniquePathFlows.filter((flow: any) => flow?.Name).map((flow: any) => flow.Name);
        const displayPath = flowPathParts.join(" > ");
        const logicalPath = logicalFlowPathParts.join(" > ");

        if (flowPathSelectionModeRef.current ===
          "return") {
          setReturnFlowDisplayPath(displayPath);
        }
        else {

          setReturnFlowPath(logicalPath);

          const mainFlow = goToMainFlow || flowQueryResults.find((flow: any) => String(flow?.Name) === String(tempoffflowData?.Flow?.Name));
          if (mainFlow?.Name) {
            setGoToFlowPathValue(String(mainFlow.Name));
            setGoToFlowPath([
              String(mainFlow.Name)
            ]);
          }
        }

        setCurrentFlowPathFlow(loadedFlow);
        updateFlowPathTitle(loadedFlow);
        setFlowSteps(loadedFlowSteps);
        setFlowNodes(nodes);
        setFlowEdges(edges);
      }
      catch (err: any) {
        console.error("Failed to load sub flow:", err);
        const errorMessage = err?.response?.data?.Message || err?.response?.data?.message || err?.message || "Failed to load flow.";
        showToast("error", errorMessage);
      }
      finally {
        setIsLoading(false);
      }
      return;
    }

    const nodeId = String(node.id);
    if (!nodeId.startsWith("node-")) {
      return;
    }
    const nodeIndex = Number(nodeId.replace("node-", ""));
    const flowStep = flowSteps[nodeIndex];
    if (!flowStep) {
      return;
    }
    const stepName = flowStep?.TargetEntity?.Name || flowStep?.Name || "";
    if (!stepName) {
      return;
    }
    const stepId = flowStep?.TargetEntity?.Id || flowStep?.Id || "";
    if (!stepId) {
      showToast("error", `Step ID is not available for ${stepName}.`);
      return;
    }
    // const stepPosition = flowStep?.Position;


    const stepPosition = Number(
      flowStep?.Position || 0
    );

    const sourceFlowId =
      flowStep?.SourceEntity?.Id;

    const sourceFlowName =
      flowStep?.SourceEntity?.Name || "";

    const sourceFlowRevision =
      flowStep?.SourceEntity?.Revision ?? "";

    const mainFlow =
      goToMainFlow ||
      currentFlowPathFlow;

    const isStepInsideSubFlow =
      !!sourceFlowId &&
      !!sourceFlowName &&
      String(sourceFlowId) !==
      String(mainFlow?.Id || "");

    const selectedSubFlowIndex =
      isStepInsideSubFlow
        ? mainFlowSteps
          .filter(
            (step: any) =>
              step?.isSubFlow === true
          )
          .findIndex(
            (step: any) =>
              String(
                step?.TargetEntity?.Id
              ) === String(sourceFlowId)
          )
        : -1;

    const isFirstSubFlow =
      isStepInsideSubFlow &&
      selectedSubFlowIndex === 0;

    const stepSequence =
      isFirstSubFlow
        ? stepPosition
        : isStepInsideSubFlow
          ? firstSubFlowStepCount + stepPosition
          : stepPosition;
    setGoToStep(String(stepId));
    if (
      flowPathSelectionModeRef.current === "flow" &&
      stepPosition !== undefined &&
      stepPosition !== null
    ) {

    }
    const selectedStepPath =
      isStepInsideSubFlow
        ? `${stepName}:${stepSequence}`
        : stepName;

    setSelectedFlowStep(selectedStepPath);
    if (flowPathSelectionModeRef.current === "flow") {
      const selectedMainFlow =
        goToMainFlow ||
        currentFlowPathFlow;

      const mainFlowSegment =
        `${selectedMainFlow?.Name || ""}:${String(
          selectedMainFlow?.Revision ?? ""
        )}:1`;

      if (isStepInsideSubFlow) {
        const parentSubFlow = mainFlowSteps.find(
          (step: any) =>
            step?.isSubFlow === true &&
            String(step?.TargetEntity?.Id) === String(sourceFlowId)
        );

        const subFlowPosition = Number(
          parentSubFlow?.Position || 0
        );

        const subFlowSegment =
          `${sourceFlowName}:${String(
            sourceFlowRevision
          )}:${subFlowPosition}`;

        setSelectedGoToFlowPath(
          `${mainFlowSegment}/${subFlowSegment}/${stepName}:${stepSequence}`
        );
      } else {
        setSelectedGoToFlowPath(
          `${mainFlowSegment}/${stepName}:${stepSequence}`
        );
      }
    }

    if (flowPathSelectionModeRef.current ===
      "return") {
      setReturnFlowDisplayPath((currentPath) => {
        const pathParts = currentPath.split(" > ").filter(Boolean);
        if (pathParts.length ===
          0) {
          return selectedStepPath;
        }
        const lastPart = pathParts[pathParts.length - 1];
        const isFlowPart = /\s\[[^\]]+\]$/.test(lastPart); if (isFlowPart) { pathParts.push(selectedStepPath); } else { pathParts[pathParts.length - 1] = selectedStepPath; } return pathParts.join(" > ");
      });
    } else {
      setReturnFlowPath((currentPath) => {
        const pathParts = currentPath.split(" > ").filter(Boolean);
        const currentTreeFlowName = String(currentFlowPathFlow?.Name || "");
        const normalizedLastPart = String(pathParts[pathParts.length - 1] || "").replace(/\s\[[^\]]+\]$/, "");
        if (pathParts.length === 0) {
          const newPath = selectedStepPath;
          setLastFlowPathDisplay(newPath);
          return newPath;
        }
        if (normalizedLastPart === currentTreeFlowName) pathParts.push(selectedStepPath);
        else pathParts[pathParts.length - 1] = selectedStepPath;
        const newPath = pathParts.join(" > ");
        setLastFlowPathDisplay(newPath);
        return newPath;
      }); const parentFlow = goToMainFlow || flowQueryResults.find((flow: any) => String(flow?.Name) === String(tempoffflowData?.Flow?.Name)); const parentFlowName = String(parentFlow?.Name || tempoffflowData?.Flow?.Name || ""); if (parentFlowName) { setGoToFlowPathValue(parentFlowName); setGoToFlowPath([parentFlowName]); } /* * ======================================================= * UPDATE STEP * ======================================================= */ setGoToStep(String(stepId)); setGoToStepError(false); /* * ======================================================= * LOCK STEP * ======================================================= * * Once a Step is selected from the Flow Path tree, * the user must not manually change it. */ setIsGoToStepLocked(true); /* * Make sure the selected step exists in the dropdown. * * This is needed because SubFlow steps are intentionally * not loaded into the dropdown initially. */
      setGoToStepOptions((currentOptions) => {
        const stepValue = String(stepId);

        const alreadyExists = currentOptions.some(
          (option) => String(option.value) === stepValue
        );

        if (alreadyExists) {
          return currentOptions.map((option) =>
            String(option.value) === stepValue
              ? {
                ...option,
                sequence:
                  stepSequence > 0
                    ? stepSequence
                    : option.sequence
              }
              : option
          );
        }

        return [
          ...currentOptions,
          {
            label: stepName,
            value: stepValue,
            sequence:
              stepSequence > 0
                ? stepSequence
                : undefined
          }
        ];
      });
    } setIsFlowPathModalOpen(false);
  },
    [
      currentFlowPathFlow,
      flowSteps,
      flowWorkflowHistory,
      tempoffflowData,
      goToMainFlow,
      flowQueryResults,
      mainFlowSteps,
      firstSubFlowStepCount,
      goToFlowPathValue,
      goToStep
    ]);
  const handleFlowPathBack = async () => { if (flowWorkflowHistory.length === 0) { return; } const previousFlow = flowWorkflowHistory[flowWorkflowHistory.length - 1]; setIsLoading(true); try { const { loadedFlow, loadedFlowSteps, nodes, edges } = await fetchFlowPathSteps(previousFlow); setCurrentFlowPathFlow(loadedFlow); updateFlowPathTitle(loadedFlow); setFlowSteps(loadedFlowSteps); setFlowNodes(nodes); setFlowEdges(edges); /* * IMPORTANT: * * Going back in the tree must NOT modify * Go To Flow Path. * * The selected main Flow remains unchanged. */ if (goToMainFlow?.Name) { setGoToFlowPathValue(String(goToMainFlow.Name)); setGoToFlowPath([String(goToMainFlow.Name)]); } setFlowWorkflowHistory((history) => history.slice(0, -1)); } catch (err: any) { console.error("Failed to go back to previous flow:", err); const errorMessage = err?.response?.data?.Message || err?.response?.data?.message || err?.message || "Failed to load previous flow."; showToast("error", errorMessage); } finally { setIsLoading(false); } }; /* * ============================================================ * SUBMIT * ============================================================ */

  const handleSubmit = async () => {
    if (!lotName.trim()) {
      showToast("error", "Please enter a material number.");
      return;
    }

    if (!tempoffflowData) {
      return;
    }

    const isReasonMissing =
      !tempoffflowReason ||
      !tempoffflowReason.trim();

    const isGoToFlowPathMissing =
      !goToFlowPathValue ||
      !goToFlowPathValue.trim() ||
      !goToFlowPath ||
      goToFlowPath.length === 0 ||
      !goToFlowPath[0] ||
      !String(goToFlowPath[0]).trim();

    const isGoToStepMissing =
      !goToStep ||
      !goToStep.trim();

    setTempoffflowReasonError(isReasonMissing);
    setGoToFlowPathError(isGoToFlowPathMissing);
    setGoToStepError(isGoToStepMissing);

    if (
      isReasonMissing ||
      isGoToFlowPathMissing ||
      isGoToStepMissing
    ) {
      return;
    }

    setError(null);
    setToasts([]);
    setIsLoading(true);

    try {
      /* ---------------- Material ---------------- */

      const materialId = tempoffflowData?.Id;

      if (!materialId) {
        throw new Error(
          "Material ID is missing from material information."
        );
      }

      /* ---------------- Reason ---------------- */

      const selectedReasonId = tempoffflowReason;

      if (!selectedReasonId) {
        throw new Error(
          "Tempoffflow Reason ID is missing."
        );
      }

      const selectedReason =
        tempoffflowReasonOptions.find(
          (reason) =>
            String(reason?.value) ===
            String(selectedReasonId)
        );

      const reasonName =
        selectedReason?.label || "";

      if (!reasonName) {
        throw new Error(
          "Tempoffflow Reason Name is missing."
        );
      }

      const selectedMainGotoFlow =
        goToMainFlow ||
        flowQueryResults.find(
          (flow: any) =>
            String(flow?.Name) ===
            String(goToFlowPathValue)
        ) ||
        tempoffflowWizardPath?.GotoFlow;

      if (!selectedMainGotoFlow) {
        throw new Error(
          "Go To Flow information is missing."
        );
      }

      const gotoFlowDefinitionId =
        selectedMainGotoFlow?.DefinitionId;

      const gotoFlowId =
        selectedMainGotoFlow?.Id;

      const gotoFlowName =
        selectedMainGotoFlow?.Name ||
        goToFlowPathValue ||
        "";

      const gotoFlowRevision =
        selectedMainGotoFlow?.Revision;

      const gotoFlowChildType =
        selectedMainGotoFlow?.ChildType ?? 0;

      const gotoFlowUniversalState =
        selectedMainGotoFlow?.UniversalState;

      if (!gotoFlowDefinitionId) {
        throw new Error(
          "Go To Flow Definition ID is missing."
        );
      }

      if (!gotoFlowId) {
        throw new Error(
          "Actual Go To Flow ID is missing."
        );
      }

      if (!gotoFlowName) {
        throw new Error(
          "Go To Flow Name is missing."
        );
      }

      if (
        gotoFlowRevision === undefined ||
        gotoFlowRevision === null ||
        String(gotoFlowRevision) === ""
      ) {
        throw new Error(
          "Go To Flow Revision is missing."
        );
      }

      if (
        gotoFlowUniversalState === undefined ||
        gotoFlowUniversalState === null
      ) {
        throw new Error(
          "Go To Flow UniversalState is missing."
        );
      }

      /* ---------------- Go To Step ---------------- */

      let gotoStepId = goToStep;

      const gotoStepRef =
        tempoffflowWizardPath?.GotoStep?.$ref;

      const wizardGotoStep = gotoStepRef
        ? findObjectByRef(
          tempoffflowWizardPath,
          gotoStepRef
        ) ||
        tempoffflowWizardPath?.GotoStep
        : tempoffflowWizardPath?.GotoStep;

      if (!gotoStepId && wizardGotoStep?.Id) {
        gotoStepId = wizardGotoStep.Id;
      }

      if (!gotoStepId) {
        throw new Error(
          "Go To Step ID is missing."
        );
      }

      const selectedStep =
        goToStepOptions.find(
          (step) =>
            String(step?.value) ===
            String(gotoStepId)
        );

      const gotoStepName =
        selectedStep?.label ||
        wizardGotoStep?.Name ||
        "";

      if (!gotoStepName) {
        throw new Error(
          "Go To Step Name is missing."
        );
      }


      const gotoFlowSequence =
        selectedMainGotoFlow?.Sequence ??
        selectedMainGotoFlow?.FlowSequence ??
        selectedMainGotoFlow?.PathSequence ??
        selectedMainGotoFlow?.Position ??
        selectedMainGotoFlow?.Order ??
        1;

      const gotoStepSequence =
        (selectedStep as any)?.sequence ??
        (selectedStep as any)?.Sequence ??
        (selectedStep as any)?.StepSequence ??
        (selectedStep as any)?.stepSequence ??
        (selectedStep as any)?.Position ??
        (selectedStep as any)?.position ??
        (selectedStep as any)?.Order ??
        (selectedStep as any)?.order ??
        wizardGotoStep?.Sequence ??
        wizardGotoStep?.StepSequence ??
        wizardGotoStep?.Position ??
        wizardGotoStep?.Order ??
        1;

      /* ---------------- Go To Flow Path ---------------- */
      const gotoFlowPath =
        selectedGoToFlowPath ||
        `${gotoFlowName}:${gotoFlowRevision}:${gotoFlowSequence}/${gotoStepName}:${gotoStepSequence}`;
      // const gotoFlowPath =
      // `${gotoFlowName}:${gotoFlowRevision}:${gotoFlowSequence}/${gotoStepName}:${gotoStepSequence}`;
      // const gotoFlowPath =
      //   selectedGoToFlowPath ||
      //   `${gotoFlowName}:${gotoFlowRevision}:${gotoFlowSequence}/${gotoStepName}:${gotoStepSequence}`;
      /* ---------------- Payload ---------------- */

      const temporaryOffFlowPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.TemporaryOffFlowMaterialsInput, Cmf.Navigo.BusinessOrchestration",
        IgnoreLastServiceId: true,
        Materials: {
          $typeCMF: "CMFMap",

          CMFMapData: [
            [
              {
                $type:
                  "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",

                Id: materialId,

                Name:
                  tempoffflowData?.Name ||
                  lotName.trim(),

                LastOperationHistorySeq:
                  tempoffflowData?.LastOperationHistorySeq,

                LastServiceHistoryId:
                  tempoffflowData?.LastServiceHistoryId
              },

              {
                GotoFlow: {
                  $type:
                    "Cmf.Navigo.BusinessObjects.Flow, Cmf.Navigo.BusinessObjects",

                  DefinitionId:
                    gotoFlowDefinitionId,

                  Id:
                    gotoFlowId,

                  ChildType:
                    gotoFlowChildType,

                  Name:
                    gotoFlowName,

                  Revision:
                    gotoFlowRevision,

                  UniversalState:
                    gotoFlowUniversalState
                },

                GotoStep: {
                  $type:
                    "Cmf.Navigo.BusinessObjects.Step, Cmf.Navigo.BusinessObjects",

                  Id:
                    gotoStepId,

                  Name:
                    gotoStepName
                },

                GotoFlowPath:
                  gotoFlowPath,

                Reason: {
                  $type:
                    "Cmf.Navigo.BusinessObjects.Reason, Cmf.Navigo.BusinessObjects",

                  Id:
                    selectedReasonId,

                  Name:
                    reasonName
                }
              }
            ]
          ]
        }
      };


      const temporaryOffFlowResponse =
        await POST<any>(
          TEMPORARY_OFF_FLOW_MATERIALS,
          temporaryOffFlowPayload
        );

      const message =
        temporaryOffFlowResponse?.Message ||
        temporaryOffFlowResponse?.message ||
        "Temporary Off-Flow operation completed successfully.";

      showToast(
        "success",
        message
      );

      setIsTempoffflowModalOpen(false);

    } catch (err: any) {
      console.error(
        "Temporary Off Flow Materials submit failed:",
        err
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.Message ||
        err?.message ||
        "Failed to perform Temporary Off-Flow action.";

      showToast(
        "error",
        errorMessage
      );

      setError(null);

    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsResetting(true); setTempoffflowReason("");
    setGoToFlowPath([]); setGoToFlowPathValue(""); setGoToStep("");
    setGoToStepOptions([]); setReturnFlowPath(""); setReturnFlowDisplayPath("");
    setSelectedFlowPath(""); setSelectedFlowStep(""); setTempoffflowStepName("");
    setLotName(""); setTempoffflowData(null); setError(null); setToasts([]);
    setTempoffflowReasonError(false); setGoToFlowPathError(false);
    setGoToStepError(false); setTempoffflowReasonOptions([]);
    setMaterialTempoffflowReasons([]); setFlowPathOptions([]);
    setFlowQueryResults([]); setFlowName(""); setFlowSteps([]);
    setFlowNodes([]); setFlowEdges([]); setTempoffflowWizardPath(null);
    setCurrentFlowPathFlow(null); setFlowWorkflowHistory([]); setLastFlowPathDisplay(""); setSelectedGoToFlowPath("");
    setGoToMainFlow(null); setGoToFlowHasSubFlow(false); setIsGoToStepLocked(false); setIsTempoffflowModalOpen(false); setIsFlowPathModalOpen(false); setIsFlowModalOpen(false); setTimeout(() => { setIsResetting(false); }, 300);
  }; const handleTempoffflowCancel = () => { setIsTempoffflowModalOpen(false); }; const displayFlowPathTitle = currentFlowPathFlow?.Revision !== undefined && currentFlowPathFlow?.Revision !== null && String(currentFlowPathFlow.Revision) !== "" ? `${currentFlowPathFlow?.Name || "Flow"} [${currentFlowPathFlow.Revision}]` : currentFlowPathFlow?.Name || flowName || "Flow Path"; return (<Styled.PageContainer> {toasts.map((item) => (<Toast key={item.id} variant={item.variant} message={item.message} onClose={() => removeToast(item.id)} />))} <Styled.TopControls> <Styled.SearchBox> <TextField variant="outlined" size="small" placeholder="Enter Material Number *" value={lotName} onChange={(e) => { const value = e.target.value; setLotName(value); setError(null); setToasts([]); if (tempoffflowData) { setTempoffflowData(null); setTempoffflowReason(""); setGoToFlowPath([]); setGoToFlowPathValue(""); setGoToStep(""); setGoToStepOptions([]); setReturnFlowPath(""); setReturnFlowDisplayPath(""); setSelectedFlowPath(""); setSelectedFlowStep(""); setTempoffflowStepName(""); setTempoffflowReasonError(false); setGoToFlowPathError(false); setGoToStepError(false); setTempoffflowReasonOptions([]); setMaterialTempoffflowReasons([]); setFlowPathOptions([]); setFlowQueryResults([]); setFlowName(""); setFlowSteps([]); setFlowNodes([]); setFlowEdges([]); setTempoffflowWizardPath(null); setCurrentFlowPathFlow(null); setFlowWorkflowHistory([]); setLastFlowPathDisplay(""); setGoToMainFlow(null); setGoToFlowHasSubFlow(false); setIsGoToStepLocked(false); setIsTempoffflowModalOpen(false); setIsFlowPathModalOpen(false); } }} onBlur={() => { const materialNumber = lotName.trim(); if (materialNumber && !tempoffflowData && !isLoading) { fetchTempoffflowDetails(materialNumber); } }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const materialNumber = lotName.trim(); if (materialNumber && !tempoffflowData && !isLoading) { fetchTempoffflowDetails(materialNumber); } } }} fullWidth autoFocus sx={{ "& fieldset": { border: "none" }, input: { padding: "10px 14px" } }} /> </Styled.SearchBox> <Styled.ActionButtons> <Button type="reset" onClick={handleReset} disabled={isResetting} /> </Styled.ActionButtons> </Styled.TopControls> {(isLoading || isResetting) && (<Loader />)} <WipDataCard materialData={tempoffflowData} title="Materials Details" onFlowClick={() => setIsFlowModalOpen(true)} /> {tempoffflowData && (<FlowStepsModal isOpen={isFlowModalOpen} onClose={() => setIsFlowModalOpen(false)} materialData={tempoffflowData} />)} {isTempoffflowModalOpen && tempoffflowData && (<Styled.TempoffflowModalOverlay> <Styled.TempoffflowModal> <Styled.TempoffflowModalHeader> <Styled.TempoffflowModalTitle> <span> Temporary Off-Flow Material </span> </Styled.TempoffflowModalTitle> <Styled.HelpIcon onClick={handleTempoffflowCancel}> × </Styled.HelpIcon> </Styled.TempoffflowModalHeader> <Styled.TempoffflowForm>

    {goToFlowPathValue && (
      <Styled.FlowPathRow>
        <Styled.TempoffflowFieldLabel>
          Flow Path:
        </Styled.TempoffflowFieldLabel>

        <Styled.FlowPathValue onClick={() => handleFlowPathClick("flow")}>
          {returnFlowPath || "Select Flow Path"}
        </Styled.FlowPathValue>
      </Styled.FlowPathRow>
    )}
    <Styled.TempoffflowFieldRow>
      <Styled.TempoffflowFieldLabel>
        <Styled.RequiredMark> * </Styled.RequiredMark> Reason: </Styled.TempoffflowFieldLabel> <Styled.TempoffflowFieldControl> <DropDown value={tempoffflowReason} options={tempoffflowReasonOptions} setSelectedOptions={(value) => { if (typeof value === "string") { setTempoffflowReason(value); if (value.trim()) { setTempoffflowReasonError(false); } } }} setIsError={setTempoffflowReasonError} isError={tempoffflowReasonError} required emptyValue="Select Tempoffflow Reason" /> </Styled.TempoffflowFieldControl> </Styled.TempoffflowFieldRow> <Styled.TempoffflowFieldRow> <Styled.TempoffflowFieldLabel> <Styled.RequiredMark> * </Styled.RequiredMark> Go To Flow Path: </Styled.TempoffflowFieldLabel> <Styled.TempoffflowFieldControl> <DropDown value={goToFlowPathValue} options={flowPathOptions} setSelectedOptions={async (value) => {
          if (typeof value !== "string") { return; } const selectedFlow =
            flowQueryResults.find((flow: any) => String(flow?.Name) === String(value));

          setGoToFlowPathValue(value);
          setSelectedGoToFlowPath("");
          setGoToFlowPath(value ? [value] : []);
          setGoToMainFlow(selectedFlow || null);
          setCurrentFlowPathFlow(null);
          setFlowWorkflowHistory([]);
          setFlowNodes([]);
          setFlowEdges([]);
          setFlowSteps([]);
          setLastFlowPathDisplay("");
          setIsGoToStepLocked(false);
          setGoToStep("");
          setGoToStepOptions([]);
          setGoToStepError(false);
          if (value.trim()) {
            setGoToFlowPathError(false);
            const selectedRevision = selectedFlow?.Revision;
            const selectedFlowDisplay = selectedRevision !== undefined && selectedRevision !== null && String(selectedRevision) !== "" ? `${value} [${selectedRevision}]` : value;
            setReturnFlowPath(selectedFlowDisplay);
            await fetchGoToStepOptions(value);
          } else {
            setGoToMainFlow(null);
            setGoToFlowHasSubFlow(false);
            setReturnFlowPath("");
          }
        }} setIsError={setGoToFlowPathError} isError={goToFlowPathError} required emptyValue="Select Go To Flow Path" /> </Styled.TempoffflowFieldControl> </Styled.TempoffflowFieldRow> <Styled.TempoffflowFieldRow> <Styled.TempoffflowFieldLabel> <Styled.RequiredMark> * </Styled.RequiredMark> Step: </Styled.TempoffflowFieldLabel> <Styled.TempoffflowFieldControl> {/* * ================================================== * STEP FIELD * ================================================== * * When selected from Flow Path tree: * * isGoToStepLocked = true * * The wrapper prevents mouse interaction with the * dropdown, while still displaying the selected * Step value. * * This avoids requiring any change to your * existing DropDown component. * ================================================== */} <div style={{ pointerEvents: isGoToStepLocked ? "none" : "auto", opacity: isGoToStepLocked ? 0.65 : 1, cursor: isGoToStepLocked ? "not-allowed" : "default" }}> <DropDown value={goToStep || ""} options={goToStepOptions} setSelectedOptions={(value) => { /* * Extra protection: * * Even if DropDown somehow fires the * callback, do not allow a change after * tree selection. */ if (isGoToStepLocked) { return; } if (typeof value === "string") {
          setGoToStep(value);
          if (value.trim()) {
            setGoToStepError(false);
            const selectedOption = goToStepOptions.find((option: any) => String(option?.value) === String(value));
            const selectedStepLabel = selectedOption?.label || "";
            const selectedMainFlow = goToMainFlow || flowQueryResults.find((flow: any) => String(flow?.Name) === String(goToFlowPathValue));
            const selectedMainFlowName = String(selectedMainFlow?.Name || goToFlowPathValue || "");
            const selectedRevision = selectedMainFlow?.Revision;
            const selectedFlowDisplay = selectedRevision !== undefined && selectedRevision !== null && String(selectedRevision) !== "" ? `${selectedMainFlowName} [${selectedRevision}]` : selectedMainFlowName;
            if (selectedFlowDisplay && selectedStepLabel) {
              setReturnFlowPath(`${selectedFlowDisplay} > ${selectedStepLabel}`);
              setLastFlowPathDisplay(`${selectedFlowDisplay} > ${selectedStepLabel}`);
            }
          }
        }
        }}
          setIsError={setGoToStepError} isError={goToStepError} required emptyValue="Select Step" /> </div> </Styled.TempoffflowFieldControl> </Styled.TempoffflowFieldRow> <Styled.TempoffflowFieldRow> <Styled.TempoffflowFieldLabel> Return Flow Path: </Styled.TempoffflowFieldLabel> <Styled.TempoffflowFieldControl> <Styled.FlowPathValue> {returnFlowDisplayPath || "-"} </Styled.FlowPathValue> </Styled.TempoffflowFieldControl> </Styled.TempoffflowFieldRow> </Styled.TempoffflowForm> <Styled.TempoffflowModalFooter> <Button type="submit" onClick={handleSubmit} disabled={!tempoffflowData || isLoading} /> </Styled.TempoffflowModalFooter> </Styled.TempoffflowModal> </Styled.TempoffflowModalOverlay>)} {isFlowPathModalOpen && (<Styled.FlowPathModalOverlay> <Styled.FlowPathModal> <Styled.FlowPathModalHeader> <Styled.FlowPathTitle> {flowWorkflowHistory.length > 0 && (<button type="button" onClick={handleFlowPathBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", padding: "4px", marginRight: "8px" }}> <IoArrowBack /> </button>)} <Styled.FlowPathHeaderIcon> ↻ </Styled.FlowPathHeaderIcon> {displayFlowPathTitle} </Styled.FlowPathTitle> <Styled.HelpIcon onClick={() => { /* * Restore only the display/path values. * * Do not accidentally replace the selected * main Go To Flow with the SubFlow we navigated to. */ setIsFlowPathModalOpen(false); }}> × </Styled.HelpIcon> </Styled.FlowPathModalHeader> <Styled.FlowTreeContainer> {flowNodes.length > 0 ? (<ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={handleFlowNodeClick} fitView panOnDrag zoomOnScroll zoomOnPinch minZoom={0.3} maxZoom={2} fitViewOptions={{ padding: 0.2 }} proOptions={{ hideAttribution: true }} />) : (<div style={{ textAlign: "center", color: "#64748b", marginTop: "40px" }}> No flow steps found. </div>)} </Styled.FlowTreeContainer> </Styled.FlowPathModal> </Styled.FlowPathModalOverlay>)} </Styled.PageContainer>);
};
export default TemporaryOffFlowPage;
