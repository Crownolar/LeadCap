import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

const DonutChart = ({ metrics }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    const data = [
      {
        label: "Safe",
        value: metrics?.safe || 0,
        color: "#059669",
      },
      {
        label: "Moderate",
        value: metrics?.moderate || 0,
        color: "#d97706",
      },
      {
        label: "Contaminated",
        value: metrics?.contaminated || 0,
        color: "#dc2626",
      },
      {
        label: "Pending Results",
        value: metrics?.pendingResults || 0,
        color: "#2563eb",
      },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return {
      labels: data.map((item) => item.label),
      values: data.map((item) => item.value),
      colors: data.map((item) => item.color),
      hasData: total > 0,
    };
  }, [metrics]);

  useEffect(() => {
    if (!metrics || !canvasRef.current || !chartData.hasData) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.values,
            backgroundColor: chartData.colors,
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 11 },
              padding: 12,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [metrics, chartData]);

  if (!chartData.hasData) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
        No status data available
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: 220 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DonutChart;