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
}

export const defaultConfig: DendronConfig = {
    assistantName: "Atlas",
    projectId: "my-assistant",
    themeColor: "#38bdf8",
    mascotUrl: "https://api.iconify.design/lucide:bot.svg",
    systemPrompt: "You are a helpful assistant for this website. Answer questions based on the provided context.",
    welcomeMessage: "Hi! How can I help you today?",
    websiteUrl: "",
}
