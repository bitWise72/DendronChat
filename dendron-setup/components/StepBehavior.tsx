"use client"

import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { ArrowLeft, ArrowRight, Lightbulb, MessageSquare, Sparkles, Code, Heart, Zap } from "lucide-react"

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

const TONES = [
    { id: "helpful", label: "Helpful", icon: Heart, prompt: "You are a helpful and polite assistant. Always answer clearly and concisely." },
    { id: "technical", label: "Technical", icon: Code, prompt: "You are a technical expert. Provide detailed code examples and explanations." },
    { id: "creative", label: "Creative", icon: Sparkles, prompt: "You are a creative muse. Inspire with imaginative ideas and poetic language." },
    { id: "concise", label: "Concise", icon: Zap, prompt: "You are a direct assistant. Answer in as few words as possible." },
]

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
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">
                        Behavior
                    </h2>
                    <p className="text-slate-400">How should your assistant think and speak?</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <Lightbulb size={16} className="text-sky-400" />
                                System Prompt
                            </label>
                            <span className="text-xs text-slate-500">The core instructions.</span>
                        </div>

                        {/* Tone Chips */}
                        <div className="flex gap-2 flex-wrap mb-2">
                            {TONES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => updateConfig({ systemPrompt: t.prompt })}
                                    className="px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 text-xs text-slate-400 hover:text-sky-400 hover:border-sky-400/50 transition-colors flex items-center gap-1.5"
                                >
                                    <t.icon size={12} />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={config.systemPrompt}
                            onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                            className="glass-input w-full px-4 py-3 rounded-xl min-h-[150px] outline-none text-sm leading-relaxed focus:bg-slate-900/80 transition-colors font-mono"
                            placeholder="You are a helpful assistant..."
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <MessageSquare size={16} className="text-emerald-400" />
                            Welcome Message
                        </label>
                        <input
                            type="text"
                            value={config.welcomeMessage}
                            onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                            placeholder="Hello! How can I help you today?"
                            className="glass-input w-full px-4 py-3 rounded-xl outline-none focus:bg-slate-900/80 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button onClick={onPrev} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">Back</button>
                    <button
                        onClick={onNext}
                        style={{ backgroundColor: config.themeColor || "#8b5cf6" }}
                        className="px-8 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-sky-900/10"
                    >
                        Continue <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
