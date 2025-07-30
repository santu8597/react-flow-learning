import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "./types"

export class InputNodeExecutor implements NodeExecutor {
  type = "inputNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    context.log(`  📥 Input node generating value: ${data.value}`)
    return {
      output: data.value
    }
  }
}
