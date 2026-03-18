import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

const TrendChart = ({ trend = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const { months, verifiedData, failedData, pendingData, hasData } = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const verifiedData = new Array(12).fill(0);
    const failedData = new Array(12).fill(0);
    const pendingData = new Array(12).fill(0);

    trend.forEach((item) => {
      if (!item?.createdAt) return;

      const date = new Date(item.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const month = date.getMonth();
      const status = item.status || item.verificationStatus;

      if (status === "VERIFIED" || status === "VERIFIED_ORIGINAL") {
        verifiedData[month]++;
      } else if (status === "FAILED" || status === "VERIFIED_FAKE") {
        failedData[month]++;
      } else if (
        status === "PENDING" ||
        status === "VERIFICATION_PENDING" ||
        status === "UNVERIFIED"
      ) {
        pendingData[month]++;
      }
    });

    const hasData =
      verifiedData.some((v) => v > 0) ||
      failedData.some((v) => v > 0) ||
      pendingData.some((v) => v > 0);

    return { months, verifiedData, failedData, pendingData, hasData };
  }, [trend]);

  useEffect(() => {
    if (!canvasRef.current || !hasData) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Verified",
            data: verifiedData,
            borderColor: "#059669",
            tension: 0.4,
            fill: false,
            pointRadius: 3,
          },
          {
            label: "Failed",
            data: failedData,
            borderColor: "#dc2626",
            tension: 0.4,
            fill: false,
            pointRadius: 3,
          },
          {
            label: "Pending",
            data: pendingData,
            borderColor: "#d97706",
            tension: 0.4,
            fill: false,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 11 },
              padding: 12,
            },
          },
        },
        scales: {
          y: {
            grid: { color: "#f3f4f6" },
            beginAtZero: true,
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [months, verifiedData, failedData, pendingData, hasData]);

  if (!hasData) {
    return (
      <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
        No trend data available
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: 180 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default TrendChart;