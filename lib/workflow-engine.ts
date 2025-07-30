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

export async function runWorkflow(
  workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] },
  logger?: (message: string) => void,
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
      const result = await executeNode(node, inputs, log)

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
): Promise<any> {
  const { type, data } = node

  switch (type) {
    case "inputNode":
      log(`  📥 Input node generating value: ${data.value}`)
      return data.value

    case "mathNode":
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

      log(`🧮Math: ${numA} ${data.operation} ${numB} = ${result}`)
      return result

    case "textNode":
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
      return textResult

    case "conditionNode":
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
      return condResult

    case "outputNode":
      const outputInput = inputs.input
      log(`  📤 Output: ${JSON.stringify(outputInput)}`)
      return outputInput

    default:
      throw new Error(`Unknown node type: ${type}`)
  }
}
