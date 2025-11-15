import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import FriendListModal from "../components/FriendListModal";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

type Member = { id: string; displayName?: string; email?: string };
type ChallengeDetail = {
    id: string;
    name: string;
    description?: string;
    startDate: string; // "YYYY-MM-DD"
    endDate: string;   // "YYYY-MM-DD"
    members?: Member[];
};

type Activity = {
    id: string;
    name: string;
    icon?: string;
    recurrenceType?: number; // 1=weekly, 2=every N days
    daysOfWeekMask?: number | null;
    intervalWeeks?: number | null;
    everyNDays?: number | null;
    scheduleAnchorDate?: string | null; // "YYYY-MM-DD"
    startDate?: string | null;
    endDate?: string | null;
};

// ---------- helpers ----------
function dayBitFromISO(iso: string) {
    const d = new Date(iso);
    const jsDay = d.getDay(); // 0..6 (0=Sun)
    const index = (jsDay + 6) % 7; // 0=Mon..6=Sun
    return 1 << index;
}
function weekIndexUTC(iso: string) {
    const d = new Date(iso + "T00:00:00Z");
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const days = Math.floor((+d - +yearStart) / 86400000);
    return Math.floor((days + ((yearStart.getUTCDay() + 6) % 7)) / 7);
}
function sameWeekModulo(anchorISO: string, iso: string, intervalWeeks = 1) {
    const a = weekIndexUTC(anchorISO);
    const b = weekIndexUTC(iso);
    return ((b - a) % intervalWeeks + intervalWeeks) % intervalWeeks === 0;
}
function isScheduled(a: Activity, iso: string) {
    if (!a || !iso) return false;
    if (!a.recurrenceType) return true;
    if (a.recurrenceType === 1) {
        if (!a.daysOfWeekMask) return true;
        const bit = dayBitFromISO(iso);
        if ((a.daysOfWeekMask & bit) === 0) return false;
        const iv = a.intervalWeeks ?? 1;
        const anchor = a.scheduleAnchorDate ?? iso;
        return sameWeekModulo(anchor, iso, iv);
    } else if (a.recurrenceType === 2) {
        const n = a.everyNDays ?? 1;
        const anchor = a.scheduleAnchorDate ?? iso;
        const start = new Date(anchor + "T00:00:00Z");
        const target = new Date(iso + "T00:00:00Z");
        const diffDays = Math.round((+target - +start) / 86400000);
        return diffDays >= 0 && diffDays % n === 0;
    }
    return true;
}
function clampRange(startISO: string, endISO: string, limitDays = 42) {
    const end = new Date(endISO + "T00:00:00Z"); // inclusive
    const start = new Date(startISO + "T00:00:00Z");
    const days = Math.floor((+end - +start) / 86400000) + 1;
    if (days <= limitDays) return { from: startISO, to: endISO };

    const to = endISO;
    const fromDate = new Date(+end - (limitDays - 1) * 86400000);
    const fromISO = fromDate.toISOString().slice(0, 10);
    return { from: fromISO < startISO ? startISO : fromISO, to };
}

// ---------- background ----------
function PageBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div
                className="absolute inset-0 bg-[length:200%_200%] animate-[bg-pan_16s_ease-in-out_infinite]"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 25%, #fbc2eb 75%, #a6c1ee 100%)",
                }}
            />
            <div className="absolute top-[8%] left-[12%]  w-[380px] h-[380px]  bg-[#8EC5FC]  rounded-full blur-[20px]  opacity-55 animate-[blob-a_5s_ease-in-out_infinite]" />
            <div className="absolute top-[55%] left-[55%] w-[440px] h-[440px] bg-[#E0C3FC]  rounded-full blur-[20px] opacity-50 animate-[blob-b_8s_ease-in-out_infinite]" />
            <div className="absolute top-[30%] left-[72%] w-[320px] h-[320px] bg-[#FAD0FE] rounded-full blur-[20px]  opacity-50 animate-[blob-c_6s_ease-in-out_infinite]" />
            <div className="absolute top-[70%] left-[10%] w-[360px] h-[360px] bg-[#b8e1ff] rounded-full blur-[20px]  opacity-45 animate-[blob-d_4s_ease-in-out_infinite]" />
            <div className="absolute top-[-6%] left-[62%] w-[300px] h-[300px] bg-[#d3bdfc] rounded-full blur-[20px]  opacity-50 animate-[blob-e_7s_ease-in-out_infinite]" />
            <style>{`
        @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes blob-a { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(80px,-50px) scale(1.18) } }
        @keyframes blob-b { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(-100px,60px) scale(1.16) } }
        @keyframes blob-c { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(60px,70px)  scale(1.22) } }
        @keyframes blob-d { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(90px,-40px) scale(1.15) } }
        @keyframes blob-e { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(-70px,40px) scale(1.2) } }
        @media (prefers-reduced-motion: reduce) {
          .animate-[bg-pan_16s_ease-in-out_infinite],
          .animate-[blob-a_5s_ease-in-out_infinite],
          .animate-[blob-b_8s_ease-in-out_infinite],
          .animate-[blob-c_6s_ease-in-out_infinite],
          .animate-[blob-d_4s_ease-in-out_infinite],
          .animate-[blob-e_7s_ease-in-out_infinite] { animation: none !important; }
        }
      `}</style>
        </div>
    );
}

// ---------- page ----------
export default function ProfilePage() {
    const { userId } = useParams();
    const [sp] = useSearchParams();
    const nav = useNavigate();

    const challengeId = sp.get("challengeId");

    const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [, setLoading] = useState(true);
    const [progress, setProgress] = useState<Record<string, { done: number; total: number }>>({});
    const [friendsOpen, setFriendsOpen] = useState(false);

    // load challenge + activities
    useEffect(() => {
        let aborted = false;

        if (!challengeId) {
            setChallenge(null);
            setActivities([]);
            setLoading(false);
            return () => {
                aborted = true;
            };
        }

        (async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("auth_token") ?? "";
                const headers: Record<string, string> = {};
                if (token) headers.Authorization = `Bearer ${token}`;

                const chRes = await fetch(
                    `${API}/challenges/GetChallengeById/${encodeURIComponent(challengeId)}`,
                    { headers }
                );
                if (!chRes.ok) throw new Error("Challenge not found");
                const ch = await chRes.json();
                if (!aborted) setChallenge(ch);

                const actsRes = await fetch(
                    `${API}/activities/list/${encodeURIComponent(challengeId)}`,
                    { headers }
                );
                if (!actsRes.ok) throw new Error("Activities load failed");
                const acts = await actsRes.json();
                if (!aborted) setActivities(acts);
            } catch (e) {
                console.error(e);
                if (!aborted) {
                    setChallenge(null);
                    setActivities([]);
                }
            } finally {
                if (!aborted) setLoading(false);
            }
        })();

        return () => {
            aborted = true;
        };
    }, [challengeId]);

    const range = useMemo(() => {
        if (!challenge) return null;
        const startISO = String(challenge.startDate).slice(0, 10);
        const endISO = String(challenge.endDate).slice(0, 10);
        return clampRange(startISO, endISO, 42);
    }, [challenge]);

    // precompute days in range
    const days: string[] = useMemo(() => {
        if (!range) return [];
        const start = new Date(range.from + "T00:00:00Z");
        const end = new Date(range.to + "T00:00:00Z");
        const out: string[] = [];
        for (let t = +start; t <= +end; t += 86400000) {
            out.push(new Date(t).toISOString().slice(0, 10));
        }
        return out;
    }, [range]);

    // per-day progress pro userId (pokud je v URL), jinak pro aktuálního uživatele
    useEffect(() => {
        let aborted = false;

        (async () => {
            if (!challenge || activities.length === 0 || days.length === 0) return;

            const token = localStorage.getItem("auth_token") ?? "";
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;

            const map: Record<string, { done: number; total: number }> = {};

            for (const d of days) {
                if (aborted) return;

                const scheduled = activities.filter((a) => isScheduled(a, d));
                const total = scheduled.length;
                let done = 0;

                await Promise.all(
                    scheduled.map(async (a) => {
                        try {
                            const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
                            const r = await fetch(
                                `${API}/activities/${encodeURIComponent(a.id)}/checkins/${d}${query}`,
                                { headers }
                            );
                            if (r.ok) done += 1;
                        } catch {
                            // ignore
                        }
                    })
                );

                map[d] = { done, total };
            }

            if (!aborted) setProgress(map);
        })();

        return () => {
            aborted = true;
        };
    }, [activities, days, challenge, userId]);

    const todayISO = new Date().toISOString().slice(0, 10);
    const monthLabel = useMemo(() => {
        if (!range) return "";
        const d = new Date(range.from + "T12:00:00Z");
        return d.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
        });
    }, [range]);

    return (
        <div className="relative min-h-dvh">
            <PageBackground />

            <div className="relative z-10 flex justify-center">
                <div className="w-full max-w-[520px] min-h-dvh px-4 pt-6 pb-[120px]">
                    {/* header */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => nav(-1)}
                            className="h-10 w-10 grid place-items-center rounded-full bg-white/80 backdrop-blur ring-1 ring-white/70 shadow-sm active:scale-95"
                            aria-label="Back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-black tracking-tight text-[#0f172a] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                                {userId ?? "Profile"}
                            </h1>
                            <p className="text-sm text-[#0f172a]/70">
                                {challenge ? challenge.name : "Challenge"}
                            </p>
                        </div>

                        <button
                            disabled={!challengeId}
                            onClick={() => setFriendsOpen(true)}
                            className="h-10 px-3 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur ring-1 ring-white/70 text-[#0f172a] text-xs font-semibold shadow-sm disabled:opacity-40"
                            title={!challengeId ? "Challenge se ještě načítá…" : "Zobrazit přátele"}
                        >
                            <Users className="w-4 h-4" />
                            Friends
                        </button>
                    </div>

                    {/* range + month pill */}
                    {challenge && range && (
                        <div className="mt-5 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-white/50 backdrop-blur-md ring-1 ring-white/70 border border-white/40 text-[#0f172a] shadow-sm">
                                <span>{range.from}</span>
                                <span className="opacity-60">→</span>
                                <span>{range.to}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-white/25 backdrop-blur-md border border-white/50 text-[#0f172a] shadow-[0_8px_20px_rgba(15,23,42,0.25)]">
                                <span>{monthLabel}</span>
                            </div>
                        </div>
                    )}

                    {/* calendar card – víc glass effect */}
                    <div className="mt-6 rounded-[28px] bg-gradient-to-br from-white/45 via-white/20 to-white/10 backdrop-blur-2xl ring-1 ring-white/70 border border-white/40 shadow-[0_22px_55px_rgba(15,23,42,0.28)] p-4">
                        {/* weekday header */}
                        <div className="mb-3 grid grid-cols-7 gap-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
                                <div
                                    key={w}
                                    className="text-[11px] font-semibold text-[#64748b] text-center tracking-[0.08em] uppercase"
                                >
                                    {w}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {/* spacer */}
                            {(() => {
                                if (!days.length) return null;
                                const first = new Date(days[0]);
                                const js = first.getDay(); // 0=Sun..6=Sat
                                const idx = (js + 6) % 7; // 0=Mon..6=Sun
                                return Array.from({ length: idx }).map((_, i) => (
                                    <div key={`sp-${i}`} />
                                ));
                            })()}

                            {/* day cells */}
                            {days.map((d) => {
                                const p = progress[d];
                                const done = p?.done ?? 0;
                                const total = p?.total ?? 0;
                                const isToday = d === todayISO;

                                let bgClass =
                                    "bg-white/25 hover:bg-white/35 shadow-[0_6px_16px_rgba(15,23,42,0.10)]";
                                let borderClass = "border border-white/70";
                                let textClass = "text-[#0f172a]";
                                let chipBg = "bg-white/60 text-[#0f172a]/70";
                                let chipLabel = total ? `${done}/${total}` : "—";

                                // --- modrá varianta pro dnešní den ---
                                if (isToday) {
                                    bgClass =
                                        "bg-gradient-to-br from-sky-400/90 via-blue-400/85 to-indigo-400/90 hover:brightness-110 shadow-[0_10px_26px_rgba(37,99,235,0.55)]";
                                    borderClass = "border border-blue-300/80";
                                    textClass = "text-white";
                                    chipBg = "bg-white/20 text-white";
                                }

                                // --- ostatní stavy ---
                                else if (total > 0 && done === 0) {
                                    bgClass =
                                        "bg-gradient-to-br from-sky-50/60 via-white/40 to-slate-50/50 hover:from-sky-50/80 hover:to-slate-100/80 shadow-[0_8px_18px_rgba(15,23,42,0.14)]";
                                    borderClass = "border border-sky-100/80";
                                    chipBg = "bg-sky-100/80 text-sky-800/80";
                                } else if (total > 0 && done < total) {
                                    bgClass =
                                        "bg-gradient-to-br from-amber-50/70 via-white/40 to-orange-50/60 hover:from-amber-50/90 hover:to-orange-100/80 shadow-[0_10px_24px_rgba(245,158,11,0.4)]";
                                    borderClass = "border border-amber-100/80";
                                    chipBg = "bg-amber-100/90 text-amber-800/90";
                                } else if (total > 0 && done === total) {
                                    bgClass =
                                        "bg-gradient-to-br from-emerald-400/85 via-emerald-500/90 to-cyan-400/90 hover:brightness-110 shadow-[0_12px_30px_rgba(16,185,129,0.65)]";
                                    borderClass = "border border-emerald-200/80";
                                    textClass = "text-white";
                                    chipBg = "bg-white/25 text-white";
                                    chipLabel = "Done";
                                }

                                const dayNum = new Date(d + "T12:00:00Z").getDate();

                                return (
                                    <div
                                        key={d}
                                        className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-200 ease-out ${bgClass} ${borderClass}`}
                                        title={`${d}: ${done}/${total}`}
                                    >
                                        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-1">
                                            <span className={`text-sm font-extrabold ${textClass}`}>
                                                {dayNum}
                                            </span>

                                                                        <span
                                                                            className={`inline-flex min-w-[38px] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${chipBg}`}
                                                                        >
                                                {chipLabel}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {friendsOpen && challengeId && (
                <FriendListModal
                    challengeId={challengeId}
                    onClose={() => setFriendsOpen(false)}
                />
            )}
        </div>
    );
}
