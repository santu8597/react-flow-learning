import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle } from "lucide-react"

export function SquareRootNode({ data }: NodeProps) {
  const getStatusIcon = () => {
    if (data.status === "success") return <CheckCircle className="w-3 h-3 text-green-500" aria-label="Success" />
    if (data.status === "error") return <XCircle className="w-3 h-3 text-red-500" aria-label="Error" />
    return null
  }

  return (
    <Card
      className={`min-w-[180px] bg-blue-50 border-blue-300 ${data.selected ? "ring-2 ring-blue-400 shadow-lg" : ""}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: "50%", position: "absolute" }}
        className="w-3 h-3 bg-blue-500"
      />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            
            <span className="text-sm font-medium">{data.label ?? "Square Root"}</span>
          </div>
          {getStatusIcon()}
        </div>

        <div className="text-center space-y-1">
          <div className="text-xs text-gray-600">
            Input: {data.input ?? "?"}
          </div>
          <div className="text-lg font-mono font-bold text-blue-700">
            √{data.input ?? "?"} = {data.output ?? "?"}
          </div>
          {data.executionTime && (
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{data.executionTime}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-blue-500"
      />
    </Card>
  )
}
