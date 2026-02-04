"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { ArrowLeft, Code2, ClipboardCheck, Check, Copy } from "lucide-react"

type Props = {
    config: DendronConfig
    onPrev: () => void
    direction?: number
}

const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
}

export default function StepDeploy({ config, direction = 0 }: Props) {
    const [copied, setCopied] = useState(false)

    const cdnScript = `<script
  src="https://cdn.jsdelivr.net/gh/bitWise72/DendronChat@v1.0.3/dendron-cdn/dist/dendron.min.js"
  data-project-ref="${config.projectRef || "PASTE_REF_HERE"}"
  data-project-id="${config.projectId}">
</script>`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cdnScript)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
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
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 text-blue-400 mb-4">
                        <Code2 size={24} />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                        Almost Finished
                    </h2>
                    <p className="text-slate-400">Copy this code and paste it before the closing body tag of your website.</p>
                </div>

                <div className="bg-[#0b101b] rounded-xl border border-slate-800 p-6 font-mono text-sm text-slate-400 relative group">
                    <button
                        onClick={copyToClipboard}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white"
                    >
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                        {cdnScript}
                    </pre>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 italic text-sm text-blue-200/80">
                    <ClipboardCheck className="shrink-0 text-blue-400" size={20} />
                    <p>Your assistant is live on AWS/Supabase Edge Functions. Zero maintenance. Zero cost (on free tier).</p>
                </div>
            </div>
        </motion.div>
    )
}
