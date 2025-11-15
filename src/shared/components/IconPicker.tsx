// src/shared/components/IconPicker.tsx
import LucideIcon from "./LucideIcon";

const ICON_OPTIONS = [
    "Activity",  // pro Run
    "Droplet",   // pro Drink
    "Dumbbell",  // pro Workout
    "Book",
    "Brain",
    "Bed",
    "Utensils",
    "Footprints",
    "BicepsFlexed",
    "Timer",
];

export default function IconPicker({
                                       value,
                                       onChange,
                                   }: {
    value?: string | null;
    onChange: (name: string) => void;
}) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {ICON_OPTIONS.map((name) => {
                const active = value === name;
                return (
                    <button
                        type="button"
                        key={name}
                        onClick={() => onChange(name)}
                        className={[
                            "h-10 rounded-lg ring-1 grid place-items-center",
                            active ? "ring-gray-900 bg-gray-900 text-white" : "ring-slate-300 bg-white text-gray-700",
                        ].join(" ")}
                        title={name}
                    >
                        <LucideIcon name={name} />
                    </button>
                );
            })}
        </div>
    );
}
