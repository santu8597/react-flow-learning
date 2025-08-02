import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "./types"

export class SquareRootNodeExecutor implements NodeExecutor {
  type = "squareRootNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    const input = inputs.input

    if (input === null || input === undefined) {
      throw new Error("Square Root node requires an input")
    }

    const num = Number(input)
    if (num < 0) {
      throw new Error("Cannot calculate square root of a negative number")
    }

    const result = Math.sqrt(num)

    log(`  📐 Square Root: √${num} = ${result}`)
    return {
      output: result
    }
  }
}
