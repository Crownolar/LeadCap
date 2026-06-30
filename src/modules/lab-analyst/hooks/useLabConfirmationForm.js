/**
 * useLabConfirmationForm.js
 * ───────────────────────────
 * Owns all data logic for the AAS confirmation form:
 *   • fetch the sample by sampleId from the URL
 *   • derive readings pending AAS (Lead only)
 *   • manage per-reading form state (aasReading, aasNotes)
 *   • submit all readings as parallel POSTs, then navigate away
 *
 * Returns a stable API object; the page never calls api.get/post directly.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { AAS_REQUIRED_METAL } from "../constants/labAnalyst.constants";

export const useLabConfirmationForm = () => {
  const { sampleId } = useParams();
  const navigate = useNavigate();

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  // ── Fetch sample + initialize form ───────────────────────────────────────
  useEffect(() => {
    const fetchSample = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          setError("Access token not found. Please log in again.");
          setLoading(false);
          return;
        }

        if (!sampleId) {
          setError("Sample ID is missing from URL");
          setLoading(false);
          return;
        }

        setLoading(true);
        const res = await api.get(`/lab/sample/${sampleId}`);
        setSample(res.data.data);

        // Initialize form with readings pending AAS (Lead only)
        const initialData = {};
        res.data.data?.heavyMetalReadings?.forEach((reading) => {
          if (
            reading.heavyMetal === AAS_REQUIRED_METAL &&
            reading.requiresLabConfirmation &&
            reading.aasStatus === "PENDING"
          ) {
            initialData[reading.id] = {
              readingId: reading.id,
              aasReading: "",
              aasNotes: "",
              heavyMetal: reading.heavyMetal,
              xrfReading: reading.xrfReading,
            };
          }
        });
        setFormData(initialData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch sample:", err);
        setError(err.response?.data?.message || "Failed to load sample data");
      } finally {
        setLoading(false);
      }
    };

    fetchSample();
  }, [sampleId]);

  // ── Derived: readings actually needing confirmation ──────────────────────
  const readingsToConfirm =
    sample?.heavyMetalReadings?.filter(
      (r) =>
        r.heavyMetal === AAS_REQUIRED_METAL &&
        r.requiresLabConfirmation &&
        r.aasStatus === "PENDING",
    ) || [];

  // ── Form field updates ────────────────────────────────────────────────────
  const handleInputChange = useCallback((readingId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [readingId]: { ...prev[readingId], [field]: value },
    }));
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const submissions = Object.values(formData).map((data) =>
        api.post("/lab/record-aas-reading", {
          readingId: data.readingId,
          aasReadingValue: parseFloat(data.aasReading),
          aasNotes: data.aasNotes,
        }),
      );

      await Promise.all(submissions);
      navigate("/lab-samples");
    } catch (err) {
      console.error("Failed to submit readings:", err);
      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : null);
      setError(backendMessage || "Failed to submit AAS readings");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sample,
    loading,
    submitting,
    error,
    formData,
    readingsToConfirm,
    handleInputChange,
    handleSubmit,
  };
};