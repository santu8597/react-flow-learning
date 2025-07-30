import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "./types"

export class MathNodeExecutor implements NodeExecutor {
  type = "mathNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    const inputA = inputs.inputA
    const inputB = inputs.inputB

    if (inputA === null || inputA === undefined || inputB === null || inputB === undefined) {
      throw new Error("Math node requires both inputs A and B")
    }

    const numA = Number(inputA)
    const numB = Number(inputB)
    let result: number

    switch (data.operation) {
      case "add":
        result = numA + numB
        break
      case "subtract":
        result = numA - numB
        break
      case "multiply":
        result = numA * numB
        break
      case "divide":
        if (numB === 0) throw new Error("Division by zero")
        result = numA / numB
        break
      default:
        throw new Error(`Unknown math operation: ${data.operation}`)
    }

    log(`  🧮 Math: ${numA} ${data.operation} ${numB} = ${result}`)
    return {
      output: result
    }
  }
}
