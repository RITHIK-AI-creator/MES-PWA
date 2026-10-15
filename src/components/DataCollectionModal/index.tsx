import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, IconButton } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { LuLogIn } from "react-icons/lu";
import { POST } from "../../Helpers/apiClient";
import { GET_LOOKUP_TABLE_BY_NAME, LOAD_OBJECT_RELATIONS, LOAD_DATA_COLLECTION_PARAMETER_INFORMATION } from "../../api";
import Button from "../../Library/Button";
import Loader from "../../Library/Loader";
import * as Styled from './index.styled';




















interface DataCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataCollection: any;
  onSave?: (values: any[]) => void;
  actionLabel?: string;
  isSubmitting?: boolean;
  allowSkipMandatory?: boolean;
}

const DataCollectionModal: React.FC<DataCollectionModalProps> = ({ 
  isOpen, 
  onClose, 
  dataCollection, 
  onSave, 
  actionLabel, 
  isSubmitting = false,
  allowSkipMandatory
}) => {
  const isTrackIn = actionLabel === "Track In" || !!allowSkipMandatory;
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paramsFromProps = React.useMemo(() => {
    const mapData = dataCollection?.RelationCollection?.CMFMapData || [];
    let params = mapData.find(
      (item: any) => item[0] === "DataCollectionParameter" || item[0] === "DataCollectionParameters"
    )?.[1];
    
    if (!params || params.length === 0) {
      // First try to parse XML if provided
      if (dataCollection?.DataCollectionPointsAsXml) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(dataCollection.DataCollectionPointsAsXml, "text/xml");
          const pointsArray = [];
          
          const parameters = xmlDoc.getElementsByTagName("Parameter");
          for (let i = 0; i < parameters.length; i++) {
            const paramNode = parameters[i];
            const paramId = paramNode.getAttribute("Id");
            const paramName = paramNode.getAttribute("Name");
            
            const points = paramNode.getElementsByTagName("DataCollectionPoint");
            for (let j = 0; j < points.length; j++) {
              const ptNode = points[j];
              const ptId = ptNode.getAttribute("Id");
              const dataTypeStr = ptNode.getAttribute("DataType");
              let dataType = 0; // Default numeric (0)
              if (dataTypeStr === "String") dataType = 1;
              
              const sampleId = ptNode.getElementsByTagName("SampleId")[0]?.textContent || "Sample 1";
              const readingNumStr = ptNode.getElementsByTagName("ReadingNumber")[0]?.textContent;
              const readingNum = readingNumStr ? parseInt(readingNumStr, 10) : 1;
              const readingVal = ptNode.getElementsByTagName("ReadingValue")[0]?.textContent;
              
              pointsArray.push({
                $type: "DataCollectionPoint",
                Id: ptId,
                SampleId: sampleId,
                ReadingNumber: readingNum,
                Value: readingVal || undefined,
                TargetEntity: {
                  $type: "Cmf.Navigo.BusinessObjects.Parameter, Cmf.Navigo.BusinessObjects",
                  Name: paramName,
                  Id: paramId,
                  DataType: dataType
                }
              });
            }
          }
          if (pointsArray.length > 0) return pointsArray;
        } catch (e) {
          console.error("Failed to parse DataCollectionPointsAsXml", e);
        }
      }

      // Fallback: extract from DataCollectionPoint map
      const points = mapData.find((item: any) => item[0] === "DataCollectionPoint" || item[0] === "DataCollectionPoints")?.[1];
      if (points && points.length > 0) {
        // We will process these directly in inputList builder
        return points;
      }
    }
    return params || [];
  }, [dataCollection]);

  const [fetchedParamsList, setFetchedParamsList] = useState<any[]>([]);
  const [isLoadingParams, setIsLoadingParams] = useState<boolean>(false);

  const paramsList = paramsFromProps.length > 0 ? paramsFromProps : fetchedParamsList;

  useEffect(() => {
    console.log("DataCollectionModal DEBUG 1:", { isOpen, dataCollection, paramsLen: paramsFromProps.length });
    if (isOpen && dataCollection && paramsFromProps.length === 0) {
      // Determine definition and instance correctly
      const dcDefinition = dataCollection.DataCollection || dataCollection;
      let dcInstance = dataCollection.DataCollection ? dataCollection : null;
      if (!dcInstance && (window as any)._currentMaterialData?.CurrentDataCollectionInstance) {
         dcInstance = (window as any)._currentMaterialData.CurrentDataCollectionInstance;
      }

      console.log("DataCollectionModal DEBUG 2:", { dcDefinition, dcInstance, id: dcDefinition?.Id });
      if (dcDefinition && dcDefinition.Id) {
        setIsLoadingParams(true);
        const payload: any = {
          $type: "Cmf.Navigo.BusinessOrchestration.EdcManagement.DataCollectionManagement.InputObjects.LoadDataCollectionParameterInformationInput, Cmf.Navigo.BusinessOrchestration",
          DataCollection: dcDefinition,
          LoadReadingNames: true,
          LoadSampleNames: true,
          LevelsToLoad: 1
        };

        if (dcInstance) {
          payload.DataCollectionInstance = dcInstance;
        }

        // Bulletproof fix to prevent duplicate $id serialization for DataCollection
        if (payload.DataCollectionInstance && payload.DataCollection) {
          if (payload.DataCollectionInstance.DataCollection && payload.DataCollectionInstance.DataCollection.Id === payload.DataCollection.Id) {
             const refId = payload.DataCollection.$id || "999";
             payload.DataCollection.$id = refId;
             payload.DataCollectionInstance = { 
               ...payload.DataCollectionInstance, 
               DataCollection: { $ref: refId } 
             };
          }
        }
        console.log("DEBUG: Final payload being sent:", JSON.stringify(payload, null, 2));
        
        const resolveRefs = (obj: any) => {
          if (!obj || typeof obj !== 'object') return obj;
          const refMap = new Map();
          const findIds = (node: any) => {
            if (!node || typeof node !== 'object') return;
            if (node.$id) refMap.set(node.$id, node);
            if (Array.isArray(node)) node.forEach(findIds);
            else Object.values(node).forEach(findIds);
          };
          const replaceRefs = (node: any, visited = new Set()) => {
            if (!node || typeof node !== 'object' || visited.has(node)) return node;
            visited.add(node);
            if (Array.isArray(node)) {
              for (let i = 0; i < node.length; i++) {
                if (node[i] && typeof node[i] === 'object') {
                  if (node[i].$ref && refMap.has(node[i].$ref)) node[i] = refMap.get(node[i].$ref);
                  else replaceRefs(node[i], visited);
                }
              }
            } else {
              for (const key of Object.keys(node)) {
                const val = node[key];
                if (val && typeof val === 'object') {
                  if (val.$ref && refMap.has(val.$ref)) node[key] = refMap.get(val.$ref);
                  else replaceRefs(val, visited);
                }
              }
            }
            return node;
          };
          findIds(obj);
          return replaceRefs(obj);
        };

        POST<any>(LOAD_DATA_COLLECTION_PARAMETER_INFORMATION, payload).then((rawRes) => {
          const res = resolveRefs(rawRes);
          console.log("LOAD_DATA_COLLECTION_PARAMETER_INFORMATION response:", res);
          // Standard CMF typically populates the deeply nested DataCollection's RelationCollection in the response
          const fetchedRelations = res?.DataCollection?.RelationCollection?.CMFMapData?.find(
            (item: any) => item[0] === "DataCollectionParameter" || item[0] === "DataCollectionParameters"
          )?.[1];
          
          if (fetchedRelations) {
            setFetchedParamsList(fetchedRelations);
          } else if (res?.DataCollectionParameters) {
            // Alternative payload fallback
            setFetchedParamsList(res.DataCollectionParameters);
          }
        }).catch(err => console.error("Failed to fetch DC parameter info", err))
        .finally(() => setIsLoadingParams(false));
      }
    }
  }, [isOpen, dataCollection, paramsFromProps]);

  const inputList = React.useMemo(() => {
    const list: any[] = [];
    paramsList.forEach((param: any) => {
      if (!param.TargetEntity) return;

      if (param.$type && (param.$type.includes('DataCollectionPoint') || param.$type === 'DataCollectionPoint')) {
        // It's a point, yield a single input
        const sName = param.SampleId ;
        const r = param.ReadingNumber || 1;
        const s = param.SampleNumber || parseInt(sName.replace(/[^0-9]/g, '')) || 1;
        list.push({
          param,
          sampleId: sName,
          sampleNumber: s,
          readingNumber: r,
          key: `${param.TargetEntity.Name}_S${s}_R${r}`,
          label: `${param.TargetEntity.Name} (${sName}) (${r})`,
          defaultValue: param.Value
        });
        return;
      }

      const maxSamples = Math.max(1, param.MaximumSamples || param.MinimumSamples || 1);
      const maxReadings = Math.max(1, param.MaximumSampleReadings || param.MinimumSampleReadings || 1);
      
      const sampleNames = param.SampleNames || [];
      const readingNames = param.ReadingNames || [];

      for (let s = 1; s <= maxSamples; s++) {
        const sName = sampleNames.length >= s ? sampleNames[s - 1] : `Sample ${s}`;
        for (let r = 1; r <= maxReadings; r++) {
          const rName = readingNames.length >= r ? readingNames[r - 1] : `Reading ${r}`;
          
          list.push({
            param,
            sampleId: sName,
            sampleNumber: s,
            readingNumber: r,
            key: `${param.TargetEntity.Name}_S${s}_R${r}`,
            label: `${param.TargetEntity.Name}${maxSamples > 1 ? ` (${sName})` : ''}${maxReadings > 1 ? ` (${rName})` : ''}`
          });
        }
      }
    });
    return list;
  }, [paramsList]);

  const [isFetchingData, setIsFetchingData] = useState(false);

  const fetchDefaultValues = async () => {
    setIsFetchingData(true);
    setValues({});
    setErrors({});
    
    const initialValues: Record<string, string> = {};
    
    inputList.forEach(input => {
      if (input.defaultValue !== undefined && input.defaultValue !== null) {
        initialValues[input.key] = String(input.defaultValue);
      }
    });

    const xmlStr = dataCollection?.DataCollectionPointsAsXml || (window as any)._currentMaterialData?.DataCollectionPointsAsXml;
    if (xmlStr) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlStr, "text/xml");
        const parameters = xmlDoc.getElementsByTagName("Parameter");
        for (let i = 0; i < parameters.length; i++) {
          const paramName = parameters[i].getAttribute("Name");
          const points = parameters[i].getElementsByTagName("DataCollectionPoint");
          for (let j = 0; j < points.length; j++) {
            const ptNode = points[j];
            const sampleId = ptNode.getElementsByTagName("SampleId")[0]?.textContent || "Sample 1";
            const readingNumStr = ptNode.getElementsByTagName("ReadingNumber")[0]?.textContent;
            const readingNum = readingNumStr ? parseInt(readingNumStr, 10) : 1;
            const s = parseInt(sampleId.replace(/[^0-9]/g, '')) || 1;
            const readingVal = ptNode.getElementsByTagName("ReadingValue")[0]?.textContent;
            if (paramName && readingVal) {
              const key = `${paramName}_S${s}_R${readingNum}`;
              initialValues[key] = readingVal;
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse XML for initial values", e);
      }
    }
    
    const promises = paramsList.map(async (p: any) => {
      const tableName = p.TargetEntity?.DataTextValidation;
      const paramName = p.TargetEntity?.Name;

      if (tableName && paramName) {
        try {
          const payload = {
            "$type": "Cmf.Foundation.BusinessOrchestration.TableManagement.InputObjects.GetLookupTableByNameInput, Cmf.Foundation.BusinessOrchestration",
            "Name": tableName
          };
          const response: any = await POST(GET_LOOKUP_TABLE_BY_NAME, payload);
          const lookupValues = response?.LookupTable?.Values || [];

          if (lookupValues.length > 0) {
            inputList.forEach(input => {
              if (input.param.TargetEntity.Name === paramName) {
                initialValues[input.key] = lookupValues[0].Value;
              }
            });
          }
        } catch (error) {
          console.error(`Failed to fetch lookup table ${tableName} for parameter ${paramName}`, error);
        }
      }
    });

    await Promise.all(promises);

    if (Object.keys(initialValues).length > 0) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
    setIsFetchingData(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchDefaultValues();
    }
  }, [isOpen, paramsList, inputList]);

  if (!isOpen || !dataCollection) return null;

  const handleValueChange = (
    name: string, 
    val: string, 
    isNumeric: boolean,
    minVal?: number | null,
    maxVal?: number | null,
    unit?: string
  ) => {
    setValues(prev => ({ ...prev, [name]: val }));
    
    if (val !== "") {
      if (isNumeric && isNaN(Number(val))) {
        setErrors(prev => ({ ...prev, [name]: 'Must be a number' }));
        return;
      }
      if (isNumeric) {
        const num = Number(val);
        const u = unit ? ` ${unit}` : '';
        const hasMin = minVal !== undefined && minVal !== null;
        const hasMax = maxVal !== undefined && maxVal !== null;
        if (hasMin && hasMax && (num < minVal || num > maxVal)) {
          setErrors(prev => ({ ...prev, [name]: `Must be between ${minVal} and ${maxVal}${u}` }));
          return;
        } else if (hasMin && num < minVal) {
          setErrors(prev => ({ ...prev, [name]: `Minimum value is ${minVal}${u}` }));
          return;
        } else if (hasMax && num > maxVal) {
          setErrors(prev => ({ ...prev, [name]: `Maximum value is ${maxVal}${u}` }));
          return;
        }
      }
    }
    
    setErrors(prev => {
      const newErrs = { ...prev };
      delete newErrs[name];
      return newErrs;
    });
  };

  const handleReset = () => {
    fetchDefaultValues();
  };

  const handleSave = () => {
    if (isSubmitting) return;

    // Validate mandatory fields & min/max constraints
    const newErrors: Record<string, string> = {};
    let hasValidationError = false;

    inputList.forEach((input: any) => {
      const val = values[input.key];
      const targetEntity = input.param.TargetEntity;
      const minVal = input.param?.DataNumValidationMin ?? targetEntity?.DataNumValidationMin;
      const maxVal = input.param?.DataNumValidationMax ?? targetEntity?.DataNumValidationMax;
      const unit = input.param?.DataUnit ?? targetEntity?.DataUnit;
      const hasMin = minVal !== undefined && minVal !== null;
      const hasMax = maxVal !== undefined && maxVal !== null;
      const dataType = targetEntity?.DataType;
      const isNumeric = dataType === 0 || dataType === 2 || dataType === 3 || dataType === 4 || hasMin || hasMax;

      const isMandatory = !isTrackIn &&
                          input.param.IsOptional === false && 
                          input.sampleNumber <= (input.param.MinimumSamples ?? 1) && 
                          input.readingNumber <= (input.param.MinimumSampleReadings ?? 1);
      if (isMandatory && (val === undefined || val === "")) {
        newErrors[input.key] = `${input.param.TargetEntity?.Name || 'This field'} is mandatory`;
        hasValidationError = true;
      } else if (val !== undefined && val !== "") {
        if (isNumeric && isNaN(Number(val))) {
          newErrors[input.key] = 'Must be a number';
          hasValidationError = true;
        } else if (isNumeric) {
          const num = Number(val);
          const u = unit ? ` ${unit}` : '';
          if (hasMin && hasMax && (num < minVal || num > maxVal)) {
            newErrors[input.key] = `Must be between ${minVal} and ${maxVal}${u}`;
            hasValidationError = true;
          } else if (hasMin && num < minVal) {
            newErrors[input.key] = `Minimum value is ${minVal}${u}`;
            hasValidationError = true;
          } else if (hasMax && num > maxVal) {
            newErrors[input.key] = `Maximum value is ${maxVal}${u}`;
            hasValidationError = true;
          }
        }
      }
    });

    if (hasValidationError) {
      setErrors(newErrors);
      return;
    }

    if (Object.keys(newErrors).length > 0) return;
    
    const stripIds = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(stripIds);
      } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          if (key !== '$id') {
            newObj[key] = stripIds(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    };

    // Construct data points array (only include those with values to avoid backend null errors)
    const dataPoints = inputList
      .filter((input: any) => {
        const val = values[input.key];
        return val !== undefined && val !== "";
      })
      .map((input: any) => {
        const val = values[input.key];
        return {
          "$type": "Cmf.Navigo.BusinessObjects.DataCollectionPoint, Cmf.Navigo.BusinessObjects",
          "ReadingNumber": input.readingNumber,
          "SampleId": input.sampleId,
          "InitialSampleId": input.sampleId,
          "TargetEntity": stripIds(input.param.TargetEntity),
          "Value": val
        };
      });

    if (onSave) {
      onSave(dataPoints);
    }
    
    onClose();
  };

  return (
    <Styled.Overlay $isOpen={isOpen}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        {(isFetchingData || isSubmitting || isLoadingParams) && <Loader />}
        <Styled.Header>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1 }}>Data Collection</span>
          <IconButton onClick={onClose} size="small" disabled={isSubmitting} style={{ color: 'white', padding: 4 }}>
            <FaTimes fontSize="1rem" />
          </IconButton>
        </Styled.Header>
        <Styled.Content>
          {inputList.length === 0 ? (
            <Typography variant="body2" color="textSecondary">No data points available.</Typography>
          ) : (
            <div>
              {inputList.map((input: any, idx: number) => {
                const targetEntity = input.param.TargetEntity;
                const minVal = input.param?.DataNumValidationMin ?? targetEntity?.DataNumValidationMin;
                const maxVal = input.param?.DataNumValidationMax ?? targetEntity?.DataNumValidationMax;
                const unit = input.param?.DataUnit ?? targetEntity?.DataUnit;
                const hasMin = minVal !== undefined && minVal !== null;
                const hasMax = maxVal !== undefined && maxVal !== null;
                const dataType = targetEntity?.DataType;
                const isNumeric = dataType === 0 || dataType === 2 || dataType === 3 || dataType === 4 || hasMin || hasMax;

                let rangeText = "";
                if (hasMin && hasMax) {
                  rangeText = `Min: ${minVal} | Max: ${maxVal}${unit ? ` ${unit}` : ''}`;
                } else if (hasMin) {
                  rangeText = `Min: ${minVal}${unit ? ` ${unit}` : ''}`;
                } else if (hasMax) {
                  rangeText = `Max: ${maxVal}${unit ? ` ${unit}` : ''}`;
                } else if (unit) {
                  rangeText = `Unit: ${unit}`;
                }

                const placeholderText = (hasMin && hasMax)
                  ? `${minVal} - ${maxVal}${unit ? ` ${unit}` : ''}`
                  : (hasMin ? `>= ${minVal}` : (hasMax ? `<= ${maxVal}` : (unit || undefined)));

                return (
                  <Styled.Row key={input.key} style={{ alignItems: 'flex-start', marginBottom: errors[input.key] ? '14px' : '10px' }}>
                    <Styled.Label style={{ marginTop: '7px' }}>
                      {!isTrackIn &&
                       input.param.IsOptional === false && 
                       input.sampleNumber <= (input.param.MinimumSamples ?? 1) && 
                       input.readingNumber <= (input.param.MinimumSampleReadings ?? 1) && (
                        <span style={{ color: '#d32f2f', marginRight: '4px' }}>*</span>
                      )}
                      {input.label}
                      {rangeText && (
                        <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '2px', lineHeight: 1.2 }}>
                          {rangeText}
                        </div>
                      )}
                    </Styled.Label>
                    <Styled.InputWrapper style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Styled.CompactTextField
                        type="text"
                        variant="outlined"
                        size="small"
                        placeholder={placeholderText}
                        error={!!errors[input.key]}
                        style={{ width: '180px', backgroundColor: '#fff' }}
                        value={values[input.key] || ""}
                        onChange={(e) => handleValueChange(input.key, e.target.value, isNumeric, minVal, maxVal, unit)}
                      />
                      {errors[input.key] && (
                        <div style={{ width: '180px', fontSize: '0.75rem', color: '#d32f2f', textAlign: 'left', marginTop: '4px', lineHeight: 1.25, wordBreak: 'break-word' }}>
                          {errors[input.key]}
                        </div>
                      )}
                    </Styled.InputWrapper>
                  </Styled.Row>
                );
              })}
            </div>
          )}
        </Styled.Content>
        <Styled.Footer style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
          <Button type="reset" onClick={handleReset} disabled={isSubmitting} />
          <Button
            type="normal"
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0 || isSubmitting || isFetchingData}
            Icon={LuLogIn}
            label={actionLabel || "Save"}
          />
        </Styled.Footer>
      </Styled.ModalContainer>
    </Styled.Overlay>
  );
};

export default DataCollectionModal;
