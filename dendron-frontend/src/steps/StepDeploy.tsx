import { useState } from "react"
import { motion } from "framer-motion"
import { StepProps } from "../state"
import { ArrowLeft, ArrowRight, Code2, ClipboardCheck, PlayCircle, Check, Copy } from "lucide-react"

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

export default function StepDeploy({ step: _step, config, updateConfig: _updateConfig, onNext: _onNext, onPrev, direction = 0 }: Props) {
    const [testMessage, setTestMessage] = useState("")
    const [testResponse, setTestResponse] = useState("")
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const cdnScript = `<script
  src="https://cdn.jsdelivr.net/gh/bitWise72/DendronChat@v1.0.0/dendron-cdn/dist/dendron.min.js"
  data-project-ref="${config.projectRef}"
  data-project-id="${config.projectId}">
</script>`

    const testChat = async () => {
        if (!testMessage.trim()) return
        setLoading(true)
        setTestResponse("")
        try {
            const res = await fetch(
                `https://${config.projectRef}.functions.supabase.co/chat`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId: config.projectId,
                        message: testMessage
                    })
                }
            )
            const json = await res.json()
            setTestResponse(json.answer || json.error || "No response")
        } catch (e) {
            setTestResponse("Network error - check console")
        }
        setLoading(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cdnScript)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div
            key="step-deploy"
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
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 text-blue-400 mb-4">
                        <Code2 size={24} />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                        Ready to Launch
                    </h2>
                    <p className="text-slate-400">
                        Your assistant is configured. Test it out and embed the code.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Test Chat */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <PlayCircle size={16} /> Live Preview
                        </h3>
                        <div className="bg-[#0b101b] rounded-xl border border-slate-800 h-[300px] flex flex-col p-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 pointer-events-none" />

                            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                                {testResponse ? (
                                    <>
                                        <div className="bg-slate-800/50 self-end p-3 rounded-xl rounded-br-none max-w-[85%] ml-auto text-sm text-slate-200">
                                            {testMessage}
                                        </div>
                                        <div className="bg-blue-600/20 p-3 rounded-xl rounded-bl-none max-w-[85%] text-sm text-blue-100 border border-blue-500/30">
                                            {testResponse}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm italic">
                                        <span>"Hello, how can I help?"</span>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && testChat()}
                                    placeholder="Type a message..."
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-4 pr-12 py-3 text-sm focus:border-blue-500/50 outline-none hover:bg-slate-800/80 transition-colors"
                                />
                                <button
                                    onClick={testChat}
                                    disabled={loading || !testMessage.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 rounded-md text-white disabled:opacity-50 disabled:bg-slate-700"
                                >
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Embed Code */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <Code2 size={16} /> Embed Code
                        </h3>
                        <div className="bg-[#0b101b] rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-400 relative group">
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white"
                                >
                                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <pre className="overflow-x-auto whitespace-pre-wrap break-all max-h-[250px] leading-relaxed">
                                {cdnScript}
                            </pre>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                            <ClipboardCheck className="shrink-0 text-blue-400" size={20} />
                            <p className="text-sm text-blue-200/80 leading-relaxed">
                                Paste this snippet into your website's HTML, ideally right before the closing <code className="bg-blue-900/40 px-1 py-0.5 rounded text-blue-200">&lt;/body&gt;</code> tag.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-start pt-4">
                    <button
                        onClick={onPrev}
                        className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back to Config
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
