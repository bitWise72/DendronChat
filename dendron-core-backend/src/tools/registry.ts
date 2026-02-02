import { Tool } from "./types.js"

const tools = new Map<string, Tool>()

export function registerTool(tool: Tool) {
    tools.set(tool.name, tool)
}

export function getTool(name: string) {
    return tools.get(name)
}
