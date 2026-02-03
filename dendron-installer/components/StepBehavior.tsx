"use client"

import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { ArrowLeft, ArrowRight, Lightbulb, MessageSquare } from "lucide-react"

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

export default function StepBehavior({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
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
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">
                        Intelligence
                    </h2>
                    <p className="text-slate-400">Configure how your AI speaks and acts.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Lightbulb size={16} className="text-sky-400" />
                            System Prompt
                        </label>
                        <textarea
                            value={config.systemPrompt}
                            onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                            className="glass-input w-full px-4 py-3 rounded-xl min-h-[120px] outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <MessageSquare size={16} className="text-emerald-400" />
                            Welcome Message
                        </label>
                        <input
                            type="text"
                            value={config.welcomeMessage}
                            onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                            className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-between">
                    <button onClick={onPrev} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400">Back</button>
                    <button
                        onClick={onNext}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold flex items-center gap-2"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
