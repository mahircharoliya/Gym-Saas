"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Plus,
  ClipboardList,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  QrCode,
} from "lucide-react";

import QRModal from "@/components/ui/QRModal";

interface Waiver {
  id: string;
  title: string;
}
interface Product {
  id: string;
  name: string;
}
interface SignupForm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  productIds: string[];
  waivers: { waiver: Waiver }[];
}

export default function FormsPage() {
  const { token } = useAuth();
  const [forms, setForms] = useState<SignupForm[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SignupForm | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedWaivers, setSelectedWaivers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrForm, setQrForm] = useState<{ slug: string; name: string } | null>(
    null,
  );

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    const [f, w, p] = await Promise.all([
      fetch("/api/forms", { headers }).then((r) => r.json()),
      fetch("/api/waivers", { headers }).then((r) => r.json()),
      fetch("/api/products", { headers }).then((r) => r.json()),
    ]);
    if (f.success) setForms(f.data);
    if (w.success) setWaivers(w.data);
    if (p.success) setProducts(p.data);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setSelectedProducts([]);
    setSelectedWaivers([]);
    setError("");
    setCreating(true);
  }

  function openEdit(f: SignupForm) {
    setEditing(f);
    setName(f.name);
    setDescription(f.description ?? "");
    setSelectedProducts(f.productIds);
    setSelectedWaivers(f.waivers.map((fw) => fw.waiver.id));
    setError("");
    setCreating(true);
  }

  function toggleItem(
    id: string,
    list: string[],
    setList: (v: string[]) => void,
  ) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function save() {
    setError("");
    if (!name) return setError("Form name is required.");
    setLoading(true);
    try {
      const url = editing ? `/api/forms/${editing.id}` : "/api/forms";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          productIds: selectedProducts,
          waiverIds: selectedWaivers,
        }),
      });
      const json = await res.json();
      if (!res.ok) return setError(json.error);
      setCreating(false);
      fetchAll();
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(f: SignupForm) {
    await fetch(`/api/forms/${f.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !f.isActive }),
    });
    fetchAll();
  }

  async function deleteForm(id: string) {
    if (!confirm("Delete this form?")) return;
    await fetch(`/api/forms/${id}`, { method: "DELETE", headers });
    fetchAll();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (creating) {
    return (
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {editing ? "Edit Form" : "New Signup Form"}
          </h2>
          <button
            onClick={() => setCreating(false)}
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Input
          label="Form Name"
          placeholder="New Member Signup"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description shown to members..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Products */}
        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">
            Products to offer
          </p>
          <div className="space-y-2">
            {products.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(p.id)}
                  onChange={() =>
                    toggleItem(p.id, selectedProducts, setSelectedProducts)
                  }
                  className="accent-indigo-500"
                />
                <span className="text-sm text-gray-300">{p.name}</span>
              </label>
            ))}
            {products.length === 0 && (
              <p className="text-xs text-gray-500">
                No products yet. Create products first.
              </p>
            )}
          </div>
        </div>

        {/* Waivers */}
        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">
            Waivers to include
          </p>
          <div className="space-y-2">
            {waivers.map((w) => (
              <label
                key={w.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedWaivers.includes(w.id)}
                  onChange={() =>
                    toggleItem(w.id, selectedWaivers, setSelectedWaivers)
                  }
                  className="accent-indigo-500"
                />
                <span className="text-sm text-gray-300">{w.title}</span>
              </label>
            ))}
            {waivers.length === 0 && (
              <p className="text-xs text-gray-500">No waivers yet.</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => setCreating(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={save} loading={loading} className="flex-1">
            {editing ? "Save Changes" : "Create Form"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Signup Forms</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Create forms with products and waivers.
          </p>
        </div>
        <Button onClick={openCreate} className="w-auto gap-2 px-4">
          <Plus size={15} /> New Form
        </Button>
      </div>

      {/* Filter + Sort bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms…"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as typeof filterStatus)
          }
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <ClipboardList size={32} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400">No signup forms yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms
            .filter((f) => {
              if (filterStatus === "active" && !f.isActive) return false;
              if (filterStatus === "inactive" && f.isActive) return false;
              if (
                search &&
                !f.name.toLowerCase().includes(search.toLowerCase())
              )
                return false;
              return true;
            })
            .sort((a, b) => {
              if (sortBy === "name") return a.name.localeCompare(b.name);
              return 0; // newest/oldest handled by API order
            })
            .map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{f.name}</p>
                    {f.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {f.description}
                      </p>
                    )}
                    <p className="text-xs text-indigo-400 mt-1 font-mono truncate">
                      {appUrl}/join/{f.slug}
                    </p>
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                      <span>
                        {f.productIds.length} product
                        {f.productIds.length !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {f.waivers.length} waiver
                        {f.waivers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggleActive(f)}
                      title={f.isActive ? "Deactivate" : "Activate"}
                      className={
                        f.isActive ? "text-emerald-400" : "text-gray-600"
                      }
                    >
                      {f.isActive ? (
                        <ToggleRight size={22} />
                      ) : (
                        <ToggleLeft size={22} />
                      )}
                    </button>
                    <button
                      onClick={() => setQrForm({ slug: f.slug, name: f.name })}
                      className="text-gray-400 hover:text-indigo-400 transition-colors"
                      title="QR Code"
                    >
                      <QrCode size={15} />
                    </button>
                    <button
                      onClick={() => openEdit(f)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteForm(f.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {qrForm && (
        <QRModal
          url={`${appUrl}/join/${qrForm.slug}`}
          title={qrForm.name}
          onClose={() => setQrForm(null)}
        />
      )}
    </div>
  );
}
