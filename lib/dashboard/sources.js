// Dashboard-source domain functions, ported from the legacy coreCrud.js
// (lines ~1302–1775) onto plain `fetch`. Every function takes the bearer token
// to use, so the API proxy decides reads (user token) vs. privileged writes
// (FULL_ACCESS_ADMIN_TOKEN). These run server-side only (inside app/api/dashboard/*).
import { strapiGet, strapiList, strapiCreate, strapiUpdate, strapiDelete } from "./strapi";

// Map a Strapi v4 dashboard-source record (with `attributes`) to a flat object.
function mapSource(item, email) {
  const a = item.attributes;
  return {
    id: item.id,
    name: a.name,
    owner: a.owner,
    Customer_id: a.Customer_id,
    tbmdjoined: a.tbmdjoined,
    tbresources: a.tbresources,
    tbrescalcs2: a.tbrescalcs2 || null,
    tbcharts: a.tbcharts || null,
    tbtags: a.tbtags,
    tbdocuments: a.tbdocuments || null,
    tb: a.tb || null,
    tbmd: a.tbmd || null,
    source_product: a.source_product,
    publish_status: a.publish_status,
    aggregation_level: a.aggregation_level,
    division: a.division,
    cost_center: a.cost_center,
    geographic_region: a.geographic_region,
    isActive: a.isActive,
    published_date: a.published_date,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    sourcePubsetIds: a.uid,
    grant_tm_access_to: a.grant_tm_access_to || "",
    isOwner: email ? a.owner === email : undefined,
  };
}

// All sources a user can access: ones they own OR are shared with via
// grant_tm_access_to. (Owner/shared filtering is the source-level RBAC.)
export async function getAllDashboardSources(email, token) {
  const data = await strapiList("/dashboard-sources?sort=createdAt:desc", token);
  return data
    .map((item) => mapSource(item, email))
    .filter((s) => {
      const isOwner = s.owner === email;
      const isShared =
        s.grant_tm_access_to &&
        s.grant_tm_access_to.split(",").map((e) => e.trim()).includes(email);
      return isOwner || isShared;
    });
}

export async function getOneDashboardSource(id, token) {
  const json = await strapiGet(`/dashboard-sources/${id}`, token);
  return json?.data ? mapSource(json.data) : null;
}

// The active source for a customer (one active per Customer_id).
export async function getActiveDashboardSource(customerId, token) {
  const data = await strapiList(
    `/dashboard-sources?filters[Customer_id][$eq]=${encodeURIComponent(customerId)}&filters[isActive][$eq]=true`,
    token
  );
  return data.length ? mapSource(data[0]) : null;
}

export async function createDashboardSource(data, token) {
  return strapiCreate("/dashboard-sources", data, token);
}

export async function updateDashboardSource(id, data, token) {
  return strapiUpdate(`/dashboard-sources/${id}`, data, token);
}

export async function deleteDashboardSource(id, token) {
  return strapiDelete(`/dashboard-sources/${id}`, token);
}

// Activate one source and deactivate the rest for the same customer.
export async function setActiveDashboardSource(sourceId, customerId, token) {
  const data = await strapiList(
    `/dashboard-sources?filters[Customer_id][$eq]=${encodeURIComponent(customerId)}`,
    token
  );
  await Promise.all(
    data.map((item) =>
      updateDashboardSource(item.id, { isActive: item.id.toString() === sourceId.toString() }, token)
    )
  );
}

// Users in the same organization, for the share dialog. The users-permissions
// /users endpoint returns a flat array (no `attributes` wrapper).
export async function getUsersByCustomerId(customerId, token) {
  const data = await strapiGet(
    `/users?filters[customer_id][$eq]=${encodeURIComponent(customerId)}&sort=username:asc`,
    token
  );
  if (!Array.isArray(data)) return [];
  return data.map((u) => ({
    id: u.id,
    name: u.username || u.email,
    email: u.email,
    role: u.primary_role || "User",
    customerId: u.customer_id || u.Customer_id,
  }));
}

// Extract Allocation rows from tbmdjoined into the tbrescalcs2 shape used by the
// resource charts, and persist it on the source. Ported verbatim in behavior.
export async function preprocessDashboardSourceData(dashboardSource, token) {
  const tbmdjoined = dashboardSource.tbmdjoined;
  if (!tbmdjoined || !Array.isArray(tbmdjoined)) {
    return { success: false, resCalcsCount: 0, message: "No tbmdjoined data found on this dashboard source" };
  }

  const allocationRows = tbmdjoined.filter((row) => row.tbType === "Allocation");
  if (allocationRows.length === 0) {
    return {
      success: false,
      resCalcsCount: 0,
      message:
        "No Allocation rows found in tbmdjoined. Ensure the dashboard source was created with all 5 hierarchy levels.",
    };
  }

  const resCalcs = allocationRows.map((row, index) => {
    const tbResCalcTbID = row.tbResCalcTbID || row.tbID || "";
    const tbResCalcResID = row.tbResCalcResID || row.tbResID || "";
    const weekNo = row.tbResCalcWeekNo || index + 1;
    return {
      id: row.id || index,
      tbL1: row.tbL1 || "",
      tbL2: row.tbL2 || "",
      tbL3: row.tbL3 || "NA",
      tbL4: row.tbL4 || "",
      tbL5: row.tbL5 || "",
      tbName: row.tbName || "",
      tbType: "Allocation",
      tbOwner: row.tbOwner || "",
      tbResCalcID: row.tbResCalcID || `${tbResCalcTbID}:${tbResCalcResID}:${weekNo}`,
      tbResCalcTbID,
      tbResCalcResID,
      tbResCalcHours: row.tbResCalcHours || String(row.tbWork || "0"),
      tbResCalcCost: row.tbResCalcCost || String(row.tbCost || "0"),
      tbResCalcWdays: row.tbResCalcWdays || "5",
      tbResCalcName: row.tbResCalcName || "weekly",
      tbResCalcWeek: row.tbResCalcWeek || row.tbStart || "",
      tbResCalcMonday: row.tbResCalcMonday || row.tbStart || "",
      tbResCalcFriday: row.tbResCalcFriday || row.tbFinish || "",
      tbResCalcWeekNo: row.tbResCalcWeekNo || weekNo,
      apStatusDate: row.apStatusDate || "",
      tbMDLocation: row.tbMDLocation || "",
      tbMDNameShort: row.tbMDNameShort || "",
      tbMDDepartment: row.tbMDDepartment || "",
      tbMDPrimaryRole: row.tbMDPrimaryRole || "",
      tbMDPrimarySkill: row.tbMDPrimarySkill || "",
      tbResCalcCustomerID: row.tbResCalcCustomerID || "",
    };
  });

  await updateDashboardSource(dashboardSource.id, { tbrescalcs2: resCalcs }, token);

  return {
    success: true,
    resCalcsCount: resCalcs.length,
    message: `Preprocessed ${resCalcs.length} resource calculations from ${allocationRows.length} Allocation rows in tbmdjoined`,
  };
}
