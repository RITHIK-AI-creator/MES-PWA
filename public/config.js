window.APP_CONFIG = {
  // Existing Auth Config
  API_URL: "https://atscmmes.usa.athenatec.com",
  AUTH_SERVER: "https://atscmmes.usa.athenatec.com:9091",
  TENANT: "CriticalManufacturing",
  STRATEGY_ID: "ActiveDirectory",
  CLIENT_ID: "MES",
  IIS_SUCCESS: "/iis/authentication/success",
  FACTORY: "",
  LOCAL_LOGIN_URL: "/local-login",

  // Auth Paths
  TENANT_LOGIN_PATH: "/tenant/{TENANT_NAME}/login",
  STRATEGY_LOGIN_PATH: "/tenant/{TENANT_NAME}/strategy/local/{STRATEGY_ID}/login",
  STRATEGY_LOGIN_QUERY_PARAMS: "?username={USERNAME}&clientId={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&strategyId=",

  // Base URLs
  API_BASE_URL: "",
  LOGOUT_URL: "/iis/authentication/logout",

  // Material APIs
  GET_MATERIAL_BASIC_INFO: "/api/Material/GetMaterialBasicInformation",
  COMPLEX_TRACK_OUT_MATERIALS: "/api/Material/ComplexTrackOutMaterials",

  // Dispatch APIs
  GET_DISPATCH_LIST: "/api/Dispatch/GetDispatchListForMaterial",
  DISPATCH_MATERIALS: "/api/Material/DispatchMaterials",

  // Track In APIs
  GET_DATA_FOR_TRACK_IN_WIZARD: "/api/Material/GetDataForMultipleTrackInWizard",
  COMPLEX_TRACK_IN_MATERIALS: "/api/Material/ComplexTrackInMaterials",

  // Track Out APIs
  GET_DATA_FOR_TRACK_OUT_WIZARD: "/api/Material/GetDataForMultipleTrackOutAndMoveNextWizard",

  // Query APIs
  EXECUTE_QUERY: "/api/Query/ExecuteQuery",

  // Move Next APIs
  GET_DATA_FOR_MOVE_NEXT_WIZARD: "/api/Material/GetDataForMultipleMoveNextWizard",
  COMPLEX_MOVE_TO_NEXT_STEP: "/api/Material/ComplexMoveMaterialsToNextStep",

  // Flow APIs
  GET_SEQUENCE_FLOW_PATH: "/api/Flow/GetSequenceFlowPath",
  LOAD_FLOW_CHILDS: "/api/Flow/LoadFlowChilds",

  // Material APIs Additions
  COMPLEX_TRACKIN_MATERIALS: "/api/Material/ComplexTrackInMaterials",
  LOAD_MATERIALS_REASONS: "/api/Material/LoadMaterialsCommonStepReasons",
  GET_MATERIAL_HOLD_REASONS: "/api/Material/GetMaterialsHoldReasonsWithUserInformation",
  LOAD_STEP_REASONS: "/api/Flow/LoadStepReasons",
  HOLD_MATERIALS: "/api/Material/HoldMaterials",
  RELEASE_MATERIALS: "/api/Material/ReleaseMaterials",
  RECORD_MATERIAL_LOSS_AND_BONUS: "/api/Material/RecordMaterialLossAndBonus",
  EXPAND_MATERIAL: "/api/Material/ExpandMaterial",
  GET_MATERIAL_CHILDREN: "/api/Material/GetMaterialChildrenWithContainersAsDataSet",
  LOAD_OBJECT_RELATIONS: "/api/GenericService/LoadObjectsRelations",
  COLLAPSE_MATERIAL: "/api/Material/CollapseMaterial",
  GET_MATERIAL_BOM_MATERIALS: "/api/Material/GetMaterialBomMaterialsForAssemble",
  ASSEMBLE_MATERIAL: "/api/Material/AssembleMaterial",
  LOAD_CONTAINERS_MATERIALS: "/api/Material/LoadContainersForMaterials",
  SPLIT_MATERIALS: "/api/Material/SplitMaterial",
  MERGE_MATERIALS: "/api/Material/MergeMaterials",

  // Table APIs
  GET_LOOKUP_TABLE_BY_NAME: "/api/Table/GetLookupTableByName",

  // Misc
  BATCH_EXECUTE: "/api/GenericService/BatchExecute",
  PERFORM_MATERIAL_CHECKLIST_ITEMS: "/api/Material/PerformMaterialChecklistItems",

  // Data Collection APIs
  LOAD_DATA_COLLECTION_PARAMETER_INFORMATION: "/api/DataCollection/LoadDataCollectionParameterInformation",
  GET_DATA_COLLECTION_POINTS_AS_DATA_SET: "/api/DataCollection/GetDataCollectionPointsAsDataSet",

  // Flow & Rework APIs
  LOAD_STEPS_RELATIONS: "/api/Flow/LoadStepRelations",
  GET_DATA_REWORK_WIZARD: "/api/Material/GetDataForReworkWizard",
  COMPLEX_REWORK_MATERIAL: "/api/Material/ComplexReworkMaterial",
  TEMPORARY_OFF_FLOW_MATERIALS: "/api/Material/TemporaryOffFlowMaterials"
};
