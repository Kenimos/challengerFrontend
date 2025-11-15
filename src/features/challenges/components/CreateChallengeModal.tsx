import { useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

export type CreatedChallenge = {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string | null;
};

export default function CreateChallengeModal({
                                                 onClose,
                                                 onCreated,
                                             }: {
    onClose: () => void;
    onCreated: (c: CreatedChallenge) => void;
}) {
    const [name, setName] = useState("");
    const [description, setDesc] = useState("");
    const [startDate, setStart] = useState<string>(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [endDate, setEnd] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setErr("Please enter a name");
            return;
        }
        setErr(""); setLoading(true);
        try {
            const token = localStorage.getItem("auth_token");
            // 👇 uprav endpoint podle svého backendu, pokud se liší
            const res = await fetch(`${API}/challenges/CreateChallenge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    startDate,
                    endDate: endDate || null,
                }),
            });
            if (!res.ok) throw new Error("Create failed");
            const created: CreatedChallenge = await res.json();
            onCreated(created);
            onClose();
        } catch (e: any) {
            setErr(e.message || "Create failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50">
            {/* backdrop */}
            <button
                aria-label="Close"
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* dialog */}
            <div className="absolute left-1/2 top-1/2 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 px-4">
                <div className="rounded-3xl p-5 bg-white/80 backdrop-blur-md ring-1 ring-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                    <h3 className="text-xl font-extrabold text-[#0f172a]">Create challenge</h3>

                    <form onSubmit={submit} className="mt-3 space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-[#0f172a]">Name</span>
                            <input
                                className="mt-1 w-full h-11 rounded-xl bg-white/85 backdrop-blur px-3 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#0f172a] placeholder:text-[#0f172a]/40"
                                placeholder="30-day push-ups"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-[#0f172a]">Description (optional)</span>
                            <input
                                className="mt-1 w-full h-11 rounded-xl bg-white/85 backdrop-blur px-3 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#0f172a] placeholder:text-[#0f172a]/40"
                                placeholder="Short motivation or rules"
                                value={description}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-[#0f172a]">Start</span>
                                <input
                                    type="date"
                                    className="mt-1 w-full h-11 rounded-xl bg-white/85 backdrop-blur px-3 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#0f172a]"
                                    value={startDate}
                                    onChange={(e) => setStart(e.target.value)}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-[#0f172a]">End (optional)</span>
                                <input
                                    type="date"
                                    className="mt-1 w-full h-11 rounded-xl bg-white/85 backdrop-blur px-3 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#0f172a]"
                                    value={endDate}
                                    onChange={(e) => setEnd(e.target.value)}
                                />
                            </label>
                        </div>

                        {err && <p className="text-red-600 text-sm">{err}</p>}

                        <div className="mt-1 flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-11 px-4 rounded-xl bg-white/70 ring-1 ring-black/10 text-[#0f172a] font-medium active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                className="h-11 px-4 rounded-xl bg-[#0f172a] text-white font-semibold active:scale-95 disabled:opacity-60"
                            >
                                {loading ? "Creating…" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
