"use client"

import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { ArrowLeft, ArrowRight, Globe, Lock } from "lucide-react"

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

export default function StepKnowledge({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
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
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                        Knowledge
                    </h2>
                    <p className="text-slate-400">Where should your assistant get its info?</p>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <input
                            type="url"
                            value={config.websiteUrl}
                            onChange={(e) => updateConfig({ websiteUrl: e.target.value })}
                            placeholder="https://yourstartup.com"
                            className="glass-input w-full px-12 py-4 rounded-xl text-lg outline-none"
                        />
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-sm text-slate-400 flex gap-3">
                        <Lock size={16} className="shrink-0 mt-0.5" />
                        <p>The installer will automatically index this site into your private database during setup.</p>
                    </div>
                </div>

                <div className="flex justify-between">
                    <button onClick={onPrev} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400">Back</button>
                    <button
                        onClick={onNext}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold flex items-center gap-2"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
