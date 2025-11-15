import * as React from "react";

export type CalendarDay = { label: string; day: number; iso: string };

function addDaysISO(iso: string, delta: number) {
    const d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
}
function toLabel(iso: string) {
    const d = new Date(iso + "T12:00:00Z");
    return d.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue…
}
function monthLabelFromISO(iso: string) {
    const d = new Date(iso + "T12:00:00Z");
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function CalendarStrip({
                                          selectedISO,
                                          onSelect,
                                          className = "",
                                      }: {
    selectedISO: string;
    onSelect: (iso: string) => void;
    className?: string;
}) {
    // střed = selectedISO
    const [centerISO, setCenterISO] = React.useState(selectedISO);

    React.useEffect(() => {
        setCenterISO(selectedISO);
    }, [selectedISO]);

    // okno 7 dní: -3 .. +3
    const days: CalendarDay[] = React.useMemo(() => {
        const arr: CalendarDay[] = [];
        for (let i = -3; i <= 3; i++) {
            const iso = addDaysISO(centerISO, i);
            const d = new Date(iso + "T12:00:00Z");
            arr.push({ iso, day: d.getUTCDate(), label: toLabel(iso) });
        }
        return arr;
    }, [centerISO]);

    const headerLabel = React.useMemo(() => monthLabelFromISO(centerISO), [centerISO]);

    // jednoduchý swipe (po týdnech)
    const [dragDX, setDragDX] = React.useState(0);
    const [dragging, setDragging] = React.useState(false);
    const startXRef = React.useRef<number | null>(null);
    const didDragRef = React.useRef(false);
    const threshold = 56;
    const clickSlop = 8;

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        startXRef.current = e.clientX;
        didDragRef.current = false;
        setDragging(true);
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (startXRef.current == null || !dragging) return;
        const dx = e.clientX - startXRef.current;
        setDragDX(dx);
        if (Math.abs(dx) > clickSlop) didDragRef.current = true;
    };
    const finishSwipe = (dx: number) => {
        if (dx <= -threshold) setCenterISO(addDaysISO(centerISO, +7));
        else if (dx >= threshold) setCenterISO(addDaysISO(centerISO, -7));
        setDragDX(0);
        setDragging(false);
        startXRef.current = null;
    };
    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (startXRef.current == null) return;
        const dx = e.clientX - startXRef.current;
        finishSwipe(dx);
    };
    const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (Math.abs(e.deltaX) < 10) return;
        if (e.deltaX > 0) setCenterISO(addDaysISO(centerISO, +7));
        else setCenterISO(addDaysISO(centerISO, -7));
    };

    const trackStyle: React.CSSProperties = {
        transform: `translateX(${dragDX}px)`,
        transition: dragging ? "none" : "transform 160ms ease",
    };

    const handleDayClick = (iso: string) => {
        if (didDragRef.current) return;
        onSelect(iso);
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* měsíc */}
            <div className="font-medium text-stone-700">{headerLabel}</div>

            {/* swipe area */}
            <div
                className="mt-2 touch-pan-x select-none w-full"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onWheel={onWheel}
                role="group"
                aria-label="Centered 7-day strip"
            >
                {/* labels (nad čísly) */}
                <div
                    className="flex items-center justify-center gap-3 overflow-x-hidden no-scrollbar font-sans text-[11px] uppercase tracking-wide text-stone-600"
                    style={trackStyle}
                >
                    {days.map((d) => (
                        <div key={`lbl-${d.iso}`} className="shrink-0 w-10 text-center">
                            {d.label}
                        </div>
                    ))}
                </div>

                {/* čísla dnů */}
                <div
                    className="mt-1 flex items-center justify-center gap-3 overflow-x-hidden no-scrollbar"
                    style={trackStyle}
                >
                    {days.map((d) => {
                        const isSel = d.iso === selectedISO;
                        return (
                            <button
                                key={`btn-${d.iso}`}
                                onClick={() => handleDayClick(d.iso)}
                                aria-current={isSel ? "date" : undefined}
                                className={[
                                    "shrink-0 w-10 h-10 rounded-full",
                                    "flex items-center justify-center text-sm leading-none font-sans",
                                    isSel ? "bg-[#353535] text-white" : "bg-white text-stone-900 ring-1 ring-stone-300",
                                ].join(" ")}
                            >
                                {d.day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
