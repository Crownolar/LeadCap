/**
 * EnumsContext - Provides enums from backend API
 * Fetches once when user is authenticated; components use useEnums() to access
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const EnumsContext = createContext(null);

export const EnumsProvider = ({ children, isAuthenticated }) => {
  const [enums, setEnums] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setEnums(null);
      return;
    }

    const fetchEnums = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/enums");
        setEnums(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to fetch enums:", err);
        setError(err.message);
        setEnums(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEnums();
  }, [isAuthenticated]);

  const value = {
    enums,
    loading,
    error,
    // Convenience getters
    userRoles: enums?.UserRole || [],
    userRoleLabels: enums?.UserRoleLabels || {},
    vendorTypes: enums?.VendorType || [],
    sampleTypes: enums?.SampleType || [{ value: "SOLID", label: "Solid (mg/kg)" }, { value: "LIQUID", label: "Liquid (mg/L)" }],
    heavyMetals: enums?.HeavyMetal || [],
    heavyMetalLabels: enums?.HeavyMetalLabels || {},
    productCategories: enums?.productCategories || [],
    productOrigin: enums?.ProductOrigin || ["LOCAL", "IMPORTED"],
    contaminationStatus: enums?.ContaminationStatus || [],
  };

  return (
    <EnumsContext.Provider value={value}>
      {children}
    </EnumsContext.Provider>
  );
};

export const useEnums = () => {
  const ctx = useContext(EnumsContext);
  if (!ctx) {
    throw new Error("useEnums must be used within EnumsProvider");
  }
  return ctx;
};
