import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DendronConfig, defaultConfig } from "./state"
import StepIdentity from "./steps/StepIdentity"
import StepBehavior from "./steps/StepBehavior"
import StepKnowledge from "./steps/StepKnowledge"
import StepSupabase from "./steps/StepSupabase"
import StepDeploy from "./steps/StepDeploy" // Note: Rename StepDeploy.tsx if case sensitivity issues arise
import { Sparkles } from "lucide-react"

export default function App() {
    const [config, setConfig] = useState<DendronConfig>(defaultConfig)
    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(0)

    const updateConfig = (partial: Partial<DendronConfig>) => {
        setConfig((prev) => ({ ...prev, ...partial }))
    }

    const nextStep = () => {
        setDirection(1)
        setCurrentStep((s) => Math.min(s + 1, 5))
    }

    const prevStep = () => {
        setDirection(-1)
        setCurrentStep((s) => Math.max(s - 1, 1))
    }

    const steps = [
        { id: 1, title: "Identity", component: StepIdentity },
        { id: 2, title: "Behavior", component: StepBehavior },
        { id: 3, title: "Knowledge", component: StepKnowledge },
        { id: 4, title: "Supabase", component: StepSupabase },
        { id: 5, title: "Deploy", component: StepDeploy },
    ]

    return (
        <div className="min-h-screen text-slate-200 selection:bg-sky-500/30">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">
                        <Sparkles size={14} />
                        <span>AI Assistant Builder</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4 glow-text tracking-tight">
                        Dendron
                    </h1>
                    <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                        Craft a user-owned, intelligent assistant for your website in minutes.
                        <br className="hidden sm:block" /> No monthly fees. Full control.
                    </p>
                </motion.div>

                {/* Progress System */}
                <div className="mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 -z-10 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                    />
                    <div className="flex justify-between">
                        {steps.map((s) => {
                            const isActive = s.id === currentStep
                            const isCompleted = s.id < currentStep
                            return (
                                <div key={s.id} className="flex flex-col items-center gap-3 relative group">
                                    <motion.div
                                        animate={{
                                            scale: isActive ? 1.1 : 1,
                                            backgroundColor: isActive || isCompleted ? "#0f172a" : "#0f172a",
                                            borderColor: isActive ? "#38bdf8" : isCompleted ? "#8b5cf6" : "#334155",
                                        }}
                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300 ${isActive ? 'shadow-[0_0_15px_rgba(56,189,248,0.3)]' : ''}`}
                                    >
                                        {isCompleted ? (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                <span className="text-violet-400 font-bold">✓</span>
                                            </motion.div>
                                        ) : (
                                            <span className={`text-sm font-semibold ${isActive ? "text-sky-400" : "text-slate-600"}`}>
                                                {s.id}
                                            </span>
                                        )}
                                    </motion.div>
                                    <span className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 absolute -bottom-8 w-max ${isActive ? "text-sky-400" : "text-slate-600"}`}>
                                        {s.title}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait" custom={direction}>
                        {steps.map((s) => {
                            if (s.id !== currentStep) return null
                            const StepComponent = s.component
                            return (
                                <StepComponent
                                    key={s.id}
                                    step={s.id}
                                    currentStep={currentStep}
                                    config={config}
                                    updateConfig={updateConfig}
                                    onNext={nextStep}
                                    onPrev={prevStep}
                                    direction={direction} // Pass direction for slide animation
                                />
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
