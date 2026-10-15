export const STEPPER_CONFIG: Record<
  string,
  {
    icon: string;
    label: string;
    isDC?: boolean;
    isChecklist?: boolean;
    isBOM?: boolean;
  }
> = {
  DISPATCH: {
    icon: "fa-solid fa-list-check",
    label: "Dispatch",
  },
  TRACK_IN: {
    icon: "fa-solid fa-arrow-right-to-bracket",
    label: "Track-In",
  },
  TRACK_OUT: {
    icon: "fa-solid fa-arrow-right-from-bracket",
    label: "Track-Out",
  },
  MOVE_NEXT: {
    icon: "fa-solid fa-share",
    label: "Move-Next",
  },
  DATA_COLLECTION: {
    icon: "fa-solid fa-clipboard-list",
    label: "Data Collection",
    isDC: true,
  },
  CHECKLIST: {
    icon: "fa-solid fa-list-check", // you can pick another appropriate icon if needed, maybe "fa-solid fa-check-square"
    label: "Checklist",
    isChecklist: true,
  },
  BOM: {
    icon: "fa-solid fa-layer-group", // Icon similar to the stacked squares in the image
    label: "BOM",
    isBOM: true,
  },
  DEFAULT:{
    icon: "fa-solid fa-bolt",
    label:""
  }
};

export const extractErrorMessage = (e: any, fallbackMessage: string = "Request failed"): string => {
  let errMsg = fallbackMessage;
  if (e?.response?.data) {
    const data = e.response.data;
    if (data.ModelState && typeof data.ModelState === 'object') {
      const firstKey = Object.keys(data.ModelState)[0];
      if (firstKey && Array.isArray(data.ModelState[firstKey]) && data.ModelState[firstKey].length > 0) {
        errMsg = data.ModelState[firstKey][0];
      } else {
        errMsg = data.Message || data.MesMessage || errMsg;
      }
    } else if (data.MesMessage) {
      errMsg = data.MesMessage;
    } else if (data.Message) {
      errMsg = data.Message;
    }
  } else if (e?.message) {
    errMsg = e.message;
  }
  return errMsg;
};

export const getFactory = (): string => {
  if (typeof window !== "undefined" && (window as any).APP_CONFIG?.FACTORY) {
    return (window as any).APP_CONFIG.FACTORY;
  }
  return  "";
};

/**
 * Recursively offsets all $id and $ref values by a numeric amount
 * to avoid duplicate ID collisions in Newtonsoft.Json when combining
 * entities from multiple API responses into a single payload.
 */
export const offsetObjectIds = (obj: any, offset = 10000): any => {
  if (!obj || typeof obj !== "object") return obj;

  const cloned = JSON.parse(JSON.stringify(obj));

  const traverse = (node: any) => {
    if (!node || typeof node !== "object") return;

    if (node.$id !== undefined && node.$id !== null) {
      const num = parseInt(node.$id, 10);
      node.$id = !isNaN(num) ? String(num + offset) : `${offset}_${node.$id}`;
    }

    if (node.$ref !== undefined && node.$ref !== null) {
      const num = parseInt(node.$ref, 10);
      node.$ref = !isNaN(num) ? String(num + offset) : `${offset}_${node.$ref}`;
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        traverse(node[i]);
      }
    } else {
      for (const key of Object.keys(node)) {
        traverse(node[key]);
      }
    }
  };

  traverse(cloned);
  return cloned;
};