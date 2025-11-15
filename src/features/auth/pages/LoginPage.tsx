import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error("Invalid credentials");
            const data = await res.json();
            localStorage.setItem("auth_token", data.token);
            nav("/challenges");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Sign in" subtitle="Welcome back">
            <form onSubmit={onSubmit} className="space-y-4">
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
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPwd(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" className="accent-[#0f172a]" />
                        <span className="text-[#334155]">Remember me</span>
                    </label>
                    <button type="button" className="text-[#334155] hover:underline">
                        Forgot password?
                    </button>
                </div>

                <button
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-[#0f172a] text-white font-semibold active:scale-[.99] disabled:opacity-60 shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                >
                    {loading ? "Signing in..." : "Login"}
                </button>

                <p className="text-sm text-[#334155] text-center">
                    Don’t have an account?{" "}
                    <Link to="/register" className="font-semibold underline underline-offset-4">
                        Sign up
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
