import React, { useState } from "react";
import { POST } from "../../Helpers/apiClient";
import { GET_MATERIAL_BASIC_INFO } from "../../api";

const Eprocedure = () => {
  const [materialId, setMaterialId] = useState("2609020000000000001");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeApi = async () => {
    if (!materialId) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        Material: {
          Id: materialId,
        },
      };

      const res = await POST(GET_MATERIAL_BASIC_INFO, payload);
      setApiResponse(res);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeApi();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Material Basic Information</h2>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>
          Material ID:
        </label>
        <input
          type="text"
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          onBlur={executeApi}
          onKeyDown={handleKeyDown}
          placeholder="Enter Material ID and tab out"
          style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        {loading && <span style={{ marginLeft: "10px", color: "blue" }}>Executing API...</span>}
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <strong>Error executing API:</strong> {error}
        </div>
      )}

      {apiResponse && (
        <div style={{ background: "#f4f4f9", padding: "15px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>API Response:</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Eprocedure;
