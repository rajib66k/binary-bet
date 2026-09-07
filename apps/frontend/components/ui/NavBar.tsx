"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
    const pathname = usePathname();

    return (
        <header>
            <nav className="flex justify-between items-center min-h-[62px] md:mx-20 mx-[5vw]">

                {/* Logo */}
                <div className="text-2xl font-bold text-[#03a9f4] flex items-center gap-2.5">
                    <div>
                        <img className="h-6" src="/images/logo2.png" alt="" />
                    </div>
                    <div>Binary Bet</div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Navigation */}
                    <ul className="navul gap-8 hidden sm:flex">
                        <Link className={pathname === "/" ? "text-[#03a9f4]" : ""} href="/">
                            <button className="cursor-pointer hover:text-[#03a9f4]">Market</button>
                        </Link>

                        <Link className={pathname === "/MyActivity" ? "text-[#03a9f4]" : ""} href="/MyActivity">
                            <button className="cursor-pointer hover:text-[#03a9f4]">My Activity</button>
                        </Link>
                    </ul>
                    <ConnectButton />
                </div>
            </nav>
        </header>
    );
};

export default Navbar;