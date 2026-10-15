import React, { useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  GET_MATERIAL_CHILDREN,
  EXPAND_MATERIAL,
  EXECUTE_QUERY
} from "../../api";
import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaExpand
} from "react-icons/fa";
import { TextField } from "@mui/material";
import Button from "../../Library/Button";
import Loader from "../../Library/Loader";
import Toast from "../../components/Toast";
import WipDataCard from "../../components/WipDataCard";
import FlowStepsModal from "../../components/FlowStepsModal";
interface SubMaterial {
  id: number;
  name: string;
  quantity: number;
}

interface ExpandedSubMaterial {
  id: any;
  material: string;
  primaryQuantity: number;
  unit: string;
}

const ExpandPage: React.FC = () => {
  const [lotName, setLotName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
   const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const [expandData, setExpandData] = useState<any>(null);

  const [subMaterials, setSubMaterials] =
    useState<SubMaterial[]>([]);

  const [
    selectedSubMaterial,
    setSelectedSubMaterial
  ] = useState<number | null>(null);

  const [subMaterialName, setSubMaterialName] =
    useState("");

  const [primaryQuantity, setPrimaryQuantity] =
    useState("0");

  const [
    expandedSubMaterials,
    setExpandedSubMaterials
  ] = useState<ExpandedSubMaterial[]>([]);

  const [
    isExpandDetailsOpen,
    setIsExpandDetailsOpen
  ] = useState(true);

  const [
    isExpandedSubMaterialsOpen,
    setIsExpandedSubMaterialsOpen
  ] = useState(true);

  const fetchExpandedSubMaterials = async (
    materialId: any,
    materialName: string
  ) => {
    if (!materialId) {
      return;
    }

    try {
      const childrenPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialChildrenWithContainersAsDataSetInput, Cmf.Navigo.BusinessOrchestration",

        Material: {
          Id: materialId,
          Name:
            materialName ||
            lotName.trim()
        }
      };

      const response = await POST<any>(
        GET_MATERIAL_CHILDREN,
        childrenPayload
      );

      const result =
        response
          ?.SubMaterialsWithContainers
          ?.T_Result || [];

      const mappedMaterials: ExpandedSubMaterial[] =
        result.map(
          (item: any) => ({
            id:
              item.MaterialId ??
              item.Id,

            material:
              item.Name || "",

            primaryQuantity:
              Number(
                item.PrimaryQuantity || 0
              ),

            unit:
              item.PrimaryUnits1 || ""
          })
        );

      setExpandedSubMaterials(
        mappedMaterials
      );
    } catch (err: any) {
      console.error(
        "Failed to fetch expanded sub-materials:",
        err
      );

      setExpandedSubMaterials([]);

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load sub-material details.";

      setToast({
        variant: "error",
        message: errorMessage
      });
    }
  };

  const fetchExpandDetails = async (
    nameToFetch: string,
    loadChildren: boolean = true
  ) => {
    if (!nameToFetch.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setToast(null);

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
        queryResponse
          ?.NgpDataSet
          ?.T_Result?.[0]
          ?.Id
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

      setExpandData(data);

      const materialName =
        data?.Name ||
        nameToFetch.trim();

      if (loadChildren) {
        await fetchExpandedSubMaterials(
          materialId,
          materialName
        );
      }

      const firstSubMaterial: SubMaterial = {
        id: Date.now(),

        name:
          `${materialName}#1`,

        quantity: 0
      };

      setSubMaterials([
        firstSubMaterial
      ]);

      setSelectedSubMaterial(
        firstSubMaterial.id
      );

      setSubMaterialName(
        firstSubMaterial.name
      );

      setPrimaryQuantity("0");
      setIsExpandDetailsOpen(
        true
      );
      setIsExpandedSubMaterialsOpen(
        true
      );

    } catch (err: any) {
      console.error(
        "Failed to fetch material information:",
        err
      );

      setExpandData(null);

      setSubMaterials([]);

      setSelectedSubMaterial(
        null
      );

      setSubMaterialName("");

      setPrimaryQuantity("0");

      setExpandedSubMaterials(
        []
      );

      setIsExpandDetailsOpen(
        true
      );

      setIsExpandedSubMaterialsOpen(
        true
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
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

  const handlePlus = () => {
    const baseName =
      expandData?.Name ||
      lotName.trim();

    const nextNumber =
      subMaterials.length + 1;

    const newName =
      `${baseName}#${nextNumber}`;

    const newSubMaterial: SubMaterial = {
      id: Date.now(),
      name: newName,
      quantity: 0
    };

    setSubMaterials(
      (previous) => [
        ...previous,
        newSubMaterial
      ]
    );

    setSelectedSubMaterial(
      newSubMaterial.id
    );

    setSubMaterialName(
      newName
    );

    setPrimaryQuantity("0");
  };


  const handleSelectSubMaterial = (
    item: SubMaterial
  ) => {
    setSelectedSubMaterial(
      item.id
    );

    setSubMaterialName(
      item.name
    );

    setPrimaryQuantity(
      String(item.quantity)
    );
  };

  const handleSubMaterialNameChange = (
    value: string
  ) => {
    setSubMaterialName(value);

    if (
      selectedSubMaterial ===
      null
    ) {
      return;
    }

    setSubMaterials(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            selectedSubMaterial
              ? {
                  ...item,
                  name: value
                }
              : item
        )
    );
  };

  const handleQuantityChange = (
    value: string
  ) => {
    setPrimaryQuantity(value);

    if (
      selectedSubMaterial ===
      null
    ) {
      return;
    }

    const quantity =
      value === ""
        ? 0
        : Number(value);

    setSubMaterials(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            selectedSubMaterial
              ? {
                  ...item,
                  quantity:
                    isNaN(quantity)
                      ? 0
                      : quantity
                }
              : item
        )
    );
  };

  const handleDeleteSubMaterial =
    () => {
      if (
        selectedSubMaterial ===
        null
      ) {
        return;
      }

      const remaining =
        subMaterials.filter(
          (item) =>
            item.id !==
            selectedSubMaterial
        );

      setSubMaterials(
        remaining
      );

      if (
        remaining.length > 0
      ) {
        const nextItem =
          remaining[
            remaining.length - 1
          ];

        setSelectedSubMaterial(
          nextItem.id
        );

        setSubMaterialName(
          nextItem.name
        );

        setPrimaryQuantity(
          String(
            nextItem.quantity
          )
        );

      } else {
        setSelectedSubMaterial(
          null
        );

        setSubMaterialName("");

        setPrimaryQuantity("0");
      }
    };


  const handleExpand = async () => {
    if (!lotName.trim()) {
      setToast({
        variant: "error",
        message:
          "Please enter a material number."
      });

      return;
    }

    if (!expandData) {
      setToast({
        variant: "error",
        message:
          "Please enter a material number and load the WIP details."
      });

      return;
    }

    if (
      subMaterials.length ===
      0
    ) {
      setToast({
        variant: "error",
        message:
          "Please add at least one sub-material."
      });

      return;
    }

    const invalidSubMaterial =
      subMaterials.find(
        (item) =>
          !item.name.trim() ||
          Number(item.quantity) <= 0
      );

    if (invalidSubMaterial) {
      setToast({
        variant: "error",
        message:
          "Please enter a valid name and quantity for all sub-materials."
      });

      return;
    }

    if (
      totalSubMaterialQuantity >
      actualPrimaryQuantity
    ) {
      setToast({
        variant: "error",
        message:
          "Sub-material quantity cannot exceed the available quantity."
      });

      return;
    }

    try {
      setIsExpanding(true);
      setError(null);
      setToast(null);
      const expandPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.ExpandMaterialInput, Cmf.Navigo.BusinessOrchestration",

        Form:
          expandData?.Form ||
          "batch",

        Material: {
          Id:
            expandData?.Id
        },

        SubMaterials: {
          $type:
            "Cmf.Navigo.BusinessObjects.MaterialCollection, Cmf.Navigo.BusinessObjects",

          $values:
            subMaterials.map(
              (item) => ({
                PrimaryQuantity:
                  Number(
                    item.quantity
                  ),

                Product: {}
              })
            )
        },

        IgnoreLastServiceId: true
      };

      const response =
        await POST<any>(
          EXPAND_MATERIAL,
          expandPayload
        );
      const successMessage =
        response?.Message ||
        response?.message ||
        "Material expanded successfully.";
      if (lotName.trim()) {
        await fetchExpandDetails(
          lotName.trim(),
          true
        );
      }

      setSubMaterials([]);
      setSelectedSubMaterial(
        null
      );
      setSubMaterialName("");
      setPrimaryQuantity("0");
      setToast({
        variant: "success",
        message:
          successMessage
      });

    } catch (err: any) {
      console.error(
        "Expand Material API failed:",
        err
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to expand material. Please try again.";

      setToast({
        variant: "error",
        message:
          errorMessage
      });

    } finally {
      setIsExpanding(false);
    }
  };

  const handleReset = () => {
    if (isExpanding) {
      return;
    }
    setIsResetting(true);
    setLotName("");
    setExpandData(null);
    setError(null);
    setToast(null);
    setSubMaterials([]);
    setSelectedSubMaterial(null);
    setSubMaterialName("");
    setPrimaryQuantity("0");
    setExpandedSubMaterials([]);
    setIsExpandDetailsOpen(true);
    setIsExpandedSubMaterialsOpen(true);
     setTimeout(() => {
    setIsResetting(false);
  }, 300);
  };
  const actualPrimaryQuantity =
    Number(
      expandData?.PrimaryQuantity ||
        0
    );

  const totalSubMaterialQuantity =
    subMaterials.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );

  const remainingQuantity =
    Math.max(
      0,
      actualPrimaryQuantity -
        totalSubMaterialQuantity
    );
  return (
    <Styled.PageContainer>

      {/* TOAST */}

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
              setToast(null);
              if (expandData) {
                setExpandData(null);

                setSubMaterials([]);

                setSelectedSubMaterial(
                  null
                );

                setSubMaterialName("");

                setPrimaryQuantity(
                  "0"
                );

                setExpandedSubMaterials(
                  []
                );

                setIsExpandDetailsOpen(
                  true
                );

                setIsExpandedSubMaterialsOpen(
                  true
                );
              }
            }}

            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !expandData &&
                !isLoading &&
                !isExpanding
              ) {
                fetchExpandDetails(
                  materialNumber,
                  true
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
                  !expandData &&
                  !isLoading &&
                  !isExpanding
                ) {
                  fetchExpandDetails(
                    materialNumber,
                    true
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
              handleExpand
            }
            disabled={
              !expandData ||
              isLoading ||
              isExpanding
            }
          />

        </Styled.ActionButtons>

      </Styled.TopControls>

      {(isLoading || isResetting) && <Loader />}

      <WipDataCard
        materialData={
          expandData
        }
        title="Materials Details" onFlowClick={() => setIsFlowModalOpen(true)}
      />
      {expandData && (
        <FlowStepsModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          materialData={expandData}
        />
      )}

      {expandData && (
        <Styled.ExpandDetailsBox>

          <Styled.ExpandDetailsHeader>

            <Styled.ExpandDetailsTitleWrapper>

              <FaExpand />

              <span>
                Expand Materials
              </span>

            </Styled.ExpandDetailsTitleWrapper>

            <Styled.ExpandDetailsToggle
              type="button"
              onClick={() =>
                setIsExpandDetailsOpen(
                  !isExpandDetailsOpen
                )
              }
            >
              {isExpandDetailsOpen ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </Styled.ExpandDetailsToggle>

          </Styled.ExpandDetailsHeader>

          {isExpandDetailsOpen && (
            <Styled.ExpandDetailsBody>

              <Styled.SubMaterialPanel>

                <Styled.PanelHeader>

                  <span>
                    New Sub-Materials
                  </span>

                  <Styled.PanelActions>

                    <Styled.IconButton
                      type="button"
                      onClick={
                        handlePlus
                      }
                      disabled={
                        isExpanding
                      }
                      title="Add Sub-Material"
                    >
                      <FaPlus
                        size={13}
                      />
                    </Styled.IconButton>

                    <Styled.IconButton
                      type="button"
                      onClick={
                        handleDeleteSubMaterial
                      }
                      disabled={
                        selectedSubMaterial ===
                          null ||
                        isExpanding
                      }
                      title="Delete Sub-Material"
                    >
                      <FaTrash
                        size={13}
                      />
                    </Styled.IconButton>

                  </Styled.PanelActions>

                </Styled.PanelHeader>

                <Styled.TableContainer>

                  <Styled.TableHeader>

                    <Styled.TableCell>
                      Sub-Material
                    </Styled.TableCell>

                    <Styled.TableCell>
                      Quantity
                    </Styled.TableCell>

                  </Styled.TableHeader>

                  {subMaterials.length ===
                  0 ? (

                    <Styled.EmptyTableMessage>
                      No sub-materials
                      available
                    </Styled.EmptyTableMessage>

                  ) : (

                    subMaterials.map(
                      (item) => (

                        <Styled.TableRow
                          key={
                            item.id
                          }

                          selected={
                            selectedSubMaterial ===
                            item.id
                          }

                          onClick={() => {
                            if (
                              !isExpanding
                            ) {
                              handleSelectSubMaterial(
                                item
                              );
                            }
                          }}
                        >

                          <Styled.TableCell>
                            {item.name}
                          </Styled.TableCell>

                          <Styled.QuantityCell>

                            <Styled.QuantityBadge>
                             {item.quantity}{" "}
                              {expandData?.PrimaryUnits || ""}
                            </Styled.QuantityBadge>

                          </Styled.QuantityCell>

                        </Styled.TableRow>

                      )
                    )

                  )}

                </Styled.TableContainer>

              </Styled.SubMaterialPanel>

              <Styled.EditPanel>

                <Styled.EditPanelTitle>
                  Sub-Material Details
                </Styled.EditPanelTitle>

                {/* NAME */}

                <Styled.FieldGroup>

                  <Styled.FieldLabel>
                    Name
                  </Styled.FieldLabel>

                  <Styled.QuantityInputWrapper>

                    <Styled.QuantityInput
                      type="text"
                      value={
                        subMaterialName
                      }

                      disabled={
                        isExpanding
                      }

                      onChange={(e) =>
                        handleSubMaterialNameChange(
                          e.target.value
                        )
                      }

                      placeholder="Enter sub-material name"
                    />

                  </Styled.QuantityInputWrapper>

                </Styled.FieldGroup>

                <Styled.FieldGroup>

                  <Styled.FieldLabel>
                    Primary Quantity
                  </Styled.FieldLabel>

                  <Styled.QuantityInputWrapper>

                    <Styled.QuantityInput
                      type="number"
                      min="0"
                      value={
                        primaryQuantity
                      }

                      disabled={
                        isExpanding
                      }

                      onChange={(e) =>
                        handleQuantityChange(
                          e.target.value
                        )
                      }
                    />

                    <Styled.QuantityUnit>
                     {expandData?.PrimaryUnits || ""}
                    </Styled.QuantityUnit>

                  </Styled.QuantityInputWrapper>

                </Styled.FieldGroup>

                <Styled.RemainingQuantity>

                  <Styled.RemainingQuantityLabel>
                    Remaining Quantity:
                  </Styled.RemainingQuantityLabel>

                  <Styled.RemainingQuantityValue>
                   {remainingQuantity}{" "}
                    {expandData?.PrimaryUnits || ""}
                  </Styled.RemainingQuantityValue>

                </Styled.RemainingQuantity>

              </Styled.EditPanel>

            </Styled.ExpandDetailsBody>
          )}

        </Styled.ExpandDetailsBox>
      )}

      {expandedSubMaterials.length > 0 && (
        <Styled.ExpandedSubMaterialsBox>

          {/* HEADER */}

          <Styled.ExpandedSubMaterialsHeader
            onClick={() =>
              setIsExpandedSubMaterialsOpen(
                (previous) =>
                  !previous
              )
            }
          >

            <Styled.ExpandedSubMaterialsTitle>
              Sub-Materials (
              {expandedSubMaterials.length}
              )
            </Styled.ExpandedSubMaterialsTitle>

            <Styled.ExpandedSubMaterialsToggle
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                setIsExpandedSubMaterialsOpen(
                  (previous) =>
                    !previous
                );
              }}
            >
              {isExpandedSubMaterialsOpen ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </Styled.ExpandedSubMaterialsToggle>

          </Styled.ExpandedSubMaterialsHeader>

          {isExpandedSubMaterialsOpen && (
            <Styled.ExpandedSubMaterialsTable>

              <Styled.ExpandedSubMaterialsTableHeader>

                <Styled.ExpandedSubMaterialsCell>
                  Material
                </Styled.ExpandedSubMaterialsCell>

                <Styled.ExpandedSubMaterialsCell>
                  Primary Qty
                </Styled.ExpandedSubMaterialsCell>

              </Styled.ExpandedSubMaterialsTableHeader>

              {expandedSubMaterials.map(
                (item) => (

                  <Styled.ExpandedSubMaterialsRow
                    key={item.id}
                  >

                    <Styled.ExpandedSubMaterialsCell>
                      {item.material}
                    </Styled.ExpandedSubMaterialsCell>

                    <Styled.ExpandedSubMaterialsCell
                      $quantity
                    >
                      {
                        item.primaryQuantity
                      }{" "}
                      {item.unit}
                    </Styled.ExpandedSubMaterialsCell>

                  </Styled.ExpandedSubMaterialsRow>

                )
              )}

            </Styled.ExpandedSubMaterialsTable>
          )}

        </Styled.ExpandedSubMaterialsBox>
      )}

    </Styled.PageContainer>
  );
};

export default ExpandPage;
