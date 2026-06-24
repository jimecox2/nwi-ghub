'use client';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';

/**
 * Enterprise Pubsets Data Table Component
 * Client component with search, sorting, filtering, and dashboard source creation
 *
 * @param {Array} data - Array of pubset objects (already filtered by RBAC)
 * @param {Object} session - NextAuth session
 */
export default function PubsetsDataTable({ data, session }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('published_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPubsets, setSelectedPubsets] = useState([]);
  const [showOnlyConnected, setShowOnlyConnected] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pubsets_show_only_connected');
      return saved === 'true';
    }
    return false;
  });

  // Filter states
  const [sourceProductFilter, setSourceProductFilter] = useState('all');
  const [publishStatusFilter, setPublishStatusFilter] = useState('all');
  const [aggregationLevelFilter, setAggregationLevelFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pubsets_show_only_connected', showOnlyConnected.toString());
    }
  }, [showOnlyConnected]);

  const handleCheckboxToggle = (pubsetId) => {
    setSelectedPubsets(prev => {
      if (prev.includes(pubsetId)) {
        return prev.filter(id => id !== pubsetId);
      } else {
        return [...prev, pubsetId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPubsets.length === sortedData.length) {
      setSelectedPubsets([]);
    } else {
      setSelectedPubsets(sortedData.map(item => item.id));
    }
  };

  // Navigate to consolidated report (enterprise flow)
  const handleConsolidatedReport = () => {
    if (selectedPubsets.length > 0) {
      const ids = selectedPubsets.join(',');
      window.location.href = `/dashboard/pubsets/consolidated?ids=${ids}`;
    }
  };

  // Search + filters
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      item.name?.toLowerCase().includes(searchLower) ||
      item.owner?.toLowerCase().includes(searchLower) ||
      item.customer_id?.toLowerCase().includes(searchLower) ||
      item.users_permissions_user?.toLowerCase().includes(searchLower) ||
      item.division?.toLowerCase().includes(searchLower) ||
      item.cost_center?.toLowerCase().includes(searchLower)
    );

    const matchesConnection = !showOnlyConnected || item.isActive === true;
    const matchesProduct = sourceProductFilter === 'all' || item.source_product === sourceProductFilter;
    const matchesStatus = publishStatusFilter === 'all' || item.publish_status === publishStatusFilter;
    const matchesAggregation = aggregationLevelFilter === 'all' || item.aggregation_level === aggregationLevelFilter;
    const matchesDivision = divisionFilter === 'all' || item.division === divisionFilter;

    return matchesSearch && matchesConnection && matchesProduct && matchesStatus && matchesAggregation && matchesDivision;
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'published_date') {
      aVal = new Date(aVal || 0);
      bVal = new Date(bVal || 0);
    }

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Unique values for filter dropdowns
  const uniqueProducts = Array.from(new Set(data.map(item => item.source_product).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(data.map(item => item.publish_status).filter(Boolean)));
  const uniqueAggregationLevels = Array.from(new Set(data.map(item => item.aggregation_level).filter(Boolean)));
  const uniqueDivisions = Array.from(new Set(data.map(item => item.division).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Search Bar and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search by name, owner, division, cost center..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        {searchTerm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            id="showOnlyConnected"
            checked={showOnlyConnected}
            onChange={(e) => setShowOnlyConnected(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label
            htmlFor="showOnlyConnected"
            className="text-sm text-gray-700 cursor-pointer select-none"
          >
            Show Only Connected to Personal Dashboard
          </label>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Client Product:</label>
          <select
            value={sourceProductFilter}
            onChange={(e) => setSourceProductFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Products</option>
            {uniqueProducts.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Publish Status:</label>
          <select
            value={publishStatusFilter}
            onChange={(e) => setPublishStatusFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Aggregation Type:</label>
          <select
            value={aggregationLevelFilter}
            onChange={(e) => setAggregationLevelFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Types</option>
            {uniqueAggregationLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Division:</label>
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Divisions</option>
            {uniqueDivisions.map(division => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>
        </div>

        {(sourceProductFilter !== 'all' || publishStatusFilter !== 'all' || aggregationLevelFilter !== 'all' || divisionFilter !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSourceProductFilter('all');
              setPublishStatusFilter('all');
              setAggregationLevelFilter('all');
              setDivisionFilter('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Generate Dashboard Source Button */}
      {selectedPubsets.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={handleConsolidatedReport}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Generate Dashboard Source ({selectedPubsets.length} selected)
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedPubsets([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPubsets.length === sortedData.length && sortedData.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </TableHead>
              <TableHead className="font-semibold" title="Actions available for this pubset">Actions</TableHead>
              <TableHead
                onClick={() => handleSort('id')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="Unique identifier for this pubset in Strapi database"
              >
                ID{getSortIndicator('id')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('name')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="Name of the pubset as defined by the user"
              >
                Name{getSortIndicator('name')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('owner')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="Email address of the user who owns this pubset"
              >
                Owner{getSortIndicator('owner')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('published_date')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="Date and time when this pubset was last published to Strapi"
              >
                Published Date{getSortIndicator('published_date')}
              </TableHead>
              <TableHead className="font-semibold" title="Whether this pubset is actively connected to the live dashboard (isActive flag)">Connected to Dashboard</TableHead>
              <TableHead
                onClick={() => handleSort('source_product')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="The client software that published this pubset data (Agilebars, Timebars, or Costbars)"
              >
                Client Product{getSortIndicator('source_product')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('publish_status')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="Current publication status - Draft (in progress), Final (approved), or Archived (old data)"
              >
                Publish Status{getSortIndicator('publish_status')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('aggregation_level')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="The scope and level of data in this pubset"
              >
                Aggregation Type{getSortIndicator('aggregation_level')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('division')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="Business division or business unit that owns this pubset"
              >
                Division{getSortIndicator('division')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('customer_id')}
                className="cursor-pointer hover:bg-gray-100 font-semibold"
                title="Customer or organization identifier for multi-tenant RBAC access control"
              >
                Customer ID{getSortIndicator('customer_id')}
              </TableHead>
              <TableHead className="font-semibold" title="Comma-separated list of email addresses granted Project Manager access to this pubset">PM Grant Access</TableHead>
              <TableHead className="font-semibold" title="Comma-separated list of email addresses granted Team Member access to this pubset">TM Grant Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center text-gray-500 py-8">
                  {searchTerm ? 'No pubsets match your search' : 'No pubsets found'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPubsets.includes(item.id)}
                      onChange={() => handleCheckboxToggle(item.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/pubsets/report/${item.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700 font-mono text-sm">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-gray-700">{item.owner}</TableCell>
                  <TableCell className="text-gray-600">
                    {item.published_date
                      ? moment(item.published_date).format('YYYY-MM-DD HH:mm')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.isActive ? 'Connected' : 'Not Connected'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.source_product ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.source_product === 'Agilebars' ? 'bg-purple-100 text-purple-800' :
                        item.source_product === 'Timebars' ? 'bg-blue-100 text-blue-800' :
                        item.source_product === 'Costbars' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.source_product}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.publish_status ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.publish_status === 'Final' ? 'bg-green-100 text-green-800' :
                        item.publish_status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                        item.publish_status === 'Archived' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.publish_status}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-700">
                    {item.aggregation_level || <span className="text-gray-400">N/A</span>}
                  </TableCell>
                  <TableCell className="text-xs text-gray-700">
                    {item.division || <span className="text-gray-400">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {item.customer_id ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                        {item.customer_id}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                    {item.grant_pm_access_to ? (
                      <span title={item.grant_pm_access_to}>{item.grant_pm_access_to}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                    {item.grant_tm_access_to ? (
                      <span title={item.grant_tm_access_to}>{item.grant_tm_access_to}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <strong>{sortedData.length}</strong> pubset{sortedData.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
        {session?.user && (
          <div className="text-xs text-gray-500">
            Logged in as: {session.user.email}
          </div>
        )}
      </div>
    </div>
  );
}
