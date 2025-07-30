import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react"

export function OutputNode({ data }: NodeProps) {
  const getStatusIcon = () => {
    if (data.status === "success") return <CheckCircle className="w-3 h-3 text-green-500" />
    if (data.status === "error") return <XCircle className="w-3 h-3 text-red-500" />
    return null
  }

  return (
    <Card className={`min-w-[150px] bg-red-50 border-red-300 ${data.selected ? "ring-2 ring-red-400 shadow-lg" : ""}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500" />
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium">{data.label}</span>
          </div>
          {getStatusIcon()}
        </div>

        <div className="text-center space-y-1">
          <div className="text-lg font-mono font-bold text-red-700">
            {data.output !== null && data.output !== undefined ? String(data.output) : "No input"}
          </div>
          {data.executionTime && (
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{data.executionTime}ms</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
