
import React, { useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  EXECUTE_QUERY,
  GET_MATERIAL_CHILDREN,
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
  FaCompress
} from "react-icons/fa";

interface CollapseMaterial {
  id: number | string;
  material: string;
  product: string;
  primaryQuantity: number;
  unit: string;
  type: string;
}

const CollapsePage = () => {
  const [lotName, setLotName] = useState("");
 const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [isResetting, setIsResetting] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const [collapseData, setCollapseData] = useState<any>(null);

  const [
    collapseMaterials,
    setCollapseMaterials
  ] = useState<CollapseMaterial[]>([]);

  const [
    selectedMaterials,
    setSelectedMaterials
  ] = useState<(number | string)[]>([]);

  /*
   * Collapse Details
   * expanded by default
   */
  const [
    isCollapseDetailsOpen,
    setIsCollapseDetailsOpen
  ] = useState(true);

  /*
   * Build sub-material table data
   */
  const buildCollapseMaterials = (
    response: any
  ): CollapseMaterial[] => {
    const materials =
      response?.SubMaterialsWithContainers
        ?.T_Result || [];

    return materials.map(
      (
        item: any,
        index: number
      ) => ({
        id:
          item?.MaterialId ??
          index,

        material:
          item?.Name ??
          "",

        product:
          item?.ProductName
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
          "",

        type:
          item?.Type ??
          ""
      })
    );
  };

  /*
   * Fetch material details
   * and sub-material details
   */
  const fetchCollapseDetails = async (
    nameToFetch: string
  ) => {
    if (!nameToFetch.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

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

      setCollapseData(data);

      const childrenPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialChildrenWithContainersAsDataSetInput, Cmf.Navigo.BusinessOrchestration",

        Material: {
          Id: materialId,
          Name:
            nameToFetch.trim()
        }
      };

      const childrenResponse =
        await POST<any>(
          GET_MATERIAL_CHILDREN,
          childrenPayload
        );

      const materialList =
        buildCollapseMaterials(
          childrenResponse
        );

      setCollapseMaterials(
        materialList
      );

      setSelectedMaterials([]);

    } catch (err: any) {
      console.error(
        "Failed to fetch material information:",
        err
      );

      setCollapseData(null);
      setCollapseMaterials([]);
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
    if (isCollapsing) {
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
    if (isCollapsing) {
      return;
    }

    setError(null);

    if (
      selectedMaterials.length ===
      collapseMaterials.length
    ) {
      setSelectedMaterials([]);
      return;
    }

    setSelectedMaterials(
      collapseMaterials.map(
        (item) => item.id
      )
    );
  };

  const handleCollapse = async () => {
    if (!lotName.trim()) {
      setError(null);

      setToast({
        variant: "error",
        message:
          "Please enter a material number."
      });

      return;
    }
    if (!collapseData) {
      setError(null);

      setToast({
        variant: "error",
        message:
          "Please enter a material number and load the WIP details."
      });

      return;
    }
    if (
      selectedMaterials.length === 0
    ) {
      setError(null);

      setToast({
        variant: "error",
        message:
          "Please select at least one sub-material to collapse."
      });

      return;
    }

    try {
      setIsCollapsing(true);
      setError(null);
      setToast(null);
      const selectedRows =
        collapseMaterials.filter(
          (item) =>
            selectedMaterials.includes(
              item.id
            )
        );
      const collapsePayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.CollapseMaterialInput, Cmf.Navigo.BusinessOrchestration",

        Material: {
          Id:
            collapseData?.Id
        },

        SubMaterials: {
          $values:
            selectedRows.map(
              (item) => ({
                Id: item.id
              })
            )
        },

        IgnoreLastServiceId: true
      };

      const response =
        await POST<any>(
          COLLAPSE_MATERIAL,
          collapsePayload
        );

      const successMessage =
        response?.Message ||
        response?.message ||
        "Material collapsed successfully.";

      setToast({
        variant: "success",
        message: successMessage
      });

      setSelectedMaterials([]);
      await fetchCollapseDetails(
        lotName.trim()
      );

    } catch (err: any) {
      console.error(
        "Collapse Material API failed:",
        err
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.Message ||
        err?.message ||
        "Failed to collapse material. Please try again.";

      setToast({
        variant: "error",
        message: errorMessage
      });
    } finally {
      setIsCollapsing(false);
    }
  };
  const handleReset = () => {
    if (isCollapsing) {
      return;
    }
 setIsResetting(true);
    setLotName("");
    setCollapseData(null);
    setCollapseMaterials([]);
    setSelectedMaterials([]);
    setError(null);
    setToast(null);
     setTimeout(() => {
    setIsResetting(false);
  }, 300);
  };

  const allSelected =
    collapseMaterials.length > 0 &&
    selectedMaterials.length ===
      collapseMaterials.length;

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
              if (collapseData) {
                setCollapseData(null);
                setCollapseMaterials([]);
                setSelectedMaterials([]);
              }
            }}
            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !isLoading &&
                !isCollapsing &&
                !collapseData
              ) {
                fetchCollapseDetails(
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
                  !isCollapsing &&
                  !collapseData
                ) {
                  fetchCollapseDetails(
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
            } disabled={isResetting}
          />

          <Button
            type="submit"
            onClick={
              handleCollapse
            }
            disabled={
              !collapseData ||
              isLoading ||
              isCollapsing
            }
          />

        </Styled.ActionButtons>

      </Styled.TopControls>
      {(isLoading || isResetting) && <Loader />}

      <WipDataCard
        materialData={
          collapseData
        }
        title="Materials Details" onFlowClick={() => setIsFlowModalOpen(true)}
      />
      {collapseData && (
        <FlowStepsModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          materialData={collapseData}
        />
      )}
      {collapseData && (
        <Styled.CollapseContent>

          {/* SECTION HEADER */}

          <Styled.CollapseDetailsHeader>

            <Styled.CollapseDetailsTitleWrapper>

              <FaCompress />

              <span>
                Sub-Materials
                to Be Collapsed.
              </span>

            </Styled.CollapseDetailsTitleWrapper>

            <Styled.CollapseDetailsToggle
              type="button"
              onClick={() =>
                setIsCollapseDetailsOpen(
                  !isCollapseDetailsOpen
                )
              }
            >
              {isCollapseDetailsOpen ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </Styled.CollapseDetailsToggle>

          </Styled.CollapseDetailsHeader>

          {/* COLLAPSE DETAILS CONTENT */}

          {isCollapseDetailsOpen && (
            <Styled.CollapseTableWrapper>

              <Styled.CollapseTable>

                <Styled.CollapseTableHeader>

                  <Styled.CollapseCheckboxCell>

                    <input
                      type="checkbox"
                      checked={
                        allSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                      disabled={
                        isCollapsing ||
                        collapseMaterials.length ===
                          0
                      }
                    />

                  </Styled.CollapseCheckboxCell>

                  <Styled.CollapseHeaderCell>
                    Material
                  </Styled.CollapseHeaderCell>

                  <Styled.CollapseHeaderCell>
                    Primary Qty
                  </Styled.CollapseHeaderCell>

                </Styled.CollapseTableHeader>

                {collapseMaterials.length === 0 ? (

                  <Styled.CollapseEmptyRow>
                    No sub-materials
                    available.
                  </Styled.CollapseEmptyRow>

                ) : (

                  collapseMaterials.map(
                    (item) => {

                      const isSelected =
                        selectedMaterials.includes(
                          item.id
                        );

                      return (
                        <Styled.CollapseTableRow
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

                          <Styled.CollapseCheckboxCell>

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
                                isCollapsing
                              }
                            />

                          </Styled.CollapseCheckboxCell>

                          <Styled.CollapseCell>
                            {item.material ||
                              "-"}
                          </Styled.CollapseCell>

                          <Styled.CollapseCell>
                            {item.primaryQuantity}{" "}
                            {item.unit || ""}
                          </Styled.CollapseCell>

                        </Styled.CollapseTableRow>
                      );
                    }
                  )

                )}

              </Styled.CollapseTable>

            </Styled.CollapseTableWrapper>
          )}

        </Styled.CollapseContent>
      )}

    </Styled.PageContainer>
  );
};

export default CollapsePage;

