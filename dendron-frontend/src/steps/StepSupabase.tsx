import { motion } from "framer-motion"
import { StepProps } from "../state"
import { ArrowLeft, ArrowRight, Database, Terminal, KeyRound, Copy } from "lucide-react"

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

export default function StepSupabase({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
    const canProceed = config.projectRef.trim().length > 0 && config.llmApiKey.trim().length > 0

    const getSecretEnvName = () => {
        switch (config.llmProvider) {
            case "openai": return "OPENAI_API_KEY"
            case "gemini": return "GEMINI_API_KEY"
            case "anthropic": return "ANTHROPIC_API_KEY"
        }
    }

    const copyCommand = (text: string) => {
        navigator.clipboard.writeText(text)
        // Could add toast here
    }

    return (
        <motion.div
            key="step-supabase"
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
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-orange-500/10 text-orange-400 mb-4">
                        <Database size={24} />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
                        Your Backend
                    </h2>
                    <p className="text-slate-400">
                        Dendron is serverless. You own the infrastructure on Supabase.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Supabase Project Ref</label>
                            <input
                                type="text"
                                value={config.projectRef}
                                onChange={(e) => updateConfig({ projectRef: e.target.value })}
                                placeholder="e.g. abcd1234efgh"
                                className="glass-input w-full px-4 py-3 rounded-xl font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500">Found in your Project Settings URL</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <KeyRound size={14} />
                                {getSecretEnvName()}
                            </label>
                            <input
                                type="password"
                                value={config.llmApiKey}
                                onChange={(e) => updateConfig({ llmApiKey: e.target.value })}
                                placeholder="sk-..."
                                className="glass-input w-full px-4 py-3 rounded-xl font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Setup Guide */}
                    <div className="bg-[#0b101b] rounded-xl border border-slate-800 overflow-hidden">
                        <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                            <Terminal size={14} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Setup Instructions</span>
                        </div>

                        <div className="p-6 space-y-6 text-sm">
                            {/* Step 1 */}
                            <div>
                                <strong className="text-orange-400 block mb-2">1. Initialize Database</strong>
                                <p className="text-slate-400 mb-2">Run the following SQL in your Supabase SQL Editor:</p>
                                <div className="bg-black/50 p-3 rounded-lg text-slate-300 font-mono text-xs relative group cursor-pointer hover:bg-black/70 transition-colors"
                                    onClick={() => copyCommand("create extension if not exists vector; ...")}>
                                    <Copy size={12} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    (Content of supabase/schema.sql)
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div>
                                <strong className="text-orange-400 block mb-2">2. Set Secrets</strong>
                                <div className="space-y-1 text-slate-400 font-mono text-xs">
                                    <div className="flex justify-between border-b border-slate-800/50 pb-1">
                                        <span>{getSecretEnvName()}</span>
                                        <span className="text-slate-500">{config.llmApiKey ? "********" : "(waiting for input)"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800/50 pb-1">
                                        <span>EMBEDDING_MODEL</span>
                                        <span className="text-slate-500">{config.embeddingModel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>CHAT_MODEL</span>
                                        <span className="text-slate-500">{config.chatModel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div>
                                <strong className="text-orange-400 block mb-2">3. Deploy Functions</strong>
                                <div className="bg-black/50 p-3 rounded-lg text-green-400 font-mono text-xs space-y-1">
                                    <div>supabase login</div>
                                    <div>supabase link --project-ref {config.projectRef || "<YOUR_REF>"}</div>
                                    <div>supabase functions deploy chat</div>
                                    <div>supabase functions deploy rag_ingest</div>
                                </div>
                            </div>
                        </div>
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
                        className="group px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    >
                        Finish & Deploy
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
