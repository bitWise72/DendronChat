export type LLMProvider = "openai" | "gemini" | "anthropic"

export type DendronConfig = {
    projectId: string
    projectRef: string
    supabaseUrl: string
    supabaseAnonKey: string
    llmProvider: LLMProvider
    llmApiKey: string
    embeddingModel: string
    chatModel: string
    systemPrompt: string
    welcomeMessage: string
    websiteUrl: string
    assistantName: string
    themeColor: string
    mascotUrl: string
}

export type StepProps = {
    step: number
    currentStep: number
    config: DendronConfig
    updateConfig: (partial: Partial<DendronConfig>) => void
    onNext: () => void
    onPrev: () => void
    direction?: number
}

export const defaultConfig: DendronConfig = {
    projectId: "",
    projectRef: "",
    supabaseUrl: "",
    supabaseAnonKey: "",
    llmProvider: "openai",
    llmApiKey: "",
    embeddingModel: "text-embedding-3-small",
    chatModel: "gpt-4o-mini",
    systemPrompt: "You are a helpful assistant.",
    welcomeMessage: "Hello! How can I help you today?",
    websiteUrl: "",
    assistantName: "My Assistant",
    themeColor: "#111827",
    mascotUrl: ""
}

export const providerModels: Record<LLMProvider, { embedding: string[]; chat: string[] }> = {
    openai: {
        embedding: ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"],
        chat: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"]
    },
    gemini: {
        embedding: ["text-embedding-004"],
        chat: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"]
    },
    anthropic: {
        embedding: [],
        chat: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"]
    }
}
