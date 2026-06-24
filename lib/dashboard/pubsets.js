// Pubset (timebars collection) readers, ported from pubsets/page.jsx and
// pubsets/consolidated/page.jsx onto the shared fetch wrappers. Server-side only.
import { strapiGet, strapiList } from "./strapi";

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
