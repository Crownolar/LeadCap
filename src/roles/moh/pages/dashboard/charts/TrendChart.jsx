import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

const TrendChart = ({ trend = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const { months, safeData, moderateData, contaminatedData, pendingData, hasData } =
    useMemo(() => {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const monthMap = Object.fromEntries(
        monthOrder.map((month) => [
          month,
          {
            safe: 0,
            moderate: 0,
            contaminated: 0,
            pending: 0,
          },
        ])
      );

      trend.forEach((item) => {
        const month = item?.month;
        if (!month || !monthMap[month]) return;

        monthMap[month] = {
          safe: Number(item.safe) || 0,
          moderate: Number(item.moderate) || 0,
          contaminated: Number(item.contaminated) || 0,
          pending: Number(item.pending) || 0,
        };
      });

      const months = monthOrder;
      const safeData = months.map((month) => monthMap[month].safe);
      const moderateData = months.map((month) => monthMap[month].moderate);
      const contaminatedData = months.map((month) => monthMap[month].contaminated);
      const pendingData = months.map((month) => monthMap[month].pending);

      const hasData =
        safeData.some((v) => v > 0) ||
        moderateData.some((v) => v > 0) ||
        contaminatedData.some((v) => v > 0) ||
        pendingData.some((v) => v > 0);

      return {
        months,
        safeData,
        moderateData,
        contaminatedData,
        pendingData,
        hasData,
      };
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
            label: "Safe",
            data: safeData,
            borderColor: "#059669",
            tension: 0.4,
            fill: false,
            pointRadius: 3,
          },
          {
            label: "Moderate",
            data: moderateData,
            borderColor: "#d97706",
            tension: 0.4,
            fill: false,
            pointRadius: 3,
          },
          {
            label: "Contaminated",
            data: contaminatedData,
            borderColor: "#dc2626",
            tension: 0.4,
            fill: false,
            pointRadius: 3,
          },
          {
            label: "Pending",
            data: pendingData,
            borderColor: "#2563eb",
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
  }, [months, safeData, moderateData, contaminatedData, pendingData, hasData]);

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