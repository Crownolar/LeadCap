import { useCallback, useState } from "react";
import {
  createHeavyMetalReading,
  getSampleHeavyMetalReadings,
} from "../services/review.service";

export default function useHeavyMetalReadings() {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReadings = useCallback(async (sampleId) => {
    if (!sampleId) {
      setReadings([]);
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getSampleHeavyMetalReadings(sampleId);

      // Handles either:
      // [] directly
      // { data: [] }
      // { readings: [] }
      const result = Array.isArray(response)
        ? response
        : response?.readings ||
          response?.data ||
          [];

      setReadings(result);

      return result;
    } catch (err) {
      console.error(
        "Failed to fetch heavy metal readings:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch heavy metal readings"
      );

      setReadings([]);

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitReading = useCallback(
    async ({
      sampleId,
      heavyMetal,
      xrfReading,
      xrfNotes = "",
    }) => {
      if (!sampleId) {
        throw new Error("Sample ID is required");
      }

      if (!heavyMetal) {
        throw new Error("Heavy metal is required");
      }

      if (
        xrfReading === undefined ||
        xrfReading === null ||
        xrfReading === ""
      ) {
        throw new Error("XRF reading is required");
      }

      try {
        setIsSubmitting(true);
        setError(null);

        await createHeavyMetalReading({
          sampleId,
          heavyMetal,
          xrfReading,
          xrfNotes,
        });

        // Refresh readings immediately after successful submission
        await fetchReadings(sampleId);

        return true;
      } catch (err) {
        console.error(
          "Failed to submit heavy metal reading:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to submit heavy metal reading";

        setError(message);

        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchReadings]
  );

  return {
    readings,

    isLoading,
    isSubmitting,

    error,

    fetchReadings,
    submitReading,

    setReadings,
  };
}