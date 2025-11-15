import React, { useState } from "react";
import IconPicker from "../../../shared/components/IconPicker";
import type { Activity } from "../types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

type Props = {
    challengeId: string;
    onClose: () => void;
    onCreated: (a: Activity) => void;
};

const DAYS = [
    { label: "Mon", bit: 1 },
    { label: "Tue", bit: 2 },
    { label: "Wed", bit: 4 },
    { label: "Thu", bit: 8 },
    { label: "Fri", bit: 16 },
    { label: "Sat", bit: 32 },
    { label: "Sun", bit: 64 },
];

export default function ActivityCreateModal({ challengeId, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [icon, setIcon] = useState<string | null>(null);

    const [recurrenceType, setType] = useState<1 | 2>(1);
    const [daysMask, setMask] = useState<number>(0);
    const [intervalWeeks, setWeeks] = useState<number>(1);
    const [everyNDays, setEvery] = useState<number>(1);
    const [anchor, setAnchor] = useState<string>(new Date().toISOString().slice(0, 10));

    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("auth_token");

    function toggleDay(bit: number) {
        setMask((m) => (m & bit ? m & ~bit : m | bit));
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const body =
            recurrenceType === 1
                ? {
                    name,
                    description: desc,
                    icon,
                    recurrenceType,
                    daysOfWeekMask: daysMask,
                    intervalWeeks,
                    everyNDays: null,
                    scheduleAnchorDate: anchor,
                }
                : {
                    name,
                    description: desc,
                    icon,
                    recurrenceType,
                    daysOfWeekMask: null,
                    intervalWeeks: null,
                    everyNDays,
                    scheduleAnchorDate: anchor,
                };

        const res = await fetch(`${API}/activities/create/${challengeId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });

        setSaving(false);
        if (!res.ok) return;

        const { id } = await res.json();

        const created: Activity = {
            id,
            name,
            description: desc,
            icon,
            recurrenceType,
            daysOfWeekMask: recurrenceType === 1 ? daysMask : null,
            intervalWeeks: recurrenceType === 1 ? intervalWeeks : null,
            everyNDays: recurrenceType === 2 ? everyNDays : null,
            scheduleAnchorDate: anchor,
        };

        onCreated(created);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <form
                onSubmit={submit}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[420px] rounded-2xl bg-white p-4 space-y-3"
            >
                <h3 className="text-lg font-semibold">Create Activity</h3>

                <input
                    className="w-full h-11 rounded-xl bg-stone-50 px-3 ring-1 ring-stone-200 focus:ring-2 outline-none"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    className="w-full min-h-20 rounded-xl bg-stone-50 px-3 py-2 ring-1 ring-stone-200 focus:ring-2 outline-none"
                    placeholder="Description (optional)"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

                <div>
                    <div className="text-sm font-medium text-stone-600 mb-1">Choose Icon</div>
                    <IconPicker value={icon} onChange={setIcon} />
                </div>

                <div className="flex gap-2 text-sm">
                    <button
                        type="button"
                        onClick={() => setType(1)}
                        className={`px-3 h-9 rounded-full ring-1 ${
                            recurrenceType === 1 ? "bg-stone-900 text-white ring-stone-900" : "ring-stone-300"
                        }`}
                    >
                        Days of week
                    </button>
                    <button
                        type="button"
                        onClick={() => setType(2)}
                        className={`px-3 h-9 rounded-full ring-1 ${
                            recurrenceType === 2 ? "bg-stone-900 text-white ring-stone-900" : "ring-stone-300"
                        }`}
                    >
                        Every N days
                    </button>
                </div>

                {recurrenceType === 1 ? (
                    <>
                        <div className="flex gap-2 flex-wrap">
                            {DAYS.map((d) => (
                                <button
                                    key={d.bit}
                                    type="button"
                                    onClick={() => toggleDay(d.bit)}
                                    className={`h-9 px-2 rounded-full text-sm ring-1 ${
                                        daysMask & d.bit ? "bg-stone-900 text-white ring-stone-900" : "ring-stone-300"
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                        <label className="text-sm text-stone-600 flex items-center gap-2">
                            Interval weeks:
                            <input
                                type="number"
                                min={1}
                                className="w-16 h-9 rounded-lg ring-1 ring-stone-300 px-2"
                                value={intervalWeeks}
                                onChange={(e) => setWeeks(parseInt(e.target.value || "1"))}
                            />
                        </label>
                    </>
                ) : (
                    <label className="text-sm text-stone-600 flex items-center gap-2">
                        Every N days:
                        <input
                            type="number"
                            min={1}
                            className="w-20 h-9 rounded-lg ring-1 ring-stone-300 px-2"
                            value={everyNDays}
                            onChange={(e) => setEvery(parseInt(e.target.value || "1"))}
                        />
                    </label>
                )}

                <label className="text-sm text-stone-600 flex items-center gap-2">
                    Anchor date:
                    <input
                        type="date"
                        className="h-9 rounded-lg ring-1 ring-stone-300 px-2"
                        value={anchor}
                        onChange={(e) => setAnchor(e.target.value)}
                    />
                </label>

                <div className="flex gap-2 pt-3">
                    <button type="button" onClick={onClose} className="h-11 flex-1 rounded-full ring-1 ring-stone-300">
                        Cancel
                    </button>
                    <button disabled={saving} className="h-11 flex-1 rounded-full bg-[#353535] text-white">
                        {saving ? "Saving…" : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}
