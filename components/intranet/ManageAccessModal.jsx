"use client";

import { useEffect, useState } from "react";

// Administrator-only editor for a pubset's access grants. Candidates come from
// the pubset's resource pool (tbResName / tbResEmail). Emails already granted
// but missing from the pool are still listed so they can be reviewed/removed.
function parseList(value) {
  return (value || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export default function ManageAccessModal({ pubsetId, onClose, onSaved }) {
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [candidates, setCandidates] = useState([]); // [{ name, email, inPool }]
  const [pmSelected, setPmSelected] = useState(() => new Set());
  const [tmSelected, setTmSelected] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/dashboard/pubsets/${pubsetId}/access`);
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok) {
          setError(data.error || "Failed to load access settings.");
          setLoadState("error");
          return;
        }

        const pm = parseList(data.grant_pm_access_to);
        const tm = parseList(data.grant_tm_access_to);

        // Merge resource pool with any granted emails not in the pool.
        const byEmail = new Map();
        for (const r of data.resources || []) {
          byEmail.set(r.email.toLowerCase(), { name: r.name, email: r.email, inPool: true });
        }
        for (const email of [...pm, ...tm]) {
          const key = email.toLowerCase();
          if (!byEmail.has(key)) {
            byEmail.set(key, { name: "(not in resource pool)", email, inPool: false });
          }
        }

        setCandidates([...byEmail.values()].sort((a, b) => a.name.localeCompare(b.name)));
        setPmSelected(new Set(pm.map((e) => e.toLowerCase())));
        setTmSelected(new Set(tm.map((e) => e.toLowerCase())));
        setLoadState("ready");
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoadState("error");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [pubsetId]);

  function toggle(setFn, set, key) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setFn(next);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    // Map the lowercased selection keys back to the original-case emails.
    const emailFor = new Map(candidates.map((c) => [c.email.toLowerCase(), c.email]));
    const pm = [...pmSelected].map((k) => emailFor.get(k) || k);
    const tm = [...tmSelected].map((k) => emailFor.get(k) || k);

    try {
      const res = await fetch(`/api/dashboard/pubsets/${pubsetId}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_pm_access_to: pm.join(", "),
          grant_tm_access_to: tm.join(", "),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save.");
        setSaving(false);
        return;
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#062f57]">Manage Access</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {loadState === "loading" ? (
            <p className="text-sm text-gray-500">Loading resources…</p>
          ) : loadState === "error" ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-gray-600">
              No resources with an email address were found in this pubset.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-gray-600">
                Grant access to people from the resource pool. <strong>PM</strong>{" "}
                requires a Project Manager role; <strong>Team</strong> works for any
                role. Both require the person&rsquo;s customer to match this pubset.
              </p>
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 text-center font-medium">PM</th>
                    <th className="py-2 text-center font-medium">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidates.map((c) => {
                    const key = c.email.toLowerCase();
                    return (
                      <tr key={key}>
                        <td className="py-2 pr-4 text-gray-900">
                          {c.name}
                          {!c.inPool && (
                            <span className="ml-2 text-xs text-amber-600">(not in pool)</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-gray-600">{c.email}</td>
                        <td className="py-2 pr-4 text-center">
                          <input
                            type="checkbox"
                            checked={pmSelected.has(key)}
                            onChange={() => toggle(setPmSelected, pmSelected, key)}
                          />
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={tmSelected.has(key)}
                            onChange={() => toggle(setTmSelected, tmSelected, key)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          {error && loadState === "ready" ? (
            <span className="mr-auto text-sm text-red-600">{error}</span>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loadState !== "ready"}
            className="rounded-md bg-[#0b4d8e] px-4 py-2 text-sm font-medium text-white hover:bg-[#062f57] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
