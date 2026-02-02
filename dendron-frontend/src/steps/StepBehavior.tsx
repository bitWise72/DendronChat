import { DendronConfig, LLMProvider, providerModels } from "../state"

type Props = {
    step: number
    currentStep: number
    config: DendronConfig
    updateConfig: (partial: Partial<DendronConfig>) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepBehavior({ step, currentStep, config, updateConfig, onNext, onPrev }: Props) {
    const isActive = currentStep === step
    const isComplete = currentStep > step

    const canProceed = config.systemPrompt.trim().length > 0

    const handleProviderChange = (provider: LLMProvider) => {
        const models = providerModels[provider]
        updateConfig({
            llmProvider: provider,
            embeddingModel: models.embedding[0] || "",
            chatModel: models.chat[0] || ""
        })
    }

    if (!isActive && !isComplete) return null

    return (
        <div className={`step ${isComplete ? "completed" : ""}`}>
            <h2>
                <span className="step-number">{isComplete ? "✓" : step}</span>
                Behavior & Intelligence
            </h2>
            {isActive && (
                <div className="step-content">
                    <label>
                        LLM Provider
                        <select
                            value={config.llmProvider}
                            onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
                        >
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="anthropic">Anthropic Claude</option>
                        </select>
                    </label>
                    <div className="row">
                        <label>
                            Chat Model
                            <select
                                value={config.chatModel}
                                onChange={(e) => updateConfig({ chatModel: e.target.value })}
                            >
                                {providerModels[config.llmProvider].chat.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </label>
                        {providerModels[config.llmProvider].embedding.length > 0 && (
                            <label>
                                Embedding Model
                                <select
                                    value={config.embeddingModel}
                                    onChange={(e) => updateConfig({ embeddingModel: e.target.value })}
                                >
                                    {providerModels[config.llmProvider].embedding.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                    <label>
                        System Prompt
                        <textarea
                            value={config.systemPrompt}
                            onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                            placeholder="You are a helpful assistant..."
                        />
                    </label>
                    <label>
                        Welcome Message
                        <input
                            type="text"
                            value={config.welcomeMessage}
                            onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                            placeholder="Hello! How can I help you?"
                        />
                    </label>
                    <div className="row">
                        <button onClick={onPrev} style={{ background: "#475569" }}>← Back</button>
                        <button onClick={onNext} disabled={!canProceed}>Continue to Knowledge →</button>
                    </div>
                </div>
            )}
        </div>
    )
}
