export function buildSystemPrompt(baseSystemPrompt: string, contextChunks: string[]) {
    if (!contextChunks || contextChunks.length === 0) {
        return baseSystemPrompt
    }

    const contextBlock = contextChunks.join("\n\n---\n\n")

    return `${baseSystemPrompt}

### CONTEXT FROM WEBSITE (READ-ONLY)
The following content is retrieved from the user's website. Use it to answer questions. 
If the answer is not in the context, say you don't know (unless it's general knowledge allowed by your persona).
Do not hallucinate facts about the website.

${contextBlock}

### END CONTEXT
`
}
