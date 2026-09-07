import type { Metadata } from "next";
import { type ReactNode } from "react";
import { ClientProviders } from "./clientProviders";
import "./globals.css";
import Navbar from "../components/ui/NavBar";

export const metadata: Metadata = {
  title: "Binary Bet",
  description: "",
}

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Navbar />
          {props.children}
        </ClientProviders>
      </body>
    </html>
  )
}
