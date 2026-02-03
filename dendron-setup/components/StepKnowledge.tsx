"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DendronConfig } from "@/lib/state"
import { ArrowLeft, ArrowRight, Globe, Lock, Database } from "lucide-react"
import TableSelector, { TableDef } from "./TableSelector"

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

export default function StepKnowledge({ config, updateConfig, onNext, onPrev, direction = 0 }: Props) {
    const [mode, setMode] = useState<"website" | "database">("website")
    const [dbType, setDbType] = useState<"postgres" | "mongodb">("postgres")
    const [connString, setConnString] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tables, setTables] = useState<TableDef[]>([])
    const [showSchema, setShowSchema] = useState(false)

    const fetchSchema = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/schema", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: dbType, connectionString: connString })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch schema")

            setTables(data.tables)
            setShowSchema(true)
            // Save initial empty selection or restore if exists
            updateConfig({
                dbConfig: {
                    type: dbType,
                    connectionString: connString,
                    selectedSchema: config.dbConfig?.selectedSchema || {}
                }
            })
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSchemaChange = (selection: any) => {
        updateConfig({
            dbConfig: {
                type: dbType,
                connectionString: connString,
                selectedSchema: selection
            }
        })
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
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                        {mode === "website" ? "Website Knowledge" : "Database Connection"}
                    </h2>
                    <p className="text-slate-400">Where should your assistant get its info?</p>
                </div>

                {/* Mode Toggles */}
                <div className="flex justify-center gap-4 bg-slate-900/50 p-1 rounded-xl w-fit mx-auto border border-slate-800">
                    <button
                        onClick={() => setMode("website")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${mode === "website" ? "bg-slate-800 text-emerald-400 shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Globe size={16} /> Website
                    </button>
                    <button
                        onClick={() => setMode("database")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${mode === "database" ? "bg-slate-800 text-emerald-400 shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Database size={16} /> Database
                    </button>
                </div>

                <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {mode === "website" ? (
                            <motion.div
                                key="website"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="relative mt-8">
                                    <input
                                        type="url"
                                        value={config.websiteUrl}
                                        onChange={(e) => updateConfig({ websiteUrl: e.target.value })}
                                        placeholder="https://yourstartup.com"
                                        className="glass-input w-full px-12 py-4 rounded-xl text-lg outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-sm text-slate-400 flex gap-3">
                                    <Lock size={16} className="shrink-0 mt-0.5" />
                                    <p>The installer will automatically index this site into your private database during setup.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="database"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setDbType("postgres")}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${dbType === "postgres" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                                    >
                                        <Database size={24} />
                                        <span className="font-medium">PostgreSQL</span>
                                    </button>
                                    <button
                                        onClick={() => setDbType("mongodb")}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${dbType === "mongodb" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                                    >
                                        <Database size={24} />
                                        <span className="font-medium">MongoDB</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Connection String</label>
                                    <input
                                        type="text"
                                        value={connString}
                                        onChange={(e) => setConnString(e.target.value)}
                                        placeholder={dbType === "postgres" ? "postgresql://user:pass@host:5432/db" : "mongodb+srv://user:pass@host/db"}
                                        className="glass-input w-full px-4 py-3 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                {!showSchema ? (
                                    <button
                                        onClick={fetchSchema}
                                        disabled={loading || !connString}
                                        className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? "Connecting..." : "Connect & Fetch Schema"}
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-semibold text-slate-300">Select Data to Ingest</h3>
                                            <button onClick={() => setShowSchema(false)} className="text-xs text-slate-500 hover:underline">Change DB</button>
                                        </div>
                                        <TableSelector
                                            tables={tables}
                                            initialSelection={config.dbConfig?.selectedSchema}
                                            onChange={handleSchemaChange}
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-between mt-4">
                    <button onClick={onPrev} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400">Back</button>
                    <button
                        onClick={onNext}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
