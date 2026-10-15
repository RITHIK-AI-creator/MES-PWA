import React, { useState } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import {
  GET_MATERIAL_BASIC_INFO,
  GET_MATERIAL_HOLD_REASONS,
  RELEASE_MATERIALS,
  EXECUTE_QUERY
} from "../../api";
import { TextField } from "@mui/material";
import Button from "../../Library/Button";
import Loader from "../../Library/Loader";
import Toast from "../../components/Toast";
import WipDataCard from "../../components/WipDataCard";
import HoldReasonMultiSelect, {
  HoldReasonOption
} from "../../components/HoldReasonMultiSelect";
import FlowStepsModal from "../../components/FlowStepsModal";
const ReleasePage = () => {
  const [releaseReason, setReleaseReason] =
    useState<string[]>([]);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [lotName, setLotName] =
    useState("");
const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [releaseData, setReleaseData] =
    useState<any>(null);

  const [releaseReasonError, setReleaseReasonError] =
    useState(false);

  const [releaseReasonOptions, setReleaseReasonOptions] =
    useState<HoldReasonOption[]>([]);
  const [materialHoldReasons, setMaterialHoldReasons] =
    useState<any[]>([]);
  const [toast, setToast] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const fetchReleaseDetails = async (
    nameToFetch: string
  ) => {
    if (!nameToFetch.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setToast(null);

    setReleaseData(null);
    setReleaseReason([]);
    setReleaseReasonError(false);
    setReleaseReasonOptions([]);
    setMaterialHoldReasons([]);

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


      const materialResponse =
        await POST<any>(
          GET_MATERIAL_BASIC_INFO,
          infoPayload
        );


      let data = materialResponse;

      if (materialResponse?.Material) {
        data =
          materialResponse.Material;
      } else if (
        materialResponse?.Data?.Material
      ) {
        data =
          materialResponse.Data.Material;
      } else if (
        materialResponse?.Entities?.[0]
      ) {
        data =
          materialResponse.Entities[0];
      }


      setReleaseData(data);

      const materialName =
        data?.Name ||
        nameToFetch.trim();

      const reasonPayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialsHoldReasonsWithUserInformationInput, Cmf.Navigo.BusinessOrchestration",

        Materials: [
          {
            Id: materialId,
            Name: materialName
          }
        ],

        IgnoreLastServiceId: true
      };


      const reasonResponse =
        await POST<any>(
          GET_MATERIAL_HOLD_REASONS,
          reasonPayload
        );

      const responseMaterial =
        reasonResponse?.Materials?.[0];

      let reasons: any[] = [];

      const relationData =
        responseMaterial
          ?.RelationCollection
          ?.CMFMapData;

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
          reasons =
            holdReasonRelation[1];
        }
      }
      setMaterialHoldReasons(
        reasons
      );

      const reasonOptions: HoldReasonOption[] =
        reasons
          .map(
            (reason: any) => {
              const targetEntity =
                reason?.TargetEntity;

              if (
                !targetEntity?.Id ||
                !targetEntity?.Name
              ) {
                return null;
              }

              return {
                label: String(
                  targetEntity.Name
                ),

                value: String(
                  targetEntity.Id
                )
              };
            }
          )
          .filter(
            Boolean
          ) as HoldReasonOption[];
      setReleaseReasonOptions(
        reasonOptions
      );

      if (
        reasonOptions.length === 0
      ) {
        setToast({
          variant: "error",
          message:
            "No release reasons are available for this material."
        });
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error(
        "Failed to load release details:",
        err
      );
      setReleaseData(null);
      setReleaseReasonOptions([]);
      setMaterialHoldReasons([]);
      setReleaseReason([]);

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load material information.";

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

    if (!releaseData) {
      return;
    }

    if (
      releaseReason.length === 0
    ) {
      setReleaseReasonError(true);
      return;
    }

    setError(null);
    setToast(null);
    setReleaseReasonError(false);
    setIsLoading(true);

    try {
      const selectedMaterialHoldReasons =
        materialHoldReasons.filter(
          (reason: any) =>
            releaseReason.includes(
              String(
                reason?.TargetEntity?.Id
              )
            )
        );

      if (
        selectedMaterialHoldReasons.length ===
        0
      ) {
        throw new Error(
          "The selected release reasons were not found for this material."
        );
      }

      const materialId =
        releaseData?.Id;

      const materialName =
        releaseData?.Name;

      if (!materialId) {
        throw new Error(
          "Material ID is missing from material information."
        );
      }

      if (!materialName) {
        throw new Error(
          "Material Name is missing from material information."
        );
      }

      const materialHoldReasonPayload =
        selectedMaterialHoldReasons.map(
          (reason: any) => ({
            $id:
              reason.$id,

            $type:
              "Cmf.Navigo.BusinessObjects.MaterialHoldReason, Cmf.Navigo.BusinessObjects",

            Id:
              reason.Id
          })
        );

      const releasePayload = {
        $type:
          "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.ReleaseMaterialsInput, Cmf.Navigo.BusinessOrchestration",

        Materials: [
          {
            RelationCollection: {
              $typeCMF: "CMFMap",

              CMFMapData: [
                [
                  "MaterialHoldReason",

                  materialHoldReasonPayload
                ]
              ]
            },

            Id: materialId,

            Name: materialName
          }
        ],

        MaterialHoldReasonCollection: {
          $values:
            selectedMaterialHoldReasons.map(
              (reason: any) => ({
                $ref:
                  reason.$id
              })
            )
        },

        IsSpecial: false,

        IgnoreLastServiceId: true
      };
      const releaseResponse =
        await POST<any>(
          RELEASE_MATERIALS,
          releasePayload
        );

      const responseMessage =
        releaseResponse?.Message ||
        releaseResponse?.message ||
        "";

      setLotName("");
      setReleaseData(null);
      setReleaseReason([]);
      setReleaseReasonError(false);
      setReleaseReasonOptions([]);
      setMaterialHoldReasons([]);
      setError(null);

      setToast({
        variant: "success",

        message:
          responseMessage ||
          "Material(s) was/were released successfully."
      });

    } catch (err: any) {
      console.error(
        "Release API failed:",
        err
      );

      const errorMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to perform release action.";

      setToast({
        variant: "error",
        message: errorMessage
      });

      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
     setIsResetting(true);
    setReleaseReason([]);
    setLotName("");
    setReleaseData(null);
    setError(null);
    setToast(null);
    setReleaseReasonError(false);
    setReleaseReasonOptions([]);
    setMaterialHoldReasons([]);
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

              if (releaseData) {
                setReleaseData(null);

                setReleaseReason([]);

                setReleaseReasonError(
                  false
                );

                setReleaseReasonOptions(
                  []
                );

                setMaterialHoldReasons(
                  []
                );
              }
            }}
            onBlur={() => {
              const materialNumber =
                lotName.trim();

              if (
                materialNumber &&
                !releaseData &&
                !isLoading
              ) {
                fetchReleaseDetails(
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
                  !releaseData &&
                  !isLoading
                ) {
                  fetchReleaseDetails(
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
            value={
              releaseReason
            }
            options={
              releaseReasonOptions
            }
            onChange={(
              values
            ) => {
              setReleaseReason(
                values
              );

              if (
                values.length > 0
              ) {
                setReleaseReasonError(
                  false
                );

                setToast(null);
              }

              setError(null);
            }}
            error={
              releaseReasonError
            }
            required
            placeholder="Select Release Reason"
          />
        </Styled.DropdownBox>

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
              handleSubmit
            }
            disabled={
              !releaseData ||
              isLoading
            }
          />
        </Styled.ActionButtons>

      </Styled.TopControls>

      {(isLoading || isResetting) && <Loader />}

      <WipDataCard
        materialData={
          releaseData
        }
        title="Materials Details" onFlowClick={() => setIsFlowModalOpen(true)}
      />
     {releaseData && (
        <FlowStepsModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          materialData={releaseData}
        />
      )}
    </Styled.PageContainer>
  );
};

export default ReleasePage;