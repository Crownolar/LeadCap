import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Package, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import StatCard from "../common/StatCard";
import { COLORS } from "../../utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

const Dashboard = ({ theme, darkMode }) => {
  const dispatch = useDispatch();
  const { samples, loading } = useSelector((state) => state.samples);

  // useEffect(() => {
  //   dispatch(fetchSamples());
  // }, [dispatch]);

  if (loading) {
    return <p className={`${theme?.text}`}>Loading samples...</p>;
  }

  // if (!samples || samples.length === 0) {
  //   return <p className={`${theme?.text}`}>No samples yet.</p>;
  // }

  const analytics = {
    total: samples?.length,
    contaminated: samples?.filter((s) => s?.contaminated).length,
    safe: samples?.filter((s) => !s?.contaminated)?.length,
    pending: samples?.filter((s) => s?.status === "pending")?.length,
    byState: Object?.entries(
      samples?.reduce((acc, s) => {
        acc[s?.state] = (acc[s?.state] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })),
    byProductType: Object?.entries(
      samples.reduce((acc, s) => {
        acc[s?.productType] = (acc[s?.productType] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })),
    registeredVsUnregistered: [
      {
        name: "Registered",
        total: samples?.filter((s) => s?.registered)?.length,
        contaminated: samples?.filter((s) => s?.registered && s?.contaminated)
          ?.length,
      },
      {
        name: "Unregistered",
        total: samples?.filter((s) => !s?.registered)?.length,
        contaminated: samples?.filter((s) => !s?.registered && s?.contaminated)
          ?.length,
      },
    ],
  };

  return (
    <div className={`space-y-6 px-10 ${theme?.text}`}>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${theme?.text}`}
      >
        <StatCard
          icon={Package}
          label="Total Samples"
          value={analytics?.total}
          color="bg-blue-500"
          theme={theme}
        />
        <StatCard
          icon={AlertTriangle}
          label="Contaminated"
          value={analytics?.contaminated}
          color="bg-red-500"
          subtext={`${(
            (analytics?.contaminated / analytics?.total) *
            100
          ).toFixed(1)}% of total`}
          theme={theme}
        />
        <StatCard
          icon={CheckCircle}
          label="Safe Products"
          value={analytics?.safe}
          color="bg-green-500"
          subtext={`${((analytics?.safe / analytics?.total) * 100).toFixed(
            1
          )}% of total`}
          theme={theme}
        />
        <StatCard
          icon={Clock}
          label="Pending Tests"
          value={analytics?.pending}
          theme={theme}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme?.text}`}>
            Samples by State
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.byState}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#374151" : "#e5e7eb"}
              />
              <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme?.text}`}>
            Product Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.byProductType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name?.split(" ")[0]}: ${((percent ?? 0) * 100).toFixed(
                    0
                  )}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics?.byProductType.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border} lg:col-span-2`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme?.text}`}>
            Contamination: Registered vs Unregistered
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.registeredVsUnregistered}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#374151" : "#e5e7eb"}
              />
              <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total Samples" />
              <Bar dataKey="contaminated" fill="#ef4444" name="Contaminated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
