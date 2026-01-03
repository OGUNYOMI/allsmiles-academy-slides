/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export type ChartType = "line" | "bar" | "area" | "pie" | "radar";

export interface ChartProps {
  type: ChartType;
  data: unknown[];
  /** Key array, like ["uv", "pv"] for multiple series */
  series: string[];
  /** Category field, default x */
  xKey?: string;
  /** Color array */
  colors?: string[];
  height?: number;
}

const defaultColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]; // Default colors

export const Chart: React.FC<ChartProps> = ({ type, data, series, xKey = "x", colors = defaultColors, height = 260 }) => {
  let chart: React.ReactElement | null = null;
  if (type === "line") {
    chart = (
      <LineChart data={data as any[]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {series.map((s, idx) => (
          <Line key={s} type="monotone" dataKey={s} stroke={colors[idx % colors.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    );
  } else if (type === "bar") {
    chart = (
      <BarChart data={data as any[]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {series.map((s, idx) => (
          <Bar key={s} dataKey={s} fill={colors[idx % colors.length]} />
        ))}
      </BarChart>
    );
  } else if (type === "area") {
    chart = (
      <AreaChart data={data as any[]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {series.map((s, idx) => (
          <Area key={s} type="monotone" dataKey={s} fill={colors[idx % colors.length]} stroke={colors[idx % colors.length]} />
        ))}
      </AreaChart>
    );
  } else if (type === "pie") {
    chart = (
      <PieChart>
        <Tooltip />
        {series.map((s, idx) => (
          <Pie key={s} data={data as any[]} dataKey={s} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} fill={colors[idx % colors.length]} label>
            {(data as any[]).map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        ))}
      </PieChart>
    );
  } else if (type === "radar") {
    chart = (
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data as any[]}>
        <PolarGrid />
        <PolarAngleAxis dataKey={xKey} />
        <PolarRadiusAxis />
        <Radar dataKey={series[0]} stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />
        <Legend />
        <Tooltip />
      </RadarChart>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chart}
    </ResponsiveContainer>
  );
};
