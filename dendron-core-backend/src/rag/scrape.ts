import fetch from "node-fetch"
import * as cheerio from "cheerio"

export async function scrapeUrl(url: string) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`)
        }
        const html = await response.text()
        const $ = cheerio.load(html)

        // Remove script, style, noscript
        $("script, style, noscript").remove()

        // Extract text
        // Normalize whitespace: replace newlines/tabs with space, remove multiple spaces
        const text = $("body").text().replace(/\s+/g, " ").trim()

        return text
    } catch (error) {
        console.error(`Error scraping ${url}:`, error)
        throw error
    }
}
