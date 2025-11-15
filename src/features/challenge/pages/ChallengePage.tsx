import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, Check, Flame } from "lucide-react";
import CalendarStrip from "../../../shared/components/CalendarStrip";
import LucideIcon from "../../../shared/components/LucideIcon";
import ActivityCreateModal from "../components/ActivityCreateModal";
import ActivityEditModal from "../components/ActivityEditModal";
import FriendListModal from "../components/FriendListModal";
import InviteFriendCard from "../components/InviteFriendCard";
import type { Activity, ChallengeDetail } from "../types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

// helpers
function dayBitFromISO(iso: string) {
    const d = new Date(iso);
    const jsDay = d.getDay();
    const index = (jsDay + 6) % 7;
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
function iso(d: string | undefined | null) {
    return d ? d.slice(0, 10) : undefined;
}
function inRange(dayISO: string, startISO?: string, endISO?: string) {
    if (startISO && dayISO < startISO) return false;
    if (endISO && dayISO > endISO) return false;
    return true;
}

/* background */
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
            <div className="absolute top-[8%] left-[12%]  w-[380px] h-[380px]  bg-[#8EC5FC]  rounded-full blur-[25px]  opacity-55 animate-[blob-a_28s_ease-in-out_infinite]" />
            <div className="absolute top-[55%] left-[55%] w-[440px] h-[440px] bg-[#E0C3FC]  rounded-full blur-[25px] opacity-50 animate-[blob-b_32s_ease-in-out_infinite]" />
            <div className="absolute top-[30%] left-[72%] w-[320px] h-[320px] bg-[#FAD0FE] rounded-full blur-[25px]  opacity-50 animate-[blob-c_26s_ease-in-out_infinite]" />
            <div className="absolute top-[70%] left-[10%] w-[360px] h-[360px] bg-[#b8e1ff] rounded-full blur-[25px]  opacity-45 animate-[blob-d_34s_ease-in-out_infinite]" />
            <div className="absolute top-[-6%] left-[62%] w-[300px] h-[300px] bg-[#d3bdfc] rounded-full blur-[25px]  opacity-50 animate-[blob-e_30s_ease-in-out_infinite]" />
            <style>{`
        @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes blob-a { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(80px,-50px) scale(1.18) } }
        @keyframes blob-b { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(-100px,60px) scale(1.16) } }
        @keyframes blob-c { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(60px,70px)  scale(1.22) } }
        @keyframes blob-d { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(90px,-40px) scale(1.15) } }
        @keyframes blob-e { 0%,100%{ transform:translate(0,0)  scale(1) } 50%{ transform:translate(-70px,40px) scale(1.2) } }
      `}</style>
        </div>
    );
}

export default function ChallengePage() {
    const nav = useNavigate();
    const { id: rawId } = useParams<{ id: string }>();
    const challengeId = rawId ?? null;

    const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [checkedByDate, setCheckedByDate] = useState<Record<string, Record<string, boolean>>>({});
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Activity | null>(null);
    const [friendsOpen, setFriendsOpen] = useState(false);
    const [selectedISO, setSelectedISO] = useState(new Date().toISOString().slice(0, 10));

    const prettySelected = useMemo(() => {
        const d = new Date(selectedISO + "T12:00:00Z");
        return d.toLocaleDateString(undefined, {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
    }, [selectedISO]);

    useEffect(() => {
        if (!challengeId) return;
        const token = localStorage.getItem("auth_token") ?? "";
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        (async () => {
            const ch = await fetch(`${API}/challenges/GetChallengeById/${encodeURIComponent(challengeId)}`, { headers });
            if (ch.ok) {
                const c = await ch.json();
                setChallenge(c);
            } else {
                setChallenge(null);
            }

            const acts = await fetch(`${API}/activities/list/${encodeURIComponent(challengeId)}`, { headers });
            if (acts.ok) {
                const list = await acts.json();
                setActivities(list);
            } else {
                setActivities([]);
            }

            const mapForDay: Record<string, boolean> = {};
            await Promise.all(
                (activities as Activity[]).map(async (a) => {
                    try {
                        const r = await fetch(`${API}/activities/${a.id}/checkins/${selectedISO}`, { headers });
                        mapForDay[a.id] = r.ok;
                    } catch {
                        mapForDay[a.id] = false;
                    }
                })
            );
            setCheckedByDate((s) => ({ ...s, [selectedISO]: mapForDay }));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [challengeId, selectedISO]);

    function isChecked(activityId: string, dayISO: string) {
        return !!checkedByDate[dayISO]?.[activityId];
    }
    function setCheckedFor(dayISO: string, activityId: string, value: boolean) {
        setCheckedByDate((s) => ({ ...s, [dayISO]: { ...(s[dayISO] || {}), [activityId]: value } }));
    }

    async function toggle(a: Activity) {
        const token = localStorage.getItem("auth_token") ?? "";
        const next = !isChecked(a.id, selectedISO);
        setCheckedFor(selectedISO, a.id, next);

        try {
            if (next) {
                await fetch(`${API}/activities/${a.id}/checkins`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    body: JSON.stringify({ date: selectedISO }),
                });
            } else {
                await fetch(`${API}/activities/${a.id}/checkins/${selectedISO}`, {
                    method: "DELETE",
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                });
            }
        } catch {
            setCheckedFor(selectedISO, a.id, !next);
        }
    }

    const startISO = iso(challenge?.startDate);
    const endISO = iso(challenge?.endDate);
    const isInRange = inRange(selectedISO, startISO, endISO);
    const visibleActivities = isInRange ? activities.filter((a) => isScheduled(a, selectedISO)) : [];
    const doneCount = visibleActivities.reduce((acc, a) => acc + (isChecked(a.id, selectedISO) ? 1 : 0), 0);
    const leftCount = Math.max(visibleActivities.length - doneCount, 0);

    return (
        <div className="relative min-h-dvh">
            <PageBackground />

            <div className="relative z-10 flex justify-center">
                <div className="w-full max-w-[520px] min-h-dvh px-4 pt-10 pb-[120px]">
                    {/* BACK BUTTON */}
                    <button
                        onClick={() => nav("/challenges")}
                        className="absolute left-5 top-6 z-20 h-10 w-10 grid place-items-center rounded-full bg-white/60 backdrop-blur-md ring-1 ring-black/10 text-[#0f172a] active:scale-95 transition"
                        aria-label="Go back"
                    >
                        <LucideIcon name="ArrowLeft" size={20} />
                    </button>

                    <header className="text-center">
                        <h1 className="text-4xl font-black tracking-tight text-[#0f172a] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                            {challenge?.name ?? "Challenge"}
                        </h1>
                        <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-white/65 backdrop-blur-md ring-1 ring-white/60 text-[#0f172a]">
                <CalendarDays className="h-4 w-4" />
                  {prettySelected}
              </span>
                            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-white/55 backdrop-blur ring-1 ring-white/50 text-[#0f172a]">
                <Flame className="h-4 w-4 text-orange-500" />
                                {doneCount} done / {leftCount} left
              </span>
                        </div>
                    </header>

                    <CalendarStrip selectedISO={selectedISO} onSelect={setSelectedISO} className="mt-4" />

                    <div className="mt-5 space-y-3">
                        {visibleActivities.map((a) => {
                            const checked = isChecked(a.id, selectedISO);
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => toggle(a)}
                                    disabled={!isInRange}
                                    className="w-full flex items-center gap-3"
                                >
                  <span
                      className={[
                          "shrink-0 w-6 h-6 rounded-full grid place-items-center ring-1 transition-all duration-200",
                          checked
                              ? "bg-[#0f172a] ring-[#0f172a] text-white scale-100"
                              : "bg-white/70 ring-[#0f172a]/30 text-[#0f172a]/60 hover:scale-105 hover:ring-[#0f172a]/50",
                      ].join(" ")}
                  >
                    <Check size={14} strokeWidth={3} />
                  </span>

                                    <div
                                        className={[
                                            "flex-1 h-12 px-3 rounded-2xl bg-white/60 backdrop-blur ring-1 ring-white/60 shadow-sm flex items-center justify-between active:scale-[.995] transition",
                                            checked ? "line-through text-stone-500" : "text-[#0f172a]",
                                        ].join(" ")}
                                    >
                    <span className="flex items-center gap-2">
                      <LucideIcon name={a.icon} className="text-[#0f172a]" />
                        {a.name}
                    </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditTarget(a);
                                            }}
                                            className="p-1 rounded-lg hover:bg-white/40 text-[#0f172a]/70"
                                        >
                                            <LucideIcon name="Pencil" size={18} />
                                        </button>
                                    </div>
                                </button>
                            );
                        })}

                        {visibleActivities.length === 0 && (
                            <div className="rounded-3xl p-5 bg-white/60 backdrop-blur ring-1 ring-white/55 shadow-sm text-[#0f172a]/80 text-sm">
                                No activities scheduled for this day.
                            </div>
                        )}
                    </div>

                    <InviteFriendCard
                        challengeId={challengeId ?? ""}
                        onShowFriends={() => setFriendsOpen(true)}
                        imageSrc="/images/share-illustration.png"
                    />

                    {/* Floating Add button */}
                    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-20">
                        <button
                            onClick={() => setShowModal(true)}
                            className="h-14 w-14 rounded-full bg-[#0f172a] text-white flex items-center justify-center active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                            aria-label="Add Activity"
                        >
                            <LucideIcon name="Plus" size={26} />
                        </button>
                    </div>

                    {showModal && challengeId && (
                        <ActivityCreateModal
                            challengeId={challengeId}
                            onClose={() => setShowModal(false)}
                            onCreated={(a) => setActivities((s) => [...s, a])}
                        />
                    )}

                    {editTarget && (
                        <ActivityEditModal
                            activity={editTarget}
                            onClose={() => setEditTarget(null)}
                            onSaved={(updated) =>
                                setActivities((list) => list.map((x) => (x.id === updated.id ? updated : x)))
                            }
                        />
                    )}

                    {/* ✅ Modál s PŘEDANÝM challengeId */}
                    {friendsOpen && challengeId && (
                        <FriendListModal
                            challengeId={challengeId}
                            onClose={() => setFriendsOpen(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
