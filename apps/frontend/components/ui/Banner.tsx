"use client";

import Link from "next/link";
import CenteredLoopCarousel from "./CenteredLoopCarousel";
import { usePathname } from "next/navigation";

const Banner = () => {
    const pathname = usePathname();

    return (
        <div className='first lg:flex justify-between'>
            <div className="firstSection flex flex-col justify-center w-[100%] xl:pl-[3vw]">
                <div className="firstSection flex flex-col justify-center">
                    <div className="font-bold 2xl:text-5xl xl:text-4xl md:text-3xl sm:text-4xl text-2xl py-1">
                        <span className="text-[#03a9f4]">Predict</span> what's next
                    </div>

                    <div className="font-bold 2xl:text-5xl xl:text-4xl md:text-3xl sm:text-4xl text-2xl sm:py-1 py-0">
                        Track the<span className="text-[#03a9f4]"> odds and</span> get
                    </div>

                    <div className="font-bold 2xl:text-5xl xl:text-4xl md:text-3xl sm:text-4xl text-2xl py-1">
                        <span className="text-[#03a9f4]">Signals</span> around you
                    </div>

                    <div className="pt-4 sm:text-lg text-sm">
                        Bet on crypto, commodities and global markets.
                    </div>

                    <div className="pb-4 sm:text-lg text-sm">
                        <span className="sm:hidden inline">creating</span>
                        Buy YES or NO and trade your conviction.
                    </div>

                    <div className="flex md:gap-3 gap-1.5 py-5 items-center">
                        <button className="get my-2 px-4 md:p-[9px] p-[11px] text-white rounded-4xl bg-[#03a9f4] hover:bg-[#0290d3] md:text-base text-sm">
                            Get Started
                        </button>
                        <Link className={pathname === "/MyActivity" ? "text-[#03a9f4]" : ""} href="/MyActivity">
                            <button className="download w-fit my-2 p-2 px-4 rounded-4xl border border-[rgba(238,243,241,1)] flex items-center gap-2 text-[#03a9f4] hover:text-[rgb(16,47,84)] md:text-base text-sm">
                                My Activity
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="secondSection w-[100%]">
                <div className='flex w-[100%]'>
                    <CenteredLoopCarousel />
                </div>
            </div>
        </div>
    );
};

export default Banner;