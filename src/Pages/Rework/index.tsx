import React, { useCallback, useRef, useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  GET_MATERIAL_HOLD_REASONS as GET_MATERIAL_REWORK_REASONS,
  LOAD_STEPS_RELATIONS, LOAD_FLOW_CHILDS, GET_DATA_REWORK_WIZARD, COMPLEX_REWORK_MATERIAL, EXECUTE_QUERY
} from "../../api";
import { TextField } from "@mui/material";
import Button from "../../Library/Button";
import Loader from "../../Library/Loader";
import Toast from "../../components/Toast";
import WipDataCard from "../../components/WipDataCard";
import DropDown from "../../Library/DropDown";
import FlowStepsModal from "../../components/FlowStepsModal";
import {
  ReactFlow, type Node, type Edge, MarkerType, applyNodeChanges, applyEdgeChanges, type OnNodesChange,
  type OnEdgesChange
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StepNode from "../../components/FlowStepsModal/StepNode";
import { IoArrowBack } from "react-icons/io5";
const nodeTypes = { Step: StepNode };
const defaultEdge = {
  style: { stroke: "#008000", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#008000" }
};
const findObjectByRef = (
  obj: any,
  ref: string
): any => {
  if (!obj || !ref) return null;

  if (typeof obj !== "object") {
    return null;
  }

  if (obj.$id === ref) {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result =
        findObjectByRef(item, ref);

      if (result) {
        return result;
      }
    }

    return null;
  }

  for (const key of Object.keys(obj)) {
    const result =
      findObjectByRef(
        obj[key],
        ref
      );

    if (result) {
      return result;
    }
  }

  return null;
};

const ReworkPage = () => {
  const [reworkReason, setReworkReason] = useState<string>("");
  const [goToFlowPath, setGoToFlowPath] = useState<string[]>([]);
  const [returnFlowPath, setReturnFlowPath] = useState("");
  const flowPathBeforeSelectionRef = useRef("");
  const [selectedFlowPath, setSelectedFlowPath] = useState("");
  const [selectedFlowStep, setSelectedFlowStep] = useState("");
  const [reworkStepName, setReworkStepName] = useState("");
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [isFlowPathModalOpen, setIsFlowPathModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [lotName, setLotName] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reworkData, setReworkData] = useState<any>(null);
  const [reworkReasonError, setReworkReasonError] = useState(false);
  const [reworkReasonOptions, setReworkReasonOptions] = useState<
    { label: string; value: string }[]>([]);
  const [materialReworkReasons, setMaterialReworkReasons] = useState<any[]>([]);
  const [flowPathOptions, setFlowPathOptions] = useState<
    { label: string; value: string }[]>([]);
  const [flowName, setFlowName] = useState("");
  const [flowSteps, setFlowSteps] = useState<any[]>([]);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [reworkWizardPath, setReworkWizardPath] = useState<any>(null);
  const [currentFlowPathFlow, setCurrentFlowPathFlow] = useState<any>(null);
  const [flowWorkflowHistory, setFlowWorkflowHistory] = useState<any[]>([]);
  const [toasts, setToasts] = useState<
    { id: number; variant: "success" | "error"; message: string }[]>([]);

  const showToast = (
    variant: "success" | "error",
    message: string
  ) => {
    setToasts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(), variant, message
      }
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  };

  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setFlowNodes((nodes) =>
        applyNodeChanges(changes, nodes)
      ),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setFlowEdges((edges) =>
        applyEdgeChanges(changes, edges)
      ),
    []
  );

  const getFlowPathDisplay = (path: string) => {
    if (!path) return "";

    return String(path)
      .split("/")
      .filter(Boolean)
      .map((part: string) =>
        part
          .replace(
            /^(.+):([A-Z]):\d+$/,
            "$1 [$2]"
          )
          .replace(
            /^(.+):\d+$/,
            "$1"
          )
      )
      .join(" > ");
  };
  const buildFlowPathNodes = (
    steps: any[],
    loadedReworkPaths: any[] = []
  ) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    steps.forEach((step: any, index: number) => {
      const stepName =
        step?.TargetEntity?.Name ||
        step?.Name ||
        "Unknown Step";

      const currentStepName =
        reworkData?.Step?.Name ||
        reworkData?.StepName ||
        reworkData?.Step;

      const isCurrent =
        currentStepName &&
        stepName.includes(currentStepName);

      const isAlternate =
        step?.TargetEntity?.IsAlternate === true ||
        step?.IsAlternate === true;

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
          isSubWorkflow:
            step?.isSubFlow === true,
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

    loadedReworkPaths.forEach(
      (rework: any, rIndex: number) => {
        const sourceStepName =
          rework?.SourceStep?.Name;

        const returnStepName =
          rework?.ReturnStep?.Name;

        const gotoFlow =
          rework?.GotoFlow;

        const gotoFlowName =
          gotoFlow?.Name ||
          "Rework Flow";

        const sourceNodeIndex =
          steps.findIndex(
            (step: any) =>
              (
                step?.TargetEntity?.Name ||
                step?.Name
              ) === sourceStepName
          );

        const returnNodeIndex =
          steps.findIndex(
            (step: any) =>
              (
                step?.TargetEntity?.Name ||
                step?.Name
              ) === returnStepName
          );

        const resolvedSourceNodeIndex =
          sourceNodeIndex !== -1
            ? sourceNodeIndex
            : steps.findIndex(
              (step: any) => {
                const name =
                  step?.TargetEntity?.Name ||
                  step?.Name ||
                  "";

                return (
                  String(name).toLowerCase() ===
                  String(
                    sourceStepName || ""
                  ).toLowerCase()
                );
              }
            );

        const resolvedReturnNodeIndex =
          returnNodeIndex !== -1
            ? returnNodeIndex
            : steps.findIndex(
              (step: any) => {
                const name =
                  step?.TargetEntity?.Name ||
                  step?.Name ||
                  "";

                return (
                  String(name).toLowerCase() ===
                  String(
                    returnStepName || ""
                  ).toLowerCase()
                );
              }
            );

        if (
          resolvedSourceNodeIndex !== -1
        ) {
          const reworkNodeId =
            `rework-${rIndex}`;

          const sourceNodeY =
            resolvedSourceNodeIndex * 100;

          newNodes.push({
            id: reworkNodeId,
            type: "Step",
            position: {
              x: 350,
              y: sourceNodeY + 50
            },
            data: {
              label: `${gotoFlowName} (Rework)`,
              isCurrentStep: false,
              isFirstStep: false,
              isSubWorkflow: true,
              isRework: true,
              subflowTarget: gotoFlow
            }
          });

          newEdges.push({
            id: `edge-rw-src-${rIndex}`,
            source:
              `node-${resolvedSourceNodeIndex}`,
            target: reworkNodeId,
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

          if (
            resolvedReturnNodeIndex !== -1
          ) {
            newEdges.push({
              id: `edge-rw-ret-${rIndex}`,
              source: reworkNodeId,
              target:
                `node-${resolvedReturnNodeIndex}`,
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
      }
    );

    return {
      nodes: newNodes,
      edges: newEdges
    };
  };

  const fetchFlowPathSteps = async (
    flowObj: any
  ) => {
    if (!flowObj?.Id) {
      throw new Error(
        "Flow information is not available."
      );
    }

    const cleanFlowObj = {
      $type:
        "Cmf.Navigo.BusinessObjects.Flow, Cmf.Navigo.BusinessObjects",
      Id: flowObj.Id,
      Name: flowObj.Name,
      IgnoreLastServiceId: true,
      DefinitionId:
        flowObj.DefinitionId,
      Revision: flowObj.Revision,
      Version: flowObj.Version,
      UniversalState:
        flowObj.UniversalState
    };

    const payload = {
      $type:
        "Cmf.Navigo.BusinessOrchestration.FacilityManagement.FlowManagement.InputObjects.LoadFlowChildsInput, Cmf.Navigo.BusinessOrchestration",
      Flow: cleanFlowObj,
      LoadReworkPaths: true,
      ReworkPathsLevelsToLoad: 10,
      IsToIncludeTerminated: false,
      PageNumber: 1,
      PageSize: 100,
      LevelsToLoad: 10
    };

    const result = await POST<any>(
      LOAD_FLOW_CHILDS,
      payload
    );

    let parsedSteps: any[] = [];

    const relationCollection =
      result?.Flow?.RelationCollection
        ?.CMFMapData;

    if (Array.isArray(relationCollection)) {
      const flowStepEntry =
        relationCollection.find(
          (entry: any) =>
            entry[0] === "FlowStep"
        );

      const subFlowEntry =
        relationCollection.find(
          (entry: any) =>
            entry[0] === "SubFlow"
        );

      if (
        flowStepEntry &&
        Array.isArray(flowStepEntry[1])
      ) {
        parsedSteps = [
          ...parsedSteps,
          ...flowStepEntry[1].map(
            (step: any) => ({
              ...step,
              isSubFlow: false
            })
          )
        ];
      }

      if (
        subFlowEntry &&
        Array.isArray(subFlowEntry[1])
      ) {
        parsedSteps = [
          ...parsedSteps,
          ...subFlowEntry[1].map(
            (step: any) => ({
              ...step,
              isSubFlow: true
            })
          )
        ];
      }
    }

    parsedSteps.sort(
      (a: any, b: any) =>
        (a?.Position || 0) -
        (b?.Position || 0)
    );

    const loadedReworkPaths =
      result?.ReworkPaths ||
      result?.Flow?.ReworkPaths ||
      [];

    const safeReworkPaths =
      Array.isArray(
        loadedReworkPaths
      )
        ? loadedReworkPaths
        : [];

    const {
      nodes,
      edges
    } = buildFlowPathNodes(
      parsedSteps,
      safeReworkPaths
    );

    return {
      loadedFlow:
        result?.Flow || flowObj,
      loadedFlowSteps:
        parsedSteps,
      loadedReworkPaths:
        safeReworkPaths,
      nodes,
      edges
    };
  };
  const findReturnStepInFlowHierarchy = async (
    flowObj: any,
    returnStepId: string,
    visitedFlowIds = new Set<string>()
  ): Promise<any | null> => {
    if (
      !flowObj?.Id ||
      !returnStepId
    ) {
      return null;
    }

    const flowId =
      String(flowObj.Id);

    if (
      visitedFlowIds.has(flowId)
    ) {
      return null;
    }

    visitedFlowIds.add(flowId);

    const flowDetails =
      await fetchFlowPathSteps(
        flowObj
      );

    const loadedFlowSteps =
      flowDetails.loadedFlowSteps ||
      [];

    /*
     * First check the actual FlowStep
     * objects in this flow.
     */
    const matchingStep =
      loadedFlowSteps.find(
        (step: any) => {
          const stepId =
            step?.TargetEntity?.Id ||
            step?.Id;

          return (
            stepId &&
            String(stepId) ===
            String(returnStepId)
          );
        }
      );

    if (matchingStep) {
      return matchingStep;
    }

    for (
      const step of loadedFlowSteps
    ) {
      if (
        step?.isSubFlow !== true
      ) {
        continue;
      }

      const subFlow =
        step?.TargetEntity;

      if (!subFlow?.Id) {
        continue;
      }

      const result =
        await findReturnStepInFlowHierarchy(
          subFlow,
          returnStepId,
          visitedFlowIds
        );
      if (result) {
        return {
          ...result,
          isInsideSubFlow: true
        };
      }

    }

    return null;
  };

  const updateFlowPathTitle = (
    flowObj: any
  ) => {
    const loadedFlowName =
      flowObj?.Name || "";

    const flowRevision =
      flowObj?.Revision;

    const displayTitle =
      flowRevision !== undefined &&
        flowRevision !== null &&
        String(flowRevision) !== ""
        ? `${loadedFlowName} [${flowRevision}]`
        : loadedFlowName;

    setFlowName(
      String(displayTitle)
    );
  };

  const fetchReworkDetails = async (
    nameToFetch: string
  ) => {
    if (!nameToFetch.trim()) return;

    setIsLoading(true);
    setError(null);
    setToasts([]);

    setReworkData(null);
    setReworkReason("");
    setGoToFlowPath([]);
    setReturnFlowPath("");
    setSelectedFlowPath("");
    setSelectedFlowStep("");
    setReworkStepName("");
    setReworkReasonError(false);
    setReworkReasonOptions([]);
    setMaterialReworkReasons([]);
    setFlowPathOptions([]);
    setFlowName("");
    setFlowSteps([]);
    setFlowNodes([]);
    setFlowEdges([]);
    setReworkWizardPath(null);
    setCurrentFlowPathFlow(null);
    setFlowWorkflowHistory([]);
    setIsReworkModalOpen(false);
    setIsFlowPathModalOpen(false);

    try {
      const queryPayload = {
        QueryObject: {
          $type:
            "Cmf.Foundation.BusinessObjects.QueryObject.QueryObject, Cmf.Foundation.BusinessObjects",
          EntityTypeName:
            "Material",
          Query: {
            Distinct: false,
            Filters: [
              {
                Name: "Name",
                ObjectName:
                  "Material",
                Operator: 0,
                Value:
                  nameToFetch.trim(),
                LogicalOperator: 1
              }
            ],
            Fields: [
              {
                Name: "Id",
                ObjectName:
                  "Material",
                Alias: "Id"
              }
            ]
          }
        },
        PageNumber: 1,
        PageSize: 1
      };

      const queryResponse =
        await POST<any>(
          EXECUTE_QUERY,
          queryPayload
        );

      let materialId: any = null;

      if (
        queryResponse?.NgpDataSet
          ?.T_Result?.[0]?.Id
      ) {
        materialId =
          queryResponse
            .NgpDataSet
            .T_Result[0]
            .Id;
      } else if (
        Array.isArray(
          queryResponse
        ) &&
        queryResponse[0]?.Id
      ) {
        materialId =
          queryResponse[0].Id;
      }

      if (!materialId) {
        throw new Error(
          "Material not found for the entered material number."
        );
      }

      const infoPayload = {
        $id: "1",
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialBasicInformationInput, Cmf.Navigo.BusinessOrchestration",
        Material: {
          $id: "2",
          $type:
            "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
          Id: materialId
        },
        IsLoadRelationsToContainer:
          true,
        IsLoadRelationsToResource:
          true,
        IsToLoadResourceDurables:
          true,
        IsLoadTopMost: true,
        LevelsToLoad: 2,
        RelationsToContainerLevelsToLoad:
          1,
        RelationsToResourceLevelsToLoad:
          2,
        RelationsToResourceDurableLevelsToLoad:
          1,
        TopMostLevelsToLoad: 1,
        RecipeInstanceLevelsToLoad:
          2
      };

      const materialResponse =
        await POST<any>(
          GET_MATERIAL_BASIC_INFO,
          infoPayload
        );

      let data = materialResponse;

      if (materialResponse?.Material) {
        data =
          materialResponse.Material;
      } else if (
        materialResponse?.Data?.Material
      ) {
        data =
          materialResponse.Data.Material;
      } else if (
        materialResponse?.Entities?.[0]
      ) {
        data =
          materialResponse.Entities[0];
      }

      setReworkData(data);

      const materialName =
        data?.Name ||
        nameToFetch.trim();

      const reasonPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialsHoldReasonsWithUserInformationInput, Cmf.Navigo.BusinessOrchestration",
        Materials: [
          {
            Id: materialId,
            Name: materialName
          }
        ],
        IgnoreLastServiceId: true
      };

      const reasonResponse =
        await POST<any>(
          GET_MATERIAL_REWORK_REASONS,
          reasonPayload
        );

      const responseMaterial =
        reasonResponse?.Materials?.[0];

      let reasons: any[] = [];

      const relationData =
        responseMaterial
          ?.RelationCollection
          ?.CMFMapData;

      if (
        Array.isArray(
          relationData
        )
      ) {
        const reworkReasonRelation =
          relationData.find(
            (item: any) =>
              Array.isArray(item) &&
              item[0] ===
              "MaterialHoldReason"
          );

        if (
          Array.isArray(
            reworkReasonRelation?.[1]
          )
        ) {
          reasons =
            reworkReasonRelation[1];
        }
      }

      setMaterialReworkReasons(
        reasons
      );

      const reasonOptions =
        reasons
          .map((reason: any) => {
            const targetEntity =
              reason?.TargetEntity;

            if (
              !targetEntity?.Id ||
              !targetEntity?.Name
            ) {
              return null;
            }

            return {
              label: String(
                targetEntity.Name
              ),
              value: String(
                targetEntity.Id
              )
            };
          })
          .filter(Boolean) as {
            label: string;
            value: string;
          }[];

      const stepId =
        data?.Step?.Id;

      let stepReworkReasons: any[] =
        [];

      if (stepId) {
        const stepRelationsPayload = {
          $type:
            "Cmf.Navigo.BusinessOrchestration.FacilityManagement.FlowManagement.InputObjects.LoadStepRelationsInput, Cmf.Navigo.BusinessOrchestration",
          Step: {
            $type:
              "Cmf.Navigo.BusinessObjects.Step, Cmf.Navigo.BusinessObjects",
            Id: stepId
          },
          LevelsToLoad: 2,
          IgnoreLastServiceId: true
        };

        const stepRelationsResponse =
          await POST<any>(
            LOAD_STEPS_RELATIONS,
            stepRelationsPayload
          );

        const stepRelationData =
          stepRelationsResponse
            ?.Step
            ?.RelationCollection
            ?.CMFMapData;

        if (
          Array.isArray(
            stepRelationData
          )
        ) {
          const stepReasonRelation =
            stepRelationData.find(
              (item: any) =>
                Array.isArray(item) &&
                item[0] ===
                "StepReason"
            );

          if (
            Array.isArray(
              stepReasonRelation?.[1]
            )
          ) {
            stepReworkReasons =
              stepReasonRelation[1].filter(
                (reason: any) =>
                  reason?.ApplicableToRework ===
                  true
              );
          }
        }
      }

      const stepReworkReasonOptions =
        stepReworkReasons
          .map((reason: any) => {
            const targetEntity =
              reason?.TargetEntity;

            if (
              !targetEntity?.Id ||
              !targetEntity?.Name
            ) {
              return null;
            }

            return {
              label: String(
                targetEntity.Name
              ),
              value: String(
                targetEntity.Id
              )
            };
          })
          .filter(Boolean) as {
            label: string;
            value: string;
          }[];

      const combinedReasonOptions = [
        ...reasonOptions,
        ...stepReworkReasonOptions
      ].filter(
        (
          option,
          index,
          array
        ) =>
          array.findIndex(
            (item) =>
              item.value ===
              option.value
          ) === index
      );

      setReworkReasonOptions(
        combinedReasonOptions
      );

      const reworkWizardPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetDataForReworkWizardInput, Cmf.Navigo.BusinessOrchestration",
        Material: {
          Id: materialId,
          Name: materialName,
          Step: {
            Id: stepId
          }
        },
        IgnoreLastServiceId: true
      };

      const reworkWizardResponse =
        await POST<any>(
          GET_DATA_REWORK_WIZARD,
          reworkWizardPayload
        );

      const reworkPathCollection =
        Array.isArray(
          reworkWizardResponse
            ?.ReworkPathCollection
        )
          ? reworkWizardResponse
            .ReworkPathCollection
          : reworkWizardResponse
            ?.ReworkPathCollection
            ?.$values || [];

      const reworkPath =
        reworkPathCollection[0] ||
        null;

      setReworkWizardPath(
        reworkPath
      );

      let hasBlockingIssue = false;

      if (reworkPath) {
        const gotoStepRef =
          reworkPath
            ?.GotoStep
            ?.$ref;

        const gotoStep =
          gotoStepRef
            ? findObjectByRef(
              reworkWizardResponse,
              gotoStepRef
            )
            : reworkPath?.GotoStep;

        const gotoStepName =
          gotoStep?.Name || "";

        const gotoStepId =
          gotoStep?.Id || "";

        const gotoFlowPath =
          reworkPath?.GotoFlowPath ||
          "";

        setReworkStepName(
          String(gotoStepName)
        );

        const gotoFlowDisplay =
          getFlowPathDisplay(
            String(gotoFlowPath)
          );

        if (gotoFlowPath) {
          setGoToFlowPath([
            String(gotoFlowPath)
          ]);

          setFlowPathOptions([
            {
              label:
                gotoFlowDisplay,
              value:
                String(
                  gotoFlowPath
                )
            }
          ]);
        } else {
          setGoToFlowPath([]);
          setFlowPathOptions([]);
        }
        const configuredReturnFlowPath =
          reworkPath?.ReturnFlowPath ||
          "";

        const returnFlowPathParts =
          String(
            configuredReturnFlowPath
          )
            .split("/")
            .filter(Boolean);

        const formattedReturnFlowParts =
          returnFlowPathParts.map(
            (part: string) =>
              part.replace(
                /^(.+):([A-Z]):\d+$/,
                "$1 [$2]"
              )
          );

        const returnStepId =
          reworkPath?.ReturnStep?.Id ||
          reworkPath?.SourceStep?.Id ||
          "";

        const returnStepName =
          reworkPath?.ReturnStep?.Name ||
          reworkPath?.SourceStep?.Name ||
          "";
        let returnStepDisplay =
          returnStepName ||
          (formattedReturnFlowParts.length > 0
            ? formattedReturnFlowParts[
            formattedReturnFlowParts.length - 1
            ]
            : "");

        if (
          returnStepId &&
          data?.Flow?.Id
        ) {
          const matchingReturnStep =
            await findReturnStepInFlowHierarchy(
              data.Flow,
              returnStepId
            );

          const returnStepPosition =
            matchingReturnStep?.Position;

          const isInsideSubFlow =
            matchingReturnStep?.isInsideSubFlow === true;

          if (
            isInsideSubFlow &&
            returnStepPosition !== undefined &&
            returnStepPosition !== null
          ) {
            returnStepDisplay =
              `${returnStepName}:${returnStepPosition}`;
          } else {
            returnStepDisplay =
              returnStepName;
          }
        }
        const returnFlowDisplay =
          formattedReturnFlowParts[0] ||
          data?.Flow?.Name ||
          "";
        setSelectedFlowPath(returnFlowDisplay);
        setSelectedFlowStep(returnStepDisplay);
        if (
          formattedReturnFlowParts.length > 0) {
          const displayParts = [
            ...formattedReturnFlowParts
          ];

          if (
            displayParts.length > 0 &&
            returnStepName
          ) {
            displayParts[
              displayParts.length - 1
            ] = returnStepName;
          }

          setReturnFlowPath(
            displayParts.join(
              " > "
            )
          );
        } else if (
          configuredReturnFlowPath
        ) {
          setReturnFlowPath(
            getFlowPathDisplay(
              String(
                configuredReturnFlowPath
              )
            )
          );
        } else {
          setReturnFlowPath("");
        }

        const sourceFlowVersion =
          reworkPath
            ?.SourceFlowVersion;

        const sourceFlowName =
          sourceFlowVersion?.Name ||
          data?.Flow?.Name ||
          "";

        const sourceFlowRevision =
          sourceFlowVersion?.Revision !==
            undefined &&
            sourceFlowVersion?.Revision !==
            null
            ? String(
              sourceFlowVersion.Revision
            )
            : "";

        const flowDisplayName =
          sourceFlowRevision
            ? `${sourceFlowName} [${sourceFlowRevision}]`
            : sourceFlowName;

        setFlowName(
          String(
            flowDisplayName
          )
        );

        setFlowSteps([]);
        setFlowNodes([]);
        setFlowEdges([]);
      } else {
        hasBlockingIssue = true;

        setGoToFlowPath([]);
        setReturnFlowPath("");
        setSelectedFlowPath("");
        setSelectedFlowStep("");
        setReworkStepName("");
        setFlowPathOptions([]);
        setFlowName("");
        setFlowSteps([]);
        setFlowNodes([]);
        setFlowEdges([]);

        if (
          combinedReasonOptions.length ===
          0
        ) {
          const currentStepName =
            data?.Step?.Name ||
            "Unknown";

          showToast(
            "error",
            `There are no Rework Reasons available for Step ${currentStepName}.`
          );
        } else {
          showToast(
            "error",
            "There are no Rework paths available."
          );
        }
      }

      if (!hasBlockingIssue) {
        setIsReworkModalOpen(
          true
        );
      } else {
        setIsReworkModalOpen(
          false
        );
      }
    } catch (err: any) {
      console.error(
        "Failed to load rework details:",
        err
      );

      setReworkData(null);
      setReworkReasonOptions([]);
      setMaterialReworkReasons([]);
      setReworkReason("");
      setGoToFlowPath([]);
      setReturnFlowPath("");
      setSelectedFlowPath("");
      setSelectedFlowStep("");
      setReworkStepName("");
      setFlowPathOptions([]);
      setFlowName("");
      setFlowSteps([]);
      setFlowNodes([]);
      setFlowEdges([]);
      setReworkWizardPath(null);
      setCurrentFlowPathFlow(null);
      setFlowWorkflowHistory([]);
      setIsReworkModalOpen(false);

      const errorMessage =
        err?.response?.data
          ?.Message ||
        err?.response?.data
          ?.message ||
        err?.message ||
        "Failed to load material information.";

      setError(null);

      showToast(
        "error",
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowPathClick = async () => {
    if (isLoading) {
      return;
    }

    if (!reworkWizardPath) {
      showToast(
        "error",
        "There are no Rework paths available."
      );
      return;
    }

    const currentFlow = reworkData?.Flow;

    if (!currentFlow?.Id) {
      showToast(
        "error",
        "Flow information is not available."
      );
      return;
    }
    flowPathBeforeSelectionRef.current = returnFlowPath;

    setIsLoading(true);

    try {
      setFlowWorkflowHistory([]);
      setCurrentFlowPathFlow(currentFlow);

      const mainFlowRevision =
        currentFlow?.Revision !== undefined &&
          currentFlow?.Revision !== null &&
          String(currentFlow.Revision) !== ""
          ? ` [${currentFlow.Revision}]`
          : "";

      setReturnFlowPath(
        `${currentFlow.Name}${mainFlowRevision}`
      );

      const {
        loadedFlow,
        loadedFlowSteps,
        nodes,
        edges
      } = await fetchFlowPathSteps(currentFlow);

      setCurrentFlowPathFlow(loadedFlow);
      updateFlowPathTitle(loadedFlow);
      setFlowSteps(loadedFlowSteps);
      setFlowNodes(nodes);
      setFlowEdges(edges);
      setIsFlowPathModalOpen(true);
    } catch (err: any) {
      console.error(
        "Failed to load flow path:",
        err
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load flow path.";

      showToast(
        "error",
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowNodeClick =
    useCallback(
      async (
        _event: any,
        node: Node
      ) => {
        const data =
          node.data as any;
        if (
          data?.isSubWorkflow &&
          data?.subflowTarget
        ) {
          const nextFlow =
            data.subflowTarget;

          if (!nextFlow?.Id) {
            return;
          }

          setIsLoading(true);

          try {

            const previousFlow =
              currentFlowPathFlow;

            if (previousFlow?.Id) {
              setFlowWorkflowHistory(
                (history) => [
                  ...history,
                  previousFlow
                ]
              );
            }

            const {
              loadedFlow,
              loadedFlowSteps,
              nodes,
              edges
            } =
              await fetchFlowPathSteps(
                nextFlow
              );
            const pathFlows = [
              reworkData?.Flow,
              ...flowWorkflowHistory,
              previousFlow,
              loadedFlow
            ].filter(
              (flow: any) =>
                flow?.Id
            );
            const uniquePathFlows =
              pathFlows.filter(
                (
                  flow: any,
                  index: number,
                  array: any[]
                ) =>
                  array.findIndex(
                    (item: any) =>
                      String(
                        item?.Id
                      ) ===
                      String(
                        flow?.Id
                      )
                  ) === index
              );

            const flowPathParts =
              uniquePathFlows
                .filter(
                  (flow: any) =>
                    flow?.Name
                )
                .map(
                  (flow: any) => {
                    const revision =
                      flow?.Revision;

                    return (
                      revision !==
                      undefined &&
                      revision !==
                      null &&
                      String(
                        revision
                      ) !== ""
                    )
                      ? `${flow.Name} [${revision}]`
                      : flow.Name;
                  }
                );

            setReturnFlowPath(
              flowPathParts.join(
                " > "
              )
            );

            setCurrentFlowPathFlow(
              loadedFlow
            );

            updateFlowPathTitle(
              loadedFlow
            );

            setFlowSteps(
              loadedFlowSteps
            );

            setFlowNodes(nodes);
            setFlowEdges(edges);
          } catch (err: any) {
            console.error(
              "Failed to load sub flow:",
              err
            );

            const errorMessage =
              err?.response?.data
                ?.Message ||
              err?.response?.data
                ?.message ||
              err?.message ||
              "Failed to load flow.";

            showToast(
              "error",
              errorMessage
            );
          } finally {
            setIsLoading(false);
          }

          return;
        }
        const nodeId =
          String(node.id);

        if (
          !nodeId.startsWith(
            "node-"
          )
        ) {
          return;
        }

        const nodeIndex =
          Number(
            nodeId.replace(
              "node-",
              ""
            )
          );

        const flowStep =
          flowSteps[nodeIndex];

        if (!flowStep) {
          return;
        }

        const stepName =
          flowStep
            ?.TargetEntity
            ?.Name ||
          flowStep?.Name ||
          "";

        if (!stepName) {
          return;
        }

        const stepPosition =
          flowStep?.Position;

        const selectedStepPath =
          flowWorkflowHistory.length > 0 &&
            stepPosition !== undefined &&
            stepPosition !== null
            ? `${stepName}:${stepPosition}`
            : stepName;

        setSelectedFlowStep(selectedStepPath);
        setReturnFlowPath(
          (currentPath) => {
            const pathParts =
              currentPath
                .split(" > ")
                .filter(Boolean);

            if (
              pathParts.length ===
              0
            ) {
              return stepName;
            }

            const lastPart =
              pathParts[
              pathParts.length - 1
              ];
            const isFlowPart =
              /\s\[[^\]]+\]$/.test(
                lastPart
              );

            if (isFlowPart) {
              pathParts.push(
                stepName
              );
            } else {
              pathParts[
                pathParts.length - 1
              ] = stepName;
            }

            return pathParts.join(
              " > "
            );
          }
        );

        setIsFlowPathModalOpen(
          false
        );
      },
      [
        currentFlowPathFlow,
        flowSteps,
        flowWorkflowHistory,
        reworkData
      ]
    );
  const handleFlowPathBack =
    async () => {
      if (
        flowWorkflowHistory.length ===
        0
      ) {
        return;
      }

      const previousFlow =
        flowWorkflowHistory[
        flowWorkflowHistory.length -
        1
        ];

      setIsLoading(true);

      try {
        const {
          loadedFlow,
          loadedFlowSteps,
          nodes,
          edges
        } =
          await fetchFlowPathSteps(previousFlow);

        setCurrentFlowPathFlow(loadedFlow);
        updateFlowPathTitle(loadedFlow);
        setFlowSteps(loadedFlowSteps);
        setFlowNodes(nodes);
        setFlowEdges(edges);

        setFlowWorkflowHistory(
          (history) =>
            history.slice(0, -1)
        );
      } catch (err: any) {
        console.error(
          "Failed to go back to previous flow:",
          err
        );

        const errorMessage =
          err?.response?.data
            ?.Message ||
          err?.response?.data
            ?.message ||
          err?.message ||
          "Failed to load previous flow.";

        showToast(
          "error",
          errorMessage
        );
      } finally {
        setIsLoading(false);
      }
    };

  const handleSubmit =
    async () => {
      if (!lotName.trim()) {
        showToast(
          "error",
          "Please enter a material number."
        );
        return;
      }

      if (!reworkData) {
        return;
      }

      if (
        reworkReason.length ===
        0
      ) {
        setReworkReasonError(
          true
        );
        return;
      }

      setError(null);
      setToasts([]);
      setReworkReasonError(
        false
      );
      setIsLoading(true);

      try {
        const materialId =
          reworkData?.Id;

        if (!materialId) {
          throw new Error(
            "Material ID is missing from material information."
          );
        }

        const selectedReasonId =
          reworkReason;

        if (!selectedReasonId) {
          throw new Error(
            "Rework Reason ID is missing."
          );
        }

        const returnFlow =
          reworkWizardPath
            ?.ReturnFlow ||
          reworkData?.Flow;

        const returnFlowId =
          returnFlow?.Id;

        const returnFlowDefinitionId =
          returnFlow
            ?.DefinitionId;

        const gotoFlow =
          reworkWizardPath
            ?.GotoFlow;

        const gotoFlowId =
          gotoFlow?.Id;

        const gotoFlowDefinitionId =
          gotoFlow
            ?.DefinitionId;

        const gotoStepRef =
          reworkWizardPath
            ?.GotoStep
            ?.$ref;

        const gotoStep =
          gotoStepRef
            ? findObjectByRef(
              reworkWizardPath,
              gotoStepRef
            ) ||
            reworkWizardPath
            : reworkWizardPath
              ?.GotoStep;

        const gotoStepId =
          gotoStep?.Id;

        const returnStep =
          reworkWizardPath
            ?.ReturnStep;

        const sourceStep =
          reworkWizardPath
            ?.SourceStep;

        const returnStepId =
          returnStep?.Id ||
          sourceStep?.Id;

        const reworkPathId =
          reworkWizardPath?.Id;

        if (!returnFlowId) {
          throw new Error(
            "Return Flow ID is missing from Rework Path information."
          );
        }

        if (
          !returnFlowDefinitionId
        ) {
          throw new Error(
            "Return Flow Definition ID is missing from Rework Path information."
          );
        }

        if (!gotoFlowId) {
          throw new Error(
            "Go To Flow ID is missing from Rework Path information."
          );
        }

        if (
          !gotoFlowDefinitionId
        ) {
          throw new Error(
            "Go To Flow Definition ID is missing from Rework Path information."
          );
        }

        if (!gotoStepId) {
          throw new Error(
            "Go To Step ID is missing from Rework Path information."
          );
        }

        if (!returnStepId) {
          throw new Error(
            "Return Step ID is missing from Rework Path information."
          );
        }

        if (!reworkPathId) {
          throw new Error(
            "Rework Path ID is missing from Rework Path information."
          );
        }

        const reworkPayload = {
          $type:
            "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.ComplexReworkMaterialInput, Cmf.Navigo.BusinessOrchestration",

          Material: {
            $type:
              "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
            Id: materialId
          },

          MaterialOffFlow: {
            $type:
              "Cmf.Navigo.BusinessObjects.MaterialOffFlow, Cmf.Navigo.BusinessObjects",

            Reason: {
              Id: selectedReasonId
            },

            ReturnFlow: {
              $type:
                "Cmf.Navigo.BusinessObjects.Flow, Cmf.Navigo.BusinessObjects",
              DefinitionId:
                returnFlowDefinitionId,
              Id: returnFlowId
            },

            ReworkPath: {
              $type:
                "Cmf.Navigo.BusinessObjects.ReworkPath, Cmf.Navigo.BusinessObjects",

              GotoFlow: {
                $type:
                  "Cmf.Navigo.BusinessObjects.Flow, Cmf.Navigo.BusinessObjects",
                DefinitionId:
                  gotoFlowDefinitionId,
                Id: gotoFlowId
              },

              GotoStep: {
                $type:
                  "Cmf.Navigo.BusinessObjects.Step, Cmf.Navigo.BusinessObjects",
                Id: gotoStepId
              },

              ReturnStep: {
                $type:
                  "Cmf.Navigo.BusinessObjects.Step, Cmf.Navigo.BusinessObjects",
                Id: returnStepId
              },

              Id: reworkPathId
            }
          },

          IgnoreLastServiceId:
            true
        };

        const reworkResponse =
          await POST<any>(
            COMPLEX_REWORK_MATERIAL,
            reworkPayload
          );

        const message =
          reworkResponse?.Message ||
          reworkResponse?.message ||
          "Rework operation completed successfully.";
        showToast("success", message);
        setIsReworkModalOpen(false);
      } catch (err: any) {
        console.error("Rework submit failed:", err);

        const errorMessage =
          err?.response?.data
            ?.Message ||
          err?.response?.data
            ?.message ||
          err?.Message ||
          err?.message ||
          "Failed to perform rework action.";
        showToast("error", errorMessage);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

  const handleReset = () => {
    setIsResetting(true);
    setReworkReason("");
    setGoToFlowPath([]);
    setReturnFlowPath("");
    setSelectedFlowPath("");
    setSelectedFlowStep("");
    setReworkStepName("");
    setLotName("");
    setReworkData(null);
    setError(null);
    setToasts([]);
    setReworkReasonError(false);
    setReworkReasonOptions([]);
    setMaterialReworkReasons([]);
    setFlowPathOptions([]);
    setFlowName("");
    setFlowSteps([]);
    setFlowNodes([]);
    setFlowEdges([]);
    setReworkWizardPath(null);
    setCurrentFlowPathFlow(null);
    setFlowWorkflowHistory([]);
    setIsReworkModalOpen(false);
    setIsFlowPathModalOpen(false);
    setIsFlowModalOpen(false);

    setTimeout(() => {
      setIsResetting(false);
    }, 300);
  };

  const handleReworkCancel =
    () => {
      setIsReworkModalOpen(false);
    };

  const displayFlowPathTitle =
    currentFlowPathFlow?.Revision !==
      undefined &&
      currentFlowPathFlow?.Revision !==
      null &&
      String(
        currentFlowPathFlow.Revision
      ) !== ""
      ? `${currentFlowPathFlow?.Name || "Flow"} [${currentFlowPathFlow.Revision}]`
      : currentFlowPathFlow?.Name ||
      flowName ||
      "Flow Path";

  return (
    <Styled.PageContainer>
      {toasts.map((item) => (
        <Toast
          key={item.id}
          variant={item.variant}
          message={item.message}
          onClose={() =>
            removeToast(item.id)
          }
        />
      ))}

      <Styled.TopControls>
        <Styled.SearchBox>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Enter Material Number *"
            value={lotName}
            onChange={(e) => {
              const value =
                e.target.value;

              setLotName(value);
              setError(null);
              setToasts([]);

              if (reworkData) {
                setReworkData(null);
                setReworkReason("");
                setGoToFlowPath([]);
                setReturnFlowPath("");
                setSelectedFlowPath("");
                setSelectedFlowStep("");
                setReworkStepName("");
                setReworkReasonError(
                  false
                );
                setReworkReasonOptions(
                  []
                );
                setMaterialReworkReasons(
                  []
                );
                setFlowPathOptions([]);
                setFlowName("");
                setFlowSteps([]);
                setFlowNodes([]);
                setFlowEdges([]);
                setReworkWizardPath(
                  null
                );
                setCurrentFlowPathFlow(
                  null
                );
                setFlowWorkflowHistory(
                  []
                );
                setIsReworkModalOpen(
                  false
                );
                setIsFlowPathModalOpen(
                  false
                );
              }
            }}
            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !reworkData &&
                !isLoading
              ) {
                fetchReworkDetails(
                  materialNumber
                );
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                const materialNumber =
                  lotName.trim();

                if (
                  materialNumber &&
                  !reworkData &&
                  !isLoading
                ) {
                  fetchReworkDetails(
                    materialNumber
                  );
                }
              }
            }}
            fullWidth
            autoFocus
            sx={{
              "& fieldset": {
                border: "none"
              },
              input: {
                padding:
                  "10px 14px"
              }
            }}
          />
        </Styled.SearchBox>

        <Styled.ActionButtons>
          <Button
            type="reset"
            onClick={
              handleReset
            }
            disabled={
              isResetting
            }
          />
        </Styled.ActionButtons>
      </Styled.TopControls>

      {(isLoading ||
        isResetting) && (
          <Loader />
        )}

      <WipDataCard
        materialData={
          reworkData
        }
        title="Materials Details"
        onFlowClick={() =>
          setIsFlowModalOpen(
            true
          )
        }
      />

      {reworkData && (
        <FlowStepsModal
          isOpen={
            isFlowModalOpen
          }
          onClose={() =>
            setIsFlowModalOpen(
              false
            )
          }
          materialData={
            reworkData
          }
        />
      )}

      {isReworkModalOpen &&
        reworkData && (
          <Styled.ReworkModalOverlay>
            <Styled.ReworkModal>
              <Styled.ReworkModalHeader>
                <Styled.ReworkModalTitle>
                  <span>
                    Rework Material
                  </span>
                </Styled.ReworkModalTitle>

                <Styled.HelpIcon
                  onClick={
                    handleReworkCancel
                  }
                >
                  ×
                </Styled.HelpIcon>
              </Styled.ReworkModalHeader>

              <Styled.ReworkForm>
                <Styled.FlowPathRow>
                  <Styled.ReworkFieldLabel>
                    Flow Path:
                  </Styled.ReworkFieldLabel>

                  <Styled.FlowPathValue
                    onClick={
                      handleFlowPathClick
                    }
                  >

                    {returnFlowPath ||
                      "Select Flow Path"}
                  </Styled.FlowPathValue>
                </Styled.FlowPathRow>
                <Styled.ReworkFieldRow>
                  <Styled.ReworkFieldLabel>
                    <Styled.RequiredMark>
                      *
                    </Styled.RequiredMark>
                    Reason:
                  </Styled.ReworkFieldLabel>

                  <Styled.ReworkFieldControl>
                    <DropDown
                      value={
                        reworkReason
                      }
                      options={
                        reworkReasonOptions
                      }
                      setSelectedOptions={
                        setReworkReason
                      }
                      setIsError={
                        setReworkReasonError
                      }
                      isError={
                        reworkReasonError
                      }
                      required
                      emptyValue="Select Rework Reason"
                    />
                  </Styled.ReworkFieldControl>
                </Styled.ReworkFieldRow>

                <Styled.ReworkFieldRow>
                  <Styled.ReworkFieldLabel>
                    <Styled.RequiredMark>
                      *
                    </Styled.RequiredMark>
                    Go To Flow Path:
                  </Styled.ReworkFieldLabel>

                  <Styled.ReworkFieldControl>

                    <DropDown
                      value={goToFlowPath[0] || ""}
                      options={flowPathOptions}
                      setSelectedOptions={(value) => {
                        if (typeof value === "string") {
                          setGoToFlowPath(value ? [value] : []);
                        }
                      }}
                      required
                      emptyValue="Select Go To Flow Path"
                    />
                  </Styled.ReworkFieldControl>
                </Styled.ReworkFieldRow>

                <Styled.ReworkFieldRow>
                  <Styled.ReworkFieldLabel>
                    <Styled.RequiredMark>
                      *
                    </Styled.RequiredMark>
                    Return Flow Path:
                  </Styled.ReworkFieldLabel>

                  <Styled.ReworkFieldControl>
                    <Styled.ReturnFlowPathRow>
                      <Styled.ReturnFlowPathInput>
                        <TextField
                          fullWidth
                          size="small"
                          value={
                            selectedFlowPath
                          }
                          placeholder="Select Return Flow Path"
                          slotProps={{
                            htmlInput: {
                              readOnly:
                                true
                            }
                          }}
                          sx={{
                            "& fieldset":
                            {
                              border:
                                "none"
                            }
                          }}
                        />
                      </Styled.ReturnFlowPathInput>

                      <Styled.ReturnFlowStepInput>
                        <TextField
                          fullWidth
                          size="small"
                          value={
                            selectedFlowStep
                          }
                          placeholder="Select Step"
                          slotProps={{
                            htmlInput: {
                              readOnly:
                                true
                            }
                          }}
                          sx={{
                            "& fieldset":
                            {
                              border:
                                "none"
                            }
                          }}
                        />

                        <Styled.ClearIcon
                          onClick={() => {
                            setSelectedFlowStep(
                              ""
                            );
                          }}
                        />
                      </Styled.ReturnFlowStepInput>
                    </Styled.ReturnFlowPathRow>
                  </Styled.ReworkFieldControl>
                </Styled.ReworkFieldRow>
              </Styled.ReworkForm>

              <Styled.ReworkModalFooter>
                <Button
                  type="submit"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    !reworkData ||
                    isLoading
                  }
                />
              </Styled.ReworkModalFooter>
            </Styled.ReworkModal>
          </Styled.ReworkModalOverlay>
        )}

      {isFlowPathModalOpen && (
        <Styled.FlowPathModalOverlay>
          <Styled.FlowPathModal>
            <Styled.FlowPathModalHeader>
              <Styled.FlowPathTitle>
                {flowWorkflowHistory.length >
                  0 && (
                    <button
                      type="button"
                      onClick={
                        handleFlowPathBack
                      }
                      style={{
                        background:
                          "none",
                        border:
                          "none",
                        color:
                          "white",
                        cursor:
                          "pointer",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "1.25rem",
                        padding:
                          "4px",
                        marginRight:
                          "8px"
                      }}
                    >
                      <IoArrowBack />
                    </button>
                  )}

                <Styled.FlowPathHeaderIcon>
                  ↻
                </Styled.FlowPathHeaderIcon>

                {
                  displayFlowPathTitle
                }
              </Styled.FlowPathTitle>

              <Styled.HelpIcon
                onClick={() => {
                  setReturnFlowPath(
                    flowPathBeforeSelectionRef.current
                  );

                  setIsFlowPathModalOpen(false);
                  setFlowWorkflowHistory([]);
                  setCurrentFlowPathFlow(null);
                }}
              >
                ×
              </Styled.HelpIcon>
            </Styled.FlowPathModalHeader>

            <Styled.FlowTreeContainer>
              {flowNodes.length >
                0 ? (
                <ReactFlow
                  nodes={
                    flowNodes
                  }
                  edges={
                    flowEdges
                  }
                  nodeTypes={
                    nodeTypes
                  }
                  onNodesChange={
                    onNodesChange
                  }
                  onEdgesChange={
                    onEdgesChange
                  }
                  onNodeClick={
                    handleFlowNodeClick
                  }
                  fitView
                  panOnDrag
                  zoomOnScroll
                  zoomOnPinch
                  minZoom={0.3}
                  maxZoom={2}
                  fitViewOptions={{
                    padding:
                      0.2
                  }}
                  proOptions={{
                    hideAttribution:
                      true
                  }}
                />
              ) : (
                <div
                  style={{ textAlign: "center", color: "#64748b", marginTop: "40px" }}>
                  No flow steps found.
                </div>
              )}
            </Styled.FlowTreeContainer>
          </Styled.FlowPathModal>
        </Styled.FlowPathModalOverlay>
      )}
    </Styled.PageContainer>
  );
};
export default ReworkPage;