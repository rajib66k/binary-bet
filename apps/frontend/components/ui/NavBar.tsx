"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header>
            <nav className="relative flex min-h-[62px] items-center justify-between md:mx-20 mx-[5vw]">
                {/* Logo */}
                <div className="flex items-center gap-2.5 text-xl font-bold text-[#03a9f4] sm:text-2xl">
                    <div>
                        <img className="h-6" src="/images/logo2.png" alt="" />
                    </div>
                    <div>Binary Bet</div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Navigation */}
                    <ul className="navul hidden gap-6 lg:flex xl:gap-8">
                        <Link className={pathname === "/" ? "text-[#03a9f4]" : ""} href="/">
                            <button className="cursor-pointer hover:text-[#03a9f4]">Market</button>
                        </Link>

                        <Link className={pathname === "/MyActivity" ? "text-[#03a9f4]" : ""} href="/MyActivity">
                            <button className="cursor-pointer hover:text-[#03a9f4]">My Activity</button>
                        </Link>
                        <Link className={pathname === "/MyAgent" ? "text-[#03a9f4]" : ""} href="/MyAgent">
                            <button className="cursor-pointer hover:text-[#03a9f4]">My Agent</button>
                        </Link>
                    </ul>
                    <div className="hidden lg:block">
                        <ConnectButton />
                    </div>
                    <button
                        type="button"
                        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((open) => !open)}
                        className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-[#03a9f4]/10 hover:text-[#03a9f4] lg:hidden"
                    >
                        <span className="text-xl" aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
                    </button>
                </div>
                {isMenuOpen && (
                    <div className="absolute right-0 top-[58px] z-30 w-56 rounded-2xl border border-[#03a9f4]/20 bg-white p-3 shadow-lg lg:hidden">
                        <div className="grid gap-1">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className={`rounded-xl px-3 py-2 text-sm font-medium ${pathname === "/" ? "bg-[#03a9f4]/10 text-[#03a9f4]" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                Market
                            </Link>
                            <Link
                                href="/MyActivity"
                                onClick={() => setIsMenuOpen(false)}
                                className={`rounded-xl px-3 py-2 text-sm font-medium ${pathname === "/MyActivity" ? "bg-[#03a9f4]/10 text-[#03a9f4]" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                My Activity
                            </Link>
                            <Link
                                href="/MyAgent"
                                onClick={() => setIsMenuOpen(false)}
                                className={`rounded-xl px-3 py-2 text-sm font-medium ${pathname === "/MyAgent" ? "bg-[#03a9f4]/10 text-[#03a9f4]" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                My Agent
                            </Link>
                            <div className="mt-2 border-t border-gray-100 pt-3">
                                <div className="flex justify-center overflow-hidden rounded-xl">
                                    <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;