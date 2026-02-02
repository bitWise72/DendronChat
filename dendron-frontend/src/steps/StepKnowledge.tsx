import { useState } from "react"
import { DendronConfig } from "../state"

type Props = {
    step: number
    currentStep: number
    config: DendronConfig
    updateConfig: (partial: Partial<DendronConfig>) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepKnowledge({ step, currentStep, config, updateConfig, onNext, onPrev }: Props) {
    const isActive = currentStep === step
    const isComplete = currentStep > step
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [loading, setLoading] = useState(false)

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
                setStatus({ type: "success", message: `Ingested ${json.chunks} chunks successfully!` })
            } else {
                setStatus({ type: "error", message: json.error || "Failed to ingest" })
            }
        } catch (e) {
            setStatus({ type: "error", message: "Network error. Is your Supabase configured?" })
        }
        setLoading(false)
    }

    if (!isActive && !isComplete) return null

    return (
        <div className={`step ${isComplete ? "completed" : ""}`}>
            <h2>
                <span className="step-number">{isComplete ? "✓" : step}</span>
                Knowledge (RAG)
            </h2>
            {isActive && (
                <div className="step-content">
                    <p style={{ color: "#94a3b8", marginBottom: 8 }}>
                        Enter your documentation or website URL to ingest. You need to complete the Supabase step first
                        if you haven't deployed the Edge Functions yet.
                    </p>
                    <label>
                        Website URL to Ingest
                        <input
                            type="url"
                            value={config.websiteUrl}
                            onChange={(e) => updateConfig({ websiteUrl: e.target.value })}
                            placeholder="https://docs.example.com"
                        />
                    </label>
                    <button onClick={ingest} disabled={!canIngest || loading}>
                        {loading ? "Ingesting..." : "Ingest Website →"}
                    </button>
                    {status && (
                        <div className={`status ${status.type}`}>{status.message}</div>
                    )}
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        You can skip this step and add knowledge later.
                    </p>
                    <div className="row">
                        <button onClick={onPrev} style={{ background: "#475569" }}>← Back</button>
                        <button onClick={onNext}>Continue to Supabase →</button>
                    </div>
                </div>
            )}
        </div>
    )
}
