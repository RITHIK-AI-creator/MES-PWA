import React, { useState, useEffect, useRef } from "react";
import * as Styled from "./index.styled";
import { GET, POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  EXECUTE_QUERY,
  COMPLEX_TRACK_OUT_MATERIALS,
  GET_DISPATCH_LIST,
  DISPATCH_MATERIALS,
  GET_DATA_FOR_TRACK_IN_WIZARD,
  GET_DATA_FOR_TRACK_OUT_WIZARD,
  COMPLEX_TRACK_IN_MATERIALS,
  GET_DATA_FOR_MOVE_NEXT_WIZARD,
  COMPLEX_MOVE_TO_NEXT_STEP,
  BATCH_EXECUTE,
  PERFORM_MATERIAL_CHECKLIST_ITEMS,
  LOAD_DATA_COLLECTION_PARAMETER_INFORMATION
} from "../../api";
import { Box, TextField } from "@mui/material";
import { FaBarcode } from "react-icons/fa";
import Button from "../../Library/Button";
import DropDown from "../../Library/DropDown";
import Loader from "../../Library/Loader";
import WipDataCard from "../../components/WipDataCard";
import FlowStepsModal from "../../components/FlowStepsModal";
import Toast from "../../components/Toast";
import { useLocation } from "react-router-dom";
import { STEPPER_CONFIG, extractErrorMessage, offsetObjectIds } from "../../Helpers/common";
import DataCollectionModal from "../../components/DataCollectionModal";



import CheckListModal from "../../components/CheckListModal";
import BOMModal from "../../components/BOMModal";

export const isPassThroughStep = (data: any): boolean => {
  if (!data || !data.Step) return false;
  // Inspect only the material's current active Step metadata from CMF
  return data.Step.IsPassThrough === true;
};

const MaterialPage = () => {
  const location = useLocation();
  const [scanName, setScanName] = useState("");
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [materialData, setMaterialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ variant: "success" | "error"; message: string } | null>(null);

  const scanInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (window as any)._currentMaterialData = materialData;
  }, [materialData]);

  // On initial mount, focus scan input
  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  // Dispatch state
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // Auto-focus resource dropdown when material is scanned and ready for dispatch
  useEffect(() => {
    if (
      materialData?.SystemState === 0 &&
      !isPassThroughStep(materialData) &&
      !isLoadingResources &&
      resources.length > 0
    ) {
      const timer = setTimeout(() => {
        resourceInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [materialData?.Id, materialData?.SystemState, isLoadingResources, resources.length]);

  // Wizard pre-fetched state
  const [trackInWizardData, setTrackInWizardData] = useState<any>(null);
  const [trackOutWizardData, setTrackOutWizardData] = useState<any>(null);
  const [moveNextWizardData, setMoveNextWizardData] = useState<any>(null);
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<string[]>([]);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [fetchedChecklistData, setFetchedChecklistData] = useState<any>(null);
  const [isDcModalOpen, setIsDcModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [selectedDcData, setSelectedDcData] = useState<any>(null);
  const [collectedDcPoints, setCollectedDcPoints] = useState<any[]>([]);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);
  const [dcTrackInSkipped, setDcTrackInSkipped] = useState(false);
  const lastKnownDcRef = useRef<any>(null);

  const getTrackInDataCollection = (wizardData: any, matData: any) => {
    const dc = wizardData?.DataCollection ||
      wizardData?.DataCollections?.[0] ||
      wizardData?.DataCollectionInstance ||
      (wizardData?.DataCollectionPointsAsXml ? { DataCollectionPointsAsXml: wizardData.DataCollectionPointsAsXml } : null) ||
      (matData?.SystemState === 1 && matData?.CurrentDataCollectionInstance?.DataCollection?.Id ? matData.CurrentDataCollectionInstance : null);
    if (dc) {
      lastKnownDcRef.current = dc;
    }
    return dc;
  };

  const getTrackOutDataCollection = (wizardData: any, matData: any) => {
    let dc = wizardData?.DataCollection || 
             wizardData?.DataCollections?.[0] || 
             wizardData?.DataCollectionInstance ||
             wizardData?.DataCollectionInstances?.[0] ||
             wizardData?.Materials?.[0]?.CurrentDataCollectionInstance ||
             wizardData?.Materials?.[0]?.DataCollection;
    const currentDc = matData?.CurrentDataCollectionInstance;
    if (dc && dc.DataCollection && !dc.DataCollection.Id && currentDc) {
      dc = currentDc;
    } else if (!dc && matData?.SystemState === 2 && currentDc) {
      dc = currentDc;
    }
    if (!dc && matData?.SystemState === 2 && lastKnownDcRef.current) {
      dc = lastKnownDcRef.current;
    }
    if (wizardData?.DataCollectionPointsAsXml) {
      dc = dc || {};
      dc.DataCollectionPointsAsXml = wizardData.DataCollectionPointsAsXml;
    }
    return dc;
  };

  const getMoveNextDataCollection = (wizardData: any, matData: any) =>
    wizardData?.DataCollection ||
    wizardData?.DataCollections?.[0] ||
    wizardData?.DataCollectionInstance ||
    (wizardData?.DataCollectionPointsAsXml ? { DataCollectionPointsAsXml: wizardData.DataCollectionPointsAsXml } : null) ||
    (matData?.SystemState === 3 && matData?.CurrentDataCollectionInstance?.DataCollection?.Id ? matData.CurrentDataCollectionInstance : null);

  const loadAndOpenDataCollection = async (dcData: any) => {
    setIsLoading(true);
    console.log("loadAndOpenDataCollection - Input dcData:", dcData);
    try {
      let dcDefinition = dcData?.DataCollection || (dcData?.Id ? dcData : null);
      let dcInstance = dcData?.DataCollectionInstance || (dcData?.$type?.includes("DataCollectionInstance") ? dcData : null);
      
      const matData = (window as any)._currentMaterialData || materialData;
      if (!dcInstance && matData?.CurrentDataCollectionInstance) {
         dcInstance = matData.CurrentDataCollectionInstance;
      }
      
      if (!dcDefinition?.Id && dcInstance?.DataCollection?.Id) {
         dcDefinition = dcInstance.DataCollection;
      } else if (!dcDefinition?.Id && matData?.CurrentDataCollectionInstance?.DataCollection?.Id) {
         dcDefinition = matData.CurrentDataCollectionInstance.DataCollection;
      }

      console.log("loadAndOpenDataCollection - Extracted dcDefinition:", dcDefinition, "dcInstance:", dcInstance);

      if (dcDefinition && dcDefinition.Id) {
        console.log("loadAndOpenDataCollection - Calling API because dcDefinition.Id is:", dcDefinition.Id);
        const payload: any = {
          $type: "Cmf.Navigo.BusinessOrchestration.EdcManagement.DataCollectionManagement.InputObjects.LoadDataCollectionParameterInformationInput, Cmf.Navigo.BusinessOrchestration",
          DataCollection: {
            $type: "Cmf.Navigo.BusinessObjects.DataCollection, Cmf.Navigo.BusinessObjects",
            Id: dcDefinition.Id,
            Name: dcDefinition.Name
          },
          LoadReadingNames: true,
          LoadSampleNames: true,
          LevelsToLoad: 1
        };

        if (dcInstance) {
          payload.DataCollectionInstance = dcInstance;
        }

        // Bulletproof fix to prevent duplicate $id serialization for DataCollection
        if (payload.DataCollectionInstance && payload.DataCollection) {
          if (payload.DataCollectionInstance.DataCollection && payload.DataCollectionInstance.DataCollection.Id === payload.DataCollection.Id) {
             const refId = payload.DataCollection.$id || "999";
             payload.DataCollection.$id = refId;
             payload.DataCollectionInstance = { 
               ...payload.DataCollectionInstance, 
               DataCollection: { $ref: refId } 
             };
          }
        }
        console.log("DEBUG: Final payload being sent:", JSON.stringify(payload, null, 2));

        const resolveRefs = (obj: any) => {
          if (!obj || typeof obj !== 'object') return obj;
          const refMap = new Map();
          const findIds = (node: any) => {
            if (!node || typeof node !== 'object') return;
            if (node.$id) refMap.set(node.$id, node);
            if (Array.isArray(node)) node.forEach(findIds);
            else Object.values(node).forEach(findIds);
          };
          const replaceRefs = (node: any, visited = new Set()) => {
            if (!node || typeof node !== 'object' || visited.has(node)) return node;
            visited.add(node);
            if (Array.isArray(node)) {
              for (let i = 0; i < node.length; i++) {
                if (node[i] && typeof node[i] === 'object') {
                  if (node[i].$ref && refMap.has(node[i].$ref)) node[i] = refMap.get(node[i].$ref);
                  else replaceRefs(node[i], visited);
                }
              }
            } else {
              for (const key of Object.keys(node)) {
                const val = node[key];
                if (val && typeof val === 'object') {
                  if (val.$ref && refMap.has(val.$ref)) node[key] = refMap.get(val.$ref);
                  else replaceRefs(val, visited);
                }
              }
            }
            return node;
          };
          findIds(obj);
          return replaceRefs(obj);
        };

        const rawRes = await POST<any>(LOAD_DATA_COLLECTION_PARAMETER_INFORMATION, payload);
        const res = resolveRefs(rawRes);
        
        let paramsToUse = null;
        const fetchedRelations = res?.DataCollection?.RelationCollection?.CMFMapData?.find(
          (item: any) => item[0] === "DataCollectionParameter" || item[0] === "DataCollectionParameters"
        )?.[1];
        
        if (fetchedRelations) {
           paramsToUse = fetchedRelations;
        } else if (res?.DataCollectionParameters) {
           paramsToUse = res.DataCollectionParameters;
        }

        if (paramsToUse) {
          const dcDataCopy = { ...dcData };
          if (!dcDataCopy.RelationCollection) {
            dcDataCopy.RelationCollection = { CMFMapData: [] };
          } else if (!dcDataCopy.RelationCollection.CMFMapData) {
            dcDataCopy.RelationCollection.CMFMapData = [];
          }
          dcDataCopy.RelationCollection.CMFMapData = dcDataCopy.RelationCollection.CMFMapData.filter(
             (item: any) => item[0] !== "DataCollectionParameter" && item[0] !== "DataCollectionParameters"
          );
          dcDataCopy.RelationCollection.CMFMapData.push(["DataCollectionParameters", paramsToUse]);
          setSelectedDcData(dcDataCopy);
        } else {
          setSelectedDcData(dcData);
        }
      } else {
        setSelectedDcData(dcData);
      }
      setIsDcModalOpen(true);
    } catch (e) {
      console.error("Failed to load DC parameters", e);
      setSelectedDcData(dcData);
      setIsDcModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAndOpenChecklist = async () => {
    setIsLoading(true);
    try {
      const checklistInstance = materialData?.CurrentChecklistInstance;
      const chkData = checklistData || checklistInstance?.ParentEntity;
      
      if (chkData || checklistInstance) {
        const batchPayload = {
          $type: "Cmf.Foundation.BusinessOrchestration.GenericServiceManagement.InputObjects.BatchExecuteInput, Cmf.Foundation.BusinessOrchestration",
          Inputs: [] as any[]
        };
        
        if (chkData) {
          batchPayload.Inputs.push({
            $type: "Cmf.Foundation.BusinessOrchestration.ChecklistManagement.InputObjects.LoadChecklistItemsInput, Cmf.Foundation.BusinessOrchestration",
            Checklist: chkData
          });
        }
        
        if (checklistInstance) {
          batchPayload.Inputs.push({
            $type: "Cmf.Foundation.BusinessOrchestration.ChecklistManagement.InputObjects.LoadChecklistInstanceItemsInput, Cmf.Foundation.BusinessOrchestration",
            ChecklistInstance: checklistInstance
          });
        }

        const resp = await POST<any>(BATCH_EXECUTE, batchPayload);
        if (resp && resp.Outputs) {
          let foundItems: any[] = [];
          let foundInstanceItems: any[] = [];
            
            const extractData = (obj: any) => {
              if (!obj) return;
              if (Array.isArray(obj)) {
                obj.forEach(extractData);
                return;
              }
              if (typeof obj === 'object') {
                if (obj.$type && obj.$type.includes("BusinessObjects.ChecklistItem,")) {
                  foundItems.push(obj);
                }
                if (obj.$type && obj.$type.includes("BusinessObjects.ChecklistItemInstance,")) {
                  foundInstanceItems.push(obj);
                }
                for (const key in obj) {
                  // Only avoid ParentEntity to prevent cyclic loops, but DO NOT skip Checklist
                  if (key !== "ParentEntity") {
                    extractData(obj[key]);
                  }
                }
              }
            };
            
            extractData(resp.Outputs);

            let finalChecklist = {
                ...(checklistInstance || chkData),
                Name: chkData?.Name || checklistInstance?.Name || "Checklist",
                Items: foundItems,
                ChecklistInstanceItems: foundInstanceItems
            };
            
            // Deduplicate items just in case
            finalChecklist.Items = Array.from(new Map(finalChecklist.Items.map((item: any) => [item.Id, item])).values());
            finalChecklist.ChecklistInstanceItems = Array.from(new Map(finalChecklist.ChecklistInstanceItems.map((item: any) => [item.Id, item])).values());
            
            setFetchedChecklistData(finalChecklist);

            const alreadyCompletedIds = finalChecklist.ChecklistInstanceItems
              .filter((inst: any) => {
                const sysState = inst?.SystemState;
                return (
                  sysState === 2 || 
                  sysState === 3 || 
                  sysState === "Completed" || 
                  (typeof sysState === "string" && sysState.toLowerCase().includes("complete")) ||
                  inst?.UniversalState === 4 ||
                  inst?.IsCompleted === true
                );
              })
              .map((inst: any) => inst?.ParentEntity?.Id || inst?.Id)
              .filter(Boolean);

            if (alreadyCompletedIds.length > 0) {
              setCheckedChecklistItems(prev => Array.from(new Set([...prev, ...alreadyCompletedIds])));
            }
          }
        }
      } catch (e) {
        console.error("Failed to load checklist details:", e);
      } finally {
        setIsLoading(false);
      }
    setIsChecklistModalOpen(true);
  };

  const handleModalSubmit = async (dcPoints?: any[], checklistIds?: string[], isFromBom?: boolean) => {
    setIsModalSubmitting(true);
    
    if (dcPoints) setCollectedDcPoints(dcPoints);
    if (checklistIds) setCheckedChecklistItems(checklistIds);

    let success = false;
    const state = materialData?.SystemState;
    
    try {
      if (state === 1) {
        const isChecklistCompleted_lbl = materialData?.CurrentChecklistInstance?.UniversalState === 4;
        const activeChecklistInstance = materialData?.CurrentChecklistInstance;
        const clExecutionMode_lbl = checklistData?.ExecutionMode ?? checklistData?.ParentEntity?.ExecutionMode ?? activeChecklistInstance?.ExecutionMode ?? 0;
        let hasChecklist = false;
        if (!isChecklistCompleted_lbl) {
          if (clExecutionMode_lbl === 0) hasChecklist = !!activeChecklistInstance;
          else hasChecklist = !!checklistData || !!activeChecklistInstance;
        }

        const targetDC = getTrackInDataCollection(trackInWizardData, materialData);
        const hasDC = !!targetDC;

        // Transition from BOM
        if (isFromBom) {
          if (hasChecklist) {
            setIsBomModalOpen(false);
            await loadAndOpenChecklist();
            setIsModalSubmitting(false);
            return;
          } else if (hasDC) {
            setIsBomModalOpen(false);
            await loadAndOpenDataCollection(targetDC);
            setIsModalSubmitting(false);
            return;
          }
        }
        
        // Transition from Checklist
        if (checklistIds && !isFromBom) {
          if (clExecutionMode_lbl === 0) {
            success = await handlePerformChecklist(checklistIds);
            if (success && hasDC) {
              setIsChecklistModalOpen(false);
              await loadAndOpenDataCollection(targetDC);
              setIsModalSubmitting(false);
              return;
            }
          } else {
            if (hasDC) {
              setIsChecklistModalOpen(false);
              await loadAndOpenDataCollection(targetDC);
              setIsModalSubmitting(false);
              return;
            }
            success = await handleTrackIn(dcPoints, checklistIds);
          }
        } else {
            success = await handleTrackIn(dcPoints, checklistIds);
        }
      } else if (state === 2) {
        // Track-Out transitions
        const isChecklistCompleted_lbl = materialData?.CurrentChecklistInstance?.UniversalState === 4;
        const activeChecklistInstance = materialData?.CurrentChecklistInstance;
        const clExecutionMode_lbl = checklistData?.ExecutionMode ?? checklistData?.ParentEntity?.ExecutionMode ?? activeChecklistInstance?.ExecutionMode ?? 0;
        
        let hasChecklistItems_lbl = false;
        if (!isChecklistCompleted_lbl) {
          if (clExecutionMode_lbl === 0) hasChecklistItems_lbl = !!activeChecklistInstance;
          else hasChecklistItems_lbl = !!checklistData;
        }
        const targetDC = getTrackOutDataCollection(trackOutWizardData, materialData);
        const hasDC = !!targetDC;

        // Transition from BOM
        if (isFromBom) {
          if (hasChecklistItems_lbl) {
            setIsBomModalOpen(false);
            await loadAndOpenChecklist();
            setIsModalSubmitting(false);
            return;
          } else if (hasDC) {
            setIsBomModalOpen(false);
            await loadAndOpenDataCollection(targetDC);
            setIsModalSubmitting(false);
            return;
          }
        }

        // Transition from Checklist
        if (checklistIds && !isFromBom) {
          if (clExecutionMode_lbl === 0) {
            success = await handlePerformChecklist(checklistIds);
            if (success && hasDC) {
              setIsChecklistModalOpen(false);
              await loadAndOpenDataCollection(targetDC);
              setIsModalSubmitting(false);
              return;
            }
          } else {
            if (hasDC) {
              setIsChecklistModalOpen(false);
              await loadAndOpenDataCollection(targetDC);
              setIsModalSubmitting(false);
              return;
            }
            success = await handleTrackOut(dcPoints, checklistIds);
          }
        } else {
          success = await handleTrackOut(dcPoints, checklistIds);
        }
      } else if (state === 3 || isPassThroughStep(materialData)) {
        const targetDC = getMoveNextDataCollection(moveNextWizardData, materialData);
        const hasDC = !!targetDC;
        if (checklistIds && !isFromBom && hasDC) {
          setIsChecklistModalOpen(false);
          await loadAndOpenDataCollection(targetDC);
          setIsModalSubmitting(false);
          return;
        }
        success = await handleMoveNext(dcPoints, checklistIds);
      }
      } catch (err) {
      console.error("Modal submit error:", err);
    } finally {
      setIsModalSubmitting(false);
    }
    
    if (success) {
      setIsDcModalOpen(false);
      setIsChecklistModalOpen(false);
    }
  };

  const fetchMaterial = async (nameToFetch: string, isRefresh: boolean = false) => {
    if (!nameToFetch.trim()) return;
    
    setIsLoading(true);
    if (!isRefresh) {
      setMaterialData(null);
      setResources([]);
      setSelectedResourceId("");
      // Reset all modal and wizard states for new material
      setIsChecklistModalOpen(false);
      setFetchedChecklistData(null);
      setIsDcModalOpen(false);
      setIsBomModalOpen(false);
      setIsModalSubmitting(false);
      setCollectedDcPoints([]);
      setCheckedChecklistItems([]);
      setTrackInWizardData(null);
      setTrackOutWizardData(null);
      setMoveNextWizardData(null);
      setDcTrackInSkipped(false);
      lastKnownDcRef.current = null;
    }
    setError(null);
    try {
      // Step 1: Query Material by Name to get Id
      const queryPayload = {
        QueryObject: {
          $type: "Cmf.Foundation.BusinessObjects.QueryObject.QueryObject, Cmf.Foundation.BusinessObjects",
          EntityTypeName: "Material",
          Query: {
            Distinct: false,
            Filters: [
              {
                Name: "Name",
                ObjectName: "Material",
                Operator: 0,
                Value: nameToFetch.trim(),
                LogicalOperator: 1
              }
            ],
            Fields: [
              { Name: "Id", ObjectName: "Material", Alias: "Id" }
            ]
          }
        },
        PageNumber: 1,
        PageSize: 1
      };

      const queryResponse = await POST<any>(EXECUTE_QUERY, queryPayload);
      
      let materialId = null;
      if (queryResponse?.NgpDataSet?.T_Result?.[0]?.Id) {
        materialId = queryResponse.NgpDataSet.T_Result[0].Id;
      } else if (Array.isArray(queryResponse) && queryResponse[0]?.Id) {
        materialId = queryResponse[0].Id;
      }

      if (!materialId) {
        throw new Error("Material not found for the scanned name.");
      }

      // Step 2: Fetch Basic Information using the resolved Id
      const infoPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialBasicInformationInput, Cmf.Navigo.BusinessOrchestration",
        Material: {
          $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
          Id: materialId
        },
        IsLoadRelationsToContainer: true,
        IsLoadRelationsToResource: true,
        IsToLoadResourceDurables: true,
        IsLoadTopMost: true,
        LevelsToLoad: 2,
        RelationsToContainerLevelsToLoad: 1,
        RelationsToResourceLevelsToLoad: 2,
        RelationsToResourceDurableLevelsToLoad: 1,
        TopMostLevelsToLoad: 1,
        RecipeInstanceLevelsToLoad: 2
      };

      const response = await POST<any>(GET_MATERIAL_BASIC_INFO, infoPayload);
      
      let data = response;
      if (response?.Material) data = response.Material;
      else if (response?.Data?.Material) data = response.Data.Material;
      else if (response?.Entities?.[0]) data = response.Entities[0];
      
      // Set material data immediately so the WipDataCard appears without delay
      setMaterialData(data);
      if (data?.Name) {
        setScanName(data.Name);
      }

      const isPassThrough = isPassThroughStep(data);
      const isHoldMaterial = data?.HoldCount != null && Number(data.HoldCount) > 0;

      // Auto-load context data based on the SystemState or IsPassThrough
      if (isPassThrough) {
        await fetchMoveNextWizardData(data);
      } else if (data?.SystemState === 0) {
        if (!isHoldMaterial) {
          await fetchDispatchResources(data);
        }
      } else if (data?.SystemState === 1) {
        if (!isHoldMaterial) {
          await fetchTrackInWizardData(data);
        }
      } else if (data?.SystemState === 2) {
        // If there's an active long-running instance, don't fetch TrackOut wizard yet.
        const isChecklistActive = !!data?.CurrentChecklistInstance && data?.CurrentChecklistInstance?.UniversalState !== 4;
        const isLongRunning = isChecklistActive;
        if (!isLongRunning) {
          await fetchTrackOutWizardData(data);
        }
      } else if (data?.SystemState === 3) {
        await fetchMoveNextWizardData(data);
      }

    } catch (err: any) {
      console.error("Failed to fetch material information:", err);
      setError(err.message || "Failed to load material information. Please check the Name and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.autoScanName) {
      setScanName(location.state.autoScanName);
      fetchMaterial(location.state.autoScanName);
      
      // Clear state so it doesn't re-trigger unnecessarily if user navigates back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ─── Fetch available resources for dispatch ─────────────────────────────
  const fetchDispatchResources = async (material: any) => {
    setIsLoadingResources(true);
    try {
      const payload = {
        $type: "Cmf.Navigo.BusinessOrchestration.DispatchManagement.InputObjects.GetDispatchListForMaterialInput, Cmf.Navigo.BusinessOrchestration",
        Material: {
          $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
          Id: material.Id,
          Name: material.Name,
          LastServiceHistoryId: material.LastServiceHistoryId,
          UniversalState: material.UniversalState,
        },
      };
      const res = await POST<any>(GET_DISPATCH_LIST, payload);
      const list: any[] = res?.Resources ?? [];
      setResources(list);
      // Auto-select if only one resource available
      if (list.length === 1) setSelectedResourceId(list[0].Id);
    } catch (err: any) {
      console.error("Failed to load dispatch resources:", err);
      setError("Could not load available resources. Please try again.");
    } finally {
      setIsLoadingResources(false);
    }
  };

  // ─── Dispatch material to selected resource ──────────────────────────────
  
  const fetchTrackInWizardData = async (material: any) => {
    try {
      const wizardPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetDataForMultipleTrackInWizardInput, Cmf.Navigo.BusinessOrchestration",
        Materials: [
          {
            $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
            Id: material.Id,
            Name: material.Name,
            LastServiceHistoryId: material.LastServiceHistoryId,
            UniversalState: material.UniversalState,
          },
        ],
        MaterialLevelsToLoad: 3,
        ResourceLevelsToLoad: 1,
        Operation: 0,
        IgnoreLastServiceId: true,
      };
      const wizardResult = await POST<any>(GET_DATA_FOR_TRACK_IN_WIZARD, wizardPayload);
      setTrackInWizardData(wizardResult);
    } catch (err) {
      console.error("Failed to load TrackIn wizard data:", err);
    }
  };

  const fetchTrackOutWizardData = async (material: any) => {
    try {
      // NOTE: CMF standard API is typically GetDataForMultipleTrackOutWizardInput
      const wizardPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetDataForMultipleTrackOutAndMoveNextWizardInput, Cmf.Navigo.BusinessOrchestration",
        Materials: [
          {
            $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
            Id: material.Id,
            Name: material.Name,
            LastServiceHistoryId: material.LastServiceHistoryId,
            UniversalState: material.UniversalState,
          },
        ],
        MaterialLevelsToLoad: 3,
        BinningTreeLevelsToLoad: 1,
        TopMostMaterialLevelsToLoad: 3,
        ChecklistLevelsToLoad: 1,
        ResourceLevelsToLoad: 1,
        DataCollectionInstanceLevelsToLoad: 3,
        DataCollectionLevelsToLoad: 3,
        IsToLoadLossMultimedia: false,
        Operation: 0,
        IgnoreLastServiceId: true,
      };
      const wizardResult = await POST<any>(GET_DATA_FOR_TRACK_OUT_WIZARD, wizardPayload);
      setTrackOutWizardData(wizardResult);
    } catch (err) {
      console.error("Failed to load TrackOut wizard data:", err);
    }
  };

  const fetchMoveNextWizardData = async (material: any) => {
    try {
      const wizardPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetDataForMultipleMoveNextWizardInput, Cmf.Navigo.BusinessOrchestration",
        Materials: [
          {
            $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
            Id: material.Id,
            Name: material.Name,
            LastServiceHistoryId: material.LastServiceHistoryId,
            UniversalState: material.UniversalState,
          }
        ],
        MaterialLevelsToLoad: 3,
        TopMostMaterialLevelsToLoad: 3,
        DataCollectionLevelsToLoad: 3,
        IgnoreLastServiceId: true,
        IsSpecialMoveNext: false
      };
      const wizardResult = await POST<any>(GET_DATA_FOR_MOVE_NEXT_WIZARD, wizardPayload);
      setMoveNextWizardData(wizardResult);
    } catch (err) {
      console.error("Failed to load MoveNext wizard data:", err);
    }
  };

  
  const buildChecklistParametersArray = (checklistData: any, overrideChecklistIds?: string[]) => {
    const checkedItemsToUse = overrideChecklistIds || checkedChecklistItems;
    if (!checklistData || !checklistData.Items || checklistData.Items.length === 0) return null;

    const mandatoryItems = checklistData.Items.filter((i: any) => !i.IsOptional);
    const missing = mandatoryItems.filter((i: any) => !checkedItemsToUse.includes(i.Id));
    
    // Validation removed as per request
    // if (missing.length > 0) {
    //   throw new Error("Please complete all mandatory checklist items before submitting.");
    // }

    if (checkedItemsToUse.length === 0) return null;

    const checklistParamsArray = checkedItemsToUse.map((itemId, idx) => {
      const originalItem = checklistData.Items.find((i: any) => i.Id === itemId);
      const now = new Date().toISOString();
      return {
        $type: "Cmf.Foundation.BusinessObjects.PerformImmediateInputParameters, Cmf.Foundation.BusinessObjects",
        ChecklistItemInstance: {
          $type: "Cmf.Foundation.BusinessObjects.ChecklistItemInstance, Cmf.Foundation.BusinessObjects",
          ParentEntity: originalItem,
          SystemState: 3,
          Name: originalItem.Name,
          ExecutionOrder: idx + 1,
          ChecklistItemInstanceParameters: {
            $type: "Cmf.Foundation.BusinessObjects.ChecklistItemInstanceParameterCollection, Cmf.Foundation.BusinessObjects",
            $values: []
          },
          BeginDate: now,
          EndDate: now
        },
        Parameters: {
          $typeCMF: "CMFMap",
          CMFMapData: []
        },
        PerformChecklistOperation: 3
      };
    });

    return checklistParamsArray;
  };

  const handleDispatch = async () => {
    if (!materialData?.Id || !selectedResourceId) return;

    const selectedResource = resources.find((r) => r.Id === selectedResourceId);
    if (!selectedResource) return;

    setIsLoading(true);
    setError(null);

    // Offset $id and $ref in selectedResource so they never collide with materialData's $id references in Newtonsoft.Json
    const safeResource = offsetObjectIds(selectedResource, 10000);

    const dispatchPayload = {
      $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.DispatchMaterialsInput, Cmf.Navigo.BusinessOrchestration",
      IgnoreLastServiceId: true,
      Materials: {
        $typeCMF: "CMFMap",
        CMFMapData: [
          [
            materialData,
            {
              $type: "Cmf.Navigo.BusinessObjects.DispatchMaterialParameters, Cmf.Navigo.BusinessObjects",
              Resource: safeResource,
              Order: 0,
            },
          ],
        ],
      },
    };

    try {
      const result = await POST<any>(DISPATCH_MATERIALS, dispatchPayload);
      setToast({
        variant: "success",
        message: result?.Message || `${materialData.Name} dispatched to ${selectedResource.Name} successfully.`,
      });
      // Refresh — new SystemState will be 1 (Dispatched)
      await fetchMaterial(materialData.Name || scanName);
    } catch (err: any) {
      console.error("Dispatch failed:", err);
      const errMsg = extractErrorMessage(err, "Dispatch failed. Please try again.");
      setError(errMsg);
      setToast({ variant: "error", message: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Track Out ───────────────────────────────────────────────────────────
  const handlePerformChecklist = async (checklistIds: string[]): Promise<boolean> => {
    if (!materialData || !materialData.Id || !fetchedChecklistData) return false;

    setIsLoading(true);

    let freshMaterial = materialData;
    try {
      const getMatPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialBasicInformationInput, Cmf.Navigo.BusinessOrchestration",
        Material: {
          $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
          Id: materialData.Id
        }
      };
      const res = await POST<any>(GET_MATERIAL_BASIC_INFO, getMatPayload);
      if (res && res.Material) {
        freshMaterial = res.Material;
      } else if (res && res.Data && res.Data.Material) {
        freshMaterial = res.Data.Material;
      } else if (res && res.Entities && res.Entities.length > 0) {
        freshMaterial = res.Entities[0];
      }
    } catch (e) {
      console.warn("Could not fetch fresh material data for checklist submit", e);
    }

    const cleanPayload = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(cleanPayload);
      if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          if (key !== '$id' && key !== '$ref') {
            newObj[key] = cleanPayload(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    };

    const payload = {
      $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.PerformMaterialChecklistItemsInput, Cmf.Navigo.BusinessOrchestration",
      ItemsAndParameters: [] as any[],
      IgnoreLastServiceId: true
    };

    const instances = fetchedChecklistData.ChecklistInstanceItems || [];
    const selectedInstances = checklistIds
      .map((id) => instances.find((inst: any) => inst?.ParentEntity?.Id === id || inst?.Id === id))
      .filter(Boolean);

    // Sort strictly by Order ascending so that Order 1 executes before Order 2, 3, etc.
    selectedInstances.sort((a: any, b: any) => {
      const orderA = a.Order ?? a.ParentEntity?.Order ?? 0;
      const orderB = b.Order ?? b.ParentEntity?.Order ?? 0;
      return orderA - orderB;
    });

    selectedInstances.forEach((instance: any) => {
      if (instance) {
        const sysState = instance.SystemState;
        const isCompleted = 
          sysState === 2 || 
          sysState === 3 || 
          sysState === "Completed" || 
          (typeof sysState === "string" && sysState.toLowerCase().includes("complete")) ||
          instance.UniversalState === 4 ||
          instance.IsCompleted === true;

        if (isCompleted) {
          // Skip already completed checklist items to avoid "Invalid operation Close on Checklist Item Instance ... SystemState is Completed"
          return;
        }
        
        let instanceBeginDate = instance.BeginDate;
        let instanceEndDate = instance.EndDate;
        if (!instanceBeginDate || instanceBeginDate.includes("0001-01-01")) instanceBeginDate = new Date().toISOString();
        if (!instanceEndDate || instanceEndDate.includes("0001-01-01")) instanceEndDate = new Date().toISOString();

        // Build start instance (Operation 0, SystemState: 1, BeginDate only)
        const startInstance = cleanPayload(instance);
        startInstance.SystemState = 1;
        startInstance.BeginDate = instanceBeginDate;
        delete startInstance.EndDate;

        // Build close instance (Operation 3, SystemState: 3, BeginDate and EndDate)
        const closeInstance = cleanPayload(instance);
        closeInstance.SystemState = 3;
        closeInstance.BeginDate = instanceBeginDate;
        closeInstance.EndDate = instanceEndDate;
        
        // Manually build Material to include ONLY primitive fields and CurrentChecklistInstance
        const materialObj: any = {
          $id: "1",
          $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
          Id: freshMaterial.Id,
          Name: freshMaterial.Name,
          SystemState: freshMaterial.SystemState,
          UniversalState: freshMaterial.UniversalState,
          LastOperationHistorySeq: freshMaterial.LastOperationHistorySeq,
          LastServiceHistoryId: freshMaterial.LastServiceHistoryId,
          ObjectLocked: freshMaterial.ObjectLocked || false,
          LockType: freshMaterial.LockType || 0
        };

        if (freshMaterial.CurrentChecklistInstance) {
          materialObj.CurrentChecklistInstance = cleanPayload(freshMaterial.CurrentChecklistInstance);
        }

        const isFirst = payload.ItemsAndParameters.length === 0;

        // Step 1: PerformChecklistOperation 0 (Start)
        payload.ItemsAndParameters.push({
          $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.PerformMaterialChecklistItemInput, Cmf.Navigo.BusinessOrchestration",
          Material: isFirst ? materialObj : {
            $ref: "1"
          },
          ChecklistItemInstance: startInstance,
          PerformChecklistOperation: 0,
          Parameters: { $typeCMF: "CMFMap", CMFMapData: [] },
          IgnoreLastServiceId: true
        });

        // Step 2: PerformChecklistOperation 3 (Close)
        payload.ItemsAndParameters.push({
          $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.PerformMaterialChecklistItemInput, Cmf.Navigo.BusinessOrchestration",
          Material: {
            $ref: "1"
          },
          ChecklistItemInstance: closeInstance,
          PerformChecklistOperation: 3,
          Parameters: { $typeCMF: "CMFMap", CMFMapData: [] },
          IgnoreLastServiceId: true
        });
      }
    });

    if (payload.ItemsAndParameters.length === 0) {
      setToast({ variant: "success", message: "Checklist is already completed." });
      await fetchMaterial(materialData.Name || scanName);
      return true;
    }

    try {
      const res = await POST<any>(PERFORM_MATERIAL_CHECKLIST_ITEMS, payload);
      setToast({ variant: "success", message: res?.Message || "Checklist performed successfully!" });
      await fetchMaterial(materialData.Name || scanName);
      return true;
    } catch (err: any) {
      console.error("Perform checklist error:", err);
      const errMsg = extractErrorMessage(err, "Failed to perform checklist.");
      setError(errMsg);
      setToast({ variant: "error", message: errMsg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOut = async (overrideDcPoints?: any[], overrideChecklistIds?: string[]): Promise<boolean> => {
    if (!materialData || !materialData.Id) return false;

    setIsLoading(true);
    setError(null);

    
    const fullMaterial = trackOutWizardData?.Materials?.[0] || {
      $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
      Id: materialData.Id,
      Name: materialData.Name,
      LastServiceHistoryId: materialData.LastServiceHistoryId,
      UniversalState: materialData.UniversalState,
    };

    const cleanPayload = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(cleanPayload);
      if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          if (key !== '$id' && key !== '$ref') {
            newObj[key] = cleanPayload(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    };

    const dcPointsToUse = overrideDcPoints || collectedDcPoints;

    const trackOutPayload = {
      $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.ComplexTrackOutMaterialsInput, Cmf.Navigo.BusinessOrchestration",
      IgnoreLastServiceId: true,
      StateModel: null,
      Material: {
        $typeCMF: "CMFMap",
        CMFMapData: [
          [
            {
              $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
              Id: materialData.Id,
              Name: materialData.Name,
              LastServiceHistoryId: materialData.LastServiceHistoryId,
              UniversalState: materialData.UniversalState,
            },
            {
              $type: "Cmf.Navigo.BusinessObjects.ComplexTrackOutParameters, Cmf.Navigo.BusinessObjects",
              BinQuantities: null,
              MaterialSubProducts: null,
              ChecklistParameters: buildChecklistParametersArray(trackOutWizardData?.Checklists?.[0] || trackOutWizardData?.TrackOutChecklists?.[0] || trackOutWizardData?.Checklist || materialData?.Checklist, overrideChecklistIds) || null,
              CurrentDataCollectionPoints: dcPointsToUse.length > 0 ? {
                $type: "Cmf.Navigo.BusinessObjects.DataCollectionPointCollection, Cmf.Navigo.BusinessObjects",
                $values: cleanPayload(dcPointsToUse),
              } : null,
              DataCollectionPointsToDelete: null,
              SkipDCValidation: false,
            },
          ],
        ],
      },
    };

    try {
      const result = await POST<any>(COMPLEX_TRACK_OUT_MATERIALS, trackOutPayload);
      setToast({
        variant: "success",
        message: result?.Message || `Track Out completed successfully for ${materialData.Name || "material"}.`,
      });
      await fetchMaterial(materialData.Name || scanName);
      return true;
    } catch (err: any) {
      console.error("Track out failed:", err);
      const errMsg = extractErrorMessage(err, "Track Out failed. Please try again.");
      setError(errMsg);
      setToast({ variant: "error", message: errMsg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Track In ────────────────────────────────────────────────────────────
  const handleTrackIn = async (overrideDcPoints?: any[], overrideChecklistIds?: string[]): Promise<boolean> => {
    if (!materialData?.Id) return false;

    setIsLoading(true);
    setError(null);

    const dcPointsToUse = overrideDcPoints || collectedDcPoints;

    try {
      // Step 1: Get full material + resource context for TrackIn wizard
      const wizardPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetDataForMultipleTrackInWizardInput, Cmf.Navigo.BusinessOrchestration",
        Materials: [
          {
            $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
            Id: materialData.Id,
            Name: materialData.Name,
            LastServiceHistoryId: materialData.LastServiceHistoryId,
            UniversalState: materialData.UniversalState,
          },
        ],
        MaterialLevelsToLoad: 3,
        ResourceLevelsToLoad: 1,
        Operation: 0,
        IgnoreLastServiceId: true,
      };

      const wizardResult = await POST<any>(GET_DATA_FOR_TRACK_IN_WIZARD, wizardPayload);

      const fullMaterial = wizardResult?.Materials?.[0];
      const fullResource = wizardResult?.Resources?.[0];

      if (!fullMaterial || !fullResource) {
        throw new Error("Could not load TrackIn context. Missing material or resource data.");
      }

      const cleanPayload = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(cleanPayload);
        if (obj !== null && typeof obj === 'object') {
          const newObj: any = {};
          for (const key in obj) {
            if (key !== '$id' && key !== '$ref') {
              newObj[key] = cleanPayload(obj[key]);
            }
          }
          return newObj;
        }
        return obj;
      };

      // Step 2: Call ComplexTrackInMaterials with the full objects from wizard
      const trackInPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.ComplexTrackInMaterialsInput, Cmf.Navigo.BusinessOrchestration",
        Materials: {
          $type: "Cmf.Navigo.BusinessObjects.MaterialCollection, Cmf.Navigo.BusinessObjects",
          $values: [{ ...fullMaterial, $id: "2" }],
        },
        Resource: fullResource,
        StateModel: null,
        StateModelTransition: null,
        StateModelTransitionReason: null,
        ChecklistParameters: (() => {
          const arr = buildChecklistParametersArray(trackInWizardData?.Checklists?.[0] || trackInWizardData?.TrackInChecklists?.[0] || trackInWizardData?.Checklist || materialData?.Checklist, overrideChecklistIds);
          return arr ? {
            $typeCMF: "CMFMap",
            CMFMapData: [
              [
                { $ref: "2" },
                arr
              ]
            ]
          } : null;
        })(),
        SkipDCValidation: true,
        CurrentDataCollectionPoints: dcPointsToUse.length > 0 ? {
          $typeCMF: "CMFMap",
          CMFMapData: [
            [
              { $ref: "2" },
              {
                $type: "Cmf.Navigo.BusinessObjects.DataCollectionPointCollection, Cmf.Navigo.BusinessObjects",
                $values: cleanPayload(dcPointsToUse),
              },
            ],
          ],
        } : null,
        IgnoreLastServiceId: true,
      };

      const result = await POST<any>(COMPLEX_TRACK_IN_MATERIALS, trackInPayload);
      
      setToast({
        variant: "success",
        message: result?.Message || `${materialData.Name} tracked in successfully.`,
      });

      await fetchMaterial(materialData.Name || scanName);
      return true;
    } catch (err: any) {
      console.error("Track In failed:", err);
      const errMsg = extractErrorMessage(err, "Track In failed. Please try again.");
      setError(errMsg);
      setToast({ variant: "error", message: errMsg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Move Next ─────────────────────────────────────────────────────────────
  const handleMoveNext = async (overrideDcPoints?: any[], overrideChecklistIds?: string[]): Promise<boolean> => {
    if (!materialData?.Id) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get full material + next step context for MoveNext wizard
      const wizardPayload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetDataForMultipleMoveNextWizardInput, Cmf.Navigo.BusinessOrchestration",
        Materials: [materialData],
        MaterialLevelsToLoad: 3,
        TopMostMaterialLevelsToLoad: 3,
        DataCollectionLevelsToLoad: 3,
        IgnoreLastServiceId: true,
        IsSpecialMoveNext: false
      };

      const wizardResult = await POST<any>(GET_DATA_FOR_MOVE_NEXT_WIZARD, wizardPayload);

      const fullMaterial = wizardResult?.Materials?.[0];
      const nextSteps = wizardResult?.NextStepsResults;

      if (!fullMaterial) {
        throw new Error("Could not load MoveNext context. Missing material data.");
      }

      if (!nextSteps || nextSteps.length === 0) {
        const msg = "There are no next Steps available in order to perform the move next.";
        setError(msg);
        setToast({ variant: "error", message: msg });
        setIsLoading(false);
        return false;
      }
      
      const nextStep = nextSteps[0];

      // Step 2: Call ComplexMoveMaterialsToNextStep
      const dcPointsToUse = overrideDcPoints || collectedDcPoints;
      const cleanPayload = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(cleanPayload);
        if (obj !== null && typeof obj === 'object') {
          const newObj: any = {};
          for (const key in obj) {
            if (key !== '$id' && key !== '$ref') {
              newObj[key] = cleanPayload(obj[key]);
            }
          }
          return newObj;
        }
        return obj;
      };

      const materialWithId = {
        ...fullMaterial,
        $id: fullMaterial.$id || "2"
      };
      const materialRefId = materialWithId.$id;

      const moveNextPayload: any = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.ComplexMoveMaterialsToNextStepInput, Cmf.Navigo.BusinessOrchestration",
        IgnoreLastServiceId: true,
        Materials: {
          $typeCMF: "CMFMap",
          CMFMapData: [
            [
              materialWithId,
              nextStep.FlowPath
            ]
          ]
        }
      };

      if (dcPointsToUse && dcPointsToUse.length > 0) {
        moveNextPayload.CurrentDataCollectionPoints = {
          $typeCMF: "CMFMap",
          CMFMapData: [
            [
              { $ref: materialRefId },
              {
                $type: "Cmf.Navigo.BusinessObjects.DataCollectionPointCollection, Cmf.Navigo.BusinessObjects",
                $values: cleanPayload(dcPointsToUse),
              }
            ]
          ]
        };
      }

      const result = await POST<any>(COMPLEX_MOVE_TO_NEXT_STEP, moveNextPayload);
      
      // Auto-reset the screen for the next scan after completing the final stepper action
      handleReset();
      
      setToast({
        variant: "success",
        message: result?.Message || `${materialData.Name} moved to next step successfully.`,
      });
      return true;

    } catch (err: any) {
      console.error("Move Next failed:", err);
      const errMsg = extractErrorMessage(err, "Move Next failed. Please try again.");
      setError(errMsg);
      setToast({ variant: "error", message: errMsg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsLoading(true);
    scanInputRef.current?.focus();
    setTimeout(() => {
      setScanName("");
      setMaterialData(null);
      setError(null);
      setToast(null);
      setResources([]);
      setSelectedResourceId("");
      setTrackInWizardData(null);
      setTrackOutWizardData(null);
      setMoveNextWizardData(null);
      setCheckedChecklistItems([]);
      setCollectedDcPoints([]);
      setDcTrackInSkipped(false);
      lastKnownDcRef.current = null;
      setIsLoading(false);
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 50);
    }, 400); // Briefly show loader for visual feedback
  };

  // Try to find checklist data in any of the fetched wizard results
  let checklistData: any = fetchedChecklistData || null;
  if (!checklistData) {
    if (materialData?.SystemState === 1 && trackInWizardData) {
      checklistData = trackInWizardData.Checklists?.[0] || trackInWizardData.TrackInChecklists?.[0] || trackInWizardData.Checklist;
    } else if (materialData?.SystemState === 2 && trackOutWizardData) {
      checklistData = trackOutWizardData.Checklists?.[0] || trackOutWizardData.TrackOutChecklists?.[0] || trackOutWizardData.Checklist;
    } else if (materialData?.SystemState === 3 && moveNextWizardData) {
      checklistData = moveNextWizardData.Checklists?.[0] || moveNextWizardData.MoveNextChecklists?.[0] || moveNextWizardData.Checklist;
    }
    
    // Fallback to materialData itself if the backend attached it there
    if (!checklistData) {
      checklistData = materialData?.Checklist || materialData?.CurrentChecklistInstance?.ParentEntity || materialData?.CurrentChecklistInstance;
    }
  }

  const isHold = materialData?.HoldCount != null && Number(materialData.HoldCount) > 0;
  const isChecklistCompleted = materialData?.CurrentChecklistInstance?.UniversalState === 4;
  const activeChecklistInstance = materialData?.CurrentChecklistInstance;
  const clExecutionMode = checklistData?.ExecutionMode ?? checklistData?.ParentEntity?.ExecutionMode ?? activeChecklistInstance?.ExecutionMode ?? 0;
  
  let showChecklistAtTrackIn = false;
  if (materialData?.SystemState === 1 && !isChecklistCompleted) {
    if (clExecutionMode === 0) {
      showChecklistAtTrackIn = !!activeChecklistInstance;
    } else {
      showChecklistAtTrackIn = !!checklistData || !!activeChecklistInstance;
    }
  }
  
  let showChecklistAtTrackOut = false;
  if (materialData?.SystemState === 2 && !isChecklistCompleted) {
    if (clExecutionMode === 0) {
       showChecklistAtTrackOut = !!activeChecklistInstance;
    } else {
       showChecklistAtTrackOut = !!checklistData;
    }
  }

  const isPassThrough = isPassThroughStep(materialData);

  const trackInMat_lbl = trackInWizardData?.Materials?.[0];
  const activeMat_lbl = trackInMat_lbl || materialData;
  const activeRes_lbl = trackInWizardData?.Resources?.[0];
  const bomAssemblyType_lbl = trackInWizardData?.BOMAssemblyType ?? trackOutWizardData?.BOMAssemblyType ?? activeRes_lbl?.CurrentBOMAssemblyType ?? activeMat_lbl?.CurrentBOMAssemblyType ?? activeMat_lbl?.Resource?.CurrentBOMAssemblyType ?? materialData?.CurrentBOMAssemblyType;
  const hasBOMVersion_lbl = !!activeMat_lbl?.CurrentBOMVersion || !!trackInWizardData?.Bom || !!trackOutWizardData?.Bom;
  const primaryQty_lbl = activeMat_lbl?.PrimaryQuantity || materialData?.PrimaryQuantity || 0;
  const assembledQty_lbl = activeMat_lbl?.AssembledQuantity || materialData?.AssembledQuantity || 0;
  const isBOMCompleted_lbl = primaryQty_lbl > 0 ? (assembledQty_lbl >= primaryQty_lbl) : (assembledQty_lbl > 0);

  const hasBOMTrackIn_lbl = materialData?.SystemState === 1 && hasBOMVersion_lbl && bomAssemblyType_lbl === 3;
  const isBOMRequiredTrackIn_lbl = hasBOMTrackIn_lbl && !isBOMCompleted_lbl;

  const hasBOMTrackOut_lbl = materialData?.SystemState === 2 && hasBOMVersion_lbl && (bomAssemblyType_lbl === 4 || bomAssemblyType_lbl === 1 || bomAssemblyType_lbl === 2 || !bomAssemblyType_lbl);
  const isBOMRequiredTrackOut_lbl = hasBOMTrackOut_lbl && !isBOMCompleted_lbl;

  const trackInDataCollection_lbl = getTrackInDataCollection(trackInWizardData, materialData);
  const trackOutDataCollection_lbl = getTrackOutDataCollection(trackOutWizardData, materialData);
  const moveNextDataCollection_lbl = getMoveNextDataCollection(moveNextWizardData, materialData);

  const hasDC_trackin = !!trackInDataCollection_lbl;
  const hasDC_trackout = !!trackOutDataCollection_lbl;
  const hasDC_movenext = !!moveNextDataCollection_lbl;

  let checklistActionLabel = undefined;
  if (materialData?.SystemState === 1) {
    checklistActionLabel = hasDC_trackin ? "Next" : "Track In";
  } else if (materialData?.SystemState === 2) {
    checklistActionLabel = hasDC_trackout ? "Next" : "Track Out";
  } else if (materialData?.SystemState === 3) {
    checklistActionLabel = hasDC_movenext ? "Next" : "Move Next";
  } else if (clExecutionMode === 0) {
    checklistActionLabel = (hasDC_trackin || hasDC_trackout) ? "Next" : "Submit";
  }

  let bomActionLabel = undefined;
  if (materialData?.SystemState === 1) {
    bomActionLabel = (showChecklistAtTrackIn || hasDC_trackin) ? "Next" : "Track In";
  } else if (materialData?.SystemState === 2) {
    bomActionLabel = (showChecklistAtTrackOut || hasDC_trackout) ? "Next" : "Track Out";
  }

  // ─── Submit handler — branches by SystemState ────────────────────────────
  const handleSubmit = (overrideName?: string) => {
    const nameToCheck = typeof overrideName === 'string' ? overrideName : scanName;
    if (!materialData || nameToCheck !== materialData.Name) {
      fetchMaterial(nameToCheck);
      return;
    }
    if (isHold) {
      setToast({
        variant: "error",
        message: `Material ${materialData.Name} is on hold and cannot be processed.`
      });
      return;
    }
    const state = materialData.SystemState;
    if (isPassThrough || state === 3) {
      const moveNextDC = moveNextDataCollection_lbl;
      if (moveNextDC && collectedDcPoints.length === 0) {
        loadAndOpenDataCollection(moveNextDC);
        return;
      }
      handleMoveNext();         // PassThrough or Effective/Completed → Move Next
    } else if (state === 0) {
      handleDispatch();         // Queued → Dispatch
    } else if (state === 1) {
      if (isBOMRequiredTrackIn_lbl) {
        setIsBomModalOpen(true);
        return;
      }
      if (showChecklistAtTrackIn && checkedChecklistItems.length === 0) {
        loadAndOpenChecklist();
        return;
      }
      if (trackInDataCollection_lbl && collectedDcPoints.length === 0 && !dcTrackInSkipped) {
        loadAndOpenDataCollection(trackInDataCollection_lbl);
        return;
      }
      handleTrackIn();          // Dispatched → Track In
    } else if (state === 2) {
      if (isBOMRequiredTrackOut_lbl) {
        setIsBomModalOpen(true);
        return;
      }
      if (showChecklistAtTrackOut && checkedChecklistItems.length === 0) {
        loadAndOpenChecklist();
        return;
      }
      if (trackOutDataCollection_lbl && collectedDcPoints.length === 0) {
        loadAndOpenDataCollection(trackOutDataCollection_lbl);
        return;
      }
      handleTrackOut();         // InProcess → Track Out
    } else {
      fetchMaterial(nameToCheck);  // Any other state → scan
    }
  };

  const renderStepper = () => {
    const steps: any[] = [];

    steps.push({ ...STEPPER_CONFIG.DISPATCH, stepId: 0 });
    
    if (hasBOMTrackIn_lbl) {
      steps.push({
        ...STEPPER_CONFIG.BOM,
        stepId: 'bom_trackin'
      });
    }

    // Show checklist before Track In if applicable
    if (showChecklistAtTrackIn) {
      steps.push({
        ...STEPPER_CONFIG.CHECKLIST,
        stepId: 'checklist_trackin'
      });
    }

    if (hasDC_trackin) {
      steps.push({ 
        ...STEPPER_CONFIG.DATA_COLLECTION,
        stepId: 'dc_trackin', 
        dcData: trackInDataCollection_lbl,
      });
    }

    steps.push({ ...STEPPER_CONFIG.TRACK_IN, stepId: 1 });

    if (hasBOMTrackOut_lbl) {
      steps.push({
        ...STEPPER_CONFIG.BOM,
        stepId: 'bom_verify'
      });
    }

    // Show checklist after Track In if applicable
    if (showChecklistAtTrackOut) {
      steps.push({
        ...STEPPER_CONFIG.CHECKLIST,
        stepId: 'checklist_trackout'
      });
    }

    if (hasDC_trackout) {
      steps.push({ 
        ...STEPPER_CONFIG.DATA_COLLECTION,
        stepId: 'dc_trackout', 
        dcData: trackOutDataCollection_lbl,
      });
    }

    steps.push({ ...STEPPER_CONFIG.TRACK_OUT, stepId: 2 });

    if (hasDC_movenext) {
      steps.push({
        ...STEPPER_CONFIG.DATA_COLLECTION,
        stepId: 'dc_movenext',
        dcData: moveNextDataCollection_lbl,
      });
    }

    steps.push({ ...STEPPER_CONFIG.MOVE_NEXT, stepId: 3 });

    let activeState = -1;
    if (isPassThrough) {
      activeState = 3;
    } else if (materialData && materialData.SystemState !== undefined) {
      const state = materialData.SystemState;
      if (state >= 0) activeState = state;
    }

    return (
      <Styled.StepperContainer>
        {steps.map((step, index) => {
          let isActive = false;
          let isCompleted = false;

          if (step.stepId === activeState) isActive = true;
          
          if (typeof step.stepId === 'number') {
            isCompleted = step.stepId < activeState;
          }

          // For DC and Checklist steps, determine active logic
          if (step.stepId === 'dc_trackin' || step.stepId === 'checklist_trackin' || step.stepId === 'bom_trackin') {
            if (activeState === 1) isActive = true;
            if (activeState > 1) isCompleted = true;
          }
          if (step.stepId === 'dc_trackout' || step.stepId === 'checklist_trackout' || step.stepId === 'bom_verify') {
            if (activeState === 2) isActive = true;
            if (activeState > 2) isCompleted = true;
          }
          if (step.stepId === 'dc_movenext') {
            if (activeState === 3) isActive = true;
            if (activeState > 3) isCompleted = true;
          }

          if (step.isBOM) {
            if (isBOMCompleted_lbl) {
              isCompleted = true;
              isActive = false;
            }
          }

          return (
            <Styled.StepItem 
              key={index} 
              $active={isActive}
              $completed={isCompleted}
              onClick={async () => {
                if (step.isDC) {
                  setDcTrackInSkipped(false);
                  await loadAndOpenDataCollection(step.dcData);
                } else if (step.isChecklist) {
                  await loadAndOpenChecklist();
                } else if (step.isBOM) {
                  setIsBomModalOpen(true);
                }
              }}
              style={{ cursor: (step.isDC || step.isChecklist || step.isBOM) ? "pointer" : "default" }}
            >
              <Styled.StepIconWrapper 
                $active={isActive}
                $completed={isCompleted}
                style={((step.isDC || step.isChecklist || step.isBOM) && !isCompleted) ? { backgroundColor: "#fbc02d", borderColor: "#fbc02d", color: "#fff" } : {}}
              >
                <i className={step.icon}></i>
              </Styled.StepIconWrapper>
              <span>{step.label}</span>
            </Styled.StepItem>
          );
        })}
      </Styled.StepperContainer>
    );
  };

  return (
    <Styled.PageContainer>
      {toast && (
        <Toast
          variant={toast.variant}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {/* Top Search & Controls - Forced to single line */}
      <Styled.TopControls>
        <Styled.SearchBox>
          <FaBarcode color="gray" style={{ marginLeft: 4 }} />
            <TextField
              inputRef={scanInputRef}
              variant="outlined"
              size="small"
              placeholder="Scan material *"
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  handleSubmit((e.target as HTMLInputElement).value);
                }
              }}
              onBlur={(e) => { 
                const val = e.target.value.trim();
                if (val !== '' && val !== materialData?.Name) {
                  fetchMaterial(val); 
                }
              }}
              fullWidth
              autoFocus
            sx={{ '& fieldset': { border: 'none' }, input: { padding: '10px 14px' } }}
          />
        </Styled.SearchBox>
        
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button type="reset" onClick={handleReset} />
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isHold || (!isPassThrough && materialData?.SystemState === 0 && resources.length > 0 && !selectedResourceId)
            }
          />
        </Box>
      </Styled.TopControls>

      {/* Stepper positioned underneath controls */}
      {renderStepper()}

      {/* Resource Picker — only shown when material is Queued (SystemState === 0) and NOT pass-through and NOT on hold */}
      {materialData?.SystemState === 0 && !isPassThrough && !isHold && (
        <Box sx={{ mt: -1, mb: -1 }}>
          <DropDown
            inputRef={resourceInputRef}
            label="Resource *"
            value={selectedResourceId}
            emptyValue={
              isLoadingResources
                ? "Loading resources..."
                : resources.length === 0
                ? "No resources available"
                : "Select a resource..."
            }
            isDisabled={isLoadingResources || resources.length === 0}
            options={resources.map((r) => ({
              label: r.Name,
              value: r.Id,
            }))}
            setSelectedOptions={setSelectedResourceId}
          />
        </Box>
      )}



      {/* Reusable WIP Data Card */}
      <Box sx={{ position: 'relative' }}>
        {isLoading && <Loader />}
        
        <WipDataCard materialData={materialData} title="Material Details" onFlowClick={() => setIsFlowModalOpen(true)} />
        
      </Box>

      {materialData && (
        <FlowStepsModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          materialData={materialData}
        />
      )}

      <DataCollectionModal
        isOpen={isDcModalOpen}
        onClose={() => {
          setIsDcModalOpen(false);
          if (materialData?.SystemState === 1) {
            setDcTrackInSkipped(true);
          }
        }}
        dataCollection={selectedDcData}
        onSave={(points) => handleModalSubmit(points, undefined)}
        isSubmitting={isModalSubmitting}
        allowSkipMandatory={materialData?.SystemState === 1}
        actionLabel={materialData?.SystemState === 1 ? "Track In" : materialData?.SystemState === 2 ? "Track Out" : materialData?.SystemState === 3 ? "Move Next" : undefined}
      />

      <CheckListModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        checklistData={fetchedChecklistData || checklistData}
        onSave={(checkedIds) => handleModalSubmit(undefined, checkedIds)}
        initialCheckedIds={checkedChecklistItems}
        isSubmitting={isModalSubmitting}
        actionLabel={checklistActionLabel}
      />

      <BOMModal
        isOpen={isBomModalOpen}
        onClose={() => setIsBomModalOpen(false)}
        materialData={{
          ...materialData,
          CurrentBOMVersion: materialData?.CurrentBOMVersion || trackInWizardData?.Bom || trackOutWizardData?.Bom,
          CurrentBOMAssemblyType: trackInWizardData?.BOMAssemblyType ?? trackOutWizardData?.BOMAssemblyType ?? trackInWizardData?.Resources?.[0]?.CurrentBOMAssemblyType ?? trackOutWizardData?.Resources?.[0]?.CurrentBOMAssemblyType ?? materialData?.CurrentBOMAssemblyType
        }}
        trackInWizardData={trackInWizardData || trackOutWizardData}
        actionLabel={bomActionLabel}
        onSave={() => handleModalSubmit(undefined, undefined, true)}
        onSuccess={(msg?: string) => {
          if (msg) {
            setToast({ variant: "success", message: msg });
          }
          if (materialData?.Name || scanName) {
            fetchMaterial(materialData?.Name || scanName, true);
          }
        }}
      />
    </Styled.PageContainer>
  );
};

export default MaterialPage;
