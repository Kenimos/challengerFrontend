import React, { useState } from "react";
import IconPicker from "../../../shared/components/IconPicker";
import LucideIcon from "../../../shared/components/LucideIcon";
import type { Activity } from "../types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

type Props = {
    activity: Activity;
    onClose: () => void;
    onSaved: (a: Activity) => void; // <<< přesný typ
};

export default function ActivityEditModal({ activity, onClose, onSaved }: Props) {
    const [name, setName] = useState(activity.name);
    const [desc, setDesc] = useState(activity.description ?? "");
    const [icon, setIcon] = useState<string | null>(activity.icon ?? null);
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("auth_token");

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const res = await fetch(`${API}/activities/update/${activity.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, description: desc, icon }),
        });

        setSaving(false);
        if (!res.ok) return;

        const updated: Activity = { ...activity, name, description: desc, icon };
        onSaved(updated);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <form
                onSubmit={save}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[420px] rounded-2xl bg-white p-4 space-y-3"
            >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <LucideIcon name={icon ?? undefined} /> Edit Activity
                </h3>

                <input
                    className="w-full h-11 rounded-xl bg-slate-50 px-3 ring-1 ring-slate-200 focus:ring-2 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    className="w-full min-h-20 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 focus:ring-2 outline-none"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

                <div>
                    <div className="text-sm font-medium text-slate-600 mb-1">Icon</div>
                    <IconPicker value={icon} onChange={setIcon} />
                </div>

                <div className="flex gap-2 pt-3">
                    <button type="button" onClick={onClose} className="h-11 flex-1 rounded-full ring-1 ring-slate-300">
                        Cancel
                    </button>
                    <button disabled={saving} className="h-11 flex-1 rounded-full bg-neutral-900 text-white">
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}
