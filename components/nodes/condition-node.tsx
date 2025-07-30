import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { GitBranch, Clock, CheckCircle, XCircle } from "lucide-react"

export function ConditionNode({ data }: NodeProps) {
  const getConditionSymbol = (condition: string) => {
    switch (condition) {
      case "greater":
        return ">"
      case "less":
        return "<"
      case "equal":
        return "="
      default:
        return "?"
    }
  }

  const getStatusIcon = () => {
    if (data.status === "success") return <CheckCircle className="w-3 h-3 text-green-500" />
    if (data.status === "error") return <XCircle className="w-3 h-3 text-red-500" />
    return null
  }

  return (
    <Card
      className={`min-w-[180px] bg-yellow-50 border-yellow-300 ${
        data.selected ? "ring-2 ring-yellow-400 shadow-lg" : ""
      }`}
    >
      {/* Input A Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="inputA"
        style={{ top: "30%" }}
        className="w-3 h-3 bg-yellow-500"
      />

      {/* Input B Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="inputB"
        style={{ top: "70%" }}
        className="w-3 h-3 bg-yellow-500"
      />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium">{data.label}</span>
          </div>
          {getStatusIcon()}
        </div>

        <div className="text-center space-y-1">
          <div className="text-xs text-gray-600 space-y-1">
            <div>A: {data.inputA ?? "?"}</div>
            <div>B: {data.inputB ?? "?"}</div>
            <div className="font-medium">
              {data.inputA ?? "?"} {getConditionSymbol(data.condition)} {data.inputB ?? "?"}
            </div>
          </div>
          <div
            className={`text-lg font-mono font-bold ${
              data.output === true ? "text-green-700" : data.output === false ? "text-red-700" : "text-gray-500"
            }`}
          >
            {data.output === null ? "?" : String(data.output)}
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
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-yellow-500" />
    </Card>
  )
}
