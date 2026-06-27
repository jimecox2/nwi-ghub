"use client";

// Portable column-set picker. Drop into any tabular report to let the user
// choose which field set (columns) to display. Controlled via value/onChange;
// the value is a COLUMN_SETS key.
import { COLUMN_SETS } from "@/lib/dashboard/columnConfig";

export default function ColumnSetPicker({ value, onChange, label = "Columns:", className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="columnSetPicker" className="whitespace-nowrap text-sm text-gray-700">
        {label}
      </label>
      <select
        id="columnSetPicker"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title="Choose which set of columns to display"
        className="min-w-[160px] max-w-[300px] rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        {Object.entries(COLUMN_SETS).map(([key, entry]) => (
          <option key={key} value={key}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );
}
