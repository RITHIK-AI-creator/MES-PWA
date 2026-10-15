import React, { useEffect, useState, useMemo } from "react";
import * as Styled from "./index.styled";
import { POST } from "../../Helpers/apiClient";
import { EXECUTE_QUERY } from "../../api";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import { FaChevronLeft, FaChevronRight, FaSearch, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Loader from "../../Library/Loader";

interface Material {
  Id: string;
  Name: string;
  UniversalState: number;
}

const MaterialList = () => {
  const navigate = useNavigate();
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 25;

  useEffect(() => {
    fetchAllMaterials();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchAllMaterials = async () => {
    setIsLoading(true);
    setError(null);

    const payload = {
      QueryObject: {
        $type: "Cmf.Foundation.BusinessObjects.QueryObject.QueryObject, Cmf.Foundation.BusinessObjects",
        EntityTypeName: "Material",
        Query: {
          Distinct: false,
          Filters: [
            {
              Name: "IsTemplate",
              ObjectName: "Material",
              Operator: 0,
              Value: false,
              LogicalOperator: 1
            }
          ],
          Fields: [
            { Name: "Id", ObjectName: "Material", Alias: "Id" },
            { Name: "Name", ObjectName: "Material", Alias: "Name" },
            { Name: "UniversalState", ObjectName: "Material", Alias: "UniversalState" }
          ]
        }
      },
      PageNumber: 1,
      PageSize: 1000 
    };

    try {
      const response = await POST<any>(EXECUTE_QUERY, payload);
      let extractedMaterials: any[] = [];
      
      if (Array.isArray(response)) {
        extractedMaterials = response;
      } else if (response && typeof response === 'object') {
        if (response.NgpDataSet && Array.isArray(response.NgpDataSet.T_Result)) {
          extractedMaterials = response.NgpDataSet.T_Result;
        } else if (Array.isArray(response.Entities)) extractedMaterials = response.Entities;
        else if (Array.isArray(response.Data)) extractedMaterials = response.Data;
        else if (Array.isArray(response.Results)) extractedMaterials = response.Results;
        else if (Array.isArray(response.Items)) extractedMaterials = response.Items;
        else if (Array.isArray(response.d)) extractedMaterials = response.d;
      }
      setAllMaterials(extractedMaterials);
    } catch (err: any) {
      console.error("Failed to fetch materials:", err);
      setError("Failed to load materials. The session might have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaterials = useMemo(() => {
    return allMaterials.filter(mat => {
      if (mat.UniversalState === 4) return false;
      return (mat.Name || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [allMaterials, searchQuery]);

  const totalPages = Math.ceil(filteredMaterials.length / PAGE_SIZE) || 1;
  const paginatedMaterials = filteredMaterials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, filteredMaterials.length);

  return (
    <Styled.PageContainer>
      {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}
      
      {/* Top Filter Bar - Stacked on Mobile */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '12px', pl: 1.5, border: '1px solid #ced4da', height: 42 }}>
          <FaSearch color="gray" style={{ marginLeft: 4 }} />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ '& fieldset': { border: 'none' }, input: { padding: '10px 14px' } }}
          />
        </Box>

      </Box>

      {/* Header and Pagination Row */}
      <Styled.HeaderRow>
        <Styled.HeaderText>
          Material List <span>({filteredMaterials.length > 0 ? `${startItem} to ${endItem} of ${filteredMaterials.length}` : '0 results'})</span>
        </Styled.HeaderText>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => setPage(p => p - 1)} 
            disabled={page === 1}
            sx={{ 
              bgcolor: '#e0e4eb', borderRadius: 1, width: 32, height: 32,
              '&:hover': { bgcolor: '#d0d4db' }, '&.Mui-disabled': { bgcolor: '#f0f0f0' }
            }}
          >
            <FaChevronLeft size={12} color={page === 1 ? '#aaa' : '#333'} />
          </IconButton>
          <IconButton 
            onClick={() => setPage(p => p + 1)} 
            disabled={page >= totalPages || paginatedMaterials.length === 0}
            sx={{ 
              bgcolor: '#0d47a1', borderRadius: 1, width: 32, height: 32,
              '&:hover': { bgcolor: '#1565c0' }, '&.Mui-disabled': { bgcolor: '#f0f0f0' }
            }}
          >
            <FaChevronRight size={12} color={page >= totalPages || paginatedMaterials.length === 0 ? '#aaa' : 'white'} />
          </IconButton>
        </Box>
      </Styled.HeaderRow>

      {isLoading ? (
        <Loader />
      ) : (
        <Styled.ListContainer>
          <Styled.ListHeader>
            <div>Name</div>
            <div>Universal State</div>
          </Styled.ListHeader>
          {paginatedMaterials.length === 0 ? (
            <Typography color="textSecondary" sx={{ mt: 4, gridColumn: '1 / -1', textAlign: 'center' }}>
              No materials match your filters.
            </Typography>
          ) : (
            paginatedMaterials.map((mat, index) => {
              const id = mat.Id || `Unknown-${index}`;
              return (
                <Styled.ListItem 
                  key={id}
                  onClick={() => navigate('/Material', { state: { autoScanName: mat.Name } })}
                >
                  <Styled.ItemName>{mat.Name || "Unnamed Material"}</Styled.ItemName>
                  <Styled.ItemState>{mat.UniversalState === 2 ? 'Active' : mat.UniversalState === 4 ? 'Terminated' : mat.UniversalState}</Styled.ItemState>
                </Styled.ListItem>
              );
            })
          )}
        </Styled.ListContainer>
      )}
    </Styled.PageContainer>
  );
};

export default MaterialList;
