import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    title: string;
    subtitle?: string;
}>;

/** Fullscreen animated gradient + moving blobs background */
function AuthBackground() {
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
            {/* blobs (laditelné: blur-[..], opacity-.., durations) */}
            <div className="absolute top-[8%] left-[12%]  w-[380px] h-[380px]  bg-[#8EC5FC]  rounded-full blur-[20px] opacity-55 animate-[blob-a_28s_ease-in-out_infinite]" />
            <div className="absolute top-[55%] left-[55%] w-[440px] h-[440px] bg-[#E0C3FC]  rounded-full blur-[20px] opacity-50 animate-[blob-b_32s_ease-in-out_infinite]" />
            <div className="absolute top-[30%] left-[72%] w-[320px] h-[320px] bg-[#FAD0FE] rounded-full blur-[20px] opacity-50 animate-[blob-c_26s_ease-in-out_infinite]" />
            <div className="absolute top-[70%] left-[10%] w-[360px] h-[360px] bg-[#b8e1ff] rounded-full blur-[20px] opacity-45 animate-[blob-d_34s_ease-in-out_infinite]" />
            <div className="absolute top-[-6%] left-[62%] w-[300px] h-[300px] bg-[#d3bdfc] rounded-full blur-[20px] opacity-50 animate-[blob-e_30s_ease-in-out_infinite]" />

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
          .animate-[blob-a_28s_ease-in-out_infinite],
          .animate-[blob-b_32s_ease-in-out_infinite],
          .animate-[blob-c_26s_ease-in-out_infinite],
          .animate-[blob-d_34s_ease-in-out_infinite],
          .animate-[blob-e_30s_ease-in-out_infinite] { animation: none !important; }
        }
      `}</style>
        </div>
    );
}

export default function AuthLayout({ title, subtitle, children }: Props) {
    return (
        <div className="relative min-h-dvh">
            <AuthBackground />
            <div className="relative z-10 flex items-center justify-center min-h-dvh px-4 py-10">
                <div className="w-full max-w-[420px]">
                    {/* hero */}
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-black tracking-tight text-[#0f172a] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-[#334155] mt-1">{subtitle}</p>
                        )}
                    </div>

                    {/* glass form wrapper */}
                    <div className="rounded-3xl p-6 bg-white/70 backdrop-blur-md ring-1 ring-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
                        {children}
                    </div>

                    {/* bottom safe area space */}
                    <div className="h-[calc(16px+env(safe-area-inset-bottom))]" />
                </div>
            </div>
        </div>
    );
}
