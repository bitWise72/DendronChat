import { DendronConfig } from "../state"

type Props = {
    step: number
    currentStep: number
    config: DendronConfig
    updateConfig: (partial: Partial<DendronConfig>) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepSupabase({ step, currentStep, config, updateConfig, onNext, onPrev }: Props) {
    const isActive = currentStep === step
    const isComplete = currentStep > step

    const canProceed = config.projectRef.trim().length > 0 && config.llmApiKey.trim().length > 0

    const getSecretEnvName = () => {
        switch (config.llmProvider) {
            case "openai": return "OPENAI_API_KEY"
            case "gemini": return "GEMINI_API_KEY"
            case "anthropic": return "ANTHROPIC_API_KEY"
        }
    }

    if (!isActive && !isComplete) return null

    return (
        <div className={`step ${isComplete ? "completed" : ""}`}>
            <h2>
                <span className="step-number">{isComplete ? "✓" : step}</span>
                Supabase Backend
            </h2>
            {isActive && (
                <div className="step-content">
                    <p style={{ color: "#94a3b8", marginBottom: 8 }}>
                        Supabase hosts your database and Edge Functions. Your data stays in your project.
                    </p>
                    <a
                        href="https://supabase.com/dashboard/projects"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#3b82f6", marginBottom: 16, display: "inline-block" }}
                    >
                        → Create a Supabase Project (opens in new tab)
                    </a>
                    <label>
                        Supabase Project Ref (from your project URL)
                        <input
                            type="text"
                            value={config.projectRef}
                            onChange={(e) => updateConfig({ projectRef: e.target.value })}
                            placeholder="abcd1234"
                        />
                    </label>
                    <label>
                        {getSecretEnvName()} (for Supabase Secrets)
                        <input
                            type="password"
                            value={config.llmApiKey}
                            onChange={(e) => updateConfig({ llmApiKey: e.target.value })}
                            placeholder="sk-..."
                        />
                    </label>
                    <div className="code-block">
                        <strong>1. Run SQL Schema in Supabase SQL Editor:</strong>
                        <br /><br />
                        Copy the contents of <code>supabase/schema.sql</code>
                        <br /><br />
                        <strong>2. Set Secrets in Supabase → Project Settings → Secrets:</strong>
                        <br /><br />
                        {getSecretEnvName()}={config.llmApiKey ? "***" : "(your key)"}<br />
                        EMBEDDING_MODEL={config.embeddingModel}<br />
                        CHAT_MODEL={config.chatModel}<br />
                        LLM_PROVIDER={config.llmProvider}
                        <br /><br />
                        <strong>3. Deploy Edge Functions:</strong>
                        <br /><br />
                        supabase login<br />
                        supabase link --project-ref {config.projectRef || "YOUR_REF"}<br />
                        supabase functions deploy chat<br />
                        supabase functions deploy rag_ingest
                    </div>
                    <div className="row">
                        <button onClick={onPrev} style={{ background: "#475569" }}>← Back</button>
                        <button onClick={onNext} disabled={!canProceed}>Continue to Deploy →</button>
                    </div>
                </div>
            )}
        </div>
    )
}
