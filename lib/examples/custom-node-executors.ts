import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "../node-types"

/**
 * Example custom node executor that demonstrates how to create new node types
 * This node calculates the square root of its input
 */
export class SquareRootNodeExecutor implements NodeExecutor {
  type = "squareRootNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    const input = inputs.input

    if (input === null || input === undefined) {
      throw new Error("Square root node requires input")
    }

    const num = Number(input)
    if (num < 0) {
      throw new Error("Cannot calculate square root of negative number")
    }

    const result = Math.sqrt(num)
    log(`  √ Square root: √${num} = ${result}`)
    
    return {
      output: result
    }
  }
}

/**
 * Example of a more complex custom node that performs string manipulation
 */
export class WordCountNodeExecutor implements NodeExecutor {
  type = "wordCountNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    const textInput = inputs.input

    if (textInput === null || textInput === undefined) {
      throw new Error("Word count node requires input")
    }

    const text = String(textInput)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    const charCount = text.length
    const charCountNoSpaces = text.replace(/\s/g, '').length

    const result = {
      wordCount,
      charCount,
      charCountNoSpaces,
      words
    }

    log(`  📊 Word count: "${text}" → ${wordCount} words, ${charCount} chars`)
    
    return {
      output: result
    }
  }
}
