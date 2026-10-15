import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { FaTimes, FaRegPlayCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { POST } from "../../Helpers/apiClient";
import { GET_MATERIAL_BOM_MATERIALS, ASSEMBLE_MATERIAL } from "../../api";
import Loader from "../../Library/Loader";
import CustomButton from "../../Library/Button";
import DropDown from "../../Library/DropDown";
import * as Styled from './index.styled';




















interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialData: any;
  onSuccess?: (msg?: string) => void;
  trackInWizardData?: any;
  actionLabel?: string;
  onSave?: () => void;
}

const BOMModal: React.FC<BOMModalProps> = ({ isOpen, onClose, materialData, onSuccess, trackInWizardData, actionLabel, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [bomMaterials, setBomMaterials] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [qtyToAssemble, setQtyToAssemble] = useState<string>("");
  const [sourceMaterials, setSourceMaterials] = useState<any[]>([]);
  const [selectedSourceMaterial, setSelectedSourceMaterial] = useState<any>(null);
  const [localMaterialData, setLocalMaterialData] = useState<any>(null);

  const [isBomProductsOpen, setIsBomProductsOpen] = useState(true);
  const [isMaterialDetailsOpen, setIsMaterialDetailsOpen] = useState(true);

  useEffect(() => {
    if (isOpen && materialData) {
      setLocalMaterialData(materialData);
      fetchBOMMaterials(materialData);
    } else {
      setBomMaterials([]);
      setSourceMaterials([]);
      setSelectedSourceMaterial(null);
      setQtyToAssemble("");
      setError(null);
      setLocalMaterialData(null);
      setIsBomProductsOpen(true);
      setIsMaterialDetailsOpen(true);
    }
  }, [isOpen, materialData]);

  const fetchBOMMaterials = async (currentMaterialData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const isTrackInAssembly = currentMaterialData?.CurrentBOMAssemblyType === 3;
      if (isTrackInAssembly && trackInWizardData) {
        let finalBomMaterials = [];
        const relationsMap = trackInWizardData.Bom?.RelationCollection;
        if (relationsMap?.CMFMapData) {
           const mapData = Array.isArray(relationsMap.CMFMapData) ? relationsMap.CMFMapData : relationsMap.CMFMapData.$values || [];
           const bomProductEntry = mapData.find((entry: any) => {
               const key = Array.isArray(entry) ? entry[0] : entry?.Key;
               return key === "BOMProduct";
           });
           
           if (bomProductEntry) {
               const val = Array.isArray(bomProductEntry) ? bomProductEntry[1] : bomProductEntry?.Value;
               finalBomMaterials = Array.isArray(val) ? val : (val?.$values || [val]);
           }
        }
        setBomMaterials(finalBomMaterials || []);

        let srcMaterials: any[] = [];
        const trackInMat = trackInWizardData.Materials?.[0];
        if (trackInMat?.RelationCollection?.CMFMapData) {
          const mapData = Array.isArray(trackInMat.RelationCollection.CMFMapData) ? trackInMat.RelationCollection.CMFMapData : trackInMat.RelationCollection.CMFMapData.$values || [];
          const matResEntry = mapData.find((entry: any) => {
              const key = Array.isArray(entry) ? entry[0] : entry?.Key;
              return key === "MaterialResource";
          });
          if (matResEntry) {
              const val = Array.isArray(matResEntry) ? matResEntry[1] : matResEntry?.Value;
              const matResources = Array.isArray(val) ? val : (val?.$values || [val]);
              matResources.forEach((mr: any) => {
                  if (mr.SourceEntity) {
                      srcMaterials.push(mr.SourceEntity);
                  }
              });
          }
        }
        
        setSourceMaterials(srcMaterials);
        if (srcMaterials.length === 1) {
           setSelectedSourceMaterial(srcMaterials[0]);
        }
        setIsLoading(false);
        return;
      }

      const bomData = currentMaterialData?.CurrentBOMVersion || currentMaterialData?.Product?.CurrentBOM || currentMaterialData?.CurrentBOM;
      
      const payload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.GetMaterialBomMaterialsForAssembleInput, Cmf.Navigo.BusinessOrchestration",
        Material: {
          $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
          Id: currentMaterialData.Id,
          Name: currentMaterialData.Name,
          UniversalState: currentMaterialData.UniversalState,
        },
        LevelsToLoad: 1,
        IsLoadRelationsToContainer: false,
        IsLoadRelationsToResource: false,
        IsLoadTopMost: true,
        TopMostLevelsToLoad: 2,
        Bom: bomData ? {
          $type: "Cmf.Navigo.BusinessObjects.BOM, Cmf.Navigo.BusinessObjects",
          Id: bomData.Id,
          Name: bomData.Name,
          Version: bomData.Version,
          Revision: bomData.Revision,
          UniversalState: bomData.UniversalState
        } : null,
        RelationNames: ["BOMProduct"],
        RelationsLevelsToLoad: 1,
        IgnoreLastServiceId: true
      };

      const response = await POST<any>(GET_MATERIAL_BOM_MATERIALS, payload);
      let finalBomMaterials = [];
      const items = response?.BOMMaterials || response?.Materials;
      if (items) {
        finalBomMaterials = Array.isArray(items) ? items : items?.$values || [];
      }
      
      if (response?.Material) {
        setLocalMaterialData(response.Material);
      }

      // Attempt to extract BOMProduct from CMFMapData if needed
      if (finalBomMaterials.length === 0) {
        const relationsMap = response?.Bom?.RelationCollection || response?.Material?.CurrentBOMVersion?.RelationCollection || response?.Material?.Bom?.RelationCollection || currentMaterialData?.RelationCollection;
        if (relationsMap?.CMFMapData) {
           const mapData = Array.isArray(relationsMap.CMFMapData) ? relationsMap.CMFMapData : relationsMap.CMFMapData.$values || [];
           const bomProductEntry = mapData.find((entry: any) => {
               const key = Array.isArray(entry) ? entry[0] : entry?.Key;
               return key === "BOMProduct";
           });
           
           if (bomProductEntry) {
               const val = Array.isArray(bomProductEntry) ? bomProductEntry[1] : bomProductEntry?.Value;
               finalBomMaterials = Array.isArray(val) ? val : (val?.$values || [val]);
           }
        }
      }
      
      console.log("Extracted BOM Materials:", finalBomMaterials);
      setBomMaterials(finalBomMaterials || []);

      // Extract SourceMaterials
      let srcMaterials = [];
      if (response?.SourceMaterials?.T_Result) {
         srcMaterials = response.SourceMaterials.T_Result;
      } else if (response?.Material?.SourceMaterials?.T_Result) {
         srcMaterials = response.Material.SourceMaterials.T_Result;
      } else if (currentMaterialData?.SourceMaterials?.T_Result) {
         srcMaterials = currentMaterialData.SourceMaterials.T_Result;
      }
      setSourceMaterials(srcMaterials);
      if (srcMaterials.length === 1) {
         setSelectedSourceMaterial(srcMaterials[0]);
      }

    } catch (err: any) {
      console.error("Failed to fetch BOM materials:", err);
      setError(err.message || "An error occurred while loading BOM materials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssemble = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const inputQty = parseFloat(qtyToAssemble) || 0;
      const primaryQty = (localMaterialData?.PrimaryQuantity || 0) - (localMaterialData?.AssembledQuantity || 0);
      const isQtyInvalid = inputQty > primaryQty && localMaterialData?.CurrentBOMAssemblyType !== 2;
      const validQtyForCalc = isQtyInvalid ? 0 : inputQty;

      const sProductName = selectedSourceMaterial.ProductName || selectedSourceMaterial.Product?.Name || "";
      const sProductId = selectedSourceMaterial.ProductId || selectedSourceMaterial.Product?.Id || "";
      const sMaterialId = selectedSourceMaterial.MaterialId || selectedSourceMaterial.Id || "";
      const sMaterialName = selectedSourceMaterial.MaterialName || selectedSourceMaterial.Name || "";
      const sStepId = selectedSourceMaterial.StepId || selectedSourceMaterial.Step?.Id || "";
      const sStepName = selectedSourceMaterial.StepName || selectedSourceMaterial.Step?.Name || "";

      const matchingBom = selectedSourceMaterial ? bomMaterials.find((m: any) => {
        const pName = m.TargetEntity?.Name || m.TargetEntity?.ProductName || m.Product?.Name || m.Name;
        return pName === sProductName;
      }) : null;
      const baseBom = matchingBom || bomMaterials[0] || null;
      const bomQty = baseBom ? (baseBom.Quantity || baseBom.RequiredQuantity || 0) : 0;

      const consumedQty = validQtyForCalc * bomQty;

      const payload = {
        $type: "Cmf.Navigo.BusinessOrchestration.MaterialManagement.InputObjects.AssembleMaterialInput, Cmf.Navigo.BusinessOrchestration",
        IgnoreLastServiceId: true,
        Material: localMaterialData,
        AssembleQuantity: validQtyForCalc,
        SourceMaterials: selectedSourceMaterial ? [
          {
            $type: "Cmf.Navigo.BusinessObjects.AssembleMaterial, Cmf.Navigo.BusinessObjects",
            BOMProduct: baseBom ? {
              ...baseBom
            } : null,
            SourceProduct: (baseBom?.TargetEntity?.$id) ? {
              $ref: baseBom.TargetEntity.$id
            } : {
              $type: "Cmf.Navigo.BusinessObjects.Product, Cmf.Navigo.BusinessObjects",
              Id: sProductId,
              Name: sProductName
            },
            Quantity: consumedQty,
            LossQuantity: 0,
            LossReason: null,
            Comment: null,
            Material: {
              $type: "Cmf.Navigo.BusinessObjects.Material, Cmf.Navigo.BusinessObjects",
              Id: sMaterialId,
              Name: sMaterialName,
              PrimaryQuantity: selectedSourceMaterial.PrimaryQuantity || 0,
              PrimaryUnits: selectedSourceMaterial.PrimaryUnits || "",
              Product: {
                $type: "Cmf.Navigo.BusinessObjects.Product, Cmf.Navigo.BusinessObjects",
                Id: sProductId || (baseBom?.TargetEntity?.Id) || "",
                Name: sProductName || (baseBom?.TargetEntity?.Name) || ""
              },
              Step: {
                $type: "Cmf.Navigo.BusinessObjects.Step, Cmf.Navigo.BusinessObjects",
                Id: sStepId,
                Name: sStepName
              }
            }
          }
        ] : []
      };

      const response = await POST<any>(ASSEMBLE_MATERIAL, payload);
      if (onSuccess) {
        onSuccess(response?.Message || response?.data?.Message || "Material was assembled successfully.");
      }
      setQtyToAssemble("");
      onClose(); // close on success
    } catch (err: any) {
      console.error("Assemble failed:", err);
      const apiError = err?.response?.data?.Exception?.Message || err?.response?.data?.Message || err?.response?.data?.message || err?.message;
      setError(apiError || "Failed to assemble material");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Styled.Overlay $isOpen={isOpen}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.Header>
          <div>
            BOM
          </div>
          <IconButton onClick={onClose} size="small" style={{ color: "white" }}>
            <FaTimes />
          </IconButton>
        </Styled.Header>
        
        <Styled.Content style={{ position: 'relative' }}>
          {isLoading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 10 }}>
              <Loader />
            </div>
          )}
          {error ? (
            <div style={{ color: "red", padding: "16px" }}>{error}</div>
          ) : localMaterialData?.CurrentBOMAssemblyType === 3 ? (
            <div style={{ paddingBottom: '20px' }}>
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                 {localMaterialData?.CurrentBOMVersion?.Name || localMaterialData?.CurrentBOM?.Name || bomMaterials[0]?.BOM?.Name || 'BOM'} 
                 {localMaterialData?.CurrentBOMVersion?.Revision ? ` [${localMaterialData.CurrentBOMVersion.Revision}]` : ''} 
                 {' '}AutomaticAtTrackIn
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff', textAlign: 'left', overflow: 'hidden' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', width: '35%' }}>Material</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{selectedSourceMaterial?.Name || selectedSourceMaterial?.MaterialName || '--'}</td>
                  </tr>
                  {(() => {
                    let currentQuantity = 0;
                    const targetProductName = bomMaterials[0]?.TargetEntity?.Name || bomMaterials[0]?.TargetEntity?.ProductName || bomMaterials[0]?.Product?.Name || bomMaterials[0]?.Name;
                    
                    const trackInMat = trackInWizardData?.Materials?.[0];
                    if (trackInMat && trackInMat.RelationCollection?.CMFMapData) {
                      const mapData = Array.isArray(trackInMat.RelationCollection.CMFMapData) ? trackInMat.RelationCollection.CMFMapData : trackInMat.RelationCollection.CMFMapData.$values || [];
                      const matResEntry = mapData.find((entry: any) => {
                          const key = Array.isArray(entry) ? entry[0] : entry?.Key;
                          return key === "MaterialResource";
                      });
                      if (matResEntry) {
                          const val = Array.isArray(matResEntry) ? matResEntry[1] : matResEntry?.Value;
                          const matResources = Array.isArray(val) ? val : (val?.$values || [val]);
                          
                          matResources.forEach((mr: any) => {
                              const parentResource = mr.TargetEntity || mr.SourceEntity;
                              if (parentResource && parentResource.RelationCollection?.CMFMapData) {
                                  const parentMapData = Array.isArray(parentResource.RelationCollection.CMFMapData) ? parentResource.RelationCollection.CMFMapData : parentResource.RelationCollection.CMFMapData.$values || [];
                                  const subResEntry = parentMapData.find((entry: any) => {
                                      const key = Array.isArray(entry) ? entry[0] : entry?.Key;
                                      return key === "SubResource";
                                  });
                                  
                                  if (subResEntry) {
                                      const srVal = Array.isArray(subResEntry) ? subResEntry[1] : subResEntry?.Value;
                                      const subResources = Array.isArray(srVal) ? srVal : (srVal?.$values || [srVal]);
                                      
                                      subResources.forEach((srRel: any) => {
                                          const subResource = srRel.TargetEntity || srRel.SourceEntity;
                                          if (subResource && subResource.RelationCollection?.CMFMapData) {
                                              const subMapData = Array.isArray(subResource.RelationCollection.CMFMapData) ? subResource.RelationCollection.CMFMapData : subResource.RelationCollection.CMFMapData.$values || [];
                                              const consMatEntry = subMapData.find((entry: any) => {
                                                  const key = Array.isArray(entry) ? entry[0] : entry?.Key;
                                                  return key === "MaterialResource";
                                              });
                                              
                                              if (consMatEntry) {
                                                  const cmVal = Array.isArray(consMatEntry) ? consMatEntry[1] : consMatEntry?.Value;
                                                  const consMatResources = Array.isArray(cmVal) ? cmVal : (cmVal?.$values || [cmVal]);
                                                  
                                                  consMatResources.forEach((cmr: any) => {
                                                      const consumableMat = cmr.SourceEntity || cmr.TargetEntity;
                                                      if (consumableMat) {
                                                          const pName = consumableMat.ProductName || consumableMat.Product?.Name;
                                                          if (pName === targetProductName) {
                                                              currentQuantity += (consumableMat.PrimaryQuantity || 0);
                                                          }
                                                      }
                                                  });
                                              }
                                          }
                                      });
                                  }
                              }
                          });
                      }
                    }

                    if (currentQuantity === 0 && trackInWizardData?.Resources) {
                      const resources = Array.isArray(trackInWizardData.Resources) ? trackInWizardData.Resources : trackInWizardData.Resources.$values || [];
                      resources.forEach((res: any) => {
                        const subResRel = res.RelationCollection?.CMFMapData?.find((entry: any) => {
                          const key = Array.isArray(entry) ? entry[0] : entry?.Key;
                          return key === "SubResource";
                        });
                        
                        if (subResRel) {
                          const val = Array.isArray(subResRel) ? subResRel[1] : subResRel?.Value;
                          const subResources = Array.isArray(val) ? val : (val?.$values || [val]);
                          
                          subResources.forEach((subRel: any) => {
                            const subRes = subRel.TargetEntity || subRel.SourceEntity;
                            if (subRes) {
                              const matResRel = subRes.RelationCollection?.CMFMapData?.find((entry: any) => {
                                const key = Array.isArray(entry) ? entry[0] : entry?.Key;
                                return key === "MaterialResource";
                              });
                              if (matResRel) {
                                 const mVal = Array.isArray(matResRel) ? matResRel[1] : matResRel?.Value;
                                 const matResources = Array.isArray(mVal) ? mVal : (mVal?.$values || [mVal]);
                                 matResources.forEach((mr: any) => {
                                   const consumableMat = mr.SourceEntity || mr.TargetEntity;
                                   if (consumableMat) {
                                       const pName = consumableMat.ProductName || consumableMat.Product?.Name;
                                       if (pName === targetProductName) {
                                         currentQuantity += (consumableMat.PrimaryQuantity || 0);
                                       }
                                   }
                                 });
                              }
                            }
                          });
                        }
                      });
                    }

                    if (currentQuantity === 0 && sourceMaterials && sourceMaterials.length > 0) {
                      sourceMaterials.forEach((consumableMat: any) => {
                        const productName = consumableMat?.ProductName || consumableMat?.Product?.Name;
                        if (productName === targetProductName) {
                          currentQuantity += (consumableMat.PrimaryQuantity || 0);
                        }
                      });
                    }

                    const reqQuantity = (localMaterialData?.PrimaryQuantity || 0) * (bomMaterials[0]?.Quantity || bomMaterials[0]?.RequiredQuantity || 0);
                    const delta = reqQuantity - currentQuantity;

                    return (
                      <>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', width: '35%' }}>Current Quantity</td>
                          <td style={{ padding: '12px 16px', color: '#1e293b' }}>{currentQuantity.toLocaleString()} {selectedSourceMaterial?.PrimaryUnits || ''}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', width: '35%' }}>Required Quantity</td>
                          <td style={{ padding: '12px 16px', color: '#1e293b' }}>{reqQuantity.toLocaleString()} {selectedSourceMaterial?.PrimaryUnits || ''}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', width: '35%' }}>Delta</td>
                          <td style={{ padding: '12px 16px', color: '#1e293b' }}>{delta.toLocaleString()} {selectedSourceMaterial?.PrimaryUnits || ''}</td>
                        </tr>
                      </>
                    );
                  })()}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', width: '35%' }}>Product</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{bomMaterials[0]?.TargetEntity?.Name || bomMaterials[0]?.Product?.Name || '--'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', width: '35%' }}>Quantity</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{bomMaterials[0]?.Quantity || bomMaterials[0]?.RequiredQuantity || 0}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', width: '35%' }}>Step</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{bomMaterials[0]?.Step?.Name || '--'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <React.Fragment>
              {/* Assembly Details Form */}
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '130px 1fr', alignItems: 'center', fontSize: '14px', color: '#475569', marginBottom: '30px' }}>
                <div style={{ textAlign: 'left' }}>BOM:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9' }}>
                  <span>🗂️</span>
                  <span>
                    {localMaterialData?.CurrentBOMVersion?.Name || localMaterialData?.CurrentBOM?.Name || ''} 
                    {localMaterialData?.CurrentBOMVersion?.Revision ? ` [${localMaterialData.CurrentBOMVersion.Revision}]` : ''}
                  </span>
                </div>

                <div style={{ textAlign: 'left' }}>Assembly Type:</div>
                <div>
                  {localMaterialData?.CurrentBOMAssemblyType === 1 ? 'Explicit' : 
                   localMaterialData?.CurrentBOMAssemblyType === 0 ? 'AutomaticAtTrackOut' : 
                   localMaterialData?.CurrentBOMAssemblyType === 2 ? 'ExplicitAdd' :
                   localMaterialData?.CurrentBOMAssemblyType === 3 ? 'AutomaticAtTrackIn' :
                   localMaterialData?.CurrentBOMAssemblyType === 4 ? 'ReplaceAndDisassemble' :
                   localMaterialData?.CurrentBOMAssemblyType === 5 ? 'WeighAndDispense' :
                   localMaterialData?.CurrentBOMAssemblyType === 6 ? 'ExplicitLongRunning' :
                   localMaterialData?.CurrentBOMAssemblyType === 7 ? 'Packing' :
                   localMaterialData?.CurrentBOMAssemblyType === 8 ? 'Mixed' : 'Unknown'}
                </div>

                <div style={{ textAlign: 'left' }}>Assembled Quantity:</div>
                <div>
                  {localMaterialData?.AssembledQuantity || 0} {localMaterialData?.CurrentBOMVersion?.Units || localMaterialData?.PrimaryUnits || ''}
                </div>

                <div style={{ textAlign: 'left' }}>Remaining Quantity:</div>
                <div>
                  {(localMaterialData?.PrimaryQuantity || 0) - (localMaterialData?.AssembledQuantity || 0)} {localMaterialData?.CurrentBOMVersion?.Units || localMaterialData?.PrimaryUnits || ''}
                </div>

                {(() => {
                  const remQty = (localMaterialData?.PrimaryQuantity || 0) - (localMaterialData?.AssembledQuantity || 0);
                  const isDone = (localMaterialData?.PrimaryQuantity || 0) > 0 ? remQty <= 0 : (localMaterialData?.AssembledQuantity || 0) > 0;
                  if (isDone) {
                    return (
                      <>
                        <div style={{ textAlign: 'left', fontWeight: 600 }}>Status:</div>
                        <div style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>✓</span> All required units already assembled
                        </div>
                      </>
                    );
                  }
                  return (
                    <>
                      <div style={{ textAlign: 'left', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '4px' }}>
                        <span style={{ color: 'red' }}>*</span>
                        <div style={{ textAlign: 'left' }}>
                          Quantity to Assemble:<br />({localMaterialData?.CurrentBOMVersion?.Units || localMaterialData?.PrimaryUnits || ''})
                        </div>
                      </div>
                      <div>
                        <input 
                          type="number"
                          value={qtyToAssemble}
                          onChange={(e) => setQtyToAssemble(e.target.value)}
                          style={{ 
                            width: '100%', 
                            maxWidth: '140px',
                            padding: '6px 8px', 
                            border: ((parseFloat(qtyToAssemble) || 0) > remQty && localMaterialData?.CurrentBOMAssemblyType !== 2) ? '1px solid red' : '1px solid #cbd5e1', 
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }} 
                        />
                        {((parseFloat(qtyToAssemble) || 0) > remQty && localMaterialData?.CurrentBOMAssemblyType !== 2) && (
                          <div style={{ color: 'red', fontSize: '12px', marginTop: '4px', lineHeight: '1.2' }}>
                            Material Quantity to Assemble is larger than the Remaining Quantity.
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* BOM Products Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '20px' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingBottom: isBomProductsOpen ? '12px' : '0', borderBottom: isBomProductsOpen ? '1px solid #e2e8f0' : 'none', marginBottom: isBomProductsOpen ? '16px' : '0' }}
                  onClick={() => setIsBomProductsOpen(!isBomProductsOpen)}
                >
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b', flex: 1, fontWeight: 700 }}>BOM Products</h4>
                  {isBomProductsOpen ? <FaChevronUp size={12} color="#64748b" /> : <FaChevronDown size={12} color="#64748b" />}
                </div>
                {isBomProductsOpen && (
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#f8fafc', color: '#334155' }}>
                        <tr>
                          <th style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Product</th>
                          <th style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Assembled Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bomMaterials.length > 0 ? (
                          bomMaterials.map((req: any, idx: number) => {
                            const bomQty = req.Quantity || req.RequiredQuantity || 0;
                            const primaryQty = (localMaterialData?.PrimaryQuantity || 0) - (localMaterialData?.AssembledQuantity || 0);
                            const inputQty = parseFloat(qtyToAssemble) || 0;
                            const isQtyInvalid = inputQty > primaryQty && localMaterialData?.CurrentBOMAssemblyType !== 2;
                            const validQtyForCalc = isQtyInvalid ? 0 : inputQty;
                            
                            const reqQty = localMaterialData?.CurrentBOMAssemblyType === 2 ? (validQtyForCalc * bomQty) : (primaryQty * bomQty);
                            
                            const pName = req.TargetEntity?.Name || req.TargetEntity?.ProductName || req.Product?.Name || req.Name || `Product ${idx+1}`;
                            const pRev = req.TargetEntity?.Revision || req.TargetEntity?.ProductRevision || req.Product?.Revision || '';
                            const productName = pRev ? `${pName} [${pRev}]` : pName;
                            
                            const sProductName = selectedSourceMaterial?.ProductName || selectedSourceMaterial?.Product?.Name || "";
                            const isMatch = selectedSourceMaterial && (bomMaterials.length === 1 || sProductName === pName);
                            const dynamicAssembledQty = isMatch ? (validQtyForCalc * bomQty) : 0;
                            
                            const units = req.Units || localMaterialData?.CurrentBOMVersion?.Units || localMaterialData?.PrimaryUnits || '';
                            
                            const isFulfilled = dynamicAssembledQty > 0 && dynamicAssembledQty >= reqQty;
                            const isPending = inputQty > 0 && !isFulfilled;
                            
                            const textColor = isFulfilled ? '#15803d' : (isPending ? '#b91c1c' : '#0369a1');
                            const bgColor = isFulfilled ? '#dcfce7' : (isPending ? '#fef2f2' : '#e0f2fe');
                            
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '10px', color: '#0f172a' }}>{productName}</td>
                                <td style={{ padding: '10px', color: textColor, backgroundColor: bgColor, fontWeight: 500 }}>
                                  {dynamicAssembledQty} of {reqQty} {units}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={2} style={{ textAlign: 'center', padding: "20px", color: '#64748b' }}>No BOM products found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Material Details Card */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingBottom: isMaterialDetailsOpen ? '12px' : '0', borderBottom: isMaterialDetailsOpen ? '1px solid #e2e8f0' : 'none' }}
                  onClick={() => setIsMaterialDetailsOpen(!isMaterialDetailsOpen)}
                >
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b', flex: 1, fontWeight: 700 }}>Material Details</h4>
                  {isMaterialDetailsOpen ? <FaChevronUp size={12} color="#64748b" /> : <FaChevronDown size={12} color="#64748b" />}
                </div>
                {isMaterialDetailsOpen && (
                  <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '150px 1fr', alignItems: 'center', fontSize: '14px', color: '#475569', marginTop: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <DropDown 
                        label="Material:"
                        value={selectedSourceMaterial?.MaterialId || ''}
                        setSelectedOptions={((val: any) => {}) as any}
                        onChange={(val: string) => {
                          const mat = sourceMaterials.find((m: any) => m.MaterialId === val);
                          setSelectedSourceMaterial(mat || null);
                        }}
                        options={sourceMaterials.map((mat: any) => ({
                          label: mat.MaterialName || mat.Name,
                          value: mat.MaterialId
                        }))}
                        emptyValue="-- Select Material --"
                      />
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>Available Quantity:</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {selectedSourceMaterial ? `${selectedSourceMaterial.PrimaryQuantity} ${selectedSourceMaterial.PrimaryUnits || ''}` : '-'}
                    </div>

                    <div style={{ textAlign: 'left' }}>Consumed Qty:</div>
                    <div style={{ fontWeight: 600, color: '#0ea5e9' }}>
                      {(() => {
                        const inputQty = parseFloat(qtyToAssemble) || 0;
                        const primaryQty = (localMaterialData?.PrimaryQuantity || 0) - (localMaterialData?.AssembledQuantity || 0);
                        const isQtyInvalid = inputQty > primaryQty && localMaterialData?.CurrentBOMAssemblyType !== 2;
                        const validQtyForCalc = isQtyInvalid ? 0 : inputQty;
                        
                        let consumedQty = 0;
                        if (selectedSourceMaterial) {
                          const matchingBom = bomMaterials.find((m: any) => {
                            const pName = m.TargetEntity?.Name || m.TargetEntity?.ProductName || m.Product?.Name || m.Name;
                            return pName === selectedSourceMaterial.ProductName;
                          });
                          const bomQty = matchingBom ? (matchingBom.Quantity || matchingBom.RequiredQuantity || 0) : (bomMaterials[0]?.Quantity || 0);
                          consumedQty = validQtyForCalc * bomQty;
                        }
                        return `${consumedQty} ${materialData?.CurrentBOMVersion?.Units || materialData?.PrimaryUnits || ''}`;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </Styled.Content>
        <Styled.Footer>
          <CustomButton type="reset" onClick={onClose} />
          {(() => {
            const remQty = (localMaterialData?.PrimaryQuantity || 0) - (localMaterialData?.AssembledQuantity || 0);
            const isDone = (localMaterialData?.PrimaryQuantity || 0) > 0 ? remQty <= 0 : (localMaterialData?.AssembledQuantity || 0) > 0;
            if (isDone) {
              return (
                <CustomButton 
                  type="normal" 
                  onClick={() => { if (onSave) onSave(); else onClose(); }} 
                  label={actionLabel || "Next"} 
                  Icon={FaRegPlayCircle} 
                  disabled={isLoading}
                />
              );
            }
            if (localMaterialData?.CurrentBOMAssemblyType === 3) {
              return (
                <CustomButton 
                  type="normal" 
                  onClick={() => { if (onSave) onSave(); else onClose(); }} 
                  label={actionLabel || "Track In"} 
                  Icon={FaRegPlayCircle} 
                  disabled={isLoading}
                />
              );
            }
            return (
              <CustomButton 
                type="normal" 
                onClick={handleAssemble} 
                label="Assemble" 
                Icon={FaRegPlayCircle} 
                disabled={isLoading || ((parseFloat(qtyToAssemble) || 0) > remQty && localMaterialData?.CurrentBOMAssemblyType !== 2)}
              />
            );
          })()}
        </Styled.Footer>
      </Styled.ModalContainer>
    </Styled.Overlay>
  );
};

export default BOMModal;
