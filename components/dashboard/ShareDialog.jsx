"use client";

// Ported from migration-staging/sources/_components/ShareDialog.jsx.
// Adapted: org users come from /api/dashboard/users and the grant update goes
// through PUT /api/dashboard/sources/[id] (admin token + RBAC server-side).
import { useState, useEffect } from "react";
import { Share2, Loader2, X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ShareDialog({ source, isOpen, onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sharedEmails, setSharedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/dashboard/users")
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => setUsers((data.users || []).filter((u) => u.email !== source?.owner)))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, source?.owner]);

  useEffect(() => {
    const emails = source?.grant_tm_access_to
      ? source.grant_tm_access_to.split(",").map((e) => e.trim()).filter(Boolean)
      : [];
    setSharedEmails(emails);
  }, [source]);

  const filteredUsers = searchTerm
    ? users.filter((u) =>
        [u.name, u.email, u.role].some((v) => v?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;

  const addUser = (email) => {
    if (!sharedEmails.includes(email)) setSharedEmails([...sharedEmails, email]);
  };
  const removeUser = (email) => setSharedEmails(sharedEmails.filter((e) => e !== email));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/sources/${source.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant_tm_access_to: sharedEmails.join(",") }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save share settings");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || "Failed to save share settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Dashboard Source
          </DialogTitle>
          <DialogDescription>Share &quot;{source?.name}&quot; with other users in your organization</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-auto py-2">
          {sharedEmails.length > 0 && (
            <div>
              <Label>Currently Shared With ({sharedEmails.length})</Label>
              <div className="mt-2 space-y-2">
                {sharedEmails.map((email) => {
                  const u = users.find((x) => x.email === email);
                  return (
                    <div key={email} className="flex items-center justify-between rounded border border-blue-200 bg-blue-50 p-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u?.name || email}</p>
                        <p className="text-xs text-gray-600">{email}</p>
                      </div>
                      <button onClick={() => removeUser(email)} className="rounded p-1 text-red-600 hover:bg-red-100" title="Remove access">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label>Add Users</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or role…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchTerm ? "No users found matching your search" : "No users available"}
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const already = sharedEmails.includes(u.email);
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center justify-between border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50 ${
                        already ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{u.name}</p>
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">{u.role}</span>
                        </div>
                        <p className="text-xs text-gray-600">{u.email}</p>
                      </div>
                      {already ? (
                        <span className="text-xs font-medium text-green-600">Shared</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => addUser(u.email)}>
                          Add
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Share2 className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
