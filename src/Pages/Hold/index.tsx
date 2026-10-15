import React, { useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  LOAD_MATERIALS_REASONS,
  LOAD_OBJECT_RELATIONS,
  HOLD_MATERIALS,
  EXECUTE_QUERY
} from "../../api";
import { TextField } from "@mui/material";
import Button from "../../Library/Button";
import Loader from "../../Library/Loader";
import Toast from "../../components/Toast";
import HoldReasonMultiSelect, {
  HoldReasonOption
} from "../../components/HoldReasonMultiSelect";
import WipDataCardHold from "../../components/WipDataCardHold";
import FlowStepsModal from "../../components/FlowStepsModal";
const HoldPage = () => {
  const [holdType, setHoldType] = useState<string[]>([]);
  const [lotName, setLotName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [holdData, setHoldData] = useState<any>(null);

  const [holdTypeError, setHoldTypeError] =
    useState(false);

  const [holdTypeOptions, setHoldTypeOptions] =
    useState<HoldReasonOption[]>([]);

  const [toast, setToast] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const getMaterialBasicInformation = async (
    materialId: string
  ) => {
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

    const response = await POST<any>(
      GET_MATERIAL_BASIC_INFO,
      infoPayload
    );
    let data = response;

    if (response?.Material) {
      data = response.Material;
    } else if (response?.Data?.Material) {
      data = response.Data.Material;
    } else if (response?.Entities?.[0]) {
      data = response.Entities[0];
    }

    return data;
  };

  const fetchHoldDetails = async (
    nameToFetch: string
  ) => {
    if (!nameToFetch.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setToast(null);
    setHoldData(null);
    setHoldType([]);
    setHoldTypeError(false);
    setHoldTypeOptions([]);

    try {

      const queryPayload = {
        QueryObject: {
          $type:
            "Cmf.Foundation.BusinessObjects.QueryObject.QueryObject, Cmf.Foundation.BusinessObjects",

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

      const queryResponse = await POST<any>(
        EXECUTE_QUERY,
        queryPayload
      );

      let materialId: any = null;

      if (
        queryResponse?.NgpDataSet
          ?.T_Result?.[0]?.Id
      ) {
        materialId =
          queryResponse.NgpDataSet.T_Result[0].Id;
      } else if (
        Array.isArray(queryResponse) &&
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
  
      const data =
        await getMaterialBasicInformation(
          materialId
        );

      setHoldData(data);

      const materialName =
        data?.Name ||
        nameToFetch.trim();
      const reasonPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.LoadMaterialsCommonStepReasonsInput, Cmf.Navigo.BusinessOrchestration",
        IgnoreLastServiceId: true,
        "ReasonType": 3,
        Materials: [
          {
            Id: materialId,
            Name: materialName
          }
        ],

        LevelsToLoad: 1
      };

      const reasonResponse = await POST<any>(
        LOAD_MATERIALS_REASONS,
        reasonPayload
      );
      const reasons = Array.isArray(
        reasonResponse?.Reasons
      )
        ? reasonResponse.Reasons
        : [];
      const relationPayload = {
        $type:
          "Cmf.Foundation.BusinessOrchestration.GenericServiceManagement.InputObjects.LoadObjectsRelationsInput, Cmf.Foundation.BusinessOrchestration",

        LevelsToLoad: 1,

        Entities: [
          {
            $type:
              "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",

            Id: materialId,

            Name: materialName
          }
        ]
      };

      const relationResponse =
        await POST<any>(
          LOAD_OBJECT_RELATIONS,
          relationPayload
        );

      const relationData =
        relationResponse
          ?.Entities?.[0]
          ?.RelationCollection
          ?.CMFMapData;

      let existingHoldReasons: any[] =
        [];

      if (
        Array.isArray(relationData)
      ) {
        const holdReasonRelation =
          relationData.find(
            (item: any) =>
              Array.isArray(item) &&
              item[0] ===
                "MaterialHoldReason"
          );

        if (
          Array.isArray(
            holdReasonRelation?.[1]
          )
        ) {
          existingHoldReasons =
            holdReasonRelation[1];
        }
      }

      const existingHoldReasonIds =
        new Set(
          existingHoldReasons
            .map(
              (holdReason: any) =>
                holdReason
                  ?.TargetEntity?.Id
            )
            .filter(Boolean)
            .map(String)
        );

      const reasonOptions:
        HoldReasonOption[] =
        reasons
          .filter(
            (reason: any) =>
              reason?.Name &&
              reason?.Id
          )
          .map(
            (reason: any) => {
              const reasonId =
                String(reason.Id);

              const isAlreadyUsed =
                existingHoldReasonIds.has(
                  reasonId
                );

              return {
                label: String(
                  reason.Name
                ),

                value: reasonId,

                disabled:
                  isAlreadyUsed
              };
            }
          );

      setHoldTypeOptions(
        reasonOptions
      );

      if (
        reasonOptions.length === 0
      ) {
        setToast({
          variant: "error",
          message:
            "No hold reasons are available for this material."
        });
      }
    } catch (err: any) {
      console.error(
        "Failed to fetch material information:",
        err
      );

      setHoldData(null);
      setHoldTypeOptions([]);
      setHoldType([]);

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

  const handleSubmit = async () => {

    if (!lotName.trim()) {
      setToast({
        variant: "error",
        message:
          "Please enter a material number."
      });

      return;
    }

    if (!holdData) {
      return;
    }
    if (holdType.length === 0) {
      setHoldTypeError(true);
      return;
    }
    setError(null);
    setToast(null);
    setHoldTypeError(false);
    setIsLoading(true);

    try {
      const materialHoldReasons =
        holdType.map(
          (
            reasonId,
            index
          ) => ({
            $id: String(
              index + 2
            ),

            $type:
              "Cmf.Navigo.BusinessObjects.MaterialHoldReason, Cmf.Navigo.BusinessObjects",

            TargetEntity: {
              $id: `reason-${index + 1}`,

              $type:
                "Cmf.Navigo.BusinessObjects.Reason, Cmf.Navigo.BusinessObjects",

              ReasonType: 3,

              Id: reasonId
            },

            SourceEntity: {
              $id: `material-${index + 1}`,

              $type:
                "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",

              Id: holdData.Id,

              Name: holdData.Name
            }
          })
        );
      const holdPayload = {
        $id: "1",

        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.HoldMaterialsInput, Cmf.Navigo.BusinessOrchestration",

        MaterialHoldReasonCollection: {
          $type:
            "Cmf.Navigo.BusinessObjects.MaterialHoldReasonCollection, Cmf.Navigo.BusinessObjects",

          $values:
            materialHoldReasons
        },

        Materials: {
          $type:
            "Cmf.Navigo.BusinessObjects.MaterialCollection, Cmf.Navigo.BusinessObjects",

          $values: [
            {
              $ref: "material-1"
            }
          ]
        },

        IgnoreLastServiceId: true
      };
      const holdResponse =
        await POST<any>(
          HOLD_MATERIALS,
          holdPayload
        );
      const responseMessage =
        holdResponse?.Message ||
        holdResponse?.message ||
        "";

      setLotName("");
      setHoldData(null);
      setHoldType([]);
      setHoldTypeError(false);
      setHoldTypeOptions([]);
      setError(null);

      setToast({
        variant: "success",

        message:
          responseMessage ||
          "Material(s) placed on hold successfully."
      });
    } catch (err: any) {
      console.error(
        "Hold API failed:",
        err
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to perform hold action.";

      setError(null);

      setToast({
        variant: "error",
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

const handleReset = () => {
  setIsResetting(true);

  setHoldType([]);
  setLotName("");
  setHoldData(null);
  setError(null);
  setToast(null);
  setHoldTypeError(false);
  setHoldTypeOptions([]);

  setTimeout(() => {
    setIsResetting(false);
  }, 300);
};

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
              if (holdData) {
                setHoldData(null);
                setHoldType([]);
                setHoldTypeError(
                  false
                );
                setHoldTypeOptions(
                  []
                );
              }
            }}
            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !holdData &&
                !isLoading
              ) {
                fetchHoldDetails(
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
                  !holdData &&
                  !isLoading
                ) {
                  fetchHoldDetails(
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

        <Styled.DropdownBox>
          <HoldReasonMultiSelect
            value={holdType}
            options={
              holdTypeOptions
            }
            onChange={(
              values
            ) => {
             
              setHoldType(
                values
              );

              if (
                values.length > 0
              ) {
                setHoldTypeError(
                  false
                );
              }

              setError(null);
              setToast(null);
            }}
            error={
              holdTypeError
            }
            required
            placeholder="Select Hold Reason"
          />
        </Styled.DropdownBox>

        <Styled.ActionButtons>
          <Button
            type="reset"
            onClick={
              handleReset
            }   disabled={isResetting}
          />

          <Button
            type="submit"
            onClick={
              handleSubmit
            }
            disabled={
              !holdData ||
              isLoading
            }
          />
        </Styled.ActionButtons>
      </Styled.TopControls>


   {(isLoading|| isResetting) && <Loader />}

<WipDataCardHold
  materialData={holdData}
  title="Materials Details" onFlowClick={() => setIsFlowModalOpen(true)}
/>
 {holdData && (
        <FlowStepsModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          materialData={holdData}
        />
      )}
    </Styled.PageContainer>
  );
};

export default HoldPage;