import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "./types"

export class ConditionNodeExecutor implements NodeExecutor {
  type = "conditionNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    const condInputA = inputs.inputA
    const condInputB = inputs.inputB

    if (condInputA === null || condInputA === undefined || condInputB === null || condInputB === undefined) {
      throw new Error("Condition node requires both inputs A and B")
    }

    const valueA = Number(condInputA)
    const valueB = Number(condInputB)
    let condResult: boolean

    switch (data.condition) {
      case "greater":
        condResult = valueA > valueB
        break
      case "less":
        condResult = valueA < valueB
        break
      case "equal":
        condResult = valueA === valueB
        break
      default:
        throw new Error(`Unknown condition: ${data.condition}`)
    }

    log(`  🔀 Condition: ${valueA} ${data.condition} ${valueB} = ${condResult}`)
    return {
      output: condResult
    }
  }
}
