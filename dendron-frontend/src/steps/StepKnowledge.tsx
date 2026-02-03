import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StepProps } from "../state"
import { ArrowLeft, ArrowRight, Globe, Lock, CheckCircle2, AlertCircle, Zap } from "lucide-react"

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

export default function StepKnowledge({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [loading, setLoading] = useState(false)

    // We allow proceeding even if they skip ingest, but the button to ingest needs valid inputs
    const canIngest = config.websiteUrl.trim().length > 0 && config.projectRef.trim().length > 0

    const ingest = async () => {
        if (!canIngest) return
        setLoading(true)
        setStatus(null)
        try {
            const res = await fetch(
                `https://${config.projectRef}.functions.supabase.co/rag_ingest`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId: config.projectId,
                        url: config.websiteUrl
                    })
                }
            )
            const json = await res.json()
            if (res.ok) {
                setStatus({ type: "success", message: `Successfully ingested ${json.chunks} snippets from your site.` })
            } else {
                // Friendly error parsing
                setStatus({ type: "error", message: json.error || "Could not access the URL. Ensure Supabase is deployed first." })
            }
        } catch (e) {
            setStatus({ type: "error", message: "Network error. Have you deployed the Edge Functions yet?" })
        }
        setLoading(false)
    }

    return (
        <motion.div
            key="step-knowledge"
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
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
                        <Globe size={24} />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                        Knowledge Base
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Train your assistant on your website content. <br />
                        <span className="text-xs text-slate-500">(Requires Supabase setup from next step if not done yet)</span>
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="relative group">
                        <input
                            type="url"
                            value={config.websiteUrl}
                            onChange={(e) => updateConfig({ websiteUrl: e.target.value })}
                            placeholder="https://docs.yourstartup.com"
                            className="glass-input w-full px-12 py-4 rounded-xl text-lg placeholder:text-slate-600 focus:border-emerald-500/50"
                        />
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-sm text-slate-400 flex gap-3">
                        <Lock size={16} className="shrink-0 mt-0.5" />
                        <p>
                            We only scrape readable text. No secrets or private data is stored unless it is public on the URL.
                            Data is stored in your private Supabase Vector DB.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={ingest}
                            disabled={!canIngest || loading}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
                            ) : (
                                <Zap size={18} />
                            )}
                            {loading ? "Ingesting..." : "Ingest Website Content"}
                        </button>

                        <AnimatePresence>
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                                >
                                    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-slate-800">
                    <button
                        onClick={onPrev}
                        className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button
                        onClick={onNext}
                        className="group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95 flex items-center gap-2"
                    >
                        Continue
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
