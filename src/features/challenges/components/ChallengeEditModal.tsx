import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

export type Challenge = {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string | null;
};

type Props = {
    challenge: Challenge;
    onClose: () => void;
    onSaved: (updated: Challenge) => void;
    onDeleted: (id: string) => void;
};

export default function ChallengeEditModal({
                                               challenge,
                                               onClose,
                                               onSaved,
                                               onDeleted,
                                           }: Props) {
    const [name, setName] = useState(challenge.name);
    const [desc, setDesc] = useState(challenge.description ?? "");
    const [start, setStart] = useState(challenge.startDate.slice(0, 10));
    const [end, setEnd] = useState(challenge.endDate ? challenge.endDate.slice(0, 10) : "");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const token = localStorage.getItem("auth_token") ?? "";

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErrorMsg("");
        try {
            // 🔑 Swagger říká: jen name + description
            const body = { name, description: desc };

            const res = await fetch(`${API}/challenges/UpdateChallenge/${challenge.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const raw = await res.text().catch(() => "");
                console.error("Update failed:", res.status, raw);
                setErrorMsg(`Update failed (${res.status}).`);
                return;
            }

            // držíme datumy beze změny (tenhle endpoint je neumí měnit)
            onSaved({
                id: challenge.id,
                name,
                description: desc,
                startDate: challenge.startDate,
                endDate: challenge.endDate,
            });
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err?.message || "Update failed.");
        } finally {
            setSaving(false);
        }
    }

    async function delSmart() {
        if (!confirm("Leave or delete this challenge? You will be removed from it.")) return;

        setDeleting(true);
        setErrorMsg("");
        try {
            // 1) nejdřív LEAVE
            const leave = await fetch(`${API}/challenges/LeaveChallenge/${challenge.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (leave.ok) {
                onDeleted(challenge.id);
                return;
            } else {
                const leaveTxt = await leave.text().catch(() => "");
                console.warn("Leave failed:", leave.status, leaveTxt);
            }

            // 2) pak DELETE (typicky owner only)
            const res = await fetch(`${API}/challenges/DeleteChallenge/${challenge.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                console.error("Delete failed:", res.status, txt);
                setErrorMsg(
                    res.status === 500
                        ? "Delete failed (500). You might not be the owner, or the challenge has related data."
                        : `Delete failed (${res.status}).`
                );
                return;
            }

            onDeleted(challenge.id);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err?.message || "Delete failed.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <form
                onSubmit={save}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[92%] max-w-[480px] rounded-2xl bg-white p-4 space-y-3"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Edit challenge</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 w-9 grid place-items-center rounded-full hover:bg-stone-100"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

                <input
                    className="w-full h-11 rounded-xl bg-stone-50 px-3 ring-1 ring-stone-200 focus:ring-2 outline-none"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <textarea
                    className="w-full min-h-20 rounded-xl bg-stone-50 px-3 py-2 ring-1 ring-stone-200 focus:ring-2 outline-none"
                    placeholder="Description"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

                {/* datumy nechávám v UI, ale tenhle endpoint je nemění (neposíláme je) */}
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm text-stone-700">
                        <div className="mb-1">Start date</div>
                        <input
                            type="date"
                            className="w-full h-11 rounded-xl bg-stone-50 px-3 ring-1 ring-stone-200 focus:ring-2 outline-none opacity-60"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            disabled
                            title="Start date cannot be changed here"
                        />
                    </label>
                    <label className="text-sm text-stone-700">
                        <div className="mb-1">End date</div>
                        <input
                            type="date"
                            className="w-full h-11 rounded-xl bg-stone-50 px-3 ring-1 ring-stone-200 focus:ring-2 outline-none opacity-60"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            disabled
                            title="End date cannot be changed here"
                        />
                    </label>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={delSmart}
                        disabled={deleting}
                        className="h-11 px-4 rounded-full bg-red-600 text-white disabled:opacity-60"
                    >
                        {deleting ? "Working…" : "Leave/Delete"}
                    </button>
                    <div className="flex-1" />
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 px-4 rounded-full ring-1 ring-stone-300"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        className="h-11 !px-6 rounded-full bg-[#353535] text-white disabled:opacity-60"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}
