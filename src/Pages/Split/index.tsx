import React, { useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  SPLIT_MATERIALS,
  EXECUTE_QUERY
} from "../../api";
import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaCodeBranch
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

const SplitPage: React.FC = () => {
  const [lotName, setLotName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const [splitData, setSplitData] = useState<any>(null);

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
    isSplitDetailsOpen,
    setIsSplitDetailsOpen
  ] = useState(true);

  const fetchSplitDetails = async (
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

      setSplitData(data);

      const firstSubMaterial: SubMaterial = {
        id: Date.now(),

        name:
          "New Material#1",

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

      setIsSplitDetailsOpen(
        true
      );

    } catch (err: any) {
      console.error(
        "Failed to fetch material information:",
        err
      );

      setSplitData(null);

      setSubMaterials([]);

      setSelectedSubMaterial(
        null
      );

      setSubMaterialName("");

      setPrimaryQuantity("0");

      setIsSplitDetailsOpen(
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
    const nextNumber =
      subMaterials.length + 1;

    const newName =
      `New Material#${nextNumber}`;

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

  const handleSplit = async () => {
    if (!lotName.trim()) {
      setToast({
        variant: "error",
        message:
          "Please enter a material number."
      });

      return;
    }

    if (!splitData) {
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
          "Please add at least one New-material."
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
          "Please enter a valid name and quantity for all New-materials."
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
          "New-material quantity cannot exceed the available quantity."
      });

      return;
    }

    try {
      setIsSplitting(true);
      setError(null);
      setToast(null);

      const splitPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.SplitMaterialInput, Cmf.Navigo.BusinessOrchestration",

        Material: {
          $type:
            "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",

          Id:
            splitData?.Id,

          Name:
            splitData?.Name ||
            lotName.trim()
        },

        ChildMaterials:
          subMaterials.map(
            (item) => ({
              $type:
                "Cmf.Navigo.BusinessObjects.SplitInputParameters, Cmf.Navigo.BusinessObjects",

              PrimaryQuantity:
                Number(
                  item.quantity
                ),

              SubMaterials: []
            })
          ),

        IgnoreLastServiceId: true
      };

      const response =
        await POST<any>(
          SPLIT_MATERIALS,
          splitPayload
        );

      const successMessage =
        response?.Message ||
        response?.message ||
        "Material split successfully.";

      if (lotName.trim()) {
        await fetchSplitDetails(
          lotName.trim(),
          false
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
        "Split Material API failed:",
        err
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to split material. Please try again.";

      setToast({
        variant: "error",
        message:
          errorMessage
      });

    } finally {
      setIsSplitting(false);
    }
  };

  const handleReset = () => {
    if (isSplitting) {
      return;
    }

    setIsResetting(true);

    setLotName("");
    setSplitData(null);
    setError(null);
    setToast(null);
    setSubMaterials([]);
    setSelectedSubMaterial(null);
    setSubMaterialName("");
    setPrimaryQuantity("0");
    setIsSplitDetailsOpen(true);

    setTimeout(() => {
      setIsResetting(false);
    }, 300);
  };

  const actualPrimaryQuantity =
    Number(
      splitData?.PrimaryQuantity ||
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

              if (splitData) {
                setSplitData(null);

                setSubMaterials([]);

                setSelectedSubMaterial(
                  null
                );

                setSubMaterialName("");

                setPrimaryQuantity(
                  "0"
                );

                setIsSplitDetailsOpen(
                  true
                );
              }
            }}

            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !splitData &&
                !isLoading &&
                !isSplitting
              ) {
                fetchSplitDetails(
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
                  !splitData &&
                  !isLoading &&
                  !isSplitting
                ) {
                  fetchSplitDetails(
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
            }
            disabled={
              isResetting
            }
          />

          <Button
            type="submit"
            onClick={
              handleSplit
            }
            disabled={
              !splitData ||
              isLoading ||
              isSplitting
            }
          />

        </Styled.ActionButtons>

      </Styled.TopControls>

      {(isLoading || isResetting) && (
        <Loader />
      )}

      <WipDataCard
        materialData={
          splitData
        }
        title="Materials Details"
        onFlowClick={() =>
          setIsFlowModalOpen(true)
        }
      />

      {splitData && (
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
            splitData
          }
        />
      )}

      {splitData && (
        <Styled.SplitDetailsBox>

          <Styled.SplitDetailsHeader>

            <Styled.SplitDetailsTitleWrapper>

              <FaCodeBranch />

              <span>
                Split Materials
              </span>

            </Styled.SplitDetailsTitleWrapper>

            <Styled.SplitDetailsToggle
              type="button"
              onClick={() =>
                setIsSplitDetailsOpen(
                  !isSplitDetailsOpen
                )
              }
            >
              {isSplitDetailsOpen ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </Styled.SplitDetailsToggle>

          </Styled.SplitDetailsHeader>

          {isSplitDetailsOpen && (
            <Styled.SplitDetailsBody>

              <Styled.SubMaterialPanel>

                <Styled.PanelHeader>

                  <span>
                    New Materials
                  </span>

                  <Styled.PanelActions>

                    <Styled.IconButton
                      type="button"
                      onClick={
                        handlePlus
                      }
                      disabled={
                        isSplitting
                      }
                      title="Add New-Material"
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
                        isSplitting
                      }
                      title="Delete New-Material"
                    >
                      <FaTrash
                        size={13}
                      />
                    </Styled.IconButton>

                  </Styled.PanelActions>

                </Styled.PanelHeader>

                <Styled.TableContainer>

                  {subMaterials.length ===
                  0 ? (

                    <Styled.EmptyTableMessage>
                      No new-materials
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
                              !isSplitting
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
                              {splitData?.PrimaryUnits || ""}
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
                  Material Details
                </Styled.EditPanelTitle>

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
                        isSplitting
                      }

                      onChange={(e) =>
                        handleSubMaterialNameChange(
                          e.target.value
                        )
                      }

                      placeholder="Enter new-material name"
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
                        isSplitting
                      }

                      onChange={(e) =>
                        handleQuantityChange(
                          e.target.value
                        )
                      }
                    />

                    <Styled.QuantityUnit>
                      {splitData?.PrimaryUnits || ""}
                    </Styled.QuantityUnit>

                  </Styled.QuantityInputWrapper>

                </Styled.FieldGroup>

                <Styled.RemainingQuantity>

                  <Styled.RemainingQuantityLabel>
                    Remaining Quantity:
                  </Styled.RemainingQuantityLabel>

                  <Styled.RemainingQuantityValue>
                    {remainingQuantity}{" "}
                    {splitData?.PrimaryUnits || ""}
                  </Styled.RemainingQuantityValue>

                </Styled.RemainingQuantity>

              </Styled.EditPanel>

            </Styled.SplitDetailsBody>
          )}

        </Styled.SplitDetailsBox>
      )}

    </Styled.PageContainer>
  );
};

export default SplitPage;