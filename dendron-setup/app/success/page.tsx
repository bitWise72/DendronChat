"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bot, Loader2, CheckCircle, Rocket } from "lucide-react"

export default function ProvisionPage() {
    const [status, setStatus] = useState("Initializing...")
    const [error, setError] = useState<string | null>(null)
    const [debug, setDebug] = useState<any>(null)
    const [done, setDone] = useState(false)

    useEffect(() => {
        const run = async () => {
            setStatus("Exchanging OAuth tokens...")
            const params = new URLSearchParams(window.location.search)
            const code = params.get("code")

            if (!code) {
                setError("No code provided. Please restart setup.")
                return
            }

            const config = JSON.parse(localStorage.getItem("dendron_install_config") || "{}")

            try {
                // Step 1: Provision
                setStatus("Provisioning your Supabase project...")
                const res = await fetch("/api/supabase/provision", {
                    method: "POST",
                    body: JSON.stringify({ code, config }),
                })

                const data = await res.json()
                if (!res.ok) {
                    setError(data.error || "Provisioning failed")
                    setDebug(data.debug || data)
                    return
                }

                setStatus("Executing SQL schema...")
                // Wait simulated or actual
                await new Promise(r => setTimeout(r, 2000))

                setStatus("Deploying Edge Functions...")
                await new Promise(r => setTimeout(r, 2000))

                setStatus("Finalizing...")

                // Save result
                localStorage.setItem("dendron_install_config", JSON.stringify({
                    ...config,
                    projectRef: data.projectRef,
                    supabaseUrl: data.supabaseUrl,
                    anonKey: data.anonKey
                }))

                setDone(true)
                setTimeout(() => { window.location.href = "/?step=5" }, 1500)
            } catch (e: any) {
                setError(e.message)
            }
        }
        run()
    }, [])

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-white text-center">
            <div className="max-w-md w-full glass-panel p-12 rounded-3xl space-y-8">
                {error ? (
                    <>
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
                            <Bot size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-red-400">Oops!</h1>
                        <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-left overflow-auto max-h-60">
                            <p className="text-red-400 font-mono text-sm mb-2 font-bold">{error}</p>
                            {debug && (
                                <pre className="text-slate-500 text-[10px] leading-tight overflow-x-auto bg-black/20 p-2 rounded">
                                    {JSON.stringify(debug, null, 2)}
                                </pre>
                            )}
                            {status && <p className="text-slate-500 text-xs mt-2 border-t border-white/5 pt-2">Last Status: {status}</p>}
                        </div>
                        <button onClick={() => window.location.href = "/"} className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold">Restart Setup</button>
                    </>
                ) : done ? (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                            <CheckCircle size={40} />
                        </motion.div>
                        <h1 className="text-2xl font-bold">Success!</h1>
                        <p className="text-slate-400">Your assistant is ready. Redirecting you to the code snippet...</p>
                    </>
                ) : (
                    <>
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative w-full h-full flex items-center justify-center text-sky-400">
                                <Loader2 size={48} className="animate-spin" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight glow-text">Installing...</h1>
                        <p className="text-slate-400 animate-pulse">{status}</p>
                        <div className="space-y-2 pt-4">
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 15, ease: "linear" }}
                                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
