export type LLMProvider = "openai" | "gemini" | "anthropic"

export type DendronConfig = {
    // Identity
    assistantName: string
    mascotUrl: string // URL or Lucide Icon Name
    themeColor: string

    // Behavior
    systemPrompt: string
    welcomeMessage: string

    // Knowledge
    websiteUrl?: string
    dbConfig?: {
        type: "postgres" | "mongodb"
        connectionString?: string
        selectedSchema?: any
    }

    // Brain (LLM)
    llmProvider: "openai" | "anthropic" | "gemini"
    llmApiKey: string
    llmConfig?: any

    // Supabase
    projectRef?: string
    projectId?: string // internal ID
    supabaseUrl?: string
    anonKey?: string
    supabaseAnonKey?: string // Alias for anonKey sometimes used

    // LLM Extras
    embeddingModel?: string
    chatModel?: string

    // Temp
    _tempFunctionCode?: string
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
    mascotUrl: "",
    dbConfig: {
        type: "postgres",
        connectionString: "",
        selectedSchema: null
    }
}
