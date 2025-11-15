type Props = {
    challengeId: string;
    onShowFriends: () => void;
    imageSrc?: string;
};

export default function InviteFriendCard({
                                             challengeId,
                                             onShowFriends,
                                             imageSrc = "/images/share-illustration.png",
                                         }: Props) {
    const joinUrl = `${window.location.origin}/join/${challengeId}`;

    async function handleInvite() {
        const title = "Join my challenge!";
        const text = "Tap the link to join my challenge in Challenger.";
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url: joinUrl });
            } else {
                await navigator.clipboard.writeText(joinUrl);
                alert("Link copied to clipboard!");
            }
        } catch {
            await navigator.clipboard.writeText(joinUrl);
            alert("Link copied to clipboard!");
        }
    }

    return (
        <div className="relative mt-6 rounded-3xl p-6 bg-white/55 backdrop-blur-md ring-1 ring-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Text */}
            <div className="relative z-10 pr-28">
                <h4 className="font-semibold text-[#0f172a] text-lg tracking-tight">
                    Share &amp; see friends
                </h4>
                <p className="text-[#334155] text-sm mt-1">
                    Look at how your friends are doing and stay motivated together.
                </p>
            </div>

            {/* Buttons */}
            <div className="relative z-10 mt-4 flex gap-2">
                <button
                    onClick={handleInvite}
                    className="h-9 px-4 rounded-full bg-[#0f172a] text-white text-sm font-medium active:scale-[.98] shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition"
                >
                    Send Now
                </button>
                <button
                    onClick={onShowFriends}
                    className="h-9 px-4 rounded-full bg-white/70 text-[#0f172a] ring-1 ring-black/10 text-sm font-medium active:scale-[.98] transition"
                >
                    See Friends
                </button>
            </div>

            {/* Illustration */}
            <img
                src={imageSrc}
                alt="Friends illustration"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-28 h-28 object-contain opacity-90 pointer-events-none select-none"
            />
        </div>
    );
}
