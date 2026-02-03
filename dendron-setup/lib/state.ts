export type LLMProvider = "openai" | "gemini" | "anthropic"

export type DendronConfig = {
    assistantName: string
    projectId: string
    themeColor: string
    mascotUrl: string
    systemPrompt: string
    welcomeMessage: string
    websiteUrl: string
    // Provisioning results
    projectRef?: string
    supabaseUrl?: string
    anonKey?: string
    dbConfig?: {
        type: "postgres" | "mongodb"
        connectionString: string
        selectedSchema: any
    }
    // New fields from defaultConfig
    supabaseAnonKey?: string
    llmProvider?: LLMProvider
    llmApiKey?: string
    embeddingModel?: string
    chatModel?: string
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
