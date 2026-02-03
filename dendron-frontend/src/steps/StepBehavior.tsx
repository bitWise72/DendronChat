import { motion } from "framer-motion"
import { LLMProvider, providerModels, StepProps } from "../state"
import { ArrowLeft, ArrowRight, Lightbulb, MessageSquare, Zap } from "lucide-react"

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

export default function StepBehavior({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
    const canProceed = config.systemPrompt.trim().length > 0

    const handleProviderChange = (provider: LLMProvider) => {
        const models = providerModels[provider]
        updateConfig({
            llmProvider: provider,
            embeddingModel: models.embedding[0] || "",
            chatModel: models.chat[0] || ""
        })
    }

    return (
        <motion.div
            key="step-behavior"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-panel p-8 rounded-2xl w-full max-w-3xl mx-auto"
        >
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">
                        Intelligence & Behavior
                    </h2>
                    <p className="text-slate-400">Configure the brain behind your assistant.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Zap size={16} className="text-yellow-400" />
                            LLM Provider
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(["openai", "gemini", "anthropic"] as LLMProvider[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handleProviderChange(p)}
                                    className={`p-4 rounded-xl border transition-all duration-200 capitalize font-medium flex flex-col items-center gap-2 ${config.llmProvider === p
                                        ? "bg-violet-500/10 border-violet-500 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                        : "bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    <span>{p}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Chat Model</label>
                            <select
                                value={config.chatModel}
                                onChange={(e) => updateConfig({ chatModel: e.target.value })}
                                className="glass-input w-full px-4 py-3 rounded-xl appearance-none cursor-pointer"
                            >
                                {providerModels[config.llmProvider].chat.map((m) => (
                                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            {providerModels[config.llmProvider].embedding.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Embedding Model</label>
                                    <select
                                        value={config.embeddingModel}
                                        onChange={(e) => updateConfig({ embeddingModel: e.target.value })}
                                        className="glass-input w-full px-4 py-3 rounded-xl appearance-none cursor-pointer"
                                    >
                                        {providerModels[config.llmProvider].embedding.map((m) => (
                                            <option key={m} value={m} className="bg-slate-900">{m}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Lightbulb size={16} className="text-sky-400" />
                            System Prompt
                        </label>
                        <textarea
                            value={config.systemPrompt}
                            onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                            placeholder="You are a helpful assistant for... You answer questions about..."
                            className="glass-input w-full px-4 py-3 rounded-xl min-h-[120px] leading-relaxed"
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
                            className="glass-input w-full px-4 py-3 rounded-xl"
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        onClick={onPrev}
                        className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!canProceed}
                        className="group px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    >
                        Continue
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
