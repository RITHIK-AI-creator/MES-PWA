import axios from "axios";
import { handleUnauthorized } from "../context/AuthContext";

const getBaseURL = (): string => {
  if (typeof window !== "undefined" && (window as any).APP_CONFIG && (window as any).APP_CONFIG.API_BASE_URL !== undefined) {
    return (window as any).APP_CONFIG.API_BASE_URL;
  }
  return process.env.REACT_APP_API_URL || "";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 0,
  withCredentials: false, // Must be false for direct Cross-Origin API calls with wildcard CORS
});

// Extract the access_token from cookies and attach it as a Bearer header.
apiClient.interceptors.request.use((config) => {
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
  if (match && match[1]) {
    config.headers['Authorization'] = `Bearer ${match[1]}`;
  }
  return config;
});
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       handleUnauthorized();
//     }

//     return Promise.reject(error);
//   }
// );

apiClient.interceptors.response.use(
  (response) => {
    // If the backend returned a 200 OK but it's actually the HTML of the login page,
    // it means Axios blindly followed a 302 unauthorized redirect.
    if (typeof response.data === 'string' && response.data.toLowerCase().includes('criticalmanufacturing/login')) {
      console.error("API returned the IDP Login HTML. Token is missing or expired.");
      if (!(window as any).isLoggingOut) {
        handleUnauthorized();
      }
      return Promise.reject(new Error("Unauthorized 302 Redirect"));
    }
    return response;
  },
  (error) => {
    // If the server explicitly rejects our token (401)
    if (error.response?.status === 401) {
      console.error("API Authentication Failed (401 Unauthorized).");
      error.isUnauthorized = true;
      
      if (!(window as any).isLoggingOut) {
        handleUnauthorized();
      }
    } else if (error.message === 'Network Error') {
      console.error("Network Error: This is usually caused by CORS, an invalid SSL certificate, or an ad blocker. Check the browser console.");
    }

    return Promise.reject(error);
  }
);
const resolveRefs = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  const refMap = new Map();
  
  const findIds = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (node.$id) refMap.set(node.$id, node);
    if (Array.isArray(node)) {
      node.forEach(findIds);
    } else {
      Object.values(node).forEach(findIds);
    }
  };

  const replaceRefs = (node: any, visited = new Set()) => {
    if (!node || typeof node !== 'object' || visited.has(node)) return node;
    visited.add(node);
    
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (node[i] && typeof node[i] === 'object') {
          if (node[i].$ref && refMap.has(node[i].$ref)) {
            node[i] = refMap.get(node[i].$ref);
          } else {
            replaceRefs(node[i], visited);
          }
        }
      }
    } else {
      for (const key of Object.keys(node)) {
        const val = node[key];
        if (val && typeof val === 'object') {
          if (val.$ref && refMap.has(val.$ref)) {
            node[key] = refMap.get(val.$ref);
          } else {
            replaceRefs(val, visited);
          }
        }
      }
    }
    return node;
  };

  findIds(obj);
  return replaceRefs(obj);
};

// GET
export const GET = async <T>(url: string, params?: any): Promise<T> => {
  
  try {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  } catch (error: any) {
    handleError(error);
    throw error;
  }
};

// GET_WITH_BODY
export const GET_WITH_BODY = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.request<T>({
      method: 'GET',
      url,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    handleError(error);
    throw error;
  }
};

// POST
export const POST = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error: any) {
    handleError(error);
    throw error;
  }
};

export const POST_FILE = async (
  url: string,
  data?: any,
) => {
  try {
    return await apiClient.post(
      url,
      data,
      {
        responseType: "blob",
      },
    );
  } catch (error: any) {
    // Handle blob error response
    if (
      error?.response?.data instanceof Blob
    ) {
      const text =
        await error.response.data.text();

      error.customMessage = text;
    }

    handleError(error);

    throw error;
  }
};

const handleError = (error: any) => {
  if (error.response) {
    console.error("API Error:", error.response.data);
  } else if (error.request) {
    console.error("No response from server");
  } else {
    console.error("Error:", error.message);
  }
};
