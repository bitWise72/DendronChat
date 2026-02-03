"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DendronConfig, defaultConfig } from "@/lib/state"
import Wizard from "@/components/Wizard"
import { Sparkles } from "lucide-react"

export default function Home() {
    const [config, setConfig] = useState<DendronConfig>(defaultConfig)

    useEffect(() => {
        const saved = localStorage.getItem("dendron_install_config")
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setConfig(prev => ({ ...prev, ...parsed }))
            } catch (e) {
                console.error("Failed to load saved config", e)
            }
        }
    }, [])

    const updateConfig = (partial: Partial<DendronConfig>) => {
        setConfig((prev) => {
            const next = { ...prev, ...partial }
            localStorage.setItem("dendron_install_config", JSON.stringify(next))
            return next
        })
    }

    return (
        <main className="min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">
                        <Sparkles size={14} />
                        <span>AI Assistant Installer</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4 glow-text tracking-tight">
                        Dendron
                    </h1>
                    <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                        Provision a production-ready AI assistant directly to your Supabase project with one click.
                    </p>
                </motion.div>

                <Wizard config={config} updateConfig={updateConfig} />
            </div>
        </main>
    )
}
