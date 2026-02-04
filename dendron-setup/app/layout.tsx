import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import NeuronBackground from "@/components/NeuronBackground"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export const metadata: Metadata = {
    title: "Dendron | One-Click Assistant Installer",
    description: "Deploy your own user-owned AI assistant in seconds.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-[#030712] text-slate-200`}>
                <NeuronBackground />
                {children}
            </body>
        </html>
    )
}
