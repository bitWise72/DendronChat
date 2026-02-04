"use client"

import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { Bot, Sparkles, Zap, Ghost, User, ArrowRight, Dna, Rocket, Heart, Brain } from "lucide-react"

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

const THEME_SEEDS = [
    { id: "ocean", color: "#0ea5e9", name: "Ocean", gradient: "from-sky-500 to-blue-600" },
    { id: "violet", color: "#8b5cf6", name: "Violet", gradient: "from-violet-500 to-purple-600" },
    { id: "emerald", color: "#10b981", name: "Emerald", gradient: "from-emerald-500 to-green-600" },
    { id: "rose", color: "#f43f5e", name: "Rose", gradient: "from-rose-500 to-red-600" },
    { id: "amber", color: "#f59e0b", name: "Amber", gradient: "from-amber-500 to-orange-600" },
]

const AVATARS = [
    { id: "bot", icon: Bot, name: "Classic", url: "https://api.iconify.design/lucide:bot.svg" },
    { id: "brain", icon: Brain, name: "Neural", url: "https://api.iconify.design/lucide:brain.svg" },
    { id: "sparkles", icon: Sparkles, name: "Magic", url: "https://api.iconify.design/lucide:sparkles.svg" },
    { id: "zap", icon: Zap, name: "Flash", url: "https://api.iconify.design/lucide:zap.svg" },
    { id: "dna", icon: Dna, name: "Organic", url: "https://api.iconify.design/lucide:dna.svg" },
    { id: "rocket", icon: Rocket, name: "Rocket", url: "https://api.iconify.design/lucide:rocket.svg" },
    { id: "heart", icon: Heart, name: "Friendly", url: "https://api.iconify.design/lucide:heart.svg" },
    { id: "ghost", icon: Ghost, name: "Ghost", url: "https://api.iconify.design/lucide:ghost.svg" },
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
            className="glass-panel p-8 rounded-2xl w-full max-w-4xl mx-auto"
        >
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">
                        Identity
                    </h2>
                    <p className="text-slate-400">Define the digital soul of your assistant.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Inputs */}
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300">Name</label>
                            <input
                                type="text"
                                value={config.assistantName}
                                onChange={(e) => updateConfig({ assistantName: e.target.value })}
                                placeholder="e.g. Atlas"
                                className="glass-input w-full px-4 py-3 rounded-xl outline-none focus:border-sky-500/50 focus:bg-slate-900/80 transition-all font-outfit"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300">Project ID (Unique Slug)</label>
                            <input
                                type="text"
                                value={config.projectId}
                                onChange={(e) => updateConfig({ projectId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="my-cool-project"
                                className="glass-input w-full px-4 py-3 rounded-xl outline-none focus:border-sky-500/50 focus:bg-slate-900/80 transition-all font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300">Theme Essence</label>
                            <div className="flex flex-wrap gap-3">
                                {THEME_SEEDS.map((theme) => {
                                    const isSelected = config.themeColor === theme.color
                                    return (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateConfig({ themeColor: theme.color })}
                                            className={`w-10 h-10 rounded-full transition-all border-2 ${isSelected ? "border-white scale-110 shadow-lg shadow-sky-500/20" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                                                }`}
                                            style={{ background: theme.color }}
                                            title={theme.name}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300">Avatar</label>
                            <div className="grid grid-cols-4 gap-3">
                                {AVATARS.map((preset) => {
                                    const Icon = preset.icon
                                    const isSelected = config.mascotUrl === preset.url
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => updateConfig({ mascotUrl: preset.url })}
                                            className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-slate-800 border-2 border-sky-400 text-sky-400 shadow-md'
                                                : 'bg-slate-900/40 border border-slate-700/30 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                                                }`}
                                        >
                                            <Icon size={24} />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-4 block">Live Preview</label>
                            <div className="relative">
                                {/* Chat Bubble Imitation */}
                                <div className="bg-slate-900/90 border border-slate-700/50 rounded-2xl p-4 shadow-xl flex items-start gap-4 max-w-sm mx-auto backdrop-blur-md">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition-colors duration-500"
                                        style={{ background: config.themeColor }}
                                    >
                                        {/* Dynamic Icon */}
                                        {(() => {
                                            const selectedAvatar = AVATARS.find(a => a.url === config.mascotUrl) || AVATARS[0]
                                            const Icon = selectedAvatar.icon
                                            return <Icon size={20} />
                                        })()}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-semibold text-white">{config.assistantName || "Assistant"}</span>
                                            <span className="text-[10px] text-slate-500">Just now</span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            Hello! I am ready to help.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onNext}
                        disabled={!canProceed}
                        style={{ backgroundColor: config.themeColor }}
                        className="px-8 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-sky-900/20"
                    >
                        Continue <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
