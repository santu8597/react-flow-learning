import { 
  runWorkflow, 
  NodeExecutorRegistry, 
  defaultNodeRegistry,
  WorkflowNode,
  WorkflowEdge 
} from "../workflow-engine"
import { SquareRootNodeExecutor, WordCountNodeExecutor } from "./custom-node-executors"

/**
 * Example showing how to use the default node registry
 */
export async function exampleBasicWorkflow() {
  const nodes: WorkflowNode[] = [
    {
      id: "input1",
      type: "inputNode",
      data: { value: 10 },
      position: { x: 0, y: 0 }
    },
    {
      id: "input2", 
      type: "inputNode",
      data: { value: 5 },
      position: { x: 0, y: 100 }
    },
    {
      id: "math1",
      type: "mathNode",
      data: { operation: "add" },
      position: { x: 200, y: 50 }
    },
    {
      id: "output1",
      type: "outputNode", 
      data: {},
      position: { x: 400, y: 50 }
    }
  ]

  const edges: WorkflowEdge[] = [
    { id: "e1", source: "input1", target: "math1", targetHandle: "inputA" },
    { id: "e2", source: "input2", target: "math1", targetHandle: "inputB" },
    { id: "e3", source: "math1", target: "output1" }
  ]

  const result = await runWorkflow({ nodes, edges })
  console.log("Basic workflow result:", result)
  return result
}

/**
 * Example showing how to create a custom registry with additional node types
 */
export async function exampleCustomWorkflow() {
  // Create a custom registry
  const customRegistry = new NodeExecutorRegistry()
  
  // Add custom node executors
  customRegistry.register(new SquareRootNodeExecutor())
  customRegistry.register(new WordCountNodeExecutor())

  const nodes: WorkflowNode[] = [
    {
      id: "input1",
      type: "inputNode",
      data: { value: 16 },
      position: { x: 0, y: 0 }
    },
    {
      id: "sqrt1",
      type: "squareRootNode",
      data: {},
      position: { x: 200, y: 0 }
    },
    {
      id: "output1",
      type: "outputNode",
      data: {},
      position: { x: 400, y: 0 }
    }
  ]

  const edges: WorkflowEdge[] = [
    { id: "e1", source: "input1", target: "sqrt1" },
    { id: "e2", source: "sqrt1", target: "output1" }
  ]

  const result = await runWorkflow({ nodes, edges }, undefined, customRegistry)
  console.log("Custom workflow result:", result)
  return result
}

/**
 * Example showing how to extend the default registry
 */
export async function exampleExtendedDefaultWorkflow() {
  // Add custom nodes to the default registry
  defaultNodeRegistry.register(new WordCountNodeExecutor())

  const nodes: WorkflowNode[] = [
    {
      id: "input1",
      type: "inputNode", 
      data: { value: "Hello world! This is a test sentence." },
      position: { x: 0, y: 0 }
    },
    {
      id: "wordCount1",
      type: "wordCountNode",
      data: {},
      position: { x: 200, y: 0 }
    },
    {
      id: "output1",
      type: "outputNode",
      data: {},
      position: { x: 400, y: 0 }
    }
  ]

  const edges: WorkflowEdge[] = [
    { id: "e1", source: "input1", target: "wordCount1" },
    { id: "e2", source: "wordCount1", target: "output1" }
  ]

  const result = await runWorkflow({ nodes, edges })
  console.log("Extended default workflow result:", result)
  return result
}
