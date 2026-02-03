"use client"

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

export default function StepSupabase({ config, onPrev, direction = 0 }: Props) {
    const handleConnect = () => {
        // Save state to local storage so callback can retrieve it
        localStorage.setItem("dendron_install_config", JSON.stringify(config))
        window.location.href = "/api/supabase/connect"
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
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-orange-500/10 text-orange-400 mb-4">
                        <Database size={24} />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
                        Connect Supabase
                    </h2>
                    <p className="text-slate-400">We will automatically create a project and deploy your backend.</p>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Automated Actions</h3>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-center gap-2">✓ Create Supabase Project</li>
                        <li className="flex items-center gap-2">✓ Enable pgvector & Execute SQL</li>
                        <li className="flex items-center gap-2">✓ Deploy Edge Functions (Chat & RAG)</li>
                        <li className="flex items-center gap-2">✓ Index website Knowledge</li>
                    </ul>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleConnect}
                        className="w-full py-4 rounded-xl bg-[#3ecf8e] text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                        <Database size={20} />
                        Connect to Supabase
                    </button>
                    <p className="text-xs text-slate-500">You will be redirected to authorize Dendron to manage your projects.</p>
                </div>

                <div className="flex justify-start">
                    <button onClick={onPrev} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400">Back</button>
                </div>
            </div>
        </motion.div>
    )
}
