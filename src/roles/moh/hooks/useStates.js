import { useEffect, useState } from "react";
import api from "../../../utils/api";

export const useStates = () => {
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [statesError, setStatesError] = useState("");

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        setStatesError("");

        const res = await api.get("/management/states");
        const items = res.data?.items || res.data?.data || res.data || [];

        setStates(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
        setStatesError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch states"
        );
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  return {
    states,
    loadingStates,
    statesError,
  };
};