import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const DonutChart = ({ metrics }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!metrics || !canvasRef.current) return;

    const values = [
      metrics?.verified || 0,
      metrics?.failed || 0,
      metrics?.pending || 0,
    ];

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Verified", "Failed", "Pending"],
        datasets: [
          {
            data: values,
            backgroundColor: ["#059669", "#dc2626", "#d97706"],
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

    return () => chartRef.current?.destroy();
  }, [metrics]);

  return (
    <div className="relative w-full" style={{ height: 220 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DonutChart;