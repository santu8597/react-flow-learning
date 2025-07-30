import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowResult,
  NodeExecutorRegistry,
  defaultNodeRegistry
} from "./node-types"

// Re-export types for convenience
export type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowResult
} from "./node-types"

export {
  NodeExecutorRegistry,
  defaultNodeRegistry
} from "./node-types"

export async function runWorkflow(
  workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] },
  logger?: (message: string) => void,
  nodeRegistry: NodeExecutorRegistry = defaultNodeRegistry,
): Promise<WorkflowResult> {
  const startTime = Date.now()
  const nodeResults: WorkflowResult["nodeResults"] = {}
  const executionOrder: string[] = []

  const log = (message: string) => {
    if (logger) logger(message)
    console.log(message)
  }

  // Create adjacency maps
  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]))
  const incomingEdges = new Map<string, WorkflowEdge[]>()
  const outgoingEdges = new Map<string, WorkflowEdge[]>()

  // Build edge maps
  workflow.edges.forEach((edge) => {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, [])
    }
    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, [])
    }
    incomingEdges.get(edge.target)!.push(edge)
    outgoingEdges.get(edge.source)!.push(edge)
  })

  // Find execution order using topological sort
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const sorted: string[] = []

  const topologicalSort = (nodeId: string) => {
    if (visiting.has(nodeId)) {
      throw new Error(`Circular dependency detected involving node ${nodeId}`)
    }
    if (visited.has(nodeId)) {
      return
    }

    visiting.add(nodeId)
    const outgoing = outgoingEdges.get(nodeId) || []
    outgoing.forEach((edge) => topologicalSort(edge.target))
    visiting.delete(nodeId)
    visited.add(nodeId)
    sorted.unshift(nodeId)
  }

  // Sort all nodes
  workflow.nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      topologicalSort(node.id)
    }
  })

  log(`📋 Execution order: ${sorted.join(" → ")}`)

  // Execute nodes in topological order
  for (const nodeId of sorted) {
    const node = nodeMap.get(nodeId)
    if (!node) continue

    const nodeStartTime = Date.now()
    executionOrder.push(nodeId)

    try {
      log(`🔄 Executing node ${nodeId} (${node.type})`)

      // Get inputs from connected nodes
      const incoming = incomingEdges.get(nodeId) || []
      const inputs: Record<string, any> = {}

      // For nodes with multiple inputs, organize by handle
      incoming.forEach((edge) => {
        const sourceResult = nodeResults[edge.source]
        const inputValue = sourceResult ? sourceResult.output : null

        if (edge.targetHandle) {
          inputs[edge.targetHandle] = inputValue
        } else {
          inputs.input = inputValue
        }
      })

      // Execute the node
      const result = await executeNode(node, inputs, log, nodeRegistry)

      nodeResults[nodeId] = {
        inputs,
        output: result,
        executionTime: Date.now() - nodeStartTime,
        status: "success",
      }

      log(`✅ Node ${nodeId} completed: ${JSON.stringify(result)}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      nodeResults[nodeId] = {
        inputs: {},
        output: null,
        executionTime: Date.now() - nodeStartTime,
        status: "error",
        error: errorMessage,
      }
      log(`❌ Node ${nodeId} failed: ${errorMessage}`)
    }
  }

  const totalExecutionTime = Date.now() - startTime
  log(`🏁 Workflow completed in ${totalExecutionTime}ms`)

  return {
    nodeResults,
    totalExecutionTime,
    executionOrder,
  }
}

async function executeNode(
  node: WorkflowNode,
  inputs: Record<string, any>,
  log: (message: string) => void,
  nodeRegistry: NodeExecutorRegistry,
): Promise<any> {
  const executor = nodeRegistry.getExecutor(node.type)
  
  if (!executor) {
    throw new Error(`No executor found for node type: ${node.type}`)
  }

  const context = { inputs, log }
  const result = await executor.execute(node.data, context)
  
  return result.output
}
