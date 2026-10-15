import React, { useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  EXECUTE_QUERY,
  LOAD_CONTAINERS_MATERIALS,MERGE_MATERIALS,
  COLLAPSE_MATERIAL
} from "../../api";
import { TextField } from "@mui/material";
import Button from "../../Library/Button";
import Loader from "../../Library/Loader";
import Toast from "../../components/Toast";
import WipDataCard from "../../components/WipDataCard";
import FlowStepsModal from "../../components/FlowStepsModal";
import {
  FaChevronDown,
  FaChevronUp,
  FaCompressArrowsAlt
} from "react-icons/fa";

interface MergeMaterial {
  id: number | string;
  material: string;
  product: string;
  primaryQuantity: number;
  unit: string;
  type: string;
}

const MergePage = () => {
  const [lotName, setLotName] = useState("");
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const [mergeData, setMergeData] = useState<any>(null);

  const [mergeMaterials, setMergeMaterials] =
    useState<MergeMaterial[]>([]);

  const [selectedMaterials, setSelectedMaterials] =
    useState<(number | string)[]>([]);

  const [isMergeDetailsOpen, setIsMergeDetailsOpen] =
    useState(true);

  const buildMergeMaterials = (
    response: any
  ): MergeMaterial[] => {
    const materials =
      response?.Materials || [];

    return materials.map(
      (
        item: any,
        index: number
      ) => ({
        id:
          item?.Id ??
          item?.MaterialId ??
          index,

        material:
          item?.Name ??
          "",

        product:
          item?.Product?.Name
            ? `${item.Product.Name}${
                item?.Product?.Revision
                  ? ` (${item.Product.Revision})`
                  : ""
              }`
            : item?.ProductName
              ? `${item.ProductName}${
                  item?.ProductRevision
                    ? ` (${item.ProductRevision})`
                    : ""
                }`
              : "",

        primaryQuantity:
          Number(
            item?.PrimaryQuantity ??
              0
          ),

        unit:
          item?.PrimaryUnits1 ??
          item?.PrimaryUnits ??
          "",

        type:
          item?.Type ??
          ""
      })
    );
  };

  const fetchMergeDetails = async (
    nameToFetch: string
  ) => {
    if (!nameToFetch.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      /*
       * =========================================================
       * STEP 1
       * Get Material Id
       * =========================================================
       */

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
                ObjectName: "Material",
                Operator: 0,
                Value:
                  nameToFetch.trim(),
                LogicalOperator: 1
              }
            ],

            Fields: [
              {
                Name: "Id",
                ObjectName: "Material",
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

      /*
       * =========================================================
       * STEP 2
       * GET_MATERIAL_BASIC_INFO
       * =========================================================
       */

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

      const response =
        await POST<any>(
          GET_MATERIAL_BASIC_INFO,
          infoPayload
        );

      let data = response;

      if (response?.Material) {
        data =
          response.Material;
      } else if (
        response?.Data?.Material
      ) {
        data =
          response.Data.Material;
      } else if (
        response?.Entities?.[0]
      ) {
        data =
          response.Entities[0];
      }

      if (!data?.Id) {
        throw new Error(
          "Unable to load material basic information."
        );
      }

      setMergeData(data);

      /*
       * =========================================================
       * STEP 3
       * Get ALL EXECUTE QUERY values dynamically
       * from Basic Information
       * =========================================================
       */

      const dynamicValues = {
        isTemplate:
          data?.IsTemplate,

        universalState:
          data?.UniversalState,

        systemState:
          data?.SystemState,

        holdCount:
          data?.HoldCount,

        materialId:
          data?.Id,

        type:
          data?.Type,

        form:
          data?.Form,

        isInStore:
          data?.IsInStore,

        primaryUnits:
          data?.PrimaryUnits,

        facilityId:
          data?.Facility?.Id,

        productId:
          data?.Product?.DefinitionId,

        stepId:
          data?.Step?.Id,

        isApproved:
          data?.IsApproved
      };


      const subMaterialQueryPayload = {
        $type:
          "Cmf.Foundation.BusinessOrchestration.QueryManagement.InputObjects.ExecuteQueryInput, Cmf.Foundation.BusinessOrchestration",

        IgnoreLastServiceId: true,

        QueryObject: {
          Query: {
            $type:
              "Cmf.Foundation.BusinessObjects.QueryObject.Query, Cmf.Foundation.BusinessObjects",

            Fields: [
              {
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Name: "Id"
              },

              {
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Name: "Name"
              },

              {
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Name: "CharacteristicsCount"
              }
            ],

            Filters: [
              {
                Name: "IsTemplate",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.isTemplate,
                LogicalOperator: 1,
                $id: "7"
              },

              {
                Name: "UniversalState",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.universalState,
                LogicalOperator: 1,
                $id: "8"
              },

              {
                Name: "HoldCount",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.holdCount,
                LogicalOperator: 1,
                $id: "10"
              },

              {
                Name: "MaterialId",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 1,
                Value:
                  dynamicValues.materialId,
                LogicalOperator: 1,
                $id: "11"
              },

              {
                Name: "Type",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.type,
                LogicalOperator: 1,
                $id: "12"
              },

              {
                Name: "SystemState",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.systemState,
                LogicalOperator: 1,
                $id: "13"
              },

              {
                Name: "Form",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.form,
                LogicalOperator: 1,
                $id: "14"
              },

              {
                Name: "IsInStore",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.isInStore,
                LogicalOperator: 1,
                $id: "15"
              },

              {
                Name: "PrimaryUnits",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.primaryUnits,
                LogicalOperator: 1,
                $id: "16"
              },

              {
                Name: "ParentMaterialId",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 12,
                LogicalOperator: 1,
                $id: "19"
              },

              {
                Name: "SecondaryUnits",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 12,
                LogicalOperator: 1,
                $id: "20"
              },

              {
                Name: "FacilityId",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.facilityId,
                LogicalOperator: 1,
                $id: "21"
              },

              {
                Name: "ProductId",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.productId,
                LogicalOperator: 1,
                $id: "22"
              },

              {
                Name: "StepId",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.stepId,
                LogicalOperator: 1,
                $id: "23"
              },

              {
                Name: "IsApproved",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 0,
                Value:
                  dynamicValues.isApproved,
                LogicalOperator: 1,
                $id: "24"
              },

              {
                Name: "FloorLifeCounterState",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 12,
                LogicalOperator: 1,
                $id: "25"
              },

              {
                Name: "CurrentBOMUnits",
                ObjectName: "Material",
                ObjectAlias: "Material_1"
              },

              {
                Name: "PendingLineReworkReturn",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 12,
                LogicalOperator: 1,
                $id: "27"
              },

              {
                Name: "IsInTransferOrderItem",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 12,
                Value: null,
                LogicalOperator: 1,
                $id: "28"
              },

              {
                Name: "PickListItemCount",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 12,
                Value: null,
                LogicalOperator: 1,
                $id: "29"
              },

              {
                Name: "CurrentInspectionOrder",
                ObjectName: "Material",
                ObjectAlias: "Material_1",
                Operator: 12,
                Value: null,
                LogicalOperator: 1,
                $id: "30"
              }
            ]
          }
        }
      };

      const subMaterialResponse =
        await POST<any>(
          EXECUTE_QUERY,
          subMaterialQueryPayload
        );

      const executeQueryMaterials =
        subMaterialResponse
          ?.NgpDataSet
          ?.T_Result || [];

      const materialIds =
        executeQueryMaterials
          .map(
            (item: any) =>
              item?.Id ??
              item?.MaterialId ??
              item?.["Material_1.Id"]
          )
          .filter(
            (id: any) =>
              id !== null &&
              id !== undefined &&
              id !== ""
          );

      const containerPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.LoadContainersForMaterialsInput, Cmf.Navigo.BusinessOrchestration",

        LevelsToLoad: 1,

        Materials: {
          $type:
            "Cmf.Navigo.BusinessObjects.MaterialCollection, Cmf.Navigo.BusinessObjects",

          $values:
            materialIds.map(
              (id: any) => ({
                Id: id
              })
            )
        }
      };

      const containerResponse =
        await POST<any>(
          LOAD_CONTAINERS_MATERIALS,
          containerPayload
        );


      const materialList =
        buildMergeMaterials(
          containerResponse
        );

      setMergeMaterials(
        materialList
      );

      setSelectedMaterials([]);

    } catch (err: any) {
      console.error(
        "Failed to fetch material information:",
        err
      );

      setMergeData(null);
      setMergeMaterials([]);
      setSelectedMaterials([]);

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.Message ||
        err?.message ||
        "Failed to load material information. Please check the material number and try again.";

      setError(null);

      setToast({
        variant: "error",
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaterialSelection = (
    id: number | string
  ) => {
    if (isMerging) {
      return;
    }

    setError(null);

    setSelectedMaterials(
      (previous) => {
        if (
          previous.includes(id)
        ) {
          return previous.filter(
            (item) =>
              item !== id
          );
        }

        return [
          ...previous,
          id
        ];
      }
    );
  };

  const handleSelectAll = () => {
    if (isMerging) {
      return;
    }

    setError(null);

    if (
      selectedMaterials.length ===
      mergeMaterials.length
    ) {
      setSelectedMaterials([]);
      return;
    }

    setSelectedMaterials(
      mergeMaterials.map(
        (item) => item.id
      )
    );
  };

const handleMerge = async () => {
  if (!lotName.trim()) {
    setError(null);

    setToast({
      variant: "error",
      message: "Please enter a material number."
    });

    return;
  }

  if (!mergeData) {
    setError(null);

    setToast({
      variant: "error",
      message:
        "Please enter a material number and load the WIP details."
    });

    return;
  }

  if (selectedMaterials.length === 0) {
    setError(null);

    setToast({
      variant: "error",
      message:
        "Please select at least one sub-material to merge."
    });

    return;
  }

  try {
    setIsMerging(true);
    setError(null);
    setToast(null);

    const selectedRows =
      mergeMaterials.filter(
        (item) =>
          selectedMaterials.includes(item.id)
      );

    const mergePayload = {
      $type:
        "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.MergeMaterialsInput, Cmf.Navigo.BusinessOrchestration",

      ToCopyFutureHolds: false,

      ChildMaterials: {
        $typeCMF: "CMFMap",

        CMFMapData:
          selectedRows.map(
            (item) => [
              {
                $type:
                  "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",

                Id: item.id,

                Name: item.material
              },

              null
            ]
          )
      },

      MainMaterial: {
        Id: mergeData?.Id,

        Name:
          mergeData?.Name ||
          lotName.trim()
      },

      IgnoreLastServiceId: true
    };


    const response =
      await POST<any>(
        MERGE_MATERIALS,
        mergePayload
      );

  
    const successMessage =
      response?.Message ||
      response?.message ||
      "Material merged successfully.";

    setToast({
      variant: "success",
      message: successMessage
    });

    setSelectedMaterials([]);

    await fetchMergeDetails(
      lotName.trim()
    );

  } catch (err: any) {
    console.error(
      "Merge Material API failed:",
      err
    );

    const errorMessage =
      err?.response?.data?.Message ||
      err?.response?.data?.message ||
      err?.Message ||
      err?.message ||
      "Failed to merge material. Please try again.";

    setToast({
      variant: "error",
      message: errorMessage
    });
  } finally {
    setIsMerging(false);
  }
};

  const handleReset = () => {
    if (isMerging) {
      return;
    }

    setIsResetting(true);
    setLotName("");
    setMergeData(null);
    setMergeMaterials([]);
    setSelectedMaterials([]);
    setError(null);
    setToast(null);

    setTimeout(() => {
      setIsResetting(false);
    }, 300);
  };

  const allSelected =
    mergeMaterials.length > 0 &&
    selectedMaterials.length ===
      mergeMaterials.length;

  return (
    <Styled.PageContainer>
      {toast && (
        <Toast
          variant={toast.variant}
          message={toast.message}
          onClose={() =>
            setToast(null)
          }
        />
      )}

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

              if (mergeData) {
                setMergeData(null);
                setMergeMaterials([]);
                setSelectedMaterials([]);
              }
            }}
            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !isLoading &&
                !isMerging &&
                !mergeData
              ) {
                fetchMergeDetails(
                  materialNumber
                );
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                e.preventDefault();

                const materialNumber =
                  lotName.trim();

                if (
                  materialNumber &&
                  !isLoading &&
                  !isMerging &&
                  !mergeData
                ) {
                  fetchMergeDetails(
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

          <Button
            type="submit"
            onClick={
              handleMerge
            }
            disabled={
              !mergeData ||
              isLoading ||
              isMerging
            }
          />
        </Styled.ActionButtons>
      </Styled.TopControls>

      {(isLoading || isResetting) && (
        <Loader />
      )}

      <WipDataCard
        materialData={
          mergeData
        }
        title="Materials Details"
        onFlowClick={() =>
          setIsFlowModalOpen(true)
        }
      />

      {mergeData && (
        <FlowStepsModal
          isOpen={
            isFlowModalOpen
          }
          onClose={() =>
            setIsFlowModalOpen(false)
          }
          materialData={
            mergeData
          }
        />
      )}

      {mergeData && (
        <Styled.MergeContent>
          <Styled.MergeDetailsHeader>
            <Styled.MergeDetailsTitleWrapper>
              <FaCompressArrowsAlt />

              <span>
                Materials to Merge (
                {
                  mergeMaterials.length
                }
                )
              </span>
            </Styled.MergeDetailsTitleWrapper>

            <Styled.MergeDetailsToggle
              type="button"
              onClick={() =>
                setIsMergeDetailsOpen(
                  !isMergeDetailsOpen
                )
              }
            >
              {isMergeDetailsOpen ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </Styled.MergeDetailsToggle>
          </Styled.MergeDetailsHeader>

          {isMergeDetailsOpen && (
            <Styled.MergeTableWrapper>
              <Styled.MergeTable>
                <Styled.MergeTableHeader>
                  <Styled.MergeCheckboxCell>
                    <input
                      type="checkbox"
                      checked={
                        allSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                      disabled={
                        isMerging ||
                        mergeMaterials.length ===
                          0
                      }
                    />
                  </Styled.MergeCheckboxCell>

                  <Styled.MergeHeaderCell>
                    Material
                  </Styled.MergeHeaderCell>

                  <Styled.MergeHeaderCell>
                    Primary Qty
                  </Styled.MergeHeaderCell>
                </Styled.MergeTableHeader>

                {mergeMaterials.length === 0 ? (
                  <Styled.MergeEmptyRow>
                    No sub-materials
                    available.
                  </Styled.MergeEmptyRow>
                ) : (
                  mergeMaterials.map(
                    (item) => {
                      const isSelected =
                        selectedMaterials.includes(
                          item.id
                        );

                      return (
                        <Styled.MergeTableRow
                          key={
                            item.id
                          }
                          selected={
                            isSelected
                          }
                          onClick={() =>
                            handleMaterialSelection(
                              item.id
                            )
                          }
                        >
                          <Styled.MergeCheckboxCell>
                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                handleMaterialSelection(
                                  item.id
                                )
                              }
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              disabled={
                                isMerging
                              }
                            />
                          </Styled.MergeCheckboxCell>

                          <Styled.MergeCell>
                            {item.material ||
                              "-"}
                          </Styled.MergeCell>

                          <Styled.MergeCell>
                            {
                              item.primaryQuantity
                            }{" "}
                            {item.unit ||
                              ""}
                          </Styled.MergeCell>
                        </Styled.MergeTableRow>
                      );
                    }
                  )
                )}
              </Styled.MergeTable>
            </Styled.MergeTableWrapper>
          )}
        </Styled.MergeContent>
      )}
    </Styled.PageContainer>
  );
};

export default MergePage;
