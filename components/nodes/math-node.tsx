import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Calculator, Clock, CheckCircle, XCircle } from "lucide-react"

export function MathNode({ data }: NodeProps) {
  const getOperationSymbol = (operation: string) => {
    switch (operation) {
      case "add":
        return "+"
      case "subtract":
        return "-"
      case "multiply":
        return "×"
      case "divide":
        return "÷"
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
      className={`min-w-[180px] bg-green-50 border-green-300 ${data.selected ? "ring-2 ring-green-400 shadow-lg" : ""}`}
    >
      {/* Input A Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="inputA"
        style={{ top: "30%" }}
        className="w-3 h-3 bg-green-500"
      />

      {/* Input B Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="inputB"
        style={{ top: "70%" }}
        className="w-3 h-3 bg-green-500"
      />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">{data.label}</span>
          </div>
          {getStatusIcon()}
        </div>

        <div className="text-center space-y-1">
          <div className="text-xs text-gray-600 space-y-1">
            <div>A: {data.inputA ?? "?"}</div>
            <div>B: {data.inputB ?? "?"}</div>
            <div className="font-medium">
              {data.inputA ?? "?"} {getOperationSymbol(data.operation)} {data.inputB ?? "?"}
            </div>
          </div>
          <div className="text-lg font-mono font-bold text-green-700">{data.output ?? "?"}</div>
          {data.executionTime && (
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{data.executionTime}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
    </Card>
  )
}
