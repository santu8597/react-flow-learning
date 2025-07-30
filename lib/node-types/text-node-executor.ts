import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "./types"

export class TextNodeExecutor implements NodeExecutor {
  type = "textNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    const textInput = inputs.input
    
    if (textInput === null || textInput === undefined) {
      throw new Error("Text node requires input")
    }

    const str = String(textInput)
    let textResult: string | number

    switch (data.operation) {
      case "uppercase":
        textResult = str.toUpperCase()
        break
      case "lowercase":
        textResult = str.toLowerCase()
        break
      case "reverse":
        textResult = str.split("").reverse().join("")
        break
      case "length":
        textResult = str.length
        break
      default:
        throw new Error(`Unknown text operation: ${data.operation}`)
    }

    log(`  📝 Text: "${str}" → ${data.operation} → "${textResult}"`)
    return {
      output: textResult
    }
  }
}
