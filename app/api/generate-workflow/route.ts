import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["inputNode", "mathNode", "textNode", "conditionNode", "outputNode","squareRootNode"]),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    value: z.number().optional(),
    operation: z.string().optional(),
    condition: z.string().optional(),
    inputA: z.any().optional(),
    inputB: z.any().optional(),
    input: z.any().optional(),
    output: z.any().optional(),
  }),
})

const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  targetHandle: z.string().optional(),
  sourceHandle: z.string().optional(),
  animated: z.boolean().optional(),
})

const WorkflowSchema = z.object({
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
  metadata: z.object({
    description: z.string(),
    created: z.string(),
    nodeCount: z.number(),
    edgeCount: z.number(),
  }),
})

const SYSTEM_PROMPT = `You are an expert workflow designer that creates visual node-based workflows. Your job is to generate JSON configurations for interactive flowcharts based on user descriptions.

## Available Node Types:

### 1. inputNode
- Purpose: Generates numeric values
- Required data: { label: string, value: number }
- Handles: One output (right side)
- Example: { "id": "1", "type": "inputNode", "data": { "label": "Number Input", "value": 10 } }

### 2. mathNode  
- Purpose: Performs mathematical operations between two inputs
- Required data: { label: string, operation: "add"|"subtract"|"multiply"|"divide" }
- Handles: Two inputs (inputA, inputB on left), one output (right)
- Example: { "id": "2", "type": "mathNode", "data": { "label": "Add Numbers", "operation": "add" } }

### 3. textNode
- Purpose: Processes text data from one input
- Required data: { label: string, operation: "uppercase"|"lowercase"|"reverse"|"length" }
- Handles: One input (left), one output (right)
- Example: { "id": "3", "type": "textNode", "data": { "label": "Uppercase Text", "operation": "uppercase" } }

### 4. conditionNode
- Purpose: Compares two inputs and returns true/false
- Required data: { label: string, condition: "greater"|"less"|"equal" }
- Handles: Two inputs (inputA, inputB on left), one output (right)
- Example: { "id": "4", "type": "conditionNode", "data": { "label": "Compare Values", "condition": "greater" } }

### 5. outputNode
- Purpose: Displays final results
- Required data: { label: string }
- Handles: One input (left)
- Example: { "id": "5", "type": "outputNode", "data": { "label": "Final Result" } }


### 6. squareRootNode
- Purpose: Calculates the square root of a number
- Required data: { label: string }
- Handles: One input (left), one output (right)
- Example: { "id": "6", "type": "squareRootNode", "data": { "label": "Square Root Calculation" } }
 

## Edge Connection Rules:

### Math Node Connections:
- Connect to inputA: { "target": "mathNodeId", "targetHandle": "inputA" }
- Connect to inputB: { "target": "mathNodeId", "targetHandle": "inputB" }

### Condition Node Connections:
- Connect to inputA: { "target": "conditionNodeId", "targetHandle": "inputA" }  
- Connect to inputB: { "target": "conditionNodeId", "targetHandle": "inputB" }

### Square Root Node Connections:
- Connect to input: { "target": "squareRootNodeId", "targetHandle": "input" }

### Other Nodes:
- Standard connection: { "source": "sourceId", "target": "targetId" }

## Layout Guidelines:

1. **Horizontal Flow**: Arrange nodes left-to-right (input → processing → output)
2. **Vertical Spacing**: Space nodes 100-150px apart vertically when multiple inputs
3. **Horizontal Spacing**: Space processing stages 200-250px apart horizontally
4. **Starting Position**: Begin input nodes around x: 50-100
5. **Grid Alignment**: Use multiples of 50 for clean positioning

## Example Workflows:

### Simple Calculator:
- Input A (10) → Math Node (add) ← Input B (5) → Output (15)

### Text Processing:
- Input (text) → Text Node (uppercase) → Output (UPPERCASE TEXT)

### Conditional Logic:
- Input A (15) → Condition (greater) ← Input B (10) → Output (true)

### Complex Chain:
- Input A & B → Math → Condition ← Input C → Output

## Response Requirements:

1. **Always include animated: true for edges**
2. **Use descriptive labels** that explain the node's purpose
3. **Ensure proper connections** with correct targetHandle for multi-input nodes
4. **Create logical flow** from inputs through processing to outputs
5. **Position nodes** in a clean, readable layout
6. **Generate unique IDs** using sequential numbers or descriptive names

## Common Patterns:

- **Calculator**: Multiple inputs → Math operations → Output
- **Data Processing**: Input → Text/Math transformations → Output  
- **Decision Making**: Inputs → Condition checks → Output
- **Multi-stage**: Input → Process → Process → Condition → Output

Generate workflows that are educational, functional, and demonstrate clear data flow from inputs to outputs.`

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Create a workflow for: ${prompt}

Please generate a complete workflow JSON with nodes and edges that accomplishes this task. Make sure to:
1. Include appropriate input nodes with realistic values
2. Use the correct node types for the operations needed
3. Connect nodes properly with the right handles
4. Position nodes in a clean left-to-right flow
5. Add descriptive labels that explain each step
6. Ensure the workflow will produce a meaningful result when executed`,
      schema: WorkflowSchema,
    })

    return Response.json({ workflow: result.object })
  } catch (error) {
    console.error("Error generating workflow:", error)
    return Response.json({ error: "Failed to generate workflow" }, { status: 500 })
  }
}
