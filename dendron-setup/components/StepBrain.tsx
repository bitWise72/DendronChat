"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { ArrowRight, Brain, Key, Cpu, Zap, Lock } from "lucide-react"

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

export default function StepBrain({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
    const [provider, setProvider] = useState<"openai" | "gemini" | "anthropic">(config.llmProvider || "openai")

    // Simple state to force update if needed, but config is reliable
    const handleProviderChange = (p: "openai" | "gemini" | "anthropic") => {
        setProvider(p)
        updateConfig({ llmProvider: p })
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
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                        Brain & Intelligence
                    </h2>
                    <p className="text-slate-400">Choose the AI model that powers your assistant.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => handleProviderChange("openai")}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${provider === "openai" ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                    >
                        <Zap size={24} />
                        <span className="font-medium">OpenAI</span>
                    </button>
                    <button
                        onClick={() => handleProviderChange("gemini")}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${provider === "gemini" ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                    >
                        <Cpu size={24} />
                        <span className="font-medium">Gemini</span>
                    </button>
                    <button
                        onClick={() => handleProviderChange("anthropic")}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${provider === "anthropic" ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                    >
                        <Brain size={24} />
                        <span className="font-medium">Anthropic</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Model Name</label>
                        <input
                            type="text"
                            value={config.chatModel}
                            onChange={(e) => updateConfig({ chatModel: e.target.value })}
                            placeholder={provider === "openai" ? "gpt-4o-mini" : provider === "gemini" ? "gemini-1.5-pro" : "claude-3-5-sonnet"}
                            className="glass-input w-full px-4 py-3 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">API Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={config.llmApiKey}
                                onChange={(e) => updateConfig({ llmApiKey: e.target.value })}
                                placeholder={`Expected format: ${provider === "openai" ? "sk-..." : provider === "gemini" ? "AIza..." : "sk-ant-..."}`}
                                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Lock size={12} /> Stored securely in your database. Never shared.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between mt-4">
                    <button onClick={onPrev} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400">Back</button>
                    <button
                        onClick={onNext}
                        disabled={!config.llmApiKey}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
