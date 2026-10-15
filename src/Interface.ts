export interface LotDetails {
  TransactionId: null;
  Data: LotData;
  ErrorMessage:string;
  IsSuccess:boolean;
  HeaderData:{
    LI_Qty?: string;
    LI_Qty2?: string;
    UOM1?: string;
    Workflow?: string;
    CurrentStep?: string;
    NextStep?: string;
  }
  EquipmentData?: { EquipmentId: string }[];
}

export interface LotData {
  CurrentSpec: string;
  WaferQty: string;
  Quantity:string;
  ProductDescription: string;
  txtStatus: string;
  Priority: string;
  NextStep: string;
  NextSteps?: string[];
  SpecDescription: string;
  LotId: string;
  Workflow: string;
  Product: string;
  LastTransaction: string;
  Equipment?: string;
  EquipmentId?: string;
  EquipmentID?: string;
  EquipmentGroup?: string;
  QtyToProcess?: string | number;
  DataCollectionStatus?: string;
  AllowedEquipments: AllowedEquipments[];
  NextSpecDescription: string;
  EquipmentDescription:string;
  CurrentPath?: string;
  BonusReason?: string[];
  RecipeName?: string;
  ProcessType?: string;
  AvailableProcessTypes?: string[];
  LotStatus?: string;
  DataCollectionPresent?: boolean;
  RequiredActivity?: RequiredActivity[];
  MfgOrder?: string;
  Operation?: string;
  Step?: string;
  LotDetailsInfo?: {
    WaferID: string;
    Banchi: string;
    Qrun: string;
  }[];
  SpecCategory?: string;
  Spec?: string;
  SpecType?: string;
  Qty?: string;
  Qty2?: string;
  Status?: string;
  LI_Qty?: string;
  LI_Qty2?: string;
  UOM1?: string;
  CurrentWipStatus:string;
  RejectType?:string;
}
export interface AllowedEquipments {
  EquipmentId: string;
  EquipmentGroup: string;
  CurrentStatus: string;
  Description: string;
}
export interface EquipmentDetails {
  TransactionId: string;
  Data: {
    Status: string;
    E10State: string;
    E10Substate: string;
    LotId: string;
    MesMessage: string;
  };
}

export interface DataCollectionPoints {
  steps: {
    Name: string;
    data: {
      data: string;
      type: "NUMBER" | "STRING" | "TIMESTAMP" | "BOOLEAN";
      isRequired: boolean;
      minValue:string;
      maxValue:string;
    }[];
  }[];
  template: string;
  isRequired:boolean;
  externalData?: any[];
}

export interface BuildPayloadParams {
  equipment: string;
  template: DataCollectionPoints;
  formData: Record<string, any>;
  lotDetails: any;
}

// Enum representing the state names
export enum EquipmentState {
  NonScheduled = "NonScheduled",
  ScheduledDown = "Scheduled Down",
  UnschDown = "UnschDown",
  Engineering = "Engineering",
  Standby = "Standby",
  Productive = "Productive",
}
export enum ChipGrade {
  Untested = "Untested",
  Grade1 = "Grade1",
  Grade2 = "Grade2",
  NG = "NG",
}

export interface Chip {
  chipId: string;
  x?: number;
  y?: number;
  grade: ChipGrade;
  rejectReason?: string;
  testedAt?: string | null;
}
export interface Ring {
  ringId: string;
  chips: Chip[];
}
export interface Cassette {
  cassetteId: string;
  rings: Ring[];
}
export interface Lot {
  lotId: string;
  device: string;
  quantity: number;
  qtyToProcess?: number;
  recipe: string;
  status: string;
  lastTransaction: string;
  cassette: Cassette;
  operatorName: string;
  G1?: number;
  NG?: number;
  G2?: number;
  UT?: number;
  EquipmentId: string;
}

interface EquipmentStatus {
  equipmentId: string;
  state: EquipmentState;
  loadedRecipe: string;
  spcCheckRequired: boolean;
  dailyCheckRequired: boolean;
}

interface CancellationToken {
  isCancellationRequested: boolean;
  throwIfCancellationRequested: () => void;
}

export interface EquipmentStatusResponse {
  TransactionId: string;
  Data: {
    Status: string;
    E10State: keyof typeof EquipmentState;
    E10Substate: string;
    LotId: string;
    MesMessage: string;
    StatusReason: string;
  };
}

export interface AdocWipDataCollection {
  WipDataSetup: {
    WIPDataSetupName: string;
  }[];
}

export interface AdocWipDataPoint {
  Employee: string;
  Password?: string;
  ObjectName: string;
  WIPDataSetup: string;
  ObjectType: string;
  MesMessage: string;
  Status: string;
  WIPItemData: {
    WIPDataName: string;
    WIPDataValue: string;
    ForProcessType: boolean;
  }[];
}

export interface DataPointType {
  DataPointType: {
    WIPDataSetupId: string;
    WIPDataSetupId1: string;
    Wipdatasetupname: string;
    Specbaseid: string;
    specName: string;
    isAdhocData: boolean;
    isWipData: boolean;
    unknown: boolean;
  }[];
}

export interface MultiTrackInReponseType {
  LotId: string;
  Status: string;
  MesMessage: string;
}

export type HoldReasonTypes = string[];
export interface AvailableEquiments {
  Data: {
    AvailableEquipments: string[];
    AvailableStatus: string[];
    AvailableStatusReason: [];
  };
}

export interface UpdateEquipmentState {
  TransactionId: string;
  Data: {
    EquipmentId: string;
    Status: string;
    MesMessage: string;
  };
}

export interface SetupName{
    
    "Container": string,
    "WIPDataSetup": string,
    "Status": string
}

export interface  NextLotId{
    "Status": string,
    "MesMessage": string,
    "Data":string,
    
}

export interface RequiredActivity {
  CurrentActivityName: string | null;
}

interface GridData {
  LotId: string;
  Product: string;
  SpecDesc: string;
  Qty: string;
  Qty2: string;
  Rejects: string;
  Reject: string;
  DataCollection: string;
  Result: string;
}

export interface WipStatusResponse {
  CurrentWipStatus: string;
  RequiredActivity?: RequiredActivity[];
  GridData: GridData;
  EquipmentData:AllowedEquipments[];
  NextSteps?: string[];
  ProcessTypeList?: { ProcessTypeName: string }[];

}

