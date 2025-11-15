import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");
    const [error, setError] = useState("");
    const [ok, setOk] = useState(false);
    const nav = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setOk(false);
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (!res.ok) throw new Error("Registration failed");
            setOk(true);
            setTimeout(() => nav("/login"), 800);
        } catch (err: any) {
            setError(err.message || "Registration failed");
        }
    }

    return (
        <AuthLayout title="Create account" subtitle="Join and start your challenges">
            <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                    <span className="text-sm font-medium text-[#0f172a]">Name</span>
                    <input
                        className="mt-1 w-full h-12 rounded-xl bg-white/80 backdrop-blur px-4 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#0f172a] placeholder:text-[#0f172a]/40"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-[#0f172a]">Email</span>
                    <input
                        className="mt-1 w-full h-12 rounded-xl bg-white/80 backdrop-blur px-4 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#0f172a] placeholder:text-[#0f172a]/40"
                        placeholder="you@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-[#0f172a]">Password</span>
                    <input
                        className="mt-1 w-full h-12 rounded-xl bg-white/80 backdrop-blur px-4 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#0f172a] placeholder:text-[#0f172a]/40"
                        placeholder="Create a password"
                        type="password"
                        value={password}
                        onChange={(e) => setPwd(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </label>

                {error && <p className="text-red-600 text-sm">{error}</p>}
                {ok && <p className="text-green-700 text-sm">Account created, redirecting…</p>}

                <button className="w-full h-12 rounded-full bg-[#0f172a] text-white font-semibold active:scale-[.99] shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
                    Create account
                </button>

                <p className="text-sm text-[#334155] text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold underline underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
