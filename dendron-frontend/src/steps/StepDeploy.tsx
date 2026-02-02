import { useState } from "react"
import { DendronConfig } from "../state"

type Props = {
    step: number
    currentStep: number
    config: DendronConfig
    onPrev: () => void
}

export default function StepDeploy({ step, currentStep, config, onPrev }: Props) {
    const isActive = currentStep === step
    const [testMessage, setTestMessage] = useState("")
    const [testResponse, setTestResponse] = useState("")
    const [loading, setLoading] = useState(false)

    const cdnScript = `<script
  src="https://cdn.jsdelivr.net/gh/bitWise72/DendronChat@v1.0.0/dendron-cdn/dist/dendron.min.js"
  data-project-ref="${config.projectRef}"
  data-project-id="${config.projectId}">
</script>`

    const testChat = async () => {
        if (!testMessage.trim()) return
        setLoading(true)
        setTestResponse("")
        try {
            const res = await fetch(
                `https://${config.projectRef}.functions.supabase.co/chat`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        projectId: config.projectId,
                        message: testMessage
                    })
                }
            )
            const json = await res.json()
            setTestResponse(json.answer || json.error || "No response")
        } catch (e) {
            setTestResponse("Network error")
        }
        setLoading(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cdnScript)
        alert("Copied to clipboard!")
    }

    if (!isActive) return null

    return (
        <div className="step">
            <h2>
                <span className="step-number">🚀</span>
                Deploy Your Assistant
            </h2>
            <div className="step-content">
                <h3 style={{ marginBottom: 12 }}>Test Your Assistant</h3>
                <div className="row">
                    <input
                        type="text"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="Ask a question..."
                        onKeyDown={(e) => e.key === "Enter" && testChat()}
                    />
                    <button onClick={testChat} disabled={loading} style={{ flex: "none", width: 100 }}>
                        {loading ? "..." : "Test"}
                    </button>
                </div>
                {testResponse && (
                    <div className="preview-box">
                        <strong>Response:</strong>
                        <p style={{ marginTop: 8 }}>{testResponse}</p>
                    </div>
                )}

                <h3 style={{ marginTop: 24, marginBottom: 12 }}>Your CDN Script</h3>
                <p style={{ color: "#94a3b8", marginBottom: 8 }}>
                    Add this script to your website's HTML to embed the chat widget.
                </p>
                <div className="code-block">{cdnScript}</div>
                <button onClick={copyToClipboard}>Copy Script</button>

                <h3 style={{ marginTop: 24, marginBottom: 12 }}>Configuration Summary</h3>
                <div className="code-block">
                    Assistant: {config.assistantName}<br />
                    Project ID: {config.projectId}<br />
                    Provider: {config.llmProvider}<br />
                    Chat Model: {config.chatModel}<br />
                    Embedding Model: {config.embeddingModel || "N/A"}<br />
                    System Prompt: {config.systemPrompt.substring(0, 50)}...
                </div>

                <button onClick={onPrev} style={{ background: "#475569", marginTop: 16 }}>
                    ← Back to Edit
                </button>
            </div>
        </div>
    )
}
