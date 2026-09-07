"use client";

import { useEffect, useState } from "react";

const images: string[] = [
    "/images/profile.png",
    "/images/main.png",
    "/images/bot.png",
];

const CenteredLoopCarousel = () => {
    const [current, setCurrent] = useState<number>(0);
    const total = images.length;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % total);
        }, 3000);

        return () => clearInterval(interval);
    }, [total]);

    const getPositionStyle = (index: number): string => {
        const prev = (current - 1 + total) % total;
        const next = (current + 1) % total;

        if (index === current) {
            return "z-20 scale-100 translate-x-0";
        }

        if (index === prev) {
            return "z-10 scale-75 xl:-translate-x-45 md:-translate-x-37 -translate-x-25";
        }

        if (index === next) {
            return "z-10 scale-75 xl:translate-x-45 md:translate-x-37 translate-x-25";
        }

        return "hidden";
    };

    return (
        <div className="w-full">
            <div className="flex justify-center items-center md:h-[520px] w-full h-[370px]">
                {images.map((img, index) => (
                    <img key={img} src={img} alt={`slide-${index + 1}`} className={` absolute transform -translate-x-1/2 transition-all duration-700 ease-in-out md:rounded-[40px] rounded-[25px] shadow-xl shadow-[#d3dfef] object-cover xl:w-[230px] md:w-[210px] w-[130px] ${getPositionStyle(index)} `} />
                ))}
            </div>
        </div>
    );
};

export default CenteredLoopCarousel;