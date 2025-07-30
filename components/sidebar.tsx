"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Calculator, Type, Eye, GitBranch, Hash } from "lucide-react"

const nodeTypes = [
  {
    type: "inputNode",
    label: "Number Input",
    icon: Hash,
    description: "Generates numeric values",
    color: "bg-blue-100 border-blue-300",
  },
  {
    type: "mathNode",
    label: "Math Operation",
    icon: Calculator,
    description: "Performs mathematical operations",
    color: "bg-green-100 border-green-300",
  },
  {
    type: "textNode",
    label: "Text Operation",
    icon: Type,
    description: "Processes text data",
    color: "bg-purple-100 border-purple-300",
  },
  {
    type: "conditionNode",
    label: "Condition",
    icon: GitBranch,
    description: "Evaluates conditions",
    color: "bg-yellow-100 border-yellow-300",
  },
  {
    type: "outputNode",
    label: "Display Output",
    icon: Eye,
    description: "Shows final results",
    color: "bg-red-100 border-red-300",
  },
]

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Block Library</h2>
      <p className="text-sm text-gray-600 mb-6">Drag and drop blocks to build your flow</p>

      <div className="space-y-3">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon
          return (
            <Card
              key={nodeType.type}
              className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${nodeType.color}`}
              draggable
              onDragStart={(event) => onDragStart(event, nodeType.type)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <div>
                  <div className="font-medium text-sm">{nodeType.label}</div>
                  <div className="text-xs text-gray-600">{nodeType.description}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-sm mb-2">How to use:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag blocks from here to the canvas</li>
          <li>• Connect blocks by dragging from output to input</li>
          <li>• Click blocks to customize their properties</li>
          <li>• Select blocks and press Delete/Backspace to remove</li>
          <li>• Use Ctrl/Cmd + click for multi-selection</li>
          <li>• Watch data flow through connections</li>
        </ul>
      </div>
    </div>
  )
}
