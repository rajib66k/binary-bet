"use client"

import dynamic from "next/dynamic";
import { type ReactNode } from "react";

const Providers = dynamic(
    () => import("./providers").then((module) => module.Providers),
    { ssr: false },
)

export function ClientProviders(props: { children: ReactNode }) {
    return <Providers>{props.children}</Providers>
}
