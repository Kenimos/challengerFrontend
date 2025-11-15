import * as React from "react";
import LucideIcon from "../../../shared/components/LucideIcon";

export type Friend = { id: string; name: string; avatarUrl?: string | null };

type Props = {
    /** challengeId je potřeba pro načtení členů */
    challengeId?: string | null;
    onClose: () => void;
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

export default function FriendListModal({ challengeId, onClose }: Props) {
    const [q, setQ] = React.useState("");
    const [items, setItems] = React.useState<Friend[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let aborted = false;

        // Guard – bez ID nevolej API
        if (!challengeId) {
            setItems([]);
            setLoading(false);
            setError("Chybí challengeId — zavři okno a otevři ho až po načtení výzvy.");
            return () => { aborted = true; };
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("auth_token") ?? "";
                const headers: Record<string, string> = {};
                if (token) headers.Authorization = `Bearer ${token}`;

                const res = await fetch(
                    `${API}/challenges/GetChallengeById/${encodeURIComponent(challengeId)}`,
                    { headers }
                );

                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(`Failed to load members (${res.status}) ${text}`);
                }

                const data = await res.json();
                // BE DTO: ChallengeDetailDto → { members: [ { id, email, displayName } ] }
                const members: Friend[] = (data?.members ?? []).map((m: any) => ({
                    id: String(m.id),
                    name: m.displayName || m.email || "Unknown",
                    avatarUrl: null,
                }));

                if (!aborted) setItems(members);
            } catch (e: any) {
                console.error(e);
                if (!aborted) {
                    setItems([]);
                    setError(e?.message || "Nepodařilo se načíst členy.");
                }
            } finally {
                if (!aborted) setLoading(false);
            }
        })();

        return () => { aborted = true; };
    }, [challengeId]);

    const filtered = React.useMemo(() => {
        const norm = q.trim().toLowerCase();
        if (!norm) return items;
        return items.filter((x) => x.name.toLowerCase().includes(norm));
    }, [q, items]);

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-[92%] max-w-[520px] rounded-3xl p-5
        bg-white/60 backdrop-blur-md ring-1 ring-white/50 shadow-[0_10px_32px_rgba(0,0,0,0.15)]"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[#0f172a]">
                        Friends in this challenge
                    </h3>
                    <button
                        className="p-2 rounded-lg hover:bg-white/60"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <LucideIcon name="X" />
                    </button>
                </div>

                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full h-11 rounded-xl bg-white/70 px-3 ring-1 ring-white/60 focus:ring-2 focus:ring-white/80 outline-none"
                />

                <div className="mt-3 max-h=[55vh] overflow-auto space-y-2">
                    {loading && <div className="text-sm text-slate-600 px-1">Loading…</div>}
                    {!loading && error && (
                        <div className="text-sm text-rose-700 px-1">{error}</div>
                    )}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="text-sm text-slate-600 px-1">
                            No friends found in this challenge.
                        </div>
                    )}
                    {!loading && !error && filtered.map((f) => (
                        <a
                            key={f.id}
                            href={`/users/${f.id}?challengeId=${encodeURIComponent(challengeId ?? "")}`}
                            className="flex items-center gap-3 p-2 rounded-xl bg-white/55 backdrop-blur ring-1 ring-white/60 hover:bg-white/70 transition"
                        >
                            <div className="w-9 h-9 rounded-full bg-[#0f172a]/10 grid place-items-center text-[#0f172a] font-semibold">
                                <span className="text-sm">{f.name.slice(0, 1).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-[#0f172a]">{f.name}</div>
                                <div className="text-xs text-[#0f172a]/60">Tap to view progress</div>
                            </div>
                            <div className="h-9 px-3 rounded-full bg-[#0f172a] text-white text-sm grid place-items-center">
                                View
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
