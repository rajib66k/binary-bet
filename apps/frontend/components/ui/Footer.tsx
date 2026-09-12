import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-slate-100 bg-slate-50/70">
            <div className="mx-auto max-w-7xl px-[5vw] md:px-20">
                <div className="grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-8">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 text-lg font-bold text-gray-900">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#03a9f4] text-sm font-extrabold tracking-tight text-white shadow-sm shadow-[#03a9f4]/30">
                                BB
                            </span>
                            <span>Binary Bet</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
                            Track the odds, follow the signals, and trade your conviction.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Explore</p>
                        <nav className="mt-4 grid gap-3 text-sm text-gray-600" aria-label="Footer navigation">
                            <Link href="/" className="w-fit transition-colors hover:text-[#03a9f4]">Markets</Link>
                            <Link href="/MyActivity" className="w-fit transition-colors hover:text-[#03a9f4]">My Activity</Link>
                            <Link href="/MyAgent" className="w-fit transition-colors hover:text-[#03a9f4]">My Agent</Link>
                        </nav>
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Built for conviction</p>
                        <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
                            Make informed predictions across crypto and global markets.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 py-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Binary Bet. All rights reserved.</p>
                    <p className="font-medium text-gray-400">Predict what&apos;s next.</p>
                </div>
            </div>
        </footer>
    );
}
