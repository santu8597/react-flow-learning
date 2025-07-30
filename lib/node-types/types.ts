export interface NodeExecutionContext {
  inputs: Record<string, any>
  log: (message: string) => void
}

export interface NodeExecutionResult {
  output: any
}

export interface NodeExecutor {
  type: string
  execute(data: any, context: NodeExecutionContext): Promise<NodeExecutionResult> | NodeExecutionResult
}

export interface WorkflowNode {
  id: string
  type: string
  data: any
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  targetHandle?: string
  sourceHandle?: string
}

export interface WorkflowResult {
  nodeResults: Record<
    string,
    {
      inputs: Record<string, any>
      output: any
      executionTime: number
      status: "success" | "error"
      error?: string
    }
  >
  totalExecutionTime: number
  executionOrder: string[]
}
