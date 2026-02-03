"use client"

import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { Bot, Sparkles, Zap, Ghost, User, ArrowRight } from "lucide-react"

type Props = {
    config: DendronConfig
    updateConfig: (partial: Partial<DendronConfig>) => void
    onNext: () => void
    direction?: number
}

const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
}

const PRESET_ICONS = [
    { id: "bot", icon: Bot, name: "Classic Bot", url: "https://api.iconify.design/lucide:bot.svg" },
    { id: "sparkles", icon: Sparkles, name: "Sparkle", url: "https://api.iconify.design/lucide:sparkles.svg" },
    { id: "zap", icon: Zap, name: "Fast", url: "https://api.iconify.design/lucide:zap.svg" },
    { id: "ghost", icon: Ghost, name: "Ghost", url: "https://api.iconify.design/lucide:ghost.svg" },
    { id: "user", icon: User, name: "Human", url: "https://api.iconify.design/lucide:user.svg" },
]

export default function StepIdentity({ config, updateConfig, onNext, direction = 0 }: Props) {
    const canProceed = config.assistantName.trim().length > 0 && config.projectId.trim().length > 0

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
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 mb-2">
                        Who is your Assistant?
                    </h2>
                    <p className="text-slate-400">Define the identity and style of your AI companion.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Name</label>
                            <input
                                type="text"
                                value={config.assistantName}
                                onChange={(e) => updateConfig({ assistantName: e.target.value })}
                                placeholder="e.g. Atlas"
                                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Project ID</label>
                            <input
                                type="text"
                                value={config.projectId}
                                onChange={(e) => updateConfig({ projectId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="my-cool-project"
                                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Theme Color</label>
                            <div className="flex items-center gap-3 glass-input p-2 rounded-xl">
                                <input
                                    type="color"
                                    value={config.themeColor}
                                    onChange={(e) => updateConfig({ themeColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                />
                                <span className="text-slate-400 text-sm font-mono">{config.themeColor}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-sm font-medium text-slate-300">Icon</label>
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_ICONS.map((preset) => {
                                const Icon = preset.icon
                                const isSelected = config.mascotUrl === preset.url
                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => updateConfig({ mascotUrl: preset.url })}
                                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-sky-500/20 border-2 border-sky-400 text-sky-400'
                                                : 'bg-slate-800/50 border border-slate-700/50 text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        <Icon size={20} />
                                    </button>
                                )
                            })}
                        </div>
                        <div className="p-4 rounded-xl border border-slate-700/50 bg-[#0f172a]/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1" style={{ background: config.themeColor }} />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: config.themeColor }}>
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{config.assistantName || "Assistant"}</div>
                                    <div className="text-xs text-slate-500">Preview</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onNext}
                        disabled={!canProceed}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
