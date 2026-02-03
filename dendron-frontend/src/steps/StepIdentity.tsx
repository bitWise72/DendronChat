import { useRef } from "react"
import { motion } from "framer-motion"
import { StepProps } from "../state"
import { Bot, Sparkles, Zap, Ghost, User, ArrowRight } from "lucide-react"

type Props = StepProps

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 50 : -50,
        opacity: 0,
    }),
}

const PRESET_ICONS = [
    { id: "bot", icon: Bot, name: "Classic Bot", url: "https://api.iconify.design/lucide:bot.svg" },
    { id: "sparkles", icon: Sparkles, name: "Sparkle", url: "https://api.iconify.design/lucide:sparkles.svg" },
    { id: "zap", icon: Zap, name: "Fast", url: "https://api.iconify.design/lucide:zap.svg" },
    { id: "ghost", icon: Ghost, name: "Ghost", url: "https://api.iconify.design/lucide:ghost.svg" },
    { id: "user", icon: User, name: "Human", url: "https://api.iconify.design/lucide:user.svg" },
]

export default function StepIdentity({ step: _step, config, updateConfig, onNext, onPrev: _onPrev, direction = 0 }: Props) {
    const canProceed = config.assistantName.trim().length > 0 && config.projectId.trim().length > 0
    const containerRef = useRef(null)

    return (
        <motion.div
            key="step-identity"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-panel p-8 rounded-2xl w-full max-w-3xl mx-auto"
            ref={containerRef}
        >
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 mb-2">
                        Who is your Assistant?
                    </h2>
                    <p className="text-slate-400">Define the identity and style of your AI companion.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Name</label>
                            <input
                                type="text"
                                value={config.assistantName}
                                onChange={(e) => updateConfig({ assistantName: e.target.value })}
                                placeholder="e.g. Atlas, Nexus, Helper..."
                                className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-sky-500/50 outline-none"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex justify-between">
                                <span>Project ID</span>
                                <span className="text-xs text-slate-500">Must be unique/URL safe</span>
                            </label>
                            <input
                                type="text"
                                value={config.projectId}
                                onChange={(e) => updateConfig({ projectId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="my-cool-project"
                                className="glass-input w-full px-4 py-3 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Theme Color</label>
                            <div className="flex items-center gap-3 glass-input p-2 rounded-xl">
                                <input
                                    type="color"
                                    value={config.themeColor}
                                    onChange={(e) => updateConfig({ themeColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none overflow-hidden"
                                />
                                <span className="text-slate-400 text-sm font-mono">{config.themeColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Icon Picker & Preview */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Choose an Icon</label>
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_ICONS.map((preset) => {
                                    const Icon = preset.icon
                                    const isSelected = config.mascotUrl === preset.url
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => updateConfig({ mascotUrl: preset.url })}
                                            className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${isSelected
                                                ? 'bg-sky-500/20 border-2 border-sky-400 text-sky-400'
                                                : 'bg-slate-800/50 border border-slate-700/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                                }`}
                                            title={preset.name}
                                        >
                                            <Icon size={20} />
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="relative mt-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-700/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#0f172a]/80 backdrop-blur px-2 text-slate-500">Or Custom URL</span>
                                </div>
                            </div>
                            <input
                                type="url"
                                value={PRESET_ICONS.some(p => p.url === config.mascotUrl) ? "" : config.mascotUrl}
                                onChange={(e) => updateConfig({ mascotUrl: e.target.value })}
                                placeholder="https://..."
                                className="glass-input w-full px-3 py-2 text-sm rounded-lg mt-2"
                            />
                        </div>

                        {/* Live Preview Card */}
                        <div className="mt-4 p-4 rounded-xl border border-slate-700/50 bg-[#0f172a]/50 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1" style={{ background: config.themeColor }} />
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
                                    style={{ background: config.themeColor }}
                                >
                                    {/* Try to render the Lucide icon if it matches a preset, else generic img */}
                                    {(() => {
                                        const preset = PRESET_ICONS.find(p => p.url === config.mascotUrl)
                                        if (preset) {
                                            const Icon = preset.icon
                                            return <Icon size={20} />
                                        }
                                        if (config.mascotUrl) return <img src={config.mascotUrl} className="w-full h-full object-cover rounded-full" alt="icon" />
                                        return <Bot size={20} />
                                    })()}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{config.assistantName || "Assistant"}</div>
                                    <div className="text-xs text-slate-500">Always active</div>
                                </div>
                            </div>

                            {/* Decorative chat lines */}
                            <div className="space-y-2 mt-4 opacity-50 blur-[0.5px]">
                                <div className="w-3/4 h-3 bg-slate-700 rounded-full" />
                                <div className="w-1/2 h-3 bg-slate-700 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onNext}
                        disabled={!canProceed}
                        className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    >
                        Continue
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
