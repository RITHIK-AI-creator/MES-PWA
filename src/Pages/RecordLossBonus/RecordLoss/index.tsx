
import React, { useState } from "react";
import * as Styled from "./../index.styled";
import { POST } from "../../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  LOAD_STEP_REASONS,
  RECORD_MATERIAL_LOSS_AND_BONUS,
  EXECUTE_QUERY
} from "../../../api";
import { TextField } from "@mui/material";
import Button from "../../../Library/Button";
import Loader from "../../../Library/Loader";
import Toast from "../../../components/Toast";
import RecordReasonMultiSelect, {
  RecordReasonOption
} from "../../../components/RecordReasonMultiSelect";
import WipDataCardHold from "../../../components/WipDataCardHold";
import FlowStepsModal from "../../../components/FlowStepsModal";

const RecordLossPage = () => {
  const [recordLossBonusType, setRecordLossBonusType] =
    useState<string[]>([]);

  const [recordLossBonusQuantities, setRecordLossBonusQuantities] =
    useState<Record<string, string>>({});

  const [lotName, setLotName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isFlowModalOpen, setIsFlowModalOpen] =
    useState(false);

  const [recordLossBonusData, setRecordLossBonusData] =
    useState<any>(null);

  const [recordLossBonusTypeError, setRecordLossBonusTypeError] =
    useState(false);

  const [recordLossBonusTypeOptions, setRecordLossBonusTypeOptions] =
    useState<RecordReasonOption[]>([]);

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

  const fetchRecordLossBonusDetails = async (
    nameToFetch: string
  ) => {
    if (!nameToFetch.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setToast(null);
    setRecordLossBonusData(null);
    setRecordLossBonusType([]);
    setRecordLossBonusQuantities({});
    setRecordLossBonusTypeError(false);
    setRecordLossBonusTypeOptions([]);

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

      const reasonPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.FacilityManagement.FlowManagement.InputObjects.LoadStepReasonsInput, Cmf.Navigo.BusinessOrchestration",

        Step: {
          Id: data.Step.Id
        }
      };

      const reasonResponse = await POST<any>(
        LOAD_STEP_REASONS,
        reasonPayload
      );

      const stepReasonRelation =
        reasonResponse?.Step
          ?.RelationCollection
          ?.CMFMapData
          ?.find(
            (item: any) =>
              Array.isArray(item) &&
              item[0] === "StepReason"
          );

      const stepReasons =
        Array.isArray(stepReasonRelation?.[1])
          ? stepReasonRelation[1]
          : [];

      const reasons = stepReasons.filter(
        (reason: any) =>
          reason?.ApplicableToRecordLoss === true &&
          reason?.TargetEntity?.Name &&
          reason?.TargetEntity?.Id
      );
      const materialData = {
        ...data,

        Step: {
          ...data.Step,

          RelationCollection:
            reasonResponse?.Step?.RelationCollection
        }
      };

      setRecordLossBonusData(
        materialData
      );

      const reasonOptions:
        RecordReasonOption[] =
        reasons.map(
          (reason: any) => ({
            label:
              String(
                reason.TargetEntity.Name
              ),

            value:
              String(
                reason.TargetEntity.Id
              ),

            disabled: false
          })
        );

      setRecordLossBonusTypeOptions(
        reasonOptions
      );

      if (
        reasonOptions.length === 0
      ) {
        setToast({
          variant: "error",
          message:
            "There are no valid Reasons defined for the Step."
        });
      }
    } catch (err: any) {
      console.error(
        "Failed to fetch material information:",
        err
      );

      setRecordLossBonusData(null);
      setRecordLossBonusTypeOptions([]);
      setRecordLossBonusType([]);
      setRecordLossBonusQuantities({});

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
    if (!recordLossBonusData) {
      return;
    }

    if (recordLossBonusType.length === 0) {
      setRecordLossBonusTypeError(true);
      return;
    }

    const hasInvalidQuantity =
      recordLossBonusType.some(
        (reasonId) =>
          !recordLossBonusQuantities[reasonId] ||
          Number(
            recordLossBonusQuantities[reasonId]
          ) <= 0
      );

    if (hasInvalidQuantity) {
      setError(
        "Please enter a valid quantity for all selected reasons."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setToast(null);

    try {
      const stepReasonRelation =
        recordLossBonusData
          ?.Step
          ?.RelationCollection
          ?.CMFMapData
          ?.find(
            (item: any) =>
              Array.isArray(item) &&
              item[0] === "StepReason"
          );

      const stepReasons =
        Array.isArray(
          stepReasonRelation?.[1]
        )
          ? stepReasonRelation[1]
          : [];

      const selectedStepReasons =
        recordLossBonusType.map(
          (reasonId, index) => {

            const selectedStepReason =
              stepReasons.find(
                (stepReason: any) =>
                  String(
                    stepReason?.TargetEntity?.Id
                  ) ===
                  String(reasonId)
              );

            if (!selectedStepReason) {
              throw new Error(
                `Reason not found for reason ID: ${reasonId}`
              );
            }

            const reasonReferenceId =
              String(62 + index);

            return {
              $type:
                "Cmf.Navigo.BusinessObjects.StepReason, Cmf.Navigo.BusinessObjects",

              TargetEntity: {
                $id:
                  reasonReferenceId,

                $type:
                  "Cmf.Navigo.BusinessObjects.Reason, Cmf.Navigo.BusinessObjects",

                Id:
                  selectedStepReason
                    .TargetEntity.Id,

                ...(selectedStepReason
                  .TargetEntity.Name
                  ? {
                      Name:
                        selectedStepReason
                          .TargetEntity
                          .Name
                    }
                  : {})
              }
            };
          }
        );


      const lossReasons =
        selectedStepReasons.map(
          (
            stepReason: any,
            index: number
          ) => ({
            $type:
              "Cmf.Navigo.BusinessObjects.LossBonusAffectedQuantity, Cmf.Navigo.BusinessObjects",

            Reason: {
              $ref:
                String(62 + index)
            },

            ReasonPrimaryQuantity:
              Number(
                recordLossBonusQuantities[
                  recordLossBonusType[index]
                ]
              ) || 0
          })
        );

      const recordLossPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.RecordMaterialLossAndBonusInput, Cmf.Navigo.BusinessOrchestration",

        Material: {
          $type:
            "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",

          Id:
            recordLossBonusData.Id,

          Step: {
            $type:
              "Cmf.Navigo.BusinessObjects.Step, Cmf.Navigo.BusinessObjects",

            RelationCollection: {
              $typeCMF:
                "CMFMap",

              CMFMapData: [
                [
                  "StepReason",
                  selectedStepReasons
                ]
              ]
            }
          }
        },

        LossReasons:
          lossReasons,

        BonusReasons: [],

        IgnoreLastServiceId:
          true
      };

      const response =
        (await POST(
          RECORD_MATERIAL_LOSS_AND_BONUS,
          recordLossPayload
        )) as {
          Message?: string;
        };

      setToast({
        variant: "success",
        message:
          response?.Message ||
          "Material loss recorded successfully."
      });

      const refreshedData =
        await getMaterialBasicInformation(
          recordLossBonusData.Id
        );

      const refreshedMaterialData = {
        ...refreshedData,

        Step: {
          ...refreshedData?.Step,

          RelationCollection:
            recordLossBonusData
              ?.Step
              ?.RelationCollection
        }
      };

      setRecordLossBonusData(
        refreshedMaterialData
      );

      setRecordLossBonusType([]);
      setRecordLossBonusQuantities({});
      setRecordLossBonusTypeError(false);
      setError(null);

    } catch (err: any) {
      console.error(
        "Record Material Loss API Error:",
        err
      );

      setToast({
        variant: "error",
        message:
          err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to record material loss."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsResetting(true);

    setRecordLossBonusType([]);
    setRecordLossBonusQuantities({});
    setLotName("");
    setRecordLossBonusData(null);
    setError(null);
    setToast(null);
    setRecordLossBonusTypeError(false);
    setRecordLossBonusTypeOptions([]);

    setTimeout(() => {
      setIsResetting(false);
    }, 300);
  };

  const lossQuantity =
    recordLossBonusType.reduce(
      (total, reasonId) =>
        total +
        (Number(
          recordLossBonusQuantities[
            reasonId
          ]
        ) || 0),
      0
    );

  const finalQuantity =
    (Number(
      recordLossBonusData?.PrimaryQuantity
    ) || 0) -
    lossQuantity;

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

              if (recordLossBonusData) {
                setRecordLossBonusData(null);
                setRecordLossBonusType([]);
                setRecordLossBonusQuantities({});
                setRecordLossBonusTypeError(
                  false
                );
                setRecordLossBonusTypeOptions(
                  []
                );
              }
            }}
            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !recordLossBonusData &&
                !isLoading
              ) {
                fetchRecordLossBonusDetails(
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
                  !recordLossBonusData &&
                  !isLoading
                ) {
                  fetchRecordLossBonusDetails(
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
          <RecordReasonMultiSelect
            value={
              recordLossBonusType
            }
            options={
              recordLossBonusTypeOptions
            }
            quantities={
              recordLossBonusQuantities
            }
            unit={
              recordLossBonusData?.PrimaryUnits ||
              ""
            }
            onQuantityChange={(
              reasonId,
              quantity
            ) => {
              setRecordLossBonusQuantities(
                (previous) => ({
                  ...previous,
                  [reasonId]:
                    quantity
                })
              );

              setError(null);
              setToast(null);
            }}
            onChange={(
              values
            ) => {
              setRecordLossBonusType(
                values
              );

              setRecordLossBonusQuantities(
                (previous) => {
                  const updated = {
                    ...previous
                  };

                  Object.keys(
                    updated
                  ).forEach(
                    (reasonId) => {
                      if (
                        !values.includes(
                          reasonId
                        )
                      ) {
                        delete updated[
                          reasonId
                        ];
                      }
                    }
                  );

                  return updated;
                }
              );

              if (
                values.length > 0
              ) {
                setRecordLossBonusTypeError(
                  false
                );
              }

              setError(null);
              setToast(null);
            }}
            error={
              recordLossBonusTypeError
            }
            required
            placeholder="Select Loss Reason"
          />
        </Styled.DropdownBox>

        <Styled.FinalQuantity>
          Final Quantity:{" "}
          {finalQuantity}{" "}
          {recordLossBonusData?.PrimaryUnits ||
            ""}
        </Styled.FinalQuantity>

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
              handleSubmit
            }
            disabled={
              !recordLossBonusData ||
              isLoading
            }
          />
        </Styled.ActionButtons>
      </Styled.TopControls>

      {(isLoading ||
        isResetting) && (
        <Loader />
      )}

      <WipDataCardHold
        materialData={
          recordLossBonusData
        }
        title="Materials Details"
        onFlowClick={() =>
          setIsFlowModalOpen(
            true
          )
        }
      />

      {recordLossBonusData && (
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
            recordLossBonusData
          }
        />
      )}
    </Styled.PageContainer>
  );
};

export default RecordLossPage;
