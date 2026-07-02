// Pubset (timebars collection) readers, ported from pubsets/page.jsx and
// pubsets/consolidated/page.jsx onto the shared fetch wrappers. Server-side only.
import { strapiGet, strapiList, strapiUpdate } from "./strapi";

// All pubsets (with the owning user populated), flattened. Empty pubsets (null
// `tb`) are filtered out. RBAC filtering happens in the API route via
// filterPubsetsByAccess — this returns the raw accessible-by-token set.
export async function getAllPubsets(token) {
  const data = await strapiList("/timebars?populate=users_permissions_user", token);
  return data
    .filter((item) => item.attributes.tb !== null)
    .map((item) => {
      const a = item.attributes;
      return {
        id: item.id,
        name: a.name || "Untitled",
        owner: a.owner || "N/A",
        customer_id: a.Customer_id || null,
        published_date: a.publishedAt || a.createdAt,
        users_permissions_user:
          a.users_permissions_user?.data?.attributes?.email ||
          a.users_permissions_user?.data?.attributes?.username ||
          "N/A",
        isActive: a.isActive,
        grant_pm_access_to: a.grant_pm_access_to || "",
        grant_tm_access_to: a.grant_tm_access_to || "",
        tbmdjoined: a.tbmdjoined || null,
        source_product: a.source_product || null,
        source_product_version: a.source_product_version || null,
        aggregation_level: a.aggregation_level || null,
        publish_status: a.publish_status || null,
        division: a.division || null,
        cost_center: a.cost_center || null,
        geographic_region: a.geographic_region || null,
        source_file_name: a.source_file_name || null,
        source_file_version: a.source_file_version || null,
      };
    });
}

// The active pubset for a customer + product (e.g. the one active "Costbars"
// pubset). A customer has a single active pubset per product, so this returns
// the first match (or null). RBAC (hasAccessToPubset) is enforced by the caller.
export async function getActivePubsetForProduct(customerId, product, token) {
  const data = await strapiList(
    `/timebars?filters[Customer_id][$eq]=${encodeURIComponent(customerId)}` +
      `&filters[source_product][$eq]=${encodeURIComponent(product)}` +
      `&filters[isActive][$eq]=true`,
    token
  );
  const item = data.find((p) => p.attributes.tb !== null) || data[0];
  if (!item) return null;
  const a = item.attributes;
  return {
    id: item.id,
    name: a.name || "Untitled",
    owner: a.owner || "N/A",
    customer_id: a.Customer_id || null,
    isActive: a.isActive,
    source_product: a.source_product || null,
    published_date: a.published_date || a.publishedAt || a.createdAt || null,
    grant_pm_access_to: a.grant_pm_access_to || "",
    grant_tm_access_to: a.grant_tm_access_to || "",
    tbmdjoined: a.tbmdjoined || null,
  };
}

// Access info for the Manage Access editor: the current grant lists plus the
// candidate resources (name + email) drawn from the pubset's resource pool.
// Resources without an email are dropped (RBAC keys on email). `customer_id`
// and `owner` are returned so the caller can run RBAC before exposing this.
export async function getPubsetAccess(id, token) {
  const json = await strapiGet(
    `/timebars/${id}?fields[0]=name&fields[1]=owner&fields[2]=Customer_id` +
      `&fields[3]=grant_pm_access_to&fields[4]=grant_tm_access_to&fields[5]=tbresources`,
    token
  );
  const item = json?.data;
  if (!item) return null;
  const a = item.attributes;

  const seen = new Set();
  const resources = [];
  for (const r of Array.isArray(a.tbresources) ? a.tbresources : []) {
    const email = (r.tbResEmail || "").trim();
    if (!email) continue; // ignore resources with no email
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    resources.push({ name: r.tbResName || email, email });
  }

  return {
    id: item.id,
    name: a.name || "Untitled",
    owner: a.owner || "N/A",
    customer_id: a.Customer_id || null,
    grant_pm_access_to: a.grant_pm_access_to || "",
    grant_tm_access_to: a.grant_tm_access_to || "",
    resources,
  };
}

// Privileged write: update only the access grant fields on a pubset. Caller is
// responsible for RBAC (canManagePubsetAccess) and passing the admin token.
export async function updatePubsetGrants(id, { grant_pm_access_to, grant_tm_access_to }, token) {
  return strapiUpdate(`/timebars/${id}`, { grant_pm_access_to, grant_tm_access_to }, token);
}

// One pubset by id, with the data needed for the single-pubset report view.
export async function getPubsetById(id, token) {
  const json = await strapiGet(
    `/timebars/${id}?fields[0]=name&fields[1]=owner&fields[2]=tbmdjoined&fields[3]=Customer_id&fields[4]=grant_pm_access_to&fields[5]=grant_tm_access_to`,
    token
  );
  const item = json?.data;
  if (!item) return null;
  const a = item.attributes;
  return {
    id: item.id,
    name: a.name || "Untitled",
    owner: a.owner || "N/A",
    customer_id: a.Customer_id || null,
    grant_pm_access_to: a.grant_pm_access_to || "",
    grant_tm_access_to: a.grant_tm_access_to || "",
    tbmdjoined: a.tbmdjoined || null,
  };
}

// Multiple pubsets by id (for the consolidated/review flow), with the full set
// of fields needed to build a dashboard source.
export async function getPubsetsByIds(ids, token) {
  const idArray = ids.split(",").map((s) => s.trim()).filter(Boolean);
  if (idArray.length === 0) return [];

  const fields =
    "fields[0]=name&fields[1]=owner&fields[2]=tbmdjoined&fields[3]=source_product&fields[4]=publish_status&fields[5]=aggregation_level&fields[6]=division&fields[7]=cost_center&fields[8]=geographic_region&fields[9]=tbresources&fields[10]=tbtags&fields[11]=tbcharts&fields[12]=Customer_id&fields[13]=grant_pm_access_to&fields[14]=grant_tm_access_to";

  const results = await Promise.all(
    idArray.map((id) =>
      strapiGet(`/timebars/${id}?${fields}`, token).catch(() => null)
    )
  );

  const pubsets = [];
  for (const json of results) {
    const item = json?.data;
    if (!item) continue;
    const a = item.attributes;
    pubsets.push({
      id: item.id,
      name: a.name || "Untitled",
      owner: a.owner || "N/A",
      customer_id: a.Customer_id || null,
      grant_pm_access_to: a.grant_pm_access_to || "",
      grant_tm_access_to: a.grant_tm_access_to || "",
      tbmdjoined: a.tbmdjoined || null,
      tbresources: a.tbresources || null,
      tbtags: a.tbtags || null,
      tbcharts: a.tbcharts || null,
      source_product: a.source_product || null,
      publish_status: a.publish_status || null,
      aggregation_level: a.aggregation_level || null,
      division: a.division || null,
      cost_center: a.cost_center || null,
      geographic_region: a.geographic_region || null,
    });
  }
  return pubsets;
}
