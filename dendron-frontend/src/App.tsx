import { useState } from "react"
import { DendronConfig, defaultConfig } from "./state"
import StepIdentity from "./steps/StepIdentity"
import StepBehavior from "./steps/StepBehavior"
import StepKnowledge from "./steps/StepKnowledge"
import StepSupabase from "./steps/StepSupabase"
import StepDeploy from "./steps/StepDeploy"

export default function App() {
    const [config, setConfig] = useState<DendronConfig>(defaultConfig)
    const [currentStep, setCurrentStep] = useState(1)

    const updateConfig = (partial: Partial<DendronConfig>) => {
        setConfig((prev) => ({ ...prev, ...partial }))
    }

    const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 5))
    const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))

    return (
        <div className="app">
            <h1>Dendron Setup Wizard</h1>
            <p className="subtitle">Configure your AI assistant in 5 simple steps</p>

            <StepIdentity
                step={1}
                currentStep={currentStep}
                config={config}
                updateConfig={updateConfig}
                onNext={nextStep}
            />
            <StepBehavior
                step={2}
                currentStep={currentStep}
                config={config}
                updateConfig={updateConfig}
                onNext={nextStep}
                onPrev={prevStep}
            />
            <StepKnowledge
                step={3}
                currentStep={currentStep}
                config={config}
                updateConfig={updateConfig}
                onNext={nextStep}
                onPrev={prevStep}
            />
            <StepSupabase
                step={4}
                currentStep={currentStep}
                config={config}
                updateConfig={updateConfig}
                onNext={nextStep}
                onPrev={prevStep}
            />
            <StepDeploy
                step={5}
                currentStep={currentStep}
                config={config}
                onPrev={prevStep}
            />
        </div>
    )
}
