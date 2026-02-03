"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, ChevronRight, Database, Table as TableIcon, Columns } from "lucide-react"

export type TableDef = {
    name: string
    columns: { name: string, type: string }[]
}

type Props = {
    tables: TableDef[]
    initialSelection?: any
    onChange: (selection: any) => void
}

export default function TableSelector({ tables, initialSelection, onChange }: Props) {
    // schema: { [tableName]: [col1, col2] }
    const [selectedSchema, setSelectedSchema] = useState<Record<string, string[]>>(initialSelection || {})
    const [expandedTables, setExpandedTables] = useState<string[]>([])

    const toggleTable = (tableName: string) => {
        const newSchema = { ...selectedSchema }
        if (newSchema[tableName]) {
            delete newSchema[tableName]
        } else {
            // Select all columns by default
            newSchema[tableName] = tables.find(t => t.name === tableName)?.columns.map(c => c.name) || []
        }
        setSelectedSchema(newSchema)
        onChange(newSchema)
    }

    const toggleColumn = (tableName: string, colName: string) => {
        const newSchema = { ...selectedSchema }
        if (!newSchema[tableName]) newSchema[tableName] = []

        if (newSchema[tableName].includes(colName)) {
            newSchema[tableName] = newSchema[tableName].filter(c => c !== colName)
            if (newSchema[tableName].length === 0) delete newSchema[tableName]
        } else {
            newSchema[tableName].push(colName)
        }
        setSelectedSchema(newSchema)
        onChange(newSchema)
    }

    const toggleExpand = (tableName: string) => {
        if (expandedTables.includes(tableName)) {
            setExpandedTables(expandedTables.filter(t => t !== tableName))
        } else {
            setExpandedTables([...expandedTables, tableName])
        }
    }

    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {tables.map(table => {
                const isSelected = !!selectedSchema[table.name]
                const isExpanded = expandedTables.includes(table.name)
                const selectedCount = selectedSchema[table.name]?.length || 0

                return (
                    <div key={table.name} className={`rounded-xl border transition-all duration-200 ${isSelected ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900/30 border-slate-800"}`}>
                        <div className="flex items-center p-3 gap-3">
                            <button onClick={() => toggleExpand(table.name)} className="text-slate-500 hover:text-slate-300">
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>

                            <div className="flex-1 flex items-center gap-2 cursor-pointer" onClick={() => toggleTable(table.name)}>
                                <TableIcon size={18} className={isSelected ? "text-emerald-400" : "text-slate-500"} />
                                <span className={`font-medium ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>{table.name}</span>
                                {selectedCount > 0 && (
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                        {selectedCount} selected
                                    </span>
                                )}
                            </div>

                            <button onClick={() => toggleTable(table.name)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-slate-500"}`}>
                                {isSelected && <Check size={14} className="text-white" />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 pt-0 pl-11 grid grid-cols-2 gap-2">
                                        {table.columns.map(col => {
                                            const isColSelected = selectedSchema[table.name]?.includes(col.name)
                                            return (
                                                <div key={col.name}
                                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
                                                    onClick={() => toggleColumn(table.name, col.name)}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isColSelected ? "bg-emerald-500/50 border-emerald-500/50" : "border-slate-700"}`}>
                                                        {isColSelected && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <span className="truncate" title={col.name}>{col.name}</span>
                                                    <span className="text-xs text-slate-600 font-mono">{col.type}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}
