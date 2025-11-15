import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Flame, Plus, LogOut } from "lucide-react";
import ChallengeCard from "../components/ChallengesCard";
import ChallengeEditModal from "../components/ChallengeEditModal";
import CreateChallengeModal from "../components/CreateChallengeModal";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

type Challenge = {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string | null;
};

function formatHuman(d = new Date()) {
    return d.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/** background: breathing gradient + multiple animated blobs (your current tuning) */
function PageBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* breathing gradient */}
            <div
                className="absolute inset-0 bg-[length:200%_200%] animate-[bg-pan_16s_ease-in-out_infinite]"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 25%, #fbc2eb 75%, #a6c1ee 100%)",
                }}
            />

            {/* blobs */}
            <div className="absolute top-[8%] left-[12%]  w-[380px] h-[380px]  bg-[#8EC5FC]  rounded-full blur-[20px]  opacity-55 animate-[blob-a_5s_ease-in-out_infinite]" />
            <div className="absolute top-[55%] left-[55%] w-[440px] h-[440px] bg-[#E0C3FC]  rounded-full blur-[20px] opacity-50 animate-[blob-b_8s_ease-in-out_infinite]" />
            <div className="absolute top-[30%] left-[72%] w-[320px] h-[320px] bg-[#FAD0FE] rounded-full blur-[20px]  opacity-50 animate-[blob-c_6s_ease-in-out_infinite]" />
            <div className="absolute top-[70%] left-[10%] w-[360px] h-[360px] bg-[#b8e1ff] rounded-full blur-[20px]  opacity-45 animate-[blob-d_4s_ease-in-out_infinite]" />
            <div className="absolute top-[-6%] left-[62%] w-[300px] h-[300px] bg-[#d3bdfc] rounded-full blur-[20px]  opacity-50 animate-[blob-e_7s_ease-in-out_infinite]" />

            <style>{`
        @keyframes bg-pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
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
          .animate-[blob-e_7s_ease-in-out_infinite] { animation: none!important; }
        }
      `}</style>
        </div>
    );
}

export default function ChallengesPage() {
    const [items, setItems] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState<Challenge | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const nav = useNavigate();
    const human = useMemo(() => formatHuman(new Date()), []);

    async function loadChallenges() {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API}/challenges/GetMyChallenges`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load challenges");
        const list: Challenge[] = await res.json();
        setItems(list);
    }

    useEffect(() => {
        (async () => {
            try {
                await loadChallenges();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        // pokud používáš jinou route pro login, změň "/login"
        nav("/login");
    };

    return (
        <div className="relative min-h-dvh">
            <PageBackground />

            <div className="relative z-10 flex justify-center">
                <div className="w-full max-w-[520px] min-h-dvh px-4 pt-10 pb-[140px] relative">
                    {/* LOGOUT BUTTON */}
                    <button
                        onClick={handleLogout}
                        className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-white/75 backdrop-blur ring-1 ring-white/70 text-[#0f172a] active:scale-95"
                    >
                        <LogOut className="w-3 h-3" />
                        Logout
                    </button>

                    {/* HERO */}
                    <header className="text-center">
                        <h1 className="text-4xl font-black tracking-tight text-[#0f172a] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                            Hi, Burn333
                        </h1>
                        <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-white/65 backdrop-blur-md ring-1 ring-white/60 text-[#0f172a]">
                                <CalendarDays className="h-4 w-4" />
                                {human}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-white/55 backdrop-blur ring-1 ring-white/50 text-[#0f172a]">
                                <Flame className="h-4 w-4 text-orange-500" />
                                Streak: 3 days
                            </span>
                        </div>
                    </header>

                    {/* SECTION HEADER */}
                    <div className="mt-8 mb-3 flex items-center justify-between">
                        <h2 className="text-[22px] font-extrabold text-[#0f172a]">Your challenges</h2>
                        {!loading && items.length > 0 && (
                            <span className="rounded-full px-3 py-1 text-sm font-semibold bg-white/65 backdrop-blur ring-1 ring-white/60 text-[#0f172a]">
                                {items.length}
                            </span>
                        )}
                    </div>

                    {/* LIST */}
                    <div className="space-y-4">
                        {loading && (
                            <div className="rounded-3xl p-4 bg-white/60 backdrop-blur ring-1 ring-white/50 shadow-sm">
                                <p className="text-[#334155]">Loading…</p>
                            </div>
                        )}
                        {!loading && items.length === 0 && (
                            <div className="rounded-3xl p-5 bg-white/65 backdrop-blur ring-1 ring-white/55 shadow-sm">
                                <div className="font-semibold mb-1 text-[#0f172a]">No challenges yet</div>
                                <div className="text-[#334155] text-sm">
                                    Tap the + button below to create your first one.
                                </div>
                            </div>
                        )}
                        {items.map((c) => (
                            <ChallengeCard
                                key={c.id}
                                name={c.name}
                                description={c.description}
                                startDate={c.startDate}
                                endDate={c.endDate ?? undefined}
                                onOpen={() => nav(`/challenges/${c.id}`)}
                                onEdit={() => setEditTarget(c)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating small Add button (center bottom) */}
            <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-20">
                <button
                    onClick={() => setCreateOpen(true)}
                    className="h-14 w-14 rounded-full bg-[#0f172a] text-white flex items-center justify-center active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                    aria-label="Create challenge"
                >
                    <Plus size={26} />
                </button>
            </div>

            {/* Modals */}
            {createOpen && (
                <CreateChallengeModal
                    onClose={() => setCreateOpen(false)}
                    onCreated={(c) => setItems((arr) => [c, ...arr])}
                />
            )}

            {editTarget && (
                <ChallengeEditModal
                    challenge={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={async (updated) => {
                        setItems((arr) => arr.map((x) => (x.id === updated.id ? updated : x)));
                        setEditTarget(null);
                    }}
                    onDeleted={async (deletedId) => {
                        setItems((arr) => arr.filter((x) => x.id !== deletedId));
                        setEditTarget(null);
                    }}
                />
            )}
        </div>
    );
}
