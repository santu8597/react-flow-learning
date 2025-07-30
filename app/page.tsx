"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {type Node,type Edge,addEdge,Background,type Connection,useNodesState,useEdgesState,
  ReactFlowProvider,
  Controls,
  MiniMap,
  type NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"

import { Sidebar } from "@/components/sidebar"
import { PropertiesPanel } from "@/components/properties-panel"
import { WorkflowGenerator } from "@/components/workflow-generator"
import { InputNode } from "@/components/nodes/input-node"
import { MathNode } from "@/components/nodes/math-node"
import { TextNode } from "@/components/nodes/text-node"
import { OutputNode } from "@/components/nodes/output-node"
import { ConditionNode } from "@/components/nodes/condition-node"
import { runWorkflow, type WorkflowNode, type WorkflowEdge } from "@/lib/workflow-engine"

const nodeTypes: NodeTypes = {
  inputNode: InputNode,
  mathNode: MathNode,
  textNode: TextNode,
  outputNode: OutputNode,
  conditionNode: ConditionNode,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "inputNode",
    position: { x: 50, y: 100 },
    data: {
      label: "Number Input A",
      value: 10,
      output: null,
    },
  },
  {
    id: "2",
    type: "inputNode",
    position: { x: 50, y: 200 },
    data: {
      label: "Number Input B",
      value: 5,
      output: null,
    },
  },
  {
    id: "3",
    type: "mathNode",
    position: { x: 300, y: 150 },
    data: {
      label: "Math Operation",
      operation: "add",
      inputA: null,
      inputB: null,
      output: null,
    },
  },
  {
    id: "4",
    type: "outputNode",
    position: { x: 550, y: 150 },
    data: {
      label: "Display Output",
      input: null,
      output: null,
    },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-3a", source: "1", target: "3", targetHandle: "inputA", animated: true },
  { id: "e2-3b", source: "2", target: "3", targetHandle: "inputB", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true },
]

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [workflowJson, setWorkflowJson] = useState<string>("")
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)

  // Convert React Flow nodes and edges to workflow JSON
  const generateWorkflowJson = useCallback(() => {
    const workflowNodes: WorkflowNode[] = nodes.map((node) => ({
      id: node.id,
      type: node.type || "unknown",
      data: node.data,
      position: node.position,
    }))

    const workflowEdges: WorkflowEdge[] = edges.map((edge) => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      targetHandle: edge.targetHandle,
      sourceHandle: edge.sourceHandle,
    }))

    const workflow = {
      nodes: workflowNodes,
      edges: workflowEdges,
      metadata: {
        created: new Date().toISOString(),
        nodeCount: workflowNodes.length,
        edgeCount: workflowEdges.length,
      },
    }

    return JSON.stringify(workflow, null, 2)
  }, [nodes, edges])

  // Execute the workflow using the JSON
  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    setExecutionLog([])

    try {
      const workflowJson = generateWorkflowJson()
      setWorkflowJson(workflowJson)

      const workflow = JSON.parse(workflowJson)

      // Add execution start log
      setExecutionLog((prev) => [...prev, `🚀 Starting workflow execution...`])
      setExecutionLog((prev) => [
        ...prev,
        `📊 Processing ${workflow.nodes.length} nodes and ${workflow.edges.length} connections`,
      ])

      // Run the workflow engine
      const results = await runWorkflow(workflow, (log: string) => {
        setExecutionLog((prev) => [...prev, log])
      })

      // Update nodes with results
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          const result = results.nodeResults[node.id]
          if (result) {
            return {
              ...node,
              data: {
                ...node.data,
                ...result.inputs, // Spread all inputs (inputA, inputB, etc.)
                output: result.output,
                executionTime: result.executionTime,
                status: result.status,
              },
            }
          }
          return node
        }),
      )

      setExecutionLog((prev) => [...prev, `✅ Workflow completed successfully!`])
      setExecutionLog((prev) => [...prev, `⏱️ Total execution time: ${results.totalExecutionTime}ms`])
    } catch (error) {
      setExecutionLog((prev) => [...prev, `❌ Error: ${error}`])
    } finally {
      setIsExecuting(false)
    }
  }, [generateWorkflowJson, setNodes])

  const clearWorkflow = useCallback(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          inputA: node.type === "inputNode" ? node.data.inputA : null,
          inputB: node.type === "inputNode" ? node.data.inputB : null,
          input: node.type === "inputNode" ? node.data.input : null,
          output: node.type === "inputNode" ? null : null,
          executionTime: undefined,
          status: undefined,
        },
      })),
    )
    setExecutionLog([])
    setWorkflowJson("")
  }, [setNodes])

  const loadGeneratedWorkflow = useCallback(
    (workflow: any) => {
      // Clear current workflow
      setNodes([])
      setEdges([])
      setExecutionLog([])
      setWorkflowJson("")
      setSelectedNode(null)

      // Load new workflow
      setTimeout(() => {
        setNodes(workflow.nodes || [])
        setEdges(workflow.edges || [])
        setExecutionLog((prev) => [
          ...prev,
          `🤖 AI Generated workflow loaded: ${workflow.metadata?.description || "Custom workflow"}`,
        ])
        setExecutionLog((prev) => [
          ...prev,
          `📊 Loaded ${workflow.nodes?.length || 0} nodes and ${workflow.edges?.length || 0} connections`,
        ])
      }, 100)
    },
    [setNodes, setEdges],
  )

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = { ...params, animated: true }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedNode = { ...node, data: { ...node.data, ...newData } }

            // Update selected node if it's the same node
            if (selectedNode && selectedNode.id === nodeId) {
              setSelectedNode(updatedNode)
            }

            return updatedNode
          }
          return node
        }),
      )
    },
    [setNodes, selectedNode],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))

      // Remove connected edges
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))

      // Log the deletion
      setExecutionLog((prev) => [...prev, `🗑️ Deleted node: ${nodeId}`])
    },
    [setNodes, setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      if (typeof type === "undefined" || !type) {
        return
      }

      if (!reactFlowInstance || !reactFlowWrapper.current) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case "inputNode":
        return { label: "Number Input", value: 0, output: null }
      case "mathNode":
        return { label: "Math Operation", operation: "add", inputA: null, inputB: null, output: null }
      case "textNode":
        return { label: "Text Operation", operation: "uppercase", input: null, output: null }
      case "outputNode":
        return { label: "Display Output", input: null, output: null }
      case "conditionNode":
        return { label: "Condition", condition: "greater", inputA: null, inputB: null, output: null }
      default:
        return { label: "Default Node" }
    }
  }

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const deletedNodeIds = deletedNodes.map((node) => node.id)

      // Remove edges connected to deleted nodes
      setEdges((edges) =>
        edges.filter((edge) => !deletedNodeIds.includes(edge.source) && !deletedNodeIds.includes(edge.target)),
      )

      // Clear selected node if it was deleted
      if (selectedNode && deletedNodeIds.includes(selectedNode.id)) {
        setSelectedNode(null)
      }

      // Log the deletion
      setExecutionLog((prev) => [...prev, `🗑️ Deleted ${deletedNodes.length} node(s): ${deletedNodeIds.join(", ")}`])
    },
    [setEdges, selectedNode],
  )

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    const deletedEdgeIds = deletedEdges.map((edge) => edge.id)
    setExecutionLog((prev) => [
      ...prev,
      `🔗 Deleted ${deletedEdges.length} connection(s): ${deletedEdgeIds.join(", ")}`,
    ])
  }, [])

  // Handle keyboard events for deletion - but prevent when editing inputs
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't delete if user is typing in an input field
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
        return
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        // Get selected nodes and edges
        const selectedNodes = nodes.filter((node) => node.selected)
        const selectedEdges = edges.filter((edge) => edge.selected)

        if (selectedNodes.length > 0) {
          setNodes((currentNodes) => currentNodes.filter((node) => !node.selected))
          onNodesDelete(selectedNodes)
        }

        if (selectedEdges.length > 0) {
          setEdges((currentEdges) => currentEdges.filter((edge) => !edge.selected))
          onEdgesDelete(selectedEdges)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [nodes, edges, setNodes, setEdges, onNodesDelete, onEdgesDelete])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        {/* Control Panel */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4">
          <button
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? "🔄 Running..." : "▶️ Run Workflow"}
          </button>

          <button onClick={clearWorkflow} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            🗑️ Clear
          </button>

          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center space-x-2"
          >
            <span>✨</span>
            <span>AI Generate</span>
          </button>

          <button
            onClick={() => {
              const json = generateWorkflowJson()
              setWorkflowJson(json)
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📋 Generate JSON
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
          deleteKeyCode={["Delete", "Backspace"]}
          multiSelectionKeyCode={["Meta", "Ctrl"]}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Right Panel - Properties or Logs */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {selectedNode ? (
          <PropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onDeleteNode={deleteNode}
            onClose={() => setSelectedNode(null)}
          />
        ) : (
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Workflow Status</h3>

            {/* Execution Log */}
            <div className="mb-4 flex-1">
              <h4 className="font-medium mb-2">Execution Log:</h4>
              <div className="bg-gray-100 rounded p-3 h-48 overflow-y-auto text-sm font-mono">
                {executionLog.length === 0 ? (
                  <div className="text-gray-500">No execution yet. Click "Run Workflow" to start.</div>
                ) : (
                  executionLog.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* JSON Output */}
            {workflowJson && (
              <div className="flex-1">
                <h4 className="font-medium mb-2">Workflow JSON:</h4>
                <textarea
                  value={workflowJson}
                  readOnly
                  className="w-full h-48 p-3 border rounded text-xs font-mono resize-none"
                  placeholder="Workflow JSON will appear here..."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Workflow Generator Modal */}
      {showGenerator && (
        <WorkflowGenerator onWorkflowGenerated={loadGeneratedWorkflow} onClose={() => setShowGenerator(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  )
}
