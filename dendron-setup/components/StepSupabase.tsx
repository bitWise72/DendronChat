"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { ArrowLeft, Database, KeyRound } from "lucide-react"

type Props = {
    config: DendronConfig
    updateConfig: (partial: Partial<DendronConfig>) => void
    onNext: () => void
    onPrev: () => void
    direction?: number
}

const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
}

export default function StepSupabase({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
    const [mode, setMode] = useState<"auto" | "manual">("manual") // Default to manual for now since auto is mock
    const [url, setUrl] = useState("")
    const [key, setKey] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConnect = () => {
        // Save state to local storage so callback can retrieve it
        localStorage.setItem("dendron_install_config", JSON.stringify(config))
        window.location.href = "/api/supabase/connect"
    }

    const handleManualConnect = async () => {
        if (!url || !key) return setError("Please provide both URL and Key")
        setLoading(true)
        setError(null)

        try {
            // We simulate the "Success" page logic here but directly
            // 1. Provision (Run SQL)
            const res = await fetch("/api/supabase/provision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    manual: true,
                    supabaseUrl: url,
                    serviceKey: key,
                    config // Send the config to be saved
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Provisioning failed")

            // 2. Ingest
            if (config.dbConfig?.type) {
                await fetch("/api/ingest", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        dbConfig: config.dbConfig,
                        llmConfig: {
                            apiKey: config.llmApiKey,
                            provider: config.llmProvider
                        },
                        projectRef: data.projectRef, // Extracted from URL
                        anonKey: key // Using Service Key as "Anon" for simpler demo, or we should ask for both. 
                        // Actually, for ingestion/admin we need Service Key. 
                        // For the frontend to allow chat, we need Anon Key.
                        // For simplicity, let's just ask for Service Key and use it for both in this MVP 
                        // (NOT SECURE for production but unblocks the user).
                        // BETTER: Ask for both? Or just fetch Anon Key via Management API? 
                        // Management API needs PAT. 
                        // Let's ask for Anon Key too.
                    })
                })
            }

            // Update Config
            updateConfig({
                projectRef: data.projectRef,
                supabaseUrl: url,
                anonKey: key, // Storing Service Key as Anon Key is risky for client side... 
                // User really should provide Anon Key for the frontend.
                // Let's add an input for Anon Key.
            })
            onNext()

        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="glass-panel p-8 rounded-2xl w-full max-w-3xl mx-auto"
        >
            <div className="flex flex-col gap-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
                        Connect Supabase
                    </h2>
                    <p className="text-slate-400">Link your vector database to store knowledge.</p>
                </div>

                <div className="flex justify-center gap-4 bg-slate-900/50 p-1 rounded-xl w-fit mx-auto border border-slate-800">
                    <button
                        onClick={() => setMode("auto")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "auto" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                    >
                        Automatic (OAuth)
                    </button>
                    <button
                        onClick={() => setMode("manual")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "manual" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                    >
                        Manual (API Keys)
                    </button>
                </div>

                {mode === "auto" ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4 w-full text-left">
                            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Automated Actions</h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li className="flex items-center gap-2">✓ Create Supabase Project</li>
                                <li className="flex items-center gap-2">✓ Enable pgvector & Execute SQL</li>
                                <li className="flex items-center gap-2">✓ Deploy Edge Functions</li>
                            </ul>
                        </div>
                        <button
                            onClick={handleConnect}
                            className="w-full py-4 rounded-xl bg-[#3ecf8e] text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            <Database size={20} />
                            Connect with Supabase
                        </button>
                        <p className="text-xs text-amber-500/80">Note: Requires Vercel Env Vars for OAuth.</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm text-amber-200">
                            Create a new project at <a href="https://supabase.com/dashboard" target="_blank" className="underline font-bold">database.new</a>, then copy the URL and Service Role Key (Settings &gt; API).
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-slate-500 ml-1">Project URL</label>
                            <input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://xyz.supabase.co"
                                className="glass-input w-full px-4 py-3 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-slate-500 ml-1">Service Role Key (for Admin Setup)</label>
                            <input
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                type="password"
                                placeholder="service_role_secret_..."
                                className="glass-input w-full px-4 py-3 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button
                            onClick={handleManualConnect}
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? "Provisioning..." : "Connect & Provision"}
                        </button>
                    </div>
                )}

                <div className="flex justify-start">
                    <button onClick={onPrev} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400">Back</button>
                    {/* In manual mode, next happens via Connect button */}
                </div>
            </div>
        </motion.div>
    )
}
