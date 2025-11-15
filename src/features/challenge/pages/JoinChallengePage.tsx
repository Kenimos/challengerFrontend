import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

export default function JoinChallengePage() {
    const { challengeId } = useParams();
    const nav = useNavigate();
    const [msg, setMsg] = useState("Joining the challenge…");

    useEffect(() => {
        (async () => {
            if (!challengeId) {
                setMsg("Invalid link.");
                return;
            }

            const token = localStorage.getItem("auth_token");
            if (!token) {
                // pokud není přihlášen, pošli ho na login s návratem
                const next = encodeURIComponent(`/join/${challengeId}`);
                nav(`/login?next=${next}`, { replace: true });
                return;
            }

            try {
                const res = await fetch(`${API}/challenges/JoinChallenge/${challengeId}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok || res.status === 204) {
                    setMsg("Joined successfully! Redirecting…");
                    setTimeout(() => nav(`/challenges/${challengeId}`), 1000);
                    return;
                }

                const txt = await res.text().catch(() => "");
                if (res.status === 400 || res.status === 409) {
                    setMsg("You're already a member of this challenge.");
                    setTimeout(() => nav(`/challenges/${challengeId}`), 1000);
                } else if (res.status === 404) {
                    setMsg("Challenge not found.");
                    setTimeout(() => nav(`/challenges`), 1000);
                } else {
                    console.warn("Join failed:", res.status, txt);
                    setMsg("Could not join this challenge.");
                    setTimeout(() => nav(`/challenges`), 1000);
                }
            } catch (e) {
                console.error(e);
                setMsg("Network error.");
                setTimeout(() => nav(`/challenges`), 1000);
            }
        })();
    }, [challengeId, nav]);

    return (
        <div className="min-h-dvh grid place-items-center">
            <div className="rounded-2xl bg-white/80 backdrop-blur px-5 py-4 ring-1 ring-black/10 shadow-lg">
                <p className="text-slate-800">{msg}</p>
            </div>
        </div>
    );
}
