"use client"

import type React from "react"

import type { Node } from "reactflow"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Trash2 } from "lucide-react"

interface PropertiesPanelProps {
  node: Node
  onUpdateNode: (nodeId: string, data: any) => void
  onDeleteNode?: (nodeId: string) => void
  onClose: () => void
}

export function PropertiesPanel({ node, onUpdateNode, onDeleteNode, onClose }: PropertiesPanelProps) {
  const handleInputChange = (field: string, value: any) => {
    onUpdateNode(node.id, { [field]: value })
  }

  const handleDeleteNode = () => {
    if (onDeleteNode) {
      onDeleteNode(node.id)
    }
    onClose()
  }

  // Prevent event propagation to avoid triggering node deletion
  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation()
  }

  const renderNodeProperties = () => {
    switch (node.type) {
      case "inputNode":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={node.data.value || 0}
                onChange={(e) => handleInputChange("value", Number(e.target.value))}
                onKeyDown={handleInputKeyDown}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <Label className="text-sm font-medium">Current Value:</Label>
              <div className="text-lg font-mono">{node.data.value}</div>
              <Label className="text-sm font-medium mt-2">Output:</Label>
              <div className="text-lg font-mono">{node.data.output ?? "Not executed"}</div>
            </div>
          </div>
        )

      case "mathNode":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="operation">Operation</Label>
              <Select value={node.data.operation} onValueChange={(value) => handleInputChange("operation", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add (+)</SelectItem>
                  <SelectItem value="subtract">Subtract (-)</SelectItem>
                  <SelectItem value="multiply">Multiply (×)</SelectItem>
                  <SelectItem value="divide">Divide (÷)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <Label className="text-sm font-medium">Inputs:</Label>
              <div className="text-sm font-mono space-y-1">
                <div>Input A: {node.data.inputA ?? "Not connected"}</div>
                <div>Input B: {node.data.inputB ?? "Not connected"}</div>
              </div>
              <Label className="text-sm font-medium mt-2">Operation:</Label>
              <div className="text-sm font-mono">
                {node.data.inputA ?? "?"} {node.data.operation} {node.data.inputB ?? "?"}
              </div>
              <Label className="text-sm font-medium mt-2">Output:</Label>
              <div className="text-lg font-mono">{node.data.output ?? "Not executed"}</div>
            </div>
          </div>
        )

      case "textNode":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="operation">Text Operation</Label>
              <Select value={node.data.operation} onValueChange={(value) => handleInputChange("operation", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uppercase">Uppercase</SelectItem>
                  <SelectItem value="lowercase">Lowercase</SelectItem>
                  <SelectItem value="reverse">Reverse</SelectItem>
                  <SelectItem value="length">Get Length</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <Label className="text-sm font-medium">Input:</Label>
              <div className="text-sm font-mono">{node.data.input ?? "Not connected"}</div>
              <Label className="text-sm font-medium mt-2">Operation:</Label>
              <div className="text-sm font-mono capitalize">{node.data.operation}</div>
              <Label className="text-sm font-medium mt-2">Output:</Label>
              <div className="text-lg font-mono">{node.data.output ?? "Not executed"}</div>
            </div>
          </div>
        )

      case "conditionNode":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={node.data.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greater">Greater than</SelectItem>
                  <SelectItem value="less">Less than</SelectItem>
                  <SelectItem value="equal">Equal to</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <Label className="text-sm font-medium">Inputs:</Label>
              <div className="text-sm font-mono space-y-1">
                <div>Input A: {node.data.inputA ?? "Not connected"}</div>
                <div>Input B: {node.data.inputB ?? "Not connected"}</div>
              </div>
              <Label className="text-sm font-medium mt-2">Condition:</Label>
              <div className="text-sm font-mono">
                {node.data.inputA ?? "?"} {node.data.condition} {node.data.inputB ?? "?"}
              </div>
              <Label className="text-sm font-medium mt-2">Result:</Label>
              <div className="text-lg font-mono">{String(node.data.output ?? "Not executed")}</div>
            </div>
          </div>
        )

      case "outputNode":
        return (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 rounded">
              <Label className="text-sm font-medium">Input:</Label>
              <div className="text-sm font-mono">
                {node.data.input !== null && node.data.input !== undefined ? String(node.data.input) : "Not connected"}
              </div>
              <Label className="text-sm font-medium mt-2">Final Output:</Label>
              <div className="text-xl font-mono font-bold">
                {node.data.output !== null && node.data.output !== undefined
                  ? String(node.data.output)
                  : "Not executed"}
              </div>
            </div>
          </div>
        )

      default:
        return <div>No properties available</div>
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Properties</h3>
        <div className="flex items-center space-x-2">
          {onDeleteNode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteNode}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <Label className="text-sm font-medium">Node Type</Label>
          <div className="text-sm text-gray-600">{node.data.label}</div>
        </div>

        {renderNodeProperties()}
      </Card>
    </div>
  )
}
