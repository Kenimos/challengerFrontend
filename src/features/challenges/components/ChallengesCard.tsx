import { Edit3 } from "lucide-react";

type Props = {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string | null;
    onOpen?: () => void;
    onEdit?: () => void;
};

export default function ChallengeCard({
                                          name,
                                          description,
                                          startDate,
                                          endDate,
                                          onOpen,
                                          onEdit,
                                      }: Props) {
    const start = startDate ? new Date(startDate).toLocaleDateString() : null;
    const end = endDate ? new Date(endDate).toLocaleDateString() : null;

    return (
        <div className="relative rounded-3xl p-4 bg-white/70 backdrop-blur-md ring-1 ring-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            {onEdit && (
                <button
                    onClick={(e) => { e.stopPropagation?.(); onEdit(); }}
                    className="absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-full hover:bg-black/5 text-[#334155]"
                    aria-label="Edit challenge"
                    title="Edit"
                >
                    <Edit3 className="h-4 w-4" />
                </button>
            )}

            <button onClick={onOpen} className="block text-left w-full active:scale-[.995]">
                <h3 className="text-[20px] font-extrabold pr-12 leading-tight text-[#0f172a]">{name}</h3>
                {description && <p className="text-[#334155] mt-1">{description}</p>}

                {(start || end) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        {start && (
                            <span className="inline-flex items-center rounded-full px-3 py-1 bg-white/85 ring-1 ring-white/60 text-[#0f172a]">
                start&nbsp;{start}
              </span>
                        )}
                        {end && (
                            <span className="inline-flex items-center rounded-full px-3 py-1 bg-white/85 ring-1 ring-white/60 text-[#0f172a]">
                ends&nbsp;{end}
              </span>
                        )}
                    </div>
                )}
            </button>
        </div>
    );
}
