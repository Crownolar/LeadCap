import { useCallback, useEffect, useState } from "react";

import {
  getReviewStats,
  getReviews,
  getReviewDetail,
  submitReviewAction,
  getSampleHeavyMetalReadings,
  createBatchXrfReadings,
  createSingleXrfReading,
} from "../api/supervisorReview.api";

import { DEFAULT_PAGE_SIZE } from "../constants/supervisor.constants";

export default function useSampleReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);

  const [selectedSample, setSelectedSample] = useState(null);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [heavyMetalReadings, setHeavyMetalReadings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    take: DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // ─── Fetch review statistics ─────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);

    try {
      const response = await getReviewStats();

      setStats(response?.data || response);
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ─── Fetch reviews ───────────────────────────────────────────────────────

  const fetchReviews = useCallback(
    async ({ status, page = 1, take = DEFAULT_PAGE_SIZE, search } = {}) => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          skip: (page - 1) * take,
          take,
        };

        if (status) {
          params.status = status;
        }

        if (search) {
          params.search = search;
        }

        const response = await getReviews(params);

        const payload = response?.data || response;

        setReviews(payload?.data || []);

        setPagination({
          page,
          take: payload?.take || take,
          total: payload?.total || 0,
        });
      } catch (err) {
        console.error("Failed to fetch reviews:", err);

        setError(
          err?.response?.data?.message || "Failed to load sample reviews",
        );

        setReviews([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─── Fetch individual review detail ──────────────────────────────────────

  const fetchReviewDetail = useCallback(async (sampleId) => {
    if (!sampleId) return null;

    setDetailLoading(true);

    try {
      const response = await getReviewDetail(sampleId);

      const detail = response?.data || response;

      setReviewDetail(detail);

      return detail;
    } catch (err) {
      console.error("Failed to fetch review detail:", err);

      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ─── Fetch heavy metal readings ──────────────────────────────────────────

  const fetchHeavyMetalReadings = useCallback(async (sampleId) => {
    if (!sampleId) return [];

    try {
      const response = await getSampleHeavyMetalReadings(sampleId);

      const readings = response?.data || response || [];

      setHeavyMetalReadings(Array.isArray(readings) ? readings : []);

      return readings;
    } catch (err) {
      console.error("Failed to fetch heavy metal readings:", err);

      setHeavyMetalReadings([]);

      return [];
    }
  }, []);

  // ─── Select sample ───────────────────────────────────────────────────────

  const selectSample = useCallback(
    async (sample) => {
      if (!sample?.id) return;

      setSelectedSample(sample);

      try {
        await Promise.all([
          fetchReviewDetail(sample.id),
          fetchHeavyMetalReadings(sample.id),
        ]);
      } catch (err) {
        console.error("Failed to load sample details:", err);
      }
    },
    [fetchReviewDetail, fetchHeavyMetalReadings],
  );

  // ─── Submit review action ────────────────────────────────────────────────

  const performReviewAction = useCallback(
    async ({
      sampleId,
      action,
      comments,
      issues = [],
      requestedChanges = "",
      currentStatus,
    }) => {
      if (!sampleId || !action) {
        throw new Error("Sample ID and review action are required");
      }

      setActionLoading(true);

      try {
        const response = await submitReviewAction(sampleId, {
          action,
          comments,
          issues,
          requestedChanges,
        });

        await Promise.all([
          fetchStats(),
          fetchReviewDetail(sampleId),
          fetchReviews({
            status: currentStatus,
            page: pagination.page,
            take: pagination.take,
          }),
        ]);

        return response;
      } catch (err) {
        console.error("Failed to perform review action:", err);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [
      fetchStats,
      fetchReviewDetail,
      fetchReviews,
      pagination.page,
      pagination.take,
    ],
  );

  // ─── Submit batch XRF readings ───────────────────────────────────────────

  const submitBatchXrfReadings = useCallback(
    async ({ sampleId, readings }) => {
      if (!sampleId) {
        throw new Error("Sample ID is required");
      }

      if (!Array.isArray(readings) || readings.length === 0) {
        throw new Error("At least one XRF reading is required");
      }

      setActionLoading(true);

      try {
        const response = await createBatchXrfReadings({
          sampleId,
          readings,
        });

        await Promise.all([
          fetchHeavyMetalReadings(sampleId),
          fetchReviewDetail(sampleId),
          fetchStats(),
        ]);

        return response;
      } catch (err) {
        console.error("Failed to submit XRF readings:", err);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchHeavyMetalReadings, fetchReviewDetail, fetchStats],
  );

  // ─── Submit single XRF reading ───────────────────────────────────────────

  const submitSingleXrfReading = useCallback(
    async (payload) => {
      setActionLoading(true);

      try {
        const response = await createSingleXrfReading(payload);

        await Promise.all([
          fetchHeavyMetalReadings(payload.sampleId),
          fetchReviewDetail(payload.sampleId),
          fetchStats(),
        ]);

        return response;
      } catch (err) {
        console.error("Failed to submit XRF reading:", err);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchHeavyMetalReadings, fetchReviewDetail, fetchStats],
  );

  // ─── Refresh everything ──────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchReviews({
        page: pagination.page,
        take: pagination.take,
      }),
    ]);
  }, [fetchStats, fetchReviews, pagination.page, pagination.take]);

  // ─── Initial load ────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStats();

    fetchReviews({
      page: 1,
      take: DEFAULT_PAGE_SIZE,
    });
  }, [fetchStats, fetchReviews]);

  return {
    // Data
    reviews,
    stats,
    selectedSample,
    reviewDetail,
    heavyMetalReadings,
    pagination,

    // States
    loading,
    statsLoading,
    detailLoading,
    actionLoading,
    error,

    // Actions
    fetchStats,
    fetchReviews,
    fetchReviewDetail,
    fetchHeavyMetalReadings,

    selectSample,
    setSelectedSample,

    performReviewAction,
    submitBatchXrfReadings,
    submitSingleXrfReading,

    refresh,
  };
}
