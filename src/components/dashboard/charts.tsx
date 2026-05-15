"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ComplaintTrendData {
  month: string;
  complaints: number;
  resolved: number;
}

interface FraudRegionData {
  region: string;
  count: number;
}

export function ComplaintTrendChart({ data }: { data: ComplaintTrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="complaints"
          stroke="#003366"
          strokeWidth={2}
          dot={{ r: 4, fill: "#003366" }}
          name="New Complaints"
        />
        <Line
          type="monotone"
          dataKey="resolved"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 4, fill: "#22c55e" }}
          name="Resolved"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FraudRegionChart({ data }: { data: FraudRegionData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="region" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Bar dataKey="count" fill="#003366" radius={[4, 4, 0, 0]} name="Fraud Cases" />
      </BarChart>
    </ResponsiveContainer>
  );
}
