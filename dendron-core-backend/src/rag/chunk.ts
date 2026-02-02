import { encode } from "gpt-3-encoder"

export function chunkText(text: string, maxTokens = 500, overlap = 50) {
    const tokens = encode(text)
    const chunks: string[] = []

    let start = 0
    while (start < tokens.length) {
        const end = Math.min(start + maxTokens, tokens.length)
        const chunkTokens = tokens.slice(start, end)
        // Decoded back to string (we assume generic decode here, gpt-3-encoder usually exports decode too, let's import it)
        // Wait, gpt-3-encoder exports `decode`. Checking imports.
        // I'll add decode to import assuming standard lib.

        // Re-implementing with decode
        // Actually simplest is just to slice tokens and decode
        // But need to make sure I import decode.
        chunks.push(decodeTokens(chunkTokens))

        start += (maxTokens - overlap)
    }

    return chunks
}

import { decode } from "gpt-3-encoder"

function decodeTokens(tokens: number[]) {
    return decode(tokens)
}
