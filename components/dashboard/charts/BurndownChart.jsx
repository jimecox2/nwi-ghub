"use client";

// Sprint burndown chart for Agilebars-provided tbcharts entries. The exact
// shape varies, so this is defensive: it finds a points array and plots every
// numeric series against a label key. Falls back to a note if unrecognizable.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LABEL_KEYS = ["date", "day", "label", "name", "x", "sprint", "week"];
const COLORS = ["#0099ff", "#ff0080", "#22c55e", "#f59e0b", "#8b5cf6"];

function extractPoints(chartData) {
  if (Array.isArray(chartData)) return chartData;
  if (!chartData || typeof chartData !== "object") return null;
  for (const key of ["data", "points", "series", "values", "rows"]) {
    if (Array.isArray(chartData[key])) return chartData[key];
  }
  return null;
}

export default function BurndownChart({ chartData }) {
  const title = chartData?.name || chartData?.title || chartData?.sprintName || "Sprint Burndown";
  const points = extractPoints(chartData);

  let labelKey = null;
  let numericKeys = [];
  if (Array.isArray(points) && points.length > 0 && typeof points[0] === "object") {
    const keys = Object.keys(points[0]);
    labelKey = keys.find((k) => LABEL_KEYS.includes(k.toLowerCase())) || keys[0];
    numericKeys = keys.filter((k) => k !== labelKey && points.some((p) => !Number.isNaN(parseFloat(p[k]))));
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {labelKey && numericKeys.length > 0 ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {numericKeys.map((k, i) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-gray-500">
            Sprint chart data is present but not in a recognized point format.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
