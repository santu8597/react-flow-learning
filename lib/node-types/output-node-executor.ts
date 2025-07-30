import { NodeExecutor, NodeExecutionContext, NodeExecutionResult } from "./types"

export class OutputNodeExecutor implements NodeExecutor {
  type = "outputNode"

  execute(data: any, context: NodeExecutionContext): NodeExecutionResult {
    const { inputs, log } = context
    const outputInput = inputs.input
    
    log(`  📤 Output: ${JSON.stringify(outputInput)}`)
    return {
      output: outputInput
    }
  }
}
