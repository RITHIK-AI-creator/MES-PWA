const getConfig = (key: string, fallback: string) => {
  if (typeof window !== "undefined" && (window as any).APP_CONFIG && (window as any).APP_CONFIG[key]) {
    return (window as any).APP_CONFIG[key];
  }
  // Fallback to process.env if available, otherwise fallback parameter
  if (key === "API_BASE_URL" && process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (key === "LOGOUT_URL" && process.env.REACT_APP_LOGOUT_URL) return process.env.REACT_APP_LOGOUT_URL;
  return fallback;
};

const API_BASE_URL = getConfig("API_BASE_URL", "");
export const AUTH_LOGOUT = `${API_BASE_URL}${getConfig("LOGOUT_URL", "/iis/authentication/logout")}`;

// Material APIs
export const GET_MATERIAL_BASIC_INFO = getConfig("GET_MATERIAL_BASIC_INFO", "/api/Material/GetMaterialBasicInformation");
export const COMPLEX_TRACK_OUT_MATERIALS = getConfig("COMPLEX_TRACK_OUT_MATERIALS", "/api/Material/ComplexTrackOutMaterials");

// Dispatch APIs
export const GET_DISPATCH_LIST = getConfig("GET_DISPATCH_LIST", "/api/Dispatch/GetDispatchListForMaterial");
export const DISPATCH_MATERIALS = getConfig("DISPATCH_MATERIALS", "/api/Material/DispatchMaterials");

// Track In APIs
export const GET_DATA_FOR_TRACK_IN_WIZARD = getConfig("GET_DATA_FOR_TRACK_IN_WIZARD", "/api/Material/GetDataForMultipleTrackInWizard");
export const COMPLEX_TRACK_IN_MATERIALS = getConfig("COMPLEX_TRACK_IN_MATERIALS", "/api/Material/ComplexTrackInMaterials");

// Track Out APIs
export const GET_DATA_FOR_TRACK_OUT_WIZARD = getConfig("GET_DATA_FOR_TRACK_OUT_WIZARD", "/api/Material/GetDataForMultipleTrackOutAndMoveNextWizard");

export const COMPLEX_TRACKIN_MATERIALS = getConfig("COMPLEX_TRACKIN_MATERIALS", "/api/Material/ComplexTrackInMaterials");

export const LOAD_MATERIALS_REASONS = getConfig("LOAD_MATERIALS_REASONS", "/api/Material/LoadMaterialsCommonStepReasons");
export const GET_MATERIAL_HOLD_REASONS = getConfig("GET_MATERIAL_HOLD_REASONS", "/api/Material/GetMaterialsHoldReasonsWithUserInformation");
//record loss and bonus api
export const LOAD_STEP_REASONS = getConfig("LOAD_STEP_REASONS", "/api/Flow/LoadStepReasons");
export const HOLD_MATERIALS = getConfig("HOLD_MATERIALS", "/api/Material/HoldMaterials");
export const RELEASE_MATERIALS = getConfig("RELEASE_MATERIALS", "/api/Material/ReleaseMaterials");
export const RECORD_MATERIAL_LOSS_AND_BONUS = getConfig("RECORD_MATERIAL_LOSS_AND_BONUS", "/api/Material/RecordMaterialLossAndBonus");

export const EXPAND_MATERIAL = getConfig("EXPAND_MATERIAL", "/api/Material/ExpandMaterial");
export const GET_MATERIAL_CHILDREN = getConfig("GET_MATERIAL_CHILDREN", "/api/Material/GetMaterialChildrenWithContainersAsDataSet");
export const LOAD_OBJECT_RELATIONS = getConfig("LOAD_OBJECT_RELATIONS", "/api/GenericService/LoadObjectsRelations");
export const COLLAPSE_MATERIAL = getConfig("COLLAPSE_MATERIAL", "/api/Material/CollapseMaterial");
export const GET_MATERIAL_BOM_MATERIALS = getConfig("GET_MATERIAL_BOM_MATERIALS", "/api/Material/GetMaterialBomMaterialsForAssemble");
export const ASSEMBLE_MATERIAL = getConfig("ASSEMBLE_MATERIAL", "/api/Material/AssembleMaterial");

export const LOAD_CONTAINERS_MATERIALS = getConfig("LOAD_CONTAINERS_MATERIALS", "/api/Material/LoadContainersForMaterials");
export const SPLIT_MATERIALS = getConfig("SPLIT_MATERIALS", "/api/Material/SplitMaterial");
export const MERGE_MATERIALS = getConfig("MERGE_MATERIALS", "/api/Material/MergeMaterials");
// Query APIs
export const EXECUTE_QUERY = getConfig("EXECUTE_QUERY", "/api/Query/ExecuteQuery");

// Move Next APIs
export const GET_DATA_FOR_MOVE_NEXT_WIZARD = getConfig("GET_DATA_FOR_MOVE_NEXT_WIZARD", "/api/Material/GetDataForMultipleMoveNextWizard");
export const COMPLEX_MOVE_TO_NEXT_STEP = getConfig("COMPLEX_MOVE_TO_NEXT_STEP", "/api/Material/ComplexMoveMaterialsToNextStep");

// Flow APIs
export const GET_SEQUENCE_FLOW_PATH = getConfig("GET_SEQUENCE_FLOW_PATH", "/api/Flow/GetSequenceFlowPath");
export const LOAD_FLOW_CHILDS = getConfig("LOAD_FLOW_CHILDS", "/api/Flow/LoadFlowChilds");

// Table APIs
export const GET_LOOKUP_TABLE_BY_NAME = getConfig("GET_LOOKUP_TABLE_BY_NAME", "/api/Table/GetLookupTableByName");

// Misc
export const BATCH_EXECUTE = getConfig("BATCH_EXECUTE", "/api/GenericService/BatchExecute");
export const PERFORM_MATERIAL_CHECKLIST_ITEMS = getConfig("PERFORM_MATERIAL_CHECKLIST_ITEMS", "/api/Material/PerformMaterialChecklistItems");

// Data Collection APIs
export const LOAD_DATA_COLLECTION_PARAMETER_INFORMATION = getConfig("LOAD_DATA_COLLECTION_PARAMETER_INFORMATION", "/api/DataCollection/LoadDataCollectionParameterInformation");
export const GET_DATA_COLLECTION_POINTS_AS_DATA_SET = getConfig("GET_DATA_COLLECTION_POINTS_AS_DATA_SET", "/api/DataCollection/GetDataCollectionPointsAsDataSet");
export const LOAD_STEPS_RELATIONS = getConfig("LOAD_STEPS_RELATIONS", "/api/Flow/LoadStepRelations");
export const GET_DATA_REWORK_WIZARD = getConfig("GET_DATA_REWORK_WIZARD", "/api/Material/GetDataForReworkWizard");
export const COMPLEX_REWORK_MATERIAL = getConfig("COMPLEX_REWORK_MATERIAL", "/api/Material/ComplexReworkMaterial");
export const TEMPORARY_OFF_FLOW_MATERIALS = getConfig("TEMPORARY_OFF_FLOW_MATERIALS", "/api/Material/TemporaryOffFlowMaterials");
