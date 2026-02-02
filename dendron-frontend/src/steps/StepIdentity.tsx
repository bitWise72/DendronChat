import { DendronConfig } from "../state"

type Props = {
    step: number
    currentStep: number
    config: DendronConfig
    updateConfig: (partial: Partial<DendronConfig>) => void
    onNext: () => void
}

export default function StepIdentity({ step, currentStep, config, updateConfig, onNext }: Props) {
    const isActive = currentStep === step
    const isComplete = currentStep > step

    const canProceed = config.assistantName.trim().length > 0 && config.projectId.trim().length > 0

    if (!isActive && !isComplete) return null

    return (
        <div className={`step ${isComplete ? "completed" : ""}`}>
            <h2>
                <span className="step-number">{isComplete ? "✓" : step}</span>
                Identity
            </h2>
            {isActive && (
                <div className="step-content">
                    <label>
                        Assistant Name
                        <input
                            type="text"
                            value={config.assistantName}
                            onChange={(e) => updateConfig({ assistantName: e.target.value })}
                            placeholder="My Assistant"
                        />
                    </label>
                    <label>
                        Project ID (unique identifier)
                        <input
                            type="text"
                            value={config.projectId}
                            onChange={(e) => updateConfig({ projectId: e.target.value })}
                            placeholder="my-project"
                        />
                    </label>
                    <div className="row">
                        <label>
                            Theme Color
                            <input
                                type="color"
                                value={config.themeColor}
                                onChange={(e) => updateConfig({ themeColor: e.target.value })}
                            />
                        </label>
                        <label>
                            Mascot/Icon URL (optional)
                            <input
                                type="url"
                                value={config.mascotUrl}
                                onChange={(e) => updateConfig({ mascotUrl: e.target.value })}
                                placeholder="https://example.com/icon.png"
                            />
                        </label>
                    </div>
                    <button onClick={onNext} disabled={!canProceed}>
                        Continue to Behavior →
                    </button>
                </div>
            )}
        </div>
    )
}
