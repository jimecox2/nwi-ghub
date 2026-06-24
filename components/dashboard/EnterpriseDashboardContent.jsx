"use client";

// Renders the active dashboard source's contents. Adapted from the legacy
// EnterpriseDashboardContent: receives the source as a prop (the selector owns
// the fetch) and uses the shared ItemsTable instead of the never-staged
// ConsolidatedReportComponent.
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ItemsTable from "./ItemsTable";

export default function EnterpriseDashboardContent({ source }) {
  if (!source) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="mb-4 h-16 w-16 text-gray-400" />
          <p className="text-center text-gray-600">Select or create a dashboard source to view your enterprise project data.</p>
        </CardContent>
      </Card>
    );
  }

  const items = Array.isArray(source.tbmdjoined) ? source.tbmdjoined : [];
  if (items.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="py-8">
          <p className="text-center text-yellow-900">No data available in this dashboard source.</p>
        </CardContent>
      </Card>
    );
  }

  const count = (type) => items.filter((i) => i.tbType === type).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Portfolio and Project Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{items.length}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-600">Portfolios</p>
              <p className="text-2xl font-bold text-green-900">{count("Portfolio")}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm font-medium text-purple-600">Projects</p>
              <p className="text-2xl font-bold text-purple-900">{count("Project")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ItemsTable data={items} />
        </CardContent>
      </Card>
    </div>
  );
}
