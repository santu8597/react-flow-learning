import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Type, Clock, CheckCircle, XCircle } from "lucide-react"

export function TextNode({ data }: NodeProps) {
  const getStatusIcon = () => {
    if (data.status === "success") return <CheckCircle className="w-3 h-3 text-green-500" />
    if (data.status === "error") return <XCircle className="w-3 h-3 text-red-500" />
    return null
  }

  return (
    <Card
      className={`min-w-[150px] bg-purple-50 border-purple-300 ${
        data.selected ? "ring-2 ring-purple-400 shadow-lg" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">{data.label}</span>
          </div>
          {getStatusIcon()}
        </div>

        <div className="text-center space-y-1">
          <div className="text-xs text-gray-600 capitalize">{data.operation}</div>
          <div className="text-sm font-mono font-bold text-purple-700 break-all">{data.output ?? "No output"}</div>
          {data.executionTime && (
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{data.executionTime}ms</span>
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
    </Card>
  )
}
