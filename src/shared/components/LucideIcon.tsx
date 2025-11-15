// import * as React from "react";
import * as Icons from "lucide-react";

type Props = { name?: string | null; size?: number; strokeWidth?: number; className?: string };
export default function LucideIcon({ name, size = 20, strokeWidth = 2, className }: Props) {
    const Icon = (name && (Icons as any)[name]) || (Icons as any).CircleHelp;
    return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
